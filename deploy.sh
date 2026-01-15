#!/bin/bash

##############################################################################
# Xala Digilist Platform - Production Deployment Script
##############################################################################
# This script deploys the consolidated .env configuration and all apps
# to the production VPS server.
#
# Prerequisites:
# - SSH access to root@95.217.126.138
# - VPN connection if required
# - Builds completed (run pnpm build first)
##############################################################################

set -e  # Exit on error

SERVER="root@72.61.23.56"
API_PATH="/var/www/digilist-api"
BACKOFFICE_PATH="/var/www/digilist/backoffice"
WEB_PATH="/var/www/digilist/web"
MINSIDE_PATH="/var/www/digilist/minside"

echo "🚀 Starting deployment to production..."
echo ""

# Check SSH connectivity
echo "📡 Testing SSH connection..."
if ! ssh -o ConnectTimeout=5 "$SERVER" "echo 'Connection successful'" 2>/dev/null; then
    echo "❌ Error: Cannot connect to $SERVER"
    echo "   Please ensure:"
    echo "   - VPN is connected (if required)"
    echo "   - SSH key is configured"
    echo "   - Server is running"
    exit 1
fi
echo "✅ SSH connection successful"
echo ""

# Deploy consolidated .env to server (to API directory)
echo "📦 Deploying root .env file to API..."
scp .env "$SERVER:$API_PATH/.env"
echo "✅ .env deployed to $API_PATH"
echo ""

# Deploy API
echo "🔧 Deploying API..."
cd apps/api
if [ ! -d "dist" ]; then
    echo "❌ API not built. Run: pnpm --filter @digilist/api build"
    exit 1
fi

ssh "$SERVER" "mkdir -p $API_PATH"
rsync -avz --delete dist/ "$SERVER:$API_PATH/"
scp package.json "$SERVER:$API_PATH/"

# Install production dependencies on server
ssh "$SERVER" "cd $API_PATH && pnpm install --prod"

# Restart API with PM2
ssh "$SERVER" "cd $API_PATH && pm2 reload xala-api || pm2 start main.js --name xala-api"
echo "✅ API deployed and restarted"
cd ../..
echo ""

# Deploy Backoffice
echo "🏢 Deploying Backoffice..."
cd apps/backoffice
if [ ! -d "dist" ]; then
    echo "❌ Backoffice not built. Run: pnpm --filter @xala/backoffice build"
    exit 1
fi

ssh "$SERVER" "mkdir -p $BACKOFFICE_PATH"
rsync -avz --delete dist/ "$SERVER:$BACKOFFICE_PATH/"
echo "✅ Backoffice deployed"
cd ../..
echo ""

# Deploy Web
echo "🌐 Deploying Web (public site)..."
cd apps/web
if [ ! -d "dist" ]; then
    echo "⚠️  Web not built, skipping..."
else
    ssh "$SERVER" "mkdir -p $WEB_PATH"
    rsync -avz --delete dist/ "$SERVER:$WEB_PATH/"
    echo "✅ Web deployed"
fi
cd ../..
echo ""

# Deploy Minside
echo "👤 Deploying Minside (user portal)..."
cd apps/minside
if [ ! -d "dist" ]; then
    echo "⚠️  Minside not built, skipping..."
else
    ssh "$SERVER" "mkdir -p $MINSIDE_PATH"
    rsync -avz --delete dist/ "$SERVER:$MINSIDE_PATH/"
    echo "✅ Minside deployed"
fi
cd ../..
echo ""

# Verify deployment
echo "🔍 Verifying deployment..."
ssh "$SERVER" "pm2 status xala-api"
echo ""

echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Update production .env on server with production values"
echo "   2. Verify API is running: curl http://localhost:4000/health"
echo "   3. Check logs: ssh $SERVER 'pm2 logs xala-api'"
echo "   4. Test integrations configuration UI at: https://backoffice.digilist.no/settings"
