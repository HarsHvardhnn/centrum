# Backend Updates Needed for Multiple Drafts Support

## Required API Endpoints

### 1. Get Multiple Drafts by Form Type
**GET** `/api/form-drafts?formType=settings_patient`

**Query Parameters:**
- `formType` (optional) - Filter drafts by form type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "formType": "settings_patient",
      "formData": {...},
      "metadata": {
        "lastActivity": "2025-01-15T10:30:00Z",
        "isComplete": false,
        "patientId": "...",
        "isEditMode": false
      },
      "createdAt": "2025-01-15T09:00:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    },
    {
      "_id": "...",
      "formType": "settings_patient",
      "formData": {...},
      "metadata": {...}
    }
  ]
}
```

### 2. Update Existing Draft
**PUT** `/api/form-drafts/:draftId` (REQUIRED - for updating selected drafts)

**Request Body:**
```json
{
  "formData": {...},
  "metadata": {
    "lastActivity": "2025-01-15T10:30:00Z",
    "isComplete": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Draft updated successfully",
  "data": {
    "draftId": "...",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

### 3. Delete Draft by ID
**DELETE** `/api/form-drafts/:draftId`

**Response:**
```json
{
  "success": true,
  "message": "Draft deleted successfully"
}
```

**OR**

**POST** `/api/form-drafts` (Current implementation - should update if exists)

The current POST endpoint should:
- Check if a draft exists for `userId + formType`
- If exists, update it (update `formData`, `metadata.lastActivity`, `updatedAt`)
- If not exists, create new one

## Database Schema Update

The current schema should support multiple drafts per user per formType. However, if you're using a unique constraint on `(userId, formType)`, you'll need to:

**Option 1: Remove unique constraint** (Recommended)
- Allow multiple drafts per user per formType
- Add `draftId` or use `_id` for identification
- User can have multiple incomplete drafts

**Option 2: Keep unique constraint but add versioning**
- Keep one draft per user per formType
- Update existing draft when saving
- Add version number in metadata

## Controller Updates

### Update `saveDraft` method (POST - Create new):
```javascript
async saveDraft(req, res) {
  try {
    const userId = req.user.id;
    const { formType, formData, metadata = {} } = req.body;

    // Create new draft (allows multiple drafts per user per formType)
    const draft = await FormDraft.create({
      userId,
      formType,
      formData,
      metadata: {
        ...metadata,
        lastActivity: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Draft created successfully',
      data: {
        draftId: draft._id,
        savedAt: draft.createdAt
      }
    });
  } catch (error) {
    // Handle error
  }
}
```

### Add `updateDraft` method (PUT - Update existing):
```javascript
async updateDraft(req, res) {
  try {
    const userId = req.user.id;
    const { draftId } = req.params;
    const { formData, metadata = {} } = req.body;

    // Find and update the draft (ensure it belongs to the user)
    const draft = await FormDraft.findOneAndUpdate(
      { _id: draftId, userId },
      {
        formData,
        metadata: {
          ...metadata,
          lastActivity: new Date()
        },
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found'
      });
    }

    res.json({
      success: true,
      message: 'Draft updated successfully',
      data: {
        draftId: draft._id,
        updatedAt: draft.updatedAt
      }
    });
  } catch (error) {
    // Handle error
  }
}
```

### Add `getAllDrafts` with formType filter:
```javascript
async getAllDrafts(req, res) {
  try {
    const userId = req.user.id;
    const { formType } = req.query;

    const query = { userId };
    if (formType) {
      query.formType = formType;
    }

    const drafts = await FormDraft.find(query)
      .sort({ 'metadata.lastActivity': -1 })
      .lean();

    res.json({
      success: true,
      data: drafts
    });
  } catch (error) {
    // Handle error
  }
}
```

### Add `deleteDraftById`:
```javascript
async deleteDraftById(req, res) {
  try {
    const userId = req.user.id;
    const { draftId } = req.params;

    const draft = await FormDraft.findOne({ _id: draftId, userId });

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found'
      });
    }

    await FormDraft.findByIdAndDelete(draftId);

    res.json({
      success: true,
      message: 'Draft deleted successfully'
    });
  } catch (error) {
    // Handle error
  }
}
```

## Route Updates

```javascript
// routes/formDrafts.js
router.get('/form-drafts', formDraftController.getAllDrafts); // Add query param support
router.get('/form-drafts/:formType', formDraftController.getDraft);
router.post('/form-drafts', formDraftController.saveDraft); // Create new draft
router.put('/form-drafts/:draftId', formDraftController.updateDraft); // Update existing draft (REQUIRED)
router.delete('/form-drafts/:draftId', formDraftController.deleteDraftById); // Delete by ID
router.delete('/form-drafts/:formType', formDraftController.deleteDraft); // Keep for backward compatibility
```

## Recommendation

**Use Option 1 (Multiple Drafts)**:
- More flexible for users
- Better UX - users can have multiple incomplete forms
- Backend should remove unique constraint on `(userId, formType)`
- Frontend already supports multiple drafts selection

**Implementation Priority:**
1. ✅ Update `getAllDrafts` to support `formType` query parameter
2. ✅ Add `updateDraft` endpoint (PUT `/api/form-drafts/:draftId`) - **REQUIRED**
3. ✅ Add `deleteDraftById` endpoint
4. ✅ Update `saveDraft` to create new drafts (not just update)
5. ✅ Remove unique constraint from database schema

**Important**: The PUT endpoint is critical - it allows updating a selected draft instead of creating new ones every time.

