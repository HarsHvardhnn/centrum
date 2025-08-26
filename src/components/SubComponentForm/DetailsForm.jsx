import { useFormContext } from "../../context/SubStepFormContext";

const DetailsForm = () => {
  const { formData, updateFormData } = useFormContext();
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData(name, type === 'checkbox' ? checked : value);
  };

  return (
    <div className="space-y-6">
      {/* Contact Person 1 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Osoba Kontaktowa 1</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imię i nazwisko osoby kontaktowej nr 1
            </label>
            <input
              type="text"
              name="contactPerson1Name"
              value={formData.contactPerson1Name || ""}
              onChange={handleChange}
              placeholder="Wprowadź imię i nazwisko"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numer telefonu osoby kontaktowej nr 1
            </label>
            <div className="flex">
              <select
                name="contactPerson1PhonePrefix"
                value={formData.contactPerson1PhonePrefix || "+48"}
                onChange={handleChange}
                className="px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50"
              >
                <option value="+48">+48</option>
                <option value="+44">+44</option>
                <option value="+49">+49</option>
                <option value="+33">+33</option>
                <option value="+39">+39</option>
                <option value="+34">+34</option>
              </select>
              <input
                type="tel"
                name="contactPerson1Phone"
                value={formData.contactPerson1Phone || ""}
                onChange={handleChange}
                placeholder="Wprowadź numer telefonu"
                className="w-full px-3 py-2 border border-gray-300 rounded-r-md"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adres osoby kontaktowej nr 1
            </label>
            <input
              type="text"
              name="contactPerson1Address"
              value={formData.contactPerson1Address || ""}
              onChange={handleChange}
              placeholder="Wprowadź adres"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PESEL osoby kontaktowej nr 1
            </label>
            <input
              type="text"
              name="contactPerson1Pesel"
              value={formData.contactPerson1Pesel || ""}
              onChange={handleChange}
              placeholder="Wprowadź PESEL"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relacja z pacjentem
            </label>
            <input
              type="text"
              name="contactPerson1Relationship"
              value={formData.contactPerson1Relationship || ""}
              onChange={handleChange}
              placeholder="np. matka, córka, przyjaciółka"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Contact Person 2 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Osoba Kontaktowa 2</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imię i nazwisko osoby kontaktowej nr 2
            </label>
            <input
              type="text"
              name="contactPerson2Name"
              value={formData.contactPerson2Name || ""}
              onChange={handleChange}
              placeholder="Wprowadź imię i nazwisko"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numer telefonu osoby kontaktowej nr 2
            </label>
            <div className="flex">
              <select
                name="contactPerson2PhonePrefix"
                value={formData.contactPerson2PhonePrefix || "+48"}
                onChange={handleChange}
                className="px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50"
              >
                <option value="+48">+48</option>
                <option value="+44">+44</option>
                <option value="+49">+49</option>
                <option value="+33">+33</option>
                <option value="+39">+39</option>
                <option value="+34">+34</option>
              </select>
              <input
                type="tel"
                name="contactPerson2Phone"
                value={formData.contactPerson2Phone || ""}
                onChange={handleChange}
                placeholder="Wprowadź numer telefonu"
                className="w-full px-3 py-2 border border-gray-300 rounded-r-md"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adres osoby kontaktowej nr 2
            </label>
            <input
              type="text"
              name="contactPerson2Address"
              value={formData.contactPerson2Address || ""}
              onChange={handleChange}
              placeholder="Wprowadź adres"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PESEL osoby kontaktowej nr 2
            </label>
            <input
              type="text"
              name="contactPerson2Pesel"
              value={formData.contactPerson2Pesel || ""}
              onChange={handleChange}
              placeholder="Wprowadź PESEL"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relacja z pacjentem
            </label>
            <input
              type="text"
              name="contactPerson2Relationship"
              value={formData.contactPerson2Relationship || ""}
              onChange={handleChange}
              placeholder="np. matka, córka, przyjaciółka"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Other fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferowany język</label>
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
