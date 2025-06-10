# GDPR Cookie Consent Implementation Guide

## Overview

This implementation provides a GDPR-compliant cookie consent system that:

- ✅ Blocks non-essential cookies until consent is granted
- ✅ Allows users to choose specific cookie categories
- ✅ Provides easy consent withdrawal/modification
- ✅ Stores consent settings in backend for authenticated users
- ✅ Falls back to localStorage for guest users
- ✅ Automatically loads/blocks analytics and marketing scripts

## Frontend Implementation

### Components Created/Modified

1. **CookieConsentContext.jsx** - Main context provider
2. **CookieConsent.jsx** - Updated consent banner
3. **CookiePreferences.jsx** - New detailed preferences modal
4. **CookieSettingsLink.jsx** - Link component for footer/navigation
5. **Footer.jsx** - Updated to include cookie settings link
6. **UserLayout.jsx** - Updated to include context provider

### Environment Variables Required

Add these to your `.env` file:

```env
# Analytics Configuration
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Marketing Configuration  
VITE_FACEBOOK_PIXEL_ID=123456789012345
```

### Cookie Categories Implemented

1. **Necessary** (always enabled) - Authentication, session, security
2. **Analytics** - Google Analytics, usage tracking
3. **Marketing** - Facebook Pixel, advertising
4. **Preferences** - Language, theme, user settings

## Backend Implementation Required

You need to implement these API endpoints:

### 1. Get Cookie Consent
```javascript
GET /api/cookie-consent

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "consent": {
      "necessary": true,
      "analytics": true,
      "marketing": false,
      "preferences": true,
      "timestamp": "2025-01-27T10:30:00.000Z",
      "version": "1.0"
    }
  }
}
```

### 2. Save Cookie Consent
```javascript
POST /api/cookie-consent

Headers:
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "consent": {
    "necessary": true,
    "analytics": true,
    "marketing": false,
    "preferences": true,
    "timestamp": "2025-01-27T10:30:00.000Z",
    "version": "1.0"
  }
}

Response:
{
  "success": true,
  "message": "Cookie consent saved successfully"
}
```

### 3. Delete Cookie Consent (Withdraw)
```javascript
DELETE /api/cookie-consent

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Cookie consent withdrawn successfully"
}
```

## Database Schema

### MongoDB Example
```javascript
// Cookie Consent Schema
const cookieConsentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  consent: {
    necessary: { type: Boolean, default: true },
    analytics: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false },
    preferences: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
    version: { type: String, default: '1.0' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CookieConsent = mongoose.model('CookieConsent', cookieConsentSchema);
```

### PostgreSQL Example
```sql
CREATE TABLE cookie_consents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) UNIQUE NOT NULL,
  necessary BOOLEAN DEFAULT TRUE,
  analytics BOOLEAN DEFAULT FALSE,
  marketing BOOLEAN DEFAULT FALSE,
  preferences BOOLEAN DEFAULT FALSE,
  consent_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  version VARCHAR(10) DEFAULT '1.0',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Backend Implementation Examples

### Node.js/Express Example

```javascript
const express = require('express');
const router = express.Router();

// Get cookie consent
router.get('/cookie-consent', async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    
    const consent = await CookieConsent.findOne({ userId });
    
    if (!consent) {
      return res.json({ success: true, data: null });
    }
    
    res.json({
      success: true,
      data: { consent: consent.consent }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cookie consent'
    });
  }
});

// Save cookie consent
router.post('/cookie-consent', async (req, res) => {
  try {
    const userId = req.user.id;
    const { consent } = req.body;
    
    await CookieConsent.findOneAndUpdate(
      { userId },
      { 
        consent,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      message: 'Cookie consent saved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving cookie consent'
    });
  }
});

// Delete cookie consent
router.delete('/cookie-consent', async (req, res) => {
  try {
    const userId = req.user.id;
    
    await CookieConsent.findOneAndDelete({ userId });
    
    res.json({
      success: true,
      message: 'Cookie consent withdrawn successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error withdrawing cookie consent'
    });
  }
});

module.exports = router;
```

### Laravel/PHP Example

```php
// Route definitions
Route::middleware('auth:api')->group(function () {
    Route::get('/cookie-consent', [CookieConsentController::class, 'get']);
    Route::post('/cookie-consent', [CookieConsentController::class, 'save']);
    Route::delete('/cookie-consent', [CookieConsentController::class, 'delete']);
});

// Controller
class CookieConsentController extends Controller
{
    public function get(Request $request)
    {
        $consent = CookieConsent::where('user_id', $request->user()->id)->first();
        
        return response()->json([
            'success' => true,
            'data' => $consent ? ['consent' => $consent->consent] : null
        ]);
    }
    
    public function save(Request $request)
    {
        $validated = $request->validate([
            'consent' => 'required|array'
        ]);
        
        CookieConsent::updateOrCreate(
            ['user_id' => $request->user()->id],
            ['consent' => $validated['consent']]
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Cookie consent saved successfully'
        ]);
    }
    
    public function delete(Request $request)
    {
        CookieConsent::where('user_id', $request->user()->id)->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Cookie consent withdrawn successfully'
        ]);
    }
}
```

## GDPR Compliance Features

### ✅ Implemented
- Cookie categorization with clear descriptions
- Granular consent controls
- Easy consent withdrawal
- No pre-loading of tracking scripts
- Consent versioning and timestamping
- Clear privacy policy links
- Persistent consent storage

### 🔧 Additional Considerations
- Consider implementing consent expiry (e.g., 12 months)
- Add audit logging for consent changes
- Implement data export for user consent history
- Add consent banner A/B testing capability

## Testing

1. **Clear Storage**: Clear localStorage and cookies, verify banner appears
2. **Category Selection**: Test each cookie category toggle
3. **Script Loading**: Verify analytics scripts only load after consent
4. **Backend Integration**: Test with authenticated users
5. **Consent Withdrawal**: Test the "withdraw consent" functionality
6. **Responsive Design**: Test on mobile and desktop

## Legal Compliance Notes

This implementation helps meet GDPR requirements:
- **Article 7**: Clear consent mechanism
- **Article 13**: Transparent information about data processing
- **Article 17**: Right to withdraw consent
- **Recital 32**: Freely given, specific, informed consent

Remember to also:
- Update your privacy policy
- Document your lawful basis for processing
- Implement data retention policies
- Provide clear contact information for data protection queries 