import { useEffect, useState } from "react";
import { PATIENT_TYPES } from "../PatientTypeDetector";
import { validatePhoneNumber, formatPhoneNumber, formatPhoneForDisplay } from "../../../utils/phoneUtils";
import PhoneCountrySelect from "../PhoneCountrySelect";
import { formatPolishPostalCode, validatePolishPostalCode } from "../../../utils/postalCodeUtils";
import { formatPolishDate } from "../../../utils/dateUtils";
import {
  formatDocumentNumberForDisplay,
  generateDocumentMetadata,
} from "../../../utils/documentNumberUtils";
import { analyzePeselForKiosk, normalizePesel } from "../../../utils/peselUtils";
import { formatGuardianIdentity, isFactualGuardian, needsCourtData } from "../../../utils/guardian";
import PatientDataEditModal from "../PatientDataEditModal";
import IdentityDocumentFields from "../../shared/IdentityDocumentFields";
import {
  EMPTY_IDENTITY_DOCUMENT,
  pickIdentityDocument,
  validateIdentityDocument,
} from "../../../utils/identityDocument";
import { EMPTY_AUTHORIZED_PERSON } from "../../../utils/authorizedPersons";

const HEALTHCARE_CONSENT_LABEL =
  "z organizacją udzielanych świadczeń opieki zdrowotnej, w tym prowadzeniem dokumentacji medycznej oraz przypomnieniami o terminie wizyty";

/** Role labels based on selected guardian / representative status */
function getGuardianRoleInfo(relation) {
  const r = String(relation || "").toLowerCase().trim();
  switch (r) {
    case "matka":
      return {
        label: "matka",
        rolePhrase: "matka (przedstawiciel ustawowy)",
        actingAs: "matka / przedstawiciel ustawowy",
        sectionTitle: "DANE PRZEDSTAWICIELA USTAWOWEGO",
      };
    case "ojciec":
      return {
        label: "ojciec",
        rolePhrase: "ojciec (przedstawiciel ustawowy)",
        actingAs: "ojciec / przedstawiciel ustawowy",
        sectionTitle: "DANE PRZEDSTAWICIELA USTAWOWEGO",
      };
    case "przedstawiciel_ustawowy":
    case "przedstawiciel ustawowy":
      return {
        label: "przedstawiciel ustawowy",
        rolePhrase: "przedstawiciel ustawowy",
        actingAs: "przedstawiciel ustawowy",
        sectionTitle: "DANE PRZEDSTAWICIELA USTAWOWEGO",
      };
    case "opiekun_prawny":
    case "opiekun prawny":
      return {
        label: "opiekun prawny",
        rolePhrase: "opiekun prawny",
        actingAs: "opiekun prawny",
        sectionTitle: "DANE OPIEKUNA PRAWNEGO",
      };
    case "kurator":
      return {
        label: "kurator",
        rolePhrase: "kurator",
        actingAs: "kurator",
        sectionTitle: "DANE KURATORA",
      };
    case "opiekun_faktyczny":
    case "opiekun faktyczny":
      return {
        label: "opiekun faktyczny",
        rolePhrase: "opiekun faktyczny",
        actingAs: "opiekun faktyczny",
        sectionTitle: "DANE OPIEKUNA FAKTYCZNEGO",
      };
    default:
      return {
        label: relation || "przedstawiciel ustawowy / opiekun faktyczny",
        rolePhrase: relation || "przedstawiciel ustawowy / opiekun faktyczny",
        actingAs: "przedstawiciel ustawowy / opiekun faktyczny",
        sectionTitle: "DANE PRZEDSTAWICIELA USTAWOWEGO / OPIEKUNA FAKTYCZNEGO",
      };
  }
}

/** PDF Number 6 — Block A (patient 16–17), no age in the legal wording */
const PATIENT_RODO_BLOCK_A_TEXT =
  "Ja niżej podpisana(-ny) oświadczam, że zapoznałam(-em) się z Klauzulą Informacyjną RODO i wyrażam zgodę na przetwarzanie moich danych osobowych przez CM7 SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ z siedzibą w Skarżysku-Kamiennej przy ul. Powstańców Warszawy 7/1.5, 26-110 Skarżysko-Kamienna, do celów związanych z:";

/** PDF Number 6 — Block B declaration per representation type (copy 1:1) */
function getGuardianRodoBlockBText(formData) {
  const repName = [formData.guardianFirstName, formData.guardianLastName]
    .filter(Boolean)
    .join(" ")
    .trim() || "—";
  const patientName = [formData.firstName, formData.lastName].filter(Boolean).join(" ").trim() || "—";
  const patientPesel = formData.pesel || "—";
  const courtName = formData.courtName?.trim() || "—";
  const courtNumber = formData.courtNumber?.trim() || "—";
  const courtDate = formData.courtDate ? formatPolishDate(formData.courtDate) || "—" : "—";
  const freeText =
    formData.guardianRelationDetail?.trim() ||
    formData.guardianRelationFreeText?.trim() ||
    "";
  const relation = String(formData.guardianRelation || "").toLowerCase().trim();
  const company =
    "CM7 SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ z siedzibą w Skarżysku-Kamiennej przy ul. Powstańców Warszawy 7/1.5, 26-110 Skarżysko-Kamienna";

  switch (relation) {
    case "matka":
      return `Ja niżej podpisana ${repName}, działając jako matka i przedstawiciel ustawowy małoletniego pacjenta ${patientName}, PESEL ${patientPesel}, oświadczam, że zapoznałam się z Klauzulą Informacyjną RODO i wyrażam zgodę na przetwarzanie danych osobowych mojego dziecka oraz moich danych kontaktowych przez ${company}, do celów związanych z:`;
    case "ojciec":
      return `Ja niżej podpisany ${repName}, działając jako ojciec i przedstawiciel ustawowy małoletniego pacjenta ${patientName}, PESEL ${patientPesel}, oświadczam, że zapoznałem się z Klauzulą Informacyjną RODO i wyrażam zgodę na przetwarzanie danych osobowych mojego dziecka oraz moich danych kontaktowych przez ${company}, do celów związanych z:`;
    case "opiekun_prawny":
    case "opiekun prawny":
      return `Ja niżej podpisana(-ny) ${repName}, działając jako opiekun prawny (przedstawiciel ustawowy ustanowiony postanowieniem ${courtName} nr ${courtNumber} z dnia ${courtDate}) małoletniego pacjenta ${patientName}, PESEL ${patientPesel}, oświadczam, że zapoznałam(-em) się z Klauzulą Informacyjną RODO i wyrażam zgodę na przetwarzanie danych osobowych podopiecznego oraz moich danych kontaktowych przez ${company}, do celów związanych z:`;
    case "kurator":
      return `Ja niżej podpisana(-ny) ${repName}, działając jako kurator (ustanowiony postanowieniem ${courtName} nr ${courtNumber} z dnia ${courtDate}) małoletniego pacjenta ${patientName}, PESEL ${patientPesel}, oświadczam, że zapoznałam(-em) się z Klauzulą Informacyjną RODO i wyrażam zgodę na przetwarzanie danych osobowych podopiecznego oraz moich danych kontaktowych przez ${company}, do celów związanych z:`;
    case "opiekun_faktyczny":
    case "opiekun faktyczny":
      return freeText
        ? `Ja niżej podpisana(-ny) ${repName}, działając jako opiekun faktyczny (${freeText}) małoletniego pacjenta ${patientName}, PESEL ${patientPesel}, oświadczam, że zapoznałam(-em) się z Klauzulą Informacyjną RODO i wyrażam zgodę na przetwarzanie danych osobowych podopiecznego oraz moich danych kontaktowych przez ${company}, do celów związanych z:`
        : `Ja niżej podpisana(-ny) ${repName}, działając jako opiekun faktyczny małoletniego pacjenta ${patientName}, PESEL ${patientPesel}, oświadczam, że zapoznałam(-em) się z Klauzulą Informacyjną RODO i wyrażam zgodę na przetwarzanie danych osobowych podopiecznego oraz moich danych kontaktowych przez ${company}, do celów związanych z:`;
    default: {
      const role = getGuardianRoleInfo(relation).actingAs;
      return `Ja niżej podpisana(-ny) ${repName}, działając jako ${role} małoletniego pacjenta ${patientName}, PESEL ${patientPesel}, oświadczam, że zapoznałam(-em) się z Klauzulą Informacyjną RODO i wyrażam zgodę na przetwarzanie danych osobowych podopiecznego oraz moich danych kontaktowych przez ${company}, do celów związanych z:`;
    }
  }
}

