import { useState, useEffect } from "react";
import PatientSearchField from "../AppointmentForm/PatientSearchField";
import DoctorSelectionWithSlots from "./DoctorsAppointments";
import userServiceHelper from "../../helpers/userServiceHelper";
import appointmentHelper from "../../helpers/appointmentHelper";
import patientService from "../../helpers/patientHelper";
import { Search, Plus, Minus, CheckCircle, ChevronRight, ChevronLeft, Clock, Calendar, AlertTriangle } from "lucide-react";
import { useServices } from "../../context/serviceContext.jsx";
import { toast } from "sonner";
import { apiCaller } from "../../utils/axiosInstance";
import { normalizePesel, getPeselChecksumWarning } from "../../utils/peselUtils";

function ReceptionAppointmentForm({ onClose, onComplete, doctorId, availableServices = [], isLoadingServices = false }) {
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
    visitType: "",
    isInternational: false,
    selectedDoctor: doctorId ? { _id: doctorId } : null,
    selectedSlot: null,
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
    newPatientDateOfBirth: "",
    newPatientSex: "",
    newPatientPesel: "",
    // Enhanced fields for reception appointments
    customDuration: null,
    isBackdated: false,
    duration: 30,
    overrideValidation: false, // Allow override of normal validation
    urgentAppointment: false,
    customStartTime: "",
    customEndTime: "",
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  // Visit-only flow: after first-time visit is created, show Complete registration
  const [createdVisitId, setCreatedVisitId] = useState(null);
  const [completeRegPesel, setCompleteRegPesel] = useState("");
  const [peselExists, setPeselExists] = useState(false);
  const [existingPatientData, setExistingPatientData] = useState(null);
  const [peselWarningFromApi, setPeselWarningFromApi] = useState(null);
  const [completeRegLoading, setCompleteRegLoading] = useState(false);
  const [peselCheckLoading, setPeselCheckLoading] = useState(false);

  // Update allServices when availableServices changes or use context services as fallback
  useEffect(() => {
    if (availableServices && availableServices.length > 0) {
      setAllServices(availableServices);
    } else if (contextServices && contextServices.length > 0) {
      setAllServices(contextServices);
    }
    
    setLoadingServices(isLoadingServices || contextLoading);
  }, [availableServices, contextServices, isLoadingServices, contextLoading]);

  // When 11 digits in Complete registration PESEL, check if patient exists
  useEffect(() => {
    if (!createdVisitId || completeRegPesel.replace(/\D/g, "").length !== 11) {
      setPeselExists(false);
      setExistingPatientData(null);
      setPeselWarningFromApi(null);
      return;
    }
    const normalized = normalizePesel(completeRegPesel);
    let cancelled = false;
    setPeselCheckLoading(true);
    patientService.getPatientByPesel(normalized).then((res) => {
      if (cancelled) return;
      setPeselExists(!!res?.exists);
      setExistingPatientData(res?.exists && res?.patient ? res.patient : null);
      setPeselWarningFromApi(res?.peselWarning ?? null);
    }).catch(() => {
      if (!cancelled) setPeselExists(false);
      if (!cancelled) setPeselWarningFromApi(null);
    }).finally(() => {
      if (!cancelled) setPeselCheckLoading(false);
    });
    return () => { cancelled = true; };
  }, [createdVisitId, completeRegPesel]);

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  // Email validation function
  const validateEmail = (email) => {
    if (!email) return "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? "" : "Nieprawidłowy format adresu email";
  };

  // Phone validation function
  const validatePhone = (phone) => {
    if (!phone) return ""; // Empty is allowed
    const phoneRegex = /^\d{9}$/;
    return phoneRegex.test(phone) ? "" : "Numer telefonu musi mieć dokładnie 9 cyfr";
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "newPatientPhone") {
      const numbersOnly = value.replace(/\D/g, "").slice(0, 9);
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
      const digitsOnly = normalizePesel(value);
      setAppointmentData(prev => ({
        ...prev,
        [name]: digitsOnly
      }));
    } else {
      setAppointmentData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
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

  // Fetch next available date
  const fetchNextAvailableDate = async (doctorId) => {
    if (!doctorId) return;
    
    try {
      const response = await apiCaller(
        "GET",
        `docs/schedule/next-available/${doctorId}`
      );

      if (response.data.success) {
        if (response.data.data) {
          setAppointmentData(prev => ({
            ...prev,
            selectedDate: response.data.data.nextAvailableDate,
          }));
          setAvailableSlots(response.data.data.availableSlots || []);
        } else {
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

  const handleDoctorSelect = (doctor) => {
    setAppointmentData({
      ...appointmentData,
      selectedDoctor: doctor,
      selectedServices: [],
      selectedSlot: null,
    });
    
    if (doctor && doctor._id) {
      fetchDoctorServices(doctor._id);
      fetchNextAvailableDate(doctor._id);
    } else {
      setDoctorServices([]);
      setAvailableSlots([]);
    }
  };

  // Handle selecting/deselecting services
  const handleServiceToggle = (service) => {
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
        currentServices.push(normalizedService);
      } else {
        currentServices.splice(index, 1);
      }
      
      return {
        ...prevData,
        selectedServices: currentServices
      };
    });
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

  const handleSlotSelect = (slot) => {
    setAppointmentData({
      ...appointmentData,
      selectedSlot: slot,
    });
  };

  const handleDateChange = (e) => {
    setAppointmentData({
      ...appointmentData,
      selectedDate: e.target.value,
      selectedSlot: null,
    });
  };

  // Filter services based on search term
  const filteredServices = searchTerm 
    ? allServices.filter(service => 
        service.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : allServices;

  // Initialize doctor selection
  useEffect(() => {
    if (doctorId) {
      const doctor = { _id: doctorId };
      handleDoctorSelect(doctor);
    }
  }, [doctorId]);

  const isFirstTimeVisit = appointmentData.visitType === "first-time";
  const isVisitOnly = appointmentData.visitType === "visit-only";
  // First submit (visit only): only first name + last name required; PESEL is collected in Complete registration
  const isNewPatientValidForVisitOnly = isFirstTimeVisit &&
    appointmentData.newPatientFirstName.trim() !== "" &&
    appointmentData.newPatientLastName.trim() !== "";
  // Legacy: full validation when not using visit-only flow (re-visit uses selectedPatient)
  const isNewPatientValid = isFirstTimeVisit &&
    appointmentData.newPatientFirstName.trim() !== "" &&
    appointmentData.newPatientLastName.trim() !== "" &&
    appointmentData.newPatientPesel.trim() !== "" &&
    appointmentData.newPatientSex.trim() !== "";

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        if (isVisitOnly) return true;
        return appointmentData.visitType && (isFirstTimeVisit ? isNewPatientValidForVisitOnly : selectedPatient);
      case 2:
        return appointmentData.selectedDoctor && appointmentData.selectedDate && 
               (appointmentData.selectedSlot || appointmentData.overrideValidation);
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === step
                ? "bg-teal-500 text-white"
                : currentStep > step
                ? "bg-teal-200 text-teal-700"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {step}
          </div>
          {step < 4 && (
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Informacje o Pacjencie</h3>
            
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
                    Utwórz wizytę bez pacjenta. Podaj imię i nazwisko. PESEL i pełna rejestracja pacjenta — później przez „Zakończ rejestrację” z listy wizyt.
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
                      <label className="block text-sm text-gray-600 mb-1">Nazwisko*</label>
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
                    <label className="block text-sm text-gray-600 mb-1">Telefon</label>
                    <input
                      type="tel"
                      name="newPatientPhone"
                      value={appointmentData.newPatientPhone}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-lg ${validationErrors.phone ? 'border-red-500' : ''}`}
                      placeholder="Opcjonalny - 9 cyfr"
                    />
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
                    <label className="block text-sm text-gray-600 mb-1">Płeć</label>
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
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Wybór Lekarza i Terminu</h3>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wybierz lekarza
              </label>
              <DoctorSelectionWithSlots
                selectedDoctor={appointmentData.selectedDoctor}
                selectedDate={appointmentData.selectedDate}
                selectedSlot={appointmentData.selectedSlot}
                onDoctorSelect={handleDoctorSelect}
                onDateChange={handleDateChange}
                onSlotSelect={handleSlotSelect}
                initialDoctorId={doctorId}
              />
            </div>

            {/* Override options for reception */}
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-800 mb-3 flex items-center">
                <AlertTriangle size={16} className="mr-2" />
                Opcje nadpisania (Recepcja)
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="overrideValidation"
                    checked={appointmentData.overrideValidation}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-600"
                  />
                  <span className="ml-2 text-sm">Nadpisz walidację terminów</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="urgentAppointment"
                    checked={appointmentData.urgentAppointment}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-600"
                  />
                  <span className="ml-2 text-sm">Wizyta pilna</span>
                </label>
              </div>

              {appointmentData.overrideValidation && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Niestandardowy czas rozpoczęcia
                    </label>
                    <input
                      type="time"
                      name="customStartTime"
                      value={appointmentData.customStartTime}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Niestandardowy czas zakończenia
                    </label>
                    <input
                      type="time"
                      name="customEndTime"
                      value={appointmentData.customEndTime}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

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
                    min={appointmentData.isBackdated ? undefined : new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Wybór Usług</h3>
            
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
                                onChange={() => {}}
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
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Dodatkowe Informacje</h3>
            
            <div className="bg-teal-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="markAsArrived"
                    checked={appointmentData.markAsArrived}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-teal-600"
                  />
                  <span className="ml-2 text-sm">Oznacz jako przybyły</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="isWalkin"
                    checked={appointmentData.isWalkin}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-teal-600"
                  />
                  <span className="ml-2 text-sm">Bez rejestracji</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="needsAttention"
                    checked={appointmentData.needsAttention}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-teal-600"
                  />
                  <span className="ml-2 text-sm">Wymaga uwagi</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Czas trwania wizyty (minuty)
                  </label>
                  <select
                    name="duration"
                    value={appointmentData.duration}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value={15}>15 minut</option>
                    <option value={30}>30 minut</option>
                    <option value={45}>45 minut</option>
                    <option value={60}>1 godzina</option>
                    <option value={90}>1.5 godziny</option>
                    <option value={120}>2 godziny</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Czas trwania niestandardowy (minuty)
                  </label>
                  <input
                    type="number"
                    name="customDuration"
                    value={appointmentData.customDuration || ""}
                    onChange={handleInputChange}
                    placeholder="Wprowadź niestandardowy czas"
                    min="1"
                    max="480"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pozostaw puste, aby użyć standardowego czasu
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="isBackdated"
                    checked={appointmentData.isBackdated}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-teal-600"
                  />
                  <span className="ml-2 text-sm">Wizyta z datą wsteczną</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Zaznacz, jeśli wizyta miała miejsce w przeszłości
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Notatki do wizyty</label>
                <textarea
                  name="notes"
                  value={appointmentData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2 border rounded-lg"
                  placeholder="Opcjonalne notatki..."
                />
              </div>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="enableRepeats"
                  checked={appointmentData.enableRepeats}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-teal-600"
                />
                <span className="ml-2 text-sm">Włącz powtarzanie dla pacjenta</span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleLoadExistingPatient = () => {
    if (!existingPatientData) return;
    const name = existingPatientData.name || {};
    const first = name.first ?? "";
    const last = name.last ?? "";
    setAppointmentData(prev => ({
      ...prev,
      newPatientFirstName: first,
      newPatientLastName: last,
      newPatientEmail: existingPatientData.email ?? prev.newPatientEmail,
      newPatientPhone: (existingPatientData.phone || "").replace(/\D/g, "").slice(0, 9),
      newPatientDateOfBirth: existingPatientData.dateOfBirth ?? prev.newPatientDateOfBirth,
      newPatientSex: existingPatientData.sex ?? prev.newPatientSex
    }));
    toast.info("Dane istniejącego pacjenta załadowane. Kliknij „Zakończ rejestrację”, aby przypisać wizytę.");
  };

  const handleCompleteRegistration = async () => {
    const normalizedPesel = normalizePesel(completeRegPesel);
    if (normalizedPesel.length !== 11) {
      toast.error("Wprowadź prawidłowy numer PESEL (11 cyfr).");
      return;
    }
    setCompleteRegLoading(true);
    try {
      const payload = {
        pesel: normalizedPesel,
        firstName: appointmentData.newPatientFirstName?.trim() || "",
        lastName: appointmentData.newPatientLastName?.trim() || "",
        dateOfBirth: appointmentData.newPatientDateOfBirth || undefined,
        phone: appointmentData.newPatientPhone ? (appointmentData.newPatientPhone.length === 9 ? "+48" + appointmentData.newPatientPhone : appointmentData.newPatientPhone) : undefined,
        email: appointmentData.newPatientEmail?.trim() || undefined,
        sex: appointmentData.newPatientSex || undefined,
        smsConsentAgreed: true,
        consents: []
      };
      const response = await appointmentHelper.completeRegistration(createdVisitId, payload);
      if (response?.peselWarning) {
        toast.warning(response.peselWarning);
      }
      toast.success("Rejestracja zakończona. Identyfikator pacjenta został utworzony.");
      onComplete && onComplete(response);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Nie udało się zakończyć rejestracji.";
      toast.error(msg);
    } finally {
      setCompleteRegLoading(false);
    }
  };

  const handleSubmit = async () => {
    const isVisitOnlyValid = isVisitOnly && (appointmentData.newPatientFirstName?.trim() && appointmentData.newPatientLastName?.trim());
    const canSubmitVisit = isVisitOnlyValid || selectedPatient || (isFirstTimeVisit ? isNewPatientValidForVisitOnly : false);
    if (
      canSubmitVisit &&
      appointmentData.selectedDoctor &&
      (appointmentData.selectedSlot || appointmentData.overrideValidation)
    ) {
      try {
        // Prepare appointment data for reception API
        const appointmentSubmissionData = {
          date: appointmentData.selectedDate,
          doctorId: appointmentData.selectedDoctor._id,
          startTime: appointmentData.overrideValidation && appointmentData.customStartTime 
            ? appointmentData.customStartTime 
            : appointmentData.selectedSlot?.startTime,
          endTime: appointmentData.overrideValidation && appointmentData.customEndTime 
            ? appointmentData.customEndTime 
            : appointmentData.selectedSlot?.endTime,
          duration: appointmentData.customDuration || appointmentData.duration,
          consultationType: "offline",
          message: appointmentData.notes || "",
          smsConsentAgreed: true,
          isBackdated: appointmentData.isBackdated || false,
          customDuration: appointmentData.customDuration || null,
          createdBy: "receptionist",
          overrideValidation: appointmentData.overrideValidation || false,
          urgentAppointment: appointmentData.urgentAppointment || false
        };
        
        // Add patient information: visit-only = first/last name (+ optional PESEL); first-time = visit only; re-visit = link patient
        if (isVisitOnly) {
          appointmentSubmissionData.firstName = appointmentData.newPatientFirstName?.trim() || "";
          appointmentSubmissionData.lastName = appointmentData.newPatientLastName?.trim() || "";
        } else if (isFirstTimeVisit && isNewPatientValidForVisitOnly) {
          appointmentSubmissionData.firstName = appointmentData.newPatientFirstName;
          appointmentSubmissionData.lastName = appointmentData.newPatientLastName;
          appointmentSubmissionData.email = appointmentData.newPatientEmail || "";
          appointmentSubmissionData.phone = appointmentData.newPatientPhone || "";
          appointmentSubmissionData.dob = appointmentData.newPatientDateOfBirth || undefined;
          appointmentSubmissionData.sex = appointmentData.newPatientSex || undefined;
          // Do NOT send patientId or pesel; backend creates visit only; PATIENT_ID after complete-registration
        } else if (!isFirstTimeVisit && selectedPatient) {
          appointmentSubmissionData.patientId = selectedPatient._id;
        }

        // Add selected services
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

        console.log("Reception appointment data to submit:", appointmentSubmissionData);
        
        // Use the reception appointment API
        const response = await appointmentHelper.createReceptionAppointment(appointmentSubmissionData);
        
        if (response.success) {
          const appointment = response.data?.appointment ?? response.data;
          const visitId = appointment?._id ?? appointment?.id;
          if ((isFirstTimeVisit || isVisitOnly) && visitId) {
            toast.success(isVisitOnly ? "Wizyta utworzona. Wprowadź PESEL i dane pacjenta, aby zakończyć rejestrację." : "Wizyta utworzona. Zakończ rejestrację pacjenta (PESEL).");
            setCreatedVisitId(visitId);
            setCompleteRegPesel("");
            setPeselExists(false);
            setExistingPatientData(null);
          } else {
            toast.success("Wizyta została utworzona pomyślnie!");
            onComplete && onComplete(response.data);
            onClose();
          }
        } else {
          toast.error(response.message || "Nie udało się utworzyć wizyty");
        }
      } catch (error) {
        console.error("Error creating reception appointment:", error);
        toast.error("Wystąpił błąd podczas tworzenia wizyty");
      }
    } else {
      toast.error("Proszę uzupełnić wszystkie wymagane pola");
    }
  };

  // Calculate total price of selected services
  const calculateTotalPrice = () => {
    return appointmentData.selectedServices.reduce((total, service) => 
      total + ((parseFloat(service.price) || 0) * (service.quantity || 1)), 0);
  };

  // Complete registration view (after visit-only created for first-time)
  if (createdVisitId) {
    const completeRegPeselNormalized = normalizePesel(completeRegPesel);
    const canComplete = completeRegPeselNormalized.length === 11 &&
      appointmentData.newPatientFirstName?.trim() &&
      appointmentData.newPatientLastName?.trim() &&
      appointmentData.newPatientSex?.trim();
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Zakończ rejestrację pacjenta</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">Wprowadź PESEL i dane pacjenta. Identyfikator pacjenta zostanie utworzony po zatwierdzeniu.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PESEL <span className="text-red-500">*</span></label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                value={completeRegPesel}
                onChange={(e) => setCompleteRegPesel(normalizePesel(e.target.value))}
                placeholder="11 cyfr"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              {peselCheckLoading && <p className="text-xs text-gray-500 mt-1">Sprawdzam PESEL...</p>}
              {completeRegPesel.length === 11 && (peselWarningFromApi ?? getPeselChecksumWarning(completeRegPesel)) && (
                <p className="mt-1 text-sm text-amber-600">{peselWarningFromApi ?? getPeselChecksumWarning(completeRegPesel)}</p>
              )}
              {peselExists && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">Pacjent o podanym numerze PESEL już istnieje w systemie.</p>
                  <button
                    type="button"
                    onClick={handleLoadExistingPatient}
                    className="mt-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    Załaduj dane istniejącego pacjenta
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Imię*</label>
                <input type="text" value={appointmentData.newPatientFirstName} onChange={(e) => setAppointmentData(prev => ({ ...prev, newPatientFirstName: e.target.value }))} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nazwisko*</label>
                <input type="text" value={appointmentData.newPatientLastName} onChange={(e) => setAppointmentData(prev => ({ ...prev, newPatientLastName: e.target.value }))} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Data urodzenia</label>
                <input type="date" value={appointmentData.newPatientDateOfBirth} onChange={(e) => setAppointmentData(prev => ({ ...prev, newPatientDateOfBirth: e.target.value }))} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Płeć*</label>
                <select value={appointmentData.newPatientSex} onChange={(e) => setAppointmentData(prev => ({ ...prev, newPatientSex: e.target.value }))} className="w-full p-2 border rounded-lg">
                  <option value="">Wybierz płeć</option>
                  <option value="Male">Mężczyzna</option>
                  <option value="Female">Kobieta</option>
                  <option value="Others">Inna</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Telefon</label>
                <input type="tel" value={appointmentData.newPatientPhone} onChange={(e) => setAppointmentData(prev => ({ ...prev, newPatientPhone: e.target.value.replace(/\D/g, "").slice(0, 9) }))} placeholder="9 cyfr" className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input type="email" value={appointmentData.newPatientEmail} onChange={(e) => setAppointmentData(prev => ({ ...prev, newPatientEmail: e.target.value }))} className="w-full p-2 border rounded-lg" />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Anuluj</button>
              <button type="button" onClick={handleCompleteRegistration} disabled={!canComplete || completeRegLoading} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {completeRegLoading ? "Zapisywanie..." : "Zakończ rejestrację"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Clock size={20} className="mr-2" />
            Utwórz Wizytę (Recepcja)
          </h2>
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
            
            {currentStep < 4 ? (
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
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center"
              >
                <Calendar size={16} className="mr-2" />
                Utwórz Wizytę
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceptionAppointmentForm; 