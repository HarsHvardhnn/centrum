import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'https://centrummedyczne7.pl';
const DIST_DIR = path.join(__dirname, '..', 'dist');
const lekarzeDir = path.join(DIST_DIR, 'lekarze');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset}  ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ️${colors.reset}  ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`)
};

const checkIndexing = async () => {
  try {
    log.section('🔍 Doctor Pages Indexing Checker');
    console.log(`Base URL: ${BASE_URL}\n`);

    // Check if index.json exists
    const indexJsonPath = path.join(lekarzeDir, 'index.json');
    if (!fs.existsSync(indexJsonPath)) {
      log.error('index.json not found. Please run: npm run build:static-doctors');
      process.exit(1);
    }

    // Read index.json to get all doctor slugs
    const indexData = JSON.parse(fs.readFileSync(indexJsonPath, 'utf8'));
    const slugs = indexData.slugs || [];

    if (slugs.length === 0) {
      log.warning('No doctor slugs found in index.json');
      process.exit(1);
    }

    log.info(`Found ${slugs.length} doctor pages to check\n`);

    const results = {
      total: slugs.length,
      accessible: 0,
      hasSeoContent: 0,
      hasStructuredData: 0,
      errors: []
    };

    // Check each doctor page
    for (let i = 0; i < slugs.length; i++) {
      const slug = slugs[i];
      const url = `${BASE_URL}/lekarze/${slug}`;
      
      process.stdout.write(`[${i + 1}/${slugs.length}] Checking ${slug}... `);

      try {
        // Check if page is accessible
        const response = await axios.get(url, {
          timeout: 10000,
          validateStatus: () => true, // Don't throw on any status
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
          }
        });

        if (response.status === 200) {
          results.accessible++;
          const html = response.data;

          // Check for SEO content
          const hasMetaTags = html.includes('<meta name="description"') && html.includes('<title>');
          const hasStructuredData = html.includes('"@type": "Physician"') || html.includes('"@type":"Physician"');
          const hasCanonical = html.includes('<link rel="canonical"');
          const hasOgTags = html.includes('og:title') && html.includes('og:description');

          if (hasMetaTags && hasCanonical && hasOgTags) {
            results.hasSeoContent++;
          }

          if (hasStructuredData) {
            results.hasStructuredData++;
          }

          // Determine status
          if (hasMetaTags && hasStructuredData && hasCanonical) {
            console.log(`${colors.green}OK${colors.reset} (SEO: ✅, Schema: ✅)`);
          } else if (hasMetaTags || hasStructuredData) {
            console.log(`${colors.yellow}PARTIAL${colors.reset} (SEO: ${hasMetaTags ? '✅' : '❌'}, Schema: ${hasStructuredData ? '✅' : '❌'})`);
            results.errors.push({
              slug,
              issue: 'Missing some SEO elements',
              hasMetaTags,
              hasStructuredData,
              hasCanonical
            });
          } else {
            console.log(`${colors.red}FAILED${colors.reset} (Missing SEO content)`);
            results.errors.push({
              slug,
              issue: 'Missing SEO content'
            });
          }
        } else {
          console.log(`${colors.red}FAILED${colors.reset} (Status: ${response.status})`);
          results.errors.push({
            slug,
            issue: `HTTP ${response.status}`
          });
        }
      } catch (error) {
        console.log(`${colors.red}ERROR${colors.reset} (${error.message})`);
        results.errors.push({
          slug,
          issue: error.message
        });
      }

      // Small delay to avoid overwhelming the server
      if (i < slugs.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Summary
    log.section('\n📊 Summary');
    console.log(`Total pages checked: ${results.total}`);
    log.success(`Accessible (200 OK): ${results.accessible}/${results.total}`);
    log.success(`Has SEO content: ${results.hasSeoContent}/${results.total}`);
    log.success(`Has structured data: ${results.hasStructuredData}/${results.total}`);

    if (results.errors.length > 0) {
      log.section('\n⚠️  Issues Found:');
      results.errors.forEach(err => {
        log.warning(`${err.slug}: ${err.issue}`);
      });
    }

    // Check Google Search Console indexing (manual verification needed)
    log.section('\n📋 Next Steps:');
    console.log('1. Verify in Google Search Console:');
    console.log(`   https://search.google.com/search-console`);
    console.log(`   Check: URL Inspection for each page`);
    console.log('\n2. Check if pages appear in Google search:');
    console.log(`   site:${BASE_URL}/lekarze/`);
    console.log('\n3. Test structured data:');
    console.log(`   https://search.google.com/test/rich-results`);
    console.log(`   Test URL: ${BASE_URL}/lekarze/${slugs[0]}`);

    // Generate report file
    const reportPath = path.join(__dirname, '..', 'indexing-report.json');
    const report = {
      checkedAt: new Date().toISOString(),
      baseUrl: BASE_URL,
      results
    };
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log.info(`\n📄 Detailed report saved to: indexing-report.json`);

    // Exit with appropriate code
    if (results.errors.length === 0 && results.accessible === results.total) {
      log.success('\n🎉 All pages are accessible and have proper SEO content!');
      process.exit(0);
    } else {
      process.exit(1);
    }

  } catch (error) {
    log.error(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

// Run if called directly
const filePath = fileURLToPath(import.meta.url);
const runPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (filePath === runPath || runPath.includes('check-indexing')) {
  checkIndexing();
}

export default checkIndexing;

