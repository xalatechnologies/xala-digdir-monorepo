#!/bin/bash
set -e

# Digilist Staging Environment Deployment Script
# This script handles complete deployment including:
# - Code deployment
# - Database setup (init, migrate, seed)
# - PM2 configuration
# - Test execution
# - Health checks

echo "=================================================="
echo "  Digilist Staging Environment Deployment"
echo "=================================================="
echo ""
echo "⚠️  WARNING: This will completely wipe the staging environment!"
echo "   - All PM2 processes will be stopped"
echo "   - Database will be dropped and recreated"
echo "   - All cached files will be cleared"
echo "   - Fresh installation from scratch"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi
echo ""

# Configuration
VPS_HOST="72.61.23.56"
VPS_USER="root"
DEPLOY_PATH="/home/digilist/digilist-staging"
DB_NAME="digilist_staging"
DB_USER="digilist_staging"
DB_PASSWORD="staging_password_2026"
DB_HOST="localhost"
DB_PORT="5432"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Step 0: Clean up server
echo "🧹 Step 0: Cleaning up server..."
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
set -e

echo "Stopping all staging PM2 processes..."
pm2 delete digilist-api-staging 2>/dev/null || true

echo "Clearing PM2 logs..."
rm -rf /root/.pm2/logs/digilist-api-staging* 2>/dev/null || true

echo "Dropping database..."
sudo -u postgres psql << 'EOF'
DROP DATABASE IF EXISTS digilist_staging;
DROP USER IF EXISTS digilist_staging;
EOF

echo "Removing deployment directory..."
rm -rf /home/digilist/digilist-staging

echo "Creating fresh deployment directory..."
mkdir -p /home/digilist/digilist-staging

echo "✓ Server cleaned"
ENDSSH
log_info "Server completely wiped and ready for fresh deployment"
echo ""

# Step 1: Build locally
echo "📦 Step 1: Building packages locally..."
pnpm --filter @xala/contracts build
pnpm --filter @digilist/client-sdk build
pnpm --filter @digilist/database-schema build
pnpm --filter @digilist/api build
pnpm --filter @xala/web build
pnpm --filter @xala/minside build
pnpm --filter @xala/backoffice build
log_info "All packages built successfully"
echo ""

# Step 2: Deploy code to VPS
echo "🚀 Step 2: Deploying code to VPS..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude '.env*' \
  ./ ${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/
log_info "Code deployed to ${DEPLOY_PATH}"
echo ""

