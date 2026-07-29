import { useEffect } from "react";
import SignaturePad from "../SignaturePad";
import { PATIENT_TYPES } from "../PatientTypeDetector";

function getGuardianRoleLabel(relation) {
  const r = String(relation || "").toLowerCase().trim();
  switch (r) {
    case "matka":
      return "matka";
    case "ojciec":
      return "ojciec";
    case "przedstawiciel_ustawowy":
    case "przedstawiciel ustawowy":
      return "przedstawiciel ustawowy";
    case "opiekun_prawny":
    case "opiekun prawny":
      return "opiekun prawny";
    case "kurator":
      return "kurator";
    case "opiekun_faktyczny":
    case "opiekun faktyczny":
      return "opiekun faktyczny";
    default:
      return relation || "przedstawiciel ustawowy / opiekun faktyczny";
  }
}

export default function MinorSignatureStep({
  formData = {},
  updateFormData,
  patientType,
  mode = "full_registration",
  validation = {},
  onValidationChange,
}) {
  const requiresPatientSignature = patientType === PATIENT_TYPES.MINOR_16_17;
  const guardianLabel = getGuardianRoleLabel(formData.guardianRelation);

  const update = (field, value) => {
    updateFormData({ [field]: value });
  };

  // Validation logic
  useEffect(() => {
    const errors = [];

    // Guardian signature is always required for minors
    if (
      !formData.guardianSignature ||
      formData.guardianSignature.trim() === "" ||
      formData.guardianSignature === "data:image/png;base64,"
    ) {
      errors.push(`Podpis (${guardianLabel}) jest wymagany.`);
    }

    // Patient signature required only for 16-17 year olds
    if (requiresPatientSignature) {
      if (
        !formData.signature ||
        formData.signature.trim() === "" ||
        formData.signature === "data:image/png;base64,"
      ) {
        errors.push("Podpis pacjenta jest wymagany.");
      }
    }

    const isValid = errors.length === 0;
    onValidationChange?.({ isValid, errors });
  }, [
    formData.guardianSignature,
    formData.signature,
    requiresPatientSignature,
    guardianLabel,
    onValidationChange,
  ]);

  return (
    <div className="space-y-6">
      {/* Patient Signature - only for 16-17 */}
      {requiresPatientSignature && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h4 className="text-lg font-semibold text-blue-900 mb-4">Blok A - Podpis pacjenta</h4>
          <div className="text-sm text-blue-800 mb-4">
            <p>Jako pacjent w wieku 16–17 lat współwyrażasz zgodę na rejestrację i leczenie.</p>
          </div>
          <SignaturePad
            label="Podpis pacjenta *"
            onChange={(sig) => update("signature", sig)}
            value={formData.signature}
          />
        </div>
      )}

      {/* Guardian / representative Signature */}
      <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
        <h4 className="text-lg font-semibold text-yellow-900 mb-4">
          {requiresPatientSignature ? `Blok B - Podpis: ${guardianLabel}` : `Podpis: ${guardianLabel}`}
        </h4>
        <div className="text-sm text-yellow-800 mb-4">
          {patientType === PATIENT_TYPES.MINOR_UNDER_16 ? (
            <p>
              Jako <strong>{guardianLabel}</strong> wyrażasz zgodę na rejestrację i leczenie małoletniego
              pacjenta.
            </p>
          ) : (
            <p>
              Jako <strong>{guardianLabel}</strong> współwyrażasz zgodę razem z pacjentem na rejestrację i
              leczenie.
            </p>
          )}
        </div>
        <SignaturePad
          label={`Podpis (${guardianLabel}) *`}
          onChange={(sig) => update("guardianSignature", sig)}
          value={formData.guardianSignature}
        />
      </div>

      {/* Final Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-sm">
        <p>
          <strong>Uwaga:</strong> Po kliknięciu &quot;Zakończ rejestrację&quot; dane pacjenta i osoby
          reprezentującej zostaną zapisane w systemie i rozpocznie się proces generowania dokumentów
          rejestracyjnych dla pacjenta małoletniego.
        </p>
      </div>
    </div>
  );
}
