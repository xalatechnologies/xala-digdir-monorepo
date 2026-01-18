#!/bin/bash
set -e

echo "🚀 Starting Digilist Platform Development Environment"
echo "=================================================="
echo ""

# Start Docker services (PostgreSQL & Redis)
echo "📦 Starting Docker services..."
cd infra/docker/compose
docker-compose -f docker-compose.dev.yml up -d
cd ../../..
echo ""

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 3
echo ""

# Start all applications with unique ports
echo "🌐 Starting applications..."
echo ""

# API on port 4000
echo "  API:        http://localhost:4000"
pnpm --filter @digilist/api dev &

# Web on port 6001
echo "  Web:        http://localhost:6001"
PORT=6001 pnpm --filter @xala/web dev &

# MinSide on port 6002
echo "  MinSide:    http://localhost:6002"
PORT=6002 pnpm --filter @xala/minside dev &

# Backoffice on port 6003
echo "  Backoffice: http://localhost:6003"
PORT=6003 pnpm --filter @xala/backoffice dev &

# Tenant Admin on port 6004
echo "  Tenant Admin: http://localhost:6004"
PORT=6004 pnpm --filter @xala/tenant-admin dev &

# SaaS Admin on port 6005
echo "  SaaS Admin: http://localhost:6005"
PORT=6005 pnpm --filter @xala/saas-admin dev &

# Monitoring on port 6006
echo "  Monitoring: http://localhost:6006"
PORT=6006 pnpm --filter @xala/monitoring dev &

echo ""
echo "=================================================="
echo "✅ All services started!"
echo "=================================================="
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for all background processes
wait
