import React, { useState, useEffect } from "react";
import { Calendar, Clock, User, AlertCircle, CheckCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { apiCaller } from "../../utils/axiosInstance";
import appointmentHelper from "../../helpers/appointmentHelper";
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
  const [sendSmsReminder, setSendSmsReminder] = useState(false);
  const [smsConsentLoading, setSmsConsentLoading] = useState(false);
  const [persistSmsConsent, setPersistSmsConsent] = useState(false);

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
      setSendSmsReminder(false);
      setPersistSmsConsent(false);
      
      // Fetch SMS consent status
      fetchSmsConsentStatus();
      
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
        setError("Could not load available slots");
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setError("An error occurred while loading available slots");
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
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

  // Handle date selection
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setSelectedSlot(null);
    
    const doctorId = getDoctorId();
    if (newDate && doctorId) {
      fetchAvailableSlots(doctorId, newDate);
    } else {
      setAvailableSlots([]);
      if (newDate && !doctorId) {
        setError("Could not find doctor ID for this appointment");
      }
    }
  };

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
    } else {
      setCustomEndTime(value);
    }
  };

  // Validate time range
  const validateTimeRange = () => {
    if (!customStartTime || !customEndTime) {
      return "Please select start and end time";
    }
    
    const startTime = new Date(`2000-01-01T${customStartTime}`);
    const endTime = new Date(`2000-01-01T${customEndTime}`);
    
    if (startTime >= endTime) {
      return "Start time must be before end time";
    }
    
    // Check if duration is reasonable (maximum 4 hours)
    const duration = (endTime - startTime) / (1000 * 60); // duration in minutes
    if (duration > 240) {
      return "Maximum visit duration is 4 hours";
    }
    
    return null;
  };

  // Handle reschedule submission
  const handleReschedule = async () => {
    if (!selectedDate) {
      setError("Please select a date");
      return;
    }

    // Validate based on selection mode
    if (selectionMode === "slots") {
      if (!selectedSlot) {
        setError("Please select a time from available slots");
        return;
      }
    } else if (selectionMode === "timeRange") {
      const timeRangeError = validateTimeRange();
      if (timeRangeError) {
        setError(timeRangeError);
        return;
      }
    }

    const doctorId = getDoctorId();
    if (!doctorId) {
      setError("Could not find doctor ID for this appointment");
      return;
    }

    try {
      setLoading(true);
      setError("");

      let rescheduleData;
      
      if (selectionMode === "slots") {
        rescheduleData = {
          newDate: selectedDate,
          newStartTime: selectedSlot.startTime,
          newEndTime: selectedSlot.endTime,
          consultationType: consultationType,
          selectionType: "slot",
          smsToBeSent: sendSmsReminder,
          persistSmsConsent: persistSmsConsent || false
        };
      } else {
        rescheduleData = {
          newDate: selectedDate,
          newStartTime: customStartTime,
          newEndTime: customEndTime,
          consultationType: consultationType,
          selectionType: "timeRange",
          smsToBeSent: sendSmsReminder,
          persistSmsConsent: persistSmsConsent || false
        };
      }

      // Use the correct appointment ID field
      const appointmentId = appointment._id || appointment.id;
      const response = await appointmentHelper.rescheduleAppointment(
        appointmentId,
        rescheduleData
      );

      if (response.success) {
        toast.success("Appointment rescheduled successfully!");
        
        // Call success callback with new appointment data
        if (onRescheduleSuccess) {
          onRescheduleSuccess(response.data);
        }
        
        onClose();
      } else {
        setError(response.message || "Could not reschedule appointment");
      }
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      const errorMessage = error.response?.data?.message || "An error occurred while rescheduling";
      setError(errorMessage);
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
      return "This week";
    } else if (currentWeek === 1) {
      return "Next week";
    } else {
      return `Week ${currentWeek + 1}`;
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
                Reschedule appointment
              </h3>
              <p className="text-sm text-gray-500">
                Choose a new date and time
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

        {/* Current Appointment Info */}
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Current appointment
          </h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900">
                {appointment.patient?.name || appointment.name || "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">
                {new Date(appointment.date).toLocaleDateString('en-US')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">
                {appointment.startTime || appointment.time || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Reschedule Form */}
        <div className="p-6">
          {/* Consultation Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consultation type
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
                <span className="text-sm">In office</span>
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

          {/* SMS Reminder Options */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-3">
              SMS notifications
            </h4>
            
            {/* SMS Consent Status */}
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">SMS consent status:</span>
                {smsConsentLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                ) : (
                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                    smsConsentAgreed 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {smsConsentAgreed ? 'Consent given' : 'No consent'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {smsConsentAgreed 
                  ? 'The patient agreed to receive SMS notifications'
                  : 'The patient did not agree to SMS notifications'
                }
              </p>
            </div>

            {/* Send SMS Reminder Option */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sendSmsReminder"
                checked={sendSmsReminder}
                onChange={(e) => setSendSmsReminder(e.target.checked)}
                disabled={!smsConsentAgreed}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label 
                htmlFor="sendSmsReminder" 
                className={`text-sm font-medium ${
                  !smsConsentAgreed ? 'text-gray-400' : 'text-blue-800'
                }`}
              >
                Send SMS notification about reschedule
              </label>
            </div>
            
            {!smsConsentAgreed && (
              <p className="text-xs text-red-600 mt-2">
                ⚠️ Cannot send SMS — patient did not consent to notifications
              </p>
            )}
            
            {sendSmsReminder && smsConsentAgreed && (
              <p className="text-xs text-green-600 mt-2">
                ✓ Patient will receive an SMS with the new appointment time
              </p>
            )}
            
            {/* Persist SMS Consent Checkbox - only show if smsConsentAgreed is true */}
            {smsConsentAgreed && (
              <div className="mt-4 pt-4 border-t border-blue-300">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="persistSmsConsent"
                    checked={persistSmsConsent}
                    onChange={(e) => setPersistSmsConsent(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="persistSmsConsent" className="text-sm font-medium text-blue-800">
                    Check this if you do not want SMS or emails sent for this visit
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Selection Mode */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time selection mode
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
                <span className="text-sm">From available slots</span>
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
                <span className="text-sm">Custom time range</span>
              </label>
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Choose new date
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
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div className="mb-6">
              {selectionMode === "slots" ? (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose a time from available slots
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
                        No available slots on this day
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom time range
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Start time
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
                        End time
                      </label>
                      <input
                        type="time"
                        value={customEndTime}
                        onChange={(e) => handleCustomTimeChange("end", e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                  {customStartTime && customEndTime && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Duration:</strong> {(() => {
                          const start = new Date(`2000-01-01T${customStartTime}`);
                          const end = new Date(`2000-01-01T${customEndTime}`);
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
              Cancel
            </button>
            <button
              onClick={handleReschedule}
              disabled={
                !selectedDate || 
                (selectionMode === "slots" && !selectedSlot) || 
                (selectionMode === "timeRange" && (!customStartTime || !customEndTime)) || 
                loading
              }
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Rescheduling...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Reschedule
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal; 