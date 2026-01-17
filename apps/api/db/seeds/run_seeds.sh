#!/usr/bin/env bash
# =====================================================================
# RUN_SEEDS.SH
# Master script to run all seed files in correct order
# =====================================================================

set -e  # Exit on error

echo "🌱 Starting database seeding..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo "   Example: export DATABASE_URL='postgresql://user:pass@localhost:5432/digilist'"
  exit 1
fi

# Seed files in dependency order
SEED_FILES=(
  "02_domain_catalog.sql"
  "03_domain_rental_objects.sql"
  "04_domain_pricing_availability.sql"
  "05_domain_bookings.sql"
  "06_domain_messaging.sql"
  "07_compliance_audit.sql"
  "08_monitoring.sql"
)

SEED_DIR="$(dirname "$0")"

echo "📍 Seed directory: $SEED_DIR"
echo "🗄️  Database: $DATABASE_URL"
echo ""

# Run each seed file
for seed_file in "${SEED_FILES[@]}"; do
  file_path="$SEED_DIR/$seed_file"
  
  if [ ! -f "$file_path" ]; then
    echo "⚠️  WARNING: Seed file not found: $seed_file"
    continue
  fi
  
  echo "▶️  Running: $seed_file"
  psql "$DATABASE_URL" -f "$file_path" -q
  
  if [ $? -eq 0 ]; then
    echo "   ✅ Success"
  else
    echo "   ❌ Failed"
    exit 1
  fi
  
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 ALL SEEDS COMPLETED SUCCESSFULLY!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verification query
echo "📊 Database Summary:"
psql "$DATABASE_URL" -c "
SELECT 
  'Tenants' AS type, COUNT(*)::text AS count FROM platform.tenants
UNION ALL
SELECT 'Users', COUNT(*)::text FROM platform.users
UNION ALL
SELECT 'Rental Objects', COUNT(*)::text FROM domain.rental_objects
UNION ALL
SELECT 'Bookings', COUNT(*)::text FROM domain.bookings
UNION ALL
SELECT 'Messages', COUNT(*)::text FROM domain.messages
UNION ALL
SELECT 'Audit Events', COUNT(*)::text FROM platform.audit_events;
"

echo ""
echo "✨ Seeding complete! Your database is ready."
echo ""
echo "Next steps:"
echo "  1. Start API server: pnpm dev"
echo "  2. Test demo login with tokens from users-demo.json"
echo "  3. Test quote calculator: POST /api/bookings/quote"
echo "  4. Test availability: GET /api/rental-objects/:id/availability"
echo ""