const EXAM_RISK_NOTICE =
  "Przyjmuję do wiadomości, że jeżeli planowane świadczenie wiąże się z podwyższonym ryzykiem lub wymaga zgody w formie pisemnej na zasadach szczególnych, personel medyczny przedstawi mi odrębny dokument zgody bezpośrednio przed jego udzieleniem.";

/** PDF Number 7 — Block A patient examination statement (16–17) */
function getPatientExaminationTexts(formData) {
  const patientName = [formData.firstName, formData.lastName].filter(Boolean).join(" ").trim() || "—";
  const noPesel = formData.noPesel === true || formData.hasPesel === false;
  const identityLabel = noPesel ? "dokument tożsamości" : "PESEL";
  const identityValue =
    (noPesel
      ? formData.documentNumber || formData.identityDocumentNumber
      : formData.pesel) || "—";
  return {
    p1: `Ja ${patientName}, ${identityLabel} ${identityValue}, wyrażam zgodę na przeprowadzenie badania lub udzielenie innego standardowego świadczenia zdrowotnego (w tym wywiadu, konsultacji, porady lekarskiej oraz badania przedmiotowego), niewymagającego odrębnej pisemnej zgody, na zasadach określonych w rozdziale 5 ustawy z dnia 6 listopada 2008 r. o prawach pacjenta i Rzeczniku Praw Pacjenta.`,
    p2: EXAM_RISK_NOTICE,
  };
}

/** PDF Number 8 / PDF-NUMBER-4 — representative statement variants (same for <16 and 16–17) */
function getGuardianStatementTexts(formData) {
  const repName = [formData.guardianFirstName, formData.guardianLastName]
    .filter(Boolean)
    .join(" ")
    .trim() || "—";
  const repIdentity = formatGuardianIdentity(formData);
  const patientName = [formData.firstName, formData.lastName].filter(Boolean).join(" ").trim() || "—";
  const patientPesel = formData.pesel || "—";
  const courtName = formData.courtName?.trim() || "—";
  const courtNumber = formData.courtNumber?.trim() || "—";
  const courtDate = formData.courtDate ? formatPolishDate(formData.courtDate) || "—" : "—";
  const freeText =
    formData.guardianRelationDetail?.trim() ||
    formData.guardianRelationFreeText?.trim() ||
    "";
  const relation = String(formData.guardianRelation || "").toLowerCase().trim();

  const p2Court =
    "Oświadczam, że podane przeze mnie informacje są zgodne z prawdą, a dokumenty potwierdzające moją tożsamość oraz podstawę reprezentacji (postanowienie sądu) są autentyczne i aktualne.";
  const p2Default =
    "Oświadczam, że podane przeze mnie informacje są zgodne z prawdą, a dokumenty potwierdzające moją tożsamość oraz podstawę reprezentacji są autentyczne i aktualne.";

  switch (relation) {
    case "matka":
      return {
        p1: `Ja, ${repName}, ${repIdentity}, oświadczam, że jestem matką małoletniego ${patientName}, PESEL ${patientPesel}, i jestem uprawniona do reprezentowania tej osoby w zakresie wyrażania zgody na udzielanie świadczeń zdrowotnych w Centrum Medycznym 7.`,
        p2: p2Default,
      };
    case "ojciec":
      return {
        p1: `Ja, ${repName}, ${repIdentity}, oświadczam, że jestem ojcem małoletniego ${patientName}, PESEL ${patientPesel}, i jestem uprawniony do reprezentowania tej osoby w zakresie wyrażania zgody na udzielanie świadczeń zdrowotnych w Centrum Medycznym 7.`,
        p2: p2Default,
      };
    case "opiekun_prawny":
    case "opiekun prawny":
      return {
        p1: `Ja, ${repName}, ${repIdentity}, oświadczam, że jestem opiekunem prawnym małoletniego ${patientName}, PESEL ${patientPesel}, ustanowionym postanowieniem ${courtName} nr ${courtNumber} z dnia ${courtDate}, i jestem uprawniony(-a) do reprezentowania tej osoby w zakresie wyrażania zgody na udzielanie świadczeń zdrowotnych w Centrum Medycznym 7.`,
        p2: p2Court,
      };
    case "kurator":
      return {
        p1: `Ja, ${repName}, ${repIdentity}, oświadczam, że jestem kuratorem małoletniego ${patientName}, PESEL ${patientPesel}, ustanowionym postanowieniem ${courtName} nr ${courtNumber} z dnia ${courtDate}, i jestem uprawniony(-a) do reprezentowania tej osoby w zakresie wyrażania zgody na udzielanie świadczeń zdrowotnych w Centrum Medycznym 7.`,
        p2: p2Court,
      };
    case "opiekun_faktyczny":
    case "opiekun faktyczny":
      return {
        p1: freeText
          ? `Ja, ${repName}, ${repIdentity}, oświadczam, że jestem opiekunem faktycznym (${freeText}) małoletniego ${patientName}, PESEL ${patientPesel}, i jestem uprawniony(-a) wyłącznie do wyrażenia zgody na przeprowadzenie badania w Centrum Medycznym 7 (art. 32 ust. 5 u.z.l.).`
          : `Ja, ${repName}, ${repIdentity}, oświadczam, że jestem opiekunem faktycznym małoletniego ${patientName}, PESEL ${patientPesel}, i jestem uprawniony(-a) wyłącznie do wyrażenia zgody na przeprowadzenie badania w Centrum Medycznym 7 (art. 32 ust. 5 u.z.l.).`,
        p2: p2Default,
      };
    default: {
      const role = getGuardianRoleInfo(relation).label;
      return {
        p1: `Ja, ${repName}, ${repIdentity}, oświadczam, że jestem ${role} małoletniego ${patientName}, PESEL ${patientPesel}, i jestem uprawniony(-a) do reprezentowania tej osoby w zakresie wyrażania zgody na udzielanie świadczeń zdrowotnych w Centrum Medycznym 7.`,
        p2: p2Default,
      };
    }
  }
}

