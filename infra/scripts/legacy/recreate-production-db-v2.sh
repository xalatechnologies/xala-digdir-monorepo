#!/bin/bash
##############################################################################
# Production Database Recreation Script (v2 - with postgres superuser)
# Drops, recreates, and seeds the production database with fresh schema
##############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_USER="digilist"
DB_PASS="digilist_secure_2026"
DB_NAME="digilist_prod"
DB_HOST="localhost"
DB_PORT="5432"
POSTGRES_USER="postgres"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}Production Database Recreation${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

# Step 1: Backup existing database
echo -e "${YELLOW}Step 1: Creating backup...${NC}"
BACKUP_FILE="/root/backups/digilist_prod_backup_$(date +%Y%m%d_%H%M%S).sql"
mkdir -p /root/backups
if sudo -u postgres pg_dump "${DB_NAME}" > "${BACKUP_FILE}" 2>/dev/null; then
  echo -e "${GREEN}✅ Backup created: ${BACKUP_FILE}${NC}"
  ls -lh "${BACKUP_FILE}"
else
  echo -e "${YELLOW}⚠️  No existing database to backup (this is okay for first run)${NC}"
fi
echo ""

# Step 2: Drop and recreate database as postgres superuser
echo -e "${YELLOW}Step 2: Dropping and recreating database...${NC}"
sudo -u postgres psql <<EOF
-- Terminate all connections to the database
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '${DB_NAME}'
  AND pid <> pg_backend_pid();

-- Drop and recreate database
DROP DATABASE IF EXISTS ${DB_NAME};
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
EOF

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Database recreated successfully${NC}"
else
  echo -e "${RED}❌ Failed to recreate database${NC}"
  exit 1
fi
echo ""

# Step 3: Create named schemas
echo -e "${YELLOW}Step 3: Creating named schemas...${NC}"
sudo -u postgres psql -d "${DB_NAME}" <<EOF
-- Create named schemas
CREATE SCHEMA IF NOT EXISTS platform;
CREATE SCHEMA IF NOT EXISTS domain;
CREATE SCHEMA IF NOT EXISTS compliance;
CREATE SCHEMA IF NOT EXISTS monitoring;
CREATE SCHEMA IF NOT EXISTS saas;

-- Grant usage and create privileges
GRANT ALL PRIVILEGES ON SCHEMA platform TO ${DB_USER};
GRANT ALL PRIVILEGES ON SCHEMA domain TO ${DB_USER};
GRANT ALL PRIVILEGES ON SCHEMA compliance TO ${DB_USER};
GRANT ALL PRIVILEGES ON SCHEMA monitoring TO ${DB_USER};
GRANT ALL PRIVILEGES ON SCHEMA saas TO ${DB_USER};

-- Grant default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA platform GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA domain GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA compliance GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA monitoring GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA saas GRANT ALL ON TABLES TO ${DB_USER};

-- Set search path
ALTER DATABASE ${DB_NAME} SET search_path TO platform, domain, compliance, monitoring, saas, public;
ALTER USER ${DB_USER} SET search_path TO platform, domain, compliance, monitoring, saas, public;
EOF

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Schemas created successfully${NC}"
else
  echo -e "${RED}❌ Failed to create schemas${NC}"
  exit 1
fi
echo ""

# Step 4: Run Drizzle migrations (push schema)
echo -e "${YELLOW}Step 4: Applying database schema...${NC}"
cd /var/www/digilist-api
if [ -f "drizzle.config.ts" ]; then
  if DATABASE_URL="${DATABASE_URL}" npx drizzle-kit push --yes 2>&1 | tee /tmp/drizzle-push.log; then
    echo -e "${GREEN}✅ Schema applied successfully${NC}"
  else
    echo -e "${RED}❌ Failed to apply schema${NC}"
    cat /tmp/drizzle-push.log
    exit 1
  fi
else
  echo -e "${YELLOW}⚠️  drizzle.config.ts not found, skipping schema push${NC}"
  echo -e "${YELLOW}    Will rely on seed data to create tables${NC}"
fi
echo ""

# Step 5: Import seed data
echo -e "${YELLOW}Step 5: Importing comprehensive seed data...${NC}"
if [ -f "/var/www/digilist-api/db/seed-data-bank/import-rental-objects.cjs" ]; then
  cd /var/www/digilist-api/db/seed-data-bank
  if DATABASE_URL="${DATABASE_URL}" node import-rental-objects.cjs; then
    echo -e "${GREEN}✅ Seed data imported successfully${NC}"
  else
    echo -e "${RED}❌ Failed to import seed data${NC}"
    exit 1
  fi
else
  echo -e "${RED}❌ Seed import script not found${NC}"
  exit 1
fi
echo ""

# Step 6: Verify data
echo -e "${YELLOW}Step 6: Verifying imported data...${NC}"
sudo -u postgres psql -d "${DB_NAME}" <<EOF
\echo ''
\echo '=== Tenants ==='
SELECT COUNT(*) as tenant_count FROM platform.tenants;

\echo ''
\echo '=== Organizations ==='
SELECT COUNT(*) as org_count FROM platform.organizations;

\echo ''
\echo '=== Users ==='
SELECT COUNT(*) as user_count FROM platform.users;

\echo ''
\echo '=== Rental Objects (by category) ==='
SELECT category_key, COUNT(*) as count
FROM domain.rental_objects
GROUP BY category_key
ORDER BY category_key;

\echo ''
\echo '=== Rental Objects (by time mode) ==='
SELECT time_mode, COUNT(*) as count
FROM domain.rental_objects
GROUP BY time_mode
ORDER BY time_mode;

\echo ''
\echo '=== Rental Objects (by status) ==='
SELECT status, COUNT(*) as count
FROM domain.rental_objects
GROUP BY status
ORDER BY status;

\echo ''
\echo '=== Sample Rental Object ==='
SELECT id, name, category_key, time_mode, status
FROM domain.rental_objects
LIMIT 1;
EOF
echo ""

# Final summary
echo -e "${BLUE}============================================================${NC}"
echo -e "${GREEN}✅ Database recreation completed successfully!${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""
echo -e "Database: ${DB_NAME}"
echo -e "Backup:   ${BACKUP_FILE}"
echo -e "Schemas:  platform, domain, compliance, monitoring, saas"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Restart API server: pm2 restart digilist-api"
echo "2. Verify web-test loads data correctly"
echo "3. Test authentication flows"
echo "4. Test rental object display"
echo ""
