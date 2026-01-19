#!/bin/bash

##############################################################################
# Digilist Platform - Apps-Only Deployment Script (Test Environment)
# 
# Purpose: Deploy only frontend/backend apps without migrations or seeding
# Use Case: Quick deployments for code changes only
#
# Usage:
#   ./infra/scripts/deploy-apps-only.sh           # Deploy all apps
#   ./infra/scripts/deploy-apps-only.sh web       # Deploy only web app
#   ./infra/scripts/deploy-apps-only.sh minside   # Deploy only minside app
#   ./infra/scripts/deploy-apps-only.sh backoffice # Deploy only backoffice app
#   ./infra/scripts/deploy-apps-only.sh api       # Deploy only API
#
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST="72.61.23.56"
VPS_USER="digilist"
DEPLOY_PATH="/home/digilist/digilist-platform"

# Parse arguments
DEPLOY_APP="${1:-all}"

echo "=================================================="
echo "  Digilist Platform - Apps-Only Deployment"
echo "=================================================="
echo ""
echo "Target: ${DEPLOY_APP}"
echo "Environment: Test"
echo ""

# Function to deploy a specific app
deploy_app() {
  local APP_NAME=$1
  local APP_PATH=$2
  
  echo "📦 Deploying ${APP_NAME}..."
  
  # Build locally
  echo "  🔨 Building ${APP_NAME}..."
  pnpm --filter "@xala/${APP_NAME}" build
  
  # Deploy to server
  echo "  📤 Uploading ${APP_NAME}..."
  rsync -avz --delete "${APP_PATH}/dist/" ${VPS_USER}@${VPS_HOST}:/var/www/digilist/${APP_NAME}/
  
  echo "  ✅ ${APP_NAME} deployed"
}

# Function to deploy API
deploy_api() {
  echo "📦 Deploying API..."
  
  # Build locally
  echo "  🔨 Building API..."
  pnpm --filter "@digilist/api" build
  
  # Deploy to server
  echo "  📤 Uploading API..."
  rsync -avz --delete apps/api/dist/ ${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/apps/api/dist/
  
  # Restart PM2
  echo "  🔄 Restarting API..."
  ssh ${VPS_USER}@${VPS_HOST} "pm2 restart digilist-api-test"
  
  echo "  ✅ API deployed and restarted"
}

# Deploy based on argument
case "${DEPLOY_APP}" in
  "web")
    deploy_app "web" "apps/web"
    ;;
  "minside")
    deploy_app "minside" "apps/minside"
    ;;
  "backoffice")
    deploy_app "backoffice" "apps/backoffice"
    ;;
  "api")
    deploy_api
    ;;
  "all")
    echo "🚀 Deploying all apps..."
    deploy_app "web" "apps/web"
    deploy_app "minside" "apps/minside"
    deploy_app "backoffice" "apps/backoffice"
    deploy_api
    ;;
  *)
    echo -e "${RED}❌ Unknown app: ${DEPLOY_APP}${NC}"
    echo ""
    echo "Usage: $0 [web|minside|backoffice|api|all]"
    exit 1
    ;;
esac

echo ""
echo "=================================================="
echo -e "  ${GREEN}✅ Deployment Complete!${NC}"
echo "=================================================="
echo ""
echo "🔗 URLs:"
echo "   Web:        https://web-test.digilist.no"
echo "   MinSide:    https://minside-test.digilist.no"
echo "   Backoffice: https://backoffice-test.digilist.no"
echo "   API:        https://api.digilist.no"
echo ""
echo "📊 Monitoring:"
echo "   PM2 Status:  ssh ${VPS_USER}@${VPS_HOST} 'pm2 status'"
echo "   API Logs:    ssh ${VPS_USER}@${VPS_HOST} 'pm2 logs digilist-api-test'"
echo ""
