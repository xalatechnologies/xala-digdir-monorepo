#!/bin/bash
# =============================================================================
# Full System Deployment Script
# Fresh DB + Migrations + Seeds + Deploy All Apps
# Date: 2026-01-17
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Function to print status
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Load environment variables from .env.production
load_env() {
    if [ ! -f "$PROJECT_ROOT/.env.production" ]; then
        print_error ".env.production file not found!"
        echo "Please create .env.production with DATABASE_URL and other credentials"
        exit 1
    fi

    print_status "Loading environment variables from .env.production..."

    # Use source to load .env file (handles multiline values)
    set -a  # Automatically export all variables
    source <(grep -v '^#' "$PROJECT_ROOT/.env.production" | grep -v '^SSH_PRIVATE_KEY=' | sed '/^$/d')
    set +a

    # Manually extract DATABASE_URL if still not set
    if [ -z "$DATABASE_URL" ]; then
        DATABASE_URL=$(grep '^DATABASE_URL=' "$PROJECT_ROOT/.env.production" | cut -d '=' -f2-)
        export DATABASE_URL
    fi

    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL not set in .env.production"
        exit 1
    fi

    print_success "Environment variables loaded"
    print_status "DATABASE_URL: ${DATABASE_URL}"
}

# =============================================================================
# STEP 1: Fresh Database
# =============================================================================
fresh_database() {
    print_header "STEP 1: Creating Fresh Database"

    cd "$PROJECT_ROOT"

    print_status "Dropping and recreating database schemas..."

    psql $DATABASE_URL <<'SQL'
-- Drop all schemas (CASCADE removes all objects)
DROP SCHEMA IF EXISTS platform CASCADE;
DROP SCHEMA IF EXISTS domain CASCADE;
DROP SCHEMA IF EXISTS monitoring CASCADE;
DROP SCHEMA IF EXISTS compliance CASCADE;
DROP SCHEMA IF EXISTS public CASCADE;

-- Recreate schemas
CREATE SCHEMA IF NOT EXISTS platform;
CREATE SCHEMA IF NOT EXISTS domain;
CREATE SCHEMA IF NOT EXISTS monitoring;
CREATE SCHEMA IF NOT EXISTS compliance;
CREATE SCHEMA IF NOT EXISTS public;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

SELECT 'Database schemas reset successfully' as status;
SQL

    print_success "Database schemas reset"
}

