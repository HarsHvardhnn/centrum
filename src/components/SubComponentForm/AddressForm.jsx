// AddressForm.jsx

import { useFormContext } from "../../context/SubStepFormContext";
import { VOIVODESHIPS, normalizeVoivodeship, formatVoivodeshipLabel } from "../../utils/voivodeshipUtils";

const AddressForm = () => {
  const { formData, updateFormData } = useFormContext();
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData(name, type === 'checkbox' ? checked : value);
  };

  const stateValue = normalizeVoivodeship(formData.state || formData.province || "");

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
            value={stateValue}
            onChange={(e) => updateFormData("state", normalizeVoivodeship(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Wybierz województwo</option>
            {VOIVODESHIPS.map((voivodeship) => (
              <option key={voivodeship} value={voivodeship}>
                {formatVoivodeshipLabel(voivodeship)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kraj</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Wprowadź nazwę kraju"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Powiat (opcjonalnie)</label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleChange}
            placeholder="Wprowadź nazwę powiatu"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
