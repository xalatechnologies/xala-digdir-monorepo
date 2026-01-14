#!/bin/bash
# Seed Runner Script
# Applies seed files to Supabase database
#
# Usage:
#   ./supabase/run-seeds.sh                    # Local development
#   DATABASE_URL="..." ./supabase/run-seeds.sh # Production

set -e

# Default to local Supabase
DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:54322/postgres}"

echo "🌱 Running seeds..."
echo "   Database: ${DATABASE_URL%%@*}@..."

# Run migrations first
echo ""
echo "📦 Running migrations..."
for f in supabase/migrations/*.sql; do
  if [ -f "$f" ]; then
    echo "   → $(basename $f)"
    psql "$DATABASE_URL" -f "$f" -q 2>/dev/null || true
  fi
done

# Run seeds in order
echo ""
echo "🌱 Seeding data..."
for f in supabase/seeds/*.sql; do
  if [ -f "$f" ]; then
    echo "   → $(basename $f)"
    psql "$DATABASE_URL" -f "$f" -q 2>/dev/null || true
  fi
done

echo ""
echo "✅ Seeding complete!"
echo ""
echo "📊 Verification:"
psql "$DATABASE_URL" -c "
SELECT 'user_groups' as table_name, COUNT(*) as count FROM user_groups
UNION ALL
SELECT 'listings', COUNT(*) FROM listings WHERE status = 'published'
UNION ALL
SELECT 'price_rules', COUNT(*) FROM price_rules
UNION ALL
SELECT 'listing_rules', COUNT(*) FROM listing_rules;
" 2>/dev/null || echo "   (Run psql manually to verify counts)"
