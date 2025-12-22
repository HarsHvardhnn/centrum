# LocalStorage Draft System Implementation

## Overview
A comprehensive localStorage-based draft system has been implemented for all three forms in `Settings.jsx`:
1. **Receptionist Form** - ✅ Fully implemented
2. **Doctor Form** - ⚠️ Partial (draft recovery works, auto-save needs AddDoctorForm modification)
3. **Patient Form** - ✅ Fully implemented

## Features

### ✅ Auto-Save
- **Receptionist**: Auto-saves every 1 second (debounced) and every 30 seconds (interval)
- **Patient**: Auto-saves every 1.5 seconds (debounced) and every 30 seconds (interval)
- **Doctor**: Draft recovery works, but auto-save requires AddDoctorForm modification (see below)

### ✅ Draft Recovery
- When a modal opens, checks for existing drafts
- Shows a recovery modal with draft information
- User can choose to:
  - **Recover draft**: Restores all form data
  - **Start fresh**: Discards draft and starts new

### ✅ Draft Clearing
- Drafts are automatically cleared on successful form submission
- Drafts persist if user closes modal without submitting

## Files Created

### 1. `src/utils/formDraftStorage.js`
Utility functions for localStorage draft management:
- `saveFormDraft(formType, formData, metadata)` - Save draft
- `loadFormDraft(formType)` - Load draft
- `clearFormDraft(formType)` - Clear draft
- `hasFormDraft(formType)` - Check if draft exists
- `formatDraftAge(ageMs)` - Format draft age for display

### 2. `src/hooks/useFormDraft.js`
Custom hook for auto-saving form data:
- Debounced saves (default: 1000ms)
- Interval saves (default: 30000ms)
- Only saves if data has changed
- Only saves if form has meaningful data

## Integration Details

### Receptionist Form
```javascript
// Auto-save hook
useFormDraft({
  formType: 'receptionist',
  formData: formData,
  metadata: { isEditMode: false },
  enabled: showAddModal && !isEditMode,
});

// Draft recovery on modal open
useEffect(() => {
  if (showAddModal && !isEditMode) {
    const draft = loadFormDraft('receptionist');
    if (draft) {
      // Show recovery modal
    }
  }
}, [showAddModal]);

// Clear draft on success
clearFormDraft('receptionist');
```

### Patient Form
```javascript
// Auto-save hook (uses context data)
useFormDraft({
  formType: 'patient',
  formData: currentFormContextData || patientFormData,
  metadata: { 
    isEditMode: isEditMode,
    currentSubStep: currentSubStep,
  },
  enabled: showAddPatientModal && !isEditMode,
});

// Draft recovery restores:
// - All form fields
// - Current step
// - Phone code preference
```

### Doctor Form
⚠️ **Current Limitation**: 
- Draft recovery works (draft data is passed to `AddDoctorForm` via `initialData`)
- Auto-save doesn't work because `AddDoctorForm` uses Formik and manages its own state
- **Solution**: Modify `AddDoctorForm` to expose form data or add auto-save hook inside it

**To enable auto-save for Doctor form:**
1. Add `useFormDraft` hook inside `AddDoctorForm` component
2. Track Formik form values using `useFormikContext()` or form values
3. Save drafts when form data changes

Example modification needed in `AddDoctorForm`:
```javascript
// Inside AddDoctorForm component
const formik = useFormikContext(); // or get values from Formik

useFormDraft({
  formType: 'doctor',
  formData: formik.values, // Formik form values
  metadata: { isEditMode: isEditMode },
  enabled: isOpen && !isEditMode,
});
```

## Storage Keys

Drafts are stored in localStorage with these keys:
- `form_draft_receptionist`
- `form_draft_doctor`
- `form_draft_patient`

## Draft Data Structure

```javascript
{
  formType: 'receptionist' | 'doctor' | 'patient',
  formData: {
    // Form field values
  },
  metadata: {
    savedAt: "2024-01-01T12:00:00.000Z",
    timestamp: 1704110400000,
    isEditMode: false,
    currentSubStep: 0, // For patient form only
    // ... other metadata
  }
}
```

## User Flow

### Creating a New Form
1. User clicks "Add [User Type]"
2. Modal opens
3. If draft exists → Recovery modal appears
4. User chooses:
   - **Recover**: Draft data loads into form
   - **Start fresh**: Draft cleared, empty form shown
5. User fills form → Auto-saves every 1-1.5 seconds
6. User submits → Draft cleared, form saved

### Editing Existing User
1. User clicks "Edit" on existing user
2. Modal opens with user data
3. **No draft recovery** (edit mode doesn't use drafts)
4. User modifies → Changes saved to backend
5. Drafts are not used in edit mode

### Closing Modal Without Saving
1. User closes modal without submitting
2. Draft remains in localStorage
3. Next time modal opens → Draft recovery offered

## Benefits

1. **Progress Preservation**: Users don't lose work if:
   - Browser crashes
   - User gets logged out
   - Network disconnects
   - Page refreshes accidentally

2. **User-Friendly**: 
   - Automatic saves (no user action needed)
   - Clear recovery UI
   - Option to start fresh

3. **No Backend Required**: 
   - Uses localStorage (client-side only)
   - Works offline
   - Fast and reliable

## Testing Checklist

- [ ] Receptionist form auto-saves while typing
- [ ] Receptionist draft recovers when modal reopens
- [ ] Receptionist draft clears on successful submit
- [ ] Patient form auto-saves while typing
- [ ] Patient draft recovers with all steps
- [ ] Patient draft clears on successful submit
- [ ] Doctor draft recovers when modal reopens
- [ ] Drafts persist after browser refresh
- [ ] Drafts persist after logout/login
- [ ] "Start fresh" clears draft correctly
- [ ] Edit mode doesn't interfere with drafts

## Future Enhancements

1. **Multiple Drafts**: Support multiple drafts per form type
2. **Draft Naming**: Allow users to name/rename drafts
3. **Draft Expiration**: Auto-delete drafts older than X days
4. **Draft Preview**: Show preview of draft data in recovery modal
5. **Sync Across Tabs**: Use storage events to sync drafts across browser tabs

