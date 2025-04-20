import { useParams } from "react-router-dom";
import DoctorDashboard from "./DoctorDashboard";
import { useEffect, useState } from "react";
import { useLoader } from "../../../context/LoaderContext";
import doctorService from "../../../helpers/doctorHelper";
import AppointmentFormModal from "../Appointments/AddAppointmentForm";

function DoctorsPage() {
  const router = useParams();
  const { showLoader, hideLoader } = useLoader();
  const [error, setError] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState({});
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
      id: apiDoctor._id,
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
    newPatients: 102,
    surgery: 4,
    criticalPatients: 54,
  };

  const patients = [];

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
  const handleAppointmentComplete = (data) => {
    console.log("Appointment data submitted:", data);
    setAppointmentData(data);

    // Here you would typically make an API call to save the appointment
    // Example:
    // saveAppointment(data).then(response => {
    //   if (response.success) {
    //     // Show success notification
    //     // Close modal
    //     setShowAppointmentModal(false);
    //   } else {
    //     // Handle error
    //   }
    // });

    // For now, just close the modal
    setShowAppointmentModal(false);
  };

  return (
    <>
      <DoctorDashboard
        doctor={doctorInfo}
        patients={patients}
        stats={stats}
        selectedPatient={selectedPatient}
        onPatientSelect={(id) => console.log(`Selected patient: ${id}`)}
        onDateSelect={(date) => console.log(`Selected date: ${date}`)}
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
