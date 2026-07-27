import { useEffect } from "react";
import SignaturePad from "../SignaturePad";

export default function SignatureStep({
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
    
    // Check if signature exists and is not empty
    if (!formData.signature || formData.signature.trim() === "" || formData.signature === "data:image/png;base64,") {
      errors.push("Podpis pacjenta jest wymagany.");
    }

    const isValid = errors.length === 0;
    onValidationChange?.({ isValid, errors });
  }, [formData.signature, onValidationChange]); // More specific dependency

  return (
    <div className="space-y-6">
      {/* Patient Summary */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
        <h4 className="font-semibold text-teal-900 mb-2">Podsumowanie danych pacjenta</h4>
        <div className="text-teal-800 text-sm space-y-1">
          <p><strong>{formData.firstName} {formData.lastName}</strong></p>
          {patientType !== 'international' ? (
            <p>PESEL: {formData.pesel}</p>
          ) : (
            <p>{formData.documentType}: {formData.documentNumber} ({formData.documentCountry})</p>
          )}
          <p>Adres: {formData.street}, {formData.zipCode} {formData.city}</p>
          <p>Telefon: {formData.phoneCode} {formData.phone}</p>
          {formData.email && <p>E-mail: {formData.email}</p>}
        </div>
      </div>

      {/* Signature Section */}
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