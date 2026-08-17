import { useEffect } from "react";
import SignaturePad from "../SignaturePad";

export default function SignatureStep({
  formData = {},
  updateFormData,
  validation = {},
  onValidationChange,
}) {
  const update = (field, value) => {
    updateFormData({ [field]: value });
  };

  // Validation logic
  useEffect(() => {
    const errors = [];
    
    // Check if signature exists and is not empty
    if (!formData.signature || formData.signature.trim() === "" || formData.signature === "data:image/png;base64,") {
      errors.push("Podpis pacjenta jest wymagany.");
    }

    const isValid = errors.length === 0;
    onValidationChange?.({ isValid, errors });
  }, [formData.signature, onValidationChange]); // More specific dependency

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Podpis pacjenta</h3>
        <div className="text-sm text-gray-600 mb-4">
          Podpisując poniżej, potwierdzasz poprawność podanych danych i wyrażasz zgodę na przetwarzanie 
          danych osobowych zgodnie z wcześniej zaznaczonymi zgodnymi.
        </div>
        
        <SignaturePad
          label="Podpis pacjenta *"
          onChange={(sig) => update("signature", sig)}
          value={formData.signature}
        />
      </div>

      {/* Final Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-sm">
        <p><strong>Uwaga:</strong> Po kliknięciu "Zakończ rejestrację" Twoje dane zostaną zapisane w systemie 
        i rozpocznie się proces generowania dokumentów rejestracyjnych.</p>
      </div>
    </div>
  );
}