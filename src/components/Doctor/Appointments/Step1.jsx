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
    if (!formData.patientName) newErrors.patientName = "Patient name is required";
    if (!formData.patientSource) newErrors.patientSource = "Patient source is required";
    if (!formData.visitType) newErrors.visitType = "Visit type is required";
    if (!formData.doctor) newErrors.doctor = "Doctor is required";
    if (!formData.visitSlot) newErrors.visitSlot = "Slot number is required";
    
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
        
        <h2 className="text-xl font-semibold mb-4">Add Appointment</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Patient Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient name</label>
            <div className="relative">
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                placeholder="Enter patient name & number"
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
            <label className="block text-sm font-medium text-gray-700 ">About the patient</label>
            <div className="bg-teal-50 p-3 rounded-md flex items-center gap-8">
              <div className="flex items-center mb-2">
                <select
                  name="patientSource"
                  value={formData.patientSource}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.patientSource ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select patient source</option>
                  <option value="referral">Referral</option>
                  <option value="walkin">Walk-in</option>
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
                  <label htmlFor="first-visit">First-Time Visit</label>
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
                  <label htmlFor="re-visit">Re-Visit</label>
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
                International Patient
              </label>
            </div>
          </div>
          
          {/* Doctor */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <div className="grid grid-cols-3 gap-2">
              <select
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                className={`p-2 border rounded-md ${errors.doctor ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select doctor</option>
                <option value="dr-smith">Dr. Smith</option>
                <option value="dr-jones">Dr. Jones</option>
              </select>
              
              <select
                name="visitType"
                value={formData.visitType}
                onChange={handleChange}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select visit type</option>
                <option value="consultation">Consultation</option>
                <option value="followup">Follow-up</option>
              </select>
              
              <input
                type="text"
                name="visitSlot"
                value={formData.visitSlot}
                onChange={handleChange}
                placeholder="Enter slots number"
                className={`p-2 border rounded-md ${errors.visitSlot ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>
            {errors.doctor && <p className="text-red-500 text-xs mt-1">{errors.doctor}</p>}
            {errors.visitSlot && <p className="text-red-500 text-xs mt-1">{errors.visitSlot}</p>}
          </div>
          
          {/* Time */}
          <div className="mb-4 w-[60%]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <div className="flex space-x-2 ">
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
          
          {/* Status Options */}
          <div className="mb-4 flex space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="markApt"
                checked={formData.markApt}
                onChange={handleChange}
                className="mr-2"
              />
              Mark Apt as Arrived
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isWalkin"
                checked={formData.isWalkin}
                onChange={handleChange}
                className="mr-2"
              />
              Is Walkin
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                name="needsAttention"
                checked={formData.needsAttention}
                onChange={handleChange}
                className="mr-2"
              />
              Needs Attention
            </label>
          </div>
          
          {/* Review Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes</label>
            <textarea
              name="reviewNotes"
              value={formData.reviewNotes}
              onChange={handleChange}
              placeholder="Enter patient details..."
              className="w-full p-2 border border-gray-300 rounded-md h-24"
            ></textarea>
          </div>
          
          {/* Enable repeats */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="enableRepeats"
                checked={formData.enableRepeats}
                onChange={handleChange}
                className="mr-2"
              />
              Enable repeats patient
            </label>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              Add Appointment
              <svg className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
