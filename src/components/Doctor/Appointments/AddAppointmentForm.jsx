import { useState, useEffect } from "react";
import PatientSearchField from "../../AppointmentForm/PatientSearchField"
import DoctorSelectionWithSlots from "../../admin/DoctorsAppointments";
import userServiceHelper from "../../../helpers/userServiceHelper";
import { Search, Plus, Minus, CheckCircle } from "lucide-react";
import { useServices } from "../../../context/serviceContext.jsx";

function AppointmentFormModal({ onClose, onComplete, doctorId, availableServices = [], isLoadingServices = false }) {
  const { services: contextServices, loading: contextLoading } = useServices();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctorServices, setDoctorServices] = useState([]);
  const [allServices, setAllServices] = useState(availableServices || []);
  const [loadingServices, setLoadingServices] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [appointmentData, setAppointmentData] = useState({
    patientSource: "",
    visitType: "",
    isInternational: false,
    selectedDoctor: doctorId ? { _id: doctorId } : null,
    selectedSlot: null,
    selectedDate: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
    isWalkin: false,
    needsAttention: false,
    markAsArrived: false,
    notes: "",
    enableRepeats: false,
    selectedServices: [], // Add array for selected services
    // New fields for a new patient
    newPatientFirstName: "",
    newPatientLastName: "",
    newPatientEmail: "",
    newPatientPhone: "",
    newPatientDateOfBirth: "",
    newPatientSex: "", // Enum: ["Male", "Female", "Others"]
  });

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAppointmentData({
      ...appointmentData,
      [name]: type === "checkbox" ? checked : value,
    });
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

  // Handle doctor selection and fetch their services
  const handleDoctorSelect = (doctor) => {
    setAppointmentData({
      ...appointmentData,
      selectedDoctor: doctor,
      selectedServices: [], // Reset selected services when doctor changes
    });
    
    if (doctor && doctor._id) {
      fetchDoctorServices(doctor._id);
    } else {
      setDoctorServices([]);
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
    ? doctorServices.filter(service => 
        service.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : doctorServices;

  // If doctorId is provided on component mount, fetch services
  useEffect(() => {
    if (doctorId) {
      fetchDoctorServices(doctorId);
    }
  }, [doctorId]);

  const isFirstTimeVisit = appointmentData.visitType === "first-time";
  const isNewPatientValid = isFirstTimeVisit && 
    appointmentData.newPatientFirstName.trim() !== "" && 
    appointmentData.newPatientLastName.trim() !== "" &&
    appointmentData.newPatientEmail.trim() !== "" &&
    appointmentData.newPatientDateOfBirth.trim() !== "" &&
    appointmentData.newPatientSex.trim() !== "";

  const handleSubmit = () => {
    if (
      (selectedPatient || isNewPatientValid) &&
      appointmentData.selectedDoctor &&
      appointmentData.selectedSlot
    ) {
      // Collect all data for backend submission
      const appointmentSubmissionData = {
        doctor: appointmentData.selectedDoctor._id,
        date: appointmentData.selectedDate,
        startTime: appointmentData.selectedSlot.startTime,
        endTime: appointmentData.selectedSlot.endTime,
        patientSource: appointmentData.patientSource,
        visitType: appointmentData.visitType,
        isInternational: appointmentData.isInternational,
        isWalkin: appointmentData.isWalkin,
        needsAttention: appointmentData.needsAttention,
        markAsArrived: appointmentData.markAsArrived,
        notes: appointmentData.notes,
        enableRepeats: appointmentData.enableRepeats,
        // Format selected services for API
        services: appointmentData.selectedServices.map(service => ({
          serviceId: service.id || service._id,
          price: service.price,
          quantity: service.quantity || 1
        })),
      };
      
      // Add patient information based on selection type
      if (isFirstTimeVisit && isNewPatientValid) {
        // For new patients, add their details directly
        appointmentSubmissionData.newPatient = {
          firstName: appointmentData.newPatientFirstName,
          lastName: appointmentData.newPatientLastName,
          email: appointmentData.newPatientEmail,
          phone: appointmentData.newPatientPhone || "",
          dateOfBirth: appointmentData.newPatientDateOfBirth,
          sex: appointmentData.newPatientSex
        };
        appointmentSubmissionData.isNewPatient = true;
      } else {
        // For existing patients, use their ID
        appointmentSubmissionData.patient = selectedPatient._id;
        appointmentSubmissionData.isNewPatient = false;
      }

      console.log("Appointment data to submit:", appointmentSubmissionData);
      onComplete(appointmentSubmissionData);
    } else {
      // Show validation message
      alert("Proszę uzupełnić wszystkie wymagane pola");
    }
  };

  // Calculate total price of selected services
  const calculateTotalPrice = () => {
    return appointmentData.selectedServices.reduce((total, service) => 
      total + ((parseFloat(service.price) || 0) * (service.quantity || 1)), 0);
  };

  // Update the ServiceSelectionSection to show all available services when no doctor is selected
  const ServiceSelectionSection = () => {
    // If loading services, show loading indicator
    if (isLoadingServices || loadingServices) {
      return (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
          <p>Ładowanie usług...</p>
        </div>
      );
    }

    // Determine which services to display
    const servicesToDisplay = appointmentData.selectedDoctor 
      ? doctorServices 
      : allServices;

    // If no services available
    if (!servicesToDisplay || servicesToDisplay.length === 0) {
      return (
        <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
          {appointmentData.selectedDoctor 
            ? "Ten lekarz nie ma przypisanych usług" 
            : "Brak dostępnych usług"}
        </div>
      );
    }

    // Filter services based on search term
    const filteredServices = searchTerm 
      ? servicesToDisplay.filter(service => 
          service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.name?.toLowerCase().includes(searchTerm.toLowerCase()))
      : servicesToDisplay;

    // Normalize service structure for display
    const normalizeService = (service) => {
      // Handle different service structures that might come from different sources
      return {
        id: service._id || service.id,
        title: service.title || service.name,
        price: service.price || "0",
        description: service.description || service.shortDescription || "",
      };
    };

    return (
      <div className="space-y-4">
        {/* Search input */}
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

        {/* Available services */}
        <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto">
          <div className="space-y-2">
            {filteredServices.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nie znaleziono usług
              </div>
            ) : (
              filteredServices.map((service) => {
                const normalizedService = normalizeService(service);
                const isSelected = appointmentData.selectedServices.some(s => 
                  s.id === normalizedService.id);
                const selectedService = appointmentData.selectedServices.find(s => 
                  s.id === normalizedService.id);
                const quantity = selectedService ? (selectedService.quantity || 1) : 1;
                
                return (
                  <div 
                    key={normalizedService.id} 
                    className={`p-3 rounded-lg border ${
                      isSelected ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-200'
                    } transition-all`}
                  >
                    <div className="flex justify-between items-start">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleServiceToggle(normalizedService)}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by the div onClick
                            className="h-4 w-4 text-teal-600 border-gray-300 rounded"
                          />
                          <span className="ml-2 font-medium">{normalizedService.title}</span>
                        </div>
                        <div className="ml-6 mt-1 text-sm text-gray-600">{normalizedService.price} zł</div>
                      </div>
                      
                      {isSelected && (
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => updateServiceQuantity(normalizedService.id, quantity - 1)}
                            className="h-6 w-6 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{quantity}</span>
                          <button 
                            onClick={() => updateServiceQuantity(normalizedService.id, quantity + 1)}
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

        {/* Selected services summary */}
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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

        <div className="space-y-4">
          {/* Visit type selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Typ wizyty
            </label>
            <div className="bg-teal-50 p-3 rounded-lg mb-2">
              <div className="flex justify-start items-center gap-6">
                <label className="inline-flex items-center whitespace-nowrap">
                  <input
                    type="radio"
                    name="visitType"
                    value="first-time"
                    checked={appointmentData.visitType === "first-time"}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2">Pierwsza wizyta</span>
                </label>
                <label className="inline-flex items-center whitespace-nowrap">
                  <input
                    type="radio"
                    name="visitType"
                    value="re-visit"
                    checked={appointmentData.visitType === "re-visit"}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2">Kolejna wizyta</span>
                </label>
              </div>
            </div>
          </div>

          {/* Show patient search field only for re-visits */}
          {appointmentData.visitType === "re-visit" && (
            <PatientSearchField onPatientSelect={handlePatientSelect} />
          )}

          {/* Show new patient form for first-time visits */}
          {appointmentData.visitType === "first-time" && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">Dane nowego pacjenta</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Imię*
                  </label>
                  <input
                    type="text"
                    name="newPatientFirstName"
                    value={appointmentData.newPatientFirstName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="Wprowadź imię"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Nazwisko*
                  </label>
                  <input
                    type="text"
                    name="newPatientLastName"
                    value={appointmentData.newPatientLastName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="Wprowadź nazwisko"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Email*
                  </label>
                  <input
                    type="email"
                    name="newPatientEmail"
                    value={appointmentData.newPatientEmail}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="Wprowadź email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Numer telefonu
                  </label>
                  <input
                    type="tel"
                    name="newPatientPhone"
                    value={appointmentData.newPatientPhone}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="+48 xxx xxx xxx"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Data urodzenia*
                  </label>
                  <input
                    type="date"
                    name="newPatientDateOfBirth"
                    value={appointmentData.newPatientDateOfBirth}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Płeć*
                  </label>
                  <select
                    name="newPatientSex"
                    value={appointmentData.newPatientSex}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                    required
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              O pacjencie
            </label>

            <div className="bg-teal-50 p-3 inline-block rounded-lg mb-2 w-full">
              <div className="flex gap-3 items-center flex-wrap md:flex-nowrap">
                {/* Patient source input */}
                <div className="w-full md:w-1/2">
                  <input
                    type="text"
                    name="patientSource"
                    placeholder="Wybierz źródło pacjenta"
                    value={appointmentData.patientSource}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* International Patient checkbox */}
            <div className="flex items-center">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="isInternational"
                  checked={appointmentData.isInternational}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-purple-600 border-gray-300 rounded-md focus:ring-purple-500"
                />
                <span className="ml-2 text-gray-700">
                  Pacjent międzynarodowy
                </span>
              </label>
            </div>
          </div>

          {/* Doctor Selection with Slots Component */}
          <DoctorSelectionWithSlots
            selectedDoctor={appointmentData.selectedDoctor}
            selectedDate={appointmentData.selectedDate}
            selectedSlot={appointmentData.selectedSlot}
            onDoctorSelect={handleDoctorSelect}
            onDateChange={handleDateChange}
            onSlotSelect={handleSlotSelect}
            initialDoctorId={doctorId}
          />

          {/* Enhanced Service Selection Section */}
          <div className="mt-6 border border-teal-100 rounded-lg p-4 bg-teal-50/30">
            <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Wybierz usługi dla wizyty
            </h3>
            <ServiceSelectionSection />
          </div>

          {/* Time section */}
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>

            {/* Light teal background container */}
            <div className="bg-teal-50 p-3 rounded-lg mb-2">
              <div className="flex gap-2 items-center">
                {/* Date input */}
                <div className="w-full">
                  <input
                    type="date"
                    name="selectedDate"
                    value={appointmentData.selectedDate}
                    onChange={handleDateChange}
                    className="w-full p-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Appointment Status Checkboxes */}
            <div className="flex gap-x-4 gap-y-1 flex-wrap">
              {/* Mark Apt as Arrived */}
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="markAsArrived"
                  checked={appointmentData.markAsArrived}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Oznacz jako przybyły
                </span>
              </label>

              {/* Is Walkin */}
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="isWalkin"
                  checked={appointmentData.isWalkin}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="ml-2 text-sm text-gray-700">Bez rejestracji</span>
              </label>

              {/* Needs Attention */}
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="needsAttention"
                  checked={appointmentData.needsAttention}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Wymaga uwagi
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dodatkowe notatki do wizyty
              </label>
              <textarea
                name="notes"
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="Opcjonalne notatki..."
                value={appointmentData.notes}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>

          {/* Enable Repeats Checkbox */}
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              name="enableRepeats"
              checked={appointmentData.enableRepeats}
              onChange={handleInputChange}
              className="h-4 w-4 text-teal-600 rounded mr-2"
            />
            <label htmlFor="enableRepeats" className="text-sm text-gray-700">
              Włącz powtarzanie dla pacjenta
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
              disabled={
                (!selectedPatient && !isNewPatientValid) ||
                !appointmentData.selectedDoctor ||
                !appointmentData.selectedSlot
              }
            >
              Zarezerwuj Wizytę
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentFormModal;
