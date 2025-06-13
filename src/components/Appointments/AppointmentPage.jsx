import { useState, useEffect } from "react";
import AppointmentFormModal from "../Doctor/Appointments/AddAppointmentForm";
import { toast } from "sonner";
import appointmentHelper from "../../helpers/appointmentHelper";
import { useLoader } from "../../context/LoaderContext";
import { useNavigate } from "react-router-dom";
import userServiceHelper from "../../helpers/userServiceHelper";
import { useServices } from "../../context/serviceContext.jsx";

function AppointmentPage() {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const { services, loading } = useServices(); // Use the services context
  const [appointmentData, setAppointmentData] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  // Load services from context
  useEffect(() => {
    if (services && services.length > 0) {
      setAvailableServices(services);
      setIsLoadingServices(false);
    } else {
      setIsLoadingServices(loading);
    }
  }, [services, loading]);

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
        availableServices={availableServices}
        isLoadingServices={isLoadingServices}
      />
    </div>
  );
}

export default AppointmentPage; 