/**
 * Format Polish postal code to XX-XXX format
 * @param {string} value - Input value
 * @returns {string} - Formatted postal code
 */
export function formatPolishPostalCode(value) {
  if (!value) return "";
  
  // Remove all non-digits
  const digits = value.replace(/\D/g, "");
  
  // Limit to 5 digits
  const limited = digits.slice(0, 5);
  
  // Add hyphen after 2 digits
  if (limited.length >= 3) {
    return `${limited.slice(0, 2)}-${limited.slice(2)}`;
  }
  
  return limited;
}

/**
 * Validate Polish postal code format
 * @param {string} postalCode - Postal code to validate
 * @returns {boolean} - True if valid format
 */
export function validatePolishPostalCode(postalCode) {
  if (!postalCode) return false;
  // Polish postal code format: XX-XXX (2 digits, hyphen, 3 digits)
  return /^\d{2}-\d{3}$/.test(postalCode);
}

/**
 * Clean postal code for storage (remove formatting)
 * @param {string} postalCode - Formatted postal code
 * @returns {string} - Clean digits only
 */
export function cleanPostalCode(postalCode) {
  return postalCode ? postalCode.replace(/\D/g, "") : "";
}