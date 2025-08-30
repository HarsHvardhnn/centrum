// components/AppointmentForm/DemographicForm.jsx
import { useFormContext } from "../../context/SubStepFormContext";
import { useState, useEffect } from "react";

// SVG Flag Components
const FlagIcon = ({ countryCode, className = "w-4 h-4" }) => {
  const flags = {
    PL: (
      <svg viewBox="0 0 640 480" className={className}>
        <g fillRule="evenodd">
          <rect width="640" height="480" fill="#fff"/>
          <rect width="640" height="240" y="240" fill="#dc143c"/>
        </g>
      </svg>
    ),
    UA: (
      <svg viewBox="0 0 640 480" className={className}>
        <g fillRule="evenodd">
          <rect width="640" height="240" fill="#005bbb"/>
          <rect width="640" height="240" y="240" fill="#ffd700"/>
        </g>
      </svg>
    ),
    DE: (
      <svg viewBox="0 0 640 480" className={className}>
        <g fillRule="evenodd">
          <rect width="640" height="160" fill="#000"/>
          <rect width="640" height="160" y="160" fill="#dd0000"/>
          <rect width="640" height="160" y="320" fill="#ffce00"/>
        </g>
      </svg>
    ),
    GB: (
      <svg viewBox="0 0 640 480" className={className}>
        <g fillRule="evenodd">
          <rect width="640" height="480" fill="#012169"/>
          <path d="M0 0l640 480M640 0L0 480" stroke="#fff" strokeWidth="3"/>
          <path d="M0 0l640 480M640 0L0 480" stroke="#C8102E" strokeWidth="2"/>
          <path d="M320 0v480M0 240h640" stroke="#fff" strokeWidth="6"/>
          <path d="M320 0v480M0 240h640" stroke="#C8102E" strokeWidth="4"/>
        </g>
      </svg>
    ),
    ES: (
      <svg viewBox="0 0 640 480" className={className}>
        <g fillRule="evenodd">
          <rect width="640" height="480" fill="#c60b1e"/>
          <rect width="640" height="240" y="120" fill="#ffc400"/>
        </g>
      </svg>
    ),
    FR: (
      <svg viewBox="0 0 640 480" className={className}>
        <g fillRule="evenodd">
          <rect width="213.3" height="480" fill="#fff"/>
          <rect width="213.3" height="480" x="213.3" fill="#00267f"/>
          <rect width="213.3" height="480" x="426.6" fill="#f31830"/>
        </g>
      </svg>
    ),
    AT: (
      <svg viewBox="0 0 640 480" className={className}>
        <g fillRule="evenodd">
          <rect width="640" height="160" fill="#fff"/>
          <rect width="640" height="160" y="160" fill="#c8102e"/>
          <rect width="640" height="160" y="320" fill="#fff"/>
        </g>
      </svg>
    ),
    IT: (
      <svg viewBox="0 0 640 480" className={className}>
        <g fillRule="evenodd">
          <rect width="213.3" height="480" fill="#fff"/>
          <rect width="213.3" height="480" x="213.3" fill="#009246"/>
          <rect width="213.3" height="480" x="426.6" fill="#ce2b37"/>
        </g>
      </svg>
    ),
    CZ: (
      <svg viewBox="0 0 640 480" className={className}>
        <g fillRule="evenodd">
          <rect width="640" height="240" fill="#fff"/>
          <rect width="640" height="240" y="240" fill="#d7141a"/>
          <path d="M0 0l320 240L0 480z" fill="#11457e"/>
        </g>
      </svg>
    ),
    US: (
      <svg viewBox="0 0 640 480" className={className}>
        <g fillRule="evenodd">
          <rect width="640" height="480" fill="#fff"/>
          <rect width="640" height="37" fill="#b22234"/>
          <rect width="640" height="37" y="74" fill="#b22234"/>
          <rect width="640" height="37" y="148" fill="#b22234"/>
          <rect width="640" height="37" y="222" fill="#b22234"/>
          <rect width="640" height="37" y="296" fill="#b22234"/>
          <rect width="640" height="37" y="370" fill="#b22234"/>
          <rect width="320" height="259" fill="#3c3b6e"/>
        </g>
      </svg>
    )
  };
  
  return flags[countryCode] || <span className={className}>🏳️</span>;
};

