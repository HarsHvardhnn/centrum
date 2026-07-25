/**
 * Document number generation utilities
 */

/**
 * Generate a unique document number for GDPR consent
 * Format: RODO/YYYY/NNNNNN
 * @returns {string} - Generated document number
 */
export function generateGdprDocumentNumber() {
  const now = new Date();
  const year = now.getFullYear();
  
  // Generate a random 6-digit number for now
  // In a real system, this would be a sequential number from database
  const randomNumber = Math.floor(Math.random() * 900000) + 100000;
  
  return `RODO/${year}/${randomNumber.toString().padStart(6, '0')}`;
}

/**
 * Generate a unique document number for medical examination consent
 * Format: BAD/YYYY/NNNNNN  
 * @returns {string} - Generated document number
 */
export function generateExaminationDocumentNumber() {
  const now = new Date();
  const year = now.getFullYear();
  
  // Generate a random 6-digit number for now
  const randomNumber = Math.floor(Math.random() * 900000) + 100000;
  
  return `BAD/${year}/${randomNumber.toString().padStart(6, '0')}`;
}

/**
 * Generate a unique document number for authorization consent
 * Format: UPO/YYYY/NNNNNN
 * @returns {string} - Generated document number  
 */
export function generateAuthorizationDocumentNumber() {
  const now = new Date();
  const year = now.getFullYear();
  
  // Generate a random 6-digit number for now
  const randomNumber = Math.floor(Math.random() * 900000) + 100000;
  
  return `UPO/${year}/${randomNumber.toString().padStart(6, '0')}`;
}

/**
 * Get current date in Polish format (DD.MM.YYYY)
 * @returns {string} - Formatted date
 */
export function getCurrentDocumentDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  
  return `${day}.${month}.${year}`;
}

/**
 * Generate document metadata for a consent form
 * @param {string} documentType - Type of document ('gdpr', 'examination', 'authorization')
 * @returns {object} - Document metadata with number and date
 */
export function generateDocumentMetadata(documentType = 'gdpr') {
  let docNumber;
  
  switch (documentType) {
    case 'examination':
      docNumber = generateExaminationDocumentNumber();
      break;
    case 'authorization':
      docNumber = generateAuthorizationDocumentNumber();
      break;
    case 'gdpr':
    default:
      docNumber = generateGdprDocumentNumber();
      break;
  }
  
  return {
    number: docNumber,
    date: getCurrentDocumentDate()
  };
}