#!/bin/bash
# Manual Production Database Seeding Script
# Usage: ./scripts/seed-production.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🌱 Production Database Seeding${NC}"
echo "================================================"

# Hostinger VPS settings
VPS_HOST="${VPS_HOST:-185.68.16.74}"
VPS_USER="${VPS_USER:-root}"
REMOTE_DIR="/var/www/digilist-api"

echo -e "\n${YELLOW}Connecting to production VPS...${NC}"

ssh "${VPS_USER}@${VPS_HOST}" << 'REMOTE'
  cd /var/www/digilist-api

  echo "🔍 Checking current database state..."

  # Load environment variables
  if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
  else
    echo "❌ .env file not found"
    exit 1
  fi

  # Check if psql is available
  if ! command -v psql &> /dev/null; then
    echo "❌ psql not found. Installing postgresql-client..."
    apt-get update && apt-get install -y postgresql-client
  fi

  # Count existing rental objects
  echo "📊 Checking rental objects..."
  RENTAL_COUNT=$(psql "${DATABASE_URL}" -t -c "SELECT COUNT(*) FROM platform.rental_objects;" 2>/dev/null | xargs || echo "0")

  echo "Current rental objects: ${RENTAL_COUNT}"

  if [ "${RENTAL_COUNT}" = "0" ]; then
    echo ""
    echo "📦 Running seed script..."
    npx tsx src/database/seeds/demo-seed-v3.ts

    echo ""
    echo "✅ Seed complete!"

    # Verify
    NEW_COUNT=$(psql "${DATABASE_URL}" -t -c "SELECT COUNT(*) FROM platform.rental_objects;" 2>/dev/null | xargs || echo "0")
    echo "New rental objects count: ${NEW_COUNT}"

  else
    echo ""
    echo "⚠️  Database already has data. Skipping seed."
    echo "To force re-seed, manually truncate tables first."
  fi

REMOTE

echo ""
echo -e "${GREEN}✅ Complete!${NC}"
echo "================================================"
echo "Test endpoints:"
echo "  curl https://api.digilist.no/api/public/rental-objects?limit=10"
echo "  curl https://api.digilist.no/api/public/cities"
