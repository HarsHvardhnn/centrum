export const GUARDIAN_RELATION_OPTIONS = [
  { value: "matka", label: "Matka" },
  { value: "ojciec", label: "Ojciec" },
  { value: "przedstawiciel_ustawowy", label: "Przedstawiciel ustawowy" },
  { value: "opiekun_prawny", label: "Opiekun prawny" },
  { value: "kurator", label: "Kurator" },
  { value: "opiekun_faktyczny", label: "Opiekun faktyczny" },
];

/** Field A — Rodzaj reprezentacji */
export const REPRESENTATION_TYPE_OPTIONS = [
  { value: "przedstawiciel_ustawowy", label: "Przedstawiciel ustawowy" },
  { value: "opiekun_faktyczny", label: "Opiekun faktyczny" },
];

/** Field B — Podstawa reprezentacji (only when Field A = przedstawiciel ustawowy) */
export const LEGAL_BASIS_OPTIONS = [
  { value: "matka", label: "Matka" },
  { value: "ojciec", label: "Ojciec" },
  { value: "opiekun_prawny", label: "Opiekun prawny" },
  { value: "kurator", label: "Kurator" },
];

export const NEEDS_COURT_RELATIONS = new Set(["opiekun_prawny", "kurator"]);

export const FACTUAL_GUARDIAN_WARNING =
  "Jako opiekun faktyczny możesz podpisać wyłącznie zgodę na przeprowadzenie badania. Zgodę na przetwarzanie danych osobowych oraz upoważnienie do dokumentacji medycznej może wyrazić wyłącznie przedstawiciel ustawowy (matka, ojciec, opiekun prawny lub kurator).";

/** Inline identity for UI/PDF: "PESEL …" or "nr dokumentu …" */
export function formatGuardianIdentity(formData = {}) {
  if (formData.guardianNoPesel) {
    const doc = String(formData.guardianDocumentNumber || "").trim();
    return doc ? `nr dokumentu ${doc}` : "bez PESEL";
  }
  const pesel = String(formData.guardianPesel || "").replace(/\D/g, "").slice(0, 11);
  return pesel ? `PESEL ${pesel}` : "PESEL —";
}

export function deriveRepresentationType(formData = {}) {
  const explicit = String(formData.representationType || "").toLowerCase().trim();
  if (explicit === "przedstawiciel_ustawowy" || explicit === "opiekun_faktyczny") {
    return explicit;
  }
  const r = String(formData.guardianRelation || "").toLowerCase().trim();
  if (r === "opiekun_faktyczny" || r === "opiekun faktyczny") return "opiekun_faktyczny";
  if (r) return "przedstawiciel_ustawowy";
  return "";
}

export function isFactualGuardian(formData = {}) {
  return deriveRepresentationType(formData) === "opiekun_faktyczny";
}

export function needsCourtData(formData = {}) {
  const r = String(formData.guardianRelation || "").toLowerCase().trim();
  return NEEDS_COURT_RELATIONS.has(r);
}

/** Legal basis dropdown value when Field A is przedstawiciel ustawowy */
export function deriveLegalBasis(formData = {}) {
  const r = String(formData.guardianRelation || "").toLowerCase().trim();
  if (LEGAL_BASIS_OPTIONS.some((o) => o.value === r)) return r;
  return "";
}

export function mapPatientGuardianFields(patient = {}) {
  const g = patient.guardian || {};
  const relation = g.relation || "";
  const representationType =
    relation === "opiekun_faktyczny" ? "opiekun_faktyczny" : relation ? "przedstawiciel_ustawowy" : "";
  return {
    patientType: patient.patientType || "",
    guardianFirstName: g.firstName || "",
    guardianLastName: g.lastName || "",
    guardianPesel: g.pesel || "",
    guardianNoPesel: !!g.noPesel,
    guardianDocumentNumber: g.documentNumber || "",
    guardianRelation: relation,
    representationType,
    guardianRelationDetail: g.relationDetail || "",
    guardianPhone: g.phone || "",
    guardianPhoneCode: g.phoneCode || "+48",
    guardianEmail: g.email || "",
    guardianStreet: g.street || g.address || "",
    guardianZipCode: g.zipCode || "",
    guardianCity: g.city || "",
    courtName: g.courtName || "",
    courtNumber: g.courtNumber || "",
    courtDate: g.courtDate ? String(g.courtDate).slice(0, 10) : "",
  };
}

export function buildGuardianPayload(formData = {}) {
  const firstName = String(formData.guardianFirstName || "").trim();
  const lastName = String(formData.guardianLastName || "").trim();
  const noPesel = !!formData.guardianNoPesel;
  const pesel = noPesel
    ? ""
    : String(formData.guardianPesel || "").replace(/\D/g, "").slice(0, 11);
  const documentNumber = noPesel
    ? String(formData.guardianDocumentNumber || "").trim()
    : "";
  const relation = String(formData.guardianRelation || "").trim();
  const relationDetail = String(formData.guardianRelationDetail || "").trim();
  const phone = String(formData.guardianPhone || "").replace(/\D/g, "").slice(0, 15);
  const phoneCode = formData.guardianPhoneCode || "+48";
  const email = String(formData.guardianEmail || "").trim();
  const street = String(formData.guardianStreet || "").trim();
  const zipCode = String(formData.guardianZipCode || "").trim();
  const city = String(formData.guardianCity || "").trim();
  const courtName = String(formData.courtName || "").trim();
  const courtNumber = String(formData.courtNumber || "").trim();
  const courtDate = formData.courtDate ? String(formData.courtDate).slice(0, 10) : "";

  const hasAny =
    firstName ||
    lastName ||
    pesel ||
    noPesel ||
    documentNumber ||
    relation ||
    relationDetail ||
    phone ||
    email ||
    street ||
    zipCode ||
    city ||
    courtName ||
    courtNumber ||
    courtDate;

  if (!hasAny) return null;

  return {
    firstName,
    lastName,
    pesel,
    noPesel,
    documentNumber,
    relation: relation || undefined,
    relationDetail: relationDetail || undefined,
    phone,
    phoneCode,
    email,
    street,
    zipCode,
    city,
    courtName,
    courtNumber,
    courtDate: courtDate || undefined,
  };
}

export function isGuardianStatementDocument(doc) {
  if (!doc) return false;
  if (doc.kioskDocumentType === "guardian_statement") return true;
  return /^oswiadczenie-opiekun-/i.test(doc.fileName || doc.originalName || doc.name || "");
}

/** Show Przedstawiciel tab for minors or when guardian data/docs already exist */
export function shouldShowGuardianTab(formData = {}) {
  const type = String(formData.patientType || "").toLowerCase();
  if (type === "minor_under_16" || type === "minor_16_17") return true;
  if (formData.guardianFirstName || formData.guardianLastName || formData.guardianPesel) {
    return true;
  }
  if (formData.guardian?.firstName || formData.guardian?.lastName) return true;
  const docs = Array.isArray(formData.documents) ? formData.documents : [];
  if (docs.some(isGuardianStatementDocument)) return true;

  // Age from DOB
  if (formData.dateOfBirth) {
    const dob = new Date(formData.dateOfBirth);
    if (!Number.isNaN(dob.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
      if (age < 18) return true;
    }
  }
  return false;
}
