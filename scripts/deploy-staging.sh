#!/bin/bash

# ==============================================================================
# Digilist Platform - Staging Deployment Script
# ==============================================================================
# This script deploys all applications to the staging environment on VPS.
# It handles secrets decryption, file transfer, and PM2 process management.
#
# Usage: ./scripts/deploy-staging.sh
# ==============================================================================

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST="${VPS_HOST:-staging.digilist.no}"
VPS_USER="${VPS_USER:-digilist}"
VPS_ROOT_USER="${VPS_ROOT_USER:-root}"
DEPLOY_DIR="/var/www/digilist"
SECRETS_DIR="/etc/digilist"
AGE_KEY_FILE="${AGE_KEY_FILE:-age.key}"

# Applications to deploy
APPS=("api" "web" "minside" "backoffice" "tenant-admin" "saas-admin" "monitoring" "docs-learning")

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Digilist Platform - Staging Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ==============================================================================
# Pre-flight Checks
# ==============================================================================

echo -e "${YELLOW}→ Running pre-flight checks...${NC}"

# Check if age is installed
if ! command -v age &> /dev/null; then
    echo -e "${RED}✗ age is not installed. Please install it first.${NC}"
    echo "  Install: https://github.com/FiloSottile/age"
    exit 1
fi

# Check if age key exists
if [ ! -f "$AGE_KEY_FILE" ]; then
    echo -e "${RED}✗ Age key file not found: $AGE_KEY_FILE${NC}"
    echo "  Set AGE_KEY_FILE environment variable or place age.key in current directory"
    exit 1
fi

# Check if SSH access works
if ! ssh -q "$VPS_USER@$VPS_HOST" exit; then
    echo -e "${RED}✗ Cannot connect to VPS as $VPS_USER@$VPS_HOST${NC}"
    echo "  Check your SSH configuration and keys"
    exit 1
fi

echo -e "${GREEN}✓ Pre-flight checks passed${NC}"
echo ""

# ==============================================================================
# Decrypt Secrets
# ==============================================================================

echo -e "${YELLOW}→ Decrypting secrets...${NC}"

TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

for app in "${APPS[@]}"; do
    SECRET_FILE=".secrets/staging/${app}.enc.yaml"
    
    if [ ! -f "$SECRET_FILE" ]; then
        echo -e "${YELLOW}  ⚠ No secrets file for $app, skipping${NC}"
        continue
    fi
    
    echo -e "  Decrypting $app secrets..."
    age -d -i "$AGE_KEY_FILE" "$SECRET_FILE" > "$TEMP_DIR/${app}.yaml"
    
    # Convert YAML to ENV format
    # Simple conversion (you may want to use a proper YAML parser)
    sed 's/: /=/' "$TEMP_DIR/${app}.yaml" | grep -v '^#' > "$TEMP_DIR/${app}.env"
done

echo -e "${GREEN}✓ Secrets decrypted${NC}"
echo ""

# ==============================================================================
# Deploy Applications
# ==============================================================================

echo -e "${YELLOW}→ Deploying applications...${NC}"

for app in "${APPS[@]}"; do
    echo -e "${BLUE}  Deploying $app...${NC}"
    
    # 1. Pull latest code
    ssh "$VPS_USER@$VPS_HOST" "cd $DEPLOY_DIR/$app && git pull origin main"
    
    # 2. Install dependencies
    ssh "$VPS_USER@$VPS_HOST" "cd $DEPLOY_DIR/$app && pnpm install --frozen-lockfile"
    
    # 3. Build application
    if [ "$app" = "api" ]; then
        ssh "$VPS_USER@$VPS_HOST" "cd $DEPLOY_DIR/$app && pnpm build"
    else
        # Frontend apps - build will be done by PM2 with env vars
        echo "    Frontend app - build will use PM2"
    fi
    
    # 4. Copy secrets to VPS (as root)
    if [ -f "$TEMP_DIR/${app}.env" ]; then
        echo "    Uploading secrets..."
        scp "$TEMP_DIR/${app}.env" "$VPS_ROOT_USER@$VPS_HOST:/tmp/${app}.staging.env"
        ssh "$VPS_ROOT_USER@$VPS_HOST" "mv /tmp/${app}.staging.env $SECRETS_DIR/$app/staging.env && chmod 600 $SECRETS_DIR/$app/staging.env"
    fi
    
    echo -e "${GREEN}    ✓ $app deployed${NC}"
done

echo -e "${GREEN}✓ All applications deployed${NC}"
echo ""

# ==============================================================================
# Database Migrations
# ==============================================================================

echo -e "${YELLOW}→ Running database migrations...${NC}"

ssh "$VPS_USER@$VPS_HOST" "cd $DEPLOY_DIR/api && pnpm --filter @digilist/database-schema db:push"

echo -e "${GREEN}✓ Migrations completed${NC}"
echo ""

# ==============================================================================
# Restart PM2 Processes
# ==============================================================================

echo -e "${YELLOW}→ Restarting PM2 processes...${NC}"

# Copy ecosystem config
scp ecosystem.staging.config.js "$VPS_USER@$VPS_HOST:/home/digilist/"

# Reload PM2 (zero-downtime for API)
ssh "$VPS_USER@$VPS_HOST" "pm2 reload /home/digilist/ecosystem.staging.config.js"

# Build frontend apps
for app in "${APPS[@]}"; do
    if [ "$app" != "api" ]; then
        ssh "$VPS_USER@$VPS_HOST" "pm2 start ${app}-staging-build --update-env" || true
    fi
done

echo -e "${GREEN}✓ PM2 processes restarted${NC}"
echo ""

# ==============================================================================
# Verification
# ==============================================================================

echo -e "${YELLOW}→ Verifying deployment...${NC}"

# Check PM2 status
ssh "$VPS_USER@$VPS_HOST" "pm2 list"

# Check API health
sleep 5  # Wait for API to start
if curl -f -s "http://$VPS_HOST:4000/health" > /dev/null; then
    echo -e "${GREEN}✓ API health check passed${NC}"
else
    echo -e "${RED}✗ API health check failed${NC}"
    echo "  Check logs: ssh $VPS_USER@$VPS_HOST 'pm2 logs api-staging'"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Access your applications:"
echo "  API: http://$VPS_HOST:4000"
echo "  Web: http://$VPS_HOST:8080"
echo "  MinSide: http://$VPS_HOST:8081"
echo "  Backoffice: http://$VPS_HOST:8082"
echo ""
echo "Monitor logs:"
echo "  ssh $VPS_USER@$VPS_HOST 'pm2 logs'"
echo ""
