#!/bin/bash

# Seed translations to database
# This script sets the DATABASE_URL and runs the seed command

echo "🌱 Seeding translations to database..."
echo ""

# Set DATABASE_URL for local development (Docker)
export DATABASE_URL="postgresql://digilist_dev:dev_password_2026@localhost:5433/digilist_dev"

# Run the seed command
cd packages/database-schema
pnpm seed

echo ""
echo "✅ Translations seeded successfully!"
echo ""
echo "🔄 Restart your web app to see the changes:"
echo "   - Stop the current dev server (Ctrl+C)"
echo "   - Run: pnpm dev"
