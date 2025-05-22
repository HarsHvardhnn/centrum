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
            <option value="dolnoslaskie">Dolnośląskie</option>
            <option value="kujawsko-pomorskie">Kujawsko-Pomorskie</option>
            <option value="lubelskie">Lubelskie</option>
            <option value="lubuskie">Lubuskie</option>
            <option value="lodzkie">Łódzkie</option>
            <option value="malopolskie">Małopolskie</option>
            <option value="mazowieckie">Mazowieckie</option>
            <option value="opolskie">Opolskie</option>
            <option value="podkarpackie">Podkarpackie</option>
            <option value="podlaskie">Podlaskie</option>
            <option value="pomorskie">Pomorskie</option>
            <option value="slaskie">Śląskie</option>
            <option value="swietokrzyskie">Świętokrzyskie</option>
            <option value="warminsko-mazurskie">Warmińsko-Mazurskie</option>
            <option value="wielkopolskie">Wielkopolskie</option>
            <option value="zachodniopomorskie">Zachodniopomorskie</option>
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