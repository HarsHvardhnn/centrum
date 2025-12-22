import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting build and asset update process...');

try {
  // Step 1: Run the build command
  console.log('📦 Building the project...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');

  // Step 2: Read the dist/assets directory to find the new asset files
  const distAssetsPath = path.join(__dirname, 'dist', 'assets');
  
  if (!fs.existsSync(distAssetsPath)) {
    throw new Error('dist/assets directory not found. Build may have failed.');
  }

  const assetFiles = fs.readdirSync(distAssetsPath);
  
  // Find CSS and JS files
  const cssFile = assetFiles.find(file => file.endsWith('.css'));
  const jsFile = assetFiles.find(file => file.endsWith('.js'));

  if (!cssFile || !jsFile) {
    throw new Error('Could not find CSS or JS files in dist/assets');
  }

  console.log(`📁 Found assets: CSS=${cssFile}, JS=${jsFile}`);

  // Step 3: Read the current server.js file
  const serverJsPath = path.join(__dirname, 'server.js');
  let serverJsContent = fs.readFileSync(serverJsPath, 'utf8');

  // Step 4: Update the asset references
  // Update CSS file reference
  const cssRegex = /href="\/assets\/[^"]*\.css"/;
  if (cssRegex.test(serverJsContent)) {
    serverJsContent = serverJsContent.replace(cssRegex, `href="/assets/${cssFile}"`);
    console.log(`✅ Updated CSS reference to: ${cssFile}`);
  } else {
    console.log('⚠️  CSS reference pattern not found in server.js');
  }

  // Update JS file reference
  const jsRegex = /src="\/assets\/[^"]*\.js"/;
  if (jsRegex.test(serverJsContent)) {
    serverJsContent = serverJsContent.replace(jsRegex, `src="/assets/${jsFile}"`);
    console.log(`✅ Updated JS reference to: ${jsFile}`);
  } else {
    console.log('⚠️  JS reference pattern not found in server.js');
  }

  // Step 5: Write the updated content back to server.js
  fs.writeFileSync(serverJsPath, serverJsContent, 'utf8');
  console.log('✅ Successfully updated server.js with new asset references');

  // Step 6: Generate static pages for articles, blogs, and services
  console.log('\n👨‍⚕️ Generating static pages (articles, blogs, services)...');
  try {
    execSync('npm run build:static-pages', { stdio: 'inherit' });
    console.log('✅ Static pages generated successfully!');
  } catch (error) {
    console.warn('⚠️  Warning: Static pages generation failed, continuing with build...');
    console.warn(`   Error: ${error.message}`);
    // Don't fail the build if static generation fails - it's optional
  }

  console.log('\n🎉 Build and asset update process completed successfully!');
  console.log(`📋 Updated assets: CSS=${cssFile}, JS=${jsFile}`);

} catch (error) {
  console.error('❌ Error during build and asset update process:', error.message);
  process.exit(1);
} 