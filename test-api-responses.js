import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = 'https://backend.centrummedyczne7.pl';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}📡 ${msg}${colors.reset}`),
  debug: (msg) => console.log(`${colors.cyan}🔍 ${msg}${colors.reset}`),
};

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  apiBaseUrl: API_BASE_URL,
  tests: []
};

// Function to analyze response structure
function analyzeResponseStructure(responseData, endpoint) {
  const analysis = {
    endpoint,
    status: 'success',
    structure: {
      type: typeof responseData,
      isArray: Array.isArray(responseData),
      isNull: responseData === null,
      isUndefined: responseData === undefined,
      keys: responseData && typeof responseData === 'object' ? Object.keys(responseData) : [],
      hasData: false,
      hasSuccess: false,
      hasNestedData: false,
      nestedStructure: null,
    },
    sampleData: null,
    recommendations: []
  };

  if (!responseData) {
    analysis.status = 'error';
    analysis.recommendations.push('Response is null or undefined');
    return analysis;
  }

  if (typeof responseData === 'object') {
    // Check for nested data structure
    if (responseData.data) {
      analysis.structure.hasData = true;
      analysis.structure.hasNestedData = true;
      analysis.structure.nestedStructure = {
        type: typeof responseData.data,
        isArray: Array.isArray(responseData.data),
        keys: typeof responseData.data === 'object' && responseData.data !== null 
          ? Object.keys(responseData.data) : []
      };
      analysis.sampleData = responseData.data;
    }

    // Check for success wrapper
    if (responseData.success !== undefined) {
      analysis.structure.hasSuccess = true;
    }

    // Sample the actual data
    if (responseData.data) {
      analysis.sampleData = responseData.data;
    } else {
      analysis.sampleData = responseData;
    }

    // Make recommendations
    if (analysis.structure.hasNestedData && analysis.structure.hasSuccess) {
      analysis.recommendations.push('Use: response.data.data (nested with success wrapper)');
    } else if (analysis.structure.hasNestedData) {
      analysis.recommendations.push('Use: response.data.data (nested structure)');
    } else {
      analysis.recommendations.push('Use: response.data (direct structure)');
    }
  }

  return analysis;
}

// Test function
async function testEndpoint(name, endpoint, options = {}) {
  log.info(`Testing: ${name}`);
  log.debug(`Endpoint: ${endpoint}`);
  
  const testResult = {
    name,
    endpoint,
    timestamp: new Date().toISOString(),
    success: false,
    error: null,
    response: null,
    analysis: null,
    statusCode: null,
    responseTime: null
  };

  const startTime = Date.now();

  try {
    const response = await axios.get(endpoint, {
      timeout: options.timeout || 10000,
      validateStatus: (status) => status < 500
    });

    testResult.responseTime = Date.now() - startTime;
    testResult.statusCode = response.status;
    testResult.response = response.data;
    testResult.analysis = analyzeResponseStructure(response.data, endpoint);

    if (response.status === 200) {
      testResult.success = true;
      log.success(`${name}: OK (${response.status}) - ${testResult.responseTime}ms`);
      
      // Log structure
      const struct = testResult.analysis.structure;
      log.debug(`  Type: ${struct.type}, IsArray: ${struct.isArray}`);
      log.debug(`  Keys: ${struct.keys.join(', ')}`);
      if (struct.hasNestedData) {
        log.debug(`  Nested Data Keys: ${struct.nestedStructure.keys.join(', ')}`);
      }
      
      if (testResult.analysis.recommendations.length > 0) {
        log.debug(`  Recommendation: ${testResult.analysis.recommendations[0]}`);
      }
    } else {
      testResult.success = false;
      testResult.error = `HTTP ${response.status}`;
      log.warning(`${name}: HTTP ${response.status}`);
    }

  } catch (error) {
    testResult.responseTime = Date.now() - startTime;
    testResult.success = false;
    
    if (error.response) {
      testResult.statusCode = error.response.status;
      testResult.error = `HTTP ${error.response.status}: ${error.response.statusText}`;
      testResult.response = error.response.data;
      log.error(`${name}: HTTP ${error.response.status} - ${error.message}`);
    } else if (error.request) {
      testResult.error = `Network Error: ${error.message}`;
      log.error(`${name}: Network Error - ${error.message}`);
    } else {
      testResult.error = `Error: ${error.message}`;
      log.error(`${name}: ${error.message}`);
    }
  }

  testResults.tests.push(testResult);
  return testResult;
}

// Main test function
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 API Response Structure Diagnostic Script');
  console.log('='.repeat(60) + '\n');

  log.info(`API Base URL: ${API_BASE_URL}\n`);

  // First, get lists to find actual slugs
  log.info('Step 1: Fetching lists to get actual slugs...\n');

  // Test 1: Get news list
  const newsListResult = await testEndpoint(
    'News List',
    `${API_BASE_URL}/news?isNews=true`,
    { timeout: 10000 }
  );
  let newsSlug = null;
  if (newsListResult.success && Array.isArray(newsListResult.response)) {
    newsSlug = newsListResult.response[0]?.slug;
  } else if (newsListResult.success && newsListResult.response?.data && Array.isArray(newsListResult.response.data)) {
    newsSlug = newsListResult.response.data[0]?.slug;
  }

  // Test 2: Get blog list
  const blogListResult = await testEndpoint(
    'Blog List',
    `${API_BASE_URL}/news?isNews=false`,
    { timeout: 10000 }
  );
  let blogSlug = null;
  if (blogListResult.success && Array.isArray(blogListResult.response)) {
    blogSlug = blogListResult.response[0]?.slug;
  } else if (blogListResult.success && blogListResult.response?.data && Array.isArray(blogListResult.response.data)) {
    blogSlug = blogListResult.response.data[0]?.slug;
  }

  // Test 3: Get services list
  const servicesListResult = await testEndpoint(
    'Services List',
    `${API_BASE_URL}/services`,
    { timeout: 10000 }
  );
  let serviceSlug = null;
  if (servicesListResult.success && Array.isArray(servicesListResult.response)) {
    serviceSlug = servicesListResult.response[0]?.slug;
  } else if (servicesListResult.success && servicesListResult.response?.data && Array.isArray(servicesListResult.response.data)) {
    serviceSlug = servicesListResult.response.data[0]?.slug;
  }

  // Test 4: Get doctors list
  const doctorsListResult = await testEndpoint(
    'Doctors List',
    `${API_BASE_URL}/docs`,
    { timeout: 10000 }
  );
  let doctorSlug = null;
  if (doctorsListResult.success) {
    // Try different response structures
    let doctors = [];
    if (Array.isArray(doctorsListResult.response)) {
      doctors = doctorsListResult.response;
    } else if (doctorsListResult.response?.doctors && Array.isArray(doctorsListResult.response.doctors)) {
      doctors = doctorsListResult.response.doctors;
    } else if (doctorsListResult.response?.data && Array.isArray(doctorsListResult.response.data)) {
      doctors = doctorsListResult.response.data;
    }
    if (doctors.length > 0) {
      doctorSlug = doctors[0]?.slug || doctors[0]?.name?.toLowerCase()?.replace(/\s+/g, '-');
    }
  }

  console.log('\n' + '-'.repeat(60));
  log.info('Step 2: Testing individual endpoints with slugs...\n');

  // Test individual endpoints
  if (newsSlug) {
    await testEndpoint(
      'News Article (by slug)',
      `${API_BASE_URL}/news/slug/${newsSlug}?isNews=true`,
      { timeout: 10000 }
    );
  } else {
    log.warning('Skipping news article test - no slug found');
  }

  if (blogSlug) {
    await testEndpoint(
      'Blog Article (by slug)',
      `${API_BASE_URL}/news/slug/${blogSlug}?isNews=false`,
      { timeout: 10000 }
    );
  } else {
    log.warning('Skipping blog article test - no slug found');
  }

  if (serviceSlug) {
    await testEndpoint(
      'Service (by slug)',
      `${API_BASE_URL}/services/slug/${serviceSlug}`,
      { timeout: 10000 }
    );
  } else {
    log.warning('Skipping service test - no slug found');
  }

  if (doctorSlug) {
    // Test all possible doctor endpoints
    await testEndpoint(
      'Doctor Profile (primary endpoint)',
      `${API_BASE_URL}/docs/profile/slug/${doctorSlug}`,
      { timeout: 10000 }
    );
    
    await testEndpoint(
      'Doctor Profile (alternative 1)',
      `${API_BASE_URL}/docs/slug/${doctorSlug}`,
      { timeout: 10000 }
    );
    
    await testEndpoint(
      'Doctor Profile (alternative 2)',
      `${API_BASE_URL}/doctors/slug/${doctorSlug}`,
      { timeout: 10000 }
    );
    
    await testEndpoint(
      'Doctor Profile (alternative 3)',
      `${API_BASE_URL}/doctor/slug/${doctorSlug}`,
      { timeout: 10000 }
    );
  } else {
    log.warning('Skipping doctor profile tests - no slug found');
  }

  // Save results to file
  const outputFile = path.join(__dirname, 'api-test-results.json');
  fs.writeFileSync(outputFile, JSON.stringify(testResults, null, 2));

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  
  const successful = testResults.tests.filter(t => t.success).length;
  const failed = testResults.tests.filter(t => !t.success).length;
  
  log.success(`Successful: ${successful}`);
  log.error(`Failed: ${failed}`);
  log.info(`Total: ${testResults.tests.length}`);
  
  console.log(`\n📄 Full results saved to: ${outputFile}\n`);

  // Print recommendations
  console.log('💡 Recommendations:\n');
  testResults.tests.forEach(test => {
    if (test.success && test.analysis && test.analysis.recommendations.length > 0) {
      console.log(`  ${test.name}:`);
      test.analysis.recommendations.forEach(rec => {
        console.log(`    - ${rec}`);
      });
      console.log('');
    }
  });

  // Find common structure patterns
  const structures = {};
  testResults.tests.forEach(test => {
    if (test.success && test.analysis) {
      const key = test.analysis.structure.hasNestedData 
        ? (test.analysis.structure.hasSuccess ? 'nested-with-success' : 'nested')
        : 'direct';
      if (!structures[key]) {
        structures[key] = [];
      }
      structures[key].push(test.name);
    }
  });

  if (Object.keys(structures).length > 0) {
    console.log('📦 Response Structure Patterns:\n');
    Object.entries(structures).forEach(([pattern, endpoints]) => {
      console.log(`  ${pattern}:`);
      endpoints.forEach(endpoint => {
        console.log(`    - ${endpoint}`);
      });
      console.log('');
    });
  }
}

// Run the tests
runAllTests().catch(error => {
  log.error(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});

