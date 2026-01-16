#!/bin/bash

# ==============================================================================
# Seed Demo Login Users Script
# ==============================================================================
# This script adds demo login users to the database for testing
#
# Prerequisites:
# - DATABASE_URL environment variable must be set
# - Demo tenant must exist (run demo-seed-v3 first if needed)
#
# Usage:
#   ./scripts/seed-demo-users.sh
#
# ==============================================================================

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🔑 SEEDING DEMO LOGIN USERS 🔑                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo ""
  echo "Please set DATABASE_URL to your database connection string:"
  echo "  export DATABASE_URL='postgresql://user:password@host:5432/database'"
  echo ""
  exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

# Navigate to API directory
cd "$(dirname "$0")/../apps/api" || exit 1

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile
echo ""

echo "🔄 Pushing schema changes (adds demo_token field)..."
pnpm db:push || {
  echo ""
  echo "⚠️  Schema push failed. This is OK if the field already exists."
  echo "   Continuing with seed..."
  echo ""
}

echo "🌱 Running demo tenant seed (if needed)..."
pnpm db:seed:v3 || {
  echo ""
  echo "⚠️  Demo seed V3 failed. This is OK if the tenant already exists."
  echo "   Continuing with demo users seed..."
  echo ""
}

echo "👥 Seeding demo login users..."
pnpm tsx src/database/seeds/demo-login-users.seed.ts

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         ✅ DEMO USER SEEDING COMPLETE ✅                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "🧪 You can now test demo login at:"
echo ""
echo "   Backoffice: https://backoffice-test.digilist.no/login"
echo "   Web:        https://web-test.digilist.no/login"
echo "   Minside:    https://minside-test.digilist.no/login"
echo "   SaaS Admin: https://saas-admin.digilist.no/login"
echo "   Tenant:     https://tenant-admin.digilist.no/login"
echo ""
echo "📄 See /docs/DEMO_USERS.md for complete list of credentials"
echo ""
