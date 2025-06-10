# Backend Implementation Plan - GDPR Cookie Consent System

## 📋 Project Overview

**Objective**: Implement backend API endpoints to store and manage user cookie consent preferences for GDPR compliance.

**Timeline**: 2-3 development days

**Priority**: High (Legal compliance requirement)

---

## 🎯 Phase 1: Database Setup (Day 1 - Morning)

### 1.1 Create Database Table/Collection

#### For MongoDB:
```javascript
// models/CookieConsent.js
const mongoose = require('mongoose');

const cookieConsentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  consent: {
    necessary: { type: Boolean, default: true },
    analytics: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false },
    preferences: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
    version: { type: String, default: '1.0' }
  },
  ipAddress: { type: String }, // For audit trail
  userAgent: { type: String }, // For audit trail
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
cookieConsentSchema.index({ userId: 1 });
cookieConsentSchema.index({ 'consent.timestamp': -1 });

module.exports = mongoose.model('CookieConsent', cookieConsentSchema);
```

#### For PostgreSQL:
```sql
-- Migration: create_cookie_consents_table.sql
CREATE TABLE cookie_consents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    necessary BOOLEAN NOT NULL DEFAULT TRUE,
    analytics BOOLEAN NOT NULL DEFAULT FALSE,
    marketing BOOLEAN NOT NULL DEFAULT FALSE,
    preferences BOOLEAN NOT NULL DEFAULT FALSE,
    consent_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version VARCHAR(10) NOT NULL DEFAULT '1.0',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_user_consent UNIQUE(user_id)
);

-- Indexes for performance
CREATE INDEX idx_cookie_consents_user_id ON cookie_consents(user_id);
CREATE INDEX idx_cookie_consents_timestamp ON cookie_consents(consent_timestamp DESC);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cookie_consents_updated_at 
    BEFORE UPDATE ON cookie_consents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 1.2 Database Migration Commands

```bash
# For Laravel
php artisan make:migration create_cookie_consents_table
php artisan migrate

# For Node.js with Sequelize
npx sequelize-cli migration:generate --name create-cookie-consents
npx sequelize-cli db:migrate

# For Rails
rails generate migration CreateCookieConsents
rails db:migrate
```

---

## 🔧 Phase 2: API Endpoints Implementation (Day 1 - Afternoon)

### 2.1 Route Definitions

#### Node.js/Express:
```javascript
// routes/cookieConsent.js
const express = require('express');
const router = express.Router();
const cookieConsentController = require('../controllers/cookieConsentController');
const auth = require('../middleware/auth'); // Your auth middleware

// All routes require authentication
router.use(auth);

router.get('/cookie-consent', cookieConsentController.getConsent);
router.post('/cookie-consent', cookieConsentController.saveConsent);
router.delete('/cookie-consent', cookieConsentController.deleteConsent);

// Optional: Get consent history
router.get('/cookie-consent/history', cookieConsentController.getConsentHistory);

module.exports = router;
```

#### Laravel:
```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/cookie-consent', [CookieConsentController::class, 'getConsent']);
    Route::post('/cookie-consent', [CookieConsentController::class, 'saveConsent']);
    Route::delete('/cookie-consent', [CookieConsentController::class, 'deleteConsent']);
    
    // Optional: Get consent history
    Route::get('/cookie-consent/history', [CookieConsentController::class, 'getHistory']);
});
```

### 2.2 Controller Implementation

#### Node.js/Express Controller:
```javascript
// controllers/cookieConsentController.js
const CookieConsent = require('../models/CookieConsent');

