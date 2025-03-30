import { useFormContext } from "../../context/SubStepFormContext";

const DetailsForm = () => {
  const { formData, updateFormData } = useFormContext();
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData(name, type === 'checkbox' ? checked : value);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Referrer Type</label>
        <div className="relative">
          <select 
            name="referrerType"
            value={formData.referrerType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none"
          >
            <option value="" disabled>Select referrer type</option>
            <option value="doctor">Doctor</option>
            <option value="hospital">Hospital</option>
            <option value="clinic">Clinic</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Father Name</label>
          <input 
            type="text" 
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            placeholder="Enter your father name" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mother Name</label>
          <input 
            type="text" 
            name="motherName"
            value={formData.motherName}
            onChange={handleChange}
            placeholder="Enter your mother name" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Spouse Name</label>
          <input 
            type="text" 
            name="spouseName"
            value={formData.spouseName}
            onChange={handleChange}
            placeholder="Enter your spouse name" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
          <input 
            type="text" 
            name="education"
            value={formData.education}
            onChange={handleChange}
            placeholder="Enter your degree" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Contact</label>
          <input 
            type="tel" 
            name="alternateContact"
            value={formData.alternateContact}
            onChange={handleChange}
            placeholder="Enter your contact" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Birth Weight</label>
          <input 
            type="text" 
            name="birthWeight"
            value={formData.birthWeight}
            onChange={handleChange}
            placeholder="Enter your weight" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
          <div className="relative">
            <select 
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none"
            >
              <option value="" disabled>Select occupation</option>
              <option value="engineer">Engineer</option>
              <option value="doctor">Doctor</option>
              <option value="teacher">Teacher</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
          <div className="relative">
            <select 
              name="religion"
              value={formData.religion}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none"
            >
              <option value="" disabled>Select religion</option>
              <option value="christianity">Christianity</option>
              <option value="islam">Islam</option>
              <option value="hinduism">Hinduism</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">IVR Language</label>
          <div className="relative">
            <select 
              name="ivrLanguage"
              value={formData.ivrLanguage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none"
            >
              <option value="" disabled>Select language</option>
              <option value="english">English</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsForm;
