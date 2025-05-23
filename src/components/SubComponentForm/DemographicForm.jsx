// components/AppointmentForm/DemographicForm.jsx
import { useFormContext } from "../../context/SubStepFormContext";

const DemographicsForm = () => {
  const { formData, updateFormData } = useFormContext();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData(name, type === "checkbox" ? checked : value);
  };

  // Format the date to YYYY-MM-DD for date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return "";

      // Format to YYYY-MM-DD
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Błąd formatowania daty:", error);
      return "";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Imię i Nazwisko
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName || ""}
          onChange={handleChange}
          placeholder="Wprowadź imię i nazwisko"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adres E-mail
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            placeholder="Wprowadź adres e-mail"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numer Telefonu
          </label>
          <input
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber || ""}
            onChange={handleChange}
            placeholder="Wprowadź numer telefonu"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Urodzenia
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth || ""}
            onChange={handleChange}
            placeholder=""
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Język ojczysty
          </label>
          <input
            type="text"
            name="motherTongue"
            value={formData.motherTongue || ""}
            onChange={handleChange}
            placeholder="Wprowadź język ojczysty"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numer PESEL
          </label>
          <input
            type="text"
            name="govtId"
            value={formData.govtId || ""}
            onChange={handleChange}
            placeholder="Wprowadź numer PESEL"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Szpitala
          </label>
          <div className="relative">
            <input
              type="text"
              name="hospId"
              value={formData.hospId || ""}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Płeć
          </label>
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
              <span className="ml-2">Mężczyzna</span>
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
              <span className="ml-2">Kobieta</span>
            </label>
          </div>
        </div>
{/* 
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stan Cywilny
          </label>
          <div className="flex gap-4 p-3 bg-primary-lighter rounded-xl">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="maritalStatus"
                value="Single"
                checked={formData.maritalStatus === "Single"}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-teal-500"
              />
              <span className="ml-2">Wolny</span>
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
              <span className="ml-2">Żonaty/Zamężna</span>
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
              <span className="ml-2">Wdowiec/Wdowa</span>
            </label>
          </div>
        </div> */}
      </div>
{/* 
      <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pochodzenie Etniczne
          </label>
          <div className="flex w-[30%] gap-4 p-3 bg-primary-lighter rounded-xl">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="ethnicity"
                value="European"
                checked={formData.ethnicity === "European"}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-teal-500"
              />
              <span className="ml-2">Europejskie</span>
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
              <span className="ml-2">Bengalskie</span>
            </label>
          </div>
        </div> */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID Pacjenta
        </label>
        <input
          type="text"
          name="otherHospitalIds"
          value={formData.otherHospitalIds || ""}
          onChange={handleChange}
          placeholder="Wprowadź ID- auogenerate?"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );
};

export default DemographicsForm;