/** PDF Number 7 — Block B guardian examination statement per role */
function getGuardianExaminationTexts(formData) {
  const repName = [formData.guardianFirstName, formData.guardianLastName]
    .filter(Boolean)
    .join(" ")
    .trim() || "—";
  const repIdentity = formatGuardianIdentity(formData);
  const patientName = [formData.firstName, formData.lastName].filter(Boolean).join(" ").trim() || "—";
  const patientPesel = formData.pesel || "—";
  const courtName = formData.courtName?.trim() || "—";
  const courtNumber = formData.courtNumber?.trim() || "—";
  const courtDate = formData.courtDate ? formatPolishDate(formData.courtDate) || "—" : "—";
  const freeText =
    formData.guardianRelationDetail?.trim() ||
    formData.guardianRelationFreeText?.trim() ||
    "";
  const relation = String(formData.guardianRelation || "").toLowerCase().trim();
  const isFactual = relation === "opiekun_faktyczny" || relation === "opiekun faktyczny";

  let p1;
  switch (relation) {
    case "matka":
      p1 = `Ja, ${repName} (matka, ${repIdentity}), działając jako matka i przedstawiciel ustawowy małoletniego pacjenta ${patientName}, PESEL ${patientPesel}, wyrażam zgodę na przeprowadzenie badania lub udzielenie innego standardowego świadczenia zdrowotnego (w tym wywiadu, konsultacji, porady lekarskiej oraz badania przedmiotowego), niewymagającego odrębnej pisemnej zgody, na zasadach określonych w rozdziale 5 ustawy z dnia 6 listopada 2008 r. o prawach pacjenta i Rzeczniku Praw Pacjenta.`;
      break;
    case "ojciec":
      p1 = `Ja, ${repName} (ojciec, ${repIdentity}), działając jako ojciec i przedstawiciel ustawowy małoletniego pacjenta ${patientName}, PESEL ${patientPesel}, wyrażam zgodę na przeprowadzenie badania lub udzielenie innego standardowego świadczenia zdrowotnego (w tym wywiadu, konsultacji, porady lekarskiej oraz badania przedmiotowego), niewymagającego odrębnej pisemnej zgody, na zasadach określonych w rozdziale 5 ustawy z dnia 6 listopada 2008 r. o prawach pacjenta i Rzeczniku Praw Pacjenta.`;
      break;
    case "opiekun_prawny":
    case "opiekun prawny":
      p1 = `Ja, ${repName} (opiekun prawny, ${repIdentity}), działając jako opiekun prawny (przedstawiciel ustawowy ustanowiony postanowieniem ${courtName} nr ${courtNumber} z dnia ${courtDate}) małoletniego pacjenta ${patientName}, PESEL ${patientPesel}, wyrażam zgodę na przeprowadzenie badania lub udzielenie innego standardowego świadczenia zdrowotnego (w tym wywiadu, konsultacji, porady lekarskiej oraz badania przedmiotowego), niewymagającego odrębnej pisemnej zgody, na zasadach określonych w rozdziale 5 ustawy z dnia 6 listopada 2008 r. o prawach pacjenta i Rzeczniku Praw Pacjenta.`;
      break;
    case "kurator":
      p1 = `Ja, ${repName} (kurator, ${repIdentity}), działając jako kurator (ustanowiony postanowieniem ${courtName} nr ${courtNumber} z dnia ${courtDate}) małoletniego pacjenta ${patientName}, PESEL ${patientPesel}, wyrażam zgodę na przeprowadzenie badania lub udzielenie innego standardowego świadczenia zdrowotnego (w tym wywiadu, konsultacji, porady lekarskiej oraz badania przedmiotowego), niewymagającego odrębnej pisemnej zgody, na zasadach określonych w rozdziale 5 ustawy z dnia 6 listopada 2008 r. o prawach pacjenta i Rzeczniku Praw Pacjenta.`;
      break;
    case "opiekun_faktyczny":
    case "opiekun faktyczny":
      p1 = freeText
        ? `Ja, ${repName} (opiekun faktyczny — ${freeText}, ${repIdentity}), działając jako opiekun faktyczny małoletniego pacjenta ${patientName}, PESEL ${patientPesel}, wyrażam zgodę wyłącznie na przeprowadzenie badania (w tym wywiadu i badania przedmiotowego), na zasadach określonych w art. 32 ust. 5 ustawy o zawodach lekarza i lekarza dentysty oraz rozdziale 5 ustawy z dnia 6 listopada 2008 r. o prawach pacjenta i Rzeczniku Praw Pacjenta.`
        : `Ja, ${repName} (opiekun faktyczny, ${repIdentity}), działając jako opiekun faktyczny małoletniego pacjenta ${patientName}, PESEL ${patientPesel}, wyrażam zgodę wyłącznie na przeprowadzenie badania (w tym wywiadu i badania przedmiotowego), na zasadach określonych w art. 32 ust. 5 ustawy o zawodach lekarza i lekarza dentysty oraz rozdziale 5 ustawy z dnia 6 listopada 2008 r. o prawach pacjenta i Rzeczniku Praw Pacjenta.`;
      break;
    default: {
      const role = getGuardianRoleInfo(relation).label;
      p1 = `Ja, ${repName} (${role}, ${repIdentity}), działając jako ${getGuardianRoleInfo(relation).actingAs} małoletniego pacjenta ${patientName}, PESEL ${patientPesel}, wyrażam zgodę na przeprowadzenie badania lub udzielenie innego standardowego świadczenia zdrowotnego (w tym wywiadu, konsultacji, porady lekarskiej oraz badania przedmiotowego), niewymagającego odrębnej pisemnej zgody, na zasadach określonych w rozdziale 5 ustawy z dnia 6 listopada 2008 r. o prawach pacjenta i Rzeczniku Praw Pacjenta.`;
    }
  }

  const p2 = isFactual
    ? "Przyjmuję do wiadomości, że udzielenie innego świadczenia zdrowotnego niż badanie (np. zabiegu, procedury o podwyższonym ryzyku) wymaga zgody przedstawiciela ustawowego (matki, ojca, opiekuna prawnego lub kuratora) i nie może zostać udzielone na podstawie niniejszego oświadczenia."
    : EXAM_RISK_NOTICE;

  return {
    p1,
    p2,
    // PDF Number 3 labels
    radioLabel: isFactual
      ? "Zgoda na przeprowadzenie badania"
      : "Zgoda na świadczenie zdrowotne",
  };
}

const DEFAULT_EXAM_REFUSE_NOTICE =
  "Bez wyrażenia zgody nie jest możliwe przeprowadzenie badania. Rejestracja zostanie zapisana jako niepotwierdzona — prosimy o kontakt z recepcją w celu wyjaśnienia.";

/** PDF Number 9 — patient Block A refusal (16–17) */
const PATIENT_16_17_EXAM_REFUSE_MESSAGE = `Nie wyraziłeś(-aś) zgody na przeprowadzenie badania lub udzielenie innego świadczenia zdrowotnego. Ze względu na to, że jako pacjent w wieku 16-17 lat masz ograniczoną zdolność do czynności prawnych, obowiązujące przepisy wymagają zgody wyrażonej łącznie przez Ciebie i Twojego przedstawiciela ustawowego (opiekuna) — zgoda samego przedstawiciela nie jest wystarczająca do przeprowadzenia świadczenia w naszej placówce.

Bez Twojej zgody nie jest możliwe przeprowadzenie badania. Rejestracja zostanie zapisana jako niepotwierdzona — prosimy o kontakt z recepcją w celu wyjaśnienia.`;

