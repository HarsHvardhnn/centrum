import { useNavigate, useParams } from "react-router-dom";
import DoctorDashboard from "./DoctorDashboard";
import { useEffect, useState, useRef, useCallback } from "react";
import { useLoader } from "../../../context/LoaderContext";
import doctorService from "../../../helpers/doctorHelper";
import AppointmentFormModal from "../Appointments/AddAppointmentForm";
import CheckInModal from "../../admin/CheckinModal";
import RescheduleModal from "../../Dashboard/RescheduleModal";
import PermanentDeleteDialog from "../../admin/PermanentDeleteDialog";
import { toast } from "sonner";
import appointmentHelper from "../../../helpers/appointmentHelper";
import { formatDateToYYYYMMDD } from "../../../utils/formatDate";
import { useUser } from "../../../context/userContext";
import { readListState, writeListState, useListScrollRestore } from "../../../hooks/usePersistedListState";
import { doctorVisitsPath, isUsableRouteId } from "../../../utils/useNavigate";

function DoctorsPage() {
  const router = useParams();
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const doctorListKey = `doctor-day-${router.id || "unknown"}`;
  const savedDoctorDay = readListState(doctorListKey) || {};
  const [error, setError] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState({});
  const [patients, setPatients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    if (savedDoctorDay.selectedDate) {
      const parsed = new Date(savedDoctorDay.selectedDate);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [appointmentId, setAppointmentId] = useState(null);
  const [currentPage, setCurrentPage] = useState(
    Number(savedDoctorDay.currentPage) > 0 ? Number(savedDoctorDay.currentPage) : 1
  );
  const [totalPatients, setTotalPatients] = useState(0);
  const [searchQuery, setSearchQuery] = useState(savedDoctorDay.searchQuery || "");
  const [dailySummary, setDailySummary] = useState({ liczbaWizyt: 0, pozostaloWizyt: 0 });
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInAppointment, setCheckInAppointment] = useState(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const itemsPerPage = 10;
  const { user } = useUser();
  const loadGenerationRef = useRef(0);
  const doctorInfoRef = useRef(doctorInfo);
  doctorInfoRef.current = doctorInfo;
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== "doctor") return;
    const ownPath = doctorVisitsPath(user);
    const param = router.id;
    if (!isUsableRouteId(param) && ownPath.startsWith("/lekarze/wizyty/")) {
      navigate(ownPath, { replace: true });
    }
  }, [user, router.id, navigate]);

  useEffect(() => {
    writeListState(doctorListKey, {
      selectedDate: formatDateToYYYYMMDD(selectedDate),
      currentPage,
      searchQuery,
    });
  }, [doctorListKey, selectedDate, currentPage, searchQuery]);

  useListScrollRestore(doctorListKey, patients.length > 0 || !!doctorInfo?.id);

  /** Count appointments by status. Excludes cancelled. Liczba wizyt = Zarezerwowana + Zameldowana + Zakończona; Pozostało = Zarezerwowana + Zameldowana. Backend may return liczbaWizyt/pozostaloWizyt for full-day accuracy (when list is paginated). */
  const computeDailySummary = (list, fromBackend) => {
    if (fromBackend && fromBackend.liczbaWizyt != null && fromBackend.pozostaloWizyt != null) {
      return { liczbaWizyt: fromBackend.liczbaWizyt, pozostaloWizyt: fromBackend.pozostaloWizyt };
    }
    if (!Array.isArray(list)) return { liczbaWizyt: 0, pozostaloWizyt: 0 };
    let liczbaWizyt = 0;
    let pozostaloWizyt = 0;
    const cancelled = ["cancelled", "canceled"];
    for (const apt of list) {
      const s = String(apt.status || "").toLowerCase().replace(/\s+/g, "");
      if (cancelled.includes(s)) continue;
      const isBooked = s === "booked";
      const isCheckedIn = s === "checkedin";
      const isCompleted = s === "completed" || s === "finished";
      if (isBooked || isCheckedIn || isCompleted) liczbaWizyt += 1;
      if (isBooked || isCheckedIn) pozostaloWizyt += 1;
    }
    return { liczbaWizyt, pozostaloWizyt };
  };

  const applyAppointmentsResponse = (response) => {
    if (!response?.success) {
      console.error("Failed to load patients data");
      return;
    }
    const list = response.data || [];
    const filtered = nonCancelledAppointments(list);
    setPatients(filtered);
    const total =
      response.total != null && filtered.length === list.length
        ? response.total
        : filtered.length;
    setTotalPatients(total);
    setDailySummary(
      computeDailySummary(filtered, {
        liczbaWizyt: response.liczbaWizyt,
        pozostaloWizyt: response.pozostaloWizyt,
      })
    );
  };

  /** Exclude cancelled/canceled so list and counts do not include them. */
  const nonCancelledAppointments = (list) => {
    if (!Array.isArray(list)) return [];
    const cancelled = ["cancelled", "canceled"];
    return list.filter((apt) => {
      const s = String(apt.status || "").toLowerCase().replace(/\s+/g, "");
      return !cancelled.includes(s);
    });
  };

  const loadDoctorDay = useCallback(
    async ({ fullScreen = false } = {}) => {
      const doctorId = isUsableRouteId(router.id)
        ? router.id
        : user?.id || user?._id || user?.d_id;
      if (!doctorId) return;

      const generation = ++loadGenerationRef.current;
      if (fullScreen) showLoader();
      else setListLoading(true);

      const dateStr = formatDateToYYYYMMDD(selectedDate);
      try {
        const [doctorResponse, appointmentsResponse] = await Promise.all([
          doctorService.getDoctorById(doctorId, dateStr),
          appointmentHelper.getDoctorAppointments(
            doctorId,
            dateStr,
            dateStr,
            "all",
            currentPage,
            itemsPerPage,
            searchQuery,
            true
          ),
        ]);

        if (generation !== loadGenerationRef.current) return;

        if (doctorResponse.success && doctorResponse.doctor) {
          setDoctorInfo(
            transformToDoctorInfo(
              doctorResponse.doctor,
              doctorResponse.shiftsForDate,
              selectedDate
            )
          );
        } else {
          setError("błąd serwera");
        }

        applyAppointmentsResponse(appointmentsResponse);
      } catch (err) {
        if (generation !== loadGenerationRef.current) return;
        console.error("Error loading doctor day:", err);
        setError("Error loading doctor data");
      } finally {
        if (generation === loadGenerationRef.current) {
          if (fullScreen) hideLoader();
          setListLoading(false);
        }
      }
    },
    [
      router.id,
      user?.d_id,
      user?.id,
      user?._id,
      selectedDate,
      currentPage,
      searchQuery,
      showLoader,
      hideLoader,
    ]
  );

  useEffect(() => {
    const hasDoctor = Boolean(doctorInfoRef.current?.id);
    loadDoctorDay({ fullScreen: !hasDoctor });
  }, [loadDoctorDay]);

  const fetchPatientsByDoctor = async (doctorId) => {
    const id = doctorId || (isUsableRouteId(router.id) ? router.id : user?.id || user?._id || user?.d_id);
    if (!id) return;
    const generation = ++loadGenerationRef.current;
    setListLoading(true);
    try {
      const response = await appointmentHelper.getDoctorAppointments(
        id,
        formatDateToYYYYMMDD(selectedDate),
        formatDateToYYYYMMDD(selectedDate),
        "all",
        currentPage,
        itemsPerPage,
        searchQuery,
        true
      );
      if (generation !== loadGenerationRef.current) return;
      applyAppointmentsResponse(response);
    } catch (err) {
      if (generation !== loadGenerationRef.current) return;
      console.error("Error fetching patients data:", err);
      setError("Error loading patients data");
    } finally {
      if (generation === loadGenerationRef.current) setListLoading(false);
    }
  };

  useEffect(() => {
    if (appointmentId) {
      const selectedAppointment = patients.find((p) => p.id === appointmentId);
      if (selectedAppointment) {
        fetchPatientDetails(selectedAppointment.patient_id, appointmentId);
      }
    } else {
      setPatientDetails(null);
    }
  }, [appointmentId, patients]);

  // New function to fetch patient details
  const fetchPatientDetails = async (patientId, appointmentId) => {
    try {
      const response = await doctorService.getPatientDetailsAndReports(
        patientId,
        appointmentId
      );

      //("patient response", response);
      if (response) {
        setPatientDetails(response);
      } else {
        toast.error("Wystąpił błąd");
      }
    } catch (err) {
      console.error("Error fetching patient details:", err);
      toast.error("Wystąpił błąd");
    }
  };

  const DAY_NAMES_PL = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];

  const transformToDoctorInfo = (apiDoctor, shiftsForDate, forDate) => {
    let fullName = `${apiDoctor.name?.first || ""} ${
      apiDoctor.name?.last || ""
    }`.trim();
    fullName = fullName.replace(/^\s*(dr\.?|lek\.?|prof\.?|inż\.?)\s*/gi, "").trim() || fullName;
    const specialty = apiDoctor.specialization?.[0]?.name || "General Practitioner";

    // Prefer shift for the selected date (shiftsForDate.timeBlocks), else weekly shift for that day, else first weekly shift
    let timeSlot = "09:00 - 17:00";
    if (shiftsForDate?.timeBlocks?.length) {
      const blocks = shiftsForDate.timeBlocks.filter(
        (b) => b?.startTime && b?.endTime
      );

      if (blocks.length) {
        const starts = blocks.map((b) => b.startTime).sort();
        const ends = blocks.map((b) => b.endTime).sort();
        timeSlot = `${starts[0]} - ${ends[ends.length - 1]}`;
      }
    } else if (apiDoctor.weeklyShifts?.length && forDate) {
      const dayIndex = new Date(forDate).getDay();
      const dayName = DAY_NAMES_PL[dayIndex];
      const dayShift = apiDoctor.weeklyShifts.find(
        (s) => (s.dayOfWeek || "").toLowerCase() === (dayName || "").toLowerCase()
      );
      if (dayShift) {
        timeSlot = `${dayShift.startTime} - ${dayShift.endTime}`;
      } else {
        const firstShift = apiDoctor.weeklyShifts[0];
        timeSlot = `${firstShift.startTime} - ${firstShift.endTime}`;
      }
    } else if (apiDoctor.weeklyShifts?.length) {
      const firstShift = apiDoctor.weeklyShifts[0];
      timeSlot = `${firstShift.startTime} - ${firstShift.endTime}`;
    }

    return {
      id: apiDoctor.id,
      _id: apiDoctor._id,
      name: fullName,
      specialty: specialty,
      timeSlot: timeSlot,
      timeZone: "BST",
      description:
        apiDoctor.bio ||
        "Infectious Diseases Hub aims to provide up-to-date, essential research and on aspects of microbiology, virology, and parasitology.",
      avatarUrl: apiDoctor.profilePicture || "/images/default-doctor.png",
    };
  };

  const stats = {
    appointments: 165,
    newPatients: patients.length || 0,
    surgery: 4,
    criticalPatients: 54,
  };

  // Function to handle appointment form submission
  const handleAppointmentComplete = async (data) => {
    //("Appointment data submitted:", data);
    setAppointmentData(data);

    try {
      // Show loading indicator
      showLoader();
      // Call the appointment service to create the appointment
      const response = await appointmentHelper.createAppointment(data);

      if (response) {
        // Show success notification
        toast.success("Wizyta zarezerwowana pomyślnie!");

        // Update local state with the new appointment data
        setAppointmentData(response.data);

        // Close modal
        setShowAppointmentModal(false);
        
        // Navigate to the patients page where doctor can generate invoice
        navigate("/klinika");
      } else {
        // Handle error from API that returns success: false
        toast.error("Wystąpił błąd");

      }
    } catch (error) {
      // Handle exception from the API call
      console.error("Error creating appointment:", error);
      toast.error(
        error.response?.data?.message ||
          "Wystąpił błąd podczas rezerwacji wizyty"
      );
    } finally {
      // Hide loading indicator
      hideLoader();
    }
  };

  // Function to handle patient selection
  const handlePatientSelect = (patientId, appointmentId) => {
    setAppointmentId(appointmentId);
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCheckIn = (appointmentRow) => {
    setCheckInAppointment(appointmentRow);
    setShowCheckIn(true);
  };

  const handleReschedule = (appointmentRow) => {
    setRescheduleAppointment(appointmentRow);
    setShowReschedule(true);
  };

  const handleAppointmentUpdate = (appointmentId, newStatus) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === appointmentId ? { ...p, status: newStatus } : p))
    );
    setShowCheckIn(false);
    setCheckInAppointment(null);
  };

  const handleRescheduleSuccess = () => {
    setShowReschedule(false);
    setRescheduleAppointment(null);
    if (doctorInfo?.id) fetchPatientsByDoctor(doctorInfo.id);
  };

  const handlePermanentDeleteClick = (appointmentId) => {
    setDeleteDialog({ open: true, id: appointmentId });
  };

  const handlePermanentDeleteSuccess = () => {
    setDeleteDialog({ open: false, id: null });
    if (doctorInfo?.id) fetchPatientsByDoctor(doctorInfo.id);
  };

  const handleDateSelect = (date) => {
    setSelectedDate((prev) => {
      if (
        prev &&
        date &&
        formatDateToYYYYMMDD(prev) === formatDateToYYYYMMDD(date)
      ) {
        return prev;
      }
      return date;
    });
    setAppointmentId(null);
    setCurrentPage(1);
  };

  return (
    <>
      <DoctorDashboard
        doctor={doctorInfo}
        patients={patients}
        dailySummary={dailySummary}
        stats={stats}
        selectedPatient={appointmentId}
        patientDetails={patientDetails}
        onPatientSelect={handlePatientSelect}
        setAppointmentId={setAppointmentId}
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
        isLoading={listLoading}
        breadcrumbs={[
          { label: "Panel główny", onClick: () => navigate("/administracja") },
          { label: "Wizyty lekarskie", onClick: null },
        ]}
        onSearch={handleSearch}
        onFilter={() => {}}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        totalPatients={totalPatients}
        itemsPerPage={itemsPerPage}
        onCheckIn={handleCheckIn}
        onReschedule={handleReschedule}
        onPermanentDelete={user?.role === "admin" ? handlePermanentDeleteClick : undefined}
      />

      {/* Appointment Form Modal */}
      {showAppointmentModal && (
        <AppointmentFormModal
          onClose={() => setShowAppointmentModal(false)}
          onComplete={handleAppointmentComplete}
          doctorId={doctorInfo.id}
          doctorInfo={doctorInfo}
          isReceptionistMode={true}
          workflowOrder="appointmentFirst"
          allowPastDates={false}
          skipDoctorSelection={true}
        />
      )}

      <CheckInModal
        isOpen={showCheckIn}
        setIsOpen={setShowCheckIn}
        patientData={checkInAppointment || {}}
        appointmentId={checkInAppointment?.id}
        onAppointmentUpdate={handleAppointmentUpdate}
      />

      <RescheduleModal
        isOpen={showReschedule}
        onClose={() => { setShowReschedule(false); setRescheduleAppointment(null); }}
        appointment={rescheduleAppointment}
        onRescheduleSuccess={handleRescheduleSuccess}
        doctorId={doctorInfo?.id ?? router?.id}
      />

      <PermanentDeleteDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        type="appointment"
        id={deleteDialog.id}
        title="Trwale usuń wizytę?"
        message="Ta operacja jest nieodwracalna. Wizyta oraz powiązane rekordy zostaną trwale usunięte."
        onSuccess={handlePermanentDeleteSuccess}
      />
    </>
  );
}

export default DoctorsPage;
