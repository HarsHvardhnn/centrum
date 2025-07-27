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
          <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
          <input 
            type="text" 
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Wprowadź swój adres domowy" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Miasto</label>
          <input 
            type="text" 
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Wprowadź nazwę miasta" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kod Pocztowy</label>
          <input 
            type="text" 
            name="pinCode"
            value={formData.pinCode}
            onChange={handleChange}
            placeholder="Wprowadź kod" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Województwo</label>
          <select 
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="" disabled>Wybierz województwo</option>
            <option value="state1">Województwo 1</option>
            <option value="state2">Województwo 2</option>
            <option value="state3">Województwo 3</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kraj</label>
          <select 
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="" disabled>Wybierz kraj</option>
            <option value="country1">Kraj 1</option>
            <option value="country2">Kraj 2</option>
            <option value="country3">Kraj 3</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Powiat</label>
          <select 
            name="district"
            value={formData.district}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="" disabled>Wybierz powiat</option>
            <option value="district1">Powiat 1</option>
            <option value="district2">Powiat 2</option>
            <option value="district3">Powiat 3</option>
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
        <label htmlFor="international" className="text-sm text-gray-700">Pacjent Międzynarodowy</label>
      </div>
    </div>
  );
};

export default AddressForm;