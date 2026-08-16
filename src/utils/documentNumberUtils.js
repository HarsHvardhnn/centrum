/**
 * Document number helpers — formats must match backend
 * `buildConsentDocNumber` in registrationDocumentService.js.
 *
 * Before a Patient ID exists (new registration), the Nr field stays blank
 * so the kiosk never shows a number that will differ from the signed PDF.
 */

/**
 * @param {string} documentType - 'gdpr' | 'examination' | 'authorization' | 'guardian_statement'
 * @param {string} [patientDisplayId] - e.g. P-1786412818393
 * @param {number} [versionNumber=1]
 * @returns {string} Document number, or "" when Patient ID is unknown
 */
export function buildConsentDocNumber(
  documentType = "gdpr",
  patientDisplayId = "",
  versionNumber = 1
) {
  const id = String(patientDisplayId || "").trim();
  if (!id) return "";

  const version = Number(versionNumber) > 0 ? Number(versionNumber) : 1;

  switch (documentType) {
    case "examination":
    case "consent_examination":
      return `OSW-ZB-${id}-v-${version}`;
    case "authorization":
    case "auth_health_status":
      return `OSW-UPW-${id}-v${version}`;
    case "guardian_statement":
      return `OSW-OP-${id}-v${version}`;
    case "gdpr":
    case "consent_personal_data":
    default:
      return `RODO-${id} - ${version}`;
  }
}

/**
 * Get current date in Polish format (DD.MM.YYYY)
 * @returns {string}
 */
export function getCurrentDocumentDate() {
  return new Date().toLocaleDateString("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Generate document metadata for a consent form preview.
 * Number is blank when patientDisplayId is missing (new patient).
 *
 * @param {string} documentType
 * @param {{ patientDisplayId?: string, versionNumber?: number }} [options]
 * @returns {{ number: string, date: string }}
 */
export function generateDocumentMetadata(documentType = "gdpr", options = {}) {
  const { patientDisplayId = "", versionNumber = 1 } = options || {};
  return {
    number: buildConsentDocNumber(documentType, patientDisplayId, versionNumber),
    date: getCurrentDocumentDate(),
  };
}

/** Display helper: blank Nr becomes an em dash so layout stays stable. */
export function formatDocumentNumberForDisplay(number) {
  const value = String(number || "").trim();
  return value || "—";
}
