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
  const navigate=useNavigate()
  const { showLoader, hideLoader } = useLoader();
  const [error, setError] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState({});
  const [patients, setPatients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);

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
          setError("Failed to load doctor data");
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
  }, [selectedDate, doctorInfo]);

  // New effect to fetch patient details when a patient is selected
  useEffect(() => {
    if (selectedPatient) {
      fetchPatientDetails(selectedPatient);
    } else {
      setPatientDetails(null);
    }
  }, [selectedPatient]);

  const fetchPatientsByDoctor = async (doctorId) => {
    try {
      const response = await appointmentHelper.getDoctorAppointments(
        doctorId,
        formatDateToYYYYMMDD(selectedDate),
        formatDateToYYYYMMDD(selectedDate)
      );

      if (response && response.success && response.data) {
        setPatients(response.data);
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
  const fetchPatientDetails = async (patientId) => {
    try {
      showLoader();
      // Make API call to get patient details using the patient service
      const response = await doctorService.getPatientDetailsAndReports(
        patientId
      );

      console.log("patient response", response);
      if (response ) {
        setPatientDetails(response);
      } else {
        toast.error("Failed to load patient details");
      }
    } catch (err) {
      console.error("Error fetching patient details:", err);
      toast.error("Error loading patient details");
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
        toast.success("Appointment booked successfully!");

        // Update local state with the new appointment data
        setAppointmentData(response.data);

        // Close modal
        setShowAppointmentModal(false);
      } else {
        // Handle error from API that returns success: false
        toast.error(response.message || "Failed to book appointment");
      }
    } catch (error) {
      // Handle exception from the API call
      console.error("Error creating appointment:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while booking your appointment"
      );
    } finally {
      // Hide loading indicator
      hideLoader();
    }
  };

  // Function to handle patient selection
  const handlePatientSelect = (patientId) => {
    console.log(`Selected patient: ${patientId}`);
    setSelectedPatient(patientId);
  };

  return (
    <>
      <DoctorDashboard
        doctor={doctorInfo}
        patients={patients}
        stats={stats}
        selectedPatient={selectedPatient}
        patientDetails={patientDetails} // Pass the patient details to DoctorDashboard
        onPatientSelect={handlePatientSelect}
        onDateSelect={setSelectedDate}
        breadcrumbs={[
            { label: "Dashboard", onClick: () => navigate("/admin") },
            { label: "Doctor Appointment", onClick: null },
          ]
        }
        onSearch={(query) => console.log(`Search query: ${query}`)}
        onFilter={() => console.log("Filter clicked")}
        onBookAppointment={() => setShowAppointmentModal(true)}
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
