import { useEffect, useRef, useCallback, useState } from 'react';
import { saveFormDraft, loadFormDraft, clearFormDraft } from '../utils/formDraftStorage';

/**
 * Custom hook for auto-saving form data to localStorage
 * 
 * @param {object} options
 * @param {string} options.formType - 'receptionist', 'doctor', or 'patient'
 * @param {object} options.formData - Current form data to save
 * @param {object} options.metadata - Optional metadata (e.g., currentStep, isEditMode)
 * @param {boolean} options.enabled - Whether auto-save is enabled (default: true)
 * @param {number} options.debounceMs - Debounce delay in milliseconds (default: 1000)
 * @param {number} options.intervalMs - Interval save in milliseconds (default: 30000)
 * @param {function} options.onDraftSaved - Callback when draft is saved
 */
export const useFormDraft = ({
  formType,
  formData,
  metadata = {},
  enabled = true,
  debounceMs = 1000,
  intervalMs = 30000,
  onDraftSaved,
}) => {
  const debounceTimerRef = useRef(null);
  const intervalTimerRef = useRef(null);
  const lastSavedDataRef = useRef(null);
  const isInitialMountRef = useRef(true);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const statusTimeoutRef = useRef(null);

  /**
   * Check if form data has meaningful content
   */
  const hasData = useCallback((data) => {
    if (!data || typeof data !== 'object') return false;
    
    // Check if any field has a value
    return Object.values(data).some(value => {
      if (value === null || value === undefined || value === '') return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object') return Object.keys(value).length > 0;
      return true;
    });
  }, []);

  /**
   * Check if data has changed since last save
   */
  const hasDataChanged = useCallback((currentData, lastSavedData) => {
    if (!lastSavedData) return hasData(currentData);
    return JSON.stringify(currentData) !== JSON.stringify(lastSavedData);
  }, [hasData]);

  /**
   * Save draft to localStorage
   */
  const saveDraft = useCallback(() => {
    if (!enabled || !formType || !formData) return;

    // Don't save if no meaningful data
    if (!hasData(formData)) {
      return;
    }

    // Don't save if data hasn't changed
    if (!hasDataChanged(formData, lastSavedDataRef.current)) {
      return;
    }

    // Clear any existing timeout
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }

    // Set saving status
    setSaveStatus('saving');

    try {
      saveFormDraft(formType, formData, metadata);
      lastSavedDataRef.current = JSON.parse(JSON.stringify(formData));
      
      // Set saved status
      setSaveStatus('saved');
      
      // Clear status after 2 seconds
      statusTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
      
      if (onDraftSaved) {
        onDraftSaved(formData);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setSaveStatus('error');
      
      // Clear error status after 3 seconds
      statusTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  }, [enabled, formType, formData, metadata, hasData, hasDataChanged, onDraftSaved]);

  /**
   * Debounced save - saves after user stops typing
   */
  const debouncedSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      saveDraft();
    }, debounceMs);
  }, [saveDraft, debounceMs]);

  /**
   * Load draft from localStorage
   */
  const loadDraft = useCallback(() => {
    if (!formType) return null;
    return loadFormDraft(formType);
  }, [formType]);

  /**
   * Clear draft from localStorage
   */
  const clearDraft = useCallback(() => {
    if (!formType) return;
    clearFormDraft(formType);
    lastSavedDataRef.current = null;
  }, [formType]);

  // Auto-save on form data changes (debounced)
  useEffect(() => {
    if (!enabled || !formType || !formData) return;
    
    // Skip on initial mount to avoid saving empty form
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    debouncedSave();

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [formData, enabled, formType, debouncedSave]);

  // Periodic save (interval backup)
  useEffect(() => {
    if (!enabled || !formType || !formData) {
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
        intervalTimerRef.current = null;
      }
      return;
    }

    intervalTimerRef.current = setInterval(() => {
      saveDraft();
    }, intervalMs);

    return () => {
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
        intervalTimerRef.current = null;
      }
    };
  }, [enabled, formType, formData, intervalMs, saveDraft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
      }
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    saveStatus, // 'idle', 'saving', 'saved', 'error'
  };
};

export default useFormDraft;

