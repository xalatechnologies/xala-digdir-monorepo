#!/bin/bash

# ==============================================================================
# Encrypt Secrets Helper Script
# ==============================================================================
# Usage: ./infra/scripts/encrypt-secrets.sh <environment> <app>
# Example: ./infra/scripts/encrypt-secrets.sh staging api
# ==============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check arguments
if [ $# -ne 2 ]; then
    echo -e "${RED}Usage: $0 <environment> <app>${NC}"
    echo "Environment: staging or production"
    echo "App: api, web, minside, backoffice, tenant-admin, saas-admin, monitoring, docs-learning"
    exit 1
fi

ENV=$1
APP=$2

# Validate environment
if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
    echo -e "${RED}Invalid environment: $ENV${NC}"
    echo "Must be 'staging' or 'production'"
    exit 1
fi

# Validate app
VALID_APPS=("api" "web" "minside" "backoffice" "tenant-admin" "saas-admin" "monitoring" "docs-learning")
if [[ ! " ${VALID_APPS[@]} " =~ " ${APP} " ]]; then
    echo -e "${RED}Invalid app: $APP${NC}"
    echo "Must be one of: ${VALID_APPS[*]}"
    exit 1
fi

# Check if age is installed
if ! command -v age &> /dev/null; then
    echo -e "${RED}age is not installed${NC}"
    echo "Install: brew install age (macOS) or sudo apt install age (Ubuntu)"
    exit 1
fi

# Check if public key exists
PUB_KEY="infra/secrets/age.key.pub"
if [ ! -f "$PUB_KEY" ]; then
    echo -e "${RED}Public key not found: $PUB_KEY${NC}"
    echo "Generate key pair first:"
    echo "  age-keygen -o age.key"
    echo "  age-keygen -y age.key > infra/secrets/age.key.pub"
    exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Encrypt Secrets for $APP ($ENV)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Create temp file
TEMP_FILE=$(mktemp)
trap "rm -f $TEMP_FILE" EXIT

# Template based on app type
if [ "$APP" = "api" ]; then
    cat > "$TEMP_FILE" <<EOF
# API Secrets for $ENV
NODE_ENV: $ENV
DATABASE_URL: postgresql://user:password@localhost:5432/digilist_$ENV
REDIS_URL: redis://localhost:6379
JWT_SECRET: CHANGE_ME_$(openssl rand -base64 48 | tr -d '\n')
JWT_REFRESH_SECRET: CHANGE_ME_$(openssl rand -base64 48 | tr -d '\n')
CSRF_SECRET: CHANGE_ME_$(openssl rand -base64 48 | tr -d '\n')
SESSION_SECRET: CHANGE_ME_$(openssl rand -base64 48 | tr -d '\n')
SENTRY_DSN: https://your-sentry-dsn@sentry.io/project
IDPORTEN_CLIENT_ID: your-idporten-client-id
IDPORTEN_CLIENT_SECRET: your-idporten-client-secret
VIPPS_CLIENT_ID: your-vipps-client-id
VIPPS_CLIENT_SECRET: your-vipps-client-secret
SENDGRID_API_KEY: your-sendgrid-api-key
AWS_ACCESS_KEY_ID: your-aws-access-key
AWS_SECRET_ACCESS_KEY: your-aws-secret-key
EOF
else
    # Frontend apps
    cat > "$TEMP_FILE" <<EOF
# $APP Secrets for $ENV
VITE_API_URL: https://api-$ENV.digilist.no
VITE_WS_URL: wss://api-$ENV.digilist.no/ws/events
VITE_SENTRY_DSN: https://your-frontend-sentry-dsn@sentry.io/project
EOF
fi

echo -e "${YELLOW}Opening editor to edit secrets...${NC}"
echo "Edit the file, save, and close the editor to continue."
echo ""

# Open in editor
${EDITOR:-nano} "$TEMP_FILE"

# Confirm
echo ""
echo -e "${YELLOW}Review your secrets:${NC}"
cat "$TEMP_FILE"
echo ""
read -p "Encrypt these secrets? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Cancelled${NC}"
    exit 1
fi

# Encrypt
OUTPUT_FILE="infra/secrets/$ENV/$APP.enc.yaml"
mkdir -p "infra/secrets/$ENV"

echo -e "${YELLOW}Encrypting...${NC}"
age -r "$(cat $PUB_KEY)" -o "$OUTPUT_FILE" "$TEMP_FILE"

echo -e "${GREEN}✓ Secrets encrypted${NC}"
echo "  File: $OUTPUT_FILE"
echo ""
echo "Next steps:"
echo "  1. git add $OUTPUT_FILE"
echo "  2. git commit -m 'Add encrypted $ENV secrets for $APP'"
echo "  3. git push"
echo ""
echo "To decrypt (for verification):"
echo "  age -d -i age.key $OUTPUT_FILE"