class CookieConsentController {
  // GET /api/cookie-consent
  async getConsent(req, res) {
    try {
      const userId = req.user.id;
      
      const consent = await CookieConsent.findOne({ userId });
      
      if (!consent) {
        return res.json({
          success: true,
          data: null,
          message: 'No consent found for user'
        });
      }
      
      res.json({
        success: true,
        data: {
          consent: consent.consent
        }
      });
    } catch (error) {
      console.error('Error fetching cookie consent:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // POST /api/cookie-consent
  async saveConsent(req, res) {
    try {
      const userId = req.user.id;
      const { consent } = req.body;
      
      // Validation
      if (!consent || typeof consent !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid consent data'
        });
      }

      // Ensure necessary is always true
      consent.necessary = true;
      
      const consentData = {
        userId,
        consent: {
          ...consent,
          timestamp: new Date(),
          version: '1.0'
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        updatedAt: new Date()
      };
      
      const result = await CookieConsent.findOneAndUpdate(
        { userId },
        consentData,
        { upsert: true, new: true, runValidators: true }
      );
      
      res.json({
        success: true,
        message: 'Cookie consent saved successfully',
        data: { consent: result.consent }
      });
    } catch (error) {
      console.error('Error saving cookie consent:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // DELETE /api/cookie-consent
  async deleteConsent(req, res) {
    try {
      const userId = req.user.id;
      
      const result = await CookieConsent.findOneAndDelete({ userId });
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'No consent found to delete'
        });
      }
      
      res.json({
        success: true,
        message: 'Cookie consent withdrawn successfully'
      });
    } catch (error) {
      console.error('Error deleting cookie consent:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Optional: GET /api/cookie-consent/history
  async getConsentHistory(req, res) {
    try {
      const userId = req.user.id;
      
      // If using audit table, fetch from there
      const history = await CookieConsent.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10);
      
      res.json({
        success: true,
        data: { history }
      });
    } catch (error) {
      console.error('Error fetching consent history:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new CookieConsentController();
```

#### Laravel Controller:
```php
<?php
// app/Http/Controllers/Api/CookieConsentController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CookieConsent;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class CookieConsentController extends Controller
{
    public function getConsent(Request $request): JsonResponse
    {
        try {
            $consent = CookieConsent::where('user_id', $request->user()->id)->first();
            
            if (!$consent) {
                return response()->json([
                    'success' => true,
                    'data' => null,
                    'message' => 'No consent found for user'
                ]);
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'consent' => [
                        'necessary' => $consent->necessary,
                        'analytics' => $consent->analytics,
                        'marketing' => $consent->marketing,
                        'preferences' => $consent->preferences,
                        'timestamp' => $consent->consent_timestamp,
                        'version' => $consent->version
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching cookie consent: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    public function saveConsent(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'consent' => 'required|array',
                'consent.necessary' => 'boolean',
                'consent.analytics' => 'boolean',
                'consent.marketing' => 'boolean',
                'consent.preferences' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $consentData = $request->input('consent');
            
            $consent = CookieConsent::updateOrCreate(
                ['user_id' => $request->user()->id],
                [
                    'necessary' => true, // Always true
                    'analytics' => $consentData['analytics'] ?? false,
                    'marketing' => $consentData['marketing'] ?? false,
                    'preferences' => $consentData['preferences'] ?? false,
                    'consent_timestamp' => now(),
                    'version' => '1.0',
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Cookie consent saved successfully',
                'data' => [
                    'consent' => [
                        'necessary' => $consent->necessary,
                        'analytics' => $consent->analytics,
                        'marketing' => $consent->marketing,
                        'preferences' => $consent->preferences,
                        'timestamp' => $consent->consent_timestamp,
                        'version' => $consent->version
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error saving cookie consent: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    public function deleteConsent(Request $request): JsonResponse
    {
        try {
            $deleted = CookieConsent::where('user_id', $request->user()->id)->delete();
            
            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'No consent found to delete'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Cookie consent withdrawn successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error deleting cookie consent: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    public function getHistory(Request $request): JsonResponse
    {
        try {
            // If you implement audit trail, fetch from audit table
            $history = CookieConsent::where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => ['history' => $history]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching consent history: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }
}
```

---

## 🔒 Phase 3: Security & Validation (Day 2 - Morning)

### 3.1 Request Validation

#### Node.js with Joi:
```javascript
// validation/cookieConsentValidation.js
const Joi = require('joi');

const saveConsentSchema = Joi.object({
  consent: Joi.object({
    necessary: Joi.boolean().default(true),
    analytics: Joi.boolean().required(),
    marketing: Joi.boolean().required(),
    preferences: Joi.boolean().required(),
    timestamp: Joi.date().optional(),
    version: Joi.string().optional()
  }).required()
});

const validateSaveConsent = (req, res, next) => {
  const { error } = saveConsentSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details
    });
  }
  
  next();
};

module.exports = { validateSaveConsent };
```

### 3.2 Rate Limiting

```javascript
// middleware/rateLimiting.js
const rateLimit = require('express-rate-limit');

const cookieConsentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each user to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { cookieConsentLimiter };
```

### 3.3 Input Sanitization

```javascript
// middleware/sanitization.js
const xss = require('xss');

const sanitizeConsentData = (req, res, next) => {
  if (req.body.consent) {
    // Sanitize any string values
    Object.keys(req.body.consent).forEach(key => {
      if (typeof req.body.consent[key] === 'string') {
        req.body.consent[key] = xss(req.body.consent[key]);
      }
    });
  }
  next();
};

module.exports = { sanitizeConsentData };
```

---

## 📊 Phase 4: Logging & Monitoring (Day 2 - Afternoon)

### 4.1 Audit Logging

```javascript
// utils/auditLogger.js
const winston = require('winston');

const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/cookie-consent-audit.log' })
  ]
});

const logConsentAction = (action, userId, consentData, ipAddress) => {
  auditLogger.info({
    action,
    userId,
    consentData,
    ipAddress,
    timestamp: new Date().toISOString()
  });
};

module.exports = { logConsentAction };
```

### 4.2 Performance Monitoring

```javascript
// middleware/performance.js
const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`Cookie consent API ${req.method} ${req.path}: ${duration}ms`);
    
    // Log slow queries (over 500ms)
    if (duration > 500) {
      console.warn(`Slow cookie consent query: ${duration}ms`);
    }
  });
  
  next();
};

module.exports = { performanceMonitor };
```

---

## 🧪 Phase 5: Testing (Day 3)

### 5.1 Unit Tests

```javascript
// tests/cookieConsent.test.js
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const CookieConsent = require('../models/CookieConsent');

describe('Cookie Consent API', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    // Setup test user and auth token
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123'
    });
    userId = user._id;
    authToken = generateTestToken(user);
  });

  afterEach(async () => {
    await CookieConsent.deleteMany({});
    await User.deleteMany({});
  });

  describe('GET /api/cookie-consent', () => {
    it('should return null when no consent exists', async () => {
      const response = await request(app)
        .get('/api/cookie-consent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe(null);
    });

    it('should return existing consent', async () => {
      await CookieConsent.create({
        userId,
        consent: {
          necessary: true,
          analytics: true,
          marketing: false,
          preferences: true
        }
      });

      const response = await request(app)
        .get('/api/cookie-consent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.consent.analytics).toBe(true);
    });
  });

  describe('POST /api/cookie-consent', () => {
    it('should save new consent', async () => {
      const consentData = {
        consent: {
          necessary: true,
          analytics: true,
          marketing: false,
          preferences: true
        }
      };

      const response = await request(app)
        .post('/api/cookie-consent')
        .set('Authorization', `Bearer ${authToken}`)
        .send(consentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Cookie consent saved successfully');
    });

    it('should reject invalid consent data', async () => {
      const invalidData = {
        consent: {
          analytics: 'invalid_boolean'
        }
      };

      await request(app)
        .post('/api/cookie-consent')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('DELETE /api/cookie-consent', () => {
    it('should delete existing consent', async () => {
      await CookieConsent.create({
        userId,
        consent: { necessary: true, analytics: true }
      });

      const response = await request(app)
        .delete('/api/cookie-consent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Cookie consent withdrawn successfully');
    });
  });
});
```

### 5.2 Integration Test Checklist

```bash
# Manual testing checklist

✅ Test unauthenticated requests (should return 401)
✅ Test with valid consent data
✅ Test with invalid consent data
✅ Test consent retrieval for new user
✅ Test consent update for existing user
✅ Test consent deletion
✅ Test rate limiting
✅ Test with malicious input (XSS attempts)
✅ Test database constraints
✅ Test concurrent requests
```

---

## 🚀 Phase 6: Deployment (Day 3 - Final)

### 6.1 Environment Variables

```bash
# Add to .env file
DB_CONNECTION=mongodb://localhost:27017/your_db
# or
DB_CONNECTION=postgresql://user:pass@localhost:5432/your_db

# Optional: Rate limiting settings
COOKIE_CONSENT_RATE_LIMIT=10
COOKIE_CONSENT_RATE_WINDOW=900000

# Logging
LOG_LEVEL=info
AUDIT_LOG_PATH=/var/log/cookie-consent-audit.log
```

### 6.2 Database Indexes (Production)

```javascript
// Production index creation
db.cookieconsents.createIndex({ "userId": 1 }, { unique: true })
db.cookieconsents.createIndex({ "consent.timestamp": -1 })
db.cookieconsents.createIndex({ "createdAt": -1 })
```

### 6.3 Monitoring Setup

```javascript
// health-check endpoint
app.get('/api/health/cookie-consent', async (req, res) => {
  try {
    // Test database connection
    await CookieConsent.findOne().limit(1);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'cookie-consent-api'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

---

## 📋 Final Checklist

### Pre-deployment:
- [ ] Database migration completed
- [ ] All unit tests passing
- [ ] Integration tests completed
- [ ] Security validations in place
- [ ] Rate limiting configured
- [ ] Logging and monitoring setup
- [ ] Environment variables configured
- [ ] Performance optimization done

### Post-deployment:
- [ ] Health check endpoint responding
- [ ] Frontend integration tested
- [ ] Rate limiting tested in production
- [ ] Audit logs being generated
- [ ] Database performance monitored
- [ ] Error alerts configured

### Documentation:
- [ ] API documentation updated
- [ ] Database schema documented
- [ ] Deployment guide created
- [ ] Troubleshooting guide prepared

---

## 🆘 Troubleshooting Guide

### Common Issues:

1. **Database Connection Issues**
   ```bash
   # Check connection
   # MongoDB: mongosh "mongodb://localhost:27017/your_db"
   # PostgreSQL: psql -h localhost -U username -d database_name
   ```

2. **Authentication Middleware Errors**
   ```javascript
   // Ensure auth middleware provides req.user.id
   console.log('User ID:', req.user.id);
   ```

3. **CORS Issues**
   ```javascript
   // Ensure CORS is configured for your frontend domain
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true
   }));
   ```

4. **Rate Limiting Too Strict**
   ```javascript
   // Adjust rate limiting if needed
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 20 // Increase limit
   });
   ```

---

## 📞 Support Contacts

- **Database Issues**: DBA Team
- **Authentication Issues**: Auth Team  
- **Frontend Integration**: Frontend Team
- **Production Deployment**: DevOps Team

**Estimated Total Implementation Time**: 2-3 days
**Priority Level**: High (Legal Compliance) 