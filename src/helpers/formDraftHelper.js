import { apiCaller } from '../utils/axiosInstance';

/**
 * Helper for managing form drafts (auto-save functionality)
 */
const formDraftHelper = {
  /**
   * Save form draft
   * @param {string} formType - Type of form
   * @param {Object} formData - Form data to save
   * @param {Object} metadata - Additional metadata
   * @param {string} draftId - Optional draft ID to update existing draft
   * @returns {Promise} API response
   */
  save: async (formType, formData, metadata = {}, draftId = null) => {
    try {
      // If draftId is provided, update existing draft
      if (draftId) {
        const response = await apiCaller('PUT', `/api/form-drafts/${draftId}`, {
          formData,
          metadata: {
            ...metadata,
            lastActivity: new Date().toISOString()
          }
        });
        return {
          ...response.data,
          draftId: draftId // Ensure draftId is always returned
        };
      } else {
        // Otherwise, create new draft
        const response = await apiCaller('POST', '/api/form-drafts', {
          formType,
          formData,
          metadata: {
            ...metadata,
            lastActivity: new Date().toISOString()
          }
        });
        // Return draftId from response data
        return {
          ...response.data,
          draftId: response.data?.data?.draftId || response.data?.draftId
        };
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  },

  /**
   * Get saved draft for a form type
   * @param {string} formType - Type of form
   * @returns {Promise} Draft data or null
   */
  get: async (formType) => {
    try {
      const response = await apiCaller('GET', `/api/form-drafts/${formType}`);
      return response.data?.data || null;
    } catch (error) {
      console.error('Error fetching draft:', error);
      // Fallback to localStorage
      return formDraftHelper.getFromLocalStorage(formType);
    }
  },

  /**
   * Delete saved draft
   * @param {string} formType - Type of form
   * @returns {Promise} API response
   */
  delete: async (formType) => {
    try {
      await apiCaller('DELETE', `/api/form-drafts/${formType}`);
      // Also remove from localStorage
      formDraftHelper.deleteFromLocalStorage(formType);
    } catch (error) {
      console.error('Error deleting draft:', error);
      // Still try to remove from localStorage
      formDraftHelper.deleteFromLocalStorage(formType);
    }
  },

  /**
   * Get all drafts for current user
   * @param {string} formType - Optional form type filter
   * @returns {Promise} Array of drafts
   */
  getAll: async (formType = null) => {
    try {
      const url = formType 
        ? `/api/form-drafts?formType=${formType}`
        : '/api/form-drafts';
      const response = await apiCaller('GET', url);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching all drafts:', error);
      return [];
    }
  },

  /**
   * Save to localStorage as fallback
   * @param {string} formType - Type of form
   * @param {Object} formData - Form data
   * @param {Object} metadata - Metadata
   * @param {string} userId - User ID
   */
  saveToLocalStorage: (formType, formData, metadata = {}, userId = null) => {
    try {
      const key = userId ? `draft_${formType}_${userId}` : `draft_${formType}`;
      const data = {
        formData,
        metadata: {
          ...metadata,
          timestamp: Date.now()
        },
        formType
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  /**
   * Get from localStorage
   * @param {string} formType - Type of form
   * @param {string} userId - User ID
   * @returns {Object|null} Draft data or null
   */
  getFromLocalStorage: (formType, userId = null) => {
    try {
      const key = userId ? `draft_${formType}_${userId}` : `draft_${formType}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  /**
   * Delete from localStorage
   * @param {string} formType - Type of form
   * @param {string} userId - User ID
   */
  deleteFromLocalStorage: (formType, userId = null) => {
    try {
      const key = userId ? `draft_${formType}_${userId}` : `draft_${formType}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
    }
  },

  /**
   * Check if draft exists (server or localStorage)
   * @param {string} formType - Type of form
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} True if draft exists
   */
  exists: async (formType, userId = null) => {
    try {
      const serverDraft = await formDraftHelper.get(formType);
      if (serverDraft) return true;

      const localDraft = formDraftHelper.getFromLocalStorage(formType, userId);
      return !!localDraft;
    } catch (error) {
      return false;
    }
  },

  /**
   * Update draft title
   * @param {string} draftId - Draft ID
   * @param {string} title - New title for the draft
   * @returns {Promise} API response
   */
  updateTitle: async (draftId, title) => {
    try {
      const response = await apiCaller('PATCH', `/api/form-drafts/${draftId}/title`, {
        title
      });
      return response.data;
    } catch (error) {
      console.error('Error updating draft title:', error);
      throw error;
    }
  }
};

export default formDraftHelper;

