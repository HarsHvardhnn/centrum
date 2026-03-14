import { useNavigate, useParams } from "react-router-dom";
import DoctorDashboard from "./DoctorDashboard";
import { useEffect, useState } from "react";
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

function DoctorsPage() {
  const router = useParams();
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const [error, setError] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState({});
  const [patients, setPatients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [appointmentId, setAppointmentId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [dailySummary, setDailySummary] = useState({ liczbaWizyt: 0, pozostaloWizyt: 0 });
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInAppointment, setCheckInAppointment] = useState(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const itemsPerPage = 10;
  const { user } = useUser();

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

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const doctorId = router.id;
        if (!doctorId) return;

        showLoader();
        const dateStr = formatDateToYYYYMMDD(selectedDate);
        const response = await doctorService.getDoctorById(doctorId, dateStr);

        if (response.success && response.doctor) {
          const transformedData = transformToDoctorInfo(
            response.doctor,
            response.shiftsForDate,
            selectedDate
          );
          setDoctorInfo(transformedData);
        } else {
          setError("błąd serwera");
        }
      } catch (err) {
        console.error("Error fetching doctor data:", err);
        setError("Error loading doctor data");
      } finally {
        hideLoader();
      }
    };

    fetchDoctorData();
  }, [router.id, selectedDate, showLoader, hideLoader]);

  useEffect(() => {
    if (doctorInfo && doctorInfo.id) {
      fetchPatientsByDoctor(doctorInfo.id);
    }
  }, [selectedDate, doctorInfo, currentPage, searchQuery]);

  // New effect to fetch patient details when a patient is selected
  useEffect(() => {
    if (appointmentId) {
      // Find the selected appointment from patients array
      const selectedAppointment = patients.find(p => p.id === appointmentId);
      if (selectedAppointment) {
        fetchPatientDetails(selectedAppointment.patient_id, appointmentId);
      }
    } else {
      setPatientDetails(null);
    }
  }, [appointmentId, patients]);

  const fetchPatientsByDoctor = async (doctorId) => {
    try {
      showLoader();
      const response = await appointmentHelper.getDoctorAppointments(
        doctorId,
        formatDateToYYYYMMDD(selectedDate),
        formatDateToYYYYMMDD(selectedDate),
        "all",
        currentPage,
        itemsPerPage,
        searchQuery
      );

      if (response && response.success) {
        setPatients(response.data);
        setTotalPatients(response.total || response.data.length);
        const summary = computeDailySummary(response.data, {
          liczbaWizyt: response.liczbaWizyt,
          pozostaloWizyt: response.pozostaloWizyt,
        });
        setDailySummary(summary);
      } else {
        console.error("Failed to load patients data");
      }
    } catch (err) {
      console.error("Error fetching patients data:", err);
      setError("Error loading patients data");
    } finally {
      hideLoader();
    }
  };

  // New function to fetch patient details
  const fetchPatientDetails = async (patientId, appointmentId) => {
    try {
      showLoader();
      // Make API call to get patient details using the patient service
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
    } finally {
      hideLoader();
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
      const blocks = shiftsForDate.timeBlocks;
      timeSlot = blocks.map((b) => `${b.startTime} - ${b.endTime}`).join(", ");
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
        onDateSelect={setSelectedDate}
        selectedDate={selectedDate}
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
