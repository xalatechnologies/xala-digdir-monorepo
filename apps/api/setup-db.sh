#!/bin/bash

# Database Setup Script for Notification Deduplication System
# This script starts PostgreSQL and applies migrations

set -e

echo "=== Database Setup ==="
echo

# Check if PostgreSQL is installed
if ! command -v postgres &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install it first:"
    echo "   brew install postgresql@14"
    exit 1
fi

echo "✓ PostgreSQL is installed ($(postgres --version))"
echo

# Try to start PostgreSQL using brew services
echo "Starting PostgreSQL..."
if command -v brew &> /dev/null; then
    brew services start postgresql@14 || brew services start postgresql
    echo "✓ PostgreSQL service started"
else
    echo "⚠️  Homebrew not found. Please start PostgreSQL manually:"
    echo "   pg_ctl -D /opt/homebrew/var/postgresql@14 start"
    exit 1
fi

echo

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
for i in {1..10}; do
    if pg_isready -h localhost -p 5432 &> /dev/null; then
        echo "✓ PostgreSQL is ready"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ PostgreSQL did not become ready in time"
        exit 1
    fi
    sleep 1
done

echo

# Create database if it doesn't exist
echo "Creating database 'digilist_dev'..."
if psql -lqt | cut -d \| -f 1 | grep -qw digilist_dev; then
    echo "✓ Database 'digilist_dev' already exists"
else
    createdb digilist_dev
    echo "✓ Database 'digilist_dev' created"
fi

echo

# Apply migrations
echo "Applying database migrations..."
pnpm db:push

echo
echo "=== Setup Complete ==="
echo
echo "Database 'digilist_dev' is ready with tables:"
psql digilist_dev -c "\dt" | grep -E "(notifications|delivery_attempts)"

echo
echo "You can now run the API server:"
echo "  pnpm dev"
