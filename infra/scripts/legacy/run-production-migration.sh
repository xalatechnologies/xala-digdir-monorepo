#!/bin/bash
# =============================================================================
# Run Production Database Migrations
# Usage: ./scripts/run-production-migration.sh
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[MIGRATE]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

print_status "Starting production database migration..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set DATABASE_URL or load from .env.production:"
    echo "  export DATABASE_URL='postgresql://user:pass@host:port/database'"
    echo ""
    echo "Or load from file:"
    echo "  export \$(cat apps/api/.env.production | xargs)"
    exit 1
fi

print_success "DATABASE_URL is configured"
echo ""

# Navigate to API directory
cd "$PROJECT_ROOT/apps/api"

# Check if migration files exist
if [ ! -d "drizzle" ]; then
    print_error "Migration directory 'drizzle' not found"
    exit 1
fi

print_status "Found migrations directory"
print_status "Listing pending migrations..."
echo ""

ls -1 drizzle/*.sql | while read -r file; do
    echo "  - $(basename "$file")"
done

echo ""
read -p "$(echo -e ${YELLOW}Do you want to proceed with migration? [y/N]:${NC} )" -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Migration cancelled by user"
    exit 0
fi

echo ""
print_status "Running migrations..."
echo ""

# Run migrations
pnpm db:migrate

echo ""
print_success "Migrations completed successfully!"
echo ""

# Verify GDPR tables were created
print_status "Verifying GDPR tables..."
echo ""

psql "$DATABASE_URL" -c "
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'consent_types',
    'user_consents',
    'consent_audit_log',
    'data_processing_records',
    'data_subject_requests'
  )
ORDER BY table_name;
"

echo ""
print_status "Verifying default consent types..."
echo ""

psql "$DATABASE_URL" -c "SELECT id, name, required, active FROM consent_types ORDER BY required DESC, name;"

echo ""
print_success "Migration verification complete!"
echo ""
print_status "GDPR system is ready for use"
