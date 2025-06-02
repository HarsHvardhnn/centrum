// components/AppointmentForm/DemographicForm.jsx
import { useFormContext } from "../../context/SubStepFormContext";
import { useState, useEffect } from "react";

const DemographicsForm = () => {
  const { formData, updateFormData } = useFormContext();
  const [touched, setTouched] = useState({
    email: false,
    mobileNumber: false,
    dateOfBirth: false,
    sex: false
  });
  const [errors, setErrors] = useState({
    email: "",
    mobileNumber: "",
    dateOfBirth: "",
    sex: ""
  });

  // Email validation function
  const validateEmail = (email) => {
    if (!email) return ""; // Empty is allowed
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? "" : "Nieprawidłowy format adresu email";
  };

  // Phone number validation function
  const validatePhone = (phone) => {
    if (!phone) return "Numer telefonu jest wymagany";
    const phoneRegex = /^\d{9}$/;
    return phoneRegex.test(phone) ? "" : "Numer telefonu musi mieć dokładnie 9 cyfr";
  };

  // Date of birth validation function
  const validateDateOfBirth = (date) => {
    if (!date) return "Data urodzenia jest wymagana";
    const selectedDate = new Date(date);
    const today = new Date();
    if (selectedDate > today) return "Data urodzenia nie może być w przyszłości";
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
    
    if (name === "mobileNumber") {
      const numbersOnly = value.replace(/\D/g, "").slice(0, 9);
      updateFormData(name, numbersOnly);
      if (touched[name]) {
        setErrors(prev => ({
          ...prev,
          mobileNumber: validatePhone(numbersOnly)
        }));
      }
    } else if (name === "email") {
      updateFormData(name, value);
      if (touched[name]) {
        setErrors(prev => ({
          ...prev,
          email: validateEmail(value)
        }));
      }
    } else if (name === "dateOfBirth") {
      updateFormData(name, value);
      if (touched[name]) {
        setErrors(prev => ({
          ...prev,
          dateOfBirth: validateDateOfBirth(value)
        }));
      }
    } else if (name === "sex") {
      updateFormData(name, value);
      setTouched(prev => ({ ...prev, sex: true }));
      setErrors(prev => ({
        ...prev,
        sex: validateSex(value)
      }));
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
            onBlur={() => handleBlur("email")}
            placeholder="Wprowadź adres e-mail"
            className={`w-full px-3 py-2 border ${touched.email && errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {touched.email && errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numer Telefonu <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber || ""}
            onChange={handleChange}
            onBlur={() => handleBlur("mobileNumber")}
            placeholder="Wprowadź 9 cyfr"
            className={`w-full px-3 py-2 border ${touched.mobileNumber && errors.mobileNumber ? 'border-red-500' : 'border-gray-300'} rounded-md`}
            required
          />
          {touched.mobileNumber && errors.mobileNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.mobileNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Urodzenia <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formatDateForInput(formData.dateOfBirth) || ""}
            onChange={handleChange}
            onBlur={() => handleBlur("dateOfBirth")}
            required
            className={`w-full px-3 py-2 border ${touched.dateOfBirth && errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          />
          {touched.dateOfBirth && errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>
          )}
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