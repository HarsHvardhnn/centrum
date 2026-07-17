import { useEffect } from "react";
import SignaturePad from "../SignaturePad";
import { PATIENT_TYPES } from "../PatientTypeDetector";

export default function MinorSignatureStep({
  formData = {},
  updateFormData,
  patientType,
  mode = "full_registration",
  validation = {},
  onValidationChange,
}) {
  const requiresPatientSignature = patientType === PATIENT_TYPES.MINOR_16_17;
  
  const update = (field, value) => {
    updateFormData({ [field]: value });
  };

  // Validation logic
  useEffect(() => {
    const errors = [];
    
    // Guardian signature is always required for minors
    if (!formData.guardianSignature || 
        formData.guardianSignature.trim() === "" || 
        formData.guardianSignature === "data:image/png;base64,") {
      errors.push("Podpis opiekuna prawnego jest wymagany.");
    }
    
    // Patient signature required only for 16-17 year olds
    if (requiresPatientSignature && 
        (!formData.signature || 
         formData.signature.trim() === "" || 
         formData.signature === "data:image/png;base64,")) {
      errors.push("Podpis pacjenta jest wymagany.");
    }

    const isValid = errors.length === 0;
    onValidationChange?.({ isValid, errors });
  }, [formData.signature, formData.guardianSignature, requiresPatientSignature, onValidationChange]);

  return (
    <div className="space-y-6">
      {/* Patient Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Podsumowanie danych</h4>
        <div className="text-blue-800 text-sm space-y-2">
          <div>
            <strong>Pacjent:</strong> {formData.firstName} {formData.lastName} (PESEL: {formData.pesel})
          </div>
          <div>
            <strong>Opiekun:</strong> {formData.guardianFirstName} {formData.guardianLastName} • {formData.guardianRelation}
          </div>
          <div>
            <strong>Adres:</strong> {formData.street}, {formData.zipCode} {formData.city}
          </div>
          <div>
            <strong>Telefon opiekuna:</strong> {formData.guardianPhoneCode} {formData.guardianPhone}
          </div>
        </div>
      </div>

      {/* Age-specific instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-900 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-yellow-600 text-lg">📝</span>
          <div>
            {patientType === PATIENT_TYPES.MINOR_UNDER_16 ? (
              <div>
                <p className="font-medium">Pacjent poniżej 16 roku życia</p>
                <p>Wymagany jest tylko podpis opiekuna prawnego. Pacjent nie podpisuje dokumentów.</p>
              </div>
            ) : (
              <div>
                <p className="font-medium">Pacjent 16-17 lat</p>
                <p>Wymagane są podpisy zarówno pacjenta jak i opiekuna prawnego.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patient Signature (only for 16-17 year olds) */}
      {requiresPatientSignature && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h4 className="text-lg font-semibold text-blue-900 mb-4">
            Blok A - Podpis pacjenta (16-17 lat)
          </h4>
          <div className="text-sm text-blue-800 mb-4">
            Jako pacjent w wieku 16-17 lat masz prawo podpisać dokumenty rejestracyjne razem ze swoim opiekunem.
          </div>
          <SignaturePad
            label="Podpis pacjenta *"
            onChange={(sig) => update("signature", sig)}
            value={formData.signature}
          />
        </div>
      )}

      {/* Guardian Signature */}
      <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
        <h4 className="text-lg font-semibold text-yellow-900 mb-4">
          {requiresPatientSignature ? "Blok B - Podpis opiekuna prawnego" : "Podpis opiekuna prawnego"}
        </h4>
        <div className="text-sm text-yellow-800 mb-4">
          {patientType === PATIENT_TYPES.MINOR_UNDER_16 ? (
            <p>Jako opiekun prawny wyrażasz zgodę na rejestrację i leczenie małoletniego pacjenta.</p>
          ) : (
            <p>Jako opiekun prawny współwyrażasz zgodę razem z pacjentem na rejestrację i leczenie.</p>
          )}
        </div>
        <SignaturePad
          label="Podpis opiekuna prawnego *"
          onChange={(sig) => update("guardianSignature", sig)}
          value={formData.guardianSignature}
        />
      </div>

      {/* Final Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-sm">
        <p><strong>Uwaga:</strong> Po kliknięciu "Zakończ rejestrację" dane pacjenta i opiekuna zostaną zapisane w systemie 
        i rozpocznie się proces generowania dokumentów rejestracyjnych dla pacjenta małoletniego.</p>
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