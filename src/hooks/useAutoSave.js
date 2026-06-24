import { useEffect, useRef, useCallback } from 'react';
import { useUser } from '../context/userContext';
import formDraftHelper from '../helpers/formDraftHelper';

/**
 * Custom hook for auto-saving form data
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.formType - Type of form ('appointment', 'patient_details', 'settings_patient', etc.)
 * @param {Object} config.formData - Current form data to save
 * @param {Object} config.metadata - Additional metadata (appointmentId, patientId, etc.)
 * @param {number} config.debounceMs - Debounce time in milliseconds (default: 2000)
 * @param {number} config.autoSaveInterval - Auto-save interval in milliseconds (default: 30000)
 * @param {boolean} config.enabled - Whether auto-save is enabled (default: true)
 * @param {Function} config.onSaveSuccess - Callback when save succeeds
 * @param {Function} config.onSaveError - Callback when save fails
 * @param {boolean} config.directSave - If true, saves directly to final tables (for patient_details)
 * @param {Function} config.directSaveFunction - Function to call for direct saves
 * @param {string} config.draftId - Optional draft ID to update existing draft instead of creating new
 */
export const useAutoSave = ({
  formType,
  formData,
  metadata = {},
  debounceMs = 2000,
  autoSaveInterval = 30000,
  enabled = true,
  onSaveSuccess,
  onSaveError,
  directSave = false,
  directSaveFunction = null,
  draftId = null
}) => {
  const { user } = useUser();
  const debounceTimerRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const lastSavedDataRef = useRef(null);
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef(null);
  const draftIdRef = useRef(draftId); // Store draftId in ref so it's accessible in callbacks
  const hasInitializedRef = useRef(false); // Track if we've seeded the baseline from initial formData

  // Reset baseline initialization whenever the hook gets disabled (e.g. switching appointments).
  // This ensures the next time it's enabled with newly loaded data, we re-seed correctly
  // rather than immediately auto-saving the freshly-loaded data.
  useEffect(() => {
    if (!enabled) {
      hasInitializedRef.current = false;
      lastSavedDataRef.current = null;
    }
  }, [enabled]);

  // Update draftId ref when it changes - CRITICAL for immediate access
  useEffect(() => {
    draftIdRef.current = draftId;
    console.log('🔄 DraftId ref updated to:', draftId);
  }, [draftId]);

  // Check if data has changed
  const hasDataChanged = useCallback((currentData, lastSaved) => {
    if (!lastSaved) return true;
    return JSON.stringify(currentData) !== JSON.stringify(lastSaved);
  }, []);

  // Save function
  const saveData = useCallback(async (dataToSave, meta = {}) => {
    if (isSavingRef.current) {
      // Queue the save if one is in progress
      pendingSaveRef.current = { data: dataToSave, meta };
      return;
    }

    if (!enabled || !user || !formType) return;

    isSavingRef.current = true;

    // Get current draftId from ref (it may have changed)
    const currentDraftId = draftIdRef.current;
    const startTime = Date.now();

    try {
      if (directSave && directSaveFunction) {
        // Direct save to final tables (for patient_details)
        await directSaveFunction(dataToSave, meta);
      } else {
        // Save to draft storage (update if draftId exists, create new if not)
        const operation = currentDraftId ? 'UPDATE' : 'CREATE';
        console.log(`💾 Auto-saving (${operation}): ${currentDraftId ? `draft ${currentDraftId}` : 'new draft'}`);
        
        const result = await formDraftHelper.save(formType, dataToSave, {
          ...metadata,
          ...meta,
          lastActivity: new Date().toISOString()
        }, currentDraftId);
        
        const duration = Date.now() - startTime;
        console.log(`✅ ${operation} completed in ${duration}ms`);
        
        // If we created a new draft and got a draftId back, notify parent
        if (!currentDraftId && result?.draftId && onSaveSuccess) {
          // Call onSaveSuccess with the new draftId so parent can track it
          onSaveSuccess(dataToSave, { ...meta, draftId: result.draftId });
        }
      }

      lastSavedDataRef.current = JSON.parse(JSON.stringify(dataToSave));
      
      // Only call onSaveSuccess if not already called above (for new draft creation)
      if (onSaveSuccess && (directSave || currentDraftId)) {
        onSaveSuccess(dataToSave);
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      
      // Save to localStorage as fallback
      try {
        const fallbackData = {
          formData: dataToSave,
          metadata: { ...metadata, ...meta, draftId: currentDraftId },
          timestamp: Date.now(),
          formType
        };
        const key = currentDraftId 
          ? `draft_${formType}_${user._id}_${currentDraftId}`
          : `draft_${formType}_${user._id}`;
        localStorage.setItem(key, JSON.stringify(fallbackData));
      } catch (localError) {
        console.error('Failed to save to localStorage:', localError);
      }

      if (onSaveError) {
        onSaveError(error);
      }
    } finally {
      isSavingRef.current = false;

      // Process pending save if any
      if (pendingSaveRef.current) {
        const pending = pendingSaveRef.current;
        pendingSaveRef.current = null;
        saveData(pending.data, pending.meta);
      }
    }
  }, [enabled, user, formType, metadata, directSave, directSaveFunction, onSaveSuccess, onSaveError, draftId]);

  // Debounced save
  const debouncedSave = useCallback((dataToSave, meta = {}) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (hasDataChanged(dataToSave, lastSavedDataRef.current)) {
        saveData(dataToSave, meta);
      }
    }, debounceMs);
  }, [debounceMs, hasDataChanged, saveData]);

  // Auto-save on interval
  useEffect(() => {
    if (!enabled || !user || !formType) return;

    autoSaveTimerRef.current = setInterval(() => {
      if (hasDataChanged(formData, lastSavedDataRef.current)) {
        saveData(formData, metadata);
      }
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [enabled, user, formType, formData, metadata, autoSaveInterval, hasDataChanged, saveData]);

  // Save on form data change (debounced)
  useEffect(() => {
    if (!enabled || !user || !formType) return;

    // Seed baseline on first run with non-empty formData so we don't auto-save
    // the freshly-loaded data as if the user had edited it.
    if (!hasInitializedRef.current) {
      if (formData && Object.keys(formData).length > 0) {
        lastSavedDataRef.current = JSON.parse(JSON.stringify(formData));
        hasInitializedRef.current = true;
      }
      return;
    }

    if (hasDataChanged(formData, lastSavedDataRef.current)) {
      debouncedSave(formData, metadata);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [formData, enabled, user, formType, metadata, debouncedSave, hasDataChanged]);
  
  // Immediate save when draftId changes (draft was selected/recovered)
  // This ensures the draft is saved right away when user selects it
  useEffect(() => {
    if (!enabled || !user || !formType || !draftId) return;
    
    // When draftId is set (draft recovered), save immediately if data exists and changed
    if (formData && Object.keys(formData).length > 0 && hasDataChanged(formData, lastSavedDataRef.current)) {
      console.log('🔄 Draft ID set, saving immediately. DraftId:', draftId, 'Ref:', draftIdRef.current);
      // Use very short delay to batch rapid changes but still be responsive
      const immediateTimer = setTimeout(() => {
        // Double-check draftId from ref
        const currentDraftId = draftIdRef.current;
        console.log('💾 Immediate save triggered. Using draftId:', currentDraftId);
        saveData(formData, metadata);
      }, 300); // 300ms delay - very responsive
      
      return () => clearTimeout(immediateTimer);
    }
  }, [draftId, enabled, user, formType, formData, metadata, hasDataChanged, saveData]); // Include all dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Manual save function
  const manualSave = useCallback((dataToSave = formData, meta = metadata) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    return saveData(dataToSave, meta);
  }, [formData, metadata, saveData]);

  // Sync localStorage data when network returns
  const syncLocalStorageData = useCallback(async () => {
    if (!user || !formType) return;

    try {
      const key = `draft_${formType}_${user._id}`;
      const localData = localStorage.getItem(key);
      
      if (localData) {
        const parsed = JSON.parse(localData);
        // Try to sync to server
        try {
          await formDraftHelper.save(formType, parsed.formData, parsed.metadata);
          // Remove from localStorage after successful sync
          localStorage.removeItem(key);
          console.log('Synced localStorage data to server');
        } catch (error) {
          console.error('Failed to sync localStorage data:', error);
        }
      }
    } catch (error) {
      console.error('Error syncing localStorage data:', error);
    }
  }, [user, formType]);

  // Check network status and sync
  useEffect(() => {
    const handleOnline = () => {
      syncLocalStorageData();
    };

    window.addEventListener('online', handleOnline);
    
    // Also check on mount
    if (navigator.onLine) {
      syncLocalStorageData();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncLocalStorageData]);

  return {
    manualSave,
    syncLocalStorageData,
    isSaving: isSavingRef.current
  };
};

