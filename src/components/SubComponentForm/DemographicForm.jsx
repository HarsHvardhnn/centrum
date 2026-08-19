// components/AppointmentForm/DemographicForm.jsx
import { useFormContext } from "../../context/SubStepFormContext";
import { useState, useEffect } from "react";
import { normalizePesel, getPeselChecksumWarning } from "../../utils/peselUtils";
import patientService, { isSamePatientAsDocumentMatch } from "../../helpers/patientHelper";
import { apiCaller } from "../../utils/axiosInstance";
import { toast } from "sonner";
import { PHONE_COUNTRY_CODES, FlagIcon } from "../../constants/phoneCountryCodes";
import { isIdentityDocumentExpired, todayYmd } from "../../utils/identityDocument";

const DOCUMENT_TYPES = [
  { value: "", label: "Wybierz typ" },
  { value: "Passport", label: "Paszport" },
  { value: "ID Card", label: "Dowód osobisty" },
  { value: "Residence Card", label: "Karta pobytu" },
  { value: "Other", label: "Inny" },
];

const DemographicsForm = ({
  selectedPhoneCode,
  onPhoneCodeChange,
  onPhoneNumberChange,
  phoneValidationError,
  phoneCountryCodes: externalPhoneCountryCodes,
  onRemoveEmail,
  isEditMode = false,
  currentPatientId = null,
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
    mobileNumber: "",
    documentNumber: ""
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [peselExists, setPeselExists] = useState(false);
  const [peselCheckLoading, setPeselCheckLoading] = useState(false);
  const [documentNumberExists, setDocumentNumberExists] = useState(false);
  const [documentNumberCheckLoading, setDocumentNumberCheckLoading] = useState(false);

  const phoneCountryCodes = externalPhoneCountryCodes ?? PHONE_COUNTRY_CODES;

  // When international patient and document fields filled, check (debounced) if document number already exists
  useEffect(() => {
    if (
      !formData.isInternationalPatient ||
      !formData.documentNumber?.trim() ||
      !formData.documentCountry?.trim() ||
      !formData.documentType?.trim()
    ) {
      setDocumentNumberExists(false);
      setDocumentNumberCheckLoading(false);
      return;
    }

    let cancelled = false;
    setDocumentNumberCheckLoading(true);
    setDocumentNumberExists(false);

    const timeoutId = setTimeout(() => {
      patientService
        .getPatientByDocumentNumber(
          formData.documentNumber.trim(),
          formData.documentCountry.trim(),
          formData.documentType.trim()
        )
        .then((res) => {
          if (cancelled) return;
          const isCurrentPatient =
            isEditMode &&
            isSamePatientAsDocumentMatch(
              res,
              currentPatientId,
              formData.patient_id,
              formData.patientId,
              formData._id
            );
          const isOtherPatient = !!(res?.exists && !isCurrentPatient);
          setDocumentNumberExists(!!isOtherPatient);
          setErrors((prev) => ({
            ...prev,
            documentNumber: isOtherPatient
              ? "Pacjent z tym numerem dokumentu już istnieje w systemie."
              : "",
          }));
        })
        .catch(() => {
          if (!cancelled) setDocumentNumberExists(false);
          if (!cancelled)
            setErrors((prev) => ({
              ...prev,
              documentNumber: "",
            }));
        })
        .finally(() => {
          if (!cancelled) setDocumentNumberCheckLoading(false);
        });
    }, 500); // debounce document check by 500ms

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [
    formData.isInternationalPatient,
    formData.documentNumber,
    formData.documentCountry,
    formData.documentType,
    isEditMode,
    currentPatientId,
  ]);

  // When adding (not editing) and PESEL has 11 digits and not international, check if patient already exists
  useEffect(() => {
    if (isEditMode || formData.isInternationalPatient || !formData.govtId || normalizePesel(formData.govtId).length !== 11) {
      setPeselExists(false);
      return;
    }
    const normalized = normalizePesel(formData.govtId);
    let cancelled = false;
    setPeselCheckLoading(true);
    patientService.getPatientByPesel(normalized).then((res) => {
      if (!cancelled) setPeselExists(!!res?.exists);
    }).catch(() => {
      if (!cancelled) setPeselExists(false);
    }).finally(() => {
      if (!cancelled) setPeselCheckLoading(false);
    });
    return () => { cancelled = true; };
  }, [isEditMode, formData.govtId, formData.isInternationalPatient]);

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

  // PESEL validation function (digits only, exactly 11). When isInternationalPatient, PESEL is not required.
  const validatePesel = (pesel, isInternational) => {
    if (isInternational) return "";
    if (!pesel || pesel.trim() === "") return "Numer PESEL jest wymagany";
    const normalized = normalizePesel(pesel);
    if (normalized.length !== 11) return "Numer PESEL musi mieć dokładnie 11 cyfr";
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
      const digitsOnly = normalizePesel(value);
      updateFormData(name, digitsOnly);
      if (touched[name]) {
        setErrors(prev => ({
          ...prev,
          govtId: validatePesel(digitsOnly, formData.isInternationalPatient)
        }));
      }
    } else if (name === "isInternationalPatient") {
      const checked = type === "checkbox" ? e.target.checked : value;
      updateFormData(name, checked);
      if (checked) {
        updateFormData("govtId", "");
        setErrors(prev => ({ ...prev, govtId: "" }));
        setPeselExists(false);
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
          <div className="flex gap-2">
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              placeholder="Wprowadź adres e-mail"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            {onRemoveEmail && formData.email && formData.email.trim() && formData.patient_id && (
              <button
                onClick={onRemoveEmail}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md flex items-center gap-1 flex-shrink-0"
                title="Usuń email pacjenta"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            )}
          </div>
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
                      <span className="mr-2"><FlagIcon countryCode={country.flag} /></span>
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
              placeholder={(formData.mobileNumber || "").trim() ? `Wprowadź ${currentCountry.maxLength} cyfr` : "-"}
              maxLength={currentCountry.maxLength}
              className={`flex-1 h-[42px] px-3 border ${touched.mobileNumber && errors.mobileNumber ? 'border-red-500' : 'border-gray-300'} rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          {(touched.mobileNumber && errors.mobileNumber) || phoneValidationError ? (
            <p className="mt-1 text-sm text-red-500">
              {phoneValidationError || errors.mobileNumber}
            </p>
          ) : null}
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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numer PESEL {!formData.isInternationalPatient && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            name="govtId"
            value={formData.govtId || ""}
            onChange={handleChange}
            onBlur={() => handleBlur("govtId")}
            placeholder={formData.isInternationalPatient ? "Nie dotyczy – pacjent międzynarodowy" : "Wprowadź numer PESEL (11 cyfr)"}
            maxLength={11}
            disabled={!!formData.isInternationalPatient}
            className={`w-full px-3 py-2 border rounded-md ${formData.isInternationalPatient ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300" : touched.govtId && errors.govtId ? "border-red-500" : "border-gray-300"}`}
            required={!formData.isInternationalPatient}
          />
          {touched.govtId && errors.govtId && (
            <p className="mt-1 text-sm text-red-500">{errors.govtId}</p>
          )}
          {peselCheckLoading && <p className="mt-1 text-xs text-gray-500">Sprawdzam PESEL...</p>}
          {!formData.isInternationalPatient && formData.govtId && formData.govtId.length === 11 && getPeselChecksumWarning(formData.govtId) && (
            <p className="mt-1 text-sm text-amber-600" role="alert">
              {getPeselChecksumWarning(formData.govtId)}
            </p>
          )}
          {!isEditMode && !formData.isInternationalPatient && peselExists && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">Pacjent o podanym numerze PESEL już istnieje w systemie.</p>
            </div>
          )}
          {formData.isInternationalPatient && (
            <p className="mt-1 text-sm text-gray-500">PESEL does not apply to international patients.</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 py-2 border-t border-gray-200 mt-4">
        <input
          type="checkbox"
          id="isInternationalPatient"
          name="isInternationalPatient"
          checked={!!formData.isInternationalPatient}
          onChange={handleChange}
          disabled={!!isEditMode}
          className={`h-4 w-4 text-teal-500 border-gray-300 rounded ${isEditMode ? "opacity-60 cursor-not-allowed" : ""}`}
        />
        <label htmlFor="isInternationalPatient" className={`text-sm font-medium text-gray-700 ${isEditMode ? "text-gray-500" : ""}`}>
          Pacjent międzynarodowy
        </label>
        <span className="text-xs text-gray-500">— Zaznacz, aby wyświetlić pola dokumentu tożsamości</span>
      </div>

      {formData.isInternationalPatient && (
        <>
          <div className="border-t border-gray-200 pt-6 mt-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Dane dokumentu tożsamości</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kraj wydania dokumentu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="documentCountry"
                  value={formData.documentCountry || ""}
                  onChange={handleChange}
                  placeholder="np. Polska, Niemcy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Typ dokumentu <span className="text-red-500">*</span>
                </label>
                <select
                  name="documentType"
                  value={formData.documentType || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {DOCUMENT_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numer dokumentu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="documentNumber"
                  value={formData.documentNumber || ""}
                  onChange={handleChange}
                  placeholder="Numer dokumentu"
                  className={`w-full px-3 py-2 border rounded-md ${errors.documentNumber ? "border-red-500" : "border-gray-300"}`}
                />
                {documentNumberCheckLoading && (
                  <p className="mt-0.5 text-xs text-gray-500">Sprawdzanie numeru dokumentu…</p>
                )}
                {errors.documentNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.documentNumber}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data urodzenia (z dokumentu) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="documentDateOfBirth"
                  value={formatDateForInput(formData.documentDateOfBirth || formData.dateOfBirth) || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data wydania dokumentu <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="documentIssueDate"
                  value={formatDateForInput(formData.documentIssueDate) || ""}
                  onChange={handleChange}
                  max={todayYmd()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {formData.documentIssueDate &&
                  formData.documentExpiryDate &&
                  new Date(formData.documentExpiryDate) <= new Date(formData.documentIssueDate) && (
                  <p className="text-red-500 text-xs mt-1">
                    Data wydania musi być wcześniejsza niż data ważności.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data ważności dokumentu
                </label>
                <input
                  type="date"
                  name="documentExpiryDate"
                  value={formatDateForInput(formData.documentExpiryDate) || ""}
                  onChange={handleChange}
                  min={todayYmd()}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isIdentityDocumentExpired(formData.documentExpiryDate)
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {isIdentityDocumentExpired(formData.documentExpiryDate) && (
                  <p className="text-red-500 text-xs mt-1">Dokument jest już wygasły.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Obywatelstwo
                </label>
                <input
                  type="text"
                  name="citizenship"
                  value={formData.citizenship || ""}
                  onChange={handleChange}
                  placeholder="Obywatelstwo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              {!isEditMode && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      placeholder="E-mail (jak w sekcji powyżej)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <p className="mt-0.5 text-xs text-gray-500">Ta sama wartość co w polu E-mail powyżej.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numer telefonu
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber || ""}
                      onChange={handleChange}
                      placeholder="Numer (jak w sekcji powyżej)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <p className="mt-0.5 text-xs text-gray-500">Ta sama wartość co w polu Telefon powyżej.</p>
                  </div>
                </>
              )}
            </div>
          </div>

        </>
      )}

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
        <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
          {formData.patientId || currentPatientId
            ? (formData.patientId || currentPatientId)
            : "Nie zweryfikowano"}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          ID jest przypisywane przez system po weryfikacji pacjenta.
        </p>
      </div>
    </div>
  );
};

export default DemographicsForm;
