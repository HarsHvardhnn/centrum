import { useEffect } from "react";
import { formatPolishPostalCode } from "../../../utils/postalCodeUtils";

const VOIVODESHIPS = [
  "dolnośląskie", "kujawsko-pomorskie", "lubelskie", "lubuskie", "łódzkie",
  "małopolskie", "mazowieckie", "opolskie", "podkarpackie", "podlaskie", 
  "pomorskie", "śląskie", "świętokrzyskie", "warmińsko-mazurskie",
  "wielkopolskie", "zachodniopomorskie",
];

export default function AddressStep({
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
    
    if (!formData.street?.trim()) errors.push("Ulica i numer są wymagane.");
    if (!formData.zipCode?.trim()) errors.push("Kod pocztowy jest wymagany.");
    if (!formData.city?.trim()) errors.push("Miejscowość jest wymagana.");
    if (!formData.province?.trim() && !formData.state?.trim()) errors.push("Województwo jest wymagane.");

    // Validate postal code format
    if (formData.zipCode && !/^\d{2}-\d{3}$/.test(formData.zipCode)) {
      errors.push("Kod pocztowy musi mieć format XX-XXX (np. 26-110).");
    }

    const isValid = errors.length === 0;
    onValidationChange?.({ isValid, errors });
  }, [formData, onValidationChange]);

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Adres zamieszkania</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ulica i numer *</label>
          <input
            type="text"
            value={formData.street || ""}
            onChange={(e) => update("street", e.target.value)}
            readOnly={readOnlyFields}
            placeholder="np. ul. Kwiatowa 5/3"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            required
          />
        </div>

        {/* Reorganized layout for better UX with longer Polish names */}
        <div className="space-y-4">
          {/* First row: Postal code (smaller) and City (larger) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kod pocztowy *</label>
              <input
                type="text"
                value={formData.zipCode || ""}
                onChange={(e) => {
                  const formatted = formatPolishPostalCode(e.target.value);
                  update("zipCode", formatted);
                }}
                placeholder="00-000"
                maxLength="6"
                readOnly={readOnlyFields}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg text-center focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Miejscowość *</label>
              <input
                type="text"
                value={formData.city || ""}
                onChange={(e) => update("city", e.target.value)}
                readOnly={readOnlyFields}
                placeholder="np. Skarżysko-Kamienna, Bielsko-Biała"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
          </div>
          
          {/* Second row: Province gets full width for better visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Województwo *</label>
            <select
              value={formData.province || formData.state || ""}
              onChange={(e) => update("province", e.target.value)}
              disabled={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
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
    </div>
  );
}