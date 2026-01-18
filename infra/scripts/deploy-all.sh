#!/bin/bash
set -e

ENV="${1:-dev}"
VPS_HOST="${VPS_HOST:-72.61.23.56}"

echo "=========================================="
echo "🚀 Full Platform Deployment ($ENV)"
echo "=========================================="
echo ""

# 1. Database
echo "Step 1/5: Database..."
./infra/scripts/deploy-database.sh $ENV
echo ""

# 2. API
echo "Step 2/5: API..."
./infra/scripts/deploy-api.sh $ENV
echo ""

# 3. Web
echo "Step 3/5: Web..."
./infra/scripts/deploy-web.sh $ENV 8080
echo ""

# 4. MinSide
echo "Step 4/5: MinSide..."
./infra/scripts/deploy-minside.sh $ENV 8081
echo ""

# 5. Backoffice
echo "Step 5/5: Backoffice..."
./infra/scripts/deploy-backoffice.sh $ENV 8082
echo ""

echo "=========================================="
echo "✅ Deployment Complete ($ENV)!"
echo "=========================================="
echo ""
echo "Services:"
echo "  API:        http://$VPS_HOST:4000"
echo "  Web:        http://$VPS_HOST:8080"
echo "  MinSide:    http://$VPS_HOST:8081"
echo "  Backoffice: http://$VPS_HOST:8082"
echo ""
echo "Check status: ssh root@$VPS_HOST 'pm2 status'"
echo ""
echo "Usage: ./infra/scripts/deploy-all.sh [dev|staging|production]"
echo ""
