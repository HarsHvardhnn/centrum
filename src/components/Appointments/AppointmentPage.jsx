import { useState } from "react";
import AppointmentFormModal from "../Doctor/Appointments/AddAppointmentForm";
import { toast } from "sonner";
import appointmentHelper from "../../helpers/appointmentHelper";
import { useLoader } from "../../context/LoaderContext";
import { useNavigate } from "react-router-dom";

function AppointmentPage() {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const [appointmentData, setAppointmentData] = useState(null);

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
        toast.success("Wizyta została zarezerwowana pomyślnie!");

        // Navigate to the doctors page
        navigate("/doctors");
      } else {
        // Handle error from API that returns success: false
        toast.error(response.message || "Nie udało się zarezerwować wizyty");
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

  const handleClose = () => {
    navigate("/doctors");
  };

  return (
    <div className="container mx-auto p-6">
      <AppointmentFormModal
        onClose={handleClose}
        onComplete={handleAppointmentComplete}
        doctorId={null} // No doctorId means user can select any doctor
      />
    </div>
  );
}

export default AppointmentPage; 