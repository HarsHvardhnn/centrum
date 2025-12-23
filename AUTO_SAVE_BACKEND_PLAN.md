# Auto-Save / Form Data Preservation Backend Implementation Plan

## 📋 Overview

This document outlines the backend implementation for auto-saving form data across three types of forms:
1. **Patient Details Form** - Real-time auto-save (direct to final tables)
2. **Appointment Form** - Temporary storage (incomplete data)
3. **Settings/User Management Forms** - Temporary storage (incomplete data)

---

## 🎯 Requirements

### Patient Details Form
- **Auto-save frequency**: Every 30 seconds or on field change (debounced)
- **Storage**: Direct save to appointment/patient tables
- **Fallback**: localStorage if network unavailable
- **Recovery**: Sync localStorage data when network returns

### Appointment & Settings Forms
- **Auto-save frequency**: Every 30 seconds or on field change (debounced)
- **Storage**: Temporary table (not final tables)
- **Auto-push to final tables**: After 15 minutes of inactivity
- **Recovery**: Show saved drafts when user returns

---

## 🗄️ Database Schema

### MongoDB Schema

```javascript
// models/FormDraft.js
const mongoose = require('mongoose');

const formDraftSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  formType: {
    type: String,
    required: true,
    enum: ['appointment', 'patient_details', 'settings_patient', 'settings_doctor', 'settings_receptionist'],
    index: true
  },
  formData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  metadata: {
    appointmentId: { type: String }, // For patient_details form
    patientId: { type: String }, // For patient_details form
    lastActivity: { type: Date, default: Date.now },
    isComplete: { type: Boolean, default: false },
    version: { type: Number, default: 1 }
  },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, index: true } // Auto-delete after 7 days
}, {
  timestamps: true
});

// Compound index for efficient queries
formDraftSchema.index({ userId: 1, formType: 1 });
formDraftSchema.index({ 'metadata.lastActivity': 1 });
formDraftSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Auto-set expiration date (7 days from creation)
formDraftSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  }
  next();
});

module.exports = mongoose.model('FormDraft', formDraftSchema);
```

### PostgreSQL Schema

```sql
-- Migration: create_form_drafts_table.sql
CREATE TABLE form_drafts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    form_type VARCHAR(50) NOT NULL CHECK (form_type IN ('appointment', 'patient_details', 'settings_patient', 'settings_doctor', 'settings_receptionist')),
    form_data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    last_activity TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_complete BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
    
    CONSTRAINT unique_user_form_type UNIQUE(user_id, form_type)
);

-- Indexes
CREATE INDEX idx_form_drafts_user_id ON form_drafts(user_id);
CREATE INDEX idx_form_drafts_form_type ON form_drafts(form_type);
CREATE INDEX idx_form_drafts_user_form_type ON form_drafts(user_id, form_type);
CREATE INDEX idx_form_drafts_last_activity ON form_drafts(last_activity);
CREATE INDEX idx_form_drafts_expires_at ON form_drafts(expires_at);

-- Update trigger for updated_at
CREATE TRIGGER update_form_drafts_updated_at 
    BEFORE UPDATE ON form_drafts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-delete expired drafts (run via cron job)
-- DELETE FROM form_drafts WHERE expires_at < CURRENT_TIMESTAMP;
```

---

## 🔌 API Endpoints

### Base Route: `/api/form-drafts`

#### 1. Save Draft
**POST** `/api/form-drafts`

**Request Body:**
```json
{
  "formType": "appointment",
  "formData": {
    "selectedDate": "2025-01-15",
    "selectedDoctor": { "_id": "..." },
    "selectedServices": [...],
    // ... all form fields
  },
  "metadata": {
    "appointmentId": "optional",
    "patientId": "optional",
    "isComplete": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Draft saved successfully",
  "data": {
    "draftId": "...",
    "savedAt": "2025-01-15T10:30:00Z"
  }
}
```

#### 2. Get Draft
**GET** `/api/form-drafts/:formType`

**Response:**
```json
{
  "success": true,
  "data": {
    "formType": "appointment",
    "formData": { ... },
    "metadata": { ... },
    "lastActivity": "2025-01-15T10:30:00Z"
  }
}
```

