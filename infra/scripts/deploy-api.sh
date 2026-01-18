#!/bin/bash
set -e

VPS_HOST="${VPS_HOST:-72.61.23.56}"
APP_DIR="/home/digilist/digilist-platform"

echo "🚀 Deploying API..."

# Deploy code
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude '.turbo' \
  --exclude 'packages/testing-e2e/test-results' \
  . root@$VPS_HOST:$APP_DIR/

# Install dependencies and build
ssh root@$VPS_HOST "cd $APP_DIR && pnpm install --frozen-lockfile && pnpm --filter @digilist/api build"

# Run migrations
ssh root@$VPS_HOST "cd $APP_DIR && DATABASE_URL='postgresql://digilist_test:test_password_2026@localhost:5432/digilist_test' pnpm --filter @digilist/database-schema db:push"

# Restart API with PM2
ssh root@$VPS_HOST "cd $APP_DIR && pm2 restart api || pm2 start apps/api/dist/main.js --name api"

echo "✅ API deployed"
