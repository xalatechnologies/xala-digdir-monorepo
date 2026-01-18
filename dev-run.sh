#!/bin/bash
set -e

echo "🚀 Starting Digilist Platform Development Environment"
echo "=================================================="
echo ""

# Load environment variables from infra/env
if [ -f "infra/env/.env.docker.dev" ]; then
  echo "📋 Loading environment variables from infra/env/.env.docker.dev"
  export $(grep -v '^#' infra/env/.env.docker.dev | xargs)
  echo "✅ Environment variables loaded"
else
  echo "⚠️  Warning: infra/env/.env.docker.dev not found"
fi
echo ""

# Set environment variables
export DATABASE_URL="postgresql://digilist_dev:dev_password_2026@localhost:5433/digilist_dev"
export REDIS_URL="redis://localhost:6380"
export NODE_ENV="development"
export API_PORT="4000"

echo "� Environment configured"
echo "  DATABASE_URL: $DATABASE_URL"
echo "  REDIS_URL: $REDIS_URL"
echo ""

# Start Docker services (PostgreSQL & Redis)
echo "📦 Starting Docker services..."
cd infra/docker/compose
docker-compose -f docker-compose.dev.yml up -d --remove-orphans
cd ../../..
echo ""

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 5
echo ""

# Start all applications with unique ports
echo "🌐 Starting applications..."
echo ""

# API on port 4000
echo "  API:        http://localhost:4000"
pnpm --filter @digilist/api dev &

# Web on port 6001 (override vite default)
echo "  Web:        http://localhost:6001"
pnpm --filter @xala/web exec vite --port 6001 &

# MinSide on port 6002 (override vite default)
echo "  MinSide:    http://localhost:6002"
pnpm --filter @xala/minside exec vite --port 6002 &

# Backoffice on port 6003 (override vite default)
echo "  Backoffice: http://localhost:6003"
pnpm --filter @xala/backoffice exec vite --port 6003 &

# Tenant Admin on port 6004
echo "  Tenant Admin: http://localhost:6004"
pnpm --filter @xala/tenant-admin exec vite --port 6004 &

# SaaS Admin on port 6005
echo "  SaaS Admin: http://localhost:6005"
pnpm --filter @xala/saas-admin exec vite --port 6005 &

# Monitoring on port 6006
echo "  Monitoring: http://localhost:6006"
pnpm --filter @xala/monitoring exec vite --port 6006 &

echo ""
echo "=================================================="
echo "✅ All services started!"
echo "=================================================="
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for all background processes
wait
