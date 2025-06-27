/**
 * Script to test dynamic sitemap generation and validate URLs
 * Run this to test your sitemap before deploying
 */

const axios = require('axios');

// Configuration
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

async function testSitemap() {
  try {
    console.log('🗺️ Testing dynamic sitemap generation...\n');
    
    // Test sitemap endpoint
    const response = await axios.get(`${SITE_URL}/sitemap.xml`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    });
    
    console.log(`✅ Sitemap responded with status: ${response.status}`);
    console.log(`📄 Content-Type: ${response.headers['content-type']}`);
    console.log(`💾 Content length: ${response.data.length} characters\n`);
    
    // Parse the sitemap content
    const sitemapContent = response.data;
    
    // Count URLs
    const urlMatches = sitemapContent.match(/<loc>([^<]+)<\/loc>/g);
    const urlCount = urlMatches ? urlMatches.length : 0;
    
    console.log(`🔗 Total URLs in sitemap: ${urlCount}\n`);
    
    // Extract and validate URLs
    const urls = urlMatches ? urlMatches.map(match => match.replace(/<\/?loc>/g, '')) : [];
    
    // Check for problematic URLs
    const problematicUrls = urls.filter(url => 
      url.includes('undefined') || 
      url.includes('tel:') || 
      url.includes('mailto:') ||
      url.includes('null')
    );
    
    if (problematicUrls.length > 0) {
      console.log('🚨 PROBLEMATIC URLs FOUND:');
      problematicUrls.forEach(url => console.log(`   ❌ ${url}`));
      console.log('');
    } else {
      console.log('✅ No problematic URLs found\n');
    }
    
    // Group URLs by type
    const staticUrls = urls.filter(url => {
      const path = url.replace('https://centrummedyczne7.pl', '');
      return ['/', '/o-nas', '/lekarze', '/uslugi', '/aktualnosci', '/poradnik', '/kontakt'].includes(path);
    });
    
    const newsUrls = urls.filter(url => url.includes('/aktualnosci/') && !url.endsWith('/aktualnosci'));
    const blogUrls = urls.filter(url => url.includes('/poradnik/') && !url.endsWith('/poradnik'));
    const serviceUrls = urls.filter(url => url.includes('/uslugi/') && !url.endsWith('/uslugi'));
    
    console.log('📊 URL BREAKDOWN:');
    console.log(`   📄 Static pages: ${staticUrls.length}`);
    console.log(`   📰 News articles: ${newsUrls.length}`);
    console.log(`   📝 Blog articles: ${blogUrls.length}`);
    console.log(`   🏥 Services: ${serviceUrls.length}`);
    console.log('');
    
    // Show sample URLs
    if (newsUrls.length > 0) {
      console.log('📰 SAMPLE NEWS URLs:');
      newsUrls.slice(0, 3).forEach(url => console.log(`   ${url}`));
      if (newsUrls.length > 3) console.log(`   ... and ${newsUrls.length - 3} more`);
      console.log('');
    }
    
    if (blogUrls.length > 0) {
      console.log('📝 SAMPLE BLOG URLs:');
      blogUrls.slice(0, 3).forEach(url => console.log(`   ${url}`));
      if (blogUrls.length > 3) console.log(`   ... and ${blogUrls.length - 3} more`);
      console.log('');
    }
    
    // Validate XML structure
    const hasXmlDeclaration = sitemapContent.startsWith('<?xml');
    const hasUrlset = sitemapContent.includes('<urlset');
    const hasClosingUrlset = sitemapContent.includes('</urlset>');
    
    console.log('🔍 XML VALIDATION:');
    console.log(`   ${hasXmlDeclaration ? '✅' : '❌'} XML declaration`);
    console.log(`   ${hasUrlset ? '✅' : '❌'} Urlset opening tag`);
    console.log(`   ${hasClosingUrlset ? '✅' : '❌'} Urlset closing tag`);
    console.log('');
    
    // Test a few URLs to make sure they're accessible
    console.log('🌐 TESTING URL ACCESSIBILITY:');
    const urlsToTest = [
      'https://centrummedyczne7.pl/',
      'https://centrummedyczne7.pl/aktualnosci',
      ...newsUrls.slice(0, 2),
      ...blogUrls.slice(0, 1)
    ].filter(Boolean);
    
    for (const url of urlsToTest.slice(0, 5)) {
      try {
        const testResponse = await axios.head(url, { timeout: 5000 });
        console.log(`   ✅ ${url} (${testResponse.status})`);
      } catch (error) {
        console.log(`   ❌ ${url} (${error.response?.status || 'Error'})`);
      }
    }
    
    console.log('\n🎉 Sitemap testing completed!');
    
    if (problematicUrls.length === 0 && hasXmlDeclaration && hasUrlset && hasClosingUrlset) {
      console.log('✅ Sitemap is ready for submission to search engines');
    } else {
      console.log('⚠️ Please fix the issues above before submitting to search engines');
    }
    
  } catch (error) {
    console.error('❌ Error testing sitemap:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response: ${error.response.data?.substring(0, 200)}...`);
    }
  }
}

// Test for tel: and mailto: URL handling
async function testExternalProtocolHandling() {
  console.log('\n🔗 Testing external protocol URL handling...\n');
  
  const testUrls = [
    '/tel:+48797097487',
    '/mailto:kontakt@centrummedyczne7.pl',
    '/some/path/tel:123456',
    '/aktualnosci/undefined',
    '/poradnik/undefined'
  ];
  
  for (const testPath of testUrls) {
    try {
      const testUrl = `${SITE_URL}${testPath}`;
      const response = await axios.get(testUrl, { 
        timeout: 3000,
        validateStatus: () => true // Don't throw on error status codes
      });
      
      if (response.status === 404) {
        console.log(`   ✅ ${testPath} → 404 (correctly blocked)`);
      } else if (response.status === 301 || response.status === 302) {
        console.log(`   ✅ ${testPath} → ${response.status} (redirected to ${response.headers.location})`);
      } else {
        console.log(`   ⚠️ ${testPath} → ${response.status} (unexpected)`);
      }
    } catch (error) {
      console.log(`   ❌ ${testPath} → Error: ${error.message}`);
    }
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting sitemap and URL validation tests...\n');
  
  await testSitemap();
  await testExternalProtocolHandling();
  
  console.log('\n🏁 All tests completed!');
  console.log('\nNext steps:');
  console.log('1. Fix any issues found above');
  console.log('2. Test the sitemap in production');
  console.log('3. Submit the updated sitemap to Google Search Console');
  console.log('4. Monitor GSC for any crawl errors');
}

// Run the tests
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 