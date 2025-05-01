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
        <label className="block text-sm font-medium text-gray-700 mb-1">Typ Skierowania</label>
        <div className="relative">
          <select 
            name="referrerType"
            value={formData.referrerType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none"
          >
            <option value="" disabled>Wybierz typ skierowania</option>
            <option value="doctor">Lekarz</option>
            <option value="hospital">Szpital</option>
            <option value="clinic">Przychodnia</option>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Imię Ojca</label>
          <input 
            type="text" 
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            placeholder="Wprowadź imię ojca" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imię Matki</label>
          <input 
            type="text" 
            name="motherName"
            value={formData.motherName}
            onChange={handleChange}
            placeholder="Wprowadź imię matki" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imię Małżonka</label>
          <input 
            type="text" 
            name="spouseName"
            value={formData.spouseName}
            onChange={handleChange}
            placeholder="Wprowadź imię małżonka" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Wykształcenie</label>
          <input 
            type="text" 
            name="education"
            value={formData.education}
            onChange={handleChange}
            placeholder="Wprowadź wykształcenie" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dodatkowy Kontakt</label>
          <input 
            type="tel" 
            name="alternateContact"
            value={formData.alternateContact}
            onChange={handleChange}
            placeholder="Wprowadź numer kontaktowy" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Waga Urodzeniowa</label>
          <input 
            type="text" 
            name="birthWeight"
            value={formData.birthWeight}
            onChange={handleChange}
            placeholder="Wprowadź wagę" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zawód</label>
          <div className="relative">
            <select 
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none"
            >
              <option value="" disabled>Wybierz zawód</option>
              <option value="engineer">Inżynier</option>
              <option value="doctor">Lekarz</option>
              <option value="teacher">Nauczyciel</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Wyznanie</label>
          <div className="relative">
            <select 
              name="religion"
              value={formData.religion}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none"
            >
              <option value="" disabled>Wybierz wyznanie</option>
              <option value="christianity">Chrześcijaństwo</option>
              <option value="islam">Islam</option>
              <option value="hinduism">Hinduizm</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Język IVR</label>
          <div className="relative">
            <select 
              name="ivrLanguage"
              value={formData.ivrLanguage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none"
            >
              <option value="" disabled>Wybierz język</option>
              <option value="english">Angielski</option>
              <option value="spanish">Hiszpański</option>
              <option value="french">Francuski</option>
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
