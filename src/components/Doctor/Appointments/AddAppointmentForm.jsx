import { useState, useEffect } from "react";
import PatientSearchField from "../../AppointmentForm/PatientSearchField"
import DoctorSelectionWithSlots from "../../admin/DoctorsAppointments";
import userServiceHelper from "../../../helpers/userServiceHelper";

function AppointmentFormModal({ onClose, onComplete, doctorId }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctorServices, setDoctorServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
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
    setAppointmentData(prevData => {
      const currentServices = [...prevData.selectedServices];
      const index = currentServices.findIndex(s => s.id === service.id);
      
      if (index === -1) {
        // Add service if not already selected
        currentServices.push(service);
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
        // Add selected services
        services: appointmentData.selectedServices.map(service => ({
          serviceId: service.id,
          price: service.price
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
    return appointmentData.selectedServices.reduce((total, service) => total + (parseFloat(service.price) || 0), 0);
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

          {/* Service Selection Section */}
          {appointmentData.selectedDoctor && doctorServices.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usługi lekarza
              </label>
              <div className="bg-gray-50 p-3 rounded-lg">
                {loadingServices ? (
                  <div className="text-center py-2 text-gray-500">Ładowanie usług...</div>
                ) : doctorServices.length === 0 ? (
                  <div className="text-center py-2 text-gray-500">Brak dostępnych usług</div>
                ) : (
                  <div className="space-y-2">
                    {doctorServices.map((service) => (
                      <div 
                        key={service.id} 
                        className={`p-2 rounded border ${
                          appointmentData.selectedServices.some(s => s.id === service.id)
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200'
                        } flex justify-between items-center cursor-pointer hover:bg-gray-100`}
                        onClick={() => handleServiceToggle(service)}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={appointmentData.selectedServices.some(s => s.id === service.id)}
                            onChange={() => {}} // Handled by the div onClick
                            className="h-4 w-4 text-teal-600 border-gray-300 rounded"
                          />
                          <span className="ml-2 font-medium">{service.title}</span>
                        </div>
                        <span className="text-gray-600">{service.price} zł</span>
                      </div>
                    ))}
                    
                    {/* Show total price if services are selected */}
                    {appointmentData.selectedServices.length > 0 && (
                      <div className="mt-3 p-2 bg-teal-50 rounded-lg flex justify-between items-center">
                        <span className="font-medium">Łączna cena usług:</span>
                        <span className="font-bold text-teal-700">{calculateTotalPrice().toFixed(2)} zł</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

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

          {/* Review Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notatki
            </label>
            <textarea
              name="notes"
              value={appointmentData.notes}
              onChange={handleInputChange}
              placeholder="Wprowadź szczegóły pacjenta..."
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 h-12 text-sm"
            ></textarea>
          </div>

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

          <div className="text-right">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 inline-flex items-center text-sm"
              disabled={
                (!selectedPatient && !isNewPatientValid) ||
                !appointmentData.selectedDoctor ||
                !appointmentData.selectedSlot
              }
            >
              Dodaj wizytę
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentFormModal;
