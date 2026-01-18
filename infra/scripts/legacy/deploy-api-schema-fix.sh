#!/bin/bash
##############################################################################
# Deploy API Schema Fix to Production
# Fixes schema mismatch - queries platform.rental_objects instead of domain
##############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SERVER="root@159.223.21.252"
API_DIR="/var/www/digilist-api"

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}Deploying API Schema Fix${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

# Step 1: Build API locally
echo -e "${YELLOW}Step 1: Building API locally...${NC}"
cd "$(dirname "$0")/.."
if pnpm -F @digilist/api build; then
  echo -e "${GREEN}✅ API built successfully${NC}"
else
  echo -e "${RED}❌ Failed to build API${NC}"
  exit 1
fi
echo ""

# Step 2: Upload dist folder
echo -e "${YELLOW}Step 2: Uploading dist folder to server...${NC}"
if scp -o StrictHostKeyChecking=no -r apps/api/dist "$SERVER:$API_DIR/"; then
  echo -e "${GREEN}✅ Upload completed${NC}"
else
  echo -e "${RED}❌ Failed to upload dist folder${NC}"
  exit 1
fi
echo ""

# Step 2b: Upload PM2 config
echo -e "${YELLOW}Step 2b: Uploading PM2 configuration...${NC}"
if scp -o StrictHostKeyChecking=no ecosystem.config.cjs "$SERVER:$API_DIR/"; then
  echo -e "${GREEN}✅ PM2 config uploaded${NC}"
else
  echo -e "${YELLOW}⚠️  Warning: Failed to upload PM2 config${NC}"
fi
echo ""

# Step 2c: Initialize storage directory
echo -e "${YELLOW}Step 2c: Initializing storage directory...${NC}"
if ssh -o StrictHostKeyChecking=no "$SERVER" "mkdir -p $API_DIR/storage && chmod 755 $API_DIR/storage"; then
  echo -e "${GREEN}✅ Storage directory initialized${NC}"
else
  echo -e "${YELLOW}⚠️  Warning: Failed to initialize storage directory${NC}"
fi
echo ""

# Step 3: Restart API server
echo -e "${YELLOW}Step 3: Restarting API server...${NC}"
if ssh -o StrictHostKeyChecking=no "$SERVER" "cd $API_DIR && pm2 restart digilist-api"; then
  echo -e "${GREEN}✅ API server restarted${NC}"
else
  echo -e "${RED}❌ Failed to restart API server${NC}"
  exit 1
fi
echo ""

# Step 4: Wait for API to be ready
echo -e "${YELLOW}Step 4: Waiting for API to be ready...${NC}"
sleep 5

# Step 5: Test API health
echo -e "${YELLOW}Step 5: Testing API health...${NC}"
if ssh -o StrictHostKeyChecking=no "$SERVER" "curl -sf http://localhost:4000/api/health > /dev/null"; then
  echo -e "${GREEN}✅ API health check passed${NC}"
  echo ""
  ssh -o StrictHostKeyChecking=no "$SERVER" "curl -s http://localhost:4000/api/health"
else
  echo -e "${RED}❌ API health check failed${NC}"
  echo -e "${YELLOW}Checking PM2 logs:${NC}"
  ssh -o StrictHostKeyChecking=no "$SERVER" "pm2 logs digilist-api --lines 20 --nostream"
  exit 1
fi
echo ""

# Step 6: Test rental objects endpoint
echo -e "${YELLOW}Step 6: Testing rental objects endpoint...${NC}"
RESPONSE=$(ssh -o StrictHostKeyChecking=no "$SERVER" "curl -s -w '\n%{http_code}' http://localhost:4000/api/rental-objects")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Rental objects endpoint working${NC}"
  echo ""
  echo -e "${BLUE}Sample response:${NC}"
  echo "$BODY" | head -c 500
  echo "..."
else
  echo -e "${RED}❌ Rental objects endpoint returned HTTP $HTTP_CODE${NC}"
  echo ""
  echo -e "${YELLOW}Response:${NC}"
  echo "$BODY"
  echo ""
  echo -e "${YELLOW}Checking PM2 logs:${NC}"
  ssh -o StrictHostKeyChecking=no "$SERVER" "pm2 logs digilist-api --lines 30 --nostream"
  exit 1
fi
echo ""

# Final summary
echo -e "${BLUE}============================================================${NC}"
echo -e "${GREEN}✅ API Schema Fix Deployed Successfully!${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""
echo -e "Changes:"
echo "  • Updated schema to use platform.rental_objects instead of domain.rental_objects"
echo "  • API now queries the correct table where seed data was imported"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Test web-test.digilist.no loads rental objects"
echo "2. Verify no 500 errors in browser console"
echo "3. Check that category labels display correctly"
echo ""
