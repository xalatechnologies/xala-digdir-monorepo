#!/bin/bash
# Start Complete Local Production Environment
# Usage: ./docker/start.sh

set -e

echo "🐳 Starting Digilist Complete Production Environment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Build all apps first
echo "📦 Building all applications..."
pnpm build

# Start Docker Compose
echo ""
echo "🚀 Starting Docker containers..."
docker-compose up -d

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run database migrations
echo ""
echo "📝 Running database migrations..."
docker-compose exec -T api node dist/migrate.js || echo "⚠️  Migrations may need manual run"

# Show status
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ENVIRONMENT READY!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Applications:"
echo "  • Web:        http://localhost:3000"
echo "  • Backoffice: http://localhost:3002"
echo "  • Min Side:   http://localhost:3003"
echo "  • SaaS Admin: http://localhost:3004"
echo "  • API:        http://localhost:3001"
echo ""
echo "🗄️  Database:"
echo "  • Host:       localhost:5432"
echo "  • Database:   digilist_prod"
echo "  • User:       digilist"
echo ""
echo "📊 Useful commands:"
echo "  • View logs:  docker-compose logs -f"
echo "  • Stop all:   docker-compose down"
echo "  • Restart:    docker-compose restart"
echo ""
