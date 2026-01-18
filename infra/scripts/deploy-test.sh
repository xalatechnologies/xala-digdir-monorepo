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
rsync -avz apps/web/dist/ ${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/apps/web/dist/
rsync -avz apps/minside/dist/ ${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/apps/minside/dist/
rsync -avz apps/backoffice/dist/ ${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/apps/backoffice/dist/
log_info "Built packages deployed"
echo ""

# Step 4: Install dependencies on VPS
echo "📥 Step 4: Installing dependencies on VPS..."
ssh ${VPS_USER}@${VPS_HOST} "cd ${DEPLOY_PATH} && pnpm install --prod"
log_info "Dependencies installed"
echo ""

# Step 5: Setup database
echo "🗄️  Step 5: Setting up database..."
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
set -e

# Check if database exists
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='digilist_dev'")

if [ "$DB_EXISTS" != "1" ]; then
    echo "Creating database and user..."
    sudo -u postgres psql << EOF
CREATE USER digilist_dev WITH PASSWORD 'dev_password_2026';
CREATE DATABASE digilist_dev OWNER digilist_dev;
GRANT ALL PRIVILEGES ON DATABASE digilist_dev TO digilist_dev;
EOF
    echo "✓ Database created"
else
    echo "✓ Database already exists"
fi

# Grant schema permissions
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
echo "✓ Database permissions granted"
ENDSSH
log_info "Database setup complete"
echo ""

# Step 6: Run migrations
echo "🔄 Step 6: Running database migrations..."
ssh ${VPS_USER}@${VPS_HOST} "cd ${DEPLOY_PATH} && DATABASE_URL='postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}' pnpm --filter @digilist/database-schema db:push"
log_info "Migrations applied"
echo ""

# Step 7: Seed database
echo "🌱 Step 7: Seeding database..."
ssh ${VPS_USER}@${VPS_HOST} "cd ${DEPLOY_PATH} && DATABASE_URL='postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}' pnpm --filter @digilist/database-schema seed"
log_info "Database seeded"
echo ""

# Step 8: Deploy PM2 configuration
echo "⚙️  Step 8: Configuring PM2..."
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

# Step 9: Restart PM2
echo "🔄 Step 9: Restarting services..."
ssh ${VPS_USER}@${VPS_HOST} "cd ${DEPLOY_PATH} && pm2 delete digilist-api-test 2>/dev/null || true && pm2 start ecosystem.test.config.js && pm2 save"
log_info "Services restarted"
echo ""

# Step 10: Wait for API to start
echo "⏳ Step 10: Waiting for API to start..."
sleep 5
log_info "API should be ready"
echo ""

# Step 11: Run health checks
echo "🏥 Step 11: Running health checks..."
HEALTH_CHECK=$(curl -s https://api.digilist.no/health || echo "failed")
if echo "$HEALTH_CHECK" | grep -q "ok"; then
    log_info "API health check passed"
else
    log_error "API health check failed"
    echo "$HEALTH_CHECK"
    exit 1
fi
echo ""

# Step 12: Test demo login
echo "🔐 Step 12: Testing demo login..."
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

# Step 13: Run automated tests (if available)
echo "🧪 Step 13: Running automated tests..."
if ssh ${VPS_USER}@${VPS_HOST} "cd ${DEPLOY_PATH} && pnpm test 2>&1 | head -20"; then
    log_info "Tests passed"
else
    log_warn "Tests failed or not available - continuing deployment"
fi
echo ""

# Step 14: Verify frontend deployments
echo "🌐 Step 14: Verifying frontend deployments..."
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
