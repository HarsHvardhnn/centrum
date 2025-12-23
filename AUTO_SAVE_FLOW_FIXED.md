# Auto-Save Flow - Fixed Implementation

## ✅ Correct Flow for Settings Page Forms

### Patient/Doctor/Receptionist Forms Flow:

#### 1. **Fresh Form Opened** (No drafts exist)
```
User opens form modal
  ↓
Check for drafts → None found
  ↓
Open form directly (currentDraftId = null)
  ↓
User types → Auto-save triggers
  ↓
CREATE new draft (POST /api/form-drafts)
  ↓
Store draftId in currentDraftId state
  ↓
All subsequent auto-saves UPDATE this draft (PUT /api/form-drafts/:draftId)
```

#### 2. **Form Opened with Existing Drafts**
```
User opens form modal
  ↓
Check for drafts → Found drafts
  ↓
Show DraftRecoveryModal with list of drafts
  ↓
User has 3 options:
  a) Select a draft → Recover it
  b) Click "Rozpocznij od nowa" → Start fresh
  c) Close modal → Start fresh (default)
```

#### 3. **User Selects a Draft**
```
User clicks "Odzyskaj wybrany"
  ↓
handleRecoverDraft() called with draft data + draftId
  ↓
Set currentDraftId = selected draft's ID
  ↓
Load draft data into form
  ↓
Close recovery modal
  ↓
User edits form → Auto-save triggers
  ↓
UPDATE selected draft (PUT /api/form-drafts/:draftId)
  ↓
No new drafts created - only the selected draft is updated
```

#### 4. **User Starts Fresh** (No draft selected)
```
User clicks "Rozpocznij od nowa" or closes modal
  ↓
handleStartFresh() called
  ↓
Set currentDraftId = null
  ↓
Close recovery modal
  ↓
Form opens empty
  ↓
User types → Auto-save triggers
  ↓
CREATE new draft (POST /api/form-drafts)
  ↓
Store new draftId in currentDraftId
  ↓
All subsequent auto-saves UPDATE this new draft
```

#### 5. **User Saves Form Successfully**
```
User submits form
  ↓
Form data saved to final tables
  ↓
Delete the draft (DELETE /api/form-drafts/:draftId)
  ↓
Clear currentDraftId = null
  ↓
Close modal
```

## 🔧 Key Implementation Details

### State Management:
- `currentDraftId` - Tracks which draft is currently being edited
  - `null` = No draft selected, will create new on first auto-save
  - `string` = Draft ID, will update this draft on auto-save

### Auto-Save Logic:
```javascript
if (currentDraftId) {
  // UPDATE existing draft
  PUT /api/form-drafts/:currentDraftId
} else {
  // CREATE new draft
  POST /api/form-drafts
  // Then store returned draftId in currentDraftId
}
```

### Draft Recovery:
- Modal shows all drafts for the form type
- User can select one to recover
- User can start fresh (creates new draft)
- Selected draft's ID is stored in `currentDraftId`

## 🐛 Bugs Fixed

1. ✅ Draft ID properly tracked in `currentDraftId` state
2. ✅ Auto-save uses `draftIdRef` to access current draftId in callbacks
3. ✅ Recovery modal properly passes draft ID to parent
4. ✅ "Start Fresh" option clears draft ID
5. ✅ New draft ID captured and stored after creation
6. ✅ Auto-save disabled while recovery modal is open

## 📝 Console Logs for Debugging

The implementation includes console logs:
- `✅ Draft selected, will UPDATE draft ID: {id}` - When draft is recovered
- `🆕 Starting fresh form - new draft will be created` - When starting fresh
- `💾 Auto-saving: UPDATE draft {id}` - When updating existing draft
- `💾 Auto-saving: CREATE new draft` - When creating new draft
- `New draft created with ID: {id}` - When new draft is created

## ✅ Testing Checklist

- [ ] Open form with no drafts → Form opens directly
- [ ] Type in form → New draft created on first auto-save
- [ ] Continue typing → Same draft gets updated (not new drafts)
- [ ] Close and reopen form → See draft in recovery modal
- [ ] Select draft → Draft data loads, draftId is set
- [ ] Edit selected draft → Only that draft gets updated
- [ ] Start fresh → New draft created
- [ ] Save form → Draft is deleted
- [ ] Multiple drafts → Can select which one to recover
- [ ] Delete draft → Can delete individual drafts



