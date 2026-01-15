#!/bin/bash
# Digilist API Deployment Script
# Usage: ./scripts/deploy.sh [production|staging]

set -e

ENV="${1:-production}"
APP_NAME="digilist-api"
PORT=4000

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Deploying Digilist API to ${ENV}${NC}"
echo "================================================"

# Load environment
if [ -f ".env.${ENV}" ]; then
  source ".env.${ENV}"
else
  echo -e "${YELLOW}⚠️  No .env.${ENV} found, using .env${NC}"
  if [ -f ".env" ]; then
    source ".env"
  fi
fi

# Hostinger VPS settings
VPS_HOST="${VPS_HOST:-72.61.23.56}"
VPS_USER="${VPS_USER:-root}"
REMOTE_DIR="/var/www/${APP_NAME}"

echo -e "\n${YELLOW}Step 1: Building application${NC}"
pnpm build

echo -e "\n${YELLOW}Step 2: Creating deployment package${NC}"
DEPLOY_DIR=$(mktemp -d)
cp -r dist "${DEPLOY_DIR}/"
cp package.json "${DEPLOY_DIR}/"
cp .env.example "${DEPLOY_DIR}/.env.example"

# Generate production package.json (strip workspace refs)
cat > "${DEPLOY_DIR}/package.json" << 'EOF'
{
  "name": "@digilist/api",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/main.js",
  "scripts": {
    "start": "node dist/main.js"
  },
  "dependencies": {
    "fastify": "^5.0.0",
    "@fastify/cors": "^10.0.0",
    "@fastify/websocket": "^11.0.0",
    "mercurius": "^16.0.0",
    "graphql": "^16.10.0",
    "drizzle-orm": "^0.33.0",
    "postgres": "^3.4.0",
    "zod": "^3.23.0",
    "reflect-metadata": "^0.2.0",
    "pino": "^9.0.0",
    "pino-pretty": "^11.0.0",
    "redis": "^4.7.0",
    "dotenv": "^17.0.0"
  }
}
EOF

# Generate PM2 ecosystem
cat > "${DEPLOY_DIR}/ecosystem.config.cjs" << EOF
module.exports = {
  apps: [{
    name: '${APP_NAME}',
    script: 'dist/main.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: ${PORT}
    },
    error_file: '/var/log/pm2/${APP_NAME}-error.log',
    out_file: '/var/log/pm2/${APP_NAME}-out.log',
    merge_logs: true,
    time: true
  }]
};
EOF

echo -e "\n${YELLOW}Step 3: Syncing to VPS${NC}"
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.env' \
  "${DEPLOY_DIR}/" "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/"

echo -e "\n${YELLOW}Step 4: Remote activation${NC}"
ssh "${VPS_USER}@${VPS_HOST}" << REMOTE
  cd ${REMOTE_DIR}
  
  # Install dependencies
  npm install --omit=dev
  
  # Generate .env if not exists
  if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Created .env from template - please configure!"
  fi
  
  # Restart with PM2
  pm2 delete ${APP_NAME} 2>/dev/null || true
  pm2 start ecosystem.config.cjs
  pm2 save
  
  echo "✅ Application started on port ${PORT}"
REMOTE

echo -e "\n${GREEN}✅ Deployment complete!${NC}"
echo "================================================"
echo -e "Health check: ${YELLOW}curl https://api.digilist.no/health${NC}"
echo -e "GraphQL:      ${YELLOW}https://api.digilist.no/graphql${NC}"

# Cleanup
rm -rf "${DEPLOY_DIR}"
