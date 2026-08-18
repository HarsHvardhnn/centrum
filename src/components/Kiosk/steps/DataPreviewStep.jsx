import { useEffect, useState } from "react";
import { formatPolishDate } from "../../../utils/dateUtils";
import { formatGuardianIdentity, isFactualGuardian, needsCourtData } from "../../../utils/guardian";
import { formatKioskAddress, formatKioskDocumentLabel } from "../kioskConstants";
import { PATIENT_TYPES } from "../PatientTypeDetector";
import PatientDataEditModal from "../PatientDataEditModal";

function Field({ label, value }) {
  return (
    <div>
      <span className="text-gray-600">{label}</span>
      <p className="font-medium text-gray-900 break-words">{value || "—"}</p>
    </div>
  );
}

function guardianRoleLabel(relation) {
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
      return relation || "przedstawiciel / opiekun";
  }
}

function guardianSectionTitle(relation) {
  const r = String(relation || "").toLowerCase().trim();
  if (r === "opiekun_faktyczny" || r === "opiekun faktyczny") return "Dane opiekuna faktycznego";
  if (r === "opiekun_prawny" || r === "opiekun prawny") return "Dane opiekuna prawnego";
  if (r === "kurator") return "Dane kuratora";
  return "Dane przedstawiciela ustawowego";
}

export default function DataPreviewStep({
  formData = {},
  updateFormData,
  patientType,
  mode = "full_registration",
  onValidationChange,
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const isInternational = patientType === PATIENT_TYPES.INTERNATIONAL;
  const isMinor =
    patientType === PATIENT_TYPES.MINOR_UNDER_16 ||
    patientType === PATIENT_TYPES.MINOR_16_17;
  const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(" ");
  const phone = [formData.phoneCode, formData.phone].filter(Boolean).join(" ");
  const guardianName = [formData.guardianFirstName, formData.guardianLastName]
    .filter(Boolean)
    .join(" ");
  const guardianPhone = [formData.guardianPhoneCode, formData.guardianPhone]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    onValidationChange?.({ isValid: true, errors: [] });
  }, [onValidationChange]);

  const handleSave = (editedData) => {
    const patch = {};
    Object.keys(editedData || {}).forEach((key) => {
      if (editedData[key] !== formData[key]) patch[key] = editedData[key];
    });
    if (Object.keys(patch).length) updateFormData(patch);
    setShowEditModal(false);
  };

  return (
    <div className="space-y-5">
      <div className="text-center sm:text-left">
        <h4 className="text-xl sm:text-2xl font-bold text-gray-900">
          Sprawdź swoje dane
        </h4>
        <p className="mt-2 text-base text-gray-600">
          Upewnij się, że dane są poprawne. Jeśli tak, przejdź do dokumentów do podpisu.
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-300 rounded-2xl p-5 sm:p-6">
        <div className="flex justify-between items-start gap-3 mb-4">
          <h5 className="font-semibold text-gray-900 text-lg">
            {isMinor ? "Dane pacjenta" : "Dane rejestracyjne"}
          </h5>
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="text-base text-teal-700 hover:text-teal-900 font-medium underline flex items-center gap-1 shrink-0 touch-manipulation py-1"
          >
            ✏️ Edytuj dane
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
          <Field label="Imię i nazwisko:" value={fullName} />
          {isInternational ? (
            <Field
              label="Dokument:"
              value={formatKioskDocumentLabel(formData) || [formData.documentType, formData.documentNumber].filter(Boolean).join(": ")}
            />
          ) : (
            <Field label="PESEL:" value={formData.pesel} />
          )}
          <Field label="Data urodzenia:" value={formatPolishDate(formData.dateOfBirth)} />
          <Field label="Adres:" value={formatKioskAddress(formData)} />
          <Field label="Telefon:" value={phone} />
          {formData.email ? <Field label="E-mail:" value={formData.email} /> : null}
        </div>
      </div>

      {isMinor && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 sm:p-6">
          <h5 className="font-semibold text-yellow-900 text-lg mb-4">
            {guardianSectionTitle(formData.guardianRelation)}
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
            <Field label="Imię i nazwisko:" value={guardianName} />
            <Field
              label="Podstawa reprezentacji:"
              value={guardianRoleLabel(formData.guardianRelation)}
            />
            <Field
              label={formData.guardianNoPesel ? "Dokument tożsamości:" : "PESEL:"}
              value={
                formData.guardianNoPesel
                  ? formatGuardianIdentity(formData)
                  : formData.guardianPesel
              }
            />
            <Field label="Telefon:" value={guardianPhone} />
            {formData.guardianEmail ? (
              <Field label="E-mail:" value={formData.guardianEmail} />
            ) : null}
            {needsCourtData(formData) && (
              <div className="sm:col-span-2">
                <Field
                  label="Orzeczenie sądu:"
                  value={[
                    formData.courtName,
                    formData.courtNumber ? `nr ${formData.courtNumber}` : "",
                    formData.courtDate
                      ? `z dnia ${formatPolishDate(formData.courtDate) || formData.courtDate}`
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
              </div>
            )}
            {isFactualGuardian(formData) && formData.guardianRelationDetail && (
              <div className="sm:col-span-2">
                <Field
                  label="Stosunek do pacjenta:"
                  value={formData.guardianRelationDetail}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 text-center sm:text-left">
        Kliknij <span className="font-medium text-gray-700">Dalej do dokumentów</span>, aby
        podpisać zgody.
      </p>

      <PatientDataEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        formData={formData}
        onSave={handleSave}
        patientType={patientType}
        mode={mode}
      />
    </div>
  );
}
