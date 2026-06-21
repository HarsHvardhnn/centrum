import { useState } from "react";
import { toast } from "sonner";
import { checkKioskDocument } from "../../helpers/kioskHelper";
import { detectPatientType, PATIENT_TYPES } from "./PatientTypeDetector";

const DOCUMENT_TYPES = [
  { value: "", label: "Wybierz typ dokumentu" },
  { value: "Passport", label: "Paszport" },
  { value: "ID Card", label: "Dowód osobisty" },
  { value: "Residence Card", label: "Karta pobytu" },
  { value: "Other", label: "Inny dokument" },
];

export default function InternationalPatientStep({ 
  onVerified, 
  onBack, 
  loading: externalLoading = false 
}) {
  const [form, setForm] = useState({
    documentType: "",
    documentNumber: "",
    documentCountry: "",
    dateOfBirth: "",
  });
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleVerify = async () => {
    // Validate form
    const errors = [];
    if (!form.documentType) errors.push("Wybierz typ dokumentu");
    if (!form.documentNumber) errors.push("Wprowadź numer dokumentu");
    if (!form.documentCountry) errors.push("Wprowadź kraj wydania");
    if (!form.dateOfBirth) errors.push("Wybierz datę urodzenia");

    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    setLoading(true);
    try {
      const res = await checkKioskDocument({
        documentType: form.documentType,
        documentNumber: form.documentNumber.toUpperCase(),
        documentCountry: form.documentCountry,
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
      toast.error(err.response?.data?.message || "Nie można zweryfikować dokumentu.");
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || externalLoading;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 max-w-lg mx-auto">
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Typ dokumentu *
          </label>
          <select
            value={form.documentType}
            onChange={(e) => update("documentType", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg bg-white"
            required
          >
            {DOCUMENT_TYPES.map((doc) => (
              <option key={doc.value} value={doc.value}>
                {doc.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numer dokumentu *
          </label>
          <input
            type="text"
            value={form.documentNumber}
            onChange={(e) => update("documentNumber", e.target.value.toUpperCase())}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg font-mono"
            placeholder="np. AB123456"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kraj wydania dokumentu *
          </label>
          <input
            type="text"
            value={form.documentCountry}
            onChange={(e) => update("documentCountry", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
            placeholder="np. Niemcy, Francja, USA"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data urodzenia *
          </label>
          <input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => update("dateOfBirth", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
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
    </div>
  );
}