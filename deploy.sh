#!/bin/bash

# Quick Deployment Script for SEO Server
# Replace these variables with your actual values
VPS_USER="your-username"
VPS_IP="your-vps-ip"
APP_PATH="/var/www/centrum-seo"

echo "🚀 Starting deployment to production..."

# Build the React app
echo "📦 Building React app..."
npm run build

# Upload files to VPS
echo "📤 Uploading files to VPS..."
scp server.js $VPS_USER@$VPS_IP:$APP_PATH/
scp -r dist/ $VPS_USER@$VPS_IP:$APP_PATH/
scp package.json $VPS_USER@$VPS_IP:$APP_PATH/

# Deploy on VPS
echo "🔄 Deploying on VPS..."
ssh $VPS_USER@$VPS_IP << 'EOF'
cd /var/www/centrum-seo
npm install express
pm2 stop centrum-seo-server 2>/dev/null || echo "No existing server to stop"
pm2 start server.js --name "centrum-seo-server"
pm2 save
echo "✅ SEO server deployed and running!"
EOF

echo "🧪 Testing deployment..."
echo "Bot test (should show SEO title + description):"
curl -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1)" https://centrummedyczne7.pl/lekarze | grep -E '<title>|<meta name="description"'

echo ""
echo "User test (should show basic title + description):"
curl -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)" https://centrummedyczne7.pl/lekarze | grep -E '<title>|<meta name="description"'

echo ""
echo "Testing different routes:"
echo "Homepage:"
curl -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1)" https://centrummedyczne7.pl/ | grep -E '<title>|<meta name="description"'

echo ""
echo "Services page:"
curl -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1)" https://centrummedyczne7.pl/uslugi | grep -E '<title>|<meta name="description"'

echo "🎉 Deployment complete!"
echo "🌐 Your SEO server is now live at https://centrummedyczne7.pl" 