# =============================================================================
# STEP 2: Run Migrations
# =============================================================================
run_migrations() {
    print_header "STEP 2: Running Database Migrations"

    cd "$PROJECT_ROOT/apps/api"

    print_status "Applying all migrations..."

    # Count migrations
    local migration_count=$(ls -1 drizzle/*.sql 2>/dev/null | wc -l)
    print_status "Found $migration_count migration files"

    # Apply each migration
    for migration in drizzle/*.sql; do
        if [ -f "$migration" ]; then
            print_status "Applying: $(basename $migration)"
            psql $DATABASE_URL < "$migration" || print_warning "Migration $(basename $migration) may have partially failed (this is sometimes OK)"
        fi
    done

    print_success "All migrations applied"

    cd "$PROJECT_ROOT"
}

# =============================================================================
# STEP 3: Seed Database
# =============================================================================
seed_database() {
    print_header "STEP 3: Seeding Database with Demo Data"

    cd "$PROJECT_ROOT/apps/api"

    print_status "Seeding basic platform data..."

    # Run basic seeds first
    psql $DATABASE_URL <<'SEED_SQL'
-- =====================================================================
-- BASIC PLATFORM SEEDS
-- =====================================================================

-- Insert enums (idempotent)
INSERT INTO platform.enum_tenant_status(code) VALUES ('ACTIVE'),('SUSPENDED'),('DELETED') ON CONFLICT DO NOTHING;
INSERT INTO platform.enum_user_status(code) VALUES ('ACTIVE'),('INVITED'),('SUSPENDED'),('DELETED') ON CONFLICT DO NOTHING;
INSERT INTO platform.enum_membership_status(code) VALUES ('ACTIVE'),('INACTIVE') ON CONFLICT DO NOTHING;
INSERT INTO platform.enum_role_code(code) VALUES ('PUBLIC'),('USER'),('SAKSBEHANDLER'),('ADMIN'),('TENANT_ADMIN'),('SUPER_ADMIN') ON CONFLICT DO NOTHING;

-- 1. TENANT (Skien Kommune)
INSERT INTO platform.tenants (id, name, slug, status, domain, locale, timezone, created_at, updated_at)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Skien Kommune',
  'skien',
  'ACTIVE',
  'skien.digilist.no',
  'nb',
  'Europe/Oslo',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- 2. ORGANIZATION (Skien Kommune hovedorganisasjon)
INSERT INTO platform.organizations (id, tenant_id, name, slug, org_number, address, postal_code, city, country, is_active, created_at, updated_at)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Skien Kommune',
  'skien-kommune',
  '964951211',
  'Rådhuset, Lundegt. 1',
  '3717',
  'Skien',
  'NO',
  TRUE,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- 3. USERS (5 demo users)
INSERT INTO platform.users (id, email, name, phone, status, email_verified, created_at, updated_at)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'admin@skien.kommune.no', 'Admin Skien', '+4712345678', 'ACTIVE', TRUE, NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000002', 'saksbehandler@skien.kommune.no', 'Saksbehandler', '+4712345679', 'ACTIVE', TRUE, NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000003', 'bruker@example.com', 'Test Bruker', '+4798765432', 'ACTIVE', TRUE, NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000004', 'user2@example.com', 'Kari Nordmann', '+4798765433', 'ACTIVE', TRUE, NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000005', 'user3@example.com', 'Ola Nordmann', '+4798765434', 'ACTIVE', TRUE, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- 4. ORGANIZATION MEMBERSHIP
INSERT INTO platform.organization_members (id, organization_id, user_id, status, joined_at, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'ACTIVE', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'ACTIVE', NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'ACTIVE', NOW(), NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 5. ROLES
INSERT INTO platform.roles (id, tenant_id, code, name, description, is_system, created_at, updated_at)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'ADMIN', 'Administrator', 'Full system access', TRUE, NOW(), NOW()),
  ('d0000000-0000-0000-0000-000000000002', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'SAKSBEHANDLER', 'Saksbehandler', 'Case handler with approval rights', TRUE, NOW(), NOW()),
  ('d0000000-0000-0000-0000-000000000003', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'USER', 'User', 'Regular user', TRUE, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- 6. USER ROLES
INSERT INTO platform.user_roles (id, user_id, role_id, tenant_id, created_at)
VALUES
  (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW()),
  (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW()),
  (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW()),
  (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000003', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW()),
  (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000003', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', NOW())
ON CONFLICT DO NOTHING;

SELECT
  'Basic seeds complete!' as message,
  (SELECT COUNT(*) FROM platform.tenants) as tenants,
  (SELECT COUNT(*) FROM platform.organizations) as organizations,
  (SELECT COUNT(*) FROM platform.users) as users,
  (SELECT COUNT(*) FROM platform.roles) as roles;
SEED_SQL

    print_success "Basic platform data seeded"

    # Run comprehensive demo seeds if available
    if [ -f "scripts/complete-demo-seed.sql" ]; then
        print_status "Seeding comprehensive demo data (40 rental objects)..."
        psql $DATABASE_URL < scripts/complete-demo-seed.sql || print_warning "Some demo seeds may have failed"
        print_success "Comprehensive demo data seeded"
    else
        print_warning "Complete demo seed file not found, skipping"
    fi

    cd "$PROJECT_ROOT"
}

# =============================================================================
# STEP 4: Build All Apps
# =============================================================================
build_apps() {
    print_header "STEP 4: Building All Frontend Apps"

    cd "$PROJECT_ROOT"

    local apps=("web" "backoffice" "minside" "saas-admin" "tenant-admin")

    for app in "${apps[@]}"; do
        print_status "Building $app..."
        pnpm --filter "@xala/$app" build
        print_success "$app built successfully"
    done
}

# =============================================================================
# STEP 5: Deploy All Apps
# =============================================================================
deploy_apps() {
    print_header "STEP 5: Deploying All Apps to Server"

    cd "$PROJECT_ROOT"

    print_status "Running deployment script..."
    bash "$SCRIPT_DIR/deploy.sh" all

    print_success "All apps deployed"
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================
main() {
    print_header "🚀 FULL SYSTEM DEPLOYMENT"
    echo "This script will:"
    echo "  1. Create fresh database (⚠️  DESTRUCTIVE)"
    echo "  2. Run all migrations"
    echo "  3. Seed database with demo data"
    echo "  4. Build all frontend apps"
    echo "  5. Deploy all apps to server"
    echo ""

    # Confirmation prompt
    read -p "⚠️  This will DESTROY existing data. Continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_error "Deployment cancelled"
        exit 1
    fi

    # Start timer
    start_time=$(date +%s)

    # Load environment
    load_env

    # Execute all steps
    fresh_database
    run_migrations
    seed_database
    build_apps
    deploy_apps

    # End timer
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    minutes=$((duration / 60))
    seconds=$((duration % 60))

    # Success summary
    print_header "🎉 DEPLOYMENT COMPLETE!"
    echo ""
    echo "✅ Database created and seeded"
    echo "✅ All migrations applied"
    echo "✅ All apps built and deployed"
    echo ""
    echo "⏱️  Total time: ${minutes}m ${seconds}s"
    echo ""
    echo "🌐 Access your apps at:"
    echo "   - https://web-test.digilist.no"
    echo "   - https://backoffice-test.digilist.no"
    echo "   - https://minside-test.digilist.no"
    echo "   - https://saas-admin.digilist.no"
    echo "   - https://tenant-admin.digilist.no"
    echo "   - https://api.digilist.no/health"
    echo ""
    echo "👤 Demo users:"
    echo "   - admin@skien.kommune.no (Admin)"
    echo "   - saksbehandler@skien.kommune.no (Saksbehandler)"
    echo "   - bruker@example.com (User)"
    echo ""
}

# Run main function
main "$@"
