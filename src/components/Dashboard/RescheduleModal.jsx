import React, { useState, useEffect } from "react";
import { Calendar, Clock, User, AlertCircle, CheckCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { apiCaller } from "../../utils/axiosInstance";
import appointmentHelper from "../../helpers/appointmentHelper";
import doctorStatsHelper from "../../helpers/doctorStatsHelper";
import { toast } from "sonner";

const RescheduleModal = ({ 
  isOpen, 
  onClose, 
  appointment, 
  onRescheduleSuccess,
  /** When opened from a doctor's page, pass the doctor ID from URL/context so reschedule can find slots */
  doctorId: doctorIdProp
}) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [consultationType, setConsultationType] = useState("offline");
  const [error, setError] = useState("");
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = current week, 1 = next week, etc.
  const [selectionMode, setSelectionMode] = useState("slots"); // "slots" or "timeRange"
  const [customStartTime, setCustomStartTime] = useState("");
  const [customEndTime, setCustomEndTime] = useState("");
  const [smsConsentAgreed, setSmsConsentAgreed] = useState(false);
  const [sendSMSNotification, setSendSMSNotification] = useState(false);
  const [sendEmailNotification, setSendEmailNotification] = useState(false);
  const [smsConsentLoading, setSmsConsentLoading] = useState(false);
  const [overrideConflicts, setOverrideConflicts] = useState(false);
  const [isBackdated, setIsBackdated] = useState(false);
  const [overrideConfirm, setOverrideConfirm] = useState({ open: false, type: null });
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [editMode, setEditMode] = useState("reschedule"); // "reschedule" or "edit-only"
  const [visitTypeOptions, setVisitTypeOptions] = useState([]);
  const [visitTypesLoading, setVisitTypesLoading] = useState(false);
  const [selectedVisitType, setSelectedVisitType] = useState("");

  const toMinutes = (time) => {
    if (!time || !/^\d{2}:\d{2}$/.test(time)) return null;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const toHHMM = (minutesTotal) => {
    const mins = ((minutesTotal % (24 * 60)) + 24 * 60) % (24 * 60);
    const h = String(Math.floor(mins / 60)).padStart(2, "0");
    const m = String(mins % 60).padStart(2, "0");
    return `${h}:${m}`;
  };

  const getDefaultDurationMinutes = () => {
    const start = toMinutes(appointment?.startTime || appointment?.time);
    const end = toMinutes(appointment?.endTime);
    if (start != null && end != null && end > start) return end - start;
    return 15;
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && appointment) {
      setSelectedDate("");
      setSelectedSlot(null);
      setAvailableSlots([]);
      setError("");
      setConsultationType(appointment.mode || "offline");
      setCurrentWeek(0); // Reset to current week
      setSelectionMode("slots"); // Reset to slots mode
      setCustomStartTime("");
      setCustomEndTime("");
      setSendSMSNotification(false);
      setSendEmailNotification(false);
      setOverrideConflicts(false);
      setIsBackdated(false);
      setOverrideConfirm({ open: false, type: null });
      setEditMode("reschedule");
      setSelectedDoctorId(getDoctorId() || "");
      setSelectedVisitType(
        appointment?.metadata?.visitType ||
        appointment?.visitType ||
        appointment?.visitReason ||
        ""
      );
      
      // Fetch SMS consent status
      fetchSmsConsentStatus();
      fetchDoctorsList();
      fetchVisitTypeOptions();
      
      // Debug logging
      console.log("RescheduleModal opened with appointment:", appointment);
      console.log("Appointment patient:", appointment?.patient);
      console.log("Patient ID:", appointment?.patient?._id || appointment?.patient?.id);
      console.log("Doctor ID:", getDoctorId());
    }
  }, [isOpen, appointment]);

  // Fetch SMS consent status for the patient
  const fetchSmsConsentStatus = async () => {
    // Check for both possible patient ID field names
    const patientId = appointment?.patient?._id || appointment?.patient?.id;
    if (!patientId) {
      console.log("No patient ID found in appointment:", appointment);
      return;
    }
    
    try {
      setSmsConsentLoading(true);
      console.log("Fetching SMS consent for patient ID:", patientId);
      const response = await apiCaller("GET", `/api/sms-consent/${patientId}`);
      
      if (response.data && response.data.success) {
        setSmsConsentAgreed(response.data.smsConsentAgreed);
        console.log("SMS consent status:", response.data.smsConsentAgreed);
      } else {
        setSmsConsentAgreed(false);
        console.log("SMS consent API returned unsuccessful response:", response.data);
      }
    } catch (error) {
      console.error("Error fetching SMS consent status:", error);
      setSmsConsentAgreed(false);
    } finally {
      setSmsConsentLoading(false);
    }
  };

  // Fetch available slots when date changes
  const fetchAvailableSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;
    
    try {
      setSlotsLoading(true);
      setError("");
      
      const response = await apiCaller(
        "GET",
        `docs/schedule/available-slots/${doctorId}?date=${date}`
      );
      
      if (response.data.success) {
        setAvailableSlots(response.data.data);
      } else {
        setError("Nie udało się pobrać dostępnych terminów");
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setError("Wystąpił błąd podczas pobierania dostępnych terminów");
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const fetchDoctorsList = async () => {
    try {
      setDoctorsLoading(true);
      const res = await doctorStatsHelper.getDoctorsList();
      if (res?.success) {
        setDoctors(Array.isArray(res.data) ? res.data : []);
      } else {
        setDoctors([]);
      }
    } catch (e) {
      console.error("Error fetching doctors list in reschedule modal:", e);
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  };

  const fetchVisitTypeOptions = async () => {
    try {
      setVisitTypesLoading(true);
      const res = await appointmentHelper.getVisitReasons();
      const categories = res?.data?.categories ?? res?.categories ?? [];
      const opts = [];
      categories.forEach((cat) => {
        (cat?.types ?? []).forEach((t) => {
          const label = t?.displayName;
          if (label && !opts.includes(label)) opts.push(label);
        });
      });
      setVisitTypeOptions(opts);
    } catch (e) {
      console.error("Error fetching visit type options:", e);
      setVisitTypeOptions([]);
    } finally {
      setVisitTypesLoading(false);
    }
  };

  // Get doctor ID: prefer prop (e.g. from doctor's page URL), then from appointment data
  const getDoctorId = () => {
    if (doctorIdProp) return doctorIdProp;
    if (!appointment) return null;

    const fromAppointment =
      appointment?.doctor_id ||
      appointment?.doctor?.id ||
      appointment?.doctorId ||
      appointment?.doctor;

    if (typeof fromAppointment === "string" && fromAppointment.length > 10) {
      return fromAppointment;
    }
    if (typeof fromAppointment === "string" && fromAppointment.length <= 10) {
      return null;
    }
    return fromAppointment ?? null;
  };

  const currentDoctorId = getDoctorId();
  const currentDoctorName =
    appointment?.doctor?.name ||
    appointment?.doctorName ||
    "Nieznany lekarz";
  const currentPatientName = (() => {
    const p = appointment?.patient;
    if (!p && appointment?.registrationData?.name) return appointment.registrationData.name;
    if (!p) return "N/A";
    if (typeof p?.name === "string" && p.name.trim()) return p.name.trim();
    if (typeof p?.name === "object") {
      const full = [p.name?.first, p.name?.last].filter(Boolean).join(" ").trim();
      if (full) return full;
    }
    const flat = [p?.firstName, p?.lastName].filter(Boolean).join(" ").trim();
    if (flat) return flat;
    if (appointment?.registrationData?.name) return appointment.registrationData.name;
    return "N/A";
  })();

  // Handle date selection
  const handleDateChange = (eOrValue) => {
    const newDate = typeof eOrValue === "string" ? eOrValue : eOrValue?.target?.value;
    setSelectedDate(newDate);
    setSelectedSlot(null);
    
    const doctorId = selectedDoctorId || getDoctorId();
    if (newDate && doctorId) {
      fetchAvailableSlots(doctorId, newDate);
    } else {
      setAvailableSlots([]);
      if (newDate && !doctorId) {
        setError("Nie można znaleźć ID lekarza dla tej wizyty");
      }
    }
  };

  const handleCalendarJump = (e) => {
    const newDate = e.target.value;
    if (!newDate) return;
    const today = new Date();
    const target = new Date(newDate);
    const diffDays = Math.floor((target - today) / (1000 * 60 * 60 * 24));
    const weekOffset = Math.max(0, Math.floor(diffDays / 7));
    setCurrentWeek(weekOffset);
    handleDateChange(newDate);
  };

  const hasValidEmail = (() => {
    const raw = appointment?.patient?.email ?? appointment?.registrationData?.email ?? "";
    const email = String(raw || "").trim();
    return email.length > 3 && email.includes("@");
  })();

  // Handle slot selection
  const handleSlotSelect = (slot) => {
    if (slot.available) {
      setSelectedSlot(slot);
    }
  };

  // Handle custom time range changes
  const handleCustomTimeChange = (type, value) => {
    if (type === "start") {
      setCustomStartTime(value);
      // Auto-fill end time when receptionist enters only start time
      if (value && !customEndTime) {
        const startMins = toMinutes(value);
        if (startMins != null) {
          setCustomEndTime(toHHMM(startMins + getDefaultDurationMinutes()));
        }
      }
    } else {
      setCustomEndTime(value);
    }
  };

  // Validate time range
  const validateTimeRange = () => {
    if (!customStartTime) {
      return "Proszę wybrać godzinę rozpoczęcia";
    }

    const effectiveEndTime =
      customEndTime ||
      (() => {
        const startMins = toMinutes(customStartTime);
        return startMins == null ? "" : toHHMM(startMins + getDefaultDurationMinutes());
      })();

    if (!effectiveEndTime) {
      return "Nie udało się wyliczyć godziny zakończenia";
    }

    const startTime = new Date(`2000-01-01T${customStartTime}`);
    const endTime = new Date(`2000-01-01T${effectiveEndTime}`);

    if (startTime >= endTime) {
      return "Godzina rozpoczęcia musi być wcześniejsza niż godzina zakończenia";
    }
    
    // Check if duration is reasonable (maximum 4 hours)
    const duration = (endTime - startTime) / (1000 * 60); // duration in minutes
    if (duration > 240) {
      return "Maksymalny czas wizyty to 4 godziny";
    }
    
    return null;
  };

  const buildRescheduleData = (overrides = {}) => {
    const nextOverrideConflicts = overrides.overrideConflicts ?? overrideConflicts;
    const nextIsBackdated = overrides.isBackdated ?? isBackdated;

    // For edit-only mode, only send doctor / visit type / consultation type changes.
    // Date and time stay as-is on backend.
    if (editMode === "edit-only") {
      return {
        editOnly: true,
        consultationType,
        ...(selectedVisitType ? { visitType: selectedVisitType } : {}),
        newDoctorId: selectedDoctorId || getDoctorId(),
        sendSMSNotification,
        sendEmailNotification,
      };
    }

    if (selectionMode === "slots") {
      return {
        newDate: selectedDate,
        newStartTime: selectedSlot.startTime,
        newEndTime: selectedSlot.endTime,
        consultationType,
        selectionType: "slot",
        sendSMSNotification,
        sendEmailNotification,
        newDoctorId: selectedDoctorId || getDoctorId(),
        ...(selectedVisitType ? { visitType: selectedVisitType } : {}),
        overrideConflicts: nextOverrideConflicts,
        isBackdated: nextIsBackdated,
      };
    }

    return {
      newDate: selectedDate,
      newStartTime: customStartTime,
      newEndTime:
        customEndTime ||
        (() => {
          const startMins = toMinutes(customStartTime);
          return startMins == null ? customEndTime : toHHMM(startMins + getDefaultDurationMinutes());
        })(),
      consultationType,
      selectionType: "timeRange",
      sendSMSNotification,
      sendEmailNotification,
      newDoctorId: selectedDoctorId || getDoctorId(),
      ...(selectedVisitType ? { visitType: selectedVisitType } : {}),
      overrideConflicts: nextOverrideConflicts,
      isBackdated: nextIsBackdated,
    };
  };

  const submitReschedule = async (overrides = {}) => {
    const appointmentId = appointment._id || appointment.id;
    const rescheduleData = buildRescheduleData(overrides);
    return appointmentHelper.rescheduleAppointment(appointmentId, rescheduleData);
  };

  // Handle reschedule submission
  const handleReschedule = async () => {
    // Skip date/time validation for edit-only mode
    if (editMode === "reschedule") {
      if (!selectedDate) {
        setError("Proszę wybrać datę");
        return;
      }

      // Validate based on selection mode
      if (selectionMode === "slots") {
      if (!selectedSlot) {
        setError("Proszę wybrać godzinę z dostępnych terminów");
        return;
      }
    } else if (selectionMode === "timeRange") {
        const timeRangeError = validateTimeRange();
        if (timeRangeError) {
          setError(timeRangeError);
          return;
        }
      }
    }

    const doctorId = selectedDoctorId || getDoctorId();
    if (!doctorId) {
      setError("Nie można znaleźć ID lekarza dla tej wizyty");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await submitReschedule();

      if (response.success) {
        toast.success("Wizyta została pomyślnie przełożona!");
        
        // Call success callback with new appointment data
        if (onRescheduleSuccess) {
          onRescheduleSuccess(response.data);
        }
        
        onClose();
      } else {
        setError(response.message || "Nie udało się przełożyć wizyty");
      }
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      const statusCode = error?.response?.status;
      const errorMessage = error?.response?.data?.message || "Wystąpił błąd podczas przełożenia wizyty";

      if (statusCode === 409 && !overrideConflicts) {
        setOverrideConfirm({ open: true, type: "overrideConflicts" });
      } else if (
        statusCode === 400 &&
        !isBackdated &&
        /isBackdated to true|przeszł|past date\/time/i.test(errorMessage)
      ) {
        setOverrideConfirm({ open: true, type: "isBackdated" });
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate days for the selected week
  const getDaysForWeek = (weekOffset = 0) => {
    const days = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (weekOffset * 7));
    
    for (let i = 0; i <= 6; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date.toISOString().split("T")[0]);
    }
    return days;
  };

  // Get current week's days
  const getCurrentWeekDays = () => {
    return getDaysForWeek(currentWeek);
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    if (currentWeek > 0) {
      setCurrentWeek(currentWeek - 1);
      setSelectedDate(""); // Reset selected date when changing weeks
      setSelectedSlot(null);
      setAvailableSlots([]);
    }
  };

  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentWeek(currentWeek + 1);
    setSelectedDate(""); // Reset selected date when changing weeks
    setSelectedSlot(null);
    setAvailableSlots([]);
  };

  // Get week display text
  const getWeekDisplayText = () => {
    if (currentWeek === 0) {
      return "Ten tydzień";
    } else if (currentWeek === 1) {
      return "Następny tydzień";
    } else {
      return `${currentWeek + 1}. tydzień`;
    }
  };

  // Format time for display
  const formatTime = (time) => {
    return time;
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Calendar className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {editMode === "edit-only" ? "Edytuj wizytę" : "Przełóż lub edytuj wizytę"}
              </h3>
              <p className="text-sm text-gray-500">
                {editMode === "edit-only" ? "Zmień szczegóły wizyty" : "Wybierz nową datę i godzinę wizyty lub zmień szczegóły"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-center mb-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setEditMode("reschedule")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  editMode === "reschedule"
                    ? "bg-teal-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Przełóż wizytę
              </button>
              <button
                onClick={() => setEditMode("edit-only")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  editMode === "edit-only"
                    ? "bg-teal-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Tylko edytuj
              </button>
            </div>
          </div>
        </div>

        {/* Current Appointment Info */}
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Aktualna wizyta
          </h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900">
                {currentPatientName}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">
                {new Date(appointment.date).toLocaleDateString('pl-PL')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">
                {appointment.startTime || appointment.time || "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">
                Lekarz: {currentDoctorName}
              </span>
            </div>
          </div>
        </div>

        {/* Reschedule Form */}
        <div className="p-6">
          {/* Consultation Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typ konsultacji
            </label>
            <div className="flex gap-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="consultationType"
                  value="offline"
                  checked={consultationType === "offline"}
                  onChange={(e) => setConsultationType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">W gabinecie</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="consultationType"
                  value="online"
                  checked={consultationType === "online"}
                  onChange={(e) => setConsultationType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Online</span>
              </label>
            </div>
          </div>

          {/* Doctor Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lekarz prowadzący po przełożeniu
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => {
                const nextDoctorId = e.target.value;
                setSelectedDoctorId(nextDoctorId);
                setSelectedSlot(null);
                setAvailableSlots([]);
                if (selectedDate && nextDoctorId) {
                  fetchAvailableSlots(nextDoctorId, selectedDate);
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              {!selectedDoctorId && <option value="">Wybierz lekarza</option>}
              {currentDoctorId && !doctors.some((d) => (d._id || d.id) === currentDoctorId) && (
                <option value={currentDoctorId}>
                  {currentDoctorName} (obecny)
                </option>
              )}
              {doctorsLoading ? (
                <option value="">Ładowanie lekarzy...</option>
              ) : (
                doctors.map((d) => (
                  <option key={d._id || d.id} value={d._id || d.id}>
                    {d.name || d.fullName || "Lekarz"}
                  </option>
                ))
              )}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Możesz przełożyć wizytę do innego lekarza. Dostępne terminy są liczone dla wybranego lekarza.
            </p>
          </div>

          {/* Visit Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typ wizyty
            </label>
            <select
              value={selectedVisitType}
              onChange={(e) => setSelectedVisitType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">
                {visitTypesLoading ? "Ładowanie typów wizyt..." : "Wybierz typ wizyty (opcjonalnie)"}
              </option>
              {visitTypeOptions.map((vt) => (
                <option key={vt} value={vt}>
                  {vt}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Wybrany typ zostanie zapisany podczas przełożenia wizyty.
            </p>
          </div>

          {/* Notification Options */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-3">
              Powiadomienia o przełożeniu
            </h4>
            
            {/* SMS Consent Status */}
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Status zgody na SMS:</span>
                {smsConsentLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                ) : (
                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                    smsConsentAgreed 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {smsConsentAgreed ? 'Zgoda udzielona' : 'Brak zgody'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {smsConsentAgreed 
                  ? 'Pacjent wyraził zgodę na otrzymywanie powiadomień SMS'
                  : 'Pacjent nie wyraził zgody na powiadomienia SMS'
                }
              </p>
            </div>

            {/* SMS YES/NO */}
            <div className="mt-3 pt-3 border-t border-blue-300">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Wyślij powiadomienie SMS o przełożeniu wizyty
              </p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="sendSMSNotification"
                    checked={sendSMSNotification === true}
                    onChange={() => setSendSMSNotification(true)}
                    disabled={!smsConsentAgreed}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  Tak
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="sendSMSNotification"
                    checked={sendSMSNotification === false}
                    onChange={() => setSendSMSNotification(false)}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  Nie
                </label>
              </div>
            </div>

            {!smsConsentAgreed && (
              <p className="text-xs text-red-600 mt-2">
                ⚠️ Nie można wysłać SMS - pacjent nie wyraził zgody na powiadomienia
              </p>
            )}

            {/* Email YES/NO */}
            <div className="mt-3 pt-3 border-t border-blue-300">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Wyślij powiadomienie e-mail o przełożeniu wizyty
              </p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="sendEmailNotification"
                    checked={sendEmailNotification === true}
                    onChange={() => setSendEmailNotification(true)}
                    disabled={!hasValidEmail}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  Tak
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="sendEmailNotification"
                    checked={sendEmailNotification === false}
                    onChange={() => setSendEmailNotification(false)}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  Nie
                </label>
              </div>
              {!hasValidEmail && (
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ Brak poprawnego adresu e-mail - nie można wysłać powiadomienia e-mail
                </p>
              )}
            </div>
          </div>

          {/* Selection Mode + Override Options - Only relevant when changing date/time */}
          {editMode === "reschedule" && (
            <>
              {/* Selection Mode */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sposób wyboru czasu
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="selectionMode"
                      value="slots"
                      checked={selectionMode === "slots"}
                      onChange={(e) => {
                        setSelectionMode(e.target.value);
                        setSelectedSlot(null);
                        setCustomStartTime("");
                        setCustomEndTime("");
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">Z dostępnych terminów</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="selectionMode"
                      value="timeRange"
                      checked={selectionMode === "timeRange"}
                      onChange={(e) => {
                        setSelectionMode(e.target.value);
                        setSelectedSlot(null);
                        setCustomStartTime("");
                        setCustomEndTime("");
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">Własny zakres czasu</span>
                  </label>
                </div>
              </div>

              {/* Override Options */}
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="text-sm font-medium text-amber-800 mb-3">Opcje nadpisania ograniczeń</h4>
                <div className="space-y-3">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overrideConflicts}
                      onChange={(e) => setOverrideConflicts(e.target.checked)}
                      className="mt-0.5 h-4 w-4 text-amber-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      <span className="font-medium">Nadpisz konflikty terminów</span>
                      <span className="block text-xs text-gray-500">
                        Pozwala zapisać wizytę mimo konfliktu (ten sam lekarz, data i godzina).
                      </span>
                    </span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBackdated}
                      onChange={(e) => setIsBackdated(e.target.checked)}
                      className="mt-0.5 h-4 w-4 text-amber-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      <span className="font-medium">Zezwól na datę/godzinę w przeszłości</span>
                      <span className="block text-xs text-gray-500">
                        Użyj tylko gdy potrzebujesz ręcznie odtworzyć historyczną wizytę.
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Date Selection - Only show in reschedule mode */}
          {editMode === "reschedule" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Wybierz nową datę
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousWeek}
                  disabled={currentWeek === 0}
                  className={`p-2 rounded-lg border transition-colors ${
                    currentWeek === 0
                      ? "text-gray-300 border-gray-200 cursor-not-allowed"
                      : "text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-gray-700 px-3 py-1 bg-gray-100 rounded-lg">
                  {getWeekDisplayText()}
                </span>
                <button
                  onClick={goToNextWeek}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Szybki wybór daty (kalendarz)
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleCalendarJump}
                className="w-full sm:w-auto p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>
            <div className="grid grid-cols-7 gap-2">
              {getCurrentWeekDays().map((date) => (
                <button
                  key={date}
                  onClick={() => handleDateChange({ target: { value: date } })}
                  className={`p-3 text-sm rounded-lg border transition-colors ${
                    selectedDate === date
                      ? "bg-teal-500 text-white border-teal-500"
                      : "bg-white text-gray-700 border-gray-300 hover:border-teal-400"
                  }`}
                >
                  <div className="font-medium">
                    {new Date(date).getDate()}
                  </div>
                  <div className="text-xs opacity-75">
                    {new Date(date).toLocaleDateString('pl-PL', { weekday: 'short' })}
                  </div>
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Time Selection - Only show in reschedule mode */}
          {editMode === "reschedule" && selectedDate && (
            <div className="mb-6">
              {selectionMode === "slots" ? (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wybierz godzinę z dostępnych terminów
                  </label>
                  
                  {slotsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => handleSlotSelect(slot)}
                          disabled={!slot.available}
                          className={`p-3 text-sm rounded-lg border transition-colors ${
                            selectedSlot && selectedSlot.startTime === slot.startTime
                              ? "bg-teal-500 text-white border-teal-500"
                              : slot.available
                              ? "bg-white text-gray-700 border-gray-300 hover:border-teal-400"
                              : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          }`}
                        >
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <AlertCircle className="mx-auto text-gray-400 mb-2" size={24} />
                      <p className="text-gray-700">
                        Brak dostępnych terminów w wybranym dniu
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wybierz własny zakres czasu
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Godzina rozpoczęcia
                      </label>
                      <input
                        type="time"
                        value={customStartTime}
                        onChange={(e) => handleCustomTimeChange("start", e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Godzina zakończenia (opcjonalnie)
                      </label>
                      <input
                        type="time"
                        value={customEndTime}
                        onChange={(e) => handleCustomTimeChange("end", e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <p className="text-[11px] text-gray-500 mt-1">
                        Gdy puste, ustawimy automatycznie czas zakończenia wg długości obecnej wizyty.
                      </p>
                    </div>
                  </div>
                  {customStartTime && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Czas trwania:</strong> {(() => {
                          const start = new Date(`2000-01-01T${customStartTime}`);
                          const effectiveEndTime =
                            customEndTime ||
                            (() => {
                              const startMins = toMinutes(customStartTime);
                              return startMins == null ? "" : toHHMM(startMins + getDefaultDurationMinutes());
                            })();
                          if (!effectiveEndTime) return "—";
                          const end = new Date(`2000-01-01T${effectiveEndTime}`);
                          const duration = (end - start) / (1000 * 60);
                          const hours = Math.floor(duration / 60);
                          const minutes = duration % 60;
                          return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
                        })()}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Anuluj
            </button>
            <button
              onClick={handleReschedule}
              disabled={
                editMode === "reschedule" ? (
                  !selectedDate ||
                  (selectionMode === "slots" && !selectedSlot) ||
                  (selectionMode === "timeRange" && !customStartTime) ||
                  loading
                ) : loading
              }
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {editMode === "edit-only" ? "Zapisywanie..." : "Przełóż..."}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Przełóż wizytę
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {overrideConfirm.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">Potwierdzenie nadpisania</h4>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-700">
                {overrideConfirm.type === "overrideConflicts"
                  ? "Wykryto konflikt terminu. Czy chcesz ponowić przełożenie z włączonym nadpisaniem konfliktów?"
                  : "Wybrana data/godzina jest w przeszłości. Czy chcesz ponowić przełożenie z włączoną opcją daty historycznej?"}
              </p>
            </div>
            <div className="p-5 pt-0 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOverrideConfirm({ open: false, type: null })}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={async () => {
                  const type = overrideConfirm.type;
                  setOverrideConfirm({ open: false, type: null });
                  try {
                    setLoading(true);
                    setError("");
                    const response = await submitReschedule(
                      type === "overrideConflicts"
                        ? { overrideConflicts: true }
                        : { isBackdated: true }
                    );
                    if (response?.success) {
                      if (type === "overrideConflicts") setOverrideConflicts(true);
                      if (type === "isBackdated") setIsBackdated(true);
                      toast.success("Wizyta została pomyślnie przełożona!");
                      if (onRescheduleSuccess) onRescheduleSuccess(response.data);
                      onClose();
                    } else {
                      setError(response?.message || "Nie udało się przełożyć wizyty");
                    }
                  } catch (retryError) {
                    const msg = retryError?.response?.data?.message || "Nie udało się przełożyć wizyty";
                    setError(msg);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="px-4 py-2 text-sm text-white bg-amber-600 rounded-lg hover:bg-amber-700"
              >
                Potwierdź i ponów
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescheduleModal; 