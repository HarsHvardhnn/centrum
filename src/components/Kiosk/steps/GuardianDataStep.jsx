import { useEffect } from "react";
import { formatPhoneNumber, getRequiredPhoneLength } from "../../../utils/phoneUtils";
import PhoneCountrySelect from "../PhoneCountrySelect";

const RELATION_OPTIONS = [
  { value: "matka", label: "Matka" },
  { value: "ojciec", label: "Ojciec" },
  { value: "przedstawiciel_ustawowy", label: "Przedstawiciel ustawowy" },
  { value: "opiekun_prawny", label: "Opiekun prawny" },
  { value: "kurator", label: "Kurator" },
  { value: "opiekun_faktyczny", label: "Opiekun faktyczny" },
];

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

    if (!formData.guardianFirstName?.trim()) errors.push("Imię jest wymagane.");
    if (!formData.guardianLastName?.trim()) errors.push("Nazwisko jest wymagane.");

    if (!formData.guardianPesel?.trim() || String(formData.guardianPesel).replace(/\D/g, "").length !== 11) {
      errors.push("PESEL musi mieć 11 cyfr.");
    }

    if (!formData.guardianPhone?.trim()) {
      errors.push("Telefon jest wymagany.");
    } else {
      const phoneCode = formData.guardianPhoneCode || "+48";
      const requiredLength = getRequiredPhoneLength(phoneCode);
      const phoneDigits = formData.guardianPhone.replace(/\D/g, "");

      if (phoneDigits.length !== requiredLength) {
        if (phoneCode === "+48") {
          errors.push("Numer telefonu musi mieć dokładnie 9 cyfr dla Polski.");
        } else {
          errors.push(`Numer telefonu musi mieć ${requiredLength} cyfr dla wybranego kraju.`);
        }
      }
    }

    if (!formData.guardianRelation?.trim()) {
      errors.push("Wybierz, kim jesteś względem pacjenta (podstawa reprezentacji).");
    }

    if (formData.guardianEmail && formData.guardianEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.guardianEmail)) {
        errors.push("Podaj poprawny adres e-mail.");
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
          <p>
            <strong>
              {formData.firstName} {formData.lastName}
            </strong>
          </p>
          <p>PESEL: {formData.pesel}</p>
        </div>
      </div>

      <div className="bg-yellow-50 rounded-xl p-6 space-y-4 border border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-1">
          Dane osoby reprezentującej pacjenta
        </h3>
        <p className="text-sm text-yellow-800 mb-4">
          Wybierz poniżej, kim jesteś — od tego zależy treść zgód i dokumentów.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Imię *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Nazwisko *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">PESEL *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kim jesteś względem pacjenta *
            </label>
            <select
              value={formData.guardianRelation || "matka"}
              onChange={(e) => update("guardianRelation", e.target.value)}
              disabled={readOnlyFields}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              {RELATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Country code + phone: same control height, bottom-aligned */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="w-full sm:w-44 shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">Kod kraju</label>
            <PhoneCountrySelect
              value={formData.guardianPhoneCode || "+48"}
              onChange={(code) => update("guardianPhoneCode", code)}
              disabled={readOnlyFields}
            />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon *
              <span className="text-xs text-gray-500 ml-2">
                ({getRequiredPhoneLength(formData.guardianPhoneCode || "+48")} cyfr)
              </span>
            </label>
            <input
              type="tel"
              value={formData.guardianPhone || ""}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                const maxLength = getRequiredPhoneLength(formData.guardianPhoneCode || "+48");
                update("guardianPhone", formatted.slice(0, maxLength));
              }}
              placeholder={
                (formData.guardianPhoneCode || "+48") === "+48"
                  ? "123 456 789"
                  : `${getRequiredPhoneLength(formData.guardianPhoneCode || "+48")} cyfr`
              }
              maxLength={getRequiredPhoneLength(formData.guardianPhoneCode || "+48")}
              readOnly={readOnlyFields}
              className="w-full h-14 border border-gray-300 rounded-lg px-4 text-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">E-mail (opcjonalnie)</label>
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
    </div>
  );
}
