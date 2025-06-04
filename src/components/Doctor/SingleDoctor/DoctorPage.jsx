import { useNavigate, useParams } from "react-router-dom";
import DoctorDashboard from "./DoctorDashboard";
import { useEffect, useState } from "react";
import { useLoader } from "../../../context/LoaderContext";
import doctorService from "../../../helpers/doctorHelper";
import AppointmentFormModal from "../Appointments/AddAppointmentForm";
import { toast } from "sonner";
import appointmentHelper from "../../../helpers/appointmentHelper";
import { formatDateToYYYYMMDD } from "../../../utils/formatDate";

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
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        // Get doctor ID from query params
        const doctorId = router.id;

        if (!doctorId) return; // Wait until we have the ID

        showLoader();
        const response = await doctorService.getDoctorById(doctorId);

        if (response.success && response.doctor) {
          // Transform the API data to match our component structure
          const transformedData = transformToDoctorInfo(response.doctor);
          setDoctorInfo(transformedData);
          console.log("doctor data", transformedData);
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
  }, [router.id, showLoader, hideLoader]);

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

      console.log("patient response", response);
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

  const transformToDoctorInfo = (apiDoctor) => {
    const fullName = `${apiDoctor.name?.first || ""} ${
      apiDoctor.name?.last || ""
    }`.trim();
    const specialty = apiDoctor.specialization?.[0]?.name || "General Practitioner";

    // Determine available time slot (optional enhancement using weeklyShifts)
    let timeSlot = "09:00am - 01:00pm";
    if (apiDoctor.weeklyShifts?.length) {
      const firstShift = apiDoctor.weeklyShifts[0];
      timeSlot = `${firstShift.startTime} - ${firstShift.endTime}`;
    }

    return {
      id: apiDoctor.id,
      _id: apiDoctor._id,
      name: fullName,
      specialty: specialty,
      timeSlot: timeSlot,
      timeZone: "BST", // You can dynamically determine this if needed
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
    console.log("Appointment data submitted:", data);
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

  return (
    <>
      <DoctorDashboard
        doctor={doctorInfo}
        patients={patients}
        stats={stats}
        selectedPatient={appointmentId}
        patientDetails={patientDetails}
        onPatientSelect={handlePatientSelect}
        setAppointmentId={setAppointmentId}
        onDateSelect={setSelectedDate}
        breadcrumbs={[
          { label: "Panel główny", onClick: () => navigate("/admin") },
          { label: "Wizyty lekarskie", onClick: null },
        ]}
        onSearch={handleSearch}
        onFilter={() => console.log("Filter clicked")}
        onBookAppointment={() => setShowAppointmentModal(true)}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        totalPatients={totalPatients}
        itemsPerPage={itemsPerPage}
      />

      {/* Appointment Form Modal */}
      {showAppointmentModal && (
        <AppointmentFormModal
          onClose={() => setShowAppointmentModal(false)}
          onComplete={handleAppointmentComplete}
          doctorId={doctorInfo.id}
        />
      )}
    </>
  );
}

export default DoctorsPage;
