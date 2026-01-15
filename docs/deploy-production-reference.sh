#!/bin/bash

##############################################################################
# Xala Digilist Platform - Production Deployment Script
##############################################################################
# This script deploys the consolidated .env configuration and all apps
# to the production VPS server.
#
# Prerequisites:
# - SSH access to root@72.61.23.56
# - Builds completed (run pnpm build first)
# - DNS records configured for new domains
##############################################################################

set -e  # Exit on error

# Server Configuration
SERVER="root@72.61.23.56"
API_PATH="/var/www/digilist-api"
BACKOFFICE_PATH="/var/www/digilist/backoffice"
WEB_PATH="/var/www/digilist/web"
MINSIDE_PATH="/var/www/digilist/minside"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting deployment to production...${NC}"
echo ""

# Check SSH connectivity
echo -e "${BLUE}📡 Testing SSH connection...${NC}"
if ! ssh -o ConnectTimeout=5 "$SERVER" "echo 'Connection successful'" 2>/dev/null; then
    echo -e "${RED}❌ Error: Cannot connect to $SERVER${NC}"
    echo "   Please ensure:"
    echo "   - SSH key is configured"
    echo "   - Server is running"
    exit 1
fi
echo -e "${GREEN}✅ SSH connection successful${NC}"
echo ""

# Deploy consolidated .env to server (to API directory)
echo -e "${BLUE}📦 Deploying root .env file to API...${NC}"
scp .env "$SERVER:$API_PATH/.env"
echo -e "${GREEN}✅ .env deployed to $API_PATH${NC}"
echo ""

# Deploy API
echo -e "${BLUE}🔧 Deploying API...${NC}"
cd apps/api
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ API not built. Run: pnpm --filter @digilist/api build${NC}"
    exit 1
fi

ssh "$SERVER" "mkdir -p $API_PATH"
rsync -avz --delete --progress dist/ "$SERVER:$API_PATH/"
scp package.json "$SERVER:$API_PATH/"

# Install production dependencies on server
echo -e "${BLUE}📦 Installing production dependencies...${NC}"
ssh "$SERVER" "cd $API_PATH && pnpm install --prod"

# Stop old API if running
echo -e "${BLUE}🛑 Stopping old API instances...${NC}"
ssh "$SERVER" "pm2 stop digilist-api 2>/dev/null || true"

# Restart API with PM2
echo -e "${BLUE}🔄 Restarting API...${NC}"
ssh "$SERVER" "cd $API_PATH && pm2 reload xala-api || pm2 start main.js --name xala-api"
echo -e "${GREEN}✅ API deployed and restarted${NC}"
cd ../..
echo ""

# Deploy Backoffice
echo -e "${BLUE}🏢 Deploying Backoffice...${NC}"
cd apps/backoffice
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Backoffice not built. Run: pnpm --filter @xala/backoffice build${NC}"
    exit 1
fi

ssh "$SERVER" "mkdir -p $BACKOFFICE_PATH"
rsync -avz --delete --progress dist/ "$SERVER:$BACKOFFICE_PATH/"
echo -e "${GREEN}✅ Backoffice deployed${NC}"
cd ../..
echo ""

# Deploy Web
echo -e "${BLUE}🌐 Deploying Web (public site)...${NC}"
cd apps/web
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}⚠️  Web not built, skipping...${NC}"
else
    ssh "$SERVER" "mkdir -p $WEB_PATH"
    rsync -avz --delete --progress dist/ "$SERVER:$WEB_PATH/"
    echo -e "${GREEN}✅ Web deployed${NC}"
fi
cd ../..
echo ""

# Deploy Minside
echo -e "${BLUE}👤 Deploying Minside (user portal)...${NC}"
cd apps/minside
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}⚠️  Minside not built, skipping...${NC}"
else
    ssh "$SERVER" "mkdir -p $MINSIDE_PATH"
    rsync -avz --delete --progress dist/ "$SERVER:$MINSIDE_PATH/"
    echo -e "${GREEN}✅ Minside deployed${NC}"
fi
cd ../..
echo ""

# Verify deployment
echo -e "${BLUE}🔍 Verifying deployment...${NC}"
ssh "$SERVER" "pm2 status xala-api"
echo ""

# Check API health
echo -e "${BLUE}🏥 Checking API health...${NC}"
API_HEALTH=$(ssh "$SERVER" "curl -s http://localhost:4000/health" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ API is responding: $API_HEALTH${NC}"
else
    echo -e "${RED}⚠️  API health check failed${NC}"
fi
echo ""

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 Deployment Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✅ Production URLs:${NC}"
echo "   • API:        https://api.digilist.no"
echo "   • Backoffice: https://backoffice.digilist.no"
echo "   • Main Site:  https://digilist.no"
echo "   • Web:        https://web.digilist.no (DNS pending)"
echo "   • Minside:    https://minside.digilist.no (DNS pending)"
echo ""
echo -e "${YELLOW}⚠️  Test URLs (already configured):${NC}"
echo "   • Web Test:       https://web-test.digilist.no"
echo "   • Backoffice Test: https://backoffice-test.digilist.no"
echo "   • Minside Test:    https://minside-test.digilist.no"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo "1. ${YELLOW}Configure DNS Records for Production Domains:${NC}"
echo "   Add A records pointing to 72.61.23.56:"
echo "   - web.digilist.no"
echo "   - minside.digilist.no"
echo ""
echo "2. ${YELLOW}Obtain SSL Certificates (after DNS propagation):${NC}"
echo "   ssh $SERVER"
echo "   certbot certonly --webroot -w /var/www/certbot -d web.digilist.no"
echo "   certbot certonly --webroot -w /var/www/certbot -d minside.digilist.no"
echo ""
echo "3. ${YELLOW}Enable Production Sites:${NC}"
echo "   ssh $SERVER"
echo "   ln -s /etc/nginx/sites-available/web.digilist.no /etc/nginx/sites-enabled/"
echo "   ln -s /etc/nginx/sites-available/minside.digilist.no /etc/nginx/sites-enabled/"
echo "   nginx -t && systemctl reload nginx"
echo ""
echo "4. ${YELLOW}Verify Deployment:${NC}"
echo "   curl https://api.digilist.no/health"
echo "   curl https://backoffice.digilist.no"
echo "   curl https://digilist.no"
echo ""
echo "5. ${YELLOW}Monitor Logs:${NC}"
echo "   ssh $SERVER 'pm2 logs xala-api'"
echo "   ssh $SERVER 'tail -f /var/log/nginx/error.log'"
echo ""
echo "6. ${YELLOW}Test Integrations UI:${NC}"
echo "   https://backoffice.digilist.no/settings → Integrations tab"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
