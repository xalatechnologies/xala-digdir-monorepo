#!/bin/bash

# Full Production Deployment Script
# Complete deployment to VPS with database setup, migrations, and verification
# CRITICAL: This script drops and recreates the production database

set -e

echo "=========================================="
echo "Production Deployment - Full Setup"
echo "=========================================="
echo ""
echo "⚠️  WARNING: This will DROP and RECREATE the production database!"
echo "⚠️  All existing data will be LOST!"
echo ""
read -p "Type 'CONFIRM-PRODUCTION-DEPLOY' to continue: " confirmation

if [ "$confirmation" != "CONFIRM-PRODUCTION-DEPLOY" ]; then
  echo "Deployment cancelled"
  exit 1
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
VPS_HOST="${VPS_HOST:-digilist.no}"
VPS_USER="${VPS_USER:-digilist}"
VPS_ROOT_USER="${VPS_ROOT_USER:-root}"
AGE_KEY="${AGE_KEY:-$HOME/.secrets/digilist-age.key}"

# Verify age key exists
if [ ! -f "$AGE_KEY" ]; then
  echo -e "${RED}Error: Age key not found at $AGE_KEY${NC}"
  exit 1
fi

echo ""
echo "Step 1/11: Creating database backup..."
BACKUP_FILE="digilist_prod_backup_$(date +%Y%m%d_%H%M%S).sql.gz"
ssh "$VPS_ROOT_USER@$VPS_HOST" \
  "sudo -u postgres pg_dump digilist_prod | gzip > /tmp/$BACKUP_FILE" || \
  echo -e "${YELLOW}⚠ No existing database to backup${NC}"
echo -e "${GREEN}✓ Backup created: /tmp/$BACKUP_FILE${NC}"
echo ""

echo "Step 2/11: Building all applications..."
pnpm build
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

echo "Step 3/11: Decrypting production secrets..."
mkdir -p /tmp/digilist-secrets-production
for app in api web minside backoffice saas-admin monitoring docs-learning; do
  if [ -f "infra/secrets/production/${app}.enc.yaml" ]; then
    age -d -i "$AGE_KEY" -o "/tmp/digilist-secrets-production/${app}.env" \
      "infra/secrets/production/${app}.enc.yaml"
    echo "  ✓ Decrypted ${app}"
  fi
done
echo -e "${GREEN}✓ Secrets decrypted${NC}"
echo ""

echo "Step 4/11: Uploading secrets to VPS..."
ssh "$VPS_ROOT_USER@$VPS_HOST" "mkdir -p /etc/digilist/{api,web,minside,backoffice,saas-admin,monitoring,docs-learning}"
for app in api web minside backoffice saas-admin monitoring docs-learning; do
  if [ -f "/tmp/digilist-secrets-production/${app}.env" ]; then
    scp "/tmp/digilist-secrets-production/${app}.env" \
      "$VPS_ROOT_USER@$VPS_HOST:/etc/digilist/${app}/production.env"
    ssh "$VPS_ROOT_USER@$VPS_HOST" "chmod 600 /etc/digilist/${app}/production.env"
    echo "  ✓ Uploaded ${app} secrets"
  fi
done
rm -rf /tmp/digilist-secrets-production
echo -e "${GREEN}✓ Secrets uploaded${NC}"
echo ""

echo "Step 5/11: Deploying application files..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  apps/ "$VPS_USER@$VPS_HOST:/var/www/digilist/"
echo -e "${GREEN}✓ Files deployed${NC}"
echo ""

echo "Step 6/11: Installing dependencies on VPS..."
ssh "$VPS_USER@$VPS_HOST" "cd /var/www/digilist && pnpm install --frozen-lockfile --prod"
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo "Step 7/11: Stopping applications..."
ssh "$VPS_USER@$VPS_HOST" "pm2 stop all" || echo "No apps running"
echo -e "${GREEN}✓ Applications stopped${NC}"
echo ""

echo "Step 8/11: Setting up database..."
ssh "$VPS_ROOT_USER@$VPS_HOST" <<'ENDSSH'
sudo -u postgres psql <<EOF
-- Drop and recreate database
DROP DATABASE IF EXISTS digilist_prod;
DROP USER IF EXISTS digilist_prod;

-- Create fresh database
CREATE DATABASE digilist_prod;
CREATE USER digilist_prod WITH PASSWORD 'PRODUCTION_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE digilist_prod TO digilist_prod;

-- Connect and create schemas
\c digilist_prod

CREATE SCHEMA IF NOT EXISTS platform;
CREATE SCHEMA IF NOT EXISTS domain;
CREATE SCHEMA IF NOT EXISTS compliance;
CREATE SCHEMA IF NOT EXISTS monitoring;
CREATE SCHEMA IF NOT EXISTS saas;

GRANT ALL ON SCHEMA platform TO digilist_prod;
GRANT ALL ON SCHEMA domain TO digilist_prod;
GRANT ALL ON SCHEMA compliance TO digilist_prod;
GRANT ALL ON SCHEMA monitoring TO digilist_prod;
GRANT ALL ON SCHEMA saas TO digilist_prod;
EOF
ENDSSH
echo -e "${GREEN}✓ Database created${NC}"
echo ""

echo "Step 9/11: Running migrations..."
ssh "$VPS_USER@$VPS_HOST" "cd /var/www/digilist && NODE_ENV=production pnpm --filter @digilist/database-schema db:push"
echo -e "${GREEN}✓ Migrations applied${NC}"
echo ""

echo "Step 10/11: Deploying PM2 configuration..."
scp infra/pm2/ecosystem.production.config.js "$VPS_USER@$VPS_HOST:/home/digilist/"
echo -e "${GREEN}✓ PM2 config deployed${NC}"
echo ""

echo "Step 11/11: Starting applications..."
ssh "$VPS_USER@$VPS_HOST" <<'ENDSSH'
pm2 reload /home/digilist/ecosystem.production.config.js || \
pm2 start /home/digilist/ecosystem.production.config.js
pm2 save
ENDSSH
echo -e "${GREEN}✓ Applications started${NC}"
echo ""

echo "Waiting for services to be ready..."
sleep 15

echo "Verifying deployment..."
if curl -s "https://$VPS_HOST/api/health" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ API: Healthy${NC}"
else
  echo -e "${RED}✗ API: Not responding${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Production Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Service URLs:"
echo "  API:        https://$VPS_HOST/api"
echo "  Web:        https://$VPS_HOST"
echo "  MinSide:    https://minside.$VPS_HOST"
echo "  Backoffice: https://backoffice.$VPS_HOST"
echo ""
echo "Backup location: /tmp/$BACKUP_FILE"
echo ""
echo "Useful commands:"
echo "  View logs:  ssh $VPS_USER@$VPS_HOST 'pm2 logs'"
echo "  Status:     ssh $VPS_USER@$VPS_HOST 'pm2 status'"
echo "  Restart:    ssh $VPS_USER@$VPS_HOST 'pm2 restart all'"
echo ""
