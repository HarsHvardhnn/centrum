// AddressForm.jsx

import { useFormContext } from "../../context/SubStepFormContext";

const AddressForm = () => {
  const { formData, updateFormData } = useFormContext();
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData(name, type === 'checkbox' ? checked : value);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input 
            type="text" 
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your home address" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input 
            type="text" 
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter your city name" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code</label>
          <input 
            type="text" 
            name="pinCode"
            value={formData.pinCode}
            onChange={handleChange}
            placeholder="Enter pin" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <select 
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="" disabled>Select your state</option>
            <option value="state1">State 1</option>
            <option value="state2">State 2</option>
            <option value="state3">State 3</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <select 
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="" disabled>Select your country</option>
            <option value="country1">Country 1</option>
            <option value="country2">Country 2</option>
            <option value="country3">Country 3</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
          <select 
            name="district"
            value={formData.district}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="" disabled>Select your district</option>
            <option value="district1">District 1</option>
            <option value="district2">District 2</option>
            <option value="district3">District 3</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center">
        <input 
          type="checkbox" 
          id="international" 
          name="isInternationalPatient"
          checked={formData.isInternationalPatient}
          onChange={handleChange}
          className="mr-2" 
        />
        <label htmlFor="international" className="text-sm text-gray-700">International Patient</label>
      </div>
    </div>
  );
};

export default AddressForm;
