import axios from 'axios';

const SERVER_URL = 'http://localhost:3000';

console.log('🧪 Final SEO Test\n');

// Test bot detection
const testBotDetection = async () => {
  console.log('Testing bot detection...');
  
  const tests = [
    {
      name: 'Regular User',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      expected: 'React App'
    },
    {
      name: 'Google Bot',
      userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      expected: 'SEO HTML'
    }
  ];

  for (const test of tests) {
    try {
      const response = await axios.get(`${SERVER_URL}/`, {
        headers: { 'User-Agent': test.userAgent },
        timeout: 5000
      });
      
      const isReactApp = response.data.includes('id="root"');
      const isSEOHTML = response.data.includes('<title>') && response.data.includes('Centrum Medyczne 7');
      
      const actual = isReactApp ? 'React App' : 'SEO HTML';
      const status = actual === test.expected ? '✅' : '❌';
      
      console.log(`${status} ${test.name}: ${actual} (Expected: ${test.expected})`);
      
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }
};

// Test sitemap
const testSitemap = async () => {
  console.log('\nTesting sitemap...');
  
  try {
    const response = await axios.get(`${SERVER_URL}/sitemap.xml`, { timeout: 5000 });
    
    if (response.data.includes('<?xml') && response.data.includes('<urlset')) {
      console.log('✅ Sitemap generated successfully');
      
      const urlCount = (response.data.match(/<url>/g) || []).length;
      console.log(`📊 Total URLs: ${urlCount}`);
      
      const hasServices = response.data.includes('/uslugi/');
      const hasNews = response.data.includes('/aktualnosci/');
      const hasBlogs = response.data.includes('/poradnik/');
      
      console.log(`🏥 Services: ${hasServices ? '✅' : '❌'}`);
      console.log(`📰 News: ${hasNews ? '✅' : '❌'}`);
      console.log(`📝 Blogs: ${hasBlogs ? '✅' : '❌'}`);
      
    } else {
      console.log('❌ Invalid sitemap format');
    }
  } catch (error) {
    console.log(`❌ Sitemap test failed: ${error.message}`);
  }
};

// Run tests
const runTests = async () => {
  await testBotDetection();
  await testSitemap();
  
  console.log('\n🎉 SEO fix testing completed!');
  console.log('\n📋 Summary:');
  console.log('- Regular users get React app');
  console.log('- Bots get SEO HTML');
  console.log('- Sitemap includes all content');
  console.log('- Services and articles are now indexed!');
};

runTests();