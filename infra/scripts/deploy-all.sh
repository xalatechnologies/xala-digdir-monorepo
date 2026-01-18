#!/bin/bash
set -e

echo "=========================================="
echo "🚀 Full Platform Deployment"
echo "=========================================="
echo ""

VPS_HOST="${VPS_HOST:-72.61.23.56}"

# 1. Database
echo "Step 1/5: Database..."
./infra/scripts/deploy-database.sh
echo ""

# 2. API
echo "Step 2/5: API..."
./infra/scripts/deploy-api.sh
echo ""

# 3. Web
echo "Step 3/5: Web..."
./infra/scripts/deploy-web.sh
echo ""

# 4. MinSide
echo "Step 4/5: MinSide..."
./infra/scripts/deploy-minside.sh
echo ""

# 5. Backoffice
echo "Step 5/5: Backoffice..."
./infra/scripts/deploy-backoffice.sh
echo ""

echo "=========================================="
echo "✅ Deployment Complete!"
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
