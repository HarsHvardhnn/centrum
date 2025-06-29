# Doctor Profile Pages - Backend Implementation Guide

## Overview
This document outlines the backend changes required to support individual doctor profile pages with SEO optimization at URLs like: `https://centrummedyczne7.pl/lekarze/jan-kowalski`

## Required Backend Changes

### 1. Doctor Model/Schema Updates

Add the following fields to your Doctor model:

```javascript
// Additional fields needed in Doctor schema
{
  slug: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  bio: {
    type: String,
    default: ""
  },
  education: {
    type: String,
    default: ""
  },
  onlineConsultationPrice: {
    type: Number,
    default: undefined
  },
  offlineConsultationPrice: {
    type: Number,
    default: undefined
  },
  // Existing fields that should be present:
  name: {
    first: String,
    last: String
  },
  specializations: [{
    name: String,
    description: String
  }],
  experience: Number,
  image: String
}
```

### 2. Slug Generation Function

Create a utility function to generate URL-friendly slugs:

```javascript
// utils/slugGenerator.js
function generateSlug(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    // Replace Polish characters
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z')
    // Replace special characters and spaces with dashes
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing dashes
    .replace(/^-+|-+$/g, '')
    // Replace multiple consecutive dashes with single dash
    .replace(/-+/g, '-');
}

function generateDoctorSlug(doctor) {
  const firstName = doctor.name?.first || '';
  const lastName = doctor.name?.last || '';
  const fullName = `${firstName} ${lastName}`.trim();
  return generateSlug(fullName);
}

// Ensure unique slug
async function generateUniqueSlug(doctor, DoctorModel) {
  let baseSlug = generateDoctorSlug(doctor);
  let slug = baseSlug;
  let counter = 1;
  
  while (await DoctorModel.findOne({ slug, _id: { $ne: doctor._id } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

module.exports = { generateSlug, generateDoctorSlug, generateUniqueSlug };
```

### 3. Database Migration Script

Create a script to generate slugs for existing doctors:

```javascript
// migrations/add-doctor-slugs.js
const Doctor = require('../models/Doctor'); // Adjust path as needed
const { generateUniqueSlug } = require('../utils/slugGenerator');

async function addSlugsToExistingDoctors() {
  try {
    console.log('🔄 Starting slug generation for existing doctors...');
    
    const doctors = await Doctor.find({ slug: { $exists: false } });
    console.log(`📋 Found ${doctors.length} doctors without slugs`);
    
    for (const doctor of doctors) {
      const slug = await generateUniqueSlug(doctor, Doctor);
      await Doctor.findByIdAndUpdate(doctor._id, { slug });
      console.log(`✅ Generated slug for ${doctor.name.first} ${doctor.name.last}: ${slug}`);
    }
    
    console.log('🎉 Slug generation completed successfully!');
  } catch (error) {
    console.error('❌ Error generating slugs:', error);
  }
}

// Run the migration
addSlugsToExistingDoctors();
```

### 4. New API Endpoint

Create a new endpoint to fetch doctor by slug:

```javascript
// routes/doctors.js (or wherever your doctor routes are)

// GET /docs/profile/slug/:slug
router.get('/profile/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Validate slug
    if (!slug || slug.trim() === '' || slug === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Invalid slug provided'
      });
    }
    
    const doctor = await Doctor.findOne({ slug })
      .populate('specializations')
      .select('name specializations experience image bio education onlineConsultationPrice offlineConsultationPrice createdAt updatedAt slug');
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    res.json({
      success: true,
      data: doctor
    });
    
  } catch (error) {
    console.error('Error fetching doctor by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});
```

### 5. Update Existing Endpoints

Modify existing doctor endpoints to include slug in responses:

```javascript
// Update GET /docs endpoint to include slugs
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('specializations')
      .select('name specializations experience image slug onlineConsultationPrice offlineConsultationPrice');
    
    res.json({
      success: true,
      doctors: doctors
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});
```

### 6. Auto-Generate Slugs on Create/Update

Add middleware to automatically generate slugs:

```javascript
// In your Doctor model or controller

// Before saving (Mongoose pre-save hook)
doctorSchema.pre('save', async function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = await generateUniqueSlug(this, this.constructor);
  }
  next();
});

// Or in your controller when creating/updating doctors
const createDoctor = async (req, res) => {
  try {
    const doctorData = req.body;
    
    // Generate slug
    const tempDoctor = { name: doctorData.name };
    doctorData.slug = await generateUniqueSlug(tempDoctor, Doctor);
    
    const doctor = new Doctor(doctorData);
    await doctor.save();
    
    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    // Handle error
  }
};
```

### 7. Testing the Implementation

Test the new endpoint:

```bash
# Test fetching doctor by slug
curl -X GET "https://backend.centrummedyczne7.pl/docs/profile/slug/jan-kowalski"

# Expected response:
{
  "success": true,
  "data": {
    "_id": "...",
    "name": {
      "first": "Jan",
      "last": "Kowalski"
    },
    "specializations": [
      {
        "name": "Chirurgia ogólna",
        "description": "..."
      }
    ],
    "experience": 15,
    "image": "https://...",
    "bio": "Doświadczony chirurg...",
    "education": "Uniwersytet Medyczny...",
    "onlineConsultationPrice": 150,
    "offlineConsultationPrice": 200,
    "slug": "jan-kowalski"
  }
}
```

## Implementation Priority

1. **HIGH PRIORITY** - Add slug field to Doctor model
2. **HIGH PRIORITY** - Create slug generation utility
3. **HIGH PRIORITY** - Create migration script for existing doctors
4. **HIGH PRIORITY** - Create GET `/docs/profile/slug/:slug` endpoint
5. **MEDIUM PRIORITY** - Update existing endpoints to include slugs
6. **MEDIUM PRIORITY** - Add auto-slug generation on create/update
7. **LOW PRIORITY** - Add slug validation and uniqueness checks

## Database Indexes

Add database indexes for performance:

```javascript
// Add to your Doctor model
{
  slug: { type: String, unique: true, index: true }
}

// Or create index manually
db.doctors.createIndex({ "slug": 1 }, { unique: true })
```

## Error Handling

Handle common edge cases:

- **Empty/undefined slugs**: Return 400 Bad Request
- **Non-existent doctors**: Return 404 Not Found
- **Duplicate slugs**: Auto-append number (jan-kowalski-2)
- **Invalid characters**: Strip/replace with dashes

## SEO Considerations

Ensure the API returns all fields needed for SEO:
- Full name (first + last)
- Specializations array
- Experience in years
- High-quality image URL
- Bio/description
- Education background
- Consultation prices
- Creation/update timestamps

## Security Notes

- Validate slug format on input
- Sanitize slug generation to prevent injection
- Rate limit the profile endpoint
- Consider caching doctor profiles

---

**Questions for Backend Developer:**
1. Do you use Mongoose or another ODM/ORM?
2. What's your current Doctor model structure?
3. Do you have existing specializations as a separate collection?
4. What's your preferred approach for database migrations?
5. Should consultation prices be nullable or have default values? 