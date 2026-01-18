#!/bin/bash
# Deploy Storage System Migration to Staging & Production
# Created: 2026-01-17

set -e

echo "🚀 Deploying Storage System Migration"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if DB URL is provided
if [ -z "$1" ]; then
  echo -e "${RED}❌ Error: Database URL required${NC}"
  echo ""
  echo "Usage:"
  echo "  ./deploy-storage-migration.sh <database-url>"
  echo ""
  echo "Examples:"
  echo "  # Local"
  echo "  ./deploy-storage-migration.sh \"postgresql://digilist:digilist_secure_2026@localhost:5432/digilist_prod\""
  echo ""
  echo "  # Staging"
  echo "  ./deploy-storage-migration.sh \"postgresql://user:pass@api.digilist.no:5432/staging_db\""
  echo ""
  echo "  # Production"
  echo "  ./deploy-storage-migration.sh \"postgresql://user:pass@api.digilist.no:5432/prod_db\""
  exit 1
fi

DATABASE_URL=$1
MIGRATION_FILE="apps/api/db/migrations/0030_add_files_table.sql"

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
  echo -e "${RED}❌ Migration file not found: $MIGRATION_FILE${NC}"
  exit 1
fi

echo -e "${BLUE}📦 Migration File:${NC} $MIGRATION_FILE"
echo -e "${BLUE}🗄️  Target Database:${NC} $(echo $DATABASE_URL | sed 's/:.*@/@/' | sed 's/@.*//' | sed 's/^.*:\/\///'):***@..."
echo ""

# Confirm
read -p "Continue with migration? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${RED}❌ Migration cancelled${NC}"
  exit 1
fi

echo ""
echo -e "${BLUE}🔄 Running migration...${NC}"

# Run migration
if psql "$DATABASE_URL" -f "$MIGRATION_FILE"; then
  echo ""
  echo -e "${GREEN}✅ Migration completed successfully!${NC}"
  echo ""
  echo -e "${GREEN}📋 What was created:${NC}"
  echo "  • platform.files table"
  echo "  • RLS policies for tenant isolation"
  echo "  • Performance indexes"
  echo "  • Polymorphic associations ready"
  echo ""
  echo -e "${GREEN}🎉 Storage system database ready!${NC}"
else
  echo ""
  echo -e "${RED}❌ Migration failed${NC}"
  echo "Please check the error messages above"
  exit 1
fi
