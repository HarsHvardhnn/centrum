const https = require('https');

const testSEO = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Extract meta tags
        const title = data.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || 'Not found';
        const description = data.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)?.[1] || 'Not found';
        const ogImage = data.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i)?.[1] || 'Not found';
        const canonical = data.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/i)?.[1] || 'Not found';
        
        resolve({
          url,
          title,
          description,
          ogImage,
          canonical,
          hasStructuredData: data.includes('application/ld+json')
        });
      });
    }).on('error', reject);
  });
};

const urls = [
  'https://centrummedyczne7.pl/',
  'https://centrummedyczne7.pl/o-nas',
  'https://centrummedyczne7.pl/uslugi',
  'https://centrummedyczne7.pl/lekarze',
  'https://centrummedyczne7.pl/kontakt'
];

console.log('🔍 Testing SEO for Centrum Medyczne 7...\n');

Promise.all(urls.map(testSEO))
  .then(results => {
    results.forEach(result => {
      console.log(`📄 ${result.url}`);
      console.log(`   Title: ${result.title}`);
      console.log(`   Description: ${result.description.substring(0, 100)}...`);
      console.log(`   OG Image: ${result.ogImage}`);
      console.log(`   Canonical: ${result.canonical}`);
      console.log(`   Structured Data: ${result.hasStructuredData ? '✅' : '❌'}`);
      console.log('');
    });
  })
  .catch(err => {
    console.error('Error testing SEO:', err.message);
  }); 