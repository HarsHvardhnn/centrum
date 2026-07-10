import { useEffect } from "react";
import { PHONE_COUNTRY_CODES } from "../../../constants/phoneCountryCodes";
import { formatPhoneNumber, getRequiredPhoneLength } from "../../../utils/phoneUtils";

export default function ContactStep({
  formData = {},
  updateFormData,
  patientType,
  mode = "full_registration",
  validation = {},
  onValidationChange,
}) {
  const isSignOnly = mode === "sign_only";
  const readOnlyFields = isSignOnly;
  const isMinor = patientType === 'minor_under_16' || patientType === 'minor_16_17';

  const update = (field, value) => {
    updateFormData({ [field]: value });
  };

  // Validation logic
  useEffect(() => {
    const errors = [];
    
    if (!formData.phone?.trim()) {
      errors.push("Numer telefonu jest wymagany.");
    } else {
      const phoneCode = formData.phoneCode || "+48";
      const requiredLength = getRequiredPhoneLength(phoneCode);
      const phoneDigits = formData.phone.replace(/\D/g, "");
      
      if (phoneDigits.length !== requiredLength) {
        if (phoneCode === "+48") {
          errors.push("Numer telefonu musi mieć dokładnie 9 cyfr dla Polski.");
        } else {
          errors.push(`Numer telefonu musi mieć ${requiredLength} cyfr dla wybranego kraju.`);
        }
      }
    }

    // Validate email format if provided
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.push("Podaj poprawny adres e-mail.");
      }
    }

    const isValid = errors.length === 0;
    onValidationChange?.({ isValid, errors });
  }, [formData, onValidationChange]);

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isMinor ? "Dane kontaktowe opiekuna" : "Dane kontaktowe"}
        </h3>
        
        {isMinor && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 text-sm">
            <p><strong>Uwaga:</strong> Podaj dane kontaktowe opiekuna prawnego, nie pacjenta.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kod kraju</label>
            <select
              value={formData.phoneCode || "+48"}
              onChange={(e) => update("phoneCode", e.target.value)}
              disabled={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              {PHONE_COUNTRY_CODES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.code} {country.country}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Telefon *</label>
            <input
              type="tel"
              value={formData.phone || ""}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                const maxLength = getRequiredPhoneLength(formData.phoneCode || "+48");
                update("phone", formatted.slice(0, maxLength));
              }}
              placeholder={(formData.phoneCode || "+48") === "+48" ? "123456789" : ""}
              maxLength={getRequiredPhoneLength(formData.phoneCode || "+48")}
              readOnly={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">E-mail (opcjonalnie)</label>
          <input
            type="email"
            value={formData.email || ""}
            onChange={(e) => update("email", e.target.value)}
            readOnly={readOnlyFields}
            placeholder="nazwa@domena.pl"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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