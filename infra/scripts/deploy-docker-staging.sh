#!/bin/bash

# Docker-Based Staging Deployment
# Complete deployment with Docker, fresh database, migrations, seeding, and testing

set -e

echo "=========================================="
echo "Docker Staging Deployment"
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
  exit 1
fi

echo "Step 1/12: Decrypting staging secrets..."
mkdir -p /tmp/digilist-secrets-staging
for app in api web minside backoffice saas-admin monitoring docs-learning; do
  if [ -f "infra/secrets/staging/${app}.enc.yaml" ]; then
    age -d -i "$AGE_KEY" "infra/secrets/staging/${app}.enc.yaml" > "/tmp/digilist-secrets-staging/${app}.env"
    echo "  ✓ Decrypted ${app}"
  fi
done
echo -e "${GREEN}✓ Secrets decrypted${NC}"
echo ""

echo "Step 2/12: Uploading Docker Compose configuration..."
scp infra/docker/compose/docker-compose.staging.yml "$VPS_USER@$VPS_HOST:/home/digilist/"
echo -e "${GREEN}✓ Docker Compose uploaded${NC}"
echo ""

echo "Step 3/12: Uploading secrets to VPS..."
ssh "$VPS_ROOT_USER@$VPS_HOST" "mkdir -p /etc/digilist/{api,web,minside,backoffice,saas-admin,monitoring,docs-learning}"
for app in api web minside backoffice saas-admin monitoring docs-learning; do
  if [ -f "/tmp/digilist-secrets-staging/${app}.env" ]; then
    scp "/tmp/digilist-secrets-staging/${app}.env" "$VPS_ROOT_USER@$VPS_HOST:/etc/digilist/${app}/staging.env"
    ssh "$VPS_ROOT_USER@$VPS_HOST" "chmod 600 /etc/digilist/${app}/staging.env"
    echo "  ✓ Uploaded ${app} secrets"
  fi
done
rm -rf /tmp/digilist-secrets-staging
echo -e "${GREEN}✓ Secrets uploaded${NC}"
echo ""

echo "Step 4/12: Stopping existing containers..."
ssh "$VPS_USER@$VPS_HOST" "cd /home/digilist && docker-compose -f docker-compose.staging.yml down -v" || true
echo -e "${GREEN}✓ Containers stopped${NC}"
echo ""

echo "Step 5/12: Deploying application code..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude '.turbo' \
  . "$VPS_USER@$VPS_HOST:/home/digilist/digilist-platform/"
echo -e "${GREEN}✓ Code deployed${NC}"
echo ""

echo "Step 6/12: Building Docker images on VPS..."
ssh "$VPS_USER@$VPS_HOST" "cd /home/digilist/digilist-platform && docker-compose -f infra/docker/compose/docker-compose.staging.yml build --no-cache"
echo -e "${GREEN}✓ Images built${NC}"
echo ""

echo "Step 7/12: Starting infrastructure (PostgreSQL, Redis)..."
ssh "$VPS_USER@$VPS_HOST" "cd /home/digilist/digilist-platform && docker-compose -f infra/docker/compose/docker-compose.staging.yml up -d postgres redis"
echo "Waiting for PostgreSQL..."
sleep 10
echo -e "${GREEN}✓ Infrastructure started${NC}"
echo ""

echo "Step 8/12: Creating fresh database with schemas..."
ssh "$VPS_USER@$VPS_HOST" <<'ENDSSH'
cd /home/digilist/digilist-platform
docker-compose -f infra/docker/compose/docker-compose.staging.yml exec -T postgres psql -U digilist_staging <<EOF
-- Drop existing database
DROP DATABASE IF EXISTS digilist_staging;
CREATE DATABASE digilist_staging;

-- Connect to new database
\c digilist_staging

-- Create schemas
CREATE SCHEMA IF NOT EXISTS platform;
CREATE SCHEMA IF NOT EXISTS domain;
CREATE SCHEMA IF NOT EXISTS compliance;
CREATE SCHEMA IF NOT EXISTS monitoring;
CREATE SCHEMA IF NOT EXISTS saas;

-- Grant permissions
GRANT ALL ON SCHEMA platform TO digilist_staging;
GRANT ALL ON SCHEMA domain TO digilist_staging;
GRANT ALL ON SCHEMA compliance TO digilist_staging;
GRANT ALL ON SCHEMA monitoring TO digilist_staging;
GRANT ALL ON SCHEMA saas TO digilist_staging;
EOF
ENDSSH
echo -e "${GREEN}✓ Database created${NC}"
echo ""

echo "Step 9/12: Running migrations..."
ssh "$VPS_USER@$VPS_HOST" "cd /home/digilist/digilist-platform && docker-compose -f infra/docker/compose/docker-compose.staging.yml run --rm api pnpm --filter @digilist/database-schema db:push"
echo -e "${GREEN}✓ Migrations applied${NC}"
echo ""

echo "Step 10/12: Seeding database..."
ssh "$VPS_USER@$VPS_HOST" "cd /home/digilist/digilist-platform && docker-compose -f infra/docker/compose/docker-compose.staging.yml run --rm api pnpm --filter @digilist/database-schema seed" || \
  echo -e "${YELLOW}⚠ Seeding skipped${NC}"
echo ""

echo "Step 11/12: Starting all application containers..."
ssh "$VPS_USER@$VPS_HOST" "cd /home/digilist/digilist-platform && docker-compose -f infra/docker/compose/docker-compose.staging.yml up -d"
echo "Waiting for services..."
sleep 15
echo -e "${GREEN}✓ Applications started${NC}"
echo ""

echo "Step 12/12: Verifying deployment..."
if curl -s "http://$VPS_HOST:4000/health" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ API: Healthy${NC}"
else
  echo -e "${RED}✗ API: Not responding${NC}"
fi

echo ""
echo "Running smoke tests..."
ssh "$VPS_USER@$VPS_HOST" "cd /home/digilist/digilist-platform && docker-compose -f infra/docker/compose/docker-compose.staging.yml exec -T api pnpm --filter @digilist/testing test:unit" || \
  echo -e "${YELLOW}⚠ Some tests failed${NC}"

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
echo "  View logs:    ssh $VPS_USER@$VPS_HOST 'cd /home/digilist/digilist-platform && docker-compose -f infra/docker/compose/docker-compose.staging.yml logs -f'"
echo "  Status:       ssh $VPS_USER@$VPS_HOST 'cd /home/digilist/digilist-platform && docker-compose -f infra/docker/compose/docker-compose.staging.yml ps'"
echo "  Restart:      ssh $VPS_USER@$VPS_HOST 'cd /home/digilist/digilist-platform && docker-compose -f infra/docker/compose/docker-compose.staging.yml restart'"
echo ""
