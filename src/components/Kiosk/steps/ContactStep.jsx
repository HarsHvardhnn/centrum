import { useEffect, useMemo } from "react";
import { formatPhoneNumber, getRequiredPhoneLength } from "../../../utils/phoneUtils";
import { analyzePeselForKiosk, normalizePesel } from "../../../utils/peselUtils";
import PhoneCountrySelect from "../PhoneCountrySelect";
import { PATIENT_TYPES } from "../PatientTypeDetector";

function validateContactPesel(rawPesel, patientPesel, noPesel = false) {
  if (noPesel) {
    return { valid: true, message: "", type: "success" };
  }

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
  const isMinor =
    patientType === PATIENT_TYPES.MINOR_UNDER_16 ||
    patientType === PATIENT_TYPES.MINOR_16_17;

  const update = (field, value) => {
    updateFormData({ [field]: value });
  };

  /** Keep patient contact + guardian contact in sync for minors */
  const updateGuardianContact = (updates) => {
    const next = { ...updates };
    if ("guardianPhone" in updates) next.phone = updates.guardianPhone;
    if ("guardianPhoneCode" in updates) next.phoneCode = updates.guardianPhoneCode;
    if ("guardianEmail" in updates) next.email = updates.guardianEmail;
    updateFormData(next);
  };

  const peselValidation = useMemo(
    () =>
      isMinor
        ? validateContactPesel(
            formData.guardianPesel,
            formData.pesel,
            !!formData.guardianNoPesel
          )
        : { valid: true, message: "", type: "success" },
    [isMinor, formData.guardianPesel, formData.pesel, formData.guardianNoPesel]
  );

  // Validation logic
  useEffect(() => {
    const errors = [];

    if (isMinor) {
      if (!formData.guardianFirstName?.trim()) errors.push("Imię opiekuna jest wymagane.");
      if (!formData.guardianLastName?.trim()) errors.push("Nazwisko opiekuna jest wymagane.");
      if (formData.guardianNoPesel) {
        if (!formData.guardianDocumentNumber?.trim()) {
          errors.push("Numer dokumentu tożsamości opiekuna jest wymagany (brak PESEL).");
        }
      } else if (!peselValidation.valid) {
        errors.push(peselValidation.message);
      }

      const phone = formData.guardianPhone || formData.phone || "";
      const phoneCode = formData.guardianPhoneCode || formData.phoneCode || "+48";

      if (!phone.trim()) {
        errors.push("Numer telefonu jest wymagany.");
      } else {
        const requiredLength = getRequiredPhoneLength(phoneCode);
        const phoneDigits = phone.replace(/\D/g, "");
        if (phoneDigits.length !== requiredLength) {
          if (phoneCode === "+48") {
            errors.push("Numer telefonu musi mieć dokładnie 9 cyfr dla Polski.");
          } else {
            errors.push(
              `Numer telefonu musi mieć ${requiredLength} cyfr dla wybranego kraju.`
            );
          }
        }
      }

      const email = formData.guardianEmail || formData.email || "";
      if (email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.push("Podaj poprawny adres e-mail.");
        }
      }
    } else {
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
            errors.push(
              `Numer telefonu musi mieć ${requiredLength} cyfr dla wybranego kraju.`
            );
          }
        }
      }

      if (formData.email && formData.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          errors.push("Podaj poprawny adres e-mail.");
        }
      }
    }

    const isValid = errors.length === 0;
    onValidationChange?.({ isValid, errors });
  }, [formData, onValidationChange, isMinor, peselValidation]);

  if (isMinor) {
    const phoneValue = formData.guardianPhone || formData.phone || "";
    const phoneCodeValue = formData.guardianPhoneCode || formData.phoneCode || "+48";
    const emailValue = formData.guardianEmail || formData.email || "";

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Dane kontaktowe opiekuna
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 text-sm">
            <p>
              <strong>Uwaga:</strong> Podaj dane opiekuna prawnego, nie pacjenta. Te same dane
              pojawią się w następnym kroku — będziesz mógł je jeszcze edytować.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imię *</label>
              <input
                type="text"
                value={formData.guardianFirstName || ""}
                onChange={(e) => update("guardianFirstName", e.target.value)}
                readOnly={readOnlyFields}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.guardianNoPesel ? "PESEL" : "PESEL *"}
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={formData.guardianPesel || ""}
              onChange={(e) =>
                update("guardianPesel", e.target.value.replace(/\D/g, "").slice(0, 11))
              }
              readOnly={readOnlyFields || !!formData.guardianNoPesel}
              disabled={!!formData.guardianNoPesel}
              maxLength={11}
              className={`w-full border rounded-lg px-4 py-3 text-lg font-mono focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                formData.guardianNoPesel
                  ? "border-gray-200 bg-gray-100 text-gray-400"
                  : !formData.guardianPesel
                    ? "border-gray-300"
                    : peselValidation.valid
                      ? "border-green-400"
                      : "border-red-400"
              }`}
              required={!formData.guardianNoPesel}
            />
            <label className="mt-2 flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!formData.guardianNoPesel}
                disabled={readOnlyFields}
                onChange={(e) => {
                  const checked = e.target.checked;
                  updateFormData({
                    guardianNoPesel: checked,
                    guardianPesel: checked ? "" : formData.guardianPesel,
                    guardianDocumentNumber: checked
                      ? formData.guardianDocumentNumber || ""
                      : "",
                  });
                }}
                className="mt-0.5 w-5 h-5 rounded border-gray-400 text-teal-700 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">Nie posiadam numeru PESEL</span>
            </label>
            {formData.guardianNoPesel ? (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numer dokumentu tożsamości *
                </label>
                <input
                  type="text"
                  value={formData.guardianDocumentNumber || ""}
                  onChange={(e) => update("guardianDocumentNumber", e.target.value)}
                  readOnly={readOnlyFields}
                  placeholder="np. paszport / dowód"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>
            ) : !formData.guardianPesel ? (
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

          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="w-full sm:w-44 shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">Kod kraju</label>
              <PhoneCountrySelect
                value={phoneCodeValue}
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
                  ({getRequiredPhoneLength(phoneCodeValue)} cyfr)
                </span>
              </label>
              <input
                type="tel"
                value={phoneValue}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  const maxLength = getRequiredPhoneLength(phoneCodeValue);
                  updateGuardianContact({
                    guardianPhone: formatted.slice(0, maxLength),
                    guardianPhoneCode: phoneCodeValue,
                  });
                }}
                placeholder={
                  phoneCodeValue === "+48"
                    ? "123 456 789"
                    : `${getRequiredPhoneLength(phoneCodeValue)} cyfr`
                }
                maxLength={getRequiredPhoneLength(phoneCodeValue)}
                readOnly={readOnlyFields}
                className="w-full h-14 border border-gray-300 rounded-lg px-4 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail (opcjonalnie)
            </label>
            <input
              type="email"
              value={emailValue}
              onChange={(e) => updateGuardianContact({ guardianEmail: e.target.value })}
              readOnly={readOnlyFields}
              placeholder="nazwa@domena.pl"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dane kontaktowe</h3>

        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="w-full sm:w-44 shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">Kod kraju</label>
            <PhoneCountrySelect
              value={formData.phoneCode || "+48"}
              onChange={(code) => update("phoneCode", code)}
              disabled={readOnlyFields}
            />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon *
              <span className="text-xs text-gray-500 ml-2">
                ({getRequiredPhoneLength(formData.phoneCode || "+48")} cyfr)
              </span>
            </label>
            <input
              type="tel"
              value={formData.phone || ""}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                const maxLength = getRequiredPhoneLength(formData.phoneCode || "+48");
                update("phone", formatted.slice(0, maxLength));
              }}
              placeholder={
                (formData.phoneCode || "+48") === "+48"
                  ? "123 456 789"
                  : `${getRequiredPhoneLength(formData.phoneCode || "+48")} cyfr`
              }
              maxLength={getRequiredPhoneLength(formData.phoneCode || "+48")}
              readOnly={readOnlyFields}
              className="w-full h-14 border border-gray-300 rounded-lg px-4 text-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
    </div>
  );
}
