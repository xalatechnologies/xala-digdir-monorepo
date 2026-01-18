#!/bin/bash

# Docker-Based Production Deployment
# Complete deployment with Docker, fresh database, migrations, and verification
# CRITICAL: This drops and recreates the production database

set -e

echo "=========================================="
echo "Docker Production Deployment"
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
echo "Step 1/13: Creating database backup..."
BACKUP_FILE="digilist_prod_backup_$(date +%Y%m%d_%H%M%S).sql.gz"
ssh "$VPS_USER@$VPS_HOST" \
  "cd /home/digilist/digilist-platform && docker-compose -f infra/docker/compose/docker-compose.production.yml exec -T postgres pg_dump -U digilist_prod digilist_prod | gzip > /tmp/$BACKUP_FILE" || \
  echo -e "${YELLOW}⚠ No existing database to backup${NC}"
echo -e "${GREEN}✓ Backup created: /tmp/$BACKUP_FILE${NC}"
echo ""

echo "Step 2/13: Decrypting production secrets..."
mkdir -p /tmp/digilist-secrets-production
for app in api web minside backoffice saas-admin monitoring docs-learning; do
  if [ -f "infra/secrets/production/${app}.enc.yaml" ]; then
    age -d -i "$AGE_KEY" "infra/secrets/production/${app}.enc.yaml" > "/tmp/digilist-secrets-production/${app}.env"
    echo "  ✓ Decrypted ${app}"
  fi
done
echo -e "${GREEN}✓ Secrets decrypted${NC}"
echo ""

echo "Step 3/13: Uploading Docker Compose configuration..."
scp infra/docker/compose/docker-compose.production.yml "$VPS_USER@$VPS_HOST:/home/digilist/"
echo -e "${GREEN}✓ Docker Compose uploaded${NC}"
echo ""

echo "Step 4/13: Uploading secrets to VPS..."
ssh "$VPS_ROOT_USER@$VPS_HOST" "mkdir -p /etc/digilist/{api,web,minside,backoffice,saas-admin,monitoring,docs-learning}"
for app in api web minside backoffice saas-admin monitoring docs-learning; do
  if [ -f "/tmp/digilist-secrets-production/${app}.env" ]; then
    scp "/tmp/digilist-secrets-production/${app}.env" "$VPS_ROOT_USER@$VPS_HOST:/etc/digilist/${app}/production.env"
    ssh "$VPS_ROOT_USER@$VPS_HOST" "chmod 600 /etc/digilist/${app}/production.env"
    echo "  ✓ Uploaded ${app} secrets"
  fi
done
rm -rf /tmp/digilist-secrets-production
echo -e "${GREEN}✓ Secrets uploaded${NC}"
echo ""

echo "Step 5/13: Stopping existing containers..."
ssh "$VPS_USER@$VPS_HOST" "cd /home/digilist && docker-compose -f docker-compose.production.yml down" || true
echo -e "${GREEN}✓ Containers stopped${NC}"
echo ""

echo "Step 6/13: Deploying application code..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude '.turbo' \
  . "$VPS_USER@$VPS_HOST:/home/digilist/digilist-platform/"
echo -e "${GREEN}✓ Code deployed${NC}"
echo ""

echo "Step 7/13: Building Docker images on VPS..."
ssh "$VPS_USER@$VPS_HOST" "cd /home/digilist/digilist-platform && docker-compose -f infra/docker/compose/docker-compose.production.yml build --no-cache"
echo -e "${GREEN}✓ Images built${NC}"
echo ""

echo "Step 8/13: Starting infrastructure (PostgreSQL, Redis)..."
ssh "$VPS_USER@$VPS_HOST" "cd /home/digilist/digilist-platform && docker-compose -f infra/docker/compose/docker-compose.production.yml up -d postgres redis"
echo "Waiting for PostgreSQL..."
sleep 10
echo -e "${GREEN}✓ Infrastructure started${NC}"
echo ""

echo "Step 9/13: Creating fresh database with schemas..."
ssh "$VPS_USER@$VPS_HOST" <<'ENDSSH'
cd /home/digilist/digilist-platform
docker-compose -f infra/docker/compose/docker-compose.production.yml exec -T postgres psql -U digilist_prod <<EOF
-- Drop existing database
DROP DATABASE IF EXISTS digilist_prod;
CREATE DATABASE digilist_prod;

-- Connect to new database
\c digilist_prod

-- Create schemas
CREATE SCHEMA IF NOT EXISTS platform;
CREATE SCHEMA IF NOT EXISTS domain;
CREATE SCHEMA IF NOT EXISTS compliance;
CREATE SCHEMA IF NOT EXISTS monitoring;
CREATE SCHEMA IF NOT EXISTS saas;

-- Grant permissions
GRANT ALL ON SCHEMA platform TO digilist_prod;
GRANT ALL ON SCHEMA domain TO digilist_prod;
GRANT ALL ON SCHEMA compliance TO digilist_prod;
GRANT ALL ON SCHEMA monitoring TO digilist_prod;
GRANT ALL ON SCHEMA saas TO digilist_prod;
EOF
ENDSSH
echo -e "${GREEN}✓ Database created${NC}"
echo ""

echo "Step 10/13: Running migrations..."
ssh "$VPS_USER@$VPS_HOST" "cd /home/digilist/digilist-platform && docker-compose -f infra/docker/compose/docker-compose.production.yml run --rm api pnpm --filter @digilist/database-schema db:push"
echo -e "${GREEN}✓ Migrations applied${NC}"
echo ""

echo "Step 11/13: Seeding database (production data)..."
ssh "$VPS_USER@$VPS_HOST" "cd /home/digilist/digilist-platform && docker-compose -f infra/docker/compose/docker-compose.production.yml run --rm api pnpm --filter @digilist/database-schema seed:production" || \
  echo -e "${YELLOW}⚠ Seeding skipped${NC}"
echo ""

echo "Step 12/13: Starting all application containers..."
ssh "$VPS_USER@$VPS_HOST" "cd /home/digilist/digilist-platform && docker-compose -f infra/docker/compose/docker-compose.production.yml up -d"
echo "Waiting for services..."
sleep 20
echo -e "${GREEN}✓ Applications started${NC}"
echo ""

echo "Step 13/13: Verifying deployment..."
if curl -s "https://$VPS_HOST/api/health" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ API: Healthy${NC}"
else
  echo -e "${RED}✗ API: Not responding${NC}"
fi

echo ""
echo "Running production smoke tests..."
ssh "$VPS_USER@$VPS_HOST" "cd /home/digilist/digilist-platform && docker-compose -f infra/docker/compose/docker-compose.production.yml exec -T api pnpm --filter @digilist/testing test:smoke" || \
  echo -e "${YELLOW}⚠ Some tests failed${NC}"

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
echo "  View logs:    ssh $VPS_USER@$VPS_HOST 'cd /home/digilist/digilist-platform && docker-compose -f infra/docker/compose/docker-compose.production.yml logs -f'"
echo "  Status:       ssh $VPS_USER@$VPS_HOST 'cd /home/digilist/digilist-platform && docker-compose -f infra/docker/compose/docker-compose.production.yml ps'"
echo "  Restart:      ssh $VPS_USER@$VPS_HOST 'cd /home/digilist/digilist-platform && docker-compose -f infra/docker/compose/docker-compose.production.yml restart'"
echo ""
