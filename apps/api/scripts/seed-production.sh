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
  echo "🔍 Checking if rental objects exist..."
  RENTAL_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -t -c 'SELECT COUNT(*) FROM domain.rental_objects;' 2>/dev/null | xargs || echo "0")
  
  if [ "$RENTAL_COUNT" = "0" ] || [ -z "$RENTAL_COUNT" ]; then
    echo "📦 No rental objects found. Running seed script..."
    node db/seed-data-bank/import-all.cjs

    echo ""
    echo "✅ Seed complete!"

    # Verify
    NEW_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM domain.rental_objects;" 2>/dev/null | xargs || echo "0")
    echo "New rental objects count: ${NEW_COUNT}"

  else
    echo ""
    echo "✅ Database already has $RENTAL_COUNT rental objects"
    echo "To force re-seed, manually truncate tables first."
  fi

REMOTE

echo ""
echo -e "${GREEN}✅ Complete!${NC}"
echo "================================================"
echo "Test endpoints:"
echo "  curl https://api.digilist.no/api/public/rental-objects?limit=10"
echo "  curl https://api.digilist.no/api/public/cities"
