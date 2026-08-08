export const GUARDIAN_RELATION_OPTIONS = [
  { value: "matka", label: "Matka" },
  { value: "ojciec", label: "Ojciec" },
  { value: "przedstawiciel_ustawowy", label: "Przedstawiciel ustawowy" },
  { value: "opiekun_prawny", label: "Opiekun prawny" },
  { value: "kurator", label: "Kurator" },
  { value: "opiekun_faktyczny", label: "Opiekun faktyczny" },
];

export function mapPatientGuardianFields(patient = {}) {
  const g = patient.guardian || {};
  return {
    patientType: patient.patientType || "",
    guardianFirstName: g.firstName || "",
    guardianLastName: g.lastName || "",
    guardianPesel: g.pesel || "",
    guardianRelation: g.relation || "",
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
  const pesel = String(formData.guardianPesel || "").replace(/\D/g, "").slice(0, 11);
  const relation = String(formData.guardianRelation || "").trim();
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
    relation ||
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
    relation: relation || undefined,
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
