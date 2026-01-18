#!/bin/bash
# =============================================================================
# Remote Deployment Script
# Runs database operations on remote server, then builds and deploys apps
# Date: 2026-01-17
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Functions
print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_header() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Load credentials
load_credentials() {
    if [ ! -f "$PROJECT_ROOT/.env.production" ]; then
        print_error ".env.production not found!"
        exit 1
    fi

    print_status "Loading SSH credentials..."

    export SERVER_HOST=$(grep '^SERVER_HOST=' "$PROJECT_ROOT/.env.production" | cut -d '=' -f2)
    export SERVER_PORT=$(grep '^SERVER_PORT=' "$PROJECT_ROOT/.env.production" | cut -d '=' -f2)
    export SERVER_USER=$(grep '^SERVER_USER=' "$PROJECT_ROOT/.env.production" | cut -d '=' -f2)

    if [ -z "$SERVER_HOST" ] || [ -z "$SERVER_PORT" ] || [ -z "$SERVER_USER" ]; then
        print_error "Missing SSH credentials in .env.production"
        exit 1
    fi

    print_success "Credentials loaded: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"
}

# =============================================================================
# STEP 1: Remote Database Operations
# =============================================================================
setup_remote_database() {
    print_header "STEP 1: Setting Up Remote Database"

    print_status "Connecting to remote server..."

    ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" << 'REMOTE_SCRIPT'
set -e

echo "[INFO] Creating fresh database..."

# Connect to PostgreSQL on remote server
sudo -u postgres psql << 'SQL'
-- Drop existing database if exists
DROP DATABASE IF EXISTS digilist_prod;

-- Create fresh database
CREATE DATABASE digilist_prod;

-- Connect to the new database
\c digilist_prod

-- Create schemas
CREATE SCHEMA IF NOT EXISTS platform;
CREATE SCHEMA IF NOT EXISTS domain;
CREATE SCHEMA IF NOT EXISTS monitoring;
CREATE SCHEMA IF NOT EXISTS compliance;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

SELECT 'Database created successfully' as status;
SQL

echo "[SUCCESS] Database created"

# Navigate to API directory
cd /var/www/digilist-api || exit 1

echo "[INFO] Running migrations..."

# Run migrations
for migration in drizzle/*.sql; do
    if [ -f "$migration" ]; then
        echo "[INFO] Applying: $(basename $migration)"
        sudo -u postgres psql digilist_prod < "$migration" || echo "[WARNING] Migration may have partially failed"
    fi
done

echo "[SUCCESS] Migrations complete"

echo "[INFO] Seeding database..."

# Run seed with correct schema
sudo -u postgres psql digilist_prod << 'SEED'
-- Insert enums (idempotent)
INSERT INTO platform.enum_tenant_status(code) VALUES ('ACTIVE'),('SUSPENDED'),('DELETED') ON CONFLICT DO NOTHING;
INSERT INTO platform.enum_user_status(code) VALUES ('ACTIVE'),('INVITED'),('SUSPENDED'),('DELETED') ON CONFLICT DO NOTHING;
INSERT INTO platform.enum_membership_status(code) VALUES ('ACTIVE'),('INACTIVE') ON CONFLICT DO NOTHING;
INSERT INTO platform.enum_role_code(code) VALUES ('PUBLIC'),('USER'),('SAKSBEHANDLER'),('ADMIN'),('TENANT_ADMIN'),('SUPER_ADMIN') ON CONFLICT DO NOTHING;

-- Tenant (using correct column names: id, slug, name, status, default_locale)
INSERT INTO platform.tenants (id, slug, name, status, default_locale, created_at, updated_at)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'skien',
  'Skien Kommune',
  'ACTIVE',
  'nb',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Organization (using correct column names: id, tenant_id, name, org_no, status)
INSERT INTO platform.organizations (id, tenant_id, name, org_no, status, created_at, updated_at)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Skien Kommune',
  '964951211',
  'ACTIVE',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Users (using correct column names: id, tenant_id, email, display_name, phone, status, locale)
INSERT INTO platform.users (id, tenant_id, email, display_name, phone, status, locale, created_at, updated_at)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'admin@skien.kommune.no', 'Admin Skien', '+4712345678', 'ACTIVE', 'nb', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000002', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'saksbehandler@skien.kommune.no', 'Saksbehandler', '+4712345679', 'ACTIVE', 'nb', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000003', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'bruker@example.com', 'Test Bruker', '+4798765432', 'ACTIVE', 'nb', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000004', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'user2@example.com', 'Kari Nordmann', '+4798765433', 'ACTIVE', 'nb', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000005', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'user3@example.com', 'Ola Nordmann', '+4798765434', 'ACTIVE', 'nb', NOW(), NOW())
ON CONFLICT (tenant_id, email) DO UPDATE SET updated_at = NOW();

-- Organization membership (using correct table name: user_org_memberships)
INSERT INTO platform.user_org_memberships (id, tenant_id, organization_id, user_id, membership_status, created_at)
VALUES
  (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'ACTIVE', NOW()),
  (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'ACTIVE', NOW()),
  (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'ACTIVE', NOW())
ON CONFLICT (tenant_id, organization_id, user_id) DO NOTHING;

-- Roles (using correct column names: id, tenant_id, code, name, is_system)
INSERT INTO platform.roles (id, tenant_id, code, name, is_system, created_at)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'ADMIN', 'Administrator', TRUE, NOW()),
  ('d0000000-0000-0000-0000-000000000002', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'SAKSBEHANDLER', 'Saksbehandler', TRUE, NOW()),
  ('d0000000-0000-0000-0000-000000000003', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'USER', 'User', TRUE, NOW())
ON CONFLICT (tenant_id, code) DO NOTHING;

-- User roles (using correct column names: id, tenant_id, user_id, role_id, scope_type)
INSERT INTO platform.user_roles (id, tenant_id, user_id, role_id, scope_type, created_at)
VALUES
  (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'TENANT', NOW()),
  (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'TENANT', NOW()),
  (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'TENANT', NOW()),
  (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000003', 'TENANT', NOW()),
  (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000003', 'TENANT', NOW())
ON CONFLICT (tenant_id, user_id, role_id, scope_type, organization_id) DO NOTHING;

SELECT
  'Seeds complete!' as message,
  (SELECT COUNT(*) FROM platform.tenants) as tenants,
  (SELECT COUNT(*) FROM platform.organizations) as organizations,
  (SELECT COUNT(*) FROM platform.users) as users,
  (SELECT COUNT(*) FROM platform.roles) as roles,
  (SELECT COUNT(*) FROM platform.user_org_memberships) as memberships,
  (SELECT COUNT(*) FROM platform.user_roles) as user_roles;
SEED

echo "[SUCCESS] Database seeded"
REMOTE_SCRIPT

    print_success "Remote database setup complete"
}

# =============================================================================
# STEP 2: Build and Deploy Apps
# =============================================================================
deploy_all_apps() {
    print_header "STEP 2: Building and Deploying Apps"

    cd "$PROJECT_ROOT"
    bash "$SCRIPT_DIR/deploy.sh" all
}

# =============================================================================
# MAIN
# =============================================================================
main() {
    print_header "🚀 REMOTE DEPLOYMENT"

    load_credentials
    setup_remote_database
    deploy_all_apps

    print_header "🎉 DEPLOYMENT COMPLETE!"
    echo ""
    echo "✅ Database created and seeded on remote server"
    echo "✅ All apps built and deployed"
    echo ""
    echo "🌐 Access your apps at:"
    echo "   - https://web-test.digilist.no"
    echo "   - https://backoffice-test.digilist.no"
    echo "   - https://minside-test.digilist.no"
    echo "   - https://saas-admin.digilist.no"
    echo "   - https://tenant-admin.digilist.no"
    echo ""
}

main "$@"