/** PDF Number 9 — guardian Block B refusal (16–17) */
const GUARDIAN_16_17_EXAM_REFUSE_MESSAGE = `Nie wyraziłeś(-aś) zgody jako przedstawiciel ustawowy pacjenta. Ze względu na to, że pacjent w wieku 16-17 lat ma ograniczoną zdolność do czynności prawnych, jego własna zgoda — mimo że prawnie wymagana — nie jest samodzielnie wystarczająca do przeprowadzenia świadczenia. Twoja zgoda jako przedstawiciela ustawowego musi zostać wyrażona łącznie ze zgodą pacjenta.

Bez wyrażenia zgody nie jest możliwe przeprowadzenie badania. Rejestracja zostanie zapisana jako niepotwierdzona — prosimy o kontakt z recepcją w celu wyjaśnienia.`;

function AgreeRefuseRadios({
  name,
  value,
  onChange,
  label,
  accent = "green",
  refuseMessage = DEFAULT_EXAM_REFUSE_NOTICE,
}) {
  const border =
    accent === "blue" ? "border-blue-400 bg-blue-50" : "border-green-400 bg-green-50";
  const text = accent === "blue" ? "text-blue-900" : "text-green-900";
  return (
    <div className={`p-4 rounded-lg border-2 ${border} space-y-3`}>
      <p className={`text-sm font-semibold ${text}`}>
        {label} <span className="text-red-600">*</span>
      </p>
      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-800">
          <input
            type="radio"
            name={name}
            checked={value === "agree"}
            onChange={() => onChange("agree")}
            className="w-5 h-5 text-teal-700"
          />
          Wyrażam zgodę
        </label>
        <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-800">
          <input
            type="radio"
            name={name}
            checked={value === "refuse"}
            onChange={() => onChange("refuse")}
            className="w-5 h-5 text-teal-700"
          />
          Nie wyrażam zgody
        </label>
      </div>
      {value === "refuse" && refuseMessage && (
        <div className="text-xs text-amber-900 bg-amber-100 border border-amber-300 rounded-md p-3 space-y-2 whitespace-pre-line">
          {refuseMessage}
        </div>
      )}
    </div>
  );
}

