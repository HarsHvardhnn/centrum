import { useState, useEffect } from "react";
import PatientSearchField from "../../AppointmentForm/PatientSearchField"
import DoctorSelectionWithSlots from "../../admin/DoctorsAppointments";
import userServiceHelper from "../../../helpers/userServiceHelper";
import { Search, Plus, Minus, CheckCircle, ChevronRight, ChevronLeft } from "lucide-react";
import VisitReasonCascadeDropdown from "../../UtilComponents/VisitReasonCascadeDropdown";
import { useServices } from "../../../context/serviceContext.jsx";
import { toast } from "sonner";
import { apiCaller } from "../../../utils/axiosInstance";
import { normalizePesel, getPeselChecksumWarning } from "../../../utils/peselUtils";
import patientService from "../../../helpers/patientHelper";
import appointmentHelper from "../../../helpers/appointmentHelper";
import { PHONE_COUNTRY_CODES, FlagIcon } from "../../../constants/phoneCountryCodes";
import {
  isRadiologistDoctor,
  RADIOLOGIST_VISIT_TYPE_LABEL,
  getRadiologistVisitTypeFields,
} from "../../../utils/radiologistVisitHelper";

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
  doctorInfo = null, // Full doctor information object
  availableServices = [], 
  isLoadingServices = false,
  isReceptionistMode = false,
  workflowOrder = "patientFirst", // "patientFirst" or "appointmentFirst"
  allowPastDates = false, // Whether to allow selecting dates in the past
  skipDoctorSelection = false, // Whether to skip doctor selection step
  embedded = false, // When true, render as page content (no modal overlay); used on /wizyta/utworz
  /** Doctor document id: when set, doctor picker only lists this doctor (logged-in doctor on /wizyta/utworz). */
  allowedDoctorId = null,
}) {
  const { services: contextServices, loading: contextLoading } = useServices();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctorServices, setDoctorServices] = useState([]);
  const [allServices, setAllServices] = useState(availableServices || []);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingNextAvailableDate, setLoadingNextAvailableDate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    phone: ""
  });
  const [firstTimePeselExists, setFirstTimePeselExists] = useState(false);
  const [firstTimeExistingPatientData, setFirstTimeExistingPatientData] = useState(null);
  const [firstTimePeselCheckLoading, setFirstTimePeselCheckLoading] = useState(false);
  const [firstTimePeselWarningFromApi, setFirstTimePeselWarningFromApi] = useState(null);
  const [appointmentData, setAppointmentData] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    const isDefaultDateInPast = today < today; // This will always be false, but keeping for consistency
    
    // If skipDoctorSelection is true and we have doctorInfo, use it
    let selectedDoctor = null;
    if (skipDoctorSelection && doctorInfo) {
      selectedDoctor = {
        _id: doctorInfo.id || doctorInfo._id,
        name: doctorInfo.name,
        specialty: doctorInfo.specialty,
        specialization: doctorInfo.specialization,
        specializations: doctorInfo.specializations,
        profilePicture: doctorInfo.avatarUrl || doctorInfo.profilePicture
      };
    } else if (doctorId) {
      selectedDoctor = { _id: doctorId };
    }

    const radiologistInitFields =
      selectedDoctor && isRadiologistDoctor(selectedDoctor)
        ? getRadiologistVisitTypeFields()
        : {};
    
    return {
      visitType: "",
      isInternational: false,
      selectedDoctor: selectedDoctor,
      selectedDate: today,
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
      isEmergency: false,
      receptionistNotes: "",
      // Custom time override fields
      customStartTime: "",
      customEndTime: "",
      // Slot selection field
      selectedSlot: null,
      // SMS consent field - will be updated by useEffect based on date
      smsConsentAgreed: true, // Default to true, will be updated by useEffect
      persistSmsConsent: false, // Default to false - whether to save SMS consent for future appointments
      visitReason: "", // Rodzaj wizyty: displayName from dictionary (e.g. "Konsultacja pierwszorazowa")
      visitReasonCategoryId: "", // Category id for two-step dropdown
      ...radiologistInitFields,
    };
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false);
  const [visitReasonsData, setVisitReasonsData] = useState({ categories: [] });
  /** When true, hide slot list and auto-fetch; receptionist sets only date + custom time (avoids scroll/selection errors). */
  const [useCustomDateOnly, setUseCustomDateOnly] = useState(false);

  const phoneCountryCodes = PHONE_COUNTRY_CODES;

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

  // Visit reason dictionary for registration (category → type, send displayName as visitReason)
  useEffect(() => {
    let cancelled = false;
    appointmentHelper.getVisitReasons().then((res) => {
      if (cancelled) return;
      const data = res?.data ?? res;
      const categories = data?.categories ?? [];
      setVisitReasonsData({ categories: Array.isArray(categories) ? categories : [] });
    }).catch(() => {
      if (!cancelled) setVisitReasonsData({ categories: [] });
    });
    return () => { cancelled = true; };
  }, []);

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

  const handlePatientSelect = async (patient) => {
    setSelectedPatient(patient);
    
    // Fetch SMS consent status for existing patient
    if (patient && patient._id) {
      try {
        const response = await apiCaller("GET", `/api/sms-consent/${patient._id}`);
        if (response && response.data && response.data.success) {
          // Check if selected date is in the past
          const today = new Date().toISOString().split("T")[0];
          const isSelectedDateInPast = appointmentData.selectedDate < today;
          
          // If date is in past, always set SMS consent to false regardless of fetched value
          // If date is in future, use the fetched value
          setAppointmentData(prev => ({
            ...prev,
            smsConsentAgreed: isSelectedDateInPast ? false : response.data.smsConsentAgreed
          }));
        }
      } catch (error) {
        console.error("Error fetching SMS consent status:", error);
        // Check if selected date is in the past
        const today = new Date().toISOString().split("T")[0];
        const isSelectedDateInPast = appointmentData.selectedDate < today;
        
        // Default based on date: false for past dates, true for future dates
        setAppointmentData(prev => ({
          ...prev,
          smsConsentAgreed: isSelectedDateInPast ? false : true
        }));
      }
    }
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
    } else if (name === "newPatientPesel") {
      setAppointmentData(prev => ({
        ...prev,
        [name]: normalizePesel(value)
      }));
    } else if (name === "isInternational" && type === "checkbox" && checked) {
      setAppointmentData(prev => ({
        ...prev,
        isInternational: true,
        newPatientPesel: ""
      }));
      setFirstTimePeselExists(false);
      setFirstTimeExistingPatientData(null);
      setFirstTimePeselWarningFromApi(null);
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

  // When first-time visit and PESEL has 11 digits, check if patient already exists
  useEffect(() => {
    if (appointmentData.visitType !== "first-time" || appointmentData.newPatientPesel.replace(/\D/g, "").length !== 11) {
      setFirstTimePeselExists(false);
      setFirstTimeExistingPatientData(null);
      setFirstTimePeselWarningFromApi(null);
      return;
    }
    const normalized = normalizePesel(appointmentData.newPatientPesel);
    let cancelled = false;
    setFirstTimePeselCheckLoading(true);
    patientService.getPatientByPesel(normalized).then((res) => {
      if (cancelled) return;
      setFirstTimePeselExists(!!res?.exists);
      setFirstTimeExistingPatientData(res?.exists && res?.patient ? res.patient : null);
      setFirstTimePeselWarningFromApi(res?.peselWarning ?? null);
    }).catch(() => {
      if (!cancelled) setFirstTimePeselExists(false);
      if (!cancelled) setFirstTimePeselWarningFromApi(null);
    }).finally(() => {
      if (!cancelled) setFirstTimePeselCheckLoading(false);
    });
    return () => { cancelled = true; };
  }, [appointmentData.visitType, appointmentData.newPatientPesel]);

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
    
    setLoadingNextAvailableDate(true);
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
    } finally {
      setLoadingNextAvailableDate(false);
    }
  };

  // Modify the handleDoctorSelect function
  const handleDoctorSelect = (doctor) => {
    const radiologistFields = doctor && isRadiologistDoctor(doctor) ? getRadiologistVisitTypeFields() : {};
    setAppointmentData({
      ...appointmentData,
      selectedDoctor: doctor,
      selectedServices: [],
      ...radiologistFields,
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

  // Switch to "set your own date" mode: hide slot list, stop auto-fetch, use only date + custom time
  const switchToCustomDateOnly = () => {
    setUseCustomDateOnly(true);
    clearSlotSelection();
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
    const selectedDate = e.target.value;
    const today = new Date().toISOString().split("T")[0];
    const isSelectedDateInPast = selectedDate < today;
    
    setAppointmentData(prev => ({
      ...prev,
      selectedDate: selectedDate,
      // Update isBackdated based on the selected date
      isBackdated: isSelectedDateInPast,
      // Always set SMS consent to false for past dates, but allow user to manually check it
      // This overrides any previously fetched SMS consent from the API
      smsConsentAgreed: isSelectedDateInPast ? false : prev.smsConsentAgreed,
    }));
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
    if (skipDoctorSelection && doctorInfo) {
      // When skipping doctor selection, automatically set up the doctor
      const doctor = {
        _id: doctorInfo.id || doctorInfo._id,
        name: doctorInfo.name,
        specialty: doctorInfo.specialty,
        profilePicture: doctorInfo.avatarUrl || doctorInfo.profilePicture
      };
      handleDoctorSelect(doctor);
    } else if (doctorId) {
      const doctor = { _id: doctorId };
      handleDoctorSelect(doctor);
    }
  }, [doctorId, skipDoctorSelection, doctorInfo]);

  // Effect to handle SMS consent on component mount and when date changes
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const isSelectedDateInPast = appointmentData.selectedDate < today;
    
    // Always set SMS consent to false for past dates, but allow user to manually check it
    // This overrides any previously fetched SMS consent from the API
    if (isSelectedDateInPast) {
      setAppointmentData(prev => ({
        ...prev,
        smsConsentAgreed: false
      }));
    }
  }, [appointmentData.selectedDate]);

  // Effect to check initial date on component mount
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const isSelectedDateInPast = appointmentData.selectedDate < today;
    
    if (isSelectedDateInPast) {
      setAppointmentData(prev => ({
        ...prev,
        smsConsentAgreed: false
      }));
    }
  }, []); // Empty dependency array means this runs only on mount

  const isFirstTimeVisit = appointmentData.visitType === "first-time";
  const isVisitOnly = appointmentData.visitType === "visit-only";
  const isVisitOnlyValid = isVisitOnly && appointmentData.newPatientFirstName?.trim();
  const isNewPatientValid = isFirstTimeVisit && 
    appointmentData.newPatientFirstName.trim() !== "" && 
    appointmentData.newPatientSex.trim() !== "" &&
    appointmentData.newPatientPhone.trim() !== "" &&
    validatePhone(appointmentData.newPatientPhone) === "";

  // Function to map visit types to Polish
  const getVisitTypeInPolish = (visitType) => {
    const visitTypeMap = {
      "first-time": "Pierwsza wizyta",
      "re-visit": "Kolejna wizyta",
      "visit-only": "Wizyta bez pacjenta (recepcja)",
      "consultation": "Konsultacja",
      "emergency": "Nagły przypadek",
      "followup": "Wizyta kontrolna",
      "quick_check": "Szybka kontrola",
      "extended_consultation": "Rozszerzona konsultacja"
    };
    return visitTypeMap[visitType] || "Standardowa";
  };

  // Step titles by workflow (used for validation messages and step indicator)
  const getStepTitle = (step) => {
    if (workflowOrder === "appointmentFirst") {
      if (skipDoctorSelection) {
        switch (step) {
          case 1: return "Termin Wizyty";
          case 2: return "Dane Pacjenta";
          case 3: return "Usługi";
          case 4: return "Szczegóły";
          case 5: return "Opcje Recepcjonisty";
          default: return String(step);
        }
      }
      switch (step) {
        case 1: return "Lekarz i Termin";
        case 2: return "Dane Pacjenta";
        case 3: return "Usługi";
        case 4: return "Szczegóły";
        case 5: return "Opcje Recepcjonisty";
        default: return String(step);
      }
    }
    if (skipDoctorSelection) {
      switch (step) {
        case 1: return "Dane Pacjenta";
        case 2: return "Termin Wizyty";
        case 3: return "Usługi";
        case 4: return "Szczegóły";
        case 5: return "Opcje Recepcjonisty";
        default: return String(step);
      }
    }
    switch (step) {
      case 1: return "Dane Pacjenta";
      case 2: return "Lekarz i Termin";
      case 3: return "Usługi";
      case 4: return "Szczegóły";
      case 5: return "Opcje Recepcjonisty";
      default: return String(step);
    }
  };

  // Map validation error key to step number for clear error messages
  const getStepForValidationError = (errorKey) => {
    const isAppointmentFirst = workflowOrder === "appointmentFirst";
    const timeStep = isAppointmentFirst && skipDoctorSelection ? 1 : 2;
    const patientStep = isAppointmentFirst ? 2 : 1;
    const timeKeys = ["timeSelection", "customDuration", "customTime", "date"];
    if (timeKeys.includes(errorKey)) return { step: timeStep, title: getStepTitle(timeStep) };
    if (errorKey === "phone") return { step: patientStep, title: getStepTitle(patientStep) };
    return { step: null, title: "" };
  };

  const canProceedToNextStep = () => {
    if (workflowOrder === "appointmentFirst") {
      // New workflow: Appointment first, then patient
      if (skipDoctorSelection) {
        // When doctor is pre-selected, still show date/slot selection
        switch (currentStep) {
          case 1: // Date & Time Selection (doctor already selected)
            return appointmentData.selectedDate && 
                   (appointmentData.customStartTime || appointmentData.selectedSlot);
          case 2: // Patient Information
            return appointmentData.visitType && (isVisitOnly ? isVisitOnlyValid : (isFirstTimeVisit ? isNewPatientValid : selectedPatient));
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
        switch (currentStep) {
          case 1: // Doctor Selection & Date
            return appointmentData.selectedDoctor && 
                   appointmentData.selectedDate && 
                   (appointmentData.customStartTime || appointmentData.selectedSlot);
          case 2: // Patient Information
            return appointmentData.visitType && (isVisitOnly ? isVisitOnlyValid : (isFirstTimeVisit ? isNewPatientValid : selectedPatient));
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
    } else {
      // Original workflow: Patient first, then appointment
      if (skipDoctorSelection) {
        // When doctor is pre-selected, still show date/slot selection
        switch (currentStep) {
          case 1: // Patient Information (doctor already selected)
            return appointmentData.visitType && (isVisitOnly ? isVisitOnlyValid : (isFirstTimeVisit ? isNewPatientValid : selectedPatient));
          case 2: // Date & Time Selection
            return appointmentData.selectedDate && 
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
      } else {
        switch (currentStep) {
          case 1: // Patient Information
            return appointmentData.visitType && (isVisitOnly ? isVisitOnlyValid : (isFirstTimeVisit ? isNewPatientValid : selectedPatient));
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
    }
  };

  const StepIndicator = () => {
    const totalSteps = 5; // Always 5 steps now
    const stepsArray = Array.from({ length: totalSteps }, (_, i) => i + 1);

    return (
      <div className="flex items-center justify-center mb-6">
        {stepsArray.map((step) => (
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
            {step < totalSteps && (
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
      if (skipDoctorSelection) {
        // When doctor is pre-selected, still show date/slot selection
        switch (currentStep) {
          case 1:
            return renderDateSlotSelectionStep();
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
      }
    } else {
      // Original workflow: Patient first, then appointment
      if (skipDoctorSelection) {
        // When doctor is pre-selected, still show date/slot selection
        switch (currentStep) {
          case 1:
            return renderPatientInfoStep();
          case 2:
            return renderDateSlotSelectionStep();
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
    }
  };

  const renderDateSlotSelectionStep = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium mb-4">Wybór Terminu Wizyty</h3>
        
        {/* Show selected doctor info */}
        {appointmentData.selectedDoctor && (
          <div className="bg-teal-50 p-4 rounded-lg border border-teal-200 mb-4">
            <h4 className="text-md font-medium text-teal-800 mb-2">Wybrany Lekarz</h4>
            <div className="flex items-center space-x-3">
              {appointmentData.selectedDoctor.profilePicture && (
                <img
                  src={appointmentData.selectedDoctor.profilePicture}
                  alt={appointmentData.selectedDoctor.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-medium text-teal-900">{appointmentData.selectedDoctor.name}</p>
                <p className="text-sm text-teal-700">{appointmentData.selectedDoctor.specialty}</p>
              </div>
            </div>
          </div>
        )}

        {/* Date and Slot Selection - Doctor is pre-selected */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wybierz datę i termin
          </label>
          {useCustomDateOnly ? (
            <p className="text-sm text-teal-700 mb-2">
              Tryb własnej daty i godziny – ustaw datę i czas poniżej.{" "}
              <button
                type="button"
                onClick={() => setUseCustomDateOnly(false)}
                className="text-teal-600 hover:text-teal-800 underline font-medium"
              >
                Wybierz z listy terminów
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-600 mb-2">
              <button
                type="button"
                onClick={switchToCustomDateOnly}
                className="text-teal-600 hover:text-teal-800 underline font-medium"
              >
                Ustaw własną datę i godzinę
              </button>
              {" "}– bez przeglądania listy terminów
            </p>
          )}
          <DoctorSelectionWithSlots
            selectedDoctor={appointmentData.selectedDoctor}
            selectedDate={appointmentData.selectedDate}
            onDoctorSelect={handleDoctorSelect}
            onDateChange={handleDateChange}
            initialDoctorId={doctorId}
            onSlotSelect={handleSlotSelect}
            selectedPatient={selectedPatient}
            loadingNextAvailableDate={loadingNextAvailableDate}
            hideDoctorSelection={true}
            hideSlotList={useCustomDateOnly}
            allowedDoctorId={allowedDoctorId}
            enableDoctorNameSearch={false}
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

  const renderDoctorSelectionStep = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium mb-4">Wybór Lekarza i Terminu</h3>
        
        {/* Doctor Selection */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wybierz lekarza
          </label>
          {useCustomDateOnly ? (
            <p className="text-sm text-teal-700 mb-2">
              Tryb własnej daty i godziny – ustaw datę i czas poniżej.{" "}
              <button
                type="button"
                onClick={() => setUseCustomDateOnly(false)}
                className="text-teal-600 hover:text-teal-800 underline font-medium"
              >
                Wybierz z listy terminów
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-600 mb-2">
              <button
                type="button"
                onClick={switchToCustomDateOnly}
                className="text-teal-600 hover:text-teal-800 underline font-medium"
              >
                Ustaw własną datę i godzinę
              </button>
              {" "}– bez przeglądania listy terminów
            </p>
          )}
          <DoctorSelectionWithSlots
            selectedDoctor={appointmentData.selectedDoctor}
            selectedDate={appointmentData.selectedDate}
            onDoctorSelect={handleDoctorSelect}
            onDateChange={handleDateChange}
            initialDoctorId={doctorId}
            onSlotSelect={handleSlotSelect}
            selectedPatient={selectedPatient}
            loadingNextAvailableDate={loadingNextAvailableDate}
            hideSlotList={useCustomDateOnly}
            allowedDoctorId={allowedDoctorId}
            enableDoctorNameSearch={isReceptionistMode || !allowedDoctorId}
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
        
        {/* Show selected doctor info when skipDoctorSelection is true */}
        {skipDoctorSelection && appointmentData.selectedDoctor && (
          <div className="bg-teal-50 p-4 rounded-lg border border-teal-200 mb-4">
            <h4 className="text-md font-medium text-teal-800 mb-2">Wybrany Lekarz</h4>
            <div className="flex items-center space-x-3">
              {appointmentData.selectedDoctor.profilePicture && (
                <img
                  src={appointmentData.selectedDoctor.profilePicture}
                  alt={appointmentData.selectedDoctor.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-medium text-teal-900">{appointmentData.selectedDoctor.name}</p>
                <p className="text-sm text-teal-700">{appointmentData.selectedDoctor.specialty}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Visit Type Selection */}
        <div className="bg-teal-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Typ wizyty
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
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
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="visitType"
                value="visit-only"
                checked={appointmentData.visitType === "visit-only"}
                onChange={handleInputChange}
                className="h-4 w-4 text-teal-600"
              />
              <span className="ml-2">Wizyta bez pacjenta (recepcja)</span>
            </label>
          </div>

          {appointmentData.visitType === "visit-only" && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 mt-2">
              <p className="text-sm text-gray-600 mb-3">
                Wizyta bez pacjenta. Podaj imię (wymagane), nazwisko opcjonalnie. PESEL oraz pełna rejestracja pacjenta zostaną uzupełnione później poprzez „Zakończ rejestrację” z listy wizyt. Chcesz podać numer telefonu lub PESEL już teraz? Wybierz typ wizyty „Pierwsza wizyta".
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Imię*</label>
                  <input
                    type="text"
                    name="newPatientFirstName"
                    value={appointmentData.newPatientFirstName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Imię"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nazwisko (opcjonalnie)</label>
                  <input
                    type="text"
                    name="newPatientLastName"
                    value={appointmentData.newPatientLastName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Nazwisko"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {appointmentData.visitType === "re-visit" && (
          <div className="space-y-3">
            {selectedPatient && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                <p className="text-xs font-medium text-teal-700 uppercase tracking-wide mb-1">Wybrany pacjent</p>
                <p className="text-sm font-medium text-teal-900">
                  {typeof selectedPatient.name === "string"
                    ? selectedPatient.name
                    : `${selectedPatient.firstName || selectedPatient.name?.first || "—"} ${selectedPatient.lastName || selectedPatient.name?.last || ""}`.trim() || "—"}
                  {selectedPatient.govtId && (
                    <span className="text-teal-600 font-normal ml-1">(PESEL: {selectedPatient.govtId})</span>
                  )}
                </p>
                <p className="text-xs text-teal-600 mt-0.5">Możesz wyszukać i wybrać innego pacjenta poniżej.</p>
              </div>
            )}
            <PatientSearchField onPatientSelect={handlePatientSelect} />
          </div>
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
                <label className="block text-sm text-gray-600 mb-1">Nazwisko (opcjonalnie)</label>
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

            {/* PESEL (main, centered) then checkbox underneath */}
            <div className="flex flex-col items-center w-full mt-4">
              <div className="w-full max-w-sm">
                <label className="block text-sm text-gray-600 mb-1 text-center md:text-left">PESEL (11 cyfr)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  name="newPatientPesel"
                  value={appointmentData.newPatientPesel}
                  onChange={handleInputChange}
                  disabled={!!appointmentData.isInternational}
                  className="w-full p-2 border rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="11 cyfr"
                />
                {firstTimePeselCheckLoading && <p className="text-xs text-gray-500 mt-1">Sprawdzam PESEL...</p>}
                {appointmentData.newPatientPesel.length === 11 && (firstTimePeselWarningFromApi ?? getPeselChecksumWarning(appointmentData.newPatientPesel)) && (
                  <p className="mt-1 text-sm text-amber-600">{firstTimePeselWarningFromApi ?? getPeselChecksumWarning(appointmentData.newPatientPesel)}</p>
                )}
                {firstTimePeselExists && firstTimeExistingPatientData && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">Pacjent o podanym numerze PESEL już istnieje w systemie.</p>
                    <button
                      type="button"
                      onClick={() => {
                        const p = firstTimeExistingPatientData;
                        const name = p?.name || {};
                        setSelectedPatient({
                          _id: p._id,
                          patientId: p.patientId,
                          firstName: name.first ?? "",
                          lastName: name.last ?? "",
                          name: [name.first, name.last].filter(Boolean).join(" ") || "Nieznany pacjent",
                          ...p
                        });
                        setAppointmentData(prev => ({ ...prev, visitType: "re-visit" }));
                      }}
                      className="mt-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                    >
                      Załaduj dane istniejącego pacjenta
                    </button>
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-3">
                <input
                  type="checkbox"
                  name="isInternational"
                  checked={appointmentData.isInternational}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-teal-600"
                />
                <span className="text-sm text-gray-700">Nie posiadam numeru PESEL (pacjent międzynarodowy)</span>
              </label>
            </div>
          </div>
        )}
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

        {/* Rodzaj wizyty – radiologist: fixed Badanie USG; others: cascade from API */}
        {isRadiologistDoctor(appointmentData.selectedDoctor) ? (
          <div className="bg-teal-50/50 p-4 rounded-lg border border-teal-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rodzaj wizyty</label>
            <p className="text-sm font-semibold text-gray-900">{RADIOLOGIST_VISIT_TYPE_LABEL}</p>
            <p className="text-xs text-gray-500 mt-1">Dla specjalizacji radiolog — typ wizyty jest ustawiony automatycznie.</p>
          </div>
        ) : (
        visitReasonsData.categories.length > 0 && (
          <div className="bg-teal-50/50 p-4 rounded-lg border border-teal-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rodzaj wizyty (typ konsultacji)</label>
              <VisitReasonCascadeDropdown
                categories={visitReasonsData.categories}
                value={appointmentData.visitReason}
                onChange={(displayName) => {
                  const cat = visitReasonsData.categories.find((c) =>
                    (c.types || []).some((t) => t.displayName === displayName)
                  );
                  setAppointmentData((prev) => ({
                    ...prev,
                    visitReason: displayName,
                    visitReasonCategoryId: cat?.id ?? prev.visitReasonCategoryId,
                  }));
                }}
                placeholder="Wybierz rodzaj wizyty..."
              />
            </div>
            <div className="md:w-56 flex-shrink-0">
              {(!appointmentData.selectedSlot && (appointmentData.customStartTime || appointmentData.customEndTime)) ? (
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
                    {appointmentData.customStartTime && appointmentData.customEndTime
                      ? "Możesz zmienić automatycznie obliczony czas trwania"
                      : "1–480 minut (1–8 h). Ustaw czas rozpoczęcia i zakończenia w kroku terminu, aby obliczyć automatycznie."}
                  </p>
                  {appointmentData.customDuration && validateCustomDuration(appointmentData.customDuration) && (
                    <p className="text-red-500 text-xs mt-1">
                      {validateCustomDuration(appointmentData.customDuration)}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-xs font-medium text-gray-500 mb-1 text-right md:text-left">
                    Czas trwania wizyty
                  </p>
                  <div className="inline-flex items-center justify-center md:justify-start w-full px-3 py-2 rounded-lg bg-white border border-teal-100 text-sm font-semibold text-teal-700">
                    {appointmentData.customDuration || appointmentData.duration || 30} min
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        
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
    const hasTimeRange = appointmentData.selectedSlot
      ? (appointmentData.selectedSlot.startTime && appointmentData.selectedSlot.endTime)
      : (appointmentData.customStartTime && appointmentData.customEndTime);
    const timeRangeLabel = appointmentData.selectedSlot
      ? `${appointmentData.selectedSlot.startTime} – ${appointmentData.selectedSlot.endTime}`
      : appointmentData.customStartTime && appointmentData.customEndTime
        ? `${appointmentData.customStartTime} – ${appointmentData.customEndTime}`
        : null;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium mb-4">Opcje Recepcjonisty</h3>

        {/* Appointment time: show range when we have one (slot or custom start+end); otherwise blank and use duration */}
        {/*
          Hide duplicate "Termin wizyty" summary on step 5.
          The real time editor/summary already appears below in "Termin wizyty i czas trwania".
        */}
        {false && (appointmentData.selectedSlot || appointmentData.customStartTime || appointmentData.customEndTime) && (
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-800">
              <strong>Termin wizyty:</strong>{" "}
              {hasTimeRange ? timeRangeLabel : "— (wybierz czas trwania poniżej)"}
            </p>
          </div>
        )}

        {/* Hidden: Appointment time & duration duplicate on step 5 */}
        {false && !appointmentData.selectedSlot && (appointmentData.customStartTime || appointmentData.customEndTime) && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-md font-medium text-blue-800 mb-3">Termin wizyty i czas trwania</h4>

            {/* Show time range only when both start and end are set; otherwise leave blank and use duration */}
            {appointmentData.customStartTime && appointmentData.customEndTime ? (
              <>
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Termin wizyty:</strong> {appointmentData.customStartTime} – {appointmentData.customEndTime}
                </p>
                <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>✓ Automatycznie obliczony czas trwania:</strong> {appointmentData.customDuration || 0} minut
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Na podstawie wybranego czasu: {appointmentData.customStartTime} – {appointmentData.customEndTime}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-blue-800 mb-3">
                <strong>Termin wizyty:</strong> — (podaj czas trwania poniżej)
              </p>
            )}

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
                  {appointmentData.customStartTime && appointmentData.customEndTime
                    ? "Możesz zmienić automatycznie obliczony czas trwania"
                    : "1–480 minut (1–8 h). Ustaw czas rozpoczęcia i zakończenia w kroku terminu, aby obliczyć automatycznie."}
                </p>
                {appointmentData.customDuration && validateCustomDuration(appointmentData.customDuration) && (
                  <p className="text-red-500 text-xs mt-1">
                    {validateCustomDuration(appointmentData.customDuration)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

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

      {/*
      // Receptionist Notes (hidden as per request)
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
      */}

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

        {/* SMS Consent - only show when patient was added (option 1 or 2) AND we have a phone number; hide for visit-only (option 3) or when no phone */}
        {(() => {
          const hasPatientPhone = (() => {
            if (isVisitOnly) return false;
            if (isFirstTimeVisit) {
              const p = appointmentData.newPatientPhone ?? "";
              const s = String(p).trim();
              return s.length > 0 && !/_no_phone_/i.test(s);
            }
            if (selectedPatient) {
              const raw = selectedPatient.phone ?? selectedPatient.phoneNumber ?? "";
              const s = String(raw).trim();
              return s.length > 0 && !/_no_phone_/i.test(s);
            }
            return false;
          })();
          return !isVisitOnly && hasPatientPhone;
        })() && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-md font-medium text-blue-800 mb-3">Zgoda na SMS</h4>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="smsConsentAgreed"
                checked={appointmentData.smsConsentAgreed}
                onChange={(e) => setAppointmentData(prev => ({ ...prev, smsConsentAgreed: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="smsConsentAgreed" className="text-sm font-medium text-blue-800">
                Pacjent wyraża zgodę na otrzymywanie powiadomień SMS o wizytach
              </label>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Zgoda na SMS pozwala na automatyczne wysyłanie przypomnień o wizytach i ważnych informacji.
            </p>
            {(() => {
              const today = new Date().toISOString().split("T")[0];
              const isSelectedDateInPast = appointmentData.selectedDate < today;
              
              if (isSelectedDateInPast) {
                return (
                  <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
                    <p className="text-xs text-yellow-800">
                      <strong>Uwaga:</strong> Wybrana data jest w przeszłości. Zgoda na SMS została automatycznie odznaczona, 
                      ale możesz ją zaznaczyć jeśli chcesz wysłać SMS dla tej wizyty.
                    </p>
                  </div>
                );
              }
              return null;
            })()}
            
            {/* Persist SMS Consent Checkbox - only show if smsConsentAgreed is true */}
            {appointmentData.smsConsentAgreed && (
              <div className="mt-4 pt-4 border-t border-blue-300">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="persistSmsConsent"
                    checked={appointmentData.persistSmsConsent}
                    onChange={(e) => setAppointmentData(prev => ({ ...prev, persistSmsConsent: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="persistSmsConsent" className="text-sm font-medium text-blue-800">
                    Jeśli nie chcesz wysyłać SMS i e-maili dla tej wizyty, zaznacz to pole
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Current Appointment Summary */}
        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
          <h4 className="text-md font-medium text-teal-800 mb-3" onClick={()=>{console.log("Podsumowanie Wizyty",appointmentData.selectedSlot ,appointmentData.customStartTime,appointmentData.customEndTime ,appointmentData.customDuration)}}>Podsumowanie Wizyty</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Pacjent:</span> {
                (isFirstTimeVisit && isNewPatientValid) || (isVisitOnly && isVisitOnlyValid)
                  ? `${appointmentData.newPatientFirstName} ${appointmentData.newPatientLastName}`
                  : selectedPatient
                    ? `${selectedPatient.firstName || selectedPatient.name || "N/A"} ${selectedPatient.lastName || ""}`
                    : "Nie wybrano"
              }
            </div>
            <div>
              <span className="font-medium">Data:</span> {appointmentData.selectedDate}
            </div>
            <div>
              <span className="font-medium">Czas:</span> {
                appointmentData.selectedSlot 
                  ? `${appointmentData.selectedSlot.startTime} – ${appointmentData.selectedSlot.endTime} (wybrany termin)`
                  : appointmentData.customStartTime && appointmentData.customEndTime 
                    ? `${appointmentData.customStartTime} – ${appointmentData.customEndTime} (własny termin)`
                    : appointmentData.customStartTime && appointmentData.customDuration
                      ? `${appointmentData.customStartTime} – ${
                          calculateEndTime(
                            appointmentData.customStartTime,
                            appointmentData.customDuration
                          ) || "—"
                        } (własny termin)`
                      : appointmentData.customStartTime
                        ? "— (podaj czas trwania)"
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
            {!isVisitOnly && (
              <div>
                <span className="font-medium">Zgoda na SMS:</span>{" "}
                {(() => {
                  const hasPhone = isFirstTimeVisit
                    ? (String(appointmentData.newPatientPhone ?? "").trim().length > 0 && !/_no_phone_/i.test(String(appointmentData.newPatientPhone ?? "")))
                    : selectedPatient
                      ? (String(selectedPatient.phone ?? selectedPatient.phoneNumber ?? "").trim().length > 0 && !/_no_phone_/i.test(String(selectedPatient.phone ?? selectedPatient.phoneNumber ?? "")))
                      : false;
                  return hasPhone ? (appointmentData.smsConsentAgreed ? "✓ Tak" : "✗ Nie") : "Nie dotyczy (brak numeru telefonu)";
                })()}
              </div>
            )}
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
                  <span className="font-medium">Typ:</span> {getVisitTypeInPolish(appointmentData.visitType)}
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
      let firstErrorStep = null;
      Object.entries(validationErrors).forEach(([key, message]) => {
        const { step, title } = getStepForValidationError(key);
        const prefix = step && title ? `Krok ${step} (${title}): ` : "";
        toast.error(prefix + message);
        if (firstErrorStep == null && step != null) firstErrorStep = step;
      });
      if (firstErrorStep != null) setCurrentStep(firstErrorStep);
      return;
    }

    if (
      (selectedPatient || isNewPatientValid || isVisitOnly) &&
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

      // Only send SMS consent when we have a phone number (no point for visit-only or when phone not provided)
      const hasPatientPhoneForSubmit = (() => {
        if (appointmentData.visitType === "visit-only") return false;
        if (appointmentData.visitType === "first-time") {
          const p = appointmentData.newPatientPhone ?? "";
          const s = String(p).trim();
          return s.length > 0 && !/_no_phone_/i.test(s);
        }
        if (selectedPatient) {
          const raw = selectedPatient.phone ?? selectedPatient.phoneNumber ?? "";
          const s = String(raw).trim();
          return s.length > 0 && !/_no_phone_/i.test(s);
        }
        return false;
      })();

      // Collect all data for backend submission using the new reception appointment API
      const appointmentSubmissionData = {
        date: appointmentData.selectedDate,
        doctorId: appointmentData.selectedDoctor._id,
        startTime: startTime,
        endTime: endTime,
        duration: duration,
        consultationType: "offline",
        ...(isRadiologistDoctor(appointmentData.selectedDoctor)
          ? getRadiologistVisitTypeFields()
          : appointmentData.visitReason && { visitReason: appointmentData.visitReason }),
        message: appointmentData.notes || "",
        smsConsentAgreed: hasPatientPhoneForSubmit ? appointmentData.smsConsentAgreed : false,
        persistSmsConsent: appointmentData.persistSmsConsent || false,
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
          visitType: isRadiologistDoctor(appointmentData.selectedDoctor)
            ? RADIOLOGIST_VISIT_TYPE_LABEL
            : appointmentData.visitType || "",
          ...(isRadiologistDoctor(appointmentData.selectedDoctor)
            ? getRadiologistVisitTypeFields()
            : appointmentData.visitReason && { visitReason: appointmentData.visitReason }),
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
      
      // Add patient information based on selection type (visit-only = first/last name + optional PESEL)
      if (isVisitOnly) {
        appointmentSubmissionData.firstName = appointmentData.newPatientFirstName?.trim() || "";
        appointmentSubmissionData.lastName = appointmentData.newPatientLastName?.trim() || "";
      } else if (isFirstTimeVisit && isNewPatientValid) {
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
      } else if (selectedPatient) {
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

      console.log("Appointment data to submit:", appointmentSubmissionData);
      console.log("Phone fields being sent to backend:", {
        phone: appointmentSubmissionData.phone,
        phoneCode: appointmentSubmissionData.phoneCode,
        mobileNumber: appointmentSubmissionData.mobileNumber
      });
      
      // Use the new reception appointment API
      onComplete(appointmentSubmissionData);
    } else {
      // Build specific missing-field messages with step info
      const isAppointmentFirst = workflowOrder === "appointmentFirst";
      const timeStep = isAppointmentFirst && skipDoctorSelection ? 1 : 2;
      const patientStep = isAppointmentFirst ? 2 : 1;
      const timeTitle = getStepTitle(timeStep);
      const patientTitle = getStepTitle(patientStep);
      const missing = [];

      if (!skipDoctorSelection && !appointmentData.selectedDoctor) missing.push({ step: timeStep, title: timeTitle, message: "Wybierz lekarza" });
      if (!appointmentData.selectedDate) missing.push({ step: timeStep, title: timeTitle, message: "Wybierz datę wizyty" });
      if (!appointmentData.customStartTime && !appointmentData.selectedSlot) missing.push({ step: timeStep, title: timeTitle, message: "Wybierz termin wizyty (godzinę lub slot)" });

      const hasPatient = selectedPatient || isNewPatientValid || isVisitOnly;
      if (!hasPatient) {
        if (!appointmentData.visitType) missing.push({ step: patientStep, title: patientTitle, message: "Wybierz typ wizyty" });
        else if (isVisitOnly && !isVisitOnlyValid) missing.push({ step: patientStep, title: patientTitle, message: "Uzupełnij imię i nazwisko (wizyta bez pacjenta)" });
        else if (isFirstTimeVisit && !isNewPatientValid) {
          if (!appointmentData.newPatientFirstName?.trim()) missing.push({ step: patientStep, title: patientTitle, message: "Imię jest wymagane" });
          if (!appointmentData.newPatientLastName?.trim()) missing.push({ step: patientStep, title: patientTitle, message: "Nazwisko jest wymagane" });
          if (!appointmentData.newPatientSex?.trim()) missing.push({ step: patientStep, title: patientTitle, message: "Płeć jest wymagana" });
          if (!appointmentData.newPatientPhone?.trim()) missing.push({ step: patientStep, title: patientTitle, message: "Numer telefonu jest wymagany" });
          else {
            const phoneErr = validatePhone(appointmentData.newPatientPhone);
            if (phoneErr) missing.push({ step: patientStep, title: patientTitle, message: phoneErr });
          }
        } else if (!isFirstTimeVisit && !isVisitOnly) missing.push({ step: patientStep, title: patientTitle, message: "Wybierz pacjenta z listy" });
      }

      if (missing.length === 0) missing.push({ step: 1, title: getStepTitle(1), message: "Proszę uzupełnić wszystkie wymagane pola" });
      missing.forEach(({ step, title, message }) => toast.error(`Krok ${step} (${title}): ${message}`));
      const firstStep = missing[0]?.step;
      if (firstStep != null) setCurrentStep(firstStep);
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

  const content = (
    <div className={embedded ? "bg-white rounded-lg p-6 w-full shadow-sm" : "bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Dodaj wizytę</h2>
        {embedded ? (
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            Wstecz
          </button>
        ) : (
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
        )}
      </div>

        <StepIndicator />
        
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
                Zarezerwuj Wizytę
              </button>
            )}
          </div>
        </div>
    </div>
  );

  return embedded ? content : (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {content}
    </div>
  );
}

export default AppointmentFormModal;
