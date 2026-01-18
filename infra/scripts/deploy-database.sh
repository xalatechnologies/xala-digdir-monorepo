#!/bin/bash
set -e

ENV="${1:-dev}"
VPS_HOST="${VPS_HOST:-72.61.23.56}"
DB_USER="digilist_${ENV}"
DB_PASS="${ENV}_password_2026"
DB_NAME="digilist_${ENV}"

echo "🗄️  Deploying Database ($ENV)..."

# Create database user
ssh root@$VPS_HOST "sudo -u postgres psql -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';\"" 2>/dev/null || echo "User exists"

# Create database
ssh root@$VPS_HOST "sudo -u postgres psql -c \"CREATE DATABASE $DB_NAME OWNER $DB_USER;\"" 2>/dev/null || echo "Database exists"

# Create schemas
ssh root@$VPS_HOST "sudo -u postgres psql -d $DB_NAME -c '
CREATE SCHEMA IF NOT EXISTS platform;
CREATE SCHEMA IF NOT EXISTS domain;
CREATE SCHEMA IF NOT EXISTS compliance;
CREATE SCHEMA IF NOT EXISTS monitoring;
CREATE SCHEMA IF NOT EXISTS saas;
GRANT ALL ON SCHEMA platform TO $DB_USER;
GRANT ALL ON SCHEMA domain TO $DB_USER;
GRANT ALL ON SCHEMA compliance TO $DB_USER;
GRANT ALL ON SCHEMA monitoring TO $DB_USER;
GRANT ALL ON SCHEMA saas TO $DB_USER;
'"

echo "✅ Database ready"
