# Backend Quick Reference - Doctor Profiles

## 🚨 CRITICAL CHANGES NEEDED

### 1. **Add Slug Field to Doctor Model**
```javascript
// Add to existing Doctor schema
slug: {
  type: String,
  unique: true,
  required: true,
  index: true
}
```

### 2. **New API Endpoint Required**
```javascript
// GET /docs/profile/slug/:slug
// Must return doctor data for SEO optimization
```

### 3. **Update Existing GET /docs Endpoint**
```javascript
// Include 'slug' field in all doctor responses
```

---

## 📋 MINIMUM VIABLE IMPLEMENTATION

### Step 1: Add Slug Field
```javascript
// In your Doctor model/schema
slug: { type: String, unique: true, index: true }
```

### Step 2: Create Migration Script
```javascript
// Generate slugs for existing doctors
// Format: "jan-kowalski" from "Jan Kowalski"
```

### Step 3: New API Endpoint
```javascript
// GET /docs/profile/slug/jan-kowalski
// Response format:
{
  "success": true,
  "data": {
    "name": { "first": "Jan", "last": "Kowalski" },
    "specializations": [{ "name": "Chirurgia" }],
    "experience": 15,
    "image": "https://...",
    "slug": "jan-kowalski"
  }
}
```

---

## 🔧 REQUIRED FIELDS FOR SEO

Your API must return these fields:
- `name.first` and `name.last`
- `specializations` (array)
- `experience` (number)
- `image` (URL)
- `slug` (unique identifier)
- `bio` (optional)
- `onlineConsultationPrice` (optional)
- `offlineConsultationPrice` (optional)

---

## 🧪 TESTING COMMANDS

```bash
# Test the new endpoint
curl "https://backend.centrummedyczne7.pl/docs/profile/slug/jan-kowalski"

# Test existing endpoint includes slugs
curl "https://backend.centrummedyczne7.pl/docs"
```

---

## ⚡ IMPLEMENTATION ORDER

1. **Add slug field** to Doctor model
2. **Run migration** to generate slugs for existing doctors
3. **Create new endpoint** `/docs/profile/slug/:slug`
4. **Update existing endpoint** to include slugs
5. **Test both endpoints**

---

## 🔍 SLUG GENERATION LOGIC

```javascript
// Example slug generation:
"Jan Kowalski" → "jan-kowalski"
"Anna Nowak-Kowalska" → "anna-nowak-kowalska"
"Dr. Michał Szymański" → "michal-szymanski"
```

**Polish Characters Mapping:**
- ą → a, ć → c, ę → e, ł → l, ń → n, ó → o, ś → s, ź → z, ż → z

---

## ❓ QUESTIONS TO ANSWER

1. **What's your current Doctor model structure?**
2. **Do you use Mongoose or another ORM?**
3. **How do you handle specializations? (separate collection?)**
4. **When can you implement these changes?**

---

## 🎯 SUCCESS CRITERIA

✅ **Frontend can fetch doctor by slug:**
```
GET /docs/profile/slug/jan-kowalski → returns doctor data
```

✅ **SEO server can build meta tags:**
```
server.js receives doctor data → generates SEO HTML
```

✅ **Sitemap includes doctor profiles:**
```
GET /docs → returns all doctors with slugs
```

---

**Priority:** HIGH - Required for SEO optimization to work! 