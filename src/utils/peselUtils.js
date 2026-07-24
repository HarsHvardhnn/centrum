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

function deriveDateOfBirthFromPesel(pesel) {
  const digits = String(pesel).replace(/\D/g, "");
  if (digits.length !== PESEL_LENGTH) return null;

  let year = parseInt(digits.slice(0, 2), 10);
  let month = parseInt(digits.slice(2, 4), 10);
  const day = parseInt(digits.slice(4, 6), 10);

  if (month >= 1 && month <= 12) {
    year += 1900;
  } else if (month >= 21 && month <= 32) {
    month -= 20;
    year += 2000;
  } else if (month >= 41 && month <= 52) {
    month -= 40;
    year += 2100;
  } else if (month >= 61 && month <= 72) {
    month -= 60;
    year += 2200;
  } else if (month >= 81 && month <= 92) {
    month -= 80;
    year += 1800;
  } else {
    return null;
  }

  const dob = new Date(year, month - 1, day);
  if (dob.getFullYear() !== year || dob.getMonth() !== month - 1 || dob.getDate() !== day) {
    return null;
  }
  return dob;
}

/**
 * Extract gender from PESEL number
 * @param {string} pesel - PESEL number (11 digits)
 * @returns {string|null} - "Mężczyzna" or "Kobieta" or null if invalid
 */
export function getGenderFromPesel(pesel) {
  const digits = String(pesel).replace(/\D/g, "");
  if (digits.length !== PESEL_LENGTH) return null;
  
  const genderDigit = parseInt(digits[9], 10);
  return genderDigit % 2 === 0 ? "Kobieta" : "Mężczyzna";
}

/**
 * Kiosk PESEL validation with explicit error codes for user-facing messages.
 */
export function analyzePeselForKiosk(rawPesel) {
  const pesel = normalizePesel(rawPesel);
  if (pesel.length !== PESEL_LENGTH) {
    return {
      valid: false,
      pesel,
      errorCode: "invalid_length",
      message: "PESEL musi składać się z dokładnie 11 cyfr.",
    };
  }

  const dateOfBirth = deriveDateOfBirthFromPesel(pesel);
  if (!dateOfBirth) {
    return {
      valid: false,
      pesel,
      errorCode: "invalid_date_of_birth",
      message:
        "Nie można odczytać daty urodzenia z tego numeru PESEL. Sprawdź, czy cyfry oznaczające datę urodzenia są poprawne.",
    };
  }

  if (!validatePeselChecksum(pesel)) {
    return {
      valid: false,
      pesel,
      errorCode: "invalid_checksum",
      message:
        "Suma kontrolna numeru PESEL jest nieprawidłowa. Sprawdź, czy wszystkie cyfry zostały wpisane poprawnie.",
    };
  }

  // Extract gender from PESEL (10th digit - position 9)
  const genderDigit = parseInt(pesel[9], 10);
  const gender = genderDigit % 2 === 0 ? "Kobieta" : "Mężczyzna";

  return { valid: true, pesel, dateOfBirth, gender };
}

const PESEL_ERROR_TITLES = {
  invalid_length: "Nieprawidłowy numer PESEL",
  invalid_format: "Nieprawidłowy numer PESEL",
  invalid_date_of_birth: "Nie można odczytać daty urodzenia",
  invalid_checksum: "Nieprawidłowa suma kontrolna PESEL",
  invalid_pesel: "Nieprawidłowy numer PESEL",
  minor_patient: "Rejestracja niedostępna na tablecie",
};

export function getPeselErrorDisplay(errorCode, fallbackMessage = "") {
  const title = PESEL_ERROR_TITLES[errorCode] || "Nieprawidłowy numer PESEL";
  const hints = {
    invalid_length: "Wpisz dokładnie 11 cyfr numeru PESEL.",
    invalid_date_of_birth:
      "Data urodzenia zapisana w numerze PESEL jest nieprawidłowa lub nie można jej odczytać. Upewnij się, że numer został przepisany bez pomyłki.",
    invalid_checksum:
      "Ostatnia cyfra PESEL (suma kontrolna) nie zgadza się z pozostałymi cyframi. Sprawdź numer jeszcze raz.",
    minor_patient: "Przekaż urządzenie pracownikowi rejestracji.",
  };
  return {
    title,
    message: fallbackMessage || hints[errorCode] || "Sprawdź numer PESEL i spróbuj ponownie.",
  };
}
