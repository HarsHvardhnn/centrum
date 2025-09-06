import { useState, useEffect } from "react";
import PatientSearchField from "../../AppointmentForm/PatientSearchField"
import DoctorSelectionWithSlots from "../../admin/DoctorsAppointments";
import userServiceHelper from "../../../helpers/userServiceHelper";
import { Search, Plus, Minus, CheckCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { useServices } from "../../../context/serviceContext.jsx";
import { toast } from "sonner";
import { apiCaller } from "../../../utils/axiosInstance";

/**
 * AppointmentFormModal - Component for adding new appointments
 * 
 * Phone Number Fields for New Patients:
 * - newPatientPhoneCode: Country code (e.g., "+48", "+380")
 * - newPatientPhone: Phone number without country code (e.g., "123456789")
 * - Combined: Full phone number (e.g., "+48123456789")
 * 
 * Backend Submission Fields:
 * - phone: Full phone number (code + number)
 * - phoneCode: Just the country code
 * - mobileNumber: Just the number without code
 */
function AppointmentFormModal({ 
  onClose, 
  onComplete, 
  doctorId, 
  availableServices = [], 
  isLoadingServices = false,
  isReceptionistMode = false,
  workflowOrder = "patientFirst", // "patientFirst" or "appointmentFirst"
  allowPastDates = false // Whether to allow selecting dates in the past
}) {
  const { services: contextServices, loading: contextLoading } = useServices();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctorServices, setDoctorServices] = useState([]);
  const [allServices, setAllServices] = useState(availableServices || []);
  const [loadingServices, setLoadingServices] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    phone: ""
  });
  const [appointmentData, setAppointmentData] = useState({
    patientSource: "",
    visitType: "",
    isInternational: false,
    selectedDoctor: doctorId ? { _id: doctorId } : null,
    selectedDate: new Date().toISOString().split("T")[0],
    isWalkin: false,
    needsAttention: false,
    markAsArrived: false,
    notes: "",
    enableRepeats: false,
    selectedServices: [],
    newPatientFirstName: "",
    newPatientLastName: "",
    newPatientEmail: "",
    newPatientPhone: "",
    newPatientPhoneCode: "+48", // Add phone code field
    newPatientDateOfBirth: "",
    newPatientSex: "",
    newPatientPesel: "",
    // Enhanced appointment creation fields for receptionist override
    customDuration: null,
    isBackdated: allowPastDates, // Set to true if allowPastDates is true
    overrideConflicts: false,
    duration: 30, // Default duration in minutes
    // Metadata fields
    visitType: "",
    isEmergency: false,
    receptionistNotes: "",
         // Custom time override fields
     customStartTime: "",
     customEndTime: "",
    // Slot selection field
    selectedSlot: null,
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false);

  // FlagIcon component for SVG flags
  const FlagIcon = ({ countryCode }) => {
    const flags = {
      PL: (
        <svg viewBox="0 0 640 480" className="w-4 h-4">
          <g fillRule="evenodd">
            <path fill="#fff" d="M640 480H0V0h640z"/>
            <path fill="#dc143c" d="M640 480H0V240h640z"/>
          </g>
        </svg>
      ),
      UA: (
        <svg viewBox="0 0 640 480" className="w-4 h-4">
          <g fillRule="evenodd">
            <path fill="#005bbb" d="M0 0h640v240H0z"/>
            <path fill="#ffd700" d="M0 240h640v240H0z"/>
          </g>
        </svg>
      ),
      DE: (
        <svg viewBox="0 0 640 480" className="w-4 h-4">
          <g fillRule="evenodd">
            <path d="M0 0h640v480H0z"/>
            <path fill="#d00" d="M0 160h640v160H0z"/>
            <path fill="#ffce00" d="M0 320h640v160H0z"/>
          </g>
        </svg>
      ),
      GB: (
        <svg viewBox="0 0 640 480" className="w-4 h-4">
          <g fillRule="evenodd">
            <path fill="#012169" d="M0 0h640v480H0z"/>
            <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/>
            <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"/>
            <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z"/>
            <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z"/>
          </g>
        </svg>
      ),
      ES: (
        <svg viewBox="0 0 640 480" className="w-4 h-4">
          <g fillRule="evenodd">
            <path fill="#c60b1e" d="M0 0h640v480H0z"/>
            <path fill="#ffc400" d="M0 120h640v240H0z"/>
          </g>
        </svg>
      ),
      FR: (
        <svg viewBox="0 0 640 480" className="w-4 h-4">
          <g fillRule="evenodd">
            <path fill="#fff" d="M0 0h640v480H0z"/>
            <path fill="#00267f" d="M0 0h213.3v480H0z"/>
            <path fill="#f31830" d="M426.7 0H640v480H426.7z"/>
          </g>
        </svg>
      ),
      AT: (
        <svg viewBox="0 0 640 480" className="w-4 h-4">
          <g fillRule="evenodd">
            <path fill="#fff" d="M0 0h640v480H0z"/>
            <path fill="#c8102e" d="M0 160h640v160H0z"/>
          </g>
        </svg>
      ),
      IT: (
        <svg viewBox="0 0 640 480" className="w-4 h-4">
          <g fillRule="evenodd">
            <path fill="#fff" d="M0 0h640v480H0z"/>
            <path fill="#009246" d="M0 0h213.3v480H0z"/>
            <path fill="#ce2b37" d="M426.7 0H640v480H426.7z"/>
          </g>
        </svg>
      ),
      CZ: (
        <svg viewBox="0 0 640 480" className="w-4 h-4">
          <g fillRule="evenodd">
            <path fill="#fff" d="M0 0h640v240H0z"/>
            <path fill="#d7141a" d="M0 240h640v240H0z"/>
            <path fill="#11457e" d="M240 0h160v480H240z"/>
          </g>
        </svg>
      ),
      US: (
        <svg viewBox="0 0 640 480" className="w-4 h-4">
          <g fillRule="evenodd">
            <path fill="#bd3d44" d="M0 0h640v480H0z"/>
            <path stroke="#fff" strokeWidth="37" d="M0 55.3h640M0 129h640M0 203h640M0 277h640M0 351h640M0 425h640"/>
            <path fill="#192f5d" d="M0 0h364.8v258.5H0z"/>
            <g fill="#fff">
              <g id="d">
                <g id="c">
                  <g id="e">
                    <g id="b">
                      <path id="a" d="M24.8 25l3.2 9.8h10.3l-8.4 6.1 3.2 9.8-8.3-6.1-8.3 6.1 3.2-9.8-8.4-6.1h10.3z"/>
                      <use href="#a" y="19.5"/>
                      <use href="#a" y="39"/>
                    </g>
                    <use href="#b" y="78"/>
                  </g>
                  <use href="#e" y="78"/>
                </g>
                <use href="#c" y="156"/>
              </g>
              <use href="#d" y="312"/>
            </g>
          </g>
        </svg>
      )
    };
    
    return flags[countryCode] || <span>🏳️</span>;
  };

  // Phone country codes with validation
  const phoneCountryCodes = [
    { code: "+48", country: "Polska", flag: "PL", maxLength: 9, default: true },
    { code: "+380", country: "Ukraina", flag: "UA", maxLength: 9 },
    { code: "+49", country: "Niemcy", flag: "DE", maxLength: 11 },
    { code: "+44", country: "Wielka Brytania", flag: "GB", maxLength: 10 },
    { code: "+34", country: "Hiszpania", flag: "ES", maxLength: 9 },
    { code: "+33", country: "Francja", flag: "FR", maxLength: 9 },
    { code: "+43", country: "Austria", flag: "AT", maxLength: 10 },
    { code: "+39", country: "Włochy", flag: "IT", maxLength: 10 },
    { code: "+420", country: "Czechy", flag: "CZ", maxLength: 9 },
    { code: "+1", country: "USA", flag: "US", maxLength: 10 }
  ];

  // Update allServices when availableServices changes or use context services as fallback
  useEffect(() => {
    if (availableServices && availableServices.length > 0) {
      setAllServices(availableServices);
    } else if (contextServices && contextServices.length > 0) {
      setAllServices(contextServices);
    }
    
    // Update loading state based on both props and context
    setLoadingServices(isLoadingServices || contextLoading);
  }, [availableServices, contextServices, isLoadingServices, contextLoading]);

  // Update duration when time changes or slot is selected
  useEffect(() => {
    let calculatedDuration = 0;
    
    if (appointmentData.selectedSlot) {
      // Calculate duration from selected slot
      if (appointmentData.selectedSlot.startTime && appointmentData.selectedSlot.endTime) {
        const start = new Date(`2000-01-01T${appointmentData.selectedSlot.startTime}`);
        const end = new Date(`2000-01-01T${appointmentData.selectedSlot.endTime}`);
        calculatedDuration = Math.round((end - start) / 60000);
      } else if (appointmentData.selectedSlot.duration) {
        calculatedDuration = appointmentData.selectedSlot.duration;
      }
    } else if (appointmentData.customStartTime && appointmentData.customEndTime) {
      // Calculate duration from custom time
      calculatedDuration = calculateDurationFromTime();
    }
    
    // Always update duration when we have a valid calculation, regardless of previous customDuration
    if (calculatedDuration && calculatedDuration > 0) {
      setAppointmentData(prev => ({
        ...prev,
        customDuration: calculatedDuration
      }));
    }
  }, [appointmentData.customStartTime, appointmentData.customEndTime, appointmentData.selectedSlot]);

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  // Email validation function
  const validateEmail = (email) => {
    if (!email) return ""; // Empty is allowed
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? "" : "Nieprawidłowy format adresu email";
  };

  // Phone validation function
  const validatePhone = (phone) => {
    if (!phone) return "Numer telefonu jest wymagany"; // Make phone mandatory
    const currentCountry = phoneCountryCodes.find(c => c.code === appointmentData.newPatientPhoneCode) || phoneCountryCodes[0];
    const phoneRegex = new RegExp(`^\\d{${currentCountry.maxLength}}$`);
    return phoneRegex.test(phone) ? "" : `Numer telefonu dla ${currentCountry.country} musi mieć dokładnie ${currentCountry.maxLength} cyfr`;
  };

  // Custom duration validation function
  const validateCustomDuration = (duration) => {
    if (!duration) return ""; // Empty is allowed
    const numDuration = parseInt(duration);
    if (isNaN(numDuration) || numDuration < 1 || numDuration > 480) {
      return "Czas trwania musi być między 1 a 480 minutami";
    }
    return "";
  };

  // Form validation function
  const validateForm = () => {
    const errors = {};
    
    // Validate that either slot is selected OR custom time is provided, but not both
    if (appointmentData.selectedSlot && (appointmentData.customStartTime || appointmentData.customEndTime)) {
      errors.timeSelection = "Możesz wybrać termin z listy LUB ustawić własny czas, ale nie oba jednocześnie";
    }
    
    // Validate that at least one time option is selected
    if (!appointmentData.selectedSlot && !appointmentData.customStartTime) {
      errors.timeSelection = "Proszę wybrać termin z listy dostępnych terminów LUB ustawić własny czas";
    }
    
    // Validate custom duration if provided
    if (appointmentData.customDuration) {
      const durationError = validateCustomDuration(appointmentData.customDuration);
      if (durationError) {
        errors.customDuration = durationError;
      }
    }
    
    // Validate custom time if provided
    if (appointmentData.customStartTime && appointmentData.customStartTime.trim() !== "") {
      if (appointmentData.customEndTime && appointmentData.customEndTime.trim() !== "") {
                 // If both start and end time are provided, validate that end is after start
         // HTML time input already provides 24-hour format
         const start = new Date(`2000-01-01T${appointmentData.customStartTime}`);
         const end = new Date(`2000-01-01T${appointmentData.customEndTime}`);
        
        if (end <= start) {
          errors.customTime = "Czas zakończenia musi być po czasie rozpoczęcia";
        }
        
        // Duration should be reasonable (not too long)
        const duration = Math.round((end - start) / 60000);
        if (duration > 480) { // 8 hours max
          errors.customTime = "Czas trwania wizyty nie może przekraczać 8 godzin";
        }
      }
    }
    
    // Validate that if backdating is enabled, the date is not too far in the past
    if (appointmentData.isBackdated && appointmentData.selectedDate) {
      const selectedDate = new Date(appointmentData.selectedDate);
      const currentDate = new Date();
      const daysDifference = Math.floor((currentDate - selectedDate) / (1000 * 60 * 60 * 24));
      
      if (daysDifference > 365) {
        errors.date = "Nie można umówić wizyty sprzed więcej niż 1 roku";
      }
    }

    // Validate phone number for new patients
    if (appointmentData.visitType === "first-time") {
      if (!appointmentData.newPatientPhone || appointmentData.newPatientPhone.trim() === "") {
        errors.phone = "Numer telefonu jest wymagany dla nowych pacjentów";
      } else {
        const phoneError = validatePhone(appointmentData.newPatientPhone);
        if (phoneError) {
          errors.phone = phoneError;
        }
      }
    }
    
    return errors;
  };

  // Calculate end time based on custom duration
  const calculateEndTime = (startTime, duration) => {
    if (!startTime || !duration) return null;
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return endDate.toTimeString().slice(0, 5);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "newPatientPhone") {
      // Get current country for max length validation
      const currentCountry = phoneCountryCodes.find(c => c.code === appointmentData.newPatientPhoneCode) || phoneCountryCodes[0];
      const numbersOnly = value.replace(/\D/g, "").slice(0, currentCountry.maxLength);
      setAppointmentData(prev => ({
        ...prev,
        [name]: numbersOnly
      }));
      setValidationErrors(prev => ({
        ...prev,
        phone: validatePhone(numbersOnly)
      }));
    } else if (name === "newPatientEmail") {
      setAppointmentData(prev => ({
        ...prev,
        [name]: value
      }));
      setValidationErrors(prev => ({
        ...prev,
        email: validateEmail(value)
      }));
    } else {
      setAppointmentData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  // Handle phone code change
  const handlePhoneCodeChange = (newCode) => {
    setAppointmentData(prev => ({
      ...prev,
      newPatientPhoneCode: newCode
    }));
    
    // Clear phone number if it doesn't match new country's length
    const newCountry = phoneCountryCodes.find(c => c.code === newCode);
    if (newCountry && appointmentData.newPatientPhone) {
      const currentPhone = appointmentData.newPatientPhone;
      if (currentPhone.length !== newCountry.maxLength) {
        setAppointmentData(prev => ({
          ...prev,
          newPatientPhone: ""
        }));
      }
    }
    
    setPhoneDropdownOpen(false);
  };

  // Fetch doctor services when a doctor is selected
  const fetchDoctorServices = async (doctorId) => {
    if (!doctorId) return;
    
    setLoadingServices(true);
    try {
      const response = await userServiceHelper.getDoctorServices(doctorId);
      if (response.data && response.data.data && response.data.data.services) {
        setDoctorServices(response.data.data.services.map(s => ({
          id: s.service._id,
          title: s.service.title,
          price: s.price,
          notes: s.notes || "",
        })));
      } else {
        setDoctorServices([]);
      }
    } catch (error) {
      console.error("Error fetching doctor services:", error);
      setDoctorServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  // Add this function to fetch next available date
  const fetchNextAvailableDate = async (doctorId) => {
    if (!doctorId) return;
    
    try {
      const response = await apiCaller(
        "GET",
        `docs/schedule/next-available/${doctorId}`
      );

      if (response.data.success) {
        if (response.data.data) {
          // If we have available dates, set them
          setAppointmentData(prev => ({
            ...prev,
            selectedDate: response.data.data.nextAvailableDate,
          }));
          setAvailableSlots(response.data.data.availableSlots || []);
        } else {
          // If no dates available in next 30 days
          toast.error("Ten lekarz nie ma dostępnych terminów w ciągu najbliższych 30 dni.");
          setAppointmentData(prev => ({
            ...prev,
            selectedDate: new Date().toISOString().split("T")[0],
          }));
          setAvailableSlots([]);
        }
      }
    } catch (error) {
      console.error("Error fetching next available date:", error);
      toast.error("Wystąpił błąd podczas sprawdzania dostępności lekarza.");
      setAvailableSlots([]);
    }
  };

  // Modify the handleDoctorSelect function
  const handleDoctorSelect = (doctor) => {
    setAppointmentData({
      ...appointmentData,
      selectedDoctor: doctor,
      selectedServices: [], // Reset selected services when doctor changes
    });
    
    if (doctor && doctor._id) {
      fetchDoctorServices(doctor._id);
      fetchNextAvailableDate(doctor._id); // Add this line to fetch next available date
    } else {
      setDoctorServices([]);
      setAvailableSlots([]);
    }
  };

  // Handle selecting/deselecting services
  const handleServiceToggle = (service) => {
    // Normalize the service structure to ensure consistency
    const normalizedService = {
      id: service.id || service._id,
      title: service.title || service.name,
      price: service.price || "0",
      description: service.description || service.shortDescription || "",
      quantity: 1
    };
    
    setAppointmentData(prevData => {
      const currentServices = [...prevData.selectedServices];
      const index = currentServices.findIndex(s => s.id === normalizedService.id);
      
      if (index === -1) {
        // Add service if not already selected
        currentServices.push(normalizedService);
      } else {
        // Remove service if already selected
        currentServices.splice(index, 1);
      }
      
      return {
        ...prevData,
        selectedServices: currentServices
      };
    });
  };

  // Handle slot selection
  const handleSlotSelect = (slot) => {
    setAppointmentData(prev => ({
      ...prev,
      selectedSlot: slot,
      // Clear custom time when slot is selected
      customStartTime: "",
      customEndTime: ""
    }));
  };

  // Clear slot selection
  const clearSlotSelection = () => {
    setAppointmentData(prev => ({
      ...prev,
      selectedSlot: null
    }));
  };

  // Update service quantity
  const updateServiceQuantity = (serviceId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setAppointmentData(prevData => {
      const updatedServices = prevData.selectedServices.map(service => 
        service.id === serviceId 
          ? { ...service, quantity: newQuantity }
          : service
      );
      
      return {
        ...prevData,
        selectedServices: updatedServices
      };
    });
  };

  // Handle custom time change
  const handleCustomTimeChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({
      ...prev,
      [name]: value,
      // Clear selected slot when custom time is used
      selectedSlot: null
    }));
  };

  const handleDateChange = (e) => {
    setAppointmentData({
      ...appointmentData,
      selectedDate: e.target.value,
    });
  };

  // Filter services based on search term
  const filteredServices = searchTerm
    ? allServices.filter(service =>
        service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allServices;

  // Modify the useEffect for initial doctor selection
  useEffect(() => {
    if (doctorId) {
      const doctor = { _id: doctorId };
      handleDoctorSelect(doctor);
    }
  }, [doctorId]);

  const isFirstTimeVisit = appointmentData.visitType === "first-time";
  const isNewPatientValid = isFirstTimeVisit && 
    appointmentData.newPatientFirstName.trim() !== "" && 
    appointmentData.newPatientLastName.trim() !== "" &&
    appointmentData.newPatientSex.trim() !== "" &&
    appointmentData.newPatientPhone.trim() !== "" &&
    validatePhone(appointmentData.newPatientPhone) === "";

  const canProceedToNextStep = () => {
    if (workflowOrder === "appointmentFirst") {
      // New workflow: Appointment first, then patient
      switch (currentStep) {
        case 1: // Doctor Selection & Date
          return appointmentData.selectedDoctor && 
                 appointmentData.selectedDate && 
                 (appointmentData.customStartTime || appointmentData.selectedSlot);
        case 2: // Patient Information
          return appointmentData.visitType && (isFirstTimeVisit ? isNewPatientValid : selectedPatient);
        case 3: // Services
          return true; // Services are optional
        case 4: // Additional Details
          return true; // Additional details are optional
        case 5: // Receptionist Overrides
          return true; // Override options are optional
        default:
          return false;
      }
    } else {
      // Original workflow: Patient first, then appointment
      switch (currentStep) {
        case 1: // Patient Information
          return appointmentData.visitType && (isFirstTimeVisit ? isNewPatientValid : selectedPatient);
        case 2: // Doctor Selection & Date
          return appointmentData.selectedDoctor && 
                 appointmentData.selectedDate && 
                 (appointmentData.customStartTime || appointmentData.selectedSlot);
        case 3: // Services
          return true; // Services are optional
        case 4: // Additional Details
          return true; // Additional details are optional
        case 5: // Receptionist Overrides
          return true; // Override options are optional
        default:
          return false;
      }
    }
  };

  const StepIndicator = () => {
    const getStepTitle = (step) => {
      if (workflowOrder === "appointmentFirst") {
        // New workflow: Appointment first, then patient
        switch (step) {
          case 1: return "Lekarz i Termin";
          case 2: return "Dane Pacjenta";
          case 3: return "Usługi";
          case 4: return "Szczegóły";
          case 5: return "Opcje Recepcjonisty";
          default: return step;
        }
      } else {
        // Original workflow: Patient first, then appointment
        switch (step) {
          case 1: return "Dane Pacjenta";
          case 2: return "Lekarz i Termin";
          case 3: return "Usługi";
          case 4: return "Szczegóły";
          case 5: return "Opcje Recepcjonisty";
          default: return step;
        }
      }
    };

    return (
      <div className="flex items-center justify-center mb-6">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div
              onClick={() => setCurrentStep(step)}
              className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 ${
                currentStep === step
                  ? "bg-teal-500 text-white shadow-lg"
                  : currentStep > step
                  ? "bg-teal-200 text-teal-700 hover:bg-teal-300"
                  : "bg-gray-200 text-gray-500 hover:bg-gray-300"
              }`}
              title={`Krok ${step}: ${getStepTitle(step)}`}
            >
              {step}
            </div>
            {step < 5 && (
              <div
                className={`w-12 h-1 mx-2 ${
                  currentStep > step ? "bg-teal-200" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    if (workflowOrder === "appointmentFirst") {
      // New workflow: Appointment first, then patient
      switch (currentStep) {
        case 1:
          return renderDoctorSelectionStep();
        case 2:
          return renderPatientInfoStep();
        case 3:
          return renderServicesStep();
        case 4:
          return renderAdditionalDetailsStep();
        case 5:
          return renderReceptionistOverridesStep();
        default:
          return null;
      }
    } else {
      // Original workflow: Patient first, then appointment
      switch (currentStep) {
        case 1:
          return renderPatientInfoStep();
        case 2:
          return renderDoctorSelectionStep();
        case 3:
          return renderServicesStep();
        case 4:
          return renderAdditionalDetailsStep();
        case 5:
          return renderReceptionistOverridesStep();
        default:
          return null;
      }
    }
  };

  const renderDoctorSelectionStep = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium mb-4">Wybór Lekarza i Terminu</h3>
        
        {/* Doctor Selection */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wybierz lekarza
          </label>
          <DoctorSelectionWithSlots
            selectedDoctor={appointmentData.selectedDoctor}
            selectedDate={appointmentData.selectedDate}
            onDoctorSelect={handleDoctorSelect}
            onDateChange={handleDateChange}
            initialDoctorId={doctorId}
            onSlotSelect={handleSlotSelect}
          />
        </div>

        {/* Date Selection */}
        {appointmentData.selectedDoctor && (
          <div className="bg-teal-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wybierz datę wizyty
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                name="selectedDate"
                value={appointmentData.selectedDate}
                onChange={handleDateChange}
                className="w-full md:w-1/2 p-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                min={undefined} /* Removed min date restriction to allow selecting previous dates */
              />
              {appointmentData.isBackdated && (
                <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                  Data w przeszłości dozwolona
                </span>
              )}
            </div>
          </div>
        )}

        {/* Custom Time Slot Input - Receptionist Override */}
        {appointmentData.selectedDoctor && appointmentData.selectedDate && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-md font-medium text-blue-800 mb-3">Ustaw Termin Wizyty</h4>
            
            {/* Show current selection status */}
            {appointmentData.selectedSlot && (
              <div className="mb-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-green-800">
                      <strong>✓ Wybrano termin:</strong> {appointmentData.selectedSlot.startTime} - {appointmentData.selectedSlot.endTime}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Możesz zmienić na własny termin poniżej, ale wtedy wybrany termin zostanie odznaczony.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearSlotSelection}
                    className="text-xs text-red-600 hover:text-red-800 underline"
                  >
                    Wyczyść wybór
                  </button>
                </div>
              </div>
            )}
            
            <p className="text-xs text-blue-600 mb-3">
              <strong>Uwaga:</strong> Możesz wybrać dostępny termin z listy powyżej LUB ustawić własny termin poniżej. 
              Nie możesz używać obu opcji jednocześnie.
            </p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Czas rozpoczęcia
                 </label>
                 <input
                   type="time"
                   name="customStartTime"
                   value={appointmentData.customStartTime || ""}
                   onChange={handleCustomTimeChange}
                   className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   disabled={appointmentData.selectedSlot !== null}
                   placeholder="HH:MM"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Czas zakończenia (opcjonalny)
                 </label>
                 <input
                   type="time"
                   name="customEndTime"
                   value={appointmentData.customEndTime || ""}
                   onChange={handleCustomTimeChange}
                   className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   disabled={appointmentData.selectedSlot !== null}
                   placeholder="HH:MM"
                 />
               </div>
             </div>
                         <p className="text-xs text-blue-600 mt-2">
               Ustaw dowolny termin - możesz nadpisać istniejące wizyty lub umówić w niestandardowym czasie. 
               <strong>Uwaga:</strong> Użyj wbudowanego selektora czasu (AM/PM jest automatycznie obsługiwane).
             </p>
            {appointmentData.customStartTime && appointmentData.customEndTime && validateForm().customTime && (
              <p className="text-red-500 text-xs mt-2">
                {validateForm().customTime}
              </p>
            )}
            {validateForm().timeSelection && (
              <p className="text-red-500 text-xs mt-2">
                {validateForm().timeSelection}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderPatientInfoStep = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium mb-4">Informacje o Pacjencie</h3>
        
        {/* Visit Type Selection */}
        <div className="bg-teal-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Typ wizyty
          </label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="visitType"
                value="first-time"
                checked={appointmentData.visitType === "first-time"}
                onChange={handleInputChange}
                className="h-4 w-4 text-teal-600"
              />
              <span className="ml-2">Pierwsza wizyta</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="visitType"
                value="re-visit"
                checked={appointmentData.visitType === "re-visit"}
                onChange={handleInputChange}
                className="h-4 w-4 text-teal-600"
              />
              <span className="ml-2">Kolejna wizyta</span>
            </label>
          </div>
        </div>

        {appointmentData.visitType === "re-visit" && (
          <PatientSearchField onPatientSelect={handlePatientSelect} />
        )}

        {appointmentData.visitType === "first-time" && (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Imię*</label>
                <input
                  type="text"
                  name="newPatientFirstName"
                  value={appointmentData.newPatientFirstName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nazwisko*</label>
                <input
                  type="text"
                  name="newPatientLastName"
                  value={appointmentData.newPatientLastName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  name="newPatientEmail"
                  value={appointmentData.newPatientEmail}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-lg ${validationErrors.email ? 'border-red-500' : ''}`}
                  placeholder="Opcjonalny"
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Telefon*</label>
                <div className="flex">
                  {/* Custom Country Code Dropdown */}
                  <div className="relative w-24 phone-dropdown">
                    <button
                      type="button"
                      onClick={() => setPhoneDropdownOpen(!phoneDropdownOpen)}
                      className="w-full h-[42px] px-3 border border-gray-300 rounded-l-md border-r-0 bg-gray-50 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                    >
                                             <span className="flex items-center">
                         <span className="mr-1">
                           <FlagIcon countryCode={phoneCountryCodes.find(c => c.code === appointmentData.newPatientPhoneCode)?.flag || "PL"} />
                         </span>
                         <span className="text-xs">{appointmentData.newPatientPhoneCode}</span>
                       </span>
                      <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Options */}
                    {phoneDropdownOpen && (
                      <div className="absolute top-full left-0 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                        {phoneCountryCodes.map((country) => (
                                                     <button
                             key={country.code}
                             type="button"
                             onClick={() => handlePhoneCodeChange(country.code)}
                             className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center ${
                               appointmentData.newPatientPhoneCode === country.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                             }`}
                           >
                             <span className="mr-2">
                               <FlagIcon countryCode={country.flag} />
                             </span>
                             <span className="mr-2">{country.code}</span>
                             <span className="text-xs text-gray-500">{country.country}</span>
                           </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Phone Number Input */}
                  <input
                    type="tel"
                    name="newPatientPhone"
                    value={appointmentData.newPatientPhone}
                    onChange={handleInputChange}
                    className={`flex-1 h-[42px] px-3 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.phone ? 'border-red-500' : ''}`}
                    placeholder={`Wprowadź ${phoneCountryCodes.find(c => c.code === appointmentData.newPatientPhoneCode)?.maxLength || 9} cyfr`}
                    maxLength={phoneCountryCodes.find(c => c.code === appointmentData.newPatientPhoneCode)?.maxLength || 9}
                  />
                </div>
                {validationErrors.phone && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Data urodzenia</label>
                <input
                  type="date"
                  name="newPatientDateOfBirth"
                  value={appointmentData.newPatientDateOfBirth}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Opcjonalna"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">PESEL</label>
                <input
                  type="text"
                  name="newPatientPesel"
                  value={appointmentData.newPatientPesel}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Wprowadź PESEL (opcjonalny)"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Płeć*</label>
                <select
                  name="newPatientSex"
                  value={appointmentData.newPatientSex}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Wybierz płeć</option>
                  <option value="Male">Mężczyzna</option>
                  <option value="Female">Kobieta</option>
                  <option value="Others">Inna</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="bg-teal-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              name="isInternational"
              checked={appointmentData.isInternational}
              onChange={handleInputChange}
              className="h-4 w-4 text-teal-600"
            />
            <label className="ml-2 text-sm">Pacjent międzynarodowy</label>
          </div>
          <input
            type="text"
            name="patientSource"
            placeholder="Źródło pacjenta"
            value={appointmentData.patientSource}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg"
          />
        </div>
      </div>
    );
  };

  const renderServicesStep = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium mb-4">Wybór Usług</h3>
        
        {/* Services Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Szukaj usług..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Available Services */}
        <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto">
          <div className="space-y-2">
            {loadingServices ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
                <p>Ładowanie usług...</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nie znaleziono usług
              </div>
            ) : (
              filteredServices.map((service) => {
                const isSelected = appointmentData.selectedServices.some(s => 
                  s.id === (service.id || service._id));
                const selectedService = appointmentData.selectedServices.find(s => 
                  s.id === (service.id || service._id));
                const quantity = selectedService ? (selectedService.quantity || 1) : 1;
                
                return (
                  <div 
                    key={service.id || service._id} 
                    className={`p-3 rounded-lg border ${
                      isSelected ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-200'
                    } transition-all`}
                  >
                    <div className="flex justify-between items-start">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleServiceToggle(service)}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by the div onClick
                            className="h-4 w-4 text-teal-600 border-gray-300 rounded"
                          />
                          <span className="ml-2 font-medium">{service.title || service.name}</span>
                        </div>
                        <div className="ml-6 mt-1 text-sm text-gray-600">{service.price} zł</div>
                      </div>
                      
                      {isSelected && (
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => updateServiceQuantity(service.id || service._id, quantity - 1)}
                            className="h-6 w-6 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{quantity}</span>
                          <button 
                            onClick={() => updateServiceQuantity(service.id || service._id, quantity + 1)}
                            className="h-6 w-6 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Services Summary */}
        {appointmentData.selectedServices.length > 0 && (
          <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
            <h4 className="font-medium text-teal-800 mb-2 flex items-center">
              <CheckCircle size={16} className="mr-2" />
              Wybrane usługi
            </h4>
            <div className="space-y-2">
              {appointmentData.selectedServices.map((service) => (
                <div key={service.id} className="flex justify-between text-sm">
                  <div>
                    {service.title} 
                    {(service.quantity && service.quantity > 1) && (
                      <span className="text-gray-600 ml-1">x{service.quantity}</span>
                    )}
                  </div>
                  <div className="font-medium">
                    {((parseFloat(service.price) || 0) * (service.quantity || 1)).toFixed(2)} zł
                  </div>
                </div>
              ))}
              <div className="border-t border-teal-200 mt-2 pt-2 flex justify-between font-medium">
                <div>Łącznie:</div>
                <div>{calculateTotalPrice().toFixed(2)} zł</div>
              </div>
            </div>
          </div>
        )}

        {/* Note about services */}
        <div className="text-xs text-gray-500 italic px-1">
          Wybrane usługi zostaną dodane bezpośrednio do wizyty. Możesz wybrać dowolną liczbę usług dostępnych w klinice, 
          a następnie określić ilość dla każdej z nich. Całkowita cena zostanie automatycznie obliczona.
        </div>
      </div>
    );
  };

  const renderAdditionalDetailsStep = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium mb-4">Dodatkowe Informacje</h3>
        
        {/* Walk-in and Attention Flags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isWalkin"
              checked={appointmentData.isWalkin}
              onChange={handleInputChange}
              className="h-4 w-4 text-teal-600"
            />
            <span>Pacjent bez wcześniejszej rezerwacji</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="needsAttention"
              checked={appointmentData.needsAttention}
              onChange={handleInputChange}
              className="h-4 w-4 text-teal-600"
            />
            <span>Wymaga szczególnej uwagi</span>
          </label>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notatki
          </label>
          <textarea
            name="notes"
            value={appointmentData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Dodatkowe informacje o wizycie..."
          />
        </div>
      </div>
    );
  };

  const renderReceptionistOverridesStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium mb-4">Opcje Recepcjonisty</h3>
        
        {/* Custom Duration */}
        {/* <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-md font-medium text-blue-800 mb-3">Czas Trwania Wizyty</h4>
          
          {(appointmentData.customStartTime && appointmentData.customEndTime) || appointmentData.selectedSlot ? (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>✓ Automatycznie obliczony czas trwania:</strong> {appointmentData.customDuration || 0} minut
              </p>
                                               <p className="text-xs text-green-700 mt-1">
                   {appointmentData.selectedSlot 
                     ? `Na podstawie wybranego terminu: ${appointmentData.selectedSlot.startTime} - ${appointmentData.selectedSlot.endTime}`
                     : `Na podstawie wybranego czasu: ${appointmentData.customStartTime} - ${appointmentData.customEndTime}`
                   }
                 </p>
            </div>
          ) : null}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Czas trwania (minuty)
              </label>
              <input
                type="number"
                name="customDuration"
                value={appointmentData.customDuration || ""}
                onChange={handleInputChange}
                min="1"
                max="480"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="30"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(appointmentData.customStartTime && appointmentData.customEndTime) || appointmentData.selectedSlot
                  ? "Możesz zmienić automatycznie obliczony czas trwania"
                  : "1-480 minut (1-8 godzin) - lub wybierz termin/wybierz czas w kroku 1 aby automatycznie obliczyć"
                }
              </p>
              {appointmentData.customDuration && validateCustomDuration(appointmentData.customDuration) && (
                <p className="text-red-500 text-xs mt-1">
                  {validateCustomDuration(appointmentData.customDuration)}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typ wizyty
              </label>
              <select
                name="visitType"
                value={appointmentData.visitType || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Wybierz typ wizyty</option>
                <option value="consultation">Konsultacja</option>
                <option value="emergency">Nagły przypadek</option>
                <option value="followup">Wizyta kontrolna</option>
                <option value="quick_check">Szybka kontrola</option>
                <option value="extended_consultation">Rozszerzona konsultacja</option>
              </select>
            </div>
          </div>
        </div> */}

        {/* Override Options */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="text-md font-medium text-yellow-800 mb-3">Opcje Nadpisania</h4>
          <div className="space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isBackdated"
                checked={appointmentData.isBackdated}
                onChange={handleInputChange}
                className="h-4 w-4 text-yellow-600"
              />
              <span className="text-sm font-medium">Pozwól na daty z przeszłości (dla celów ewidencyjnych)</span>
            </label>
            
            {appointmentData.isBackdated && appointmentData.selectedDate && (
              <div className="ml-6 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Uwaga:</strong> Wybrana data ({appointmentData.selectedDate}) jest w przeszłości. 
                  Ta opcja jest przydatna do rejestrowania wizyt, które już się odbyły.
                </p>
              </div>
            )}
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="overrideConflicts"
                checked={appointmentData.overrideConflicts}
                onChange={handleInputChange}
                className="h-4 w-4 text-yellow-600"
              />
              <span className="text-sm font-medium">Nadpisz konflikty czasowe (wielu pacjentów jednocześnie)</span>
            </label>
            
            {appointmentData.overrideConflicts && (
              <div className="ml-6 p-3 bg-orange-100 border border-orange-300 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Uwaga:</strong> Ta opcja pozwoli na umówienie wizyty w czasie, gdy lekarz ma już inne wizyty. 
                  Upewnij się, że lekarz może obsłużyć wielu pacjentów jednocześnie.
                </p>
              </div>
            )}
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isEmergency"
                checked={appointmentData.isEmergency}
                onChange={handleInputChange}
                className="h-4 w-4 text-yellow-600"
              />
              <span className="text-sm font-medium">Wizyta nagła (priorytetowa)</span>
            </label>
          </div>
        </div>

        {/* Receptionist Notes */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="text-md font-medium text-gray-800 mb-3">Notatki Recepcjonisty</h4>
          <textarea
            name="receptionistNotes"
            value={appointmentData.receptionistNotes}
            onChange={handleInputChange}
            rows={3}
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="Dodatkowe informacje o nadpisaniu, powody, uwagi..."
          />
        </div>

        {/* Active Overrides Summary */}
        {(appointmentData.customDuration || appointmentData.isBackdated || appointmentData.overrideConflicts || appointmentData.isEmergency) && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="text-md font-medium text-purple-800 mb-3">Aktywne Opcje Nadpisania</h4>
            <div className="space-y-2 text-sm">
              {appointmentData.customDuration && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span>Niestandardowy czas trwania: {appointmentData.customDuration} minut</span>
                </div>
              )}
              {appointmentData.isBackdated && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span>Pozwolono na daty z przeszłości</span>
                </div>
              )}
              {appointmentData.overrideConflicts && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span>Nadpisano konflikty czasowe</span>
                </div>
              )}
              {appointmentData.isEmergency && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span>Wizyta nagła (priorytetowa)</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current Appointment Summary */}
        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
          <h4 className="text-md font-medium text-teal-800 mb-3" onClick={()=>{console.log("Podsumowanie Wizyty",appointmentData.selectedSlot ,appointmentData.customStartTime,appointmentData.customEndTime ,appointmentData.customDuration)}}>Podsumowanie Wizyty</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Data:</span> {appointmentData.selectedDate}
            </div>
                         <div>
               <span className="font-medium">Czas:</span> {
                 appointmentData.selectedSlot 
                   ? `${appointmentData.selectedSlot.startTime} - ${appointmentData.selectedSlot.endTime} (wybrany termin)`
                   : appointmentData.customStartTime 
                     ? `${appointmentData.customStartTime}${appointmentData.customEndTime ? ` - ${appointmentData.customEndTime}` : ''} (własny termin)`
                     : "Nie wybrano"
               }
             </div>
            <div>
              <span className="font-medium">Lekarz:</span> {appointmentData.selectedDoctor?.name || "Nie wybrano"}
            </div>
            <div>
              <span className="font-medium">Czas trwania:</span> {
                appointmentData.selectedSlot 
                  ? `${appointmentData.customDuration || 30} min`
                  : `${appointmentData.customDuration || appointmentData.duration || 30} min`
              }
            </div>
            {(appointmentData.customDuration || appointmentData.customStartTime || appointmentData.selectedSlot) && (
              <>
                <div>
                  <span className="font-medium">Czas zakończenia:</span> {
                    appointmentData.selectedSlot
                      ? appointmentData.selectedSlot.endTime
                      : appointmentData.customStartTime 
                        ? calculateEndTime(appointmentData.customStartTime, appointmentData.customDuration || 30)
                        : "Nie obliczono"
                  }
                </div>
                <div>
                  <span className="font-medium">Typ:</span> {appointmentData.visitType || "Standardowa"}
                </div>
              </>
            )}
            {appointmentData.selectedSlot && (
              <div className="col-span-2">
                <span className="font-medium text-green-600">✓ Użyto wybranego terminu</span>
              </div>
            )}
            {appointmentData.customStartTime && (
              <div className="col-span-2">
                <span className="font-medium text-blue-600">✓ Użyto własnego terminu</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleSubmit = () => {
    // Validate form before submission
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      // Show validation errors
      Object.values(validationErrors).forEach(error => {
        toast.error(error);
      });
      return;
    }

    if (
      (selectedPatient || isNewPatientValid) &&
      appointmentData.selectedDoctor &&
      appointmentData.selectedDate &&
      (appointmentData.customStartTime || appointmentData.selectedSlot)
    ) {
      // Determine start and end times from custom input or slot
      let startTime, endTime, duration;
      
      if (appointmentData.customStartTime && appointmentData.customStartTime.trim() !== "") {
        startTime = appointmentData.customStartTime;
        if (appointmentData.customEndTime && appointmentData.customEndTime.trim() !== "") {
          endTime = appointmentData.customEndTime;
                     // Calculate duration from custom times
           // HTML time input already provides 24-hour format
           const start = new Date(`2000-01-01T${appointmentData.customStartTime}`);
           const end = new Date(`2000-01-01T${appointmentData.customEndTime}`);
           duration = Math.round((end - start) / 60000); // Convert to minutes
        } else {
          // If only start time is provided, use custom duration or default
          duration = appointmentData.customDuration || 30;
          // Calculate end time
          const start = new Date(`2000-01-01T${startTime}`);
          const end = new Date(start.getTime() + duration * 60000);
          endTime = end.toTimeString().slice(0, 5);
        }
      } else if (appointmentData.selectedSlot) {
        // If a slot is selected, use its start time and duration
        startTime = appointmentData.selectedSlot.startTime;
        duration = appointmentData.selectedSlot.duration;
        endTime = appointmentData.selectedSlot.endTime;
      } else {
        // Fallback if no time is selected
        toast.error("Proszę wybrać termin wizyty.");
        return;
      }

      // Collect all data for backend submission using the new reception appointment API
      const appointmentSubmissionData = {
        date: appointmentData.selectedDate,
        doctorId: appointmentData.selectedDoctor._id,
        startTime: startTime,
        endTime: endTime,
        duration: duration,
        consultationType: "offline",
        message: appointmentData.notes || "",
        smsConsentAgreed: true,
        // Receptionist override capabilities
        isBackdated: appointmentData.isBackdated || false,
        customDuration: appointmentData.customDuration || null,
        overrideConflicts: appointmentData.overrideConflicts || false,
        createdBy: "receptionist", // Indicates this was created by reception/admin
        // Custom time override
        customStartTime: appointmentData.customStartTime,
        customEndTime: appointmentData.customEndTime || null,
        // Slot selection
        selectedSlot: appointmentData.selectedSlot ? {
          _id: appointmentData.selectedSlot._id,
          startTime: appointmentData.selectedSlot.startTime,
          endTime: appointmentData.selectedSlot.endTime,
          duration: appointmentData.selectedSlot.duration,
          doctorId: appointmentData.selectedSlot.doctorId,
          date: appointmentData.selectedSlot.date,
          isWalkin: appointmentData.selectedSlot.isWalkin,
          needsAttention: appointmentData.selectedSlot.needsAttention,
          markAsArrived: appointmentData.selectedSlot.markAsArrived,
          isInternational: appointmentData.selectedSlot.isInternational,
          patientSource: appointmentData.selectedSlot.patientSource,
          notes: appointmentData.selectedSlot.notes,
          enableRepeats: appointmentData.selectedSlot.enableRepeats,
          selectedServices: appointmentData.selectedSlot.services,
          newPatientFirstName: appointmentData.selectedSlot.newPatientFirstName,
          newPatientLastName: appointmentData.selectedSlot.newPatientLastName,
          newPatientEmail: appointmentData.selectedSlot.newPatientEmail,
          newPatientPhone: appointmentData.selectedSlot.newPatientPhone,
          newPatientDateOfBirth: appointmentData.selectedSlot.newPatientDateOfBirth,
          newPatientSex: appointmentData.selectedSlot.newPatientSex,
          newPatientPesel: appointmentData.selectedSlot.newPatientPesel,
          receptionistNotes: appointmentData.selectedSlot.receptionistNotes,
          overrideInfo: appointmentData.selectedSlot.overrideInfo,
          metadata: appointmentData.selectedSlot.metadata,
        } : null,
        // Metadata fields
        metadata: {
          visitType: appointmentData.visitType || "",
          isEmergency: appointmentData.isEmergency || false,
          isWalkin: appointmentData.isWalkin || false,
          needsAttention: appointmentData.needsAttention || false,
          receptionistNotes: appointmentData.receptionistNotes || "",
          overrideInfo: {
            customDuration: appointmentData.customDuration ? `${appointmentData.customDuration} minutes` : null,
            isBackdated: appointmentData.isBackdated,
            overrideConflicts: appointmentData.overrideConflicts,
            customTime: `Custom time: ${appointmentData.customStartTime} - ${appointmentData.customEndTime || 'auto-calculated'}`,
            createdBy: "receptionist"
          }
        }
      };
      
      // Add patient information based on selection type
      if (isFirstTimeVisit && isNewPatientValid) {
        // For new patients, add their details directly
        appointmentSubmissionData.firstName = appointmentData.newPatientFirstName;
        appointmentSubmissionData.lastName = appointmentData.newPatientLastName;
        appointmentSubmissionData.email = appointmentData.newPatientEmail || "";
        
        // Phone fields for backend - sending all three required fields:
        // 1. phone: full phone number (code + number) - e.g., "+48123456789"
        // 2. phoneCode: just the country code - e.g., "+48"
        // 3. mobileNumber: just the number without code - e.g., "123456789"
        appointmentSubmissionData.phone = appointmentData.newPatientPhoneCode + appointmentData.newPatientPhone;
        appointmentSubmissionData.phoneCode = appointmentData.newPatientPhoneCode;
        appointmentSubmissionData.mobileNumber = appointmentData.newPatientPhone;
        
        appointmentSubmissionData.dob = appointmentData.newPatientDateOfBirth;
        appointmentSubmissionData.sex = appointmentData.newPatientSex;
        appointmentSubmissionData.pesel = appointmentData.newPatientPesel;
      } else {
        // For existing patients, use their ID
        appointmentSubmissionData.patientId = selectedPatient._id;
      }

      // Add selected services if any
      if (appointmentData.selectedServices.length > 0) {
        appointmentSubmissionData.services = appointmentData.selectedServices.map(service => ({
          serviceId: service.id,
          quantity: service.quantity || 1,
          price: service.price
        }));
      }

      // Add additional flags
      appointmentSubmissionData.isWalkin = appointmentData.isWalkin || false;
      appointmentSubmissionData.needsAttention = appointmentData.needsAttention || false;
      appointmentSubmissionData.markAsArrived = appointmentData.markAsArrived || false;
      appointmentSubmissionData.isInternational = appointmentData.isInternational || false;
      appointmentSubmissionData.patientSource = appointmentData.patientSource || "";

      console.log("Appointment data to submit:", appointmentSubmissionData);
      console.log("Phone fields being sent to backend:", {
        phone: appointmentSubmissionData.phone,
        phoneCode: appointmentSubmissionData.phoneCode,
        mobileNumber: appointmentSubmissionData.mobileNumber
      });
      
      // Use the new reception appointment API
      onComplete(appointmentSubmissionData);
    } else {
      // Show validation message
      toast.error("Proszę uzupełnić wszystkie wymagane pola");
    }
  };

  // Calculate total price of selected services
  const calculateTotalPrice = () => {
    return appointmentData.selectedServices.reduce((total, service) => 
      total + ((parseFloat(service.price) || 0) * (service.quantity || 1)), 0);
  };

  // Helper function to convert 12-hour time to 24-hour time (for display purposes)
  const convertTo24Hour = (time) => {
    if (!time) return "";
    // HTML time input already provides 24-hour format, so just return as is
    return time;
  };

  // Helper function to calculate duration from custom start and end times
  const calculateDurationFromTime = () => {
    if (!appointmentData.customStartTime || !appointmentData.customEndTime) {
      return 0; // No custom time selected
    }
    
    // HTML time input already provides 24-hour format, so use directly
    const start = new Date(`2000-01-01T${appointmentData.customStartTime}`);
    const end = new Date(`2000-01-01T${appointmentData.customEndTime}`);
    
    const duration = Math.round((end - start) / 60000); // Convert to minutes
    
    return duration;
  };

  // Close phone dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (phoneDropdownOpen && !event.target.closest(".phone-dropdown")) {
        setPhoneDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [phoneDropdownOpen]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Dodaj wizytę</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <StepIndicator />
        
        {/* Override Capabilities Notice */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm text-blue-700">
              <strong>Funkcje Recepcjonisty:</strong> Możesz umówić wizyty w dowolnym terminie, 
              nadpisać istniejące wizyty, ustawić niestandardowy czas trwania i umówić wizyty w przeszłości.
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          {renderStepContent()}
        </div>

        <div className="flex justify-between mt-6">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Wstecz
            </button>
          )}
          
          <div className="ml-auto flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Anuluj
            </button>
            
            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceedToNextStep()}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  canProceedToNextStep()
                    ? "bg-teal-500 text-white hover:bg-teal-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Dalej
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceedToNextStep()}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
              >
                Zarezerwuj Wizytę z Nadpisaniem
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentFormModal;
