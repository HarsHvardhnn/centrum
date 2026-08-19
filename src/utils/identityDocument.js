export const IDENTITY_DOCUMENT_TYPES = [
  { value: "", label: "Wybierz typ dokumentu" },
  { value: "Passport", label: "Paszport" },
  { value: "ID Card", label: "Dowód osobisty" },
  { value: "Residence Card", label: "Karta pobytu" },
  { value: "Other", label: "Inny dokument" },
];

export const EMPTY_IDENTITY_DOCUMENT = {
  documentType: "",
  documentNumber: "",
  documentCountry: "",
  documentIssueDate: "",
  documentExpiryDate: "",
};

export const GUARDIAN_IDENTITY_FIELD_MAP = {
  documentType: "guardianDocumentType",
  documentNumber: "guardianDocumentNumber",
  documentCountry: "guardianDocumentCountry",
  documentIssueDate: "guardianDocumentIssueDate",
  documentExpiryDate: "guardianDocumentExpiryDate",
};

const CLINIC_TIMEZONE = "Europe/Warsaw";

export function todayYmd(timeZone = CLINIC_TIMEZONE) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function toDateInputValue(value) {
  if (!value) return "";
  if (typeof value === "string") {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

/** True when the expiry calendar date is before today in Poland. Today itself is still valid. */
export function isIdentityDocumentExpired(expiryDate) {
  const ymd = toDateInputValue(expiryDate);
  if (!ymd) return false;
  return ymd < todayYmd();
}

export function pickIdentityDocument(source = {}) {
  return {
    documentType: source.documentType || "",
    documentNumber: source.documentNumber || "",
    documentCountry: source.documentCountry || "",
    documentIssueDate: toDateInputValue(source.documentIssueDate),
    documentExpiryDate: toDateInputValue(source.documentExpiryDate),
  };
}

export function guardianIdentityValues(formData = {}) {
  return {
    documentType: formData.guardianDocumentType || "",
    documentNumber: formData.guardianDocumentNumber || "",
    documentCountry: formData.guardianDocumentCountry || "",
    documentIssueDate: toDateInputValue(formData.guardianDocumentIssueDate),
    documentExpiryDate: toDateInputValue(formData.guardianDocumentExpiryDate),
  };
}

export function guardianIdentityFromPatch(field, value) {
  const key = GUARDIAN_IDENTITY_FIELD_MAP[field];
  return key ? { [key]: value } : {};
}

export function clearedGuardianIdentity() {
  return {
    guardianDocumentType: "",
    guardianDocumentNumber: "",
    guardianDocumentCountry: "",
    guardianDocumentIssueDate: "",
    guardianDocumentExpiryDate: "",
  };
}

export function validateIdentityDocument(doc = {}, { subject = "", requireExpiry = true } = {}) {
  const prefix = subject ? `${subject}: ` : "";
  const errors = [];
  if (!String(doc.documentType || "").trim()) {
    errors.push(`${prefix}Typ dokumentu jest wymagany.`);
  }
  if (!String(doc.documentNumber || "").trim()) {
    errors.push(`${prefix}Numer dokumentu jest wymagany.`);
  }
  if (!String(doc.documentCountry || "").trim()) {
    errors.push(`${prefix}Kraj wydania dokumentu jest wymagany.`);
  }
  if (!doc.documentIssueDate) {
    errors.push(`${prefix}Data wydania dokumentu jest wymagana.`);
  } else {
    const issueYmd = toDateInputValue(doc.documentIssueDate);
    if (issueYmd && issueYmd > todayYmd()) {
      errors.push(`${prefix}Data wydania dokumentu nie może być w przyszłości.`);
    }
  }
  if (requireExpiry && !doc.documentExpiryDate) {
    errors.push(`${prefix}Data wygaśnięcia dokumentu jest wymagana.`);
  }
  if (doc.documentExpiryDate && isIdentityDocumentExpired(doc.documentExpiryDate)) {
    errors.push(`${prefix}Dokument jest już wygasły.`);
  }
  if (doc.documentIssueDate && doc.documentExpiryDate) {
    const issueDate = new Date(doc.documentIssueDate);
    const expiryDate = new Date(doc.documentExpiryDate);
    if (
      !Number.isNaN(issueDate.getTime()) &&
      !Number.isNaN(expiryDate.getTime()) &&
      expiryDate <= issueDate
    ) {
      errors.push(
        `${prefix}Data wygaśnięcia musi być późniejsza niż data wydania.`
      );
    }
  }
  return errors;
}

export function formatIdentityDocumentLabel(doc = {}) {
  const typeLabel =
    IDENTITY_DOCUMENT_TYPES.find((t) => t.value === doc.documentType)?.label ||
    doc.documentType ||
    "";
  const number = String(doc.documentNumber || "").trim();
  return [typeLabel, number].filter(Boolean).join(" ");
}
