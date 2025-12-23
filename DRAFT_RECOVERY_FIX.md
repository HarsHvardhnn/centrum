# Draft Recovery Fix - Summary

## Issues Fixed

### 1. ✅ Draft ID Not Being Set Properly
**Problem**: When recovering a draft, the draftId wasn't being extracted correctly from the API response.

**Fix**:
- Extract draft ID from `selectedDraft._id` (root level in API response)
- Pass draft ID in multiple places (parameter, metadata) for redundancy
- Set `currentDraftId` immediately when draft is recovered
- Added console logs to track draft ID setting

### 2. ✅ Form Data Not Loading
**Problem**: When recovering a draft, form fields remained empty even though draft had data.

**Fix**:
- Added `key` prop to FormProvider to force remount when draft is recovered
- Update FormContext directly via `window.updateMultipleFields` after recovery
- Added useEffect to detect draft recovery and update form data
- FormProvider key: `patient-form-${currentDraftId || 'new'}-${isEditMode}`

### 3. ✅ POST Instead of PUT
**Problem**: Even when draft was selected, auto-save was creating new drafts (POST) instead of updating (PUT).

**Fix**:
- Use `draftIdRef` in useAutoSave hook to track current draftId in callbacks
- Check `currentDraftId` before saving - if set, use PUT; if null, use POST
- Added console logs to show which operation is happening

### 4. ✅ Draft Title Support
**Problem**: No way to identify/rename drafts.

**Fix**:
- Added `updateTitle` method to formDraftHelper
- Added inline title editing in DraftRecoveryModal
- Click edit icon → edit title → save/cancel
- Title displayed in draft list

## API Response Structure

Your backend returns:
```json
{
  "success": true,
  "data": [
    {
      "_id": "6947906be32bb983cdd6332e",
      "formType": "settings_patient",
      "formData": {
        "phone": "+48",
        "fullName": "test"
      },
      "metadata": {...}
    }
  ]
}
```

**Key Points**:
- Draft ID is at root: `_id`
- Form data is in: `formData`
- Title is at root: `title` (can be null)

## Flow Now

1. **User opens form** → Check for drafts
2. **Drafts found** → Show recovery modal
3. **User selects draft**:
   - Extract `_id` from draft object
   - Set `currentDraftId = draft._id`
   - Set `patientFormData = draft.formData`
   - FormProvider remounts with new data (via key change)
   - FormContext updated directly (via updateMultipleFields)
4. **User edits** → Auto-save uses PUT `/api/form-drafts/:draftId`
5. **User starts fresh** → `currentDraftId = null` → Auto-save uses POST

## Console Logs Added

- `📥 Recovering draft:` - When draft recovery starts
- `✅ Draft ID set to: {id}` - When draftId is set
- `📝 Setting patientFormData:` - When form data is set
- `✅ Form context updated` - When FormContext is updated
- `💾 Auto-saving: UPDATE draft {id}` - When updating existing draft
- `💾 Auto-saving: CREATE new draft` - When creating new draft

## Testing

1. Create a draft by typing in form
2. Close modal
3. Reopen modal → Should see draft in recovery modal
4. Select draft → Form should populate with data
5. Check console → Should see "UPDATE draft {id}" on auto-save
6. Edit title → Should update draft title
7. Start fresh → Should create new draft

## Backend Requirements

✅ PUT `/api/form-drafts/:draftId` - Update existing draft
✅ PATCH `/api/form-drafts/:draftId/title` - Update draft title
✅ GET `/api/form-drafts?formType=settings_patient` - Get multiple drafts
✅ DELETE `/api/form-drafts/:draftId` - Delete by ID

All endpoints should be implemented per `AUTO_SAVE_BACKEND_UPDATES.md`.



