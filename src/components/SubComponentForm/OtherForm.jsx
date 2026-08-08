import { useFormContext } from "../../context/SubStepFormContext";

/**
 * "Inne" (Other) tab — miscellaneous patient fields.
 * Starting with allergies + preferred language; more fields can be added later.
 */
const OtherForm = () => {
  const { formData, updateFormData } = useFormContext();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData(name, type === "checkbox" ? checked : value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Inne dane pacjenta</h3>
        <p className="text-xs text-gray-500 mb-4">
          Dodatkowe informacje o pacjencie. Ta sekcja będzie rozbudowywana w kolejnych etapach.
        </p>
      </div>

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
            <option value="" disabled>
              Wybierz język
            </option>
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

export default OtherForm;
