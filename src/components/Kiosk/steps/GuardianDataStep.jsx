import { useEffect, useMemo, useRef } from "react";
import { formatPhoneNumber, getRequiredPhoneLength } from "../../../utils/phoneUtils";
import { analyzePeselForKiosk, normalizePesel } from "../../../utils/peselUtils";
import PhoneCountrySelect from "../PhoneCountrySelect";

const RELATION_OPTIONS = [
  { value: "matka", label: "Matka" },
  { value: "ojciec", label: "Ojciec" },
  { value: "przedstawiciel_ustawowy", label: "Przedstawiciel ustawowy" },
  { value: "opiekun_prawny", label: "Opiekun prawny" },
  { value: "kurator", label: "Kurator" },
  { value: "opiekun_faktyczny", label: "Opiekun faktyczny" },
];

function validateGuardianPesel(rawPesel, patientPesel) {
  if (!rawPesel || !String(rawPesel).trim()) {
    return { valid: false, message: "PESEL jest wymagany.", type: "error" };
  }

  const normalized = normalizePesel(rawPesel);
  if (normalized.length !== 11) {
    return {
      valid: false,
      message: "PESEL musi składać się z dokładnie 11 cyfr.",
      type: "error",
    };
  }

  const analysis = analyzePeselForKiosk(normalized);
  if (!analysis.valid) {
    return { valid: false, message: analysis.message, type: "error" };
  }

  const patientNormalized = normalizePesel(patientPesel || "");
  if (patientNormalized.length === 11 && normalized === patientNormalized) {
    return {
      valid: false,
      message: "PESEL opiekuna nie może być taki sam jak PESEL pacjenta.",
      type: "error",
    };
  }

  return { valid: true, message: "PESEL jest prawidłowy.", type: "success" };
}

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
  const didPrefillRef = useRef(false);

  const update = (field, value) => {
    updateFormData({ [field]: value });
  };

  /** Keep guardian contact and main contact fields aligned */
  const updateGuardianContact = (updates) => {
    const next = { ...updates };
    if ("guardianPhone" in updates) next.phone = updates.guardianPhone;
    if ("guardianPhoneCode" in updates) next.phoneCode = updates.guardianPhoneCode;
    if ("guardianEmail" in updates) next.email = updates.guardianEmail;
    updateFormData(next);
  };

  // Carry contact-step values into guardian fields once (editable afterwards)
  useEffect(() => {
    if (didPrefillRef.current) return;
    didPrefillRef.current = true;

    const updates = {};
    if (!formData.guardianPhone?.trim() && formData.phone?.trim()) {
      updates.guardianPhone = formData.phone;
    }
    if (!formData.guardianPhoneCode && formData.phoneCode) {
      updates.guardianPhoneCode = formData.phoneCode;
    }
    if (!formData.guardianEmail?.trim() && formData.email?.trim()) {
      updates.guardianEmail = formData.email;
    }
    // If contact was saved only on guardian* already, mirror phone/email for downstream steps
    if (formData.guardianPhone?.trim() && !formData.phone?.trim()) {
      updates.phone = formData.guardianPhone;
    }
    if (formData.guardianPhoneCode && !formData.phoneCode) {
      updates.phoneCode = formData.guardianPhoneCode;
    }
    if (formData.guardianEmail?.trim() && !formData.email?.trim()) {
      updates.email = formData.guardianEmail;
    }

    if (Object.keys(updates).length > 0) {
      updateFormData(updates);
    }
    // Intentionally run once on mount with initial formData
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const peselValidation = useMemo(
    () => validateGuardianPesel(formData.guardianPesel, formData.pesel),
    [formData.guardianPesel, formData.pesel]
  );

  // Validation logic
  useEffect(() => {
    const errors = [];

    if (!formData.guardianFirstName?.trim()) errors.push("Imię jest wymagane.");
    if (!formData.guardianLastName?.trim()) errors.push("Nazwisko jest wymagane.");

    if (!peselValidation.valid) {
      errors.push(peselValidation.message);
    }

    const phone = formData.guardianPhone || formData.phone || "";
    const phoneCode = formData.guardianPhoneCode || formData.phoneCode || "+48";
    const email = formData.guardianEmail || formData.email || "";

    if (!phone.trim()) {
      errors.push("Telefon jest wymagany.");
    } else {
      const requiredLength = getRequiredPhoneLength(phoneCode);
      const phoneDigits = phone.replace(/\D/g, "");

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

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push("Podaj poprawny adres e-mail.");
      }
    }

    const isValid = errors.length === 0;
    onValidationChange?.({ isValid, errors });
  }, [formData, onValidationChange, peselValidation]);

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
          Dane z poprzedniego kroku zostały uzupełnione automatycznie — możesz je jeszcze
          poprawić. Wybierz też, kim jesteś względem pacjenta (od tego zależy treść zgód).
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
              inputMode="numeric"
              autoComplete="off"
              value={formData.guardianPesel || ""}
              onChange={(e) => update("guardianPesel", e.target.value.replace(/\D/g, "").slice(0, 11))}
              readOnly={readOnlyFields}
              className={`w-full border rounded-lg px-4 py-3 text-lg font-mono focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                !formData.guardianPesel
                  ? "border-gray-300"
                  : peselValidation.valid
                    ? "border-green-400"
                    : "border-red-400"
              }`}
              maxLength={11}
              required
            />
            {!formData.guardianPesel ? (
              <p className="text-xs text-gray-500 mt-1">Wpisz dokładnie 11 cyfr numeru PESEL.</p>
            ) : (
              <p
                className={`text-xs mt-1 ${
                  peselValidation.valid ? "text-green-700" : "text-red-600"
                }`}
              >
                {peselValidation.message}
              </p>
            )}
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
              value={formData.guardianPhoneCode || formData.phoneCode || "+48"}
              onChange={(code) =>
                updateGuardianContact({ guardianPhoneCode: code, guardianPhone: "" })
              }
              disabled={readOnlyFields}
            />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon *
              <span className="text-xs text-gray-500 ml-2">
                (
                {getRequiredPhoneLength(
                  formData.guardianPhoneCode || formData.phoneCode || "+48"
                )}{" "}
                cyfr)
              </span>
            </label>
            <input
              type="tel"
              value={formData.guardianPhone || formData.phone || ""}
              onChange={(e) => {
                const phoneCode = formData.guardianPhoneCode || formData.phoneCode || "+48";
                const formatted = formatPhoneNumber(e.target.value);
                const maxLength = getRequiredPhoneLength(phoneCode);
                updateGuardianContact({
                  guardianPhone: formatted.slice(0, maxLength),
                  guardianPhoneCode: phoneCode,
                });
              }}
              placeholder={
                (formData.guardianPhoneCode || formData.phoneCode || "+48") === "+48"
                  ? "123 456 789"
                  : `${getRequiredPhoneLength(
                      formData.guardianPhoneCode || formData.phoneCode || "+48"
                    )} cyfr`
              }
              maxLength={getRequiredPhoneLength(
                formData.guardianPhoneCode || formData.phoneCode || "+48"
              )}
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
            value={formData.guardianEmail || formData.email || ""}
            onChange={(e) => updateGuardianContact({ guardianEmail: e.target.value })}
            readOnly={readOnlyFields}
            placeholder="nazwa@domena.pl"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>
      </div>
    </div>
  );
}
