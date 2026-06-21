/**
 * Calculate age from PESEL or date of birth
 */
function calculateAge(pesel, dateOfBirth) {
  let birthDate;
  
  if (pesel && pesel.length === 11) {
    // Extract date from PESEL
    const year = parseInt(pesel.substring(0, 2), 10);
    const month = parseInt(pesel.substring(2, 4), 10);
    const day = parseInt(pesel.substring(4, 6), 10);
    
    // Determine century based on month
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
    birthDate = new Date(fullYear, adjustedMonth - 1, day);
  } else if (dateOfBirth) {
    birthDate = new Date(dateOfBirth);
  } else {
    return null;
  }
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
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

  // Polish patient with PESEL
  if (formData.pesel) {
    const age = calculateAge(formData.pesel, formData.dateOfBirth);
    
    if (age < 16) {
      return PATIENT_TYPES.MINOR_UNDER_16;
    } else if (age >= 16 && age < 18) {
      return PATIENT_TYPES.MINOR_16_17;
    } else {
      return PATIENT_TYPES.ADULT;
    }
  }

  // Fallback: check explicit age from date of birth
  if (formData.dateOfBirth) {
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
      ? age - 1 
      : age;

    if (actualAge < 16) {
      return PATIENT_TYPES.MINOR_UNDER_16;
    } else if (actualAge >= 16 && actualAge < 18) {
      return PATIENT_TYPES.MINOR_16_17;
    }
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

  // Check required fields
  for (const field of requirements.requiredFields) {
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