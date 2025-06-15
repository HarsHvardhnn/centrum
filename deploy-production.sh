#!/bin/bash

# Production Deployment Script for SEO Server

echo "🚀 Starting production deployment..."

# 1. Build the React app
echo "📦 Building React app..."
npm run build

# 2. Stop existing server (if running)
echo "🛑 Stopping existing server..."
pm2 stop seo-server 2>/dev/null || echo "No existing server to stop"

# 3. Upload files to VPS (replace with your VPS details)
echo "📤 Uploading files to VPS..."
# rsync -avz --delete dist/ server.js package.json user@your-vps-ip:/path/to/your/app/

# 4. Install dependencies on VPS
echo "📥 Installing dependencies on VPS..."
# ssh user@your-vps-ip "cd /path/to/your/app && npm install --production"

# 5. Start the SEO server with PM2
echo "🔄 Starting SEO server..."
# ssh user@your-vps-ip "cd /path/to/your/app && pm2 start server.js --name seo-server"

# 6. Reload nginx
echo "🔄 Reloading nginx..."
# ssh user@your-vps-ip "sudo nginx -t && sudo systemctl reload nginx"

echo "✅ Deployment complete!"
echo "🌐 Your SEO server should now be live at https://centrummedyczne7.pl"

# Test the deployment
echo "🧪 Testing deployment..."
echo "Bot test:"
curl -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1)" https://centrummedyczne7.pl/lekarze | grep -o '<title>.*</title>'

echo "User test:"
curl -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)" https://centrummedyczne7.pl/lekarze | grep -o '<title>.*</title>' 