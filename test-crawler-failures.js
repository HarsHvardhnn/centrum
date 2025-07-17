// Test script to simulate crawler conditions
const puppeteer = require('puppeteer');

async function testCrawlerConditions() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Simulate slow network
  await page.setCacheEnabled(false);
  
  // Block API calls to simulate failures
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    if (request.url().includes('/api/') || request.url().includes('backend.centrummedyczne7.pl')) {
      // Block API calls to simulate failures
      request.abort();
    } else {
      request.continue();
    }
  });

  // Navigate to your site
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Check for JavaScript errors
  const errors = await page.evaluate(() => {
    return window.errors || [];
  });

  console.log('JavaScript errors found:', errors);

  // Take screenshot
  await page.screenshot({ path: 'crawler-test-result.png' });

  await browser.close();
}

testCrawlerConditions().catch(console.error); 