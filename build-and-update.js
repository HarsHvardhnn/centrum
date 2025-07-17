import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting build process...');

try {
  // Step 1: Build the project
  console.log('📦 Building project...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Step 2: Find the built assets
  console.log('🔍 Finding built assets...');
  const distPath = path.join(__dirname, 'dist');
  const assetsPath = path.join(distPath, 'assets');
  
  if (!fs.existsSync(assetsPath)) {
    throw new Error('Assets directory not found after build');
  }
  
  const files = fs.readdirSync(assetsPath);
  const jsFile = files.find(file => file.endsWith('.js') && file.startsWith('index-'));
  const cssFile = files.find(file => file.endsWith('.css') && file.startsWith('index-'));
  
  if (!jsFile || !cssFile) {
    throw new Error('Could not find index.js or index.css files in assets');
  }
  
  console.log(`✅ Found assets: ${jsFile}, ${cssFile}`);
  
  // Step 3: Update server.js
  console.log('📝 Updating server.js...');
  const serverJsPath = path.join(__dirname, 'server.js');
  let serverContent = fs.readFileSync(serverJsPath, 'utf8');
  
  // Replace the asset file names
  serverContent = serverContent.replace(
    /src="\/assets\/index-[^"]+\.js"/g,
    `src="/assets/${jsFile}"`
  );
  
  serverContent = serverContent.replace(
    /href="\/assets\/index-[^"]+\.css"/g,
    `href="/assets/${cssFile}"`
  );
  
  fs.writeFileSync(serverJsPath, serverContent);
  
  console.log('✅ Build and update completed successfully!');
  console.log(`📁 Updated server.js with assets: ${jsFile}, ${cssFile}`);
  
} catch (error) {
  console.error('❌ Error during build process:', error.message);
  process.exit(1);
} 