import { useEffect } from "react";
import { PATIENT_TYPES } from "../PatientTypeDetector";

export default function MinorConsentsStep({
  formData = {},
  updateFormData,
  patientType,
  mode = "full_registration",
  validation = {},
  onValidationChange,
}) {
  const requiresPatientConsent = patientType === PATIENT_TYPES.MINOR_16_17;

  const update = (field, value) => {
    updateFormData({ [field]: value });
  };

  // Validation logic
  useEffect(() => {
    const errors = [];
    
    // Check required consents based on patient type
    if (patientType === PATIENT_TYPES.MINOR_UNDER_16) {
      // Only guardian consent required for under 16
      if (!formData.consentHealthcare) {
        errors.push("Zgoda opiekuna na przetwarzanie danych osobowych jest wymagana.");
      }
    } else if (patientType === PATIENT_TYPES.MINOR_16_17) {
      // Both patient AND guardian consent required for 16-17
      if (!formData.consentHealthcare) {
        errors.push("Zgoda pacjenta na przetwarzanie danych osobowych jest wymagana.");
      }
      if (!formData.consentHealthcareGuardian) {
        errors.push("Zgoda opiekuna na przetwarzanie danych osobowych jest wymagana.");
      }
    }
    
    if (!formData.consentExamination) {
      errors.push("Zgoda na przeprowadzenie badania lub udzielenie świadczenia zdrowotnego jest wymagana.");
    }

    const isValid = errors.length === 0;
    onValidationChange?.({ isValid, errors });
  }, [formData, patientType, onValidationChange]);

  return (
    <div className="space-y-6">
      {/* Guardian Summary */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">Opiekun prawny</h4>
        <div className="text-yellow-800 text-sm">
          <p><strong>{formData.guardianFirstName} {formData.guardianLastName}</strong> • {formData.guardianRelation}</p>
          <p>PESEL: {formData.guardianPesel} • Tel: {formData.guardianPhoneCode} {formData.guardianPhone}</p>
        </div>
      </div>

      {/* Age Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-900 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 text-lg">👶</span>
          <div>
            <p className="font-medium">
              {patientType === PATIENT_TYPES.MINOR_UNDER_16 
                ? "Pacjent poniżej 16 roku życia"
                : "Pacjent 16-17 lat"
              }
            </p>
            <p>
              {patientType === PATIENT_TYPES.MINOR_UNDER_16
                ? "Wymagana jest tylko zgoda opiekuna prawnego."
                : "Wymagane są zgody zarówno pacjenta jak i opiekuna prawnego."
              }
            </p>
          </div>
        </div>
      </div>

      {/* Patient Consent Block (only for 16-17 year olds) */}
      {requiresPatientConsent && (
        <div className="bg-blue-50 rounded-lg p-6 space-y-3 border border-blue-200">
          <h4 className="font-semibold text-blue-900">Blok A - Zgoda pacjenta (16-17 lat)</h4>
          <div className="text-sm text-blue-800 mb-3 p-3 bg-white rounded-lg border border-blue-100">
            „Ja niżej podpisana(-ny) oświadczam, że zapoznałam(-em) się z Klauzulą Informacyjną RODO 
            i wyrażam zgodę na przetwarzanie moich danych osobowych przez CM7 SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ..."
          </div>
          
          <label className="flex items-start gap-3 p-4 rounded-lg border border-blue-300 bg-white cursor-pointer hover:bg-blue-25 transition-colors">
            <input
              type="checkbox"
              checked={!!formData.consentHealthcare}
              onChange={(e) => update("consentHealthcare", e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-700 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              <strong>Zgoda pacjenta na przetwarzanie danych osobowych (wymagana) *</strong><br />
              z organizacją udzielanych świadczeń opieki zdrowotnej
            </span>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-25 transition-colors">
            <input
              type="checkbox"
              checked={!!formData.consentHealthCampaigns}
              onChange={(e) => update("consentHealthCampaigns", e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-700 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              z przesyłaniem informacji o kampaniach i akcjach prozdrowotnych
            </span>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-25 transition-colors">
            <input
              type="checkbox"
              checked={!!formData.consentMarketing}
              onChange={(e) => update("consentMarketing", e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-700 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              z otrzymywaniem newslettera z informacjami marketingowymi
            </span>
          </label>
        </div>
      )}

      {/* Guardian Consent Block */}
      <div className="bg-yellow-50 rounded-lg p-6 space-y-3 border border-yellow-200">
        <h4 className="font-semibold text-yellow-900">
          {requiresPatientConsent ? "Blok B - Zgoda opiekuna prawnego" : "Zgoda opiekuna prawnego"}
        </h4>
        <div className="text-sm text-yellow-800 mb-3 p-3 bg-white rounded-lg border border-yellow-100">
          „Ja niżej podpisana(-ny), działając jako przedstawiciel ustawowy małoletniego pacjenta{" "}
          <strong>{formData.firstName} {formData.lastName}</strong> (PESEL: <strong>{formData.pesel}</strong>), 
          oświadczam, że zapoznałam(-em) się z Klauzulą Informacyjną RODO i wyrażam zgodę na przetwarzanie 
          danych osobowych małoletniego przez CM7 SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ..."
        </div>
        
        {/* Guardian consent checkboxes */}
        {patientType === PATIENT_TYPES.MINOR_UNDER_16 ? (
          // For under 16, use main consent fields
          <>
            <label className="flex items-start gap-3 p-4 rounded-lg border border-yellow-300 bg-white cursor-pointer hover:bg-yellow-25 transition-colors">
              <input
                type="checkbox"
                checked={!!formData.consentHealthcare}
                onChange={(e) => update("consentHealthcare", e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-yellow-700 focus:ring-yellow-500"
              />
              <span className="text-sm text-gray-700">
                <strong>Zgoda opiekuna na przetwarzanie danych osobowych małoletniego (wymagana) *</strong><br />
                z organizacją udzielanych świadczeń opieki zdrowotnej
              </span>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-25 transition-colors">
              <input
                type="checkbox"
                checked={!!formData.consentHealthCampaigns}
                onChange={(e) => update("consentHealthCampaigns", e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-yellow-700 focus:ring-yellow-500"
              />
              <span className="text-sm text-gray-700">
                z przesyłaniem informacji o kampaniach i akcjach prozdrowotnych
              </span>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-25 transition-colors">
              <input
                type="checkbox"
                checked={!!formData.consentMarketing}
                onChange={(e) => update("consentMarketing", e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-yellow-700 focus:ring-yellow-500"
              />
              <span className="text-sm text-gray-700">
                z otrzymywaniem newslettera z informacjami marketingowymi
              </span>
            </label>
          </>
        ) : (
          // For 16-17, use separate guardian consent fields
          <>
            <label className="flex items-start gap-3 p-4 rounded-lg border border-yellow-300 bg-white cursor-pointer hover:bg-yellow-25 transition-colors">
              <input
                type="checkbox"
                checked={!!formData.consentHealthcareGuardian}
                onChange={(e) => update("consentHealthcareGuardian", e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-yellow-700 focus:ring-yellow-500"
              />
              <span className="text-sm text-gray-700">
                <strong>Zgoda opiekuna na przetwarzanie danych osobowych małoletniego (wymagana) *</strong><br />
                z organizacją udzielanych świadczeń opieki zdrowotnej
              </span>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-25 transition-colors">
              <input
                type="checkbox"
                checked={!!formData.consentHealthCampaignsGuardian}
                onChange={(e) => update("consentHealthCampaignsGuardian", e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-yellow-700 focus:ring-yellow-500"
              />
              <span className="text-sm text-gray-700">
                z przesyłaniem informacji o kampaniach i akcjach prozdrowotnych
              </span>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-25 transition-colors">
              <input
                type="checkbox"
                checked={!!formData.consentMarketingGuardian}
                onChange={(e) => update("consentMarketingGuardian", e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-yellow-700 focus:ring-yellow-500"
              />
              <span className="text-sm text-gray-700">
                z otrzymywaniem newslettera z informacjami marketingowymi
              </span>
            </label>
          </>
        )}

        {/* Examination consent - shared for all minors */}
        <label className="flex items-start gap-3 p-4 rounded-lg border border-yellow-200 bg-white cursor-pointer hover:bg-yellow-25 transition-colors">
          <input
            type="checkbox"
            checked={!!formData.consentExamination}
            onChange={(e) => update("consentExamination", e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-yellow-700 focus:ring-yellow-500"
          />
          <span className="text-sm text-gray-700">
            <strong>Zgoda na przeprowadzenie badania lub udzielenie świadczenia zdrowotnego (wymagana) *</strong><br />
            Wyrażam zgodę na przeprowadzenie badania lub udzielenie świadczenia zdrowotnego
          </span>
        </label>
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