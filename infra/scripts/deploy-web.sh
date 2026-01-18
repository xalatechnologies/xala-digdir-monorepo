#!/bin/bash
set -e

ENV="${1:-dev}"
VPS_HOST="${VPS_HOST:-72.61.23.56}"
APP_DIR="/home/digilist/digilist-platform"
APP_NAME="web"
PORT="${2:-8080}"

echo "🌐 Deploying Web ($ENV)..."

# Build locally (faster than on VPS)
pnpm --filter @xala/$APP_NAME build

# Deploy dist folder
rsync -avz --delete apps/$APP_NAME/dist/ root@$VPS_HOST:/var/www/$APP_NAME/

# Setup nginx or serve with PM2
ssh root@$VPS_HOST "cd /var/www/$APP_NAME && pm2 restart $APP_NAME-$ENV || pm2 serve . $PORT --name $APP_NAME-$ENV --spa"

echo "✅ Web deployed ($ENV) on port $PORT"
