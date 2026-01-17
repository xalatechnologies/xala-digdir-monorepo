#!/bin/bash
# Import demo users from demo-users.json into PostgreSQL

set -e

DB_NAME=${1:-digilist_prod}
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "📦 Importing demo users to database: $DB_NAME"
echo ""

# Get tenant ID
TENANT_ID=$(psql -d "$DB_NAME" -t -c "SELECT id FROM platform.tenants LIMIT 1;" | xargs)

if [ -z "$TENANT_ID" ]; then
  echo "❌ Error: No tenant found in database"
  exit 1
fi

echo "🏢 Using tenant ID: $TENANT_ID"
echo ""

# Generate SQL from JSON
node "$SCRIPT_DIR/generate-import-sql.cjs" "$SCRIPT_DIR/demo-users.json" "$TENANT_ID" > /tmp/import-users.sql

# Execute the SQL
echo "🔄 Executing SQL..."
psql -d "$DB_NAME" -f /tmp/import-users.sql 2>&1 | grep -E "(INSERT|UPDATE|ERROR)" || true

echo ""
echo "✅ Import complete!"
echo ""
echo "📋 Current users:"
psql -d "$DB_NAME" -c "SELECT email, name, role, demo_token, CASE WHEN national_id IS NOT NULL THEN left(national_id, 6) || '***' ELSE NULL END as national_id_masked FROM platform.users WHERE demo_token IS NOT NULL OR national_id IS NOT NULL ORDER BY email;"
