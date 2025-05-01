import React, { useState } from "react";

const AppointmentModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    patientName: "",
    patientSource: "",
    isInternational: false,
    visitType: "",
    doctor: "",
    visitSlot: "",
    date: "25/05/2022",
    time: "04:00 PM",
    markApt: false,
    isWalkin: false,
    needsAttention: false,
    reviewNotes: "",
    enableRepeats: false
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!formData.patientName) newErrors.patientName = "Imię i nazwisko pacjenta jest wymagane";
    if (!formData.patientSource) newErrors.patientSource = "Źródło pacjenta jest wymagane";
    if (!formData.visitType) newErrors.visitType = "Typ wizyty jest wymagany";
    if (!formData.doctor) newErrors.doctor = "Lekarz jest wymagany";
    if (!formData.visitSlot) newErrors.visitSlot = "Numer slotu jest wymagany";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Process form data
    console.log("Form submitted:", formData);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[60%] p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-xl font-semibold mb-4">Dodaj wizytę</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Patient Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Imię i nazwisko pacjenta</label>
            <div className="relative">
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                placeholder="Wprowadź imię i numer pacjenta"
                className={`w-full p-2 border rounded-md ${errors.patientName ? 'border-red-500' : 'border-gray-300'}`}
              />
              <button className="absolute right-2 top-2 text-teal-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
            {errors.patientName && <p className="text-red-500 text-xs mt-1">{errors.patientName}</p>}
          </div>
          
          {/* About the patient */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">O pacjencie</label>
            <div className="bg-teal-50 p-3 rounded-md flex items-center gap-8">
              <div className="flex items-center mb-2">
                <select
                  name="patientSource"
                  value={formData.patientSource}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.patientSource ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Wybierz źródło pacjenta</option>
                  <option value="referral">Skierowanie</option>
                  <option value="walkin">Bez rejestracji</option>
                  <option value="online">Online</option>
                </select>
              </div>
              {errors.patientSource && <p className="text-red-500 text-xs mt-1">{errors.patientSource}</p>}
              
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="first-visit"
                    name="visitType"
                    value="first-time"
                    checked={formData.visitType === "first-time"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="first-visit">Pierwsza wizyta</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="re-visit"
                    name="visitType"
                    value="re-visit"
                    checked={formData.visitType === "re-visit"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="re-visit">Kolejna wizyta</label>
                </div>
              </div>
              {errors.visitType && <p className="text-red-500 text-xs mt-1">{errors.visitType}</p>}
            </div>
            
            <div className="mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isInternational"
                  checked={formData.isInternational}
                  onChange={handleChange}
                  className="mr-2"
                />
                Pacjent międzynarodowy
              </label>
            </div>
          </div>
          
          {/* Doctor */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lekarz</label>
            <div className="grid grid-cols-3 gap-2">
              <select
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                className={`p-2 border rounded-md ${errors.doctor ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Wybierz lekarza</option>
                <option value="dr-smith">Dr. Smith</option>
                <option value="dr-jones">Dr. Jones</option>
              </select>
              
              <select
                name="visitType"
                value={formData.visitType}
                onChange={handleChange}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="">Wybierz typ wizyty</option>
                <option value="consultation">Konsultacja</option>
                <option value="followup">Kontrolna</option>
              </select>
              
              <input
                type="text"
                name="visitSlot"
                value={formData.visitSlot}
                onChange={handleChange}
                placeholder="Wprowadź numer slotu"
                className={`p-2 border rounded-md ${errors.visitSlot ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>
            {errors.doctor && <p className="text-red-500 text-xs mt-1">{errors.doctor}</p>}
            {errors.visitSlot && <p className="text-red-500 text-xs mt-1">{errors.visitSlot}</p>}
          </div>
          
          {/* Time */}
          <div className="mb-4 w-[60%]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Czas</label>
            <div className="flex space-x-2">
              <input
                type="text"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="p-2 border border-gray-300 rounded-md w-1/2"
              />
              <input
                type="text"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="p-2 border border-gray-300 rounded-md w-1/3"
              />
              <button type="button" className="text-teal-500 p-2 w-full flex items-start">Change Time</button>
            </div>
          </div>
          
          {/* Additional Options */}
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="markApt"
                checked={formData.markApt}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Oznacz jako przybyły</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="isWalkin"
                checked={formData.isWalkin}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Bez rejestracji</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="needsAttention"
                checked={formData.needsAttention}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Wymaga uwagi</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="enableRepeats"
                checked={formData.enableRepeats}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Włącz powtarzanie dla pacjenta</span>
            </label>
          </div>
          
          {/* Review Notes */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notatki
            </label>
            <textarea
              name="reviewNotes"
              value={formData.reviewNotes}
              onChange={handleChange}
              placeholder="Wprowadź szczegóły pacjenta..."
              className="w-full p-2 border rounded-md focus:ring-1 focus:ring-teal-500 h-20"
            ></textarea>
          </div>
          
          <div className="mt-6 text-right">
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 inline-flex items-center"
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
        </form>
      </div>
    </div>
  );
};

// App component to demonstrate usage
const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div className="p-4">
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        Open Appointment Modal
      </button>
      
      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default App;

