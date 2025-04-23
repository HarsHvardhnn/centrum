import { useParams } from "react-router-dom";
import DoctorDashboard from "./DoctorDashboard";
import { useEffect, useState } from "react";
import { useLoader } from "../../../context/LoaderContext";
import doctorService from "../../../helpers/doctorHelper";
import AppointmentFormModal from "../Appointments/AddAppointmentForm";
import patientService from "../../../helpers/patientHelper";
import { toast } from "sonner";
import appointmentHelper from "../../../helpers/appointmentHelper";
import { formatDateToYYYYMMDD } from "../../../utils/formatDate";

function DoctorsPage() {
  const router = useParams();
  const { showLoader, hideLoader } = useLoader();
  const [error, setError] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState({});
  const [patients, setPatients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  // New state for controlling the modal visibility
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

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

          // fetchPatientsByDoctor(doctorId);
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

  const transformToDoctorInfo = (apiDoctor) => {
    const fullName = `${apiDoctor.name?.first || ""} ${
      apiDoctor.name?.last || ""
    }`.trim();
    const specialty = apiDoctor.specialization?.[0] || "General Practitioner";

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

  const selectedPatient = {
    name: "Morshed Ali",
    patientId: "#85736733",
    avatar: "/path/to/patient-avatar.jpg",
    email: "Morshed@gmail.com",
    phone: "+8801780910722",
    lastChecked: "Dr. Derry on 20 November 2022",
    prescription: "#20151224-124",
    weight: "67 kg",
    bp: "120/80",
    pulseRate: "Normal",
    observation: "Left Fever and cough is normal.",
    medications: [
      {
        name: "Cap.ANTACID",
        dosage: "500mg 1+1+1",
        frequency: "After meal",
        duration: "X 5 Days",
      },
      {
        name: "Cap.DECILONE",
        dosage: "10mg 1+0",
        frequency: "After meal",
        duration: "X 5 Days",
      },
      {
        name: "Cap.LEVOLIN",
        dosage: "500mg 1+1+1",
        frequency: "After meal",
        duration: "X 5 Days",
      },
      {
        name: "Tab.METHAI",
        dosage: "10mg 1+0",
        frequency: "After meal",
        duration: "X 5 Days",
      },
    ],
    reports: {
      ecg: "/path/to/ecg-report.jpg",
      blood: {
        WBC: "6.8",
        RBC: "5.2",
        HGB: "15.8",
        HCT: "47.6",
        MCV: "12.6",
        MCH: "30.4",
      },
      xray: "/path/to/xray-report.jpg",
    },
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

      if (response.success) {
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
    // You could implement logic to select a patient and display their details
  };

  return (
    <>
      <DoctorDashboard
        doctor={doctorInfo}
        patients={patients}
        stats={stats}
        selectedPatient={selectedPatient}
        onPatientSelect={handlePatientSelect}
        onDateSelect={setSelectedDate}
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
