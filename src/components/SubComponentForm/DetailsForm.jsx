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
        <label className="block text-sm font-medium text-gray-700 mb-1">Pacjent Pełnoletni</label>
        <select
          name="isAdult"
          value={formData.isAdult || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="" disabled>Wybierz Tak lub NIE</option>
          <option value="TAK">TAK</option>
          <option value="NIE">NIE</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imię i Nazwisko Ojca</label>
          <input
            type="text"
            name="fatherName"
            value={formData.fatherName || ""}
            onChange={handleChange}
            placeholder="Wprowadź imię i nazwisko"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imię i Nazwisko Matki</label>
          <input
            type="text"
            name="motherName"
            value={formData.motherName || ""}
            onChange={handleChange}
            placeholder="Wprowadź imię i nazwisko"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Osoba Kontaktowa</label>
          <input
            type="text"
            name="contactPerson"
            value={formData.contactPerson || ""}
            onChange={handleChange}
            placeholder="Wprowadź imię i nazwisko"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Numer Telefonu Ojca</label>
          <input
            type="text"
            name="fatherPhone"
            value={formData.fatherPhone || ""}
            onChange={handleChange}
            placeholder="Wprowadź numer telefonu"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Numer Telefonu Matki</label>
          <input
            type="text"
            name="motherPhone"
            value={formData.motherPhone || ""}
            onChange={handleChange}
            placeholder="Wprowadź numer telefonu"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Relacja z Pacjentem</label>
          <input
            type="text"
            name="relationToPatient"
            value={formData.relationToPatient || ""}
            onChange={handleChange}
            placeholder="Małżonek/ Opiekun/ Inna"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alergie</label>
          <input
            type="text"
            name="allergies"
            value={formData.allergies || ""}
            onChange={handleChange}
            placeholder="Wprowadź alergie"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Narodowość</label>
          <input
            type="text"
            name="nationality"
            value={formData.nationality || ""}
            onChange={handleChange}
            placeholder="Wprowadź narodowość"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferowany Język</label>
          <select
            name="preferredLanguage"
            value={formData.preferredLanguage || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="" disabled>Wybierz język</option>
            <option value="Polski">Polski</option>
            <option value="Angielski">Angielski</option>
            <option value="Hiszpański">Hiszpański</option>
            <option value="Rosyjski">Rosyjski</option>
            <option value="Niemiecki">Niemiecki</option>
            <option value="Ukraiński">Ukraiński</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default DetailsForm;
