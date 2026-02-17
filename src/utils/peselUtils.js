/**
 * PESEL utilities for admin-side validation (digits only, max 11, optional checksum).
 * Does not block registration; checksum is used for warning only.
 */

/** Max length of PESEL */
export const PESEL_LENGTH = 11;

/** Warning message when checksum is invalid (non-blocking) */
export const PESEL_CHECKSUM_WARNING =
  "Ostrzeżenie: numer PESEL może być nieprawidłowy (błąd sumy kontrolnej).";

/**
 * Normalize PESEL to digits only, max 11 characters.
 * @param {string} value - Raw input
 * @returns {string} - Up to 11 digits
 */
export function normalizePesel(value) {
  if (value == null) return "";
  const digits = String(value).replace(/\D/g, "");
  return digits.slice(0, PESEL_LENGTH);
}

/**
 * PESEL checksum weights for positions 0–9 (digit 10 is checksum).
 * Algorithm: sum = (digit[i] * weight[i]) for i 0..9; checksum = (10 - (sum % 10)) % 10.
 */
const PESEL_WEIGHTS = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];

/**
 * Validate PESEL checksum (positions 0–9 vs digit 10).
 * @param {string} pesel - Exactly 11 digits
 * @returns {boolean} - True if checksum is valid
 */
export function validatePeselChecksum(pesel) {
  const s = String(pesel).replace(/\D/g, "");
  if (s.length !== PESEL_LENGTH) return false;
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(s[i], 10) * PESEL_WEIGHTS[i];
  }
  const checksum = (10 - (sum % 10)) % 10;
  return parseInt(s[10], 10) === checksum;
}

/**
 * Returns a warning message if PESEL has 11 digits but invalid checksum; otherwise null.
 * @param {string} pesel - User input (will be normalized to digits)
 * @returns {string|null}
 */
export function getPeselChecksumWarning(pesel) {
  const normalized = normalizePesel(pesel);
  if (normalized.length !== PESEL_LENGTH) return null;
  return validatePeselChecksum(normalized) ? null : PESEL_CHECKSUM_WARNING;
}
