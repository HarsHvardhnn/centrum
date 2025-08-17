// components/AppointmentForm/DemographicForm.jsx
import { useFormContext } from "../../context/SubStepFormContext";
import { useState, useEffect } from "react";

const DemographicsForm = () => {
  const { formData, updateFormData } = useFormContext();
  const [touched, setTouched] = useState({
    fullName: false,
    govtId: false,
    sex: false
  });
  const [errors, setErrors] = useState({
    fullName: "",
    govtId: "",
    sex: ""
  });

  // Full name validation function
  const validateFullName = (name) => {
    if (!name || name.trim() === "") return "Imię i nazwisko jest wymagane";
    return "";
  };

  // PESEL validation function
  const validatePesel = (pesel) => {
    if (!pesel || pesel.trim() === "") return "Numer PESEL jest wymagany";
    if (pesel.length !== 11) return "Numer PESEL musi mieć dokładnie 11 cyfr";
    if (!/^\d+$/.test(pesel)) return "Numer PESEL może zawierać tylko cyfry";
    return "";
  };

  // Sex validation function
  const validateSex = (sex) => {
    if (!sex) return "Płeć jest wymagana";
    return "";
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (name === "fullName") {
      updateFormData(name, value);
      if (touched[name]) {
        setErrors(prev => ({
          ...prev,
          fullName: validateFullName(value)
        }));
      }
    } else if (name === "govtId") {
      updateFormData(name, value);
      if (touched[name]) {
        setErrors(prev => ({
          ...prev,
          govtId: validatePesel(value)
        }));
      }
    } else if (name === "sex") {
      updateFormData(name, value);
      setTouched(prev => ({ ...prev, sex: true }));
      setErrors(prev => ({
        ...prev,
        sex: validateSex(value)
      }));
    } else if (name === "mobileNumber") {
      const numbersOnly = value.replace(/\D/g, "").slice(0, 9);
      updateFormData(name, numbersOnly);
    } else if (name === "email") {
      updateFormData(name, value);
    } else if (name === "dateOfBirth") {
      updateFormData(name, value);
    } else {
      updateFormData(name, type === "checkbox" ? e.target.checked : value);
    }
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
          Imię i Nazwisko <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName || ""}
          onChange={handleChange}
          onBlur={() => handleBlur("fullName")}
          placeholder="Wprowadź imię i nazwisko"
          className={`w-full px-3 py-2 border ${touched.fullName && errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          required
        />
        {touched.fullName && errors.fullName && (
          <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
        )}
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
            placeholder="Wprowadź 9 cyfr"
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
            value={formatDateForInput(formData.dateOfBirth) || ""}
            onChange={handleChange}
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
            Numer PESEL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="govtId"
            value={formData.govtId || ""}
            onChange={handleChange}
            onBlur={() => handleBlur("govtId")}
            placeholder="Wprowadź numer PESEL"
            className={`w-full px-3 py-2 border ${touched.govtId && errors.govtId ? 'border-red-500' : 'border-gray-300'} rounded-md`}
            required
          />
          {touched.govtId && errors.govtId && (
            <p className="mt-1 text-sm text-red-500">{errors.govtId}</p>
          )}
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
            Płeć <span className="text-red-500">*</span>
          </label>
          <div className={`flex gap-4 p-3 bg-primary-lighter rounded-xl ${touched.sex && errors.sex ? 'border border-red-500' : ''}`}>
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
          {touched.sex && errors.sex && (
            <p className="mt-1 text-sm text-red-500">{errors.sex}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID Pacjenta
        </label>
        <div className="relative group">
          <input
            type="text"
            name="otherHospitalIds"
            value={formData.otherHospitalIds || ""}
            onChange={handleChange}
            placeholder="Wprowadź ID pacjenta"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <svg 
              className="w-5 h-5 text-gray-400 cursor-help" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              title="ID jest generowane automatycznie przez system"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
            ID jest generowane automatycznie przez system
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemographicsForm;