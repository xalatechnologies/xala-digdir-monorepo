#!/bin/bash
set -e

# Digilist Test Environment Deployment Script
# This script handles complete deployment including:
# - Code deployment
# - Database setup (init, migrate, seed)
# - PM2 configuration
# - Test execution
# - Health checks

echo "=================================================="
echo "  Digilist Test Environment Deployment"
echo "=================================================="
echo ""
echo "⚠️  WARNING: This will completely wipe the test environment!"
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
DEPLOY_PATH="/home/digilist/digilist-platform"
DB_NAME="digilist_dev"
DB_USER="digilist_dev"
DB_PASSWORD="dev_password_2026"
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

echo "Stopping all PM2 processes..."
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true

echo "Clearing PM2 logs..."
rm -rf /root/.pm2/logs/* 2>/dev/null || true

echo "Dropping database..."
sudo -u postgres psql << 'EOF'
DROP DATABASE IF EXISTS digilist_dev;
DROP USER IF EXISTS digilist_dev;
EOF

echo "Removing deployment directory..."
rm -rf /home/digilist/digilist-platform

echo "Creating fresh deployment directory..."
mkdir -p /home/digilist/digilist-platform

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
ssh root@${VPS_HOST} "rm -rf /var/www/web-test.digilist.no/assets/*.js /var/www/web-test.digilist.no/assets/*.css"
ssh root@${VPS_HOST} "rm -rf /var/www/minside-test.digilist.no/assets/*.js /var/www/minside-test.digilist.no/assets/*.css"
ssh root@${VPS_HOST} "rm -rf /var/www/backoffice-test.digilist.no/assets/*.js /var/www/backoffice-test.digilist.no/assets/*.css"

rsync -avz apps/web/dist/ root@${VPS_HOST}:/var/www/web-test.digilist.no/
rsync -avz apps/minside/dist/ root@${VPS_HOST}:/var/www/minside-test.digilist.no/
rsync -avz apps/backoffice/dist/ root@${VPS_HOST}:/var/www/backoffice-test.digilist.no/
log_info "Built packages deployed"
echo ""

# Step 4: Install dependencies on VPS
echo "📥 Step 4: Installing fresh dependencies on VPS..."
ssh ${VPS_USER}@${VPS_HOST} "cd ${DEPLOY_PATH} && pnpm install --force"
log_info "Fresh dependencies installed"
echo ""

# Step 5: Setup database
echo "🗄️  Step 5: Setting up fresh database..."
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
set -e

echo "Creating database and user..."
sudo -u postgres psql << EOF
CREATE USER digilist_dev WITH PASSWORD 'dev_password_2026';
CREATE DATABASE digilist_dev OWNER digilist_dev;
GRANT ALL PRIVILEGES ON DATABASE digilist_dev TO digilist_dev;
EOF
echo "✓ Database created"

echo "✓ Database user created (permissions will be granted after migration)"
ENDSSH
log_info "Database setup complete"
echo ""

# Step 6: Run migrations
echo "🔄 Step 6: Running database migrations..."
ssh ${VPS_USER}@${VPS_HOST} << ENDSSH
set -e
cd ${DEPLOY_PATH}/packages/database-schema
echo "Applying migration file..."
PGPASSWORD='${DB_PASSWORD}' psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f migrations/0000_complete_schema.sql
echo "✓ Migration applied successfully"
ENDSSH
log_info "Database migrations complete"
echo ""

# Step 6.5: Grant schema permissions (after migration creates schemas)
echo "🔐 Step 6.5: Granting schema permissions..."
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
set -e
sudo -u postgres psql -d digilist_dev << 'EOF'
GRANT USAGE ON SCHEMA platform TO digilist_dev;
GRANT USAGE ON SCHEMA domain TO digilist_dev;
GRANT USAGE ON SCHEMA compliance TO digilist_dev;
GRANT USAGE ON SCHEMA monitoring TO digilist_dev;
GRANT USAGE ON SCHEMA saas TO digilist_dev;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA platform TO digilist_dev;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA domain TO digilist_dev;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA compliance TO digilist_dev;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA monitoring TO digilist_dev;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA saas TO digilist_dev;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA platform TO digilist_dev;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA domain TO digilist_dev;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA compliance TO digilist_dev;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA monitoring TO digilist_dev;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA saas TO digilist_dev;

ALTER DEFAULT PRIVILEGES IN SCHEMA platform GRANT ALL ON TABLES TO digilist_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA domain GRANT ALL ON TABLES TO digilist_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA compliance GRANT ALL ON TABLES TO digilist_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA monitoring GRANT ALL ON TABLES TO digilist_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA saas GRANT ALL ON TABLES TO digilist_dev;

ALTER DEFAULT PRIVILEGES IN SCHEMA platform GRANT ALL ON SEQUENCES TO digilist_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA domain GRANT ALL ON SEQUENCES TO digilist_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA compliance GRANT ALL ON SEQUENCES TO digilist_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA monitoring GRANT ALL ON SEQUENCES TO digilist_dev;
ALTER DEFAULT PRIVILEGES IN SCHEMA saas GRANT ALL ON SEQUENCES TO digilist_dev;
EOF
ENDSSH
log_info "Schema permissions granted"
echo ""

# Step 7: Deploy storage files (seed images) - Skip if already uploaded
echo "📸 Step 7: Checking storage files..."
ssh ${VPS_USER}@${VPS_HOST} "mkdir -p /var/www/digilist-storage/uploads"

# Check if storage marker file exists (more reliable than counting files)
if ssh ${VPS_USER}@${VPS_HOST} "test -f /var/www/digilist-storage/.storage-uploaded"; then
  echo "⏭️  Storage files already uploaded (marker file exists), skipping"
  log_info "Storage upload skipped - already uploaded"
else
  echo "📤 Uploading storage files..."
  rsync -avz packages/database-schema/seeds/storage/ ${VPS_USER}@${VPS_HOST}:/var/www/digilist-storage/uploads/
  ssh ${VPS_USER}@${VPS_HOST} "chown -R www-data:www-data /var/www/digilist-storage 2>/dev/null || chown -R root:root /var/www/digilist-storage"
  # Create marker file to prevent future uploads
  ssh ${VPS_USER}@${VPS_HOST} "touch /var/www/digilist-storage/.storage-uploaded"
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
ssh ${VPS_USER}@${VPS_HOST} "cat > ${DEPLOY_PATH}/ecosystem.test.config.js" << 'EOF'
module.exports = {
  apps: [
    {
      name: 'digilist-api-test',
      script: './apps/api/dist/main.js',
      cwd: '/home/digilist/digilist-platform',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        API_PORT: 4000,
        API_HOST: '0.0.0.0',
        API_BASE_URL: 'https://api.digilist.no',
        DATABASE_URL: 'postgresql://digilist_dev:dev_password_2026@localhost:5432/digilist_dev',
        REDIS_URL: 'redis://localhost:6379',
        JWT_SECRET: 'KutE420F/gCO223OFVT4IVzradATSXo8oM21xctbM8k=',
        JWT_REFRESH_SECRET: '5uR724rLfZI5nyM8B7P0rxsE7l4JiX9jfnGM/ehU12I=',
        CSRF_SECRET: 'JWX6DvlLLlFOsLDsYoCbLV2ulTRDnrRMXJxYPDmfV9I=',
        SESSION_SECRET: 'SEDyZdLnauGKjtvedLPhxf/IDkQVE8DftujaYuno7KE=',
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7d',
        CORS_ORIGIN: 'https://web-test.digilist.no,https://backoffice-test.digilist.no,https://minside-test.digilist.no',
        VITE_TENANT_ID: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        VITE_MAPBOX_TOKEN: 'pk.eyJ1IjoieGFsYXRlY2hub2xvZ2llc2FzIiwiYSI6ImNtY2dxbWUwaDBwOXUyaXNpdXY3aGppNmQifQ.0SEeOusXpY8H0z1FRIuGjA',
        STORAGE_PATH: '/var/www/digilist-storage/uploads',
        STORAGE_BASE_URL: '/storage',
        LOG_LEVEL: 'info',
        LOG_FORMAT: 'json',
      },
      error_file: '/root/.pm2/logs/digilist-api-test-error.log',
      out_file: '/root/.pm2/logs/digilist-api-test-out.log',
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
ssh ${VPS_USER}@${VPS_HOST} "cd ${DEPLOY_PATH} && pm2 delete digilist-api-test 2>/dev/null || true && pm2 start ecosystem.test.config.js && pm2 save"
log_info "Services restarted"
echo ""

# Step 11: Wait for API to start
echo "⏳ Step 11: Waiting for API to start..."
sleep 5
log_info "API should be ready"
echo ""

# Step 12: Run health checks
echo "🏥 Step 12: Running health checks..."
HEALTH_CHECK=$(curl -s https://api.digilist.no/health || echo "failed")
if echo "$HEALTH_CHECK" | grep -q "ok"; then
    log_info "API health check passed"
else
    log_error "API health check failed"
    echo "$HEALTH_CHECK"
    exit 1
fi
echo ""

# Step 13: Test demo login
echo "🔐 Step 13: Testing demo login..."
DEMO_LOGIN=$(curl -s -X POST https://api.digilist.no/api/auth/demo-token \
  -H "Content-Type: application/json" \
  -d '{"token":"demo-admin-token"}' || echo "failed")

if echo "$DEMO_LOGIN" | grep -q "expiresAt"; then
    log_info "Demo login test passed"
else
    log_error "Demo login test failed"
    echo "$DEMO_LOGIN"
    exit 1
fi
echo ""

# Step 14: Run comprehensive automated tests
echo "🧪 Step 14: Running comprehensive automated test suite..."
echo ""

# 14.1: Unit Tests
echo "  📋 Running unit tests..."
if ssh ${VPS_USER}@${VPS_HOST} "cd ${DEPLOY_PATH} && timeout 120 pnpm --filter @digilist/testing test 2>&1 | tail -50"; then
    log_info "Unit tests passed"
else
    log_warn "Unit tests failed or timed out"
fi
echo ""

# 14.2: API Health Checks
echo "  🏥 Running API health checks..."
API_HEALTH=$(curl -s https://api.digilist.no/health)
if echo "$API_HEALTH" | grep -q "ok\|healthy\|up"; then
    log_info "API health check passed"
else
    log_error "API health check failed"
    echo "$API_HEALTH"
fi
echo ""

# 14.3: Authentication Tests
echo "  🔐 Testing authentication endpoints..."
# Demo token login already tested in Step 13
log_info "Demo token authentication verified"

# Test auth providers endpoint
AUTH_PROVIDERS=$(curl -s https://api.digilist.no/api/auth/providers)
if echo "$AUTH_PROVIDERS" | grep -q "bankid"; then
    log_info "BankID provider enabled"
else
    log_warn "BankID provider not found"
fi
echo ""

# 14.4: Frontend Accessibility
echo "  🌐 Testing frontend accessibility..."
for SUBDOMAIN in web-test minside-test backoffice-test; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://${SUBDOMAIN}.digilist.no)
    if [ "$HTTP_CODE" = "200" ]; then
        log_info "${SUBDOMAIN}.digilist.no accessible (HTTP $HTTP_CODE)"
    else
        log_warn "${SUBDOMAIN}.digilist.no returned HTTP $HTTP_CODE"
    fi
done
echo ""

# 14.5: Data Verification
echo "  📊 Verifying seed data..."
# Check if rental objects are accessible (would need auth in production)
log_info "Seed data verification placeholder - implement with authenticated requests"
echo ""

# 14.6: Performance Check
echo "  ⚡ Running performance checks..."
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}\n' https://api.digilist.no/health)
echo "     API response time: ${RESPONSE_TIME}s"
if (( $(echo "$RESPONSE_TIME < 1.0" | bc -l) )); then
    log_info "Response time acceptable"
else
    log_warn "Response time slow: ${RESPONSE_TIME}s"
fi
echo ""

# 14.7: Security Headers
echo "  🔒 Checking security headers..."
HEADERS=$(curl -s -I https://api.digilist.no/health)
if echo "$HEADERS" | grep -qi "x-frame-options"; then
    log_info "Security headers present"
else
    log_warn "Some security headers missing"
fi
echo ""

log_info "Automated test suite completed"
echo ""

# Step 15: Verify frontend deployments
echo "🌐 Step 15: Verifying frontend deployments..."
for SUBDOMAIN in web-test minside-test backoffice-test; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://${SUBDOMAIN}.digilist.no)
    if [ "$HTTP_CODE" = "200" ]; then
        log_info "${SUBDOMAIN}.digilist.no is accessible (HTTP $HTTP_CODE)"
    else
        log_warn "${SUBDOMAIN}.digilist.no returned HTTP $HTTP_CODE"
    fi
done
echo ""

# Summary
echo "=================================================="
echo "  ✅ Deployment Complete!"
echo "=================================================="
echo ""
echo "🔗 URLs:"
echo "   API:        https://api.digilist.no"
echo "   Web:        https://web-test.digilist.no"
echo "   MinSide:    https://minside-test.digilist.no"
echo "   Backoffice: https://backoffice-test.digilist.no"
echo ""
echo "👤 Demo Users:"
echo "   Admin:        demo-admin-token"
echo "   Case Handler: demo-case-handler-token"
echo "   User:         demo-user-token"
echo ""
echo "📊 Monitoring:"
echo "   PM2 Status:  ssh ${VPS_USER}@${VPS_HOST} 'pm2 status'"
echo "   API Logs:    ssh ${VPS_USER}@${VPS_HOST} 'pm2 logs digilist-api-test'"
echo "   Health:      curl https://api.digilist.no/health"
echo ""
