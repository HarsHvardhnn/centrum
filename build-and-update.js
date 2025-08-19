import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get branch name from command line arguments
const branchName = process.argv[2];

if (!branchName) {
  console.error('❌ Error: Branch name is required');
  console.log('Usage: npm run build:update <branch-name>');
  console.log('Example: npm run build:update main');
  process.exit(1);
}

console.log(`🚀 Starting build process for branch: ${branchName}`);

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
  
  // Step 4: Git operations
  console.log('🔧 Performing git operations...');
  
  // Add all changes
  console.log('📝 Adding all changes...');
  execSync('git add .', { stdio: 'inherit' });
  
  // Commit changes
  console.log('💾 Committing changes...');
  execSync('git commit -m "pushing build"', { stdio: 'inherit' });
  
  // Push to origin with branch name
  console.log(`🚀 Pushing to origin/${branchName}...`);
  execSync(`git push origin ${branchName}`, { stdio: 'inherit' });
  
  console.log('🎉 All operations completed successfully!');
  console.log(`✅ Build, update, and push to ${branchName} completed!`);
  
} catch (error) {
  console.error('❌ Error during process:', error.message);
  process.exit(1);
} 