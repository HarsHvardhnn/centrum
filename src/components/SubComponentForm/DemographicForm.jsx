// components/AppointmentForm/DemographicForm.jsx
import { useFormContext } from "../../context/SubStepFormContext";
const DemographicsForm = () => {
  const { formData, updateFormData } = useFormContext();
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData(name, type === 'checkbox' ? checked : value);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input 
          type="text" 
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Enter your full name" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your e-mail" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
          <input 
            type="tel" 
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            placeholder="Enter your mobile number" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input 
            type="date" 
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            placeholder="Enter date" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mother Tongue</label>
          <input 
            type="text" 
            name="motherTongue"
            value={formData.motherTongue}
            onChange={handleChange}
            placeholder="Enter your mother tongue" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Govt ID</label>
          <input 
            type="text" 
            name="govtId"
            value={formData.govtId}
            onChange={handleChange}
            placeholder="Enter govt id" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hosp. ID</label>
          <div className="relative">
            <input 
              type="text" 
              name="hospId"
              value={formData.hospId}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
          <div className="flex gap-4 p-3 bg-primary-lighter rounded-xl">
            <label className="inline-flex items-center">
              <input 
                type="radio" 
                name="sex" 
                value="Male"
                checked={formData.sex === "Male"}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-teal-500" 
              />
              <span className="ml-2">Male</span>
            </label>
            <label className="inline-flex items-center">
              <input 
                type="radio" 
                name="sex" 
                value="Female"
                checked={formData.sex === "Female"}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-teal-500" 
              />
              <span className="ml-2">Female</span>
            </label>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
          <div className="flex gap-4 p-3  bg-primary-lighter rounded-xl">
            <label className="inline-flex items-center">
              <input 
                type="radio" 
                name="maritalStatus" 
                value="Single"
                checked={formData.maritalStatus === "Single"}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-teal-500" 
              />
              <span className="ml-2">Single</span>
            </label>
            <label className="inline-flex items-center">
              <input 
                type="radio" 
                name="maritalStatus" 
                value="Married"
                checked={formData.maritalStatus === "Married"}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-teal-500" 
              />
              <span className="ml-2">Married</span>
            </label>
            <label className="inline-flex items-center">
              <input 
                type="radio" 
                name="maritalStatus" 
                value="Widow"
                checked={formData.maritalStatus === "Widow"}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-teal-500" 
              />
              <span className="ml-2">Widow</span>
            </label>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ethnicity</label>
          <div className="flex gap-4 p-3 bg-primary-lighter rounded-xl">
            <label className="inline-flex items-center">
              <input 
                type="radio" 
                name="ethnicity" 
                value="European"
                checked={formData.ethnicity === "European"}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-teal-500" 
              />
              <span className="ml-2">European</span>
            </label>
            <label className="inline-flex items-center">
              <input 
                type="radio" 
                name="ethnicity" 
                value="Bangali"
                checked={formData.ethnicity === "Bangali"}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-teal-500" 
              />
              <span className="ml-2">Bangali</span>
            </label>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Other Hospital IDs</label>
        <input 
          type="text" 
          name="otherHospitalIds"
          value={formData.otherHospitalIds}
          onChange={handleChange}
          placeholder="Enter id's" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );
};

export default DemographicsForm;
