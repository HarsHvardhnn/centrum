import { useEffect } from "react";

export default function ConsentsStep({
  formData = {},
  updateFormData,
  patientType,
  mode = "full_registration",
  validation = {},
  onValidationChange,
}) {
  const update = (field, value) => {
    updateFormData({ [field]: value });
  };

  // Validation logic
  useEffect(() => {
    const errors = [];
    
    if (!formData.consentHealthcare) {
      errors.push("Zgoda na przetwarzanie danych osobowych jest wymagana.");
    }
    
    if (!formData.consentExamination) {
      errors.push("Zgoda na przeprowadzenie badania lub udzielenie świadczenia zdrowotnego jest wymagana.");
    }

    const isValid = errors.length === 0;
    onValidationChange?.({ isValid, errors });
  }, [formData, onValidationChange]);

  return (
    <div className="space-y-6">
      <div className="bg-teal-50 rounded-xl p-6 space-y-4 border border-teal-200">
        <h3 className="text-lg font-semibold text-gray-900">Zgody RODO</h3>
        <div className="text-sm text-gray-700 mb-4 p-3 bg-white rounded-lg border border-teal-100">
          „Ja niżej podpisana(-ny) oświadczam, że zapoznałam(-em) się z Klauzulą Informacyjną RODO 
          i wyrażam zgodę na przetwarzanie moich danych osobowych przez CM7 SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ..."
        </div>
        
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 rounded-lg border border-teal-200 bg-white cursor-pointer hover:bg-teal-25 transition-colors">
            <input
              type="checkbox"
              checked={!!formData.consentHealthcare}
              onChange={(e) => update("consentHealthcare", e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-teal-700 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">
              <strong>Zgoda na przetwarzanie danych osobowych (wymagana) *</strong><br />
              z organizacją udzielanych świadczeń opieki zdrowotnej (w tym przypomnienie o wizycie)
            </span>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-25 transition-colors">
            <input
              type="checkbox"
              checked={!!formData.consentHealthCampaigns}
              onChange={(e) => update("consentHealthCampaigns", e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-teal-700 focus:ring-teal-500"
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
              className="mt-1 w-5 h-5 rounded border-gray-300 text-teal-700 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">
              z otrzymywaniem newslettera z informacjami marketingowymi
            </span>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-lg border border-teal-200 bg-white cursor-pointer hover:bg-teal-25 transition-colors">
            <input
              type="checkbox"
              checked={!!formData.consentExamination}
              onChange={(e) => update("consentExamination", e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-teal-700 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">
              <strong>Zgoda na przeprowadzenie badania lub udzielenie świadczenia zdrowotnego (wymagana) *</strong><br />
              Wyrażam zgodę na przeprowadzenie badania lub udzielenie świadczenia zdrowotnego
            </span>
          </label>
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