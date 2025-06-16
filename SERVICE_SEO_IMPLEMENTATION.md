# Service SEO Implementation - Dynamic Metadata for `/uslugi` Routes

## 🎯 What We've Implemented

You now have **complete dynamic SEO metadata** for your services, just like `/aktualnosci`! Here's what's working:

### ✅ Features Added:

1. **Server-Side Dynamic Fetching** - Fetches service data from API for SEO
2. **Frontend SEO Data Injection** - Adds service data to DOM for crawlers
3. **Google Analytics Tracking** - Enhanced service view tracking
4. **Improved Meta Tags** - Dynamic titles, descriptions, and images

## 🔧 Technical Implementation

### 1. Server-Side Changes (`server.js`)

**Dynamic Data Fetching:**
```javascript
// Now handles /uslugi/ routes
if (path.startsWith('/uslugi/')) {
  slug = path.replace('/uslugi/', '');
  endpoint = `${API_BASE_URL}/services/slug/${slug}`;
}
```

**Enhanced SEO HTML Generation:**
```javascript
// Uses real service data for metadata
if (dynamicData && dynamicData.title && dynamicData.shortDescription) {
  title = `${dynamicData.title} – Centrum Medyczne 7 Skarżysko-Kamienna`;
  description = dynamicData?.shortDescription || dynamicData?.description;
  keywords = `usługi medyczne, centrum medyczne 7, ${dynamicData.title}`;
  ogImage = (dynamicData.images && dynamicData.images[0]) || '/images/uslugi.jpg';
}
```

### 2. Frontend Changes (`ServicesDetailPage.jsx`)

**Dynamic Service Loading:**
```javascript
useEffect(() => {
  if (services.length > 0) {
    const foundService = services.find((s) => 
      generateServiceSlug(s.title) === service || s.title === service
    );
    setCurrentService(foundService);
    
    if (foundService) {
      // Add service data to DOM for SEO
      const pageData = {
        title: foundService.title,
        shortDescription: foundService.shortDescription,
        description: foundService.description,
        price: foundService.price,
        image: foundService.images?.[0],
        type: 'service'
      };
      // ... inject into DOM
    }
  }
}, [services, service]);
```

### 3. Analytics Enhancement (`GoogleAnalytics.jsx`)

**Service-Specific Tracking:**
```javascript
const trackServiceView = (serviceName, servicePrice, serviceCategory) => {
  trackEvent('service_view', {
    service_name: serviceName,
    service_price: servicePrice,
    service_category: serviceCategory,
    event_category: 'service',
    event_label: 'service_page_view'
  });
};

const trackServiceInquiry = (serviceName, servicePrice) => {
  trackEvent('service_inquiry', {
    service_name: serviceName,
    service_price: servicePrice,
    event_category: 'service',
    event_label: 'service_inquiry_interest'
  });
};
```

## 🔍 How It Works

### For Search Engine Crawlers:
1. **User/Bot visits** `/uslugi/chirurgia-plastyczna`
2. **Server fetches** service data from `${API_BASE_URL}/services/slug/chirurgia-plastyczna`
3. **Dynamic HTML generated** with:
   - Title: "Chirurgia plastyczna – Centrum Medyczne 7 Skarżysko-Kamienna"
   - Description: Real service description from database
   - OG Image: Service's actual image
   - Keywords: Service-specific keywords

### For Regular Users:
1. **React app loads** normally
2. **Service data fetched** from context
3. **Meta tags updated** dynamically in browser
4. **Analytics tracked** when user views service
5. **SEO data injected** into DOM for future crawl consistency

## 📊 Analytics Tracking

### Automatic Tracking:
- ✅ Service page views with price and category
- ✅ Service inquiry events (when user shows interest)
- ✅ User journey through service pages

### Example Usage:
```javascript
// Automatic tracking when service page loads
trackServiceView('Chirurgia plastyczna', '500', 'medical_service');

// Manual tracking for inquiries
const handleInquiryClick = () => {
  trackServiceInquiry('Chirurgia plastyczna', '500');
  // Your inquiry logic
};
```

## 🚀 What You Get

### SEO Benefits:
- **Individual service pages** are fully optimized for search engines
- **Dynamic meta descriptions** based on actual service content  
- **Service-specific keywords** automatically generated
- **Rich snippets potential** with structured data (price, description)
- **Social media optimization** with proper OG tags and images

### Analytics Benefits:
- **Service performance tracking** - which services are most viewed
- **Price point analysis** - correlation between price and interest
- **User journey mapping** - how users navigate through services
- **Conversion tracking** - from service view to inquiry/booking

## 📝 Example Service URLs

Now these URLs will have dynamic, SEO-optimized metadata:

- `/uslugi/chirurgia-plastyczna` → "Chirurgia plastyczna – Centrum Medyczne 7..."
- `/uslugi/konsultacja-kardiologiczna` → "Konsultacja kardiologiczna – Centrum Medyczne 7..."
- `/uslugi/neurologia-dziecieca` → "Neurologia dziecięca – Centrum Medyczne 7..."

Each will have:
- ✅ Service-specific title and description
- ✅ Actual service image as OG image
- ✅ Service price in structured data
- ✅ Analytics tracking enabled

## 🔧 API Endpoint Required

Make sure your backend supports:
```
GET ${API_BASE_URL}/services/slug/{service-slug}
```

**Expected Response:**
```json
{
  "title": "Chirurgia plastyczna",
  "shortDescription": "Profesjonalne zabiegi chirurgii plastycznej...",
  "description": "Szczegółowy opis usługi...",
  "price": "500",
  "images": ["/images/service1.jpg"],
  "bulletPoints": ["Punkt 1", "Punkt 2"]
}
```

## ✅ Testing

### 1. SEO Testing:
```bash
# Test with curl (simulating Googlebot)
curl -H "User-Agent: Googlebot" https://yoursite.com/uslugi/chirurgia-plastyczna

# Should return HTML with service-specific meta tags
```

### 2. Analytics Testing:
```javascript
// Open browser console on service page
console.log('📊 Service view should be tracked automatically');

// Check Google Analytics Real-time events
// Look for 'service_view' events with service details
```

### 3. Frontend Testing:
```javascript
// Check if service data is in DOM
console.log(document.querySelector('script[data-page-data]'));
// Should contain service information
```

## 🎉 Result

Your `/uslugi` routes now have the **same dynamic SEO capabilities as `/aktualnosci`**:

- ✅ **Server-side rendering** with real service data
- ✅ **Dynamic meta tags** for each service
- ✅ **Analytics tracking** for service performance
- ✅ **Social media optimization** with service images
- ✅ **Search engine optimization** with service-specific content

Each service page is now a **powerful SEO asset** that will rank well in search results! 🚀 