const DemographicsForm = ({
  selectedPhoneCode,
  onPhoneCodeChange,
  onPhoneNumberChange,
  phoneValidationError,
  phoneCountryCodes: externalPhoneCountryCodes
}) => {
  const { formData, updateFormData } = useFormContext();
  const [touched, setTouched] = useState({
    fullName: false,
    govtId: false,
    sex: false,
    mobileNumber: false
  });
  const [errors, setErrors] = useState({
    fullName: "",
    govtId: "",
    sex: "",
    mobileNumber: ""
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.country-dropdown')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);
  


  // Phone country codes with validation - Using SVG flags for better compatibility
  const phoneCountryCodes = [
    { code: "+48", country: "Polska", flag: <FlagIcon countryCode="PL" />, maxLength: 9, default: true },
    { code: "+380", country: "Ukraina", flag: <FlagIcon countryCode="UA" />, maxLength: 9 },
    { code: "+49", country: "Niemcy", flag: <FlagIcon countryCode="DE" />, maxLength: 11 },
    { code: "+44", country: "Wielka Brytania", flag: <FlagIcon countryCode="GB" />, maxLength: 10 },
    { code: "+34", country: "Hiszpania", flag: <FlagIcon countryCode="ES" />, maxLength: 9 },
    { code: "+33", country: "Francja", flag: <FlagIcon countryCode="FR" />, maxLength: 9 },
    { code: "+43", country: "Austria", flag: <FlagIcon countryCode="AT" />, maxLength: 10 },
    { code: "+39", country: "Włochy", flag: <FlagIcon countryCode="IT" />, maxLength: 10 },
    { code: "+420", country: "Czechy", flag: <FlagIcon countryCode="CZ" />, maxLength: 9 },
    { code: "+1", country: "USA", flag: <FlagIcon countryCode="US" />, maxLength: 10 }
  ];



  // Get current phone code from form data, external props, or default to +48
  const currentPhoneCode = formData.phoneCode || selectedPhoneCode || "+48";
  const currentCountry = phoneCountryCodes.find(c => c.code === currentPhoneCode) || phoneCountryCodes[0];

  // Ensure phone field is always up to date with current phone code and mobile number
  useEffect(() => {
    const combinedPhone = currentPhoneCode + (formData.mobileNumber || "");
    if (formData.phone !== combinedPhone) {
      updateFormData("phone", combinedPhone);
    }
    console.log("Phone form data updated:", { 
      phoneCode: formData.phoneCode, 
      mobileNumber: formData.mobileNumber, 
      phone: formData.phone,
      currentPhoneCode 
    });
  }, [currentPhoneCode, formData.mobileNumber, formData.phone]);



  // Monitor form data changes for debugging
  useEffect(() => {
    console.log("Form data changed:", {
      phoneCode: formData.phoneCode,
      mobileNumber: formData.mobileNumber,
      phone: formData.phone
    });
  }, [formData.phoneCode, formData.mobileNumber, formData.phone]);

  // Handle phone code change
  const handlePhoneCodeChange = (newCode) => {
    console.log("Phone code changing to:", newCode);
    updateFormData("phoneCode", newCode);
    
    // Call external handler if provided
    if (onPhoneCodeChange) {
      onPhoneCodeChange(newCode);
    }
    
    // Update the placeholder based on new country
    const newCountry = phoneCountryCodes.find(c => c.code === newCode);
    if (newCountry) {
      // Clear any existing phone number if it doesn't match the new country's length
      const currentPhone = formData.mobileNumber || "";
      if (currentPhone && currentPhone.length !== newCountry.maxLength) {
        updateFormData("mobileNumber", "");
      }
      
      // Also update the combined phone field for backward compatibility
      const combinedPhone = newCode + (formData.mobileNumber || "");
      updateFormData("phone", combinedPhone);
      console.log("Updated combined phone:", combinedPhone);
    }
  };

  // Phone validation function
  const validatePhoneNumber = (phoneNumber, countryCode) => {
    if (!phoneNumber) return "";
    
    const country = phoneCountryCodes.find(c => c.code === countryCode);
    if (!country) return "Nieprawidłowy kod kraju";
    
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== country.maxLength) {
      return `Numer telefonu dla ${country.country} musi mieć ${country.maxLength} cyfr`;
    }
    
    return "";
  };





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
      const numbersOnly = value.replace(/\D/g, "").slice(0, currentCountry.maxLength);
      updateFormData(name, numbersOnly);
      
      // Also update the combined phone field for backward compatibility
      const combinedPhone = currentPhoneCode + numbersOnly;
      updateFormData("phone", combinedPhone);
      
      // Call external handler if provided
      if (onPhoneNumberChange) {
        onPhoneNumberChange(numbersOnly);
      }
      
      // Validate phone number
      if (touched.mobileNumber) {
        const phoneError = validatePhoneNumber(numbersOnly, currentPhoneCode);
        setErrors(prev => ({
          ...prev,
          mobileNumber: phoneError
        }));
      }
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
          <div className="flex">
            {/* Custom Country Code Dropdown */}
            <div className="relative w-24 country-dropdown">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full h-[42px] px-3 border border-gray-300 rounded-l-md border-r-0 bg-gray-50 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
              >
                <span className="flex items-center">
                  <span className="mr-1">{currentCountry.flag}</span>
                  <span className="text-xs">{currentCountry.code}</span>
                </span>
                <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Options */}
              {dropdownOpen && (
                <div className="absolute top-full left-0 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                  {phoneCountryCodes.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => {
                        handlePhoneCodeChange(country.code);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center ${
                        currentPhoneCode === country.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <span className="mr-2">{country.flag}</span>
                      <span className="mr-2">{country.code}</span>
                      <span className="text-xs text-gray-500">{country.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Phone Number Input */}
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber || ""}
              onChange={handleChange}
              onBlur={() => setTouched(prev => ({ ...prev, mobileNumber: true }))}
              placeholder={`Wprowadź ${currentCountry.maxLength} cyfr`}
              maxLength={currentCountry.maxLength}
              className={`flex-1 h-[42px] px-3 border ${touched.mobileNumber && errors.mobileNumber ? 'border-red-500' : 'border-gray-300'} rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          {touched.mobileNumber && errors.mobileNumber && (
            <p className="mt-1 text-sm text-red-500">{errors.mobileNumber}</p>
          )}
          {phoneValidationError && (
            <p className="mt-1 text-sm text-red-500">{phoneValidationError}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            <span className="inline-block mr-1 align-middle">{currentCountry.flag}</span>
            <span className="font-medium text-gray-700">{currentCountry.country}</span> - {currentCountry.maxLength} cyfr
          </p>
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