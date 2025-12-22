/**
 * LocalStorage-based form draft management utility
 * Handles saving, loading, and clearing form drafts for all form types
 */

const DRAFT_PREFIX = 'form_draft_';
const DRAFT_KEYS = {
  RECEPTIONIST: `${DRAFT_PREFIX}receptionist`,
  DOCTOR: `${DRAFT_PREFIX}doctor`,
  PATIENT: `${DRAFT_PREFIX}patient`,
};

/**
 * Get draft key for a form type
 */
const getDraftKey = (formType) => {
  return DRAFT_KEYS[formType.toUpperCase()] || `${DRAFT_PREFIX}${formType}`;
};

/**
 * Save form draft to localStorage
 * @param {string} formType - 'receptionist', 'doctor', or 'patient'
 * @param {object} formData - Form data to save
 * @param {object} metadata - Optional metadata (e.g., currentStep, timestamp)
 */
export const saveFormDraft = (formType, formData, metadata = {}) => {
  try {
    const draftKey = getDraftKey(formType);
    const draft = {
      formType,
      formData,
      metadata: {
        ...metadata,
        savedAt: new Date().toISOString(),
        timestamp: Date.now(),
      },
    };
    
    localStorage.setItem(draftKey, JSON.stringify(draft));
    console.log(`💾 Draft saved for ${formType}:`, draft);
    return true;
  } catch (error) {
    console.error(`Error saving draft for ${formType}:`, error);
    return false;
  }
};

/**
 * Load form draft from localStorage
 * @param {string} formType - 'receptionist', 'doctor', or 'patient'
 * @returns {object|null} Draft object or null if not found
 */
export const loadFormDraft = (formType) => {
  try {
    const draftKey = getDraftKey(formType);
    const draftString = localStorage.getItem(draftKey);
    
    if (!draftString) {
      return null;
    }
    
    const draft = JSON.parse(draftString);
    
    // Validate draft structure
    if (!draft.formData || !draft.metadata) {
      console.warn(`Invalid draft structure for ${formType}`);
      return null;
    }
    
    console.log(`📥 Draft loaded for ${formType}:`, draft);
    return draft;
  } catch (error) {
    console.error(`Error loading draft for ${formType}:`, error);
    return null;
  }
};

/**
 * Clear form draft from localStorage
 * @param {string} formType - 'receptionist', 'doctor', or 'patient'
 */
export const clearFormDraft = (formType) => {
  try {
    const draftKey = getDraftKey(formType);
    localStorage.removeItem(draftKey);
    console.log(`🗑️ Draft cleared for ${formType}`);
    return true;
  } catch (error) {
    console.error(`Error clearing draft for ${formType}:`, error);
    return false;
  }
};

/**
 * Check if a draft exists for a form type
 * @param {string} formType - 'receptionist', 'doctor', or 'patient'
 * @returns {boolean}
 */
export const hasFormDraft = (formType) => {
  const draftKey = getDraftKey(formType);
  return localStorage.getItem(draftKey) !== null;
};

/**
 * Get draft age in milliseconds
 * @param {string} formType - 'receptionist', 'doctor', or 'patient'
 * @returns {number|null} Age in ms or null if no draft
 */
export const getDraftAge = (formType) => {
  const draft = loadFormDraft(formType);
  if (!draft || !draft.metadata.timestamp) {
    return null;
  }
  return Date.now() - draft.metadata.timestamp;
};

/**
 * Format draft age for display
 * @param {number} ageMs - Age in milliseconds
 * @returns {string} Formatted string (e.g., "2 minutes ago")
 */
export const formatDraftAge = (ageMs) => {
  if (!ageMs) return 'Unknown';
  
  const seconds = Math.floor(ageMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
};

/**
 * Clear all form drafts
 */
export const clearAllDrafts = () => {
  try {
    Object.values(DRAFT_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('🗑️ All drafts cleared');
    return true;
  } catch (error) {
    console.error('Error clearing all drafts:', error);
    return false;
  }
};

export default {
  saveFormDraft,
  loadFormDraft,
  clearFormDraft,
  hasFormDraft,
  getDraftAge,
  formatDraftAge,
  clearAllDrafts,
};

