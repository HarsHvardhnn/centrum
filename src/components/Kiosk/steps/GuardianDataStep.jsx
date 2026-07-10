import { useEffect } from "react";
import { PHONE_COUNTRY_CODES } from "../../../constants/phoneCountryCodes";
import { formatPhoneNumber, getRequiredPhoneLength } from "../../../utils/phoneUtils";

export default function GuardianDataStep({
  formData = {},
  updateFormData,
  patientType,
  mode = "full_registration",
  validation = {},
  onValidationChange,
}) {
  const isSignOnly = mode === "sign_only";
  const readOnlyFields = isSignOnly;

  const update = (field, value) => {
    updateFormData({ [field]: value });
  };

  // Validation logic
  useEffect(() => {
    const errors = [];
    
    if (!formData.guardianFirstName?.trim()) errors.push("Imię opiekuna jest wymagane.");
    if (!formData.guardianLastName?.trim()) errors.push("Nazwisko opiekuna jest wymagane.");
    
    if (!formData.guardianPesel?.trim() || String(formData.guardianPesel).replace(/\D/g, "").length !== 11) {
      errors.push("PESEL opiekuna musi mieć 11 cyfr.");
    }
    
    if (!formData.guardianPhone?.trim()) {
      errors.push("Telefon opiekuna jest wymagany.");
    } else {
      const phoneCode = formData.guardianPhoneCode || "+48";
      const requiredLength = getRequiredPhoneLength(phoneCode);
      const phoneDigits = formData.guardianPhone.replace(/\D/g, "");
      
      if (phoneDigits.length !== requiredLength) {
        if (phoneCode === "+48") {
          errors.push("Numer telefonu opiekuna musi mieć dokładnie 9 cyfr dla Polski.");
        } else {
          errors.push(`Numer telefonu opiekuna musi mieć ${requiredLength} cyfr dla wybranego kraju.`);
        }
      }
    }
    
    if (!formData.guardianRelation?.trim()) errors.push("Stosunek do pacjenta jest wymagany.");

    // Validate guardian email format if provided
    if (formData.guardianEmail && formData.guardianEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.guardianEmail)) {
        errors.push("Podaj poprawny adres e-mail opiekuna.");
      }
    }

    const isValid = errors.length === 0;
    onValidationChange?.({ isValid, errors });
  }, [formData, onValidationChange]);

  return (
    <div className="space-y-6">
      {/* Patient Summary Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Pacjent</h4>
        <div className="text-blue-800 text-sm">
          <p><strong>{formData.firstName} {formData.lastName}</strong></p>
          <p>PESEL: {formData.pesel}</p>
        </div>
      </div>

      <div className="bg-yellow-50 rounded-xl p-6 space-y-4 border border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">Dane przedstawiciela ustawowego</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Imię opiekuna *</label>
            <input
              type="text"
              value={formData.guardianFirstName || ""}
              onChange={(e) => update("guardianFirstName", e.target.value)}
              readOnly={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nazwisko opiekuna *</label>
            <input
              type="text"
              value={formData.guardianLastName || ""}
              onChange={(e) => update("guardianLastName", e.target.value)}
              readOnly={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PESEL opiekuna *</label>
            <input
              type="text"
              value={formData.guardianPesel || ""}
              onChange={(e) => update("guardianPesel", e.target.value.replace(/\D/g, "").slice(0, 11))}
              readOnly={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg font-mono focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              maxLength={11}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pokrewieństwo *</label>
            <select
              value={formData.guardianRelation || "matka"}
              onChange={(e) => update("guardianRelation", e.target.value)}
              disabled={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="matka">Matka</option>
              <option value="ojciec">Ojciec</option>
              <option value="opiekun_prawny">Opiekun prawny</option>
              <option value="opiekun_faktyczny">Opiekun faktyczny</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kod kraju</label>
            <select
              value={formData.guardianPhoneCode || "+48"}
              onChange={(e) => update("guardianPhoneCode", e.target.value)}
              disabled={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              {PHONE_COUNTRY_CODES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.code} {country.country}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Telefon opiekuna *</label>
            <input
              type="tel"
              value={formData.guardianPhone || ""}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                const maxLength = getRequiredPhoneLength(formData.guardianPhoneCode || "+48");
                update("guardianPhone", formatted.slice(0, maxLength));
              }}
              placeholder={(formData.guardianPhoneCode || "+48") === "+48" ? "123456789" : ""}
              maxLength={getRequiredPhoneLength(formData.guardianPhoneCode || "+48")}
              readOnly={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">E-mail opiekuna (opcjonalnie)</label>
          <input
            type="email"
            value={formData.guardianEmail || ""}
            onChange={(e) => update("guardianEmail", e.target.value)}
            readOnly={readOnlyFields}
            placeholder="nazwa@domena.pl"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>
      </div>

      {/* Show validation errors */}
      {validation?.errors?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-red-800 font-medium mb-2">Popraw następujące błędy:</h4>
          <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}