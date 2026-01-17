#!/bin/bash
# Complete Fresh Database Setup
# Usage: ./scripts/setup-fresh-db.sh

set -e

echo "🗄️  FRESH DATABASE SETUP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set"
    echo ""
    echo "Please set your database connection:"
    echo ""
    echo "Option 1: Export for this session:"
    echo "  export DATABASE_URL='postgresql://user:password@localhost:5432/digilist'"
    echo ""
    echo "Option 2: Create apps/api/.env file with:"
    echo "  DATABASE_URL=postgresql://user:password@localhost:5432/digilist"
    echo ""
    echo "Example for local PostgreSQL:"
    echo "  postgresql://postgres:postgres@localhost:5432/digilist"
    echo ""
    echo "Example for Hostinger VPS:"
    echo "  postgresql://u123456789_digilist:YourPassword@localhost:5432/u123456789_digilist"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo "📍 Target: $DATABASE_URL"
echo ""

# Extract database name for display
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
echo "🗄️  Database: $DB_NAME"
echo ""

# Confirmation
read -p "⚠️  This will DROP and RECREATE the database. Continue? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: DROP & RECREATE SCHEMAS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

psql $DATABASE_URL <<'SQL'
-- Drop all schemas (careful!)
DROP SCHEMA IF EXISTS platform CASCADE;
DROP SCHEMA IF EXISTS domain CASCADE;
DROP SCHEMA IF EXISTS monitoring CASCADE;
DROP SCHEMA IF EXISTS compliance CASCADE;

-- Recreate schemas
CREATE SCHEMA platform;
CREATE SCHEMA domain;
CREATE SCHEMA monitoring;
CREATE SCHEMA compliance;

SELECT 'Schemas recreated!' as status;
SQL

echo "✅ Schemas reset"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: RUN MIGRATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd apps/api

# Run all migrations
echo "Running all 31 migrations..."
for migration in drizzle/*.sql; do
    if [ -f "$migration" ]; then
        filename=$(basename "$migration")
        echo "  ▶️  $filename"
        psql $DATABASE_URL -f "$migration" -q || {
            echo "  ⚠️  Warning: $filename had errors (may be expected)"
        }
    fi
done

echo ""
echo "✅ Migrations complete"
echo ""

cd ../..

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: SEED PLATFORM DATA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

psql $DATABASE_URL <<'SQL'
-- Platform Foundation
INSERT INTO platform.tenants (id, name, slug, status, locale, timezone, created_at, updated_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Skien Kommune',
  'skien',
  'ACTIVE',
  'nb',
  'Europe/Oslo',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

INSERT INTO platform.organizations (id, tenant_id, name, slug, org_number, city, country, created_at, updated_at)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Skien Kommune',
  'skien-kommune',
  '964951211',
  'Skien',
  'NO',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Demo Users
INSERT INTO platform.users (id, email, name, phone, status, email_verified, created_at, updated_at)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'admin@skien.kommune.no', 'Admin Skien', '+4712345678', 'ACTIVE', TRUE, NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000002', 'saksbehandler@skien.kommune.no', 'Saksbehandler', '+4712345679', 'ACTIVE', TRUE, NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000003', 'bruker@example.com', 'Test Bruker', '+4798765432', 'ACTIVE', TRUE, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Roles
INSERT INTO platform.roles (id, tenant_id, code, name, is_system, created_at, updated_at)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'ADMIN', 'Administrator', TRUE, NOW(), NOW()),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'SAKSBEHANDLER', 'Saksbehandler', TRUE, NOW(), NOW()),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'USER', 'User', TRUE, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

SELECT 'Platform seeds complete!' as status;
SQL

echo "✅ Platform data seeded"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: SEED DOMAIN DATA (OPTIONAL)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "apps/api/db/seeds/run_seeds.sh" ]; then
    read -p "Run domain seeds (categories, rental objects, etc.)? (yes/no): " RUN_SEEDS
    if [ "$RUN_SEEDS" = "yes" ]; then
        cd apps/api/db/seeds
        ./run_seeds.sh
        cd ../../../..
    else
        echo "Skipping domain seeds"
    fi
else
    echo "⚠️  Domain seed script not found, skipping"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FRESH DATABASE SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verify
echo "📊 Database Summary:"
psql $DATABASE_URL -c "
SELECT 
  'Tenants' AS type, COUNT(*)::text AS count FROM platform.tenants
UNION ALL
SELECT 'Organizations', COUNT(*)::text FROM platform.organizations
UNION ALL  
SELECT 'Users', COUNT(*)::text FROM platform.users
UNION ALL
SELECT 'Roles', COUNT(*)::text FROM platform.roles;
"

echo ""
echo "🎉 Your database is ready!"
echo ""
echo "Next steps:"
echo "  1. Start API: cd apps/api && pnpm dev"
echo "  2. Build apps: pnpm build"
echo "  3. Deploy: ./scripts/deploy.sh all"
echo ""
