import {
  guardianIdentityValues,
  validateIdentityDocument,
} from "../../utils/identityDocument";

/**
 * Age from a Date / ISO date string
 */
function ageFromDate(dateOfBirth) {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Age from PESEL (century from month encoding)
 */
function ageFromPesel(pesel) {
  if (!pesel || String(pesel).replace(/\D/g, "").length !== 11) return null;

  const digits = String(pesel).replace(/\D/g, "");
  const year = parseInt(digits.substring(0, 2), 10);
  const month = parseInt(digits.substring(2, 4), 10);
  const day = parseInt(digits.substring(4, 6), 10);

  let fullYear;
  if (month > 80) {
    fullYear = 1800 + year;
  } else if (month > 60) {
    fullYear = 2200 + year;
  } else if (month > 40) {
    fullYear = 2100 + year;
  } else if (month > 20) {
    fullYear = 2000 + year;
  } else {
    fullYear = 1900 + year;
  }

  const adjustedMonth = ((month - 1) % 20) + 1;
  const birthDate = new Date(fullYear, adjustedMonth - 1, day);
  if (
    birthDate.getFullYear() !== fullYear ||
    birthDate.getMonth() !== adjustedMonth - 1 ||
    birthDate.getDate() !== day
  ) {
    return null;
  }

  return ageFromDate(birthDate);
}

/**
 * Calculate age from PESEL and/or date of birth.
 * - Valid PESEL path: prefer age extracted from PESEL
 * - Fallback path (peselFallbackMode): prefer manually entered dateOfBirth
 */
function calculateAge(pesel, dateOfBirth, { preferManualDob = false } = {}) {
  if (preferManualDob) {
    const manualAge = ageFromDate(dateOfBirth);
    if (manualAge !== null) return manualAge;
    return ageFromPesel(pesel);
  }

  const peselAge = ageFromPesel(pesel);
  if (peselAge !== null) return peselAge;
  return ageFromDate(dateOfBirth);
}

export const PATIENT_TYPES = {
  ADULT: "adult",
  INTERNATIONAL: "international", 
  MINOR_UNDER_16: "minor_under_16",
  MINOR_16_17: "minor_16_17"
};

export const FORM_MODES = {
  FULL_REGISTRATION: "full_registration",
  SIGN_ONLY: "sign_only", 
  DATA_CORRECTION: "data_correction"
};

/**
 * Determines patient type based on PESEL, document info, and age
 */
export function detectPatientType(formData) {
  // International patient (no PESEL)
  if (formData.isInternationalPatient || (!formData.pesel && formData.documentType)) {
    return PATIENT_TYPES.INTERNATIONAL;
  }

  // Valid PESEL → DOB/gender/age from PESEL; fallback mode → prefer manually entered DOB
  const preferManualDob = !!formData.peselFallbackMode;
  const age = calculateAge(formData.pesel, formData.dateOfBirth, { preferManualDob });

  if (age === null) {
    return PATIENT_TYPES.ADULT;
  }

  if (age < 16) {
    return PATIENT_TYPES.MINOR_UNDER_16;
  }
  if (age >= 16 && age < 18) {
    return PATIENT_TYPES.MINOR_16_17;
  }
  return PATIENT_TYPES.ADULT;
}

/**
 * Get form requirements based on patient type
 */
export function getFormRequirements(patientType) {
  const requirements = {
    requiresGuardian: false,
    requiresDualSignature: false,
    requiresIdPhotos: false,
    allowedDocumentTypes: [],
    requiredFields: []
  };

  switch (patientType) {
    case PATIENT_TYPES.ADULT:
      requirements.requiredFields = [
        "firstName", "lastName", "pesel", "dateOfBirth", "sex", 
        "street", "zipCode", "city", "province", "phone", 
        "consentHealthcare", "signature"
      ];
      break;

    case PATIENT_TYPES.INTERNATIONAL:
      requirements.requiresIdPhotos = true;
      requirements.allowedDocumentTypes = ["Passport", "ID Card", "Residence Card", "Other"];
      requirements.requiredFields = [
        "firstName", "lastName", "documentType", "documentNumber", 
        "documentCountry", "dateOfBirth", "sex", "street", "zipCode", 
        "city", "province", "phone", "consentHealthcare", "signature"
      ];
      break;

    case PATIENT_TYPES.MINOR_UNDER_16:
      requirements.requiresGuardian = true;
      requirements.requiredFields = [
        "firstName", "lastName", "pesel", "dateOfBirth", "sex",
        "street", "zipCode", "city", "province", "phone",
        "guardianFirstName", "guardianLastName", "guardianPesel", 
        "guardianPhone", "guardianSignature"
      ];
      break;

    case PATIENT_TYPES.MINOR_16_17:
      requirements.requiresGuardian = true;
      requirements.requiresDualSignature = true;
      requirements.requiredFields = [
        "firstName", "lastName", "pesel", "dateOfBirth", "sex",
        "street", "zipCode", "city", "province", "phone",
        "guardianFirstName", "guardianLastName", "guardianPesel",
        "guardianPhone", "signature", "guardianSignature"
      ];
      break;
  }

  return requirements;
}

/**
 * Validate form data based on patient type
 */
export function validateFormData(formData, patientType) {
  const requirements = getFormRequirements(patientType);
  const errors = [];

  // Check required fields (guardian PESEL may be skipped via guardianNoPesel)
  for (const field of requirements.requiredFields) {
    if (field === "guardianPesel" && formData.guardianNoPesel) {
      errors.push(
        ...validateIdentityDocument(guardianIdentityValues(formData), {
          subject: "Opiekun",
        })
      );
      continue;
    }
    if (!formData[field] || String(formData[field]).trim() === "") {
      errors.push(`${field} jest wymagane`);
    }
  }

  // Validate document type for international patients
  if (patientType === PATIENT_TYPES.INTERNATIONAL) {
    if (!requirements.allowedDocumentTypes.includes(formData.documentType)) {
      errors.push("Nieprawidłowy typ dokumentu");
    }
  }

  // Validate PESEL for Polish patients
  if ([PATIENT_TYPES.ADULT, PATIENT_TYPES.MINOR_UNDER_16, PATIENT_TYPES.MINOR_16_17].includes(patientType)) {
    if (!formData.pesel || formData.pesel.length !== 11) {
      errors.push("PESEL musi mieć 11 cyfr");
    }
  }

  return errors;
}