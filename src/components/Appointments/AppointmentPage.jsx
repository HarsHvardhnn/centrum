import { useState, useEffect } from "react";
import AppointmentFormModal from "../Doctor/Appointments/AddAppointmentForm";
import { toast } from "sonner";
import appointmentHelper from "../../helpers/appointmentHelper";
import { useLoader } from "../../context/LoaderContext";
import { useNavigate } from "react-router-dom";
import userServiceHelper from "../../helpers/userServiceHelper";
import { useServices } from "../../context/serviceContext.jsx";
import { useUser } from "../../context/userContext";

function AppointmentPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { showLoader, hideLoader } = useLoader();
  const { services, loading } = useServices(); // Use the services context
  const allowedDoctorId =
    user?.role === "doctor" ? user?.d_id || user?.id || null : null;
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
    console.log("Appointment data submitted:", data);
    setAppointmentData(data);

    try {
      // Show loading indicator
      showLoader();
      
      // Use the new reception appointment API for enhanced capabilities
      const response = await appointmentHelper.createReceptionAppointment(data);

      if (response && response.success) {
        // Show success notification with override information if applicable
        let successMessage = "Wizyta została zarezerwowana pomyślnie!";
        
        if (data.metadata?.overrideInfo) {
          const override = data.metadata.overrideInfo;
          if (override.customDuration || override.isBackdated || override.overrideConflicts) {
            successMessage += "\n\nUżyto opcji nadpisania:";
            if (override.customDuration) successMessage += `\n• Czas trwania: ${override.customDuration}`;
            if (override.isBackdated) successMessage += "\n• Data wsteczna";
            if (override.overrideConflicts) successMessage += "\n• Nadpisano konflikty czasowe";
          }
        }
        
        toast.success(successMessage);

        // Navigate to the patients page where doctor can generate invoice
        navigate("/clinic");
      } else {
        // Handle error from API that returns success: false
        toast.error(response?.message || "Nie udało się zarezerwować wizyty");
      }
    } catch (error) {
      // Handle exception from the API call
      console.error("Error creating appointment:", error);
      
      // Enhanced error handling for override-specific errors
      let errorMessage = "Wystąpił błąd podczas rezerwacji wizyty";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      // Check for specific override validation errors
      if (error.response?.data?.conflict) {
        errorMessage += "\n\nAby nadpisać konflikt czasowy, zaznacz opcję 'Nadpisz konflikty czasowe'";
      }
      
      if (error.response?.data?.pastDate) {
        errorMessage += "\n\nAby umówić wizytę w przeszłości, zaznacz opcję 'Pozwól na daty z przeszłości'";
      }
      
      toast.error(errorMessage);
    } finally {
      // Hide loading indicator
      hideLoader();
    }
  };

  const handleClose = () => {
    navigate("/clinic");
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-teal-700 mb-2">Dodaj Nową Wizytę</h1>
        <p className="text-gray-600">
          Nowy proces: Wyszukaj lekarza po nazwisku lub wybierz specjalizację i termin, a następnie wprowadź dane pacjenta.
        </p>
      </div>
      
      <AppointmentFormModal
        onClose={handleClose}
        onComplete={handleAppointmentComplete}
        doctorId={null} // No doctorId means user can select any doctor
        allowedDoctorId={allowedDoctorId}
        availableServices={availableServices}
        isLoadingServices={isLoadingServices}
        isReceptionistMode={true} // Enable receptionist workflow
        workflowOrder="appointmentFirst" // New workflow order
        allowPastDates={false} // Don't auto-enable past dates checkbox
        embedded={true}
      />

    </div>
  );
}

export default AppointmentPage; 