#### 3. Delete Draft
**DELETE** `/api/form-drafts/:formType`

**Response:**
```json
{
  "success": true,
  "message": "Draft deleted successfully"
}
```

#### 4. Get All User Drafts
**GET** `/api/form-drafts`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "formType": "appointment",
      "formData": { ... },
      "lastActivity": "2025-01-15T10:30:00Z"
    },
    {
      "formType": "settings_patient",
      "formData": { ... },
      "lastActivity": "2025-01-15T09:15:00Z"
    }
  ]
}
```

---

## 🔧 Controller Implementation

### Node.js/Express Controller

```javascript
// controllers/formDraftController.js
const FormDraft = require('../models/FormDraft');

class FormDraftController {
  // POST /api/form-drafts
  async saveDraft(req, res) {
    try {
      const userId = req.user.id;
      const { formType, formData, metadata = {} } = req.body;

      // Validation
      const allowedFormTypes = ['appointment', 'patient_details', 'settings_patient', 'settings_doctor', 'settings_receptionist'];
      if (!allowedFormTypes.includes(formType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid form type'
        });
      }

      // Update or create draft
      const draft = await FormDraft.findOneAndUpdate(
        { userId, formType },
        {
          formData,
          metadata: {
            ...metadata,
            lastActivity: new Date()
          },
          updatedAt: new Date()
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

      res.json({
        success: true,
        message: 'Draft saved successfully',
        data: {
          draftId: draft._id,
          savedAt: draft.updatedAt
        }
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // GET /api/form-drafts/:formType
  async getDraft(req, res) {
    try {
      const userId = req.user.id;
      const { formType } = req.params;

      const draft = await FormDraft.findOne({ userId, formType });

      if (!draft) {
        return res.json({
          success: true,
          data: null,
          message: 'No draft found'
        });
      }

      res.json({
        success: true,
        data: {
          formType: draft.formType,
          formData: draft.formData,
          metadata: draft.metadata,
          lastActivity: draft.metadata.lastActivity
        }
      });
    } catch (error) {
      console.error('Error fetching draft:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // DELETE /api/form-drafts/:formType
  async deleteDraft(req, res) {
    try {
      const userId = req.user.id;
      const { formType } = req.params;

      const result = await FormDraft.findOneAndDelete({ userId, formType });

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Draft not found'
        });
      }

      res.json({
        success: true,
        message: 'Draft deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting draft:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // GET /api/form-drafts
  async getAllDrafts(req, res) {
    try {
      const userId = req.user.id;

      const drafts = await FormDraft.find({ userId })
        .sort({ 'metadata.lastActivity': -1 })
        .select('formType formData metadata.lastActivity')
        .lean();

      res.json({
        success: true,
        data: drafts.map(draft => ({
          formType: draft.formType,
          formData: draft.formData,
          lastActivity: draft.metadata.lastActivity
        }))
      });
    } catch (error) {
      console.error('Error fetching drafts:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new FormDraftController();
```

---

## ⏰ Auto-Push to Final Tables (Background Job)

### Implementation Strategy

For **Appointment** and **Settings** forms, implement a background job that:
1. Checks for drafts with `lastActivity` older than 15 minutes
2. If `isComplete: true`, push to final tables
3. If `isComplete: false`, keep in draft but mark for review

### Cron Job (Node.js)

```javascript
// jobs/autoPushDrafts.js
const cron = require('node-cron');
const FormDraft = require('../models/FormDraft');
const appointmentHelper = require('../helpers/appointmentHelper');
const patientService = require('../helpers/patientService');

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    // Find inactive drafts
    const inactiveDrafts = await FormDraft.find({
      'metadata.lastActivity': { $lt: fifteenMinutesAgo },
      'metadata.isComplete': true
    });

    for (const draft of inactiveDrafts) {
      try {
        switch (draft.formType) {
          case 'appointment':
            // Push to appointments table
            await appointmentHelper.createReceptionAppointment(draft.formData);
            // Delete draft after successful push
            await FormDraft.findByIdAndDelete(draft._id);
            console.log(`Auto-pushed appointment draft for user ${draft.userId}`);
            break;
          
          case 'settings_patient':
            // Push to patients table
            if (draft.metadata.patientId) {
              await patientService.updatePatient(draft.metadata.patientId, draft.formData);
            } else {
              await patientService.createPatient(draft.formData);
            }
            await FormDraft.findByIdAndDelete(draft._id);
            console.log(`Auto-pushed patient draft for user ${draft.userId}`);
            break;
          
          // Add other form types as needed
        }
      } catch (error) {
        console.error(`Error auto-pushing draft ${draft._id}:`, error);
        // Keep draft for manual review
      }
    }
  } catch (error) {
    console.error('Error in auto-push job:', error);
  }
});
```

---

## 🔒 Security & Validation

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const draftSaveLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 saves per minute
  message: {
    success: false,
    message: 'Too many save requests, please slow down'
  }
});
```

### Data Validation
```javascript
const Joi = require('joi');

const saveDraftSchema = Joi.object({
  formType: Joi.string().valid('appointment', 'patient_details', 'settings_patient', 'settings_doctor', 'settings_receptionist').required(),
  formData: Joi.object().required(),
  metadata: Joi.object({
    appointmentId: Joi.string().optional(),
    patientId: Joi.string().optional(),
    isComplete: Joi.boolean().optional()
  }).optional()
});
```

---

## 📊 Monitoring & Cleanup

### Cleanup Job (Delete Expired Drafts)

```javascript
// jobs/cleanupExpiredDrafts.js
const cron = require('node-cron');
const FormDraft = require('../models/FormDraft');

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  try {
    const result = await FormDraft.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    console.log(`Cleaned up ${result.deletedCount} expired drafts`);
  } catch (error) {
    console.error('Error cleaning up expired drafts:', error);
  }
});
```

---

## 🧪 Testing Checklist

- [ ] Save draft for each form type
- [ ] Retrieve draft by form type
- [ ] Update existing draft
- [ ] Delete draft
- [ ] Get all user drafts
- [ ] Auto-expiration after 7 days
- [ ] Auto-push after 15 minutes of inactivity
- [ ] Rate limiting works
- [ ] Validation rejects invalid form types
- [ ] Concurrent saves don't cause conflicts
- [ ] Network failure handling (localStorage fallback)

---

## 📝 API Integration Example

```javascript
// Frontend helper
const formDraftHelper = {
  save: async (formType, formData, metadata = {}) => {
    try {
      const response = await apiCaller('POST', '/api/form-drafts', {
        formType,
        formData,
        metadata
      });
      return response.data;
    } catch (error) {
      // Fallback to localStorage
      localStorage.setItem(`draft_${formType}`, JSON.stringify({
        formData,
        metadata,
        timestamp: Date.now()
      }));
      throw error;
    }
  },
  
  get: async (formType) => {
    try {
      const response = await apiCaller('GET', `/api/form-drafts/${formType}`);
      return response.data;
    } catch (error) {
      // Fallback to localStorage
      const localData = localStorage.getItem(`draft_${formType}`);
      return localData ? JSON.parse(localData) : null;
    }
  },
  
  delete: async (formType) => {
    try {
      await apiCaller('DELETE', `/api/form-drafts/${formType}`);
      localStorage.removeItem(`draft_${formType}`);
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  }
};
```

---

## 🚀 Deployment Steps

1. **Database Migration**
   - Create `form_drafts` table/collection
   - Add indexes
   - Set up expiration TTL (MongoDB) or cleanup job (PostgreSQL)

2. **API Implementation**
   - Create model/schema
   - Implement controller
   - Add routes
   - Add validation middleware
   - Add rate limiting

3. **Background Jobs**
   - Set up auto-push cron job
   - Set up cleanup cron job
   - Test job execution

4. **Frontend Integration**
   - Implement auto-save hook
   - Add localStorage fallback
   - Add recovery UI

5. **Testing**
   - Unit tests for API endpoints
   - Integration tests for auto-save
   - Test network failure scenarios

---

## 📞 Support & Maintenance

- **Monitoring**: Track draft save frequency, auto-push success rate
- **Alerts**: Alert if auto-push job fails repeatedly
- **Cleanup**: Monitor expired draft cleanup
- **Performance**: Monitor query performance on indexed fields

---

**Estimated Implementation Time**: 3-4 days
**Priority**: Medium-High (Improves UX significantly)



