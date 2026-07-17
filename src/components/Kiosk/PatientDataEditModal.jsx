import { useState, useEffect } from "react";
import { formatPolishPostalCode, validatePolishPostalCode } from "../../utils/postalCodeUtils";
import { validatePhoneNumber, formatPhoneNumber, formatPhoneForDisplay } from "../../utils/phoneUtils";
import { PHONE_COUNTRY_CODES } from "../../constants/phoneCountryCodes.jsx";

const VOIVODESHIPS = [
  "dolnośląskie", "kujawsko-pomorskie", "lubelskie", "lubuskie", "łódzkie",
  "małopolskie", "mazowieckie", "opolskie", "podkarpackie", "podlaskie", 
  "pomorskie", "śląskie", "świętokrzyskie", "warmińsko-mazurskie",
  "wielkopolskie", "zachodniopomorskie",
];

export default function PatientDataEditModal({
  isOpen,
  onClose,
  formData = {},
  onSave,
  patientType,
  mode = "full_registration"
}) {
  const [editData, setEditData] = useState({});
  const [errors, setErrors] = useState([]);
  const [guardianErrors, setGuardianErrors] = useState([]);

  const isSignOnly = mode === "sign_only";
  const readOnlyFields = isSignOnly;
  const requiresGuardian = patientType === 'minor_under_16' || patientType === 'minor_16_17';
  const isInternational = patientType === 'international';

  // Initialize edit data when modal opens
  useEffect(() => {
    if (isOpen) {
      setEditData({
        // Personal data
        firstName: formData.firstName || "",
        lastName: formData.lastName || "",
        pesel: formData.pesel || "",
        dateOfBirth: formData.dateOfBirth || "",
        sex: formData.sex || "",
        // Address
        street: formData.street || "",
        zipCode: formData.zipCode || "",
        city: formData.city || "",
        province: formData.province || "",
        // Contact
        phoneCode: formData.phoneCode || "+48",
        phone: formData.phone || "",
        email: formData.email || "",
        // International fields
        documentType: formData.documentType || "",
        documentNumber: formData.documentNumber || "",
        documentCountry: formData.documentCountry || "",
        // Guardian data (if required)
        guardianFirstName: formData.guardianFirstName || "",
        guardianLastName: formData.guardianLastName || "",
        guardianPesel: formData.guardianPesel || "",
        guardianPhoneCode: formData.guardianPhoneCode || "+48",
        guardianPhone: formData.guardianPhone || "",
        guardianEmail: formData.guardianEmail || "",
        guardianRelation: formData.guardianRelation || "matka",
      });
      setErrors([]);
      setGuardianErrors([]);
    }
  }, [isOpen, formData]);

  const update = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  // Validation
  const validateData = () => {
    const newErrors = [];
    const newGuardianErrors = [];

    // Personal data validation
    if (!editData.firstName?.trim()) newErrors.push("Imię jest wymagane.");
    if (!editData.lastName?.trim()) newErrors.push("Nazwisko jest wymagane.");
    if (!editData.sex?.trim()) newErrors.push("Płeć jest wymagana.");

    if (!isInternational) {
      if (!editData.pesel?.trim() || editData.pesel.length !== 11) {
        newErrors.push("PESEL musi mieć 11 cyfr.");
      }
    } else {
      if (!editData.documentType?.trim()) newErrors.push("Typ dokumentu jest wymagany.");
      if (!editData.documentNumber?.trim()) newErrors.push("Numer dokumentu jest wymagany.");
      if (!editData.documentCountry?.trim()) newErrors.push("Kraj wydania dokumentu jest wymagany.");
    }

    // Address validation
    if (!editData.street?.trim()) newErrors.push("Ulica i numer są wymagane.");
    if (!editData.zipCode?.trim()) newErrors.push("Kod pocztowy jest wymagany.");
    if (!editData.city?.trim()) newErrors.push("Miejscowość jest wymagana.");
    if (!editData.province?.trim()) newErrors.push("Województwo jest wymagane.");

    // Validate postal code format
    if (editData.zipCode && !validatePolishPostalCode(editData.zipCode)) {
      newErrors.push("Kod pocztowy musi mieć format XX-XXX (np. 26-110).");
    }

    // Contact validation
    if (!editData.phone?.trim()) {
      newErrors.push("Numer telefonu jest wymagany.");
    } else {
      const phoneValidation = validatePhoneNumber(editData.phone, editData.phoneCode);
      if (!phoneValidation.valid) {
        newErrors.push(phoneValidation.message);
      }
    }

    // Email validation
    if (editData.email && editData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editData.email)) {
        newErrors.push("Podaj poprawny adres e-mail.");
      }
    }

    // Guardian validation (if required)
    if (requiresGuardian) {
      if (!editData.guardianFirstName?.trim()) newGuardianErrors.push("Imię opiekuna jest wymagane.");
      if (!editData.guardianLastName?.trim()) newGuardianErrors.push("Nazwisko opiekuna jest wymagane.");
      if (!editData.guardianPesel?.trim() || editData.guardianPesel.length !== 11) {
        newGuardianErrors.push("PESEL opiekuna musi mieć 11 cyfr.");
      }
      if (!editData.guardianPhone?.trim()) {
        newGuardianErrors.push("Numer telefonu opiekuna jest wymagany.");
      } else {
        const guardianPhoneValidation = validatePhoneNumber(editData.guardianPhone, editData.guardianPhoneCode);
        if (!guardianPhoneValidation.valid) {
          newGuardianErrors.push(`Telefon opiekuna: ${guardianPhoneValidation.message}`);
        }
      }
      if (!editData.guardianRelation?.trim()) newGuardianErrors.push("Stosunek do pacjenta jest wymagany.");

      // Guardian email validation
      if (editData.guardianEmail && editData.guardianEmail.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(editData.guardianEmail)) {
          newGuardianErrors.push("Podaj poprawny adres e-mail opiekuna.");
        }
      }
    }

    setErrors(newErrors);
    setGuardianErrors(newGuardianErrors);

    return newErrors.length === 0 && newGuardianErrors.length === 0;
  };

  const handleSave = () => {
    if (validateData()) {
      onSave(editData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">✏️ Edytuj dane pacjenta</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Error Messages */}
          {(errors.length > 0 || guardianErrors.length > 0) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-red-900 mb-2">Popraw następujące błędy:</h4>
              <ul className="text-sm text-red-800 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
                {guardianErrors.map((error, index) => (
                  <li key={`guardian-${index}`}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Patient Data Section */}
          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Dane podstawowe pacjenta</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imię *</label>
                <input
                  type="text"
                  value={editData.firstName || ""}
                  onChange={(e) => update("firstName", e.target.value)}
                  readOnly={readOnlyFields}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nazwisko *</label>
                <input
                  type="text"
                  value={editData.lastName || ""}
                  onChange={(e) => update("lastName", e.target.value)}
                  readOnly={readOnlyFields}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* PESEL or Document fields */}
              {!isInternational ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PESEL *</label>
                  <input
                    type="text"
                    value={editData.pesel || ""}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "").slice(0, 11);
                      update("pesel", cleaned);
                    }}
                    readOnly={readOnlyFields}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    maxLength="11"
                    placeholder="12345678901"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Typ dokumentu *</label>
                    <select
                      value={editData.documentType || ""}
                      onChange={(e) => update("documentType", e.target.value)}
                      readOnly={readOnlyFields}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Wybierz typ dokumentu</option>
                      <option value="Passport">Paszport</option>
                      <option value="ID Card">Dowód osobisty</option>
                      <option value="Residence Card">Karta pobytu</option>
                      <option value="Other">Inny</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Numer dokumentu *</label>
                    <input
                      type="text"
                      value={editData.documentNumber || ""}
                      onChange={(e) => update("documentNumber", e.target.value)}
                      readOnly={readOnlyFields}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kraj wydania *</label>
                    <input
                      type="text"
                      value={editData.documentCountry || ""}
                      onChange={(e) => update("documentCountry", e.target.value)}
                      readOnly={readOnlyFields}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="np. Poland, Germany"
                    />
                  </div>
                </>
              )}

              {/* Sex */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Płeć *</label>
                <select
                  value={editData.sex || ""}
                  onChange={(e) => update("sex", e.target.value)}
                  readOnly={readOnlyFields}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Wybierz płeć</option>
                  <option value="M">Mężczyzna</option>
                  <option value="K">Kobieta</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-teal-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-teal-900 mb-4">Adres zamieszkania</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ulica i numer *</label>
                <input
                  type="text"
                  value={editData.street || ""}
                  onChange={(e) => update("street", e.target.value)}
                  readOnly={readOnlyFields}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kod pocztowy *</label>
                <input
                  type="text"
                  value={editData.zipCode || ""}
                  onChange={(e) => {
                    const formatted = formatPolishPostalCode(e.target.value);
                    update("zipCode", formatted);
                  }}
                  readOnly={readOnlyFields}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="00-000"
                  maxLength="6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Miejscowość *</label>
                <input
                  type="text"
                  value={editData.city || ""}
                  onChange={(e) => update("city", e.target.value)}
                  readOnly={readOnlyFields}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Województwo *</label>
                <select
                  value={editData.province || ""}
                  onChange={(e) => update("province", e.target.value)}
                  readOnly={readOnlyFields}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Wybierz województwo</option>
                  {VOIVODESHIPS.map((voivodeship) => (
                    <option key={voivodeship} value={voivodeship}>
                      {voivodeship}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-green-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">Dane kontaktowe</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kod kraju</label>
                <select
                  value={editData.phoneCode || "+48"}
                  onChange={(e) => update("phoneCode", e.target.value)}
                  readOnly={readOnlyFields}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {PHONE_COUNTRY_CODES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.code} {country.country}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefon *</label>
                <input
                  type="tel"
                  value={formatPhoneForDisplay(editData.phone || "", editData.phoneCode || "+48")}
                  onChange={(e) => {
                    const cleaned = formatPhoneNumber(e.target.value);
                    update("phone", cleaned);
                  }}
                  readOnly={readOnlyFields}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder={(editData.phoneCode || "+48") === "+48" ? "123 456 789" : ""}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mail (opcjonalnie)</label>
              <input
                type="email"
                value={editData.email || ""}
                onChange={(e) => update("email", e.target.value)}
                readOnly={readOnlyFields}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="twoj@email.com"
              />
            </div>
          </div>

          {/* Guardian Section (if required) */}
          {requiresGuardian && (
            <div className="bg-yellow-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">Dane opiekuna prawnego</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imię opiekuna *</label>
                  <input
                    type="text"
                    value={editData.guardianFirstName || ""}
                    onChange={(e) => update("guardianFirstName", e.target.value)}
                    readOnly={readOnlyFields}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nazwisko opiekuna *</label>
                  <input
                    type="text"
                    value={editData.guardianLastName || ""}
                    onChange={(e) => update("guardianLastName", e.target.value)}
                    readOnly={readOnlyFields}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PESEL opiekuna *</label>
                  <input
                    type="text"
                    value={editData.guardianPesel || ""}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "").slice(0, 11);
                      update("guardianPesel", cleaned);
                    }}
                    readOnly={readOnlyFields}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    maxLength="11"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pokrewieństwo *</label>
                  <select
                    value={editData.guardianRelation || "matka"}
                    onChange={(e) => update("guardianRelation", e.target.value)}
                    readOnly={readOnlyFields}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="matka">Matka</option>
                    <option value="ojciec">Ojciec</option>
                    <option value="opiekun_prawny">Opiekun prawny</option>
                    <option value="opiekun_faktyczny">Opiekun faktyczny</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefon opiekuna *</label>
                  <div className="grid grid-cols-3 gap-4">
                    <select
                      value={editData.guardianPhoneCode || "+48"}
                      onChange={(e) => update("guardianPhoneCode", e.target.value)}
                      readOnly={readOnlyFields}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    >
                      {PHONE_COUNTRY_CODES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={formatPhoneForDisplay(editData.guardianPhone || "", editData.guardianPhoneCode || "+48")}
                      onChange={(e) => {
                        const cleaned = formatPhoneNumber(e.target.value);
                        update("guardianPhone", cleaned);
                      }}
                      readOnly={readOnlyFields}
                      className="col-span-2 w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder={(editData.guardianPhoneCode || "+48") === "+48" ? "123 456 789" : ""}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-mail opiekuna (opcjonalnie)</label>
                  <input
                    type="email"
                    value={editData.guardianEmail || ""}
                    onChange={(e) => update("guardianEmail", e.target.value)}
                    readOnly={readOnlyFields}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="opiekun@email.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Anuluj
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              💾 Zapisz zmiany
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}