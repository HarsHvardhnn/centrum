/**
 * Diagnostic script to check for news articles with missing or invalid slugs
 * Run this to identify problematic news items in your database
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// Utility function to generate slug from title
const generateSlug = (title) => {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    // Replace Polish characters with ASCII equivalents
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z')
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-');
};

async function checkNewsItems() {
  try {
    console.log('🔍 Checking news items for missing or invalid slugs...\n');
    
    // Fetch all news items
    const response = await axios.get(`${API_BASE_URL}/news`);
    const newsItems = response.data;
    
    console.log(`📰 Found ${newsItems.length} news items\n`);
    
    let problematicItems = [];
    let validItems = 0;
    
    newsItems.forEach((item, index) => {
      const hasValidSlug = item.slug && item.slug.trim() !== '' && item.slug !== 'undefined';
      
      if (!hasValidSlug) {
        const suggestedSlug = generateSlug(item.title);
        problematicItems.push({
          id: item._id,
          title: item.title,
          currentSlug: item.slug,
          suggestedSlug: suggestedSlug,
          issue: !item.slug ? 'Missing slug' : 
                 item.slug === 'undefined' ? 'Undefined slug' : 
                 'Empty/invalid slug'
        });
      } else {
        validItems++;
      }
    });
    
    // Report results
    console.log(`✅ Valid items: ${validItems}`);
    console.log(`❌ Problematic items: ${problematicItems.length}\n`);
    
    if (problematicItems.length > 0) {
      console.log('🚨 PROBLEMATIC NEWS ITEMS:');
      console.log('=' .repeat(80));
      
      problematicItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title.substring(0, 50)}...`);
        console.log(`   ID: ${item.id}`);
        console.log(`   Issue: ${item.issue}`);
        console.log(`   Current slug: "${item.currentSlug}"`);
        console.log(`   Suggested slug: "${item.suggestedSlug}"`);
        console.log('   ' + '-'.repeat(60));
      });
      
      console.log('\n💡 RECOMMENDATIONS:');
      console.log('1. Update these news items in your database to include proper slugs');
      console.log('2. Use the suggested slugs or create your own SEO-friendly versions');
      console.log('3. After updating, test the URLs to ensure they work correctly');
      console.log('4. Submit updated sitemap to Google Search Console');
    } else {
      console.log('🎉 All news items have valid slugs!');
    }
    
  } catch (error) {
    console.error('❌ Error checking news items:', error.message);
    console.error('   Make sure your API server is running and accessible');
  }
}

// For blog/poradnik items
async function checkBlogItems() {
  try {
    console.log('\n🔍 Checking blog/poradnik items for missing or invalid slugs...\n');
    
    // Fetch all blog items
    const response = await axios.get(`${API_BASE_URL}/blogs`);
    const blogItems = response.data;
    
    console.log(`📝 Found ${blogItems.length} blog items\n`);
    
    let problematicItems = [];
    let validItems = 0;
    
    blogItems.forEach((item, index) => {
      const hasValidSlug = item.slug && item.slug.trim() !== '' && item.slug !== 'undefined';
      
      if (!hasValidSlug) {
        const suggestedSlug = generateSlug(item.title);
        problematicItems.push({
          id: item._id,
          title: item.title,
          currentSlug: item.slug,
          suggestedSlug: suggestedSlug,
          issue: !item.slug ? 'Missing slug' : 
                 item.slug === 'undefined' ? 'Undefined slug' : 
                 'Empty/invalid slug'
        });
      } else {
        validItems++;
      }
    });
    
    // Report results
    console.log(`✅ Valid items: ${validItems}`);
    console.log(`❌ Problematic items: ${problematicItems.length}\n`);
    
    if (problematicItems.length > 0) {
      console.log('🚨 PROBLEMATIC BLOG ITEMS:');
      console.log('=' .repeat(80));
      
      problematicItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title.substring(0, 50)}...`);
        console.log(`   ID: ${item.id}`);
        console.log(`   Issue: ${item.issue}`);
        console.log(`   Current slug: "${item.currentSlug}"`);
        console.log(`   Suggested slug: "${item.suggestedSlug}"`);
        console.log('   ' + '-'.repeat(60));
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking blog items:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting news/blog slug diagnostic...\n');
  
  await checkNewsItems();
  await checkBlogItems();
  
  console.log('\n🏁 Diagnostic complete!');
  console.log('\nNext steps:');
  console.log('1. Fix any problematic items found above');
  console.log('2. Test your fixes by visiting the URLs');
  console.log('3. Resubmit your sitemap to Google Search Console');
  console.log('4. Monitor for any new "undefined" URLs in GSC');
}

// Run the diagnostic
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 