/**
 * Phone validation utilities for kiosk forms
 */

/**
 * Format phone number to digits only
 * @param {string} phone - Phone number input
 * @returns {string} - Digits only
 */
export function formatPhoneNumber(phone) {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

/**
 * Get required phone length based on country code
 * @param {string} countryCode - Country code like "+48"
 * @returns {number} - Required phone number length
 */
export function getRequiredPhoneLength(countryCode) {
  const phoneLengths = {
    "+48": 9,  // Poland - exactly 9 digits
    "+49": 11, // Germany
    "+33": 10, // France
    "+39": 10, // Italy
    "+34": 9,  // Spain
    "+44": 10, // UK
    "+1": 10,  // USA/Canada
    "+45": 8,  // Denmark
    "+46": 9,  // Sweden
    "+47": 8,  // Norway
    "+31": 9,  // Netherlands
    "+32": 9,  // Belgium
    "+43": 10, // Austria
    "+41": 9,  // Switzerland
    "+420": 9, // Czech Republic
    "+421": 9, // Slovakia
    "+380": 9, // Ukraine
  };
  
  return phoneLengths[countryCode] || 15; // Default max length for other countries
}

/**
 * Validate phone number based on country code
 * @param {string} phone - Phone number (digits only)
 * @param {string} countryCode - Country code like "+48"
 * @returns {{ valid: boolean, message?: string, maxLength: number }} - Validation result
 */
export function validatePhoneNumber(phone, countryCode) {
  const cleanPhone = formatPhoneNumber(phone);
  const requiredLength = getRequiredPhoneLength(countryCode);
  
  if (!cleanPhone) {
    return { 
      valid: false, 
      message: "Numer telefonu jest wymagany.", 
      maxLength: requiredLength 
    };
  }
  
  // For Polish numbers, be strict about exactly 9 digits
  if (countryCode === "+48") {
    if (cleanPhone.length !== 9) {
      return { 
        valid: false, 
        message: "Numer telefonu w Polsce musi mieć dokładnie 9 cyfr.", 
        maxLength: 9 
      };
    }
    // Additional Polish number validation
    if (cleanPhone[0] === "0") {
      return { 
        valid: false, 
        message: "Numer telefonu nie może zaczynać się od 0.", 
        maxLength: 9 
      };
    }
  } else {
    // For other countries, check against expected length
    if (cleanPhone.length < 7 || cleanPhone.length > requiredLength) {
      return { 
        valid: false, 
        message: `Numer telefonu powinien mieć ${requiredLength} cyfr.`, 
        maxLength: requiredLength 
      };
    }
  }
  
  return { valid: true, maxLength: requiredLength };
}

/**
 * Format phone number for display (with spaces for readability)
 * @param {string} phone - Phone number (digits only)
 * @param {string} countryCode - Country code like "+48"
 * @returns {string} - Formatted phone number
 */
export function formatPhoneForDisplay(phone, countryCode) {
  const cleanPhone = formatPhoneNumber(phone);
  if (!cleanPhone) return "";
  
  // Format Polish numbers as XXX XXX XXX
  if (countryCode === "+48" && cleanPhone.length === 9) {
    return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6, 9)}`;
  }
  
  // For other countries, just return the digits
  return cleanPhone;
}

/**
 * Check if phone number is complete for the given country
 * @param {string} phone - Phone number (digits only)
 * @param {string} countryCode - Country code like "+48"
 * @returns {boolean} - True if phone number has correct length
 */
export function isPhoneComplete(phone, countryCode) {
  const cleanPhone = formatPhoneNumber(phone);
  const requiredLength = getRequiredPhoneLength(countryCode);
  return cleanPhone.length === requiredLength;
}

/** Internal DB placeholder when a patient was created without a phone. Never show this to users. */
export function isPlaceholderPhone(phone) {
  const value = String(phone ?? "").trim();
  if (!value) return true;
  return /_no_phone_/i.test(value) || /^__no_phone/i.test(value);
}

/** User-facing phone: hides `__no_phone_...` placeholders. */
export function displayPatientPhone(phone, emptyLabel = "—") {
  if (isPlaceholderPhone(phone)) return emptyLabel;
  return String(phone).trim();
}