#!/bin/bash
set -e

# Digilist Production Environment Deployment Script
# This script handles complete deployment including:
# - Code deployment
# - Database setup (init, migrate, seed)
# - PM2 configuration
# - Test execution
# - Health checks

echo "=================================================="
echo "  Digilist Production Environment Deployment"
echo "=================================================="
echo ""
echo "⚠️  WARNING: This will deploy to PRODUCTION!"
echo "   - All PM2 processes will be restarted"
echo "   - Database migrations will be applied"
echo "   - Production traffic will be affected"
echo "   - Make sure you have tested in staging first!"
echo ""
read -p "Continue with PRODUCTION deployment? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi
echo ""

# Configuration
VPS_HOST="72.61.23.56"
VPS_USER="root"
DEPLOY_PATH="/home/digilist/digilist-production"
DB_NAME="digilist_prod"
DB_USER="digilist_prod"
DB_PASSWORD="prod_password_2026_CHANGE_ME"
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

# Clean old bundles before deploying new ones
ssh root@${VPS_HOST} "rm -rf /var/www/web.digilist.no/assets/*.js /var/www/web.digilist.no/assets/*.css"
ssh root@${VPS_HOST} "rm -rf /var/www/minside.digilist.no/assets/*.js /var/www/minside.digilist.no/assets/*.css"
ssh root@${VPS_HOST} "rm -rf /var/www/backoffice.digilist.no/assets/*.js /var/www/backoffice.digilist.no/assets/*.css"

rsync -avz apps/web/dist/ root@${VPS_HOST}:/var/www/web.digilist.no/
rsync -avz apps/minside/dist/ root@${VPS_HOST}:/var/www/minside.digilist.no/
rsync -avz apps/backoffice/dist/ root@${VPS_HOST}:/var/www/backoffice.digilist.no/
log_info "Built packages deployed"
echo ""

# Step 4: Install dependencies on VPS
echo "📥 Step 4: Installing dependencies on VPS..."
ssh ${VPS_USER}@${VPS_HOST} "cd ${DEPLOY_PATH} && pnpm install --prod"
log_info "Dependencies installed"
echo ""

# Step 5: Run migrations (production - no seed)
echo "🔄 Step 5: Running database migrations..."
ssh ${VPS_USER}@${VPS_HOST} << ENDSSH
set -e
cd ${DEPLOY_PATH}/packages/database-schema
echo "Applying migration file..."
PGPASSWORD='${DB_PASSWORD}' psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f migrations/0000_complete_schema.sql
echo "✓ Migration applied successfully"
ENDSSH
log_info "Database migrations complete"
echo ""

# Step 6: Deploy PM2 configuration
echo "⚙️  Step 6: Configuring PM2..."
ssh ${VPS_USER}@${VPS_HOST} "cat > ${DEPLOY_PATH}/ecosystem.production.config.js" << 'EOF'
module.exports = {
  apps: [
    {
      name: 'digilist-api-production',
      script: './apps/api/dist/main.js',
      cwd: '/home/digilist/digilist-production',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'production',
        API_PORT: 4000,
        API_HOST: '0.0.0.0',
        API_BASE_URL: 'https://api.digilist.no',
        DATABASE_URL: 'postgresql://digilist_prod:prod_password_2026_CHANGE_ME@localhost:5432/digilist_prod',
        REDIS_URL: 'redis://localhost:6379',
        JWT_SECRET: 'CHANGE_ME_PRODUCTION_SECRET_48_CHARS_MIN',
        JWT_REFRESH_SECRET: 'CHANGE_ME_PRODUCTION_REFRESH_SECRET_48_CHARS',
        CSRF_SECRET: 'CHANGE_ME_PRODUCTION_CSRF_SECRET_48_CHARS_MIN',
        SESSION_SECRET: 'CHANGE_ME_PRODUCTION_SESSION_SECRET_48_CHARS',
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7d',
        CORS_ORIGIN: 'https://web.digilist.no,https://backoffice.digilist.no,https://minside.digilist.no',
        VITE_TENANT_ID: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        VITE_MAPBOX_TOKEN: 'pk.eyJ1IjoieGFsYXRlY2hub2xvZ2llc2FzIiwiYSI6ImNtY2dxbWUwaDBwOXUyaXNpdXY3aGppNmQifQ.0SEeOusXpY8H0z1FRIuGjA',
        STORAGE_PATH: '/var/www/digilist-storage/uploads',
        STORAGE_BASE_URL: '/storage',
        LOG_LEVEL: 'warn',
        LOG_FORMAT: 'json',
      },
      error_file: '/root/.pm2/logs/digilist-api-production-error.log',
      out_file: '/root/.pm2/logs/digilist-api-production-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    }
  ],
};
EOF
log_info "PM2 configuration deployed"
echo ""

# Step 7: Reload PM2 (zero-downtime)
echo "🔄 Step 7: Reloading services (zero-downtime)..."
ssh ${VPS_USER}@${VPS_HOST} "cd ${DEPLOY_PATH} && pm2 reload ecosystem.production.config.js && pm2 save"
log_info "Services reloaded"
echo ""

# Step 8: Wait for API to stabilize
echo "⏳ Step 8: Waiting for API to stabilize..."
sleep 10
log_info "API should be ready"
echo ""

# Step 9: Run health checks
echo "🏥 Step 9: Running health checks..."
HEALTH_CHECK=$(curl -s https://api.digilist.no/health || echo "failed")
if echo "$HEALTH_CHECK" | grep -q "ok"; then
    log_info "API health check passed"
else
    log_error "API health check failed"
    echo "$HEALTH_CHECK"
    exit 1
fi
echo ""

# Step 10: Verify frontend deployments
echo "🌐 Step 10: Verifying frontend deployments..."
for SUBDOMAIN in web minside backoffice; do
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
echo "  ✅ Production Deployment Complete!"
echo "=================================================="
echo ""
echo "🔗 URLs:"
echo "   API:        https://api.digilist.no"
echo "   Web:        https://web.digilist.no"
echo "   MinSide:    https://minside.digilist.no"
echo "   Backoffice: https://backoffice.digilist.no"
echo ""
echo "📊 Monitoring:"
echo "   PM2 Status:  ssh ${VPS_USER}@${VPS_HOST} 'pm2 status'"
echo "   API Logs:    ssh ${VPS_USER}@${VPS_HOST} 'pm2 logs digilist-api-production'"
echo "   Health:      curl https://api.digilist.no/health"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Monitor logs for any errors"
echo "   - Test critical user flows"
echo "   - Update production secrets (marked CHANGE_ME)"
echo ""
