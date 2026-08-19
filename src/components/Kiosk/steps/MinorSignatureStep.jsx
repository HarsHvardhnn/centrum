import { useEffect, useMemo } from "react";
import SignaturePad from "../SignaturePad";
import { PATIENT_TYPES } from "../PatientTypeDetector";
import { formatPolishDate } from "../../../utils/dateUtils";

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
      return relation || "przedstawiciel ustawowy";
  }
}

function getPatientDisplayName(formData) {
  const full = [formData.firstName, formData.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (formData.fullName?.trim()) return formData.fullName.trim();
  return "—";
}

/** PDF Number 5 — under-16 signature body (longer confirmation wording) */
function getGuardianSignatureCopyUnder16(formData) {
  const relation = String(formData.guardianRelation || "").toLowerCase().trim();
  const roleLabel = getGuardianRoleLabel(relation);
  const patientName = getPatientDisplayName(formData);
  const courtName = formData.courtName?.trim() || "—";
  const courtNumber = formData.courtNumber?.trim() || "—";
  const courtDate = formatPolishDate(formData.courtDate) || "—";
  const freeText =
    formData.guardianRelationDetail?.trim() ||
    formData.guardianRelationFreeText?.trim() ||
    formData.opiekunFaktycznyRelation?.trim() ||
    "";

  switch (relation) {
    case "matka":
      return {
        roleLabel,
        body: `Jako matka potwierdzasz podpisem złożone wcześniej oświadczenia i zgody dotyczące rejestracji oraz udzielenia świadczeń zdrowotnych małoletniemu pacjentowi ${patientName}.`,
        fieldLabel: "Podpis (matka) *",
      };
    case "ojciec":
      return {
        roleLabel,
        body: `Jako ojciec potwierdzasz podpisem złożone wcześniej oświadczenia i zgody dotyczące rejestracji oraz udzielenia świadczeń zdrowotnych małoletniemu pacjentowi ${patientName}.`,
        fieldLabel: "Podpis (ojciec) *",
      };
    case "opiekun_prawny":
    case "opiekun prawny":
      return {
        roleLabel,
        body: `Jako opiekun prawny, ustanowiony postanowieniem ${courtName} nr ${courtNumber} z dnia ${courtDate}, potwierdzasz podpisem złożone wcześniej oświadczenia i zgody dotyczące rejestracji oraz udzielenia świadczeń zdrowotnych małoletniemu pacjentowi ${patientName}.`,
        fieldLabel: "Podpis (opiekun prawny) *",
      };
    case "kurator":
      return {
        roleLabel,
        body: `Jako kurator, ustanowiony postanowieniem ${courtName} nr ${courtNumber} z dnia ${courtDate}, potwierdzasz podpisem złożone wcześniej oświadczenia i zgody dotyczące rejestracji oraz udzielenia świadczeń zdrowotnych małoletniemu pacjentowi ${patientName}.`,
        fieldLabel: "Podpis (kurator) *",
      };
    case "opiekun_faktyczny":
    case "opiekun faktyczny":
      return {
        roleLabel,
        body: freeText
          ? `Jako opiekun faktyczny (${freeText}) potwierdzasz podpisem zgodę na przeprowadzenie badania małoletniego pacjenta ${patientName} oraz zgodę RODO na przetwarzanie Twoich danych osobowych (imię, dokument, telefon, e-mail). Udzielenie innego świadczenia zdrowotnego oraz upoważnienie do dokumentacji medycznej wymaga zgody przedstawiciela ustawowego.`
          : `Jako opiekun faktyczny potwierdzasz podpisem zgodę na przeprowadzenie badania małoletniego pacjenta ${patientName} oraz zgodę RODO na przetwarzanie Twoich danych osobowych (imię, dokument, telefon, e-mail). Udzielenie innego świadczenia zdrowotnego oraz upoważnienie do dokumentacji medycznej wymaga zgody przedstawiciela ustawowego.`,
        fieldLabel: "Podpis (opiekun faktyczny) *",
      };
    default:
      return {
        roleLabel,
        body: `Jako ${roleLabel} potwierdzasz podpisem złożone wcześniej oświadczenia i zgody dotyczące rejestracji oraz udzielenia świadczeń zdrowotnych małoletniemu pacjentowi ${patientName}.`,
        fieldLabel: `Podpis (${roleLabel}) *`,
      };
  }
}

/** PDF Number 9 — 16–17 Block B (copy verbatim per role) */
function getGuardianSignatureCopy16_17(formData) {
  const relation = String(formData.guardianRelation || "").toLowerCase().trim();
  const roleLabel = getGuardianRoleLabel(relation);

  switch (relation) {
    case "matka":
      return {
        roleLabel,
        body: "Jako matka współwyrażasz zgodę razem z pacjentem na rejestrację i leczenie.",
        fieldLabel: "Podpis (matka) *",
      };
    case "ojciec":
      return {
        roleLabel,
        body: "Jako ojciec współwyrażasz zgodę razem z pacjentem na rejestrację i leczenie.",
        fieldLabel: "Podpis (ojciec) *",
      };
    case "opiekun_prawny":
    case "opiekun prawny":
      return {
        roleLabel,
        body: "Jako opiekun prawny współwyrażasz zgodę razem z pacjentem na rejestrację i leczenie.",
        fieldLabel: "Podpis (opiekun prawny) *",
      };
    case "kurator":
      return {
        roleLabel,
        body: "Jako kurator współwyrażasz zgodę razem z pacjentem na rejestrację i leczenie.",
        fieldLabel: "Podpis (kurator) *",
      };
    case "opiekun_faktyczny":
    case "opiekun faktyczny":
      return {
        roleLabel,
        body: "Jako opiekun faktyczny współwyrażasz zgodę razem z pacjentem na przeprowadzenie badania oraz podpisujesz zgodę RODO na przetwarzanie Twoich danych osobowych. Nie jesteś uprawniony do wyrażania zgody na inne świadczenia zdrowotne ani do upoważnienia do dokumentacji medycznej w imieniu dziecka.",
        fieldLabel: "Podpis (opiekun faktyczny) *",
      };
    default:
      return {
        roleLabel,
        body: `Jako ${roleLabel} współwyrażasz zgodę razem z pacjentem na rejestrację i leczenie.`,
        fieldLabel: `Podpis (${roleLabel}) *`,
      };
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

  const copy = useMemo(() => {
    return requiresPatientSignature
      ? getGuardianSignatureCopy16_17(formData)
      : getGuardianSignatureCopyUnder16(formData);
  }, [
    requiresPatientSignature,
    formData.guardianRelation,
    formData.firstName,
    formData.lastName,
    formData.fullName,
    formData.courtName,
    formData.courtNumber,
    formData.courtDate,
    formData.guardianRelationDetail,
    formData.guardianRelationFreeText,
    formData.opiekunFaktycznyRelation,
  ]);

  // PDF Number 9: "Blok B - Podpis: {role}" (not "Podpis: Name (role)")
  const blockBTitle = requiresPatientSignature
    ? `Blok B - Podpis: ${copy.roleLabel}`
    : (() => {
        const guardianName = [formData.guardianFirstName, formData.guardianLastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        return guardianName
          ? `Podpis: ${guardianName} (${copy.roleLabel})`
          : `Podpis: ${copy.roleLabel}`;
      })();

  const update = (field, value) => {
    updateFormData({ [field]: value });
  };

  useEffect(() => {
    const errors = [];

    if (
      !formData.guardianSignature ||
      formData.guardianSignature.trim() === "" ||
      formData.guardianSignature === "data:image/png;base64,"
    ) {
      errors.push(`Podpis (${copy.roleLabel}) jest wymagany.`);
    }

    if (requiresPatientSignature) {
      if (
        !formData.signature ||
        formData.signature.trim() === "" ||
        formData.signature === "data:image/png;base64,"
      ) {
        errors.push("Podpis pacjenta jest wymagany.");
      }
    }

    onValidationChange?.({ isValid: errors.length === 0, errors });
  }, [
    formData.guardianSignature,
    formData.signature,
    requiresPatientSignature,
    copy.roleLabel,
    onValidationChange,
  ]);

  return (
    <div className="space-y-6">
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

      <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
        <h4 className="text-lg font-semibold text-yellow-900 mb-4">{blockBTitle}</h4>
        <div className="text-sm text-yellow-800 mb-4">
          <p>{copy.body}</p>
        </div>
        <SignaturePad
          label={copy.fieldLabel}
          onChange={(sig) => update("guardianSignature", sig)}
          value={formData.guardianSignature}
        />
      </div>

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