export default function MinorConsentsStep({
  formData = {},
  updateFormData,
  patientType,
  mode = "full_registration",
  validation = {},
  onValidationChange,
  onGoToStep,
  /** One document per wizard step: rodo | examination | guardian_statement | authorization | all */
  documentSection = "all",
}) {
  const requiresPatientConsent = patientType === PATIENT_TYPES.MINOR_16_17;
  const guardianRole = getGuardianRoleInfo(formData.guardianRelation);
  const [showEditModal, setShowEditModal] = useState(false);
  const [documentNumbers, setDocumentNumbers] = useState({});
  const show = (section) => documentSection === "all" || documentSection === section;

  // Leave Nr blank on the tablet — final number (with Patient ID) is assigned
  // when the PDF is generated at signing, so we never show a mismatched Nr.
  useEffect(() => {
    const opts = { patientDisplayId: "" };
    setDocumentNumbers({
      gdpr: generateDocumentMetadata("gdpr", opts),
      examination: generateDocumentMetadata("examination", opts),
      guardian_statement: generateDocumentMetadata("guardian_statement", opts),
      authorization: generateDocumentMetadata("authorization", opts),
    });
  }, []);

  const update = (field, value) => {
    updateFormData({ [field]: value });
  };

  const handleSavePatientData = (editedData) => {
    // Update form data with edited values
    Object.keys(editedData).forEach(key => {
      if (editedData[key] !== formData[key]) {
        updateFormData({ [key]: editedData[key] });
      }
    });
    setShowEditModal(false);
  };

  // Helper function to validate PESEL for authorized persons
  const validateAuthorizedPersonPesel = (pesel, noPesel = false) => {
    if (noPesel) {
      return { valid: true, message: "", type: "success" };
    }

    if (!pesel || pesel.trim() === "") {
      return { valid: false, message: "PESEL jest wymagany", type: "error" };
    }

    const normalized = normalizePesel(pesel);
    
    if (normalized.length !== 11) {
      return { valid: false, message: "PESEL musi mieć dokładnie 11 cyfr", type: "error" };
    }

    const analysis = analyzePeselForKiosk(normalized);
    
    if (!analysis.valid) {
      return { valid: false, message: analysis.message, type: "error" };
    }

    return { valid: true, message: "PESEL jest prawidłowy", type: "success" };
  };

  // Validation — scoped to the active document window
  useEffect(() => {
    const errors = [];
    const check = (section) => documentSection === "all" || documentSection === section;

    if (check("rodo")) {
      const factual = isFactualGuardian(formData);
      if (patientType === PATIENT_TYPES.MINOR_UNDER_16) {
        if (!factual && !formData.consentHealthcare) {
          errors.push("Zgoda opiekuna na przetwarzanie danych osobowych jest wymagana.");
        }
      } else if (patientType === PATIENT_TYPES.MINOR_16_17) {
        if (!formData.consentHealthcare) {
          errors.push("Zgoda pacjenta na przetwarzanie danych osobowych jest wymagana.");
        }
        if (!factual && !formData.consentHealthcareGuardian) {
          errors.push("Zgoda opiekuna na przetwarzanie danych osobowych jest wymagana.");
        }
      }
    }

    if (check("examination")) {
      if (patientType === PATIENT_TYPES.MINOR_16_17) {
        if (
          formData.examinationConsentPatient !== "agree" &&
          formData.examinationConsentPatient !== "refuse"
        ) {
          errors.push("Zaznacz decyzję pacjenta dotyczącą badania: Wyrażam zgodę lub Nie wyrażam zgody.");
        }
        if (
          formData.examinationConsentGuardian !== "agree" &&
          formData.examinationConsentGuardian !== "refuse"
        ) {
          errors.push("Zaznacz decyzję opiekuna dotyczącą badania: Wyrażam zgodę lub Nie wyrażam zgody.");
        }
      } else if (
        formData.examinationConsentGuardian !== "agree" &&
        formData.examinationConsentGuardian !== "refuse" &&
        !formData.consentExamination
      ) {
        errors.push("Zaznacz decyzję opiekuna dotyczącą badania: Wyrażam zgodę lub Nie wyrażam zgody.");
      }
    }

    if (check("guardian_statement")) {
      if (!formData.consentGuardianStatement) {
        errors.push("Oświadczenie przedstawiciela ustawowego / opiekuna faktycznego jest wymagane.");
      }
      const relation = String(formData.guardianRelation || "").toLowerCase();
      const needsCourt =
        relation === "opiekun_prawny" ||
        relation === "kurator" ||
        relation === "opiekun prawny";
      if (needsCourt) {
        if (!formData.courtName?.trim()) {
          errors.push(
            "Brak nazwy sądu — wróć do kroku „Dane opiekuna” i uzupełnij orzeczenie."
          );
        }
        if (!formData.courtNumber?.trim()) {
          errors.push(
            "Brak numeru orzeczenia — wróć do kroku „Dane opiekuna” i uzupełnij orzeczenie."
          );
        }
        if (!formData.courtDate) {
          errors.push(
            "Brak daty orzeczenia — wróć do kroku „Dane opiekuna” i uzupełnij orzeczenie."
          );
        }
      }
    }

    if (check("authorization")) {
      if (!formData.grantsAuthorization && !formData.deniesAuthorization) {
        errors.push("Musisz wybrać czy upoważniasz osoby do dostępu do informacji medycznych czy nie.");
      }
      if (formData.grantsAuthorization && formData.authorizedPersons) {
        formData.authorizedPersons.forEach((person, index) => {
          if (!person.firstName) errors.push(`Imię osoby ${index + 1} jest wymagane.`);
          if (!person.lastName) errors.push(`Nazwisko osoby ${index + 1} jest wymagane.`);
          if (person.noPesel) {
            errors.push(
              ...validateIdentityDocument(person, { subject: `Osoba ${index + 1}` })
            );
          } else if (!person.pesel) {
            errors.push(`PESEL osoby ${index + 1} jest wymagany.`);
          } else if (String(person.pesel).replace(/\D/g, "").length !== 11) {
            errors.push(`PESEL osoby ${index + 1} musi mieć 11 cyfr.`);
          }
          if (!person.relationshipToPatient) {
            errors.push(`Stosunek do pacjenta osoby ${index + 1} jest wymagany.`);
          }
          if (!person.phone) errors.push(`Numer telefonu osoby ${index + 1} jest wymagany.`);
          if (!person.street && !person.address) {
            errors.push(`Adres osoby ${index + 1} jest wymagany.`);
          }
          if (!person.zipCode) errors.push(`Kod pocztowy osoby ${index + 1} jest wymagany.`);
          if (!person.city) errors.push(`Miasto osoby ${index + 1} jest wymagane.`);
        });
        if (!formData.authorizedPersons.length) {
          errors.push("Musisz dodać przynajmniej jedną osobę upoważnioną lub wybrać 'NIE UPOWAŻNIAM'.");
        }
      }
    }

    const isValid = errors.length === 0;
    onValidationChange?.({ isValid, errors });
  }, [formData, patientType, documentSection, onValidationChange]);

  const purposeCheckboxes = (requiredField, campaignsField, marketingField, accent) => {
    const borderReq =
      accent === "blue" ? "border-2 border-blue-300 bg-blue-50" : "border-2 border-yellow-300 bg-yellow-50";
    const ring =
      accent === "blue" ? "text-blue-700 focus:ring-blue-500" : "text-yellow-700 focus:ring-yellow-500";
    const reqLabel =
      accent === "blue" ? "text-blue-800" : "text-yellow-800";
    return (
      <div className="space-y-3">
        <div className={`flex items-start gap-3 p-4 rounded-lg ${borderReq}`}>
          <input
            type="checkbox"
            checked={!!formData[requiredField]}
            onChange={(e) => update(requiredField, e.target.checked)}
            className={`mt-1 w-6 h-6 rounded border-gray-400 ${ring}`}
          />
          <div className="text-sm">
            <p className="text-gray-700">{HEALTHCARE_CONSENT_LABEL}</p>
            <p className={`text-xs mt-2 font-medium ${reqLabel}`}>WYMAGANE</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-300 bg-gray-50">
          <input
            type="checkbox"
            checked={!!formData[campaignsField]}
            onChange={(e) => update(campaignsField, e.target.checked)}
            className={`mt-1 w-6 h-6 rounded border-gray-400 ${ring}`}
          />
          <div className="text-sm">
            <p className="text-gray-700">
              z przesyłaniem informacji o kampaniach i akcjach prozdrowotnych
            </p>
            <p className="text-xs text-gray-600 mt-1">OPCJONALNE</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-300 bg-gray-50">
          <input
            type="checkbox"
            checked={!!formData[marketingField]}
            onChange={(e) => update(marketingField, e.target.checked)}
            className={`mt-1 w-6 h-6 rounded border-gray-400 ${ring}`}
          />
          <div className="text-sm">
            <p className="text-gray-700">
              z otrzymywaniem newslettera z informacjami marketingowymi
            </p>
            <p className="text-xs text-gray-600 mt-1">OPCJONALNE</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {show("guardian_statement") && (
        <>
          {/* Review card on first consent document (oświadczenie) */}
          <div className="bg-gray-50 border border-gray-300 rounded-xl p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold text-gray-900">Sprawdź dane pacjenta i przedstawiciela</h4>
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="text-sm text-teal-700 hover:text-teal-900 font-medium underline flex items-center gap-1"
              >
                ✏️ Edytuj dane
              </button>
            </div>
            <div className="mb-4">
              <h5 className="font-medium text-blue-900 mb-2">Dane pacjenta:</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-blue-50 p-3 rounded-lg">
                <div>
                  <span className="text-blue-700">Pacjent:</span>
                  <p className="font-medium">
                    {formData.firstName} {formData.lastName}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700">PESEL:</span>
                  <p className="font-medium">{formData.pesel}</p>
                </div>
                <div>
                  <span className="text-blue-700">Adres:</span>
                  <p className="font-medium">
                    {formData.street}, {formData.zipCode} {formData.city}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h5 className="font-medium text-yellow-900 mb-2">{guardianRole.sectionTitle}:</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-yellow-50 p-3 rounded-lg">
                <div>
                  <span className="text-yellow-700">Imię i nazwisko:</span>
                  <p className="font-medium">
                    {formData.guardianFirstName} {formData.guardianLastName}
                  </p>
                </div>
                <div>
                  <span className="text-yellow-700">Podstawa reprezentacji:</span>
                  <p className="font-medium">{guardianRole.label}</p>
                </div>
                <div>
                  <span className="text-yellow-700">
                    {formData.guardianNoPesel ? "Dokument tożsamości:" : "PESEL:"}
                  </span>
                  <p className="font-medium">
                    {formData.guardianNoPesel
                      ? formData.guardianDocumentNumber || "—"
                      : formData.guardianPesel}
                  </p>
                </div>
                <div>
                  <span className="text-yellow-700">Telefon:</span>
                  <p className="font-medium">
                    {formData.guardianPhoneCode} {formData.guardianPhone}
                  </p>
                </div>
                {needsCourtData(formData) && (
                  <div className="sm:col-span-2">
                    <span className="text-yellow-700">Orzeczenie sądu:</span>
                    <p className="font-medium">
                      {formData.courtName || "—"}
                      {formData.courtNumber ? ` · nr ${formData.courtNumber}` : ""}
                      {formData.courtDate
                        ? ` · z dnia ${formatPolishDate(formData.courtDate) || formData.courtDate}`
                        : ""}
                    </p>
                  </div>
                )}
                {isFactualGuardian(formData) && formData.guardianRelationDetail && (
                  <div className="sm:col-span-2">
                    <span className="text-yellow-700">Stosunek do pacjenta:</span>
                    <p className="font-medium">{formData.guardianRelationDetail}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {show("rodo") && (
          <div className="bg-white border-2 border-blue-300 rounded-xl p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                ZGODA NA PRZETWARZANIE DANYCH OSOBOWYCH
              </h2>
              <p className="text-sm text-blue-800 font-medium">
                {patientType === PATIENT_TYPES.MINOR_16_17
                  ? "PACJENT NIEPEŁNOLETNI 16-17 LAT"
                  : "PACJENT NIEPEŁNOLETNI PONIŻEJ 16 LAT"}
              </p>
              <div className="text-right text-sm text-gray-600 mt-2">
                <p>Nr: {formatDocumentNumberForDisplay(documentNumbers.gdpr?.number)}</p>
                <p>Data: {documentNumbers.gdpr?.date || generateDocumentMetadata("gdpr").date}</p>
              </div>
            </div>

            {patientType === PATIENT_TYPES.MINOR_UNDER_16 ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-800 leading-relaxed">
                  <p>{getGuardianRodoBlockBText(formData)}</p>
                </div>
                {purposeCheckboxes(
                  "consentHealthcare",
                  "consentHealthCampaigns",
                  "consentMarketing",
                  "yellow"
                )}
              </div>
            ) : (
              <div className="space-y-5">
                <div className="bg-blue-50 rounded-lg p-5 space-y-3 border border-blue-200">
                  <h4 className="font-semibold text-blue-900">Blok A — Zgoda pacjenta</h4>
                  <div className="text-sm text-blue-800 p-3 bg-white rounded-lg border border-blue-100 leading-relaxed">
                    {PATIENT_RODO_BLOCK_A_TEXT}
                  </div>
                  {purposeCheckboxes(
                    "consentHealthcare",
                    "consentHealthCampaigns",
                    "consentMarketing",
                    "blue"
                  )}
                </div>
                {!isFactualGuardian(formData) && (
                <div className="bg-yellow-50 rounded-lg p-5 space-y-3 border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900">
                    Blok B — Zgoda: {guardianRole.label}
                  </h4>
                  <div className="text-sm text-yellow-800 p-3 bg-white rounded-lg border border-yellow-100 leading-relaxed">
                    {getGuardianRodoBlockBText(formData)}
                  </div>
                  {purposeCheckboxes(
                    "consentHealthcareGuardian",
                    "consentHealthCampaignsGuardian",
                    "consentMarketingGuardian",
                    "yellow"
                  )}
                </div>
                )}
              </div>
            )}
          </div>
      )}

      {show("examination") && (
      <div className="bg-white border-2 border-green-400 rounded-xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-green-900 mb-2">
            {patientType === PATIENT_TYPES.MINOR_16_17
              ? "OŚWIADCZENIE PACJENTA I OPIEKUNA o wyrażeniu zgody na przeprowadzenie badania lub udzielenie innego świadczenia zdrowotnego"
              : "OŚWIADCZENIE PRZEDSTAWICIELA USTAWOWEGO / OPIEKUNA FAKTYCZNEGO o wyrażeniu zgody na przeprowadzenie badania lub udzielenie innego świadczenia zdrowotnego"}
          </h2>
          <div className="text-right text-sm text-gray-600">
            <p>Nr: {formatDocumentNumberForDisplay(documentNumbers.examination?.number)}</p>
            <p>Data: {documentNumbers.examination?.date || generateDocumentMetadata("examination").date}</p>
            <p className="text-green-800 font-medium mt-1">WYMAGANE</p>
          </div>
        </div>

        {/* Patient Summary for Reference */}
        <div className="mb-4 bg-blue-50 p-3 rounded-lg text-sm">
          <p><strong>Pacjent:</strong> {formData.firstName} {formData.lastName} (PESEL: {formData.pesel})</p>
          {patientType === PATIENT_TYPES.MINOR_16_17 && (
            <p><strong>Opiekun:</strong> {formData.guardianFirstName} {formData.guardianLastName}</p>
          )}
        </div>

        {(() => {
          const guardianExam = getGuardianExaminationTexts(formData);
          const patientExam = getPatientExaminationTexts(formData);
          const setPatientChoice = (choice) => {
            updateFormData({
              examinationConsentPatient: choice,
              consentExamination: choice === "agree",
            });
          };
          const setGuardianChoice = (choice) => {
            updateFormData({
              examinationConsentGuardian: choice,
              consentExaminationGuardian: choice === "agree",
              // under-16 historically used consentExamination for the sole guardian decision
              ...(patientType !== PATIENT_TYPES.MINOR_16_17
                ? { consentExamination: choice === "agree" }
                : {}),
            });
          };

          return (
            <div className="space-y-5">
              {/* PDF Number 7 — Block A (16–17 only) */}
              {patientType === PATIENT_TYPES.MINOR_16_17 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-900">Blok A — Oświadczenie pacjenta</h4>
                  <div className="text-sm text-gray-800 leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-3">
                    <p>{patientExam.p1}</p>
                    <p>{patientExam.p2}</p>
                  </div>
                  <AgreeRefuseRadios
                    name="examinationConsentPatient"
                    value={formData.examinationConsentPatient || ""}
                    onChange={setPatientChoice}
                    label="Zgoda pacjenta na świadczenie zdrowotne"
                    accent="blue"
                    refuseMessage={PATIENT_16_17_EXAM_REFUSE_MESSAGE}
                  />
                </div>
              )}

              {/* PDF Number 3 / 7 — guardian block (sole content under 16) */}
              <div className="space-y-3">
                {patientType === PATIENT_TYPES.MINOR_16_17 && (
                  <h4 className="font-semibold text-green-900">
                    Blok B — Oświadczenie: {guardianRole.label}
                  </h4>
                )}
                <div className="text-sm text-gray-800 leading-relaxed bg-green-50 p-4 rounded-lg border border-green-100 space-y-3">
                  <p>{guardianExam.p1}</p>
                  <p>{guardianExam.p2}</p>
                  <p className="text-xs text-gray-600 italic">
                    art. 17 ust. 1 i 3 UPP (t.j. Dz. U. z 2024 r. poz. 581) · art. 32 ust. 2 i 5 ustawy o
                    zawodach lekarza i lekarza dentysty (t.j. Dz. U. z 2023 r. poz. 1516)
                  </p>
                </div>
                <AgreeRefuseRadios
                  name="examinationConsentGuardian"
                  value={
                    formData.examinationConsentGuardian ||
                    (formData.consentExaminationGuardian === true ||
                    (patientType !== PATIENT_TYPES.MINOR_16_17 && formData.consentExamination === true)
                      ? "agree"
                      : "")
                  }
                  onChange={setGuardianChoice}
                  label={guardianExam.radioLabel}
                  accent="green"
                  refuseMessage={
                    patientType === PATIENT_TYPES.MINOR_16_17
                      ? GUARDIAN_16_17_EXAM_REFUSE_MESSAGE
                      : DEFAULT_EXAM_REFUSE_NOTICE
                  }
                />
              </div>
            </div>
          );
        })()}

        <div className="mt-4 text-xs text-gray-600 italic">
          <p>
            Informuję, że podczas wizyty lekarz może poprosić o wyrażenie dodatkowych zgód, w zależności od
            rodzaju udzielanego świadczenia zdrowotnego.
          </p>
        </div>
      </div>
      )}

      {show("guardian_statement") && (
      <div className="bg-white border-2 border-amber-400 rounded-xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-amber-900 mb-2">
            OŚWIADCZENIE PRZEDSTAWICIELA USTAWOWEGO / OPIEKUNA FAKTYCZNEGO
          </h2>
          <p className="text-sm text-amber-800">
            o posiadaniu uprawnień do reprezentowania pacjenta małoletniego lub ubezwłasnowolnionego
          </p>
          <div className="text-right text-sm text-gray-600 mt-2">
            <p>Nr: {formatDocumentNumberForDisplay(documentNumbers.guardian_statement?.number)}</p>
            <p>
              Data:{" "}
              {documentNumbers.guardian_statement?.date ||
                generateDocumentMetadata("guardian_statement").date}
            </p>
            <p className="text-red-700 font-medium mt-1">WYMAGANE</p>
          </div>
        </div>

        {needsCourtData(formData) && (
          <div className="mb-4 bg-rose-50 border border-rose-200 rounded-lg p-4 text-sm">
            <p className="font-semibold text-rose-900 mb-2">
              Dane orzeczenia / postanowienia sądu
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-xs text-gray-600">Nazwa sądu</span>
                <p className="font-medium text-gray-900">{formData.courtName || "—"}</p>
              </div>
              <div>
                <span className="text-xs text-gray-600">Numer orzeczenia</span>
                <p className="font-medium text-gray-900">{formData.courtNumber || "—"}</p>
              </div>
              <div>
                <span className="text-xs text-gray-600">Data wydania</span>
                <p className="font-medium text-gray-900">
                  {formData.courtDate
                    ? formatPolishDate(formData.courtDate) || String(formData.courtDate).slice(0, 10)
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 text-sm text-gray-800 leading-relaxed bg-amber-50 p-4 rounded-lg border border-amber-100">
          {(() => {
            const stmt = getGuardianStatementTexts(formData);
            return (
              <>
                <p className="mb-3">{stmt.p1}</p>
                <p className="mb-1">{stmt.p2}</p>
              </>
            );
          })()}
          <p className="text-xs text-gray-600 italic mt-2">
            art. 17 UPP · art. 32 ust. 2 i 5 ustawy o zawodach lekarza i lekarza dentysty
          </p>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-amber-400 bg-amber-50">
          <input
            type="checkbox"
            checked={!!formData.consentGuardianStatement}
            onChange={(e) =>
              updateFormData({
                consentGuardianStatement: e.target.checked,
                guardianStatementConsent: e.target.checked ? "agree" : "",
              })
            }
            className="mt-1 w-6 h-6 rounded border-gray-400 text-amber-700 focus:ring-amber-500"
          />
          <div className="text-sm">
            <p className="font-semibold text-amber-900 mb-1">
              Potwierdzam treść oświadczenia i posiadanie uprawnień do reprezentowania pacjenta *
            </p>
            <p className="text-xs text-red-700 mt-1 font-medium">WYMAGANE</p>
          </div>
        </div>
      </div>
      )}

      {show("authorization") && (
      <div className="bg-white border-2 border-purple-300 rounded-xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-purple-900 mb-2">
            {patientType === PATIENT_TYPES.MINOR_16_17
              ? `UPOWAŻNIENIE (PACJENT I ${guardianRole.label.toUpperCase()}) do uzyskiwania informacji o stanie zdrowia przez osobę bliską`
              : `UPOWAŻNIENIE (${guardianRole.label.toUpperCase()}) do uzyskiwania informacji o stanie zdrowia przez osobę bliską`}
          </h2>
          <div className="text-right text-sm text-gray-600 mb-2">
            <p>Nr: {formatDocumentNumberForDisplay(documentNumbers.authorization?.number)}</p>
            <p>
              Data:{" "}
              {documentNumbers.authorization?.date || generateDocumentMetadata("authorization").date}
            </p>
          </div>
        </div>

        <div className="mb-4 bg-blue-50 p-3 rounded-lg text-sm space-y-1">
          <p>
            <strong>Pacjent niepełnoletni:</strong> {formData.firstName} {formData.lastName}{" "}
            (PESEL: {formData.pesel || "—"})
          </p>
          <p>
            <strong>
              {guardianRole.label.charAt(0).toUpperCase() + guardianRole.label.slice(1)}:
            </strong>{" "}
            {formData.guardianFirstName} {formData.guardianLastName}
          </p>
        </div>

        {/* Authorization Choice */}
        <div className="mb-6 space-y-4">
          {/* Grant Authorization */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={!!formData.grantsAuthorization}
                onChange={(e) => {
                  const checked = e.target.checked;
                  updateFormData({
                    grantsAuthorization: checked,
                    deniesAuthorization: checked ? false : formData.deniesAuthorization,
                    authorizationChoice: checked ? "authorize" : "",
                    authorizedPersons:
                      checked && (!formData.authorizedPersons || formData.authorizedPersons.length === 0)
                        ? [EMPTY_AUTHORIZED_PERSON()]
                        : checked
                          ? formData.authorizedPersons
                          : [],
                  });
                }}
                className="mt-1 w-6 h-6 rounded border-gray-400 text-blue-700 focus:ring-blue-500"
              />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 mb-1">
                  <strong>UPOWAŻNIAM*</strong> następujące osoby do uzyskiwania informacji o stanie
                  zdrowia dziecka, udzielonych świadczeniach zdrowotnych oraz dostępu do
                  dokumentacji medycznej, zgodnie z art. 26 ust. 1 ustawy o prawach pacjenta i
                  Rzeczniku Praw Pacjenta.
                </p>
              </div>
            </div>
          </div>

          {/* Deny Authorization */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={!!formData.deniesAuthorization}
                onChange={(e) => {
                  const checked = e.target.checked;
                  updateFormData({
                    deniesAuthorization: checked,
                    grantsAuthorization: checked ? false : formData.grantsAuthorization,
                    authorizationChoice: checked ? "none" : "",
                    authorizedPersons: checked ? [] : formData.authorizedPersons,
                  });
                }}
                className="mt-1 w-6 h-6 rounded border-gray-400 text-gray-700 focus:ring-gray-500"
              />
              <div className="text-sm">
                <p className="font-semibold text-gray-900 mb-1">
                  <strong>NIE UPOWAŻNIAM*</strong> żadnych osób do uzyskiwania informacji o stanie
                  zdrowia dziecka, udzielonych świadczeniach zdrowotnych oraz dostępu do
                  dokumentacji medycznej
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Authorized Persons Form */}
        {formData.grantsAuthorization && formData.authorizedPersons && (
          <div className="space-y-6">
            {formData.authorizedPersons.map((person, index) => (
              <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">OSOBA {index + 1}</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Imię *
                    </label>
                    <input
                      type="text"
                      value={person.firstName || ""}
                      onChange={(e) => {
                        const newPersons = [...formData.authorizedPersons];
                        newPersons[index] = { ...person, firstName: e.target.value };
                        update("authorizedPersons", newPersons);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Wprowadź imię"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nazwisko *
                    </label>
                    <input
                      type="text"
                      value={person.lastName || ""}
                      onChange={(e) => {
                        const newPersons = [...formData.authorizedPersons];
                        newPersons[index] = { ...person, lastName: e.target.value };
                        update("authorizedPersons", newPersons);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Wprowadź nazwisko"
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {person.noPesel ? "PESEL" : "PESEL *"}
                    </label>
                    <input
                      type="text"
                      value={person.pesel || ""}
                      onChange={(e) => {
                        const newPersons = [...formData.authorizedPersons];
                        newPersons[index] = {
                          ...person,
                          pesel: e.target.value.replace(/\D/g, "").slice(0, 11),
                        };
                        update("authorizedPersons", newPersons);
                      }}
                      disabled={!!person.noPesel}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        person.noPesel
                          ? "border-gray-200 bg-gray-100 text-gray-400"
                          : (() => {
                              const validation = validateAuthorizedPersonPesel(
                                person.pesel,
                                person.noPesel
                              );
                              if (!person.pesel) return "border-gray-300";
                              return validation.valid
                                ? "border-green-300"
                                : "border-red-300";
                            })()
                      }`}
                      placeholder="Wprowadź numer PESEL"
                      maxLength="11"
                    />
                    <label className="mt-2 flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!person.noPesel}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const newPersons = [...formData.authorizedPersons];
                          newPersons[index] = {
                            ...person,
                            noPesel: checked,
                            pesel: checked ? "" : person.pesel,
                            ...(checked ? {} : EMPTY_IDENTITY_DOCUMENT),
                          };
                          update("authorizedPersons", newPersons);
                        }}
                        className="mt-0.5 w-5 h-5 rounded border-gray-400 text-blue-700 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Nie posiadam numeru PESEL</span>
                    </label>
                    {person.noPesel ? (
                      <IdentityDocumentFields
                        className="mt-3"
                        values={pickIdentityDocument(person)}
                        onChange={(field, value) => {
                          const newPersons = [...formData.authorizedPersons];
                          newPersons[index] = {
                            ...person,
                            [field]: value,
                          };
                          update("authorizedPersons", newPersons);
                        }}
                      />
                    ) : (
                      (() => {
                        const validation = validateAuthorizedPersonPesel(
                          person.pesel,
                          person.noPesel
                        );
                        if (!person.pesel) {
                          return (
                            <p className="text-xs text-gray-600 mt-1">* Wymagane 11 cyfr</p>
                          );
                        }
                        return (
                          <p
                            className={`text-xs mt-1 ${
                              validation.valid ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {validation.message}
                          </p>
                        );
                      })()
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stosunek do pacjenta *
                    </label>
                    <select
                      value={person.relationshipToPatient || ""}
                      onChange={(e) => {
                        const newPersons = [...formData.authorizedPersons];
                        newPersons[index] = { ...person, relationshipToPatient: e.target.value };
                        update("authorizedPersons", newPersons);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Wybierz stosunek</option>
                      <option value="Matka">Matka</option>
                      <option value="Ojciec">Ojciec</option>
                      <option value="Żona">Żona</option>
                      <option value="Mąż">Mąż</option>
                      <option value="Córka">Córka</option>
                      <option value="Syn">Syn</option>
                      <option value="Siostra">Siostra</option>
                      <option value="Brat">Brat</option>
                      <option value="Babcia">Babcia</option>
                      <option value="Dziadek">Dziadek</option>
                      <option value="Partner">Partner</option>
                      <option value="Partnerka">Partnerka</option>
                      <option value="Przyjaciel">Przyjaciel</option>
                      <option value="Przyjaciółka">Przyjaciółka</option>
                      <option value="Kolega">Kolega</option>
                      <option value="Koleżanka">Koleżanka</option>
                      <option value="Współpracownik">Współpracownik</option>
                      <option value="Współpracowniczka">Współpracowniczka</option>
                      <option value="Opiekun">Opiekun</option>
                      <option value="Inne">Inne</option>
                    </select>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numer telefonu *
                    </label>
                    <div className="flex items-stretch gap-2 w-full">
                      <PhoneCountrySelect
                        value={person.phoneCode || "+48"}
                        onChange={(code) => {
                          const newPersons = [...formData.authorizedPersons];
                          newPersons[index] = { ...person, phoneCode: code, phone: "" };
                          update("authorizedPersons", newPersons);
                        }}
                        className="w-[7.5rem] sm:w-36 shrink-0"
                        buttonClassName="w-full h-12 border border-gray-300 rounded-lg px-2 sm:px-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                      />
                      <input
                        type="tel"
                        value={formatPhoneForDisplay(person.phone || "", person.phoneCode || "+48")}
                        onChange={(e) => {
                          const phoneCode = person.phoneCode || "+48";
                          const cleaned = formatPhoneNumber(e.target.value);
                          const maxLength = validatePhoneNumber("", phoneCode).maxLength;
                          const newPersons = [...formData.authorizedPersons];
                          newPersons[index] = { ...person, phone: cleaned.slice(0, maxLength) };
                          update("authorizedPersons", newPersons);
                        }}
                        className={`flex-1 min-w-0 h-12 px-4 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          person.phone && !validatePhoneNumber(formatPhoneNumber(person.phone), person.phoneCode || "+48").valid 
                            ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder={(person.phoneCode || "+48") === "+48" ? "123 456 789" : `${validatePhoneNumber("", person.phoneCode || "+48").maxLength} cyfr`}
                        maxLength={validatePhoneNumber("", person.phoneCode || "+48").maxLength + 2}
                      />
                    </div>
                    {person.phone && !validatePhoneNumber(formatPhoneNumber(person.phone), person.phoneCode || "+48").valid && (
                      <p className="text-xs text-red-600 mt-1">
                        {validatePhoneNumber(formatPhoneNumber(person.phone), person.phoneCode || "+48").message}
                      </p>
                    )}
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adres (ulica i numer) *
                    </label>
                    <input
                      type="text"
                      value={person.address || ""}
                      onChange={(e) => {
                        const newPersons = [...formData.authorizedPersons];
                        newPersons[index] = { ...person, address: e.target.value };
                        update("authorizedPersons", newPersons);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Wprowadź ulicę i numer"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kod pocztowy *
                    </label>
                    <input
                      type="text"
                      value={person.zipCode || ""}
                      onChange={(e) => {
                        const formatted = formatPolishPostalCode(e.target.value);
                        const newPersons = [...formData.authorizedPersons];
                        newPersons[index] = { ...person, zipCode: formatted };
                        update("authorizedPersons", newPersons);
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        person.zipCode && !validatePolishPostalCode(person.zipCode) 
                          ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="00-000"
                      maxLength="6"
                    />
                    {person.zipCode && !validatePolishPostalCode(person.zipCode) && (
                      <p className="text-xs text-red-600 mt-1">
                        Kod pocztowy powinien mieć format XX-XXX (np. 00-001)
                      </p>
                    )}
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Miasto *
                    </label>
                    <input
                      type="text"
                      value={person.city || ""}
                      onChange={(e) => {
                        const newPersons = [...formData.authorizedPersons];
                        newPersons[index] = { ...person, city: e.target.value };
                        update("authorizedPersons", newPersons);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Wprowadź miasto (np. Warszawa, Kraków)"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add Another Person Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  const newPersons = [...(formData.authorizedPersons || []), EMPTY_AUTHORIZED_PERSON()];
                  update("authorizedPersons", newPersons);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors"
              >
                👥 Dodaj kolejną osobę
              </button>
            </div>
          </div>
        )}

        {/* Legal Notice */}
        {(formData.grantsAuthorization || formData.deniesAuthorization) && (
          <div className="text-xs text-gray-600 bg-gray-50 p-4 rounded-lg leading-relaxed">
            <p className="mb-2">
              <strong>Pouczenie oświadczam,</strong> iż zostałem(-am) poinformowany(-a) o możliwości cofnięcia udzielonego upoważnienia w każdym czasie oraz o tym, że dane osobowe osób upoważnionych są przetwarzane wyłącznie w celu realizacji uprawnień wynikających z niniejszego oświadczenia.
            </p>
          </div>
        )}

        {/* Information when no choice made */}
        {!formData.grantsAuthorization && !formData.deniesAuthorization && (
          <div className="text-center text-blue-600 bg-blue-50 p-4 rounded-lg">
            <p className="text-sm">
              ℹ️ Wybierz jedną z opcji powyżej aby kontynuować
            </p>
          </div>
        )}
      </div>
      )}

      {/* Patient Data Edit Modal */}
      <PatientDataEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        formData={formData}
        onSave={handleSavePatientData}
        patientType={patientType}
        mode={mode}
      />
    </div>
  );
}