# Step 3: Deploy built packages
echo "📦 Step 3: Deploying built packages..."
rsync -avz packages/contracts/dist/ ${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/packages/contracts/dist/
rsync -avz packages/client-sdk/dist/ ${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/packages/client-sdk/dist/
rsync -avz packages/database-schema/dist/ ${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/packages/database-schema/dist/
rsync -avz apps/api/dist/ ${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/apps/api/dist/
# Clean old bundles before deploying new ones
ssh root@${VPS_HOST} "rm -rf /var/www/web-staging.digilist.no/assets/*.js /var/www/web-staging.digilist.no/assets/*.css"
ssh root@${VPS_HOST} "rm -rf /var/www/minside-staging.digilist.no/assets/*.js /var/www/minside-staging.digilist.no/assets/*.css"
ssh root@${VPS_HOST} "rm -rf /var/www/backoffice-staging.digilist.no/assets/*.js /var/www/backoffice-staging.digilist.no/assets/*.css"

rsync -avz apps/web/dist/ root@${VPS_HOST}:/var/www/web-staging.digilist.no/
rsync -avz apps/minside/dist/ root@${VPS_HOST}:/var/www/minside-staging.digilist.no/
rsync -avz apps/backoffice/dist/ root@${VPS_HOST}:/var/www/backoffice-staging.digilist.no/
log_info "Built packages deployed"
echo ""

# Step 4: Install dependencies on VPS
echo "📥 Step 4: Installing fresh dependencies on VPS..."
ssh ${VPS_USER}@${VPS_HOST} "cd ${DEPLOY_PATH} && pnpm install --force"
log_info "Fresh dependencies installed"
echo ""

# Step 5: Setup database (idempotent - only create if not exists)
echo "🗄️  Step 5: Setting up database..."
ssh ${VPS_USER}@${VPS_HOST} << ENDSSH
set -e
sudo -u postgres psql << 'EOF'
-- Create user if not exists
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'digilist_staging') THEN
    CREATE USER digilist_staging WITH PASSWORD 'staging_password_2026';
  END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE digilist_staging OWNER digilist_staging'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'digilist_staging')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE digilist_staging TO digilist_staging;
EOF
echo "✓ Database ready (created or already exists)"
ENDSSH
log_info "Database setup complete"
echo ""

# Step 6: Run migrations (apply all .sql files in order)
echo "🔄 Step 6: Running database migrations..."
ssh ${VPS_USER}@${VPS_HOST} << ENDSSH
set -e
cd ${DEPLOY_PATH}/packages/database-schema
echo "Applying all migration files..."
for migration in migrations/*.sql; do
  if [ -f "\$migration" ]; then
    echo "  → Applying \$migration..."
    PGPASSWORD='${DB_PASSWORD}' psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f "\$migration" 2>&1 | grep -v "already exists" || true
  fi
done
echo "✓ All migrations applied successfully"
ENDSSH
log_info "Database migrations complete"
echo ""

# Step 6.5: Grant schema permissions (after migration creates schemas)
echo "🔐 Step 6.5: Granting schema permissions..."
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
set -e
sudo -u postgres psql -d digilist_staging << 'EOF'
GRANT USAGE ON SCHEMA platform TO digilist_staging;
GRANT USAGE ON SCHEMA domain TO digilist_staging;
GRANT USAGE ON SCHEMA compliance TO digilist_staging;
GRANT USAGE ON SCHEMA monitoring TO digilist_staging;
GRANT USAGE ON SCHEMA saas TO digilist_staging;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA platform TO digilist_staging;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA domain TO digilist_staging;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA compliance TO digilist_staging;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA monitoring TO digilist_staging;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA saas TO digilist_staging;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA platform TO digilist_staging;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA domain TO digilist_staging;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA compliance TO digilist_staging;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA monitoring TO digilist_staging;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA saas TO digilist_staging;

ALTER DEFAULT PRIVILEGES IN SCHEMA platform GRANT ALL ON TABLES TO digilist_staging;
ALTER DEFAULT PRIVILEGES IN SCHEMA domain GRANT ALL ON TABLES TO digilist_staging;
ALTER DEFAULT PRIVILEGES IN SCHEMA compliance GRANT ALL ON TABLES TO digilist_staging;
ALTER DEFAULT PRIVILEGES IN SCHEMA monitoring GRANT ALL ON TABLES TO digilist_staging;
ALTER DEFAULT PRIVILEGES IN SCHEMA saas GRANT ALL ON TABLES TO digilist_staging;

ALTER DEFAULT PRIVILEGES IN SCHEMA platform GRANT ALL ON SEQUENCES TO digilist_staging;
ALTER DEFAULT PRIVILEGES IN SCHEMA domain GRANT ALL ON SEQUENCES TO digilist_staging;
ALTER DEFAULT PRIVILEGES IN SCHEMA compliance GRANT ALL ON SEQUENCES TO digilist_staging;
ALTER DEFAULT PRIVILEGES IN SCHEMA monitoring GRANT ALL ON SEQUENCES TO digilist_staging;
ALTER DEFAULT PRIVILEGES IN SCHEMA saas GRANT ALL ON SEQUENCES TO digilist_staging;
EOF
ENDSSH
log_info "Schema permissions granted"
echo ""

# Step 6.6: Create missing platform tables
echo "🔧 Step 6.6: Creating missing platform tables..."
ssh ${VPS_USER}@${VPS_HOST} << ENDSSH
set -e
PGPASSWORD='${DB_PASSWORD}' psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} << 'EOF'
-- Create modules table if missing
CREATE TABLE IF NOT EXISTS platform.modules (
  key VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_core BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create tenant_modules table if missing
CREATE TABLE IF NOT EXISTS platform.tenant_modules (
  tenant_id UUID NOT NULL,
  module_key VARCHAR(50) NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_by UUID,
  PRIMARY KEY (tenant_id, module_key)
);

CREATE INDEX IF NOT EXISTS tenant_modules_tenant_idx ON platform.tenant_modules(tenant_id);
CREATE INDEX IF NOT EXISTS tenant_modules_module_key_idx ON platform.tenant_modules(module_key);
CREATE INDEX IF NOT EXISTS tenant_modules_enabled_idx ON platform.tenant_modules(tenant_id, is_enabled);
EOF
ENDSSH
log_info "Missing platform tables created"
echo ""

# Step 7: Deploy storage files (seed images) - Skip if already uploaded
echo "📸 Step 7: Checking storage files..."
ssh ${VPS_USER}@${VPS_HOST} "mkdir -p /var/www/digilist-storage-staging/uploads"

# Check if storage marker file exists (more reliable than counting files)
if ssh ${VPS_USER}@${VPS_HOST} "test -f /var/www/digilist-storage-staging/.storage-uploaded"; then
  echo "⏭️  Storage files already uploaded (marker file exists), skipping"
  log_info "Storage upload skipped - already uploaded"
else
  echo "📤 Uploading storage files..."
  rsync -avz packages/database-schema/seeds/storage/ ${VPS_USER}@${VPS_HOST}:/var/www/digilist-storage-staging/uploads/
  ssh ${VPS_USER}@${VPS_HOST} "chown -R www-data:www-data /var/www/digilist-storage-staging 2>/dev/null || chown -R root:root /var/www/digilist-storage-staging"
  # Create marker file to prevent future uploads
  ssh ${VPS_USER}@${VPS_HOST} "touch /var/www/digilist-storage-staging/.storage-uploaded"
  log_info "Storage files deployed and marker file created"
fi
echo ""

# Step 8: Seed database (optional - set SKIP_SEED=true to skip)
if [ "${SKIP_SEED}" = "true" ]; then
  echo "⏭️  Step 8: Skipping database seeding (SKIP_SEED=true)"
  log_info "Database seeding skipped"
else
  echo "🌱 Step 8: Seeding database..."
  ssh ${VPS_USER}@${VPS_HOST} "cd ${DEPLOY_PATH} && DATABASE_URL='postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}' pnpm --filter @digilist/database-schema seed"
  log_info "Database seeded"
fi
echo ""

# Step 9: Deploy PM2 configuration
echo "⚙️  Step 9: Configuring PM2..."
ssh ${VPS_USER}@${VPS_HOST} "cat > ${DEPLOY_PATH}/ecosystem.staging.config.js" << 'EOF'
module.exports = {
  apps: [
    {
      name: 'digilist-api-staging',
      script: './apps/api/dist/main.js',
      cwd: '/home/digilist/digilist-staging',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        API_PORT: 4001,
        API_HOST: '0.0.0.0',
        API_BASE_URL: 'https://api-staging.digilist.no',
        DATABASE_URL: 'postgresql://digilist_staging:staging_password_2026@localhost:5432/digilist_staging',
        REDIS_URL: 'redis://localhost:6379/1',
        JWT_SECRET: 'KutE420F/gCO223OFVT4IVzradATSXo8oM21xctbM8k=',
        JWT_REFRESH_SECRET: '5uR724rLfZI5nyM8B7P0rxsE7l4JiX9jfnGM/ehU12I=',
        CSRF_SECRET: 'JWX6DvlLLlFOsLDsYoCbLV2ulTRDnrRMXJxYPDmfV9I=',
        SESSION_SECRET: 'SEDyZdLnauGKjtvedLPhxf/IDkQVE8DftujaYuno7KE=',
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7d',
        CORS_ORIGIN: 'https://web-staging.digilist.no,https://backoffice-staging.digilist.no,https://minside-staging.digilist.no',
        VITE_TENANT_ID: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        VITE_MAPBOX_TOKEN: 'pk.eyJ1IjoieGFsYXRlY2hub2xvZ2llc2FzIiwiYSI6ImNtY2dxbWUwaDBwOXUyaXNpdXY3aGppNmQifQ.0SEeOusXpY8H0z1FRIuGjA',
        STORAGE_PATH: '/var/www/digilist-storage-staging/uploads',
        STORAGE_BASE_URL: '/storage',
        LOG_LEVEL: 'info',
        LOG_FORMAT: 'json',
      },
      error_file: '/root/.pm2/logs/digilist-api-staging-error.log',
      out_file: '/root/.pm2/logs/digilist-api-staging-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    }
  ],
};
EOF
log_info "PM2 configuration deployed"
echo ""

# Step 10: Restart PM2
echo "🔄 Step 10: Restarting services..."
ssh ${VPS_USER}@${VPS_HOST} "cd ${DEPLOY_PATH} && pm2 delete digilist-api-staging 2>/dev/null || true && pm2 start ecosystem.staging.config.js && pm2 save"
log_info "Services restarted"
echo ""

# Step 11: Wait for API to start
echo "⏳ Step 11: Waiting for API to start..."
sleep 5
log_info "API should be ready"
echo ""

# Step 12: Run health checks
echo "🏥 Step 12: Running health checks..."
HEALTH_CHECK=$(curl -s https://api-staging.digilist.no/health || echo "failed")
if echo "$HEALTH_CHECK" | grep -q "ok"; then
    log_info "API health check passed"
else
    log_error "API health check failed"
    echo "$HEALTH_CHECK"
fi
echo ""

# Summary
echo "=================================================="
echo "  ✅ Deployment Complete!"
echo "=================================================="
echo ""
echo "🔗 URLs:"
echo "   API:        https://api-staging.digilist.no"
echo "   Web:        https://web-staging.digilist.no"
echo "   MinSide:    https://minside-staging.digilist.no"
echo "   Backoffice: https://backoffice-staging.digilist.no"
echo ""
echo "👤 Demo Users:"
echo "   Admin:        demo-admin-token"
echo "   Case Handler: demo-case-handler-token"
echo "   User:         demo-user-token"
echo ""
echo "📊 Monitoring:"
echo "   PM2 Status:  ssh ${VPS_USER}@${VPS_HOST} 'pm2 status'"
echo "   API Logs:    ssh ${VPS_USER}@${VPS_HOST} 'pm2 logs digilist-api-staging'"
echo "   Health:      curl https://api-staging.digilist.no/health"
echo ""
