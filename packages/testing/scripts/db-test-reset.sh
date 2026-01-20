#!/bin/bash
# db:test:reset - Reset test database with fresh schema and seed data

set -e

echo "🗄️  Resetting test database..."

# Navigate to database-schema package
cd "$(dirname "$0")/../../database-schema"

# Drop and recreate test database
export DATABASE_URL="${DATABASE_URL:-postgresql://localhost:5433/digilist_test}"

echo "📦 Running migrations..."
pnpm db:migrate

echo "🌱 Seeding test data..."
pnpm db:seed

echo "✅ Test database reset complete!"
