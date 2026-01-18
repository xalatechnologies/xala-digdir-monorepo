#!/bin/bash

# Full Staging Deployment Script
# Complete deployment to VPS with database setup, migrations, seeding, and verification

set -e

echo "=========================================="
echo "Staging Deployment - Full Setup"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
VPS_HOST="${VPS_HOST:-staging.digilist.no}"
VPS_USER="${VPS_USER:-digilist}"
VPS_ROOT_USER="${VPS_ROOT_USER:-root}"
AGE_KEY="${AGE_KEY:-$HOME/.secrets/digilist-age.key}"

# Verify age key exists
if [ ! -f "$AGE_KEY" ]; then
  echo -e "${RED}Error: Age key not found at $AGE_KEY${NC}"
  echo "Please ensure your age private key is available"
  exit 1
fi

echo "Step 1/10: Building all applications..."
pnpm build
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

echo "Step 2/10: Decrypting staging secrets..."
mkdir -p /tmp/digilist-secrets-staging
for app in api web minside backoffice saas-admin monitoring docs-learning; do
  if [ -f "infra/secrets/staging/${app}.enc.yaml" ]; then
    age -d -i "$AGE_KEY" -o "/tmp/digilist-secrets-staging/${app}.env" \
      "infra/secrets/staging/${app}.enc.yaml"
    echo "  ✓ Decrypted ${app}"
  fi
done
echo -e "${GREEN}✓ Secrets decrypted${NC}"
echo ""

echo "Step 3/10: Uploading secrets to VPS..."
ssh "$VPS_ROOT_USER@$VPS_HOST" "mkdir -p /etc/digilist/{api,web,minside,backoffice,saas-admin,monitoring,docs-learning}"
for app in api web minside backoffice saas-admin monitoring docs-learning; do
  if [ -f "/tmp/digilist-secrets-staging/${app}.env" ]; then
    scp "/tmp/digilist-secrets-staging/${app}.env" \
      "$VPS_ROOT_USER@$VPS_HOST:/etc/digilist/${app}/staging.env"
    ssh "$VPS_ROOT_USER@$VPS_HOST" "chmod 600 /etc/digilist/${app}/staging.env"
    echo "  ✓ Uploaded ${app} secrets"
  fi
done
rm -rf /tmp/digilist-secrets-staging
echo -e "${GREEN}✓ Secrets uploaded${NC}"
echo ""

echo "Step 4/10: Deploying application files..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  apps/ "$VPS_USER@$VPS_HOST:/var/www/digilist/"
echo -e "${GREEN}✓ Files deployed${NC}"
echo ""

echo "Step 5/10: Installing dependencies on VPS..."
ssh "$VPS_USER@$VPS_HOST" "cd /var/www/digilist && pnpm install --frozen-lockfile"
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo "Step 6/10: Setting up database..."
ssh "$VPS_ROOT_USER@$VPS_HOST" <<'ENDSSH'
sudo -u postgres psql <<EOF
-- Drop and recreate database
DROP DATABASE IF EXISTS digilist_staging;
DROP USER IF EXISTS digilist_staging;

-- Create fresh database
CREATE DATABASE digilist_staging;
CREATE USER digilist_staging WITH PASSWORD 'STAGING_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE digilist_staging TO digilist_staging;

-- Connect and create schemas
\c digilist_staging

CREATE SCHEMA IF NOT EXISTS platform;
CREATE SCHEMA IF NOT EXISTS domain;
CREATE SCHEMA IF NOT EXISTS compliance;
CREATE SCHEMA IF NOT EXISTS monitoring;
CREATE SCHEMA IF NOT EXISTS saas;

GRANT ALL ON SCHEMA platform TO digilist_staging;
GRANT ALL ON SCHEMA domain TO digilist_staging;
GRANT ALL ON SCHEMA compliance TO digilist_staging;
GRANT ALL ON SCHEMA monitoring TO digilist_staging;
GRANT ALL ON SCHEMA saas TO digilist_staging;
EOF
ENDSSH
echo -e "${GREEN}✓ Database created${NC}"
echo ""

echo "Step 7/10: Running migrations..."
ssh "$VPS_USER@$VPS_HOST" "cd /var/www/digilist && pnpm --filter @digilist/database-schema db:push"
echo -e "${GREEN}✓ Migrations applied${NC}"
echo ""

echo "Step 8/10: Seeding database..."
ssh "$VPS_USER@$VPS_HOST" "cd /var/www/digilist && pnpm --filter @digilist/database-schema seed" || \
  echo -e "${YELLOW}⚠ Seeding skipped${NC}"
echo ""

echo "Step 9/10: Deploying PM2 configuration..."
scp infra/pm2/ecosystem.staging.config.js "$VPS_USER@$VPS_HOST:/home/digilist/"
echo -e "${GREEN}✓ PM2 config deployed${NC}"
echo ""

echo "Step 10/10: Starting/reloading applications..."
ssh "$VPS_USER@$VPS_HOST" <<'ENDSSH'
pm2 reload /home/digilist/ecosystem.staging.config.js || \
pm2 start /home/digilist/ecosystem.staging.config.js
pm2 save
ENDSSH
echo -e "${GREEN}✓ Applications started${NC}"
echo ""

echo "Waiting for services to be ready..."
sleep 10

echo "Verifying deployment..."
if curl -s "http://$VPS_HOST:4000/health" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ API: Healthy${NC}"
else
  echo -e "${RED}✗ API: Not responding${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Staging Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Service URLs:"
echo "  API:        http://$VPS_HOST:4000"
echo "  Web:        http://$VPS_HOST:8080"
echo "  MinSide:    http://$VPS_HOST:8081"
echo "  Backoffice: http://$VPS_HOST:8082"
echo ""
echo "Useful commands:"
echo "  View logs:  ssh $VPS_USER@$VPS_HOST 'pm2 logs'"
echo "  Status:     ssh $VPS_USER@$VPS_HOST 'pm2 status'"
echo "  Restart:    ssh $VPS_USER@$VPS_HOST 'pm2 restart all'"
echo ""
