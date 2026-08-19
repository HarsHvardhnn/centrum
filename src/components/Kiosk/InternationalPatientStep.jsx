import { useState } from "react";
import { toast } from "sonner";
import { checkKioskDocument } from "../../helpers/kioskHelper";
import {
  detectPatientType,
  INTERNATIONAL_MINOR_BLOCKED_CODE,
  isInternationalMinor,
} from "./PatientTypeDetector";
import IdentityDocumentFields from "../shared/IdentityDocumentFields";
import KioskDateInput from "./KioskDateInput";
import KioskInternationalMinorBlockedModal from "./KioskInternationalMinorBlockedModal";
import { validateIdentityDocument } from "../../utils/identityDocument";

export default function InternationalPatientStep({ 
  onVerified, 
  onBack, 
  loading: externalLoading = false 
}) {
  const [form, setForm] = useState({
    documentType: "",
    documentNumber: "",
    documentCountry: "",
    documentIssueDate: "",
    documentExpiryDate: "",
    dateOfBirth: "",
  });
  const [loading, setLoading] = useState(false);
  const [showMinorBlocked, setShowMinorBlocked] = useState(false);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleVerify = async () => {
    const errors = validateIdentityDocument(form);
    if (!form.dateOfBirth) errors.push("Wybierz datę urodzenia");

    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    if (isInternationalMinor({ ...form, isInternationalPatient: true })) {
      setShowMinorBlocked(true);
      return;
    }

    setLoading(true);
    try {
      const res = await checkKioskDocument({
        documentType: form.documentType,
        documentNumber: form.documentNumber.toUpperCase(),
        documentCountry: form.documentCountry,
        documentIssueDate: form.documentIssueDate,
        documentExpiryDate: form.documentExpiryDate,
        dateOfBirth: form.dateOfBirth,
      });

      const updatedFormData = {
        ...res.formData,
        ...form,
        isInternationalPatient: true,
        documentNumber: form.documentNumber.toUpperCase(),
      };

      const detectedType = detectPatientType(updatedFormData);

      onVerified?.({
        formData: updatedFormData,
        patientType: detectedType,
        mode: res.mode || "full_registration",
        sessionInfo: res.sessionInfo,
      });

      toast.success(res.message || "Dokument zweryfikowany.");
    } catch (err) {
      if (err.response?.data?.errorCode === INTERNATIONAL_MINOR_BLOCKED_CODE) {
        setShowMinorBlocked(true);
      } else {
        toast.error(err.response?.data?.message || "Nie można zweryfikować dokumentu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || externalLoading;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 w-full max-w-4xl mx-auto">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-teal-700 mb-6 hover:underline"
      >
        ← Wróć do weryfikacji
      </button>

      <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
        Pacjent zagraniczny
      </h2>
      <p className="text-center text-gray-500 mb-8">
        Wprowadź dane dokumentu tożsamości
      </p>

      <div className="space-y-4">
        <IdentityDocumentFields values={form} onChange={update} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data urodzenia *
          </label>
          <KioskDateInput
            value={form.dateOfBirth}
            onChange={(e) => update("dateOfBirth", e.target.value)}
            required
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleVerify}
        disabled={isLoading}
        className="w-full mt-6 bg-teal-700 hover:bg-teal-800 disabled:bg-gray-400 text-white font-semibold text-lg py-4 rounded-xl"
      >
        {isLoading ? "Weryfikowanie..." : "Weryfikuj dokument"}
      </button>

      <KioskInternationalMinorBlockedModal
        open={showMinorBlocked}
        onClose={() => setShowMinorBlocked(false)}
      />
    </div>
  );
}