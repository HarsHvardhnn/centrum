import { useFormContext } from "../../context/SubStepFormContext";
import { useState, useEffect } from "react";
import { normalizePesel } from "../../utils/peselUtils";
import { PHONE_COUNTRY_CODES, FlagIcon } from "../../constants/phoneCountryCodes";

const DetailsForm = () => {
  const { formData, updateFormData } = useFormContext();
  
  console.log("DetailsForm - Form context data:", {
    contactPerson1PhoneCode: formData.contactPerson1PhoneCode,
    contactPerson1Phone: formData.contactPerson1Phone,
    contactPerson2PhoneCode: formData.contactPerson2PhoneCode,
    contactPerson2Phone: formData.contactPerson2Phone
  });
  
  // State for dropdowns
  const [dropdownOpen1, setDropdownOpen1] = useState(false);
  const [dropdownOpen2, setDropdownOpen2] = useState(false);
  
  // Phone country codes with validation
  const phoneCountryCodes = PHONE_COUNTRY_CODES;

  // Get current phone codes from form data or default to +48
  const currentPhoneCode1 = formData.contactPerson1PhoneCode || "+48";
  const currentPhoneCode2 = formData.contactPerson2PhoneCode || "+48";
  
  const currentCountry1 = phoneCountryCodes.find(c => c.code === currentPhoneCode1) || phoneCountryCodes[0];
  const currentCountry2 = phoneCountryCodes.find(c => c.code === currentPhoneCode2) || phoneCountryCodes[0];
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "contactPerson1Pesel" || name === "contactPerson2Pesel") {
      updateFormData(name, normalizePesel(value));
      return;
    }
    updateFormData(name, type === 'checkbox' ? checked : value);
  };

  // Handle phone code change for contact person 1
  const handlePhoneCodeChange1 = (newCode) => {
    console.log("DetailsForm - Contact person 1 phone code changed to:", newCode);
    updateFormData("contactPerson1PhoneCode", newCode);
    
    // Update the placeholder based on new country
    const newCountry = phoneCountryCodes.find(c => c.code === newCode);
    if (newCountry) {
      // Clear any existing phone number if it doesn't match the new country's length
      const currentPhone = formData.contactPerson1Phone || "";
      if (currentPhone && currentPhone.length !== newCountry.maxLength) {
        updateFormData("contactPerson1Phone", "");
      }
    }
  };

  // Handle phone code change for contact person 2
  const handlePhoneCodeChange2 = (newCode) => {
    console.log("DetailsForm - Contact person 2 phone code changed to:", newCode);
    updateFormData("contactPerson2PhoneCode", newCode);
    
    // Update the placeholder based on new country
    const newCountry = phoneCountryCodes.find(c => c.code === newCode);
    if (newCountry) {
      // Clear any existing phone number if it doesn't match the new country's length
      const currentPhone = formData.contactPerson2Phone || "";
      if (currentPhone && currentPhone.length !== newCountry.maxLength) {
        updateFormData("contactPerson2Phone", "");
      }
    }
  };

  // Handle phone number input change for contact person 1
  const handlePhoneNumberChange1 = (e) => {
    const value = e.target.value;
    const numbersOnly = value.replace(/\D/g, "").slice(0, currentCountry1.maxLength);
    console.log("DetailsForm - Contact person 1 phone number changed:", {
      originalValue: value,
      numbersOnly: numbersOnly,
      maxLength: currentCountry1.maxLength
    });
    updateFormData("contactPerson1Phone", numbersOnly);
    
    // Debug: Check if the form data was updated
    setTimeout(() => {
      console.log("DetailsForm - After updateFormData, contactPerson1Phone:", formData.contactPerson1Phone);
    }, 0);
  };

  // Handle phone number input change for contact person 2
  const handlePhoneNumberChange2 = (e) => {
    const value = e.target.value;
    const numbersOnly = value.replace(/\D/g, "").slice(0, currentCountry2.maxLength);
    console.log("DetailsForm - Contact person 2 phone number changed:", {
      originalValue: value,
      numbersOnly: numbersOnly,
      maxLength: currentCountry2.maxLength
    });
    updateFormData("contactPerson2Phone", numbersOnly);
  };

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen1 && !event.target.closest(".country-dropdown")) {
        setDropdownOpen1(false);
      }
      if (dropdownOpen2 && !event.target.closest(".country-dropdown")) {
        setDropdownOpen2(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen1, dropdownOpen2]);

  // Debug form data changes
  useEffect(() => {
    console.log("DetailsForm - Contact person phone data updated:", {
      contactPerson1PhoneCode: formData.contactPerson1PhoneCode,
      contactPerson1Phone: formData.contactPerson1Phone,
      contactPerson2PhoneCode: formData.contactPerson2PhoneCode,
      contactPerson2Phone: formData.contactPerson2Phone,
      currentPhoneCode1,
      currentPhoneCode2
    });
  }, [formData.contactPerson1PhoneCode, formData.contactPerson1Phone, formData.contactPerson2PhoneCode, formData.contactPerson2Phone, currentPhoneCode1, currentPhoneCode2]);

  // Debug current form data for submission
  useEffect(() => {
    console.log("DetailsForm - Current form data for submission:", {
      contactPerson1PhoneCode: formData.contactPerson1PhoneCode,
      contactPerson1Phone: formData.contactPerson1Phone,
      contactPerson2PhoneCode: formData.contactPerson2PhoneCode,
      contactPerson2Phone: formData.contactPerson2Phone,
      fullFormData: formData
    });
  }, [formData]);

  // Helper function to get combined phone numbers for backend submission
  // These functions combine the phone code with the phone number for backend API calls
  // When submitting the form, use these functions to get the full phone numbers
  const getCombinedPhone1 = () => {
    return (formData.contactPerson1PhoneCode || "+48") + (formData.contactPerson1Phone || "");
  };

  const getCombinedPhone2 = () => {
    return (formData.contactPerson2PhoneCode || "+48") + (formData.contactPerson2Phone || "");
  };

  // Function to ensure form data is properly synced before submission
  const syncFormData = () => {
    console.log("DetailsForm - Syncing form data before submission:", {
      contactPerson1PhoneCode: formData.contactPerson1PhoneCode,
      contactPerson1Phone: formData.contactPerson1Phone,
      contactPerson2PhoneCode: formData.contactPerson2PhoneCode,
      contactPerson2Phone: formData.contactPerson2Phone
    });
    
    // Force update the form context with current values
    if (formData.contactPerson1PhoneCode && formData.contactPerson1Phone) {
      updateFormData("contactPerson1Phone", formData.contactPerson1Phone);
    }
    if (formData.contactPerson2PhoneCode && formData.contactPerson2Phone) {
      updateFormData("contactPerson2Phone", formData.contactPerson2Phone);
    }
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
              {/* Custom Country Code Dropdown */}
              <div className="relative w-24 country-dropdown">
                <button
                  type="button"
                  onClick={() => setDropdownOpen1(!dropdownOpen1)}
                  className="w-full h-[42px] px-3 border border-gray-300 rounded-l-md border-r-0 bg-gray-50 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                >
                  <span className="flex items-center">
                    <span className="mr-1">{currentCountry1.flag}</span>
                    <span className="text-xs">{currentCountry1.code}</span>
                  </span>
                  <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Options */}
                {dropdownOpen1 && (
                  <div className="absolute top-full left-0 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                    {phoneCountryCodes.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          handlePhoneCodeChange1(country.code);
                          setDropdownOpen1(false);
                        }}
                        className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center ${
                          currentPhoneCode1 === country.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
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
              
              {/* Phone Number Input - Shows only the phone number (without country code) */}
              <input
                type="tel"
                name="contactPerson1Phone"
                value={formData.contactPerson1Phone || ""}
                onChange={handlePhoneNumberChange1}
                placeholder={`Wprowadź ${currentCountry1.maxLength} cyfr`}
                maxLength={currentCountry1.maxLength}
                className="flex-1 h-[42px] px-3 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onBlur={() => console.log("Contact Person 1 Phone Input Blur:", formData.contactPerson1Phone)}
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
              inputMode="numeric"
              name="contactPerson1Pesel"
              value={formData.contactPerson1Pesel || ""}
              onChange={handleChange}
              placeholder="Wprowadź PESEL (11 cyfr)"
              maxLength={11}
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
              {/* Custom Country Code Dropdown */}
              <div className="relative w-24 country-dropdown">
                <button
                  type="button"
                  onClick={() => setDropdownOpen2(!dropdownOpen2)}
                  className="w-full h-[42px] px-3 border border-gray-300 rounded-l-md border-r-0 bg-gray-50 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                >
                  <span className="flex items-center">
                    <span className="mr-1">{currentCountry2.flag}</span>
                    <span className="text-xs">{currentCountry2.code}</span>
                  </span>
                  <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Options */}
                {dropdownOpen2 && (
                  <div className="absolute top-full left-0 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                    {phoneCountryCodes.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          handlePhoneCodeChange2(country.code);
                          setDropdownOpen2(false);
                        }}
                        className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center ${
                          currentPhoneCode2 === country.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
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
              
              {/* Phone Number Input - Shows only the phone number (without country code) */}
              <input
                type="tel"
                name="contactPerson2Phone"
                value={formData.contactPerson2Phone || ""}
                onChange={handlePhoneNumberChange2}
                placeholder={`Wprowadź ${currentCountry2.maxLength} cyfr`}
                maxLength={currentCountry2.maxLength}
                className="flex-1 h-[42px] px-3 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onBlur={() => console.log("Contact Person 2 Phone Input Blur:", formData.contactPerson2Phone)}
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
              inputMode="numeric"
              name="contactPerson2Pesel"
              value={formData.contactPerson2Pesel || ""}
              onChange={handleChange}
              placeholder="Wprowadź PESEL (11 cyfr)"
              maxLength={11}
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
