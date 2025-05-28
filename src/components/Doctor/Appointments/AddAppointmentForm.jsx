import { useState, useEffect } from "react";
import PatientSearchField from "../../AppointmentForm/PatientSearchField"
import DoctorSelectionWithSlots from "../../admin/DoctorsAppointments";
import userServiceHelper from "../../../helpers/userServiceHelper";
import { Search, Plus, Minus, CheckCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { useServices } from "../../../context/serviceContext.jsx";
import { toast } from "sonner";
import { apiCaller } from "../../../utils/axiosInstance";

function AppointmentFormModal({ onClose, onComplete, doctorId, availableServices = [], isLoadingServices = false }) {
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
  });
  const [availableSlots, setAvailableSlots] = useState([]);

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
    if (!phone) return "Numer telefonu jest wymagany";
    const phoneRegex = /^\d{9}$/;
    return phoneRegex.test(phone) ? "" : "Numer telefonu musi mieć dokładnie 9 cyfr";
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "newPatientPhone") {
      // Only allow numbers and limit to 9 characters
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
      selectedSlot: null, // Reset selected slot
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
      selectedSlot: null, // Reset slot when date changes
    });
  };

  // Filter services based on search term
  const filteredServices = searchTerm 
    ? allServices.filter(service => 
        service.title.toLowerCase().includes(searchTerm.toLowerCase()))
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
    appointmentData.newPatientPhone.trim().length === 9 &&
    !validationErrors.phone &&
    (!appointmentData.newPatientEmail || !validationErrors.email) && // Email is optional but must be valid if provided
    appointmentData.newPatientDateOfBirth.trim() !== "" &&
    appointmentData.newPatientSex.trim() !== "";

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: // Patient Information
        return appointmentData.visitType && (isFirstTimeVisit ? isNewPatientValid : selectedPatient);
      case 2: // Doctor Selection & Date
        return appointmentData.selectedDoctor && appointmentData.selectedDate && appointmentData.selectedSlot;
      case 3: // Services
        return true; // Services are optional
      case 4: // Additional Details
        return true; // Additional details are optional
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
                    <input
                      type="tel"
                      name="newPatientPhone"
                      value={appointmentData.newPatientPhone}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-lg ${validationErrors.phone ? 'border-red-500' : ''}`}
                      required
                      placeholder="Wprowadź 9 cyfr"
                    />
                    {validationErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Data urodzenia*</label>
                    <input
                      type="date"
                      name="newPatientDateOfBirth"
                      value={appointmentData.newPatientDateOfBirth}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg"
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

      case 2:
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
                selectedSlot={appointmentData.selectedSlot}
                onDoctorSelect={handleDoctorSelect}
                onDateChange={handleDateChange}
                onSlotSelect={handleSlotSelect}
                initialDoctorId={doctorId}
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
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            )}

            {/* Time Slots */}
            {/* {appointmentData.selectedDoctor && appointmentData.selectedDate && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dostępne terminy
                </label>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSlotSelect(slot)}
                        disabled={!slot.available}
                        className={`p-2 rounded-lg border text-sm ${
                          appointmentData.selectedSlot?.startTime === slot.startTime
                            ? 'bg-teal-500 text-white border-teal-500'
                            : slot.available
                            ? 'bg-white hover:bg-gray-50 border-gray-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {slot.startTime} - {slot.endTime}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Brak dostępnych terminów w wybranym dniu
                  </div>
                )}
              </div>
            )} */}
          </div>
        );

      case 3:
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

  const handleSubmit = () => {
    if (
      (selectedPatient || isNewPatientValid) &&
      appointmentData.selectedDoctor &&
      appointmentData.selectedSlot
    ) {
      // Collect all data for backend submission
      const appointmentSubmissionData = {
        date: appointmentData.selectedDate,
        doctorId: appointmentData.selectedDoctor._id,
        startTime: appointmentData.selectedSlot.startTime,
        consultationType: "offline",
        message: appointmentData.notes || "",
        smsConsentAgreed: true
      };
      
      // Add patient information based on selection type
      if (isFirstTimeVisit && isNewPatientValid) {
        // For new patients, add their details directly
        appointmentSubmissionData.firstName = appointmentData.newPatientFirstName;
        appointmentSubmissionData.lastName = appointmentData.newPatientLastName;
        appointmentSubmissionData.email = appointmentData.newPatientEmail || "";
        appointmentSubmissionData.phone = appointmentData.newPatientPhone;
        appointmentSubmissionData.dob = appointmentData.newPatientDateOfBirth;
      } else {
        // For existing patients, use their ID
        appointmentSubmissionData.patient = selectedPatient._id;
      }

      console.log("Appointment data to submit:", appointmentSubmissionData);
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
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
              >
                Zarezerwuj Wizytę
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentFormModal;
