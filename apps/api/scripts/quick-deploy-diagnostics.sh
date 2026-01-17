#!/bin/bash
# Quick Deploy - Just the main.js file
# This is faster than full deployment

set -e

echo "🚀 Quick Deploy - Diagnostics Endpoint"
echo "======================================="

VPS_HOST="${VPS_HOST:-185.68.16.74}"
VPS_USER="${VPS_USER:-root}"
REMOTE_DIR="/var/www/digilist-api"

echo "📦 Deploying main.js only..."

# Try quick rsync with timeout
timeout 30 rsync -avz --timeout=20 \
  dist/main.js \
  "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/dist/" || {
    echo "❌ Rsync failed (timeout or connection issue)"
    echo ""
    echo "📋 MANUAL STEPS:"
    echo "1. Go to Hostinger File Manager"
    echo "2. Navigate to: /var/www/digilist-api/dist/"
    echo "3. Upload: apps/api/dist/main.js (579 KB)"
    echo "4. Restart PM2: pm2 restart digilist-api"
    echo ""
    echo "Then test:"
    echo "  curl https://api.digilist.no/health/env | jq ."
    echo "  curl https://api.digilist.no/health/db | jq ."
    exit 1
}

echo "✅ File uploaded"
echo ""
echo "🔄 Restarting PM2..."

ssh "${VPS_USER}@${VPS_HOST}" "pm2 restart digilist-api" || {
    echo "❌ SSH restart failed"
    echo "Please restart manually via Hostinger control panel"
    exit 1
}

echo "✅ Restarted"
echo ""
echo "🧪 Testing diagnostic endpoints..."
sleep 3

echo ""
echo "1️⃣ Environment Check:"
curl -s "https://api.digilist.no/health/env" | jq .

echo ""
echo "2️⃣ Database Check:"
curl -s "https://api.digilist.no/health/db" | jq .

echo ""
echo "✅ Deployment complete!"
