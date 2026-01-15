# Xala Digilist Platform - Deployment Guide

## Overview

This guide covers deploying the Xala Digilist Platform with the new **consolidated environment configuration** to production.

## What Changed

### ✅ Environment Configuration Consolidation

All environment variables have been consolidated into a single **root `.env` file**:

| Before | After |
|--------|-------|
| `apps/api/.env` | **`/.env`** (single source) |
| `apps/web/.env` | Removed (uses root) |
| `apps/backoffice/.env` | Removed (uses root) |
| `apps/minside/.env` | Removed (uses root) |

**Benefits:**
- Single source of truth for all configuration
- No duplicate or conflicting variables
- Easier to manage credentials
- Consistent across all apps

### 🔧 Updated Components

1. **API** (`apps/api/src/main.ts`)
   - Loads `.env` from `../../.env` using `dotenv`
   
2. **Vite Apps** (`apps/{web,backoffice,minside}/vite.config.ts`)
   - Set `envDir: path.resolve(__dirname, '../..')` to load from root

3. **New Integrations Configuration UI**
   - Backoffice Settings → Integrations tab
   - Manage credentials for: ID-porten, Vipps, Visma, RCO, ACOS
   - Test connections before activation

## Prerequisites

### 1. Build All Apps

```bash
# Build API
pnpm --filter @digilist/api build

# Build Backoffice (includes new Integrations UI)
pnpm --filter @xala/backoffice build

# Build Web (optional)
pnpm --filter @xala/web build

# Build Minside (optional)
pnpm --filter @xala/minside build
```

### 2. SSH Access

Ensure you can connect to the production server:

```bash
ssh root@95.217.126.138
```

If connection times out:
- Check VPN connection (if required)
- Verify SSH key is configured
- Confirm server is running

### 3. Update Production Environment

The root `.env` file contains **development values**. Before deploying to production:

1. **Copy `.env` to `.env.production`**
   ```bash
   cp .env .env.production
   ```

2. **Update production values**:
   - `NODE_ENV=production`
   - `DATABASE_URL` - Production PostgreSQL connection
   - `REDIS_URL` - Production Redis connection
   - `API_BASE_URL` - Production domain (https://api.digilist.no)
   - `VITE_API_URL` - Production API URL
   - `IDPORTEN_CLIENT_SECRET` - Production Signicat credentials
   - `VIPPS_CLIENT_SECRET` - Production Vipps credentials
   - `VIPPS_SUBSCRIPTION_KEY` - Production Vipps subscription key
   - `JWT_SECRET` - Strong production secret

## Deployment Methods

### Method 1: Automated Script (Recommended)

```bash
# Run the deployment script
./deploy.sh
```

The script will:
1. ✅ Test SSH connectivity
2. 📦 Deploy consolidated `.env` file
3. 🔧 Deploy and restart API
4. 🏢 Deploy Backoffice
5. 🌐 Deploy Web (if built)
6. 👤 Deploy Minside (if built)
7. 🔍 Verify deployment status

### Method 2: Manual Deployment

#### Step 1: Deploy .env File

```bash
scp .env.production root@95.217.126.138:/var/www/xala-api/.env
```

#### Step 2: Deploy API

```bash
cd apps/api
rsync -avz dist/ root@95.217.126.138:/var/www/xala-api/
scp package.json root@95.217.126.138:/var/www/xala-api/

# SSH into server and restart
ssh root@95.217.126.138
cd /var/www/xala-api
pnpm install --prod
pm2 reload xala-api
```

#### Step 3: Deploy Backoffice

```bash
cd apps/backoffice
rsync -avz dist/ root@95.217.126.138:/var/www/xala-backoffice/
```

#### Step 4: Deploy Other Apps (Optional)

```bash
# Web
cd apps/web
rsync -avz dist/ root@95.217.126.138:/var/www/xala-web/

# Minside
cd apps/minside
rsync -avz dist/ root@95.217.126.138:/var/www/xala-minside/
```

## Post-Deployment Verification

### 1. Check API Health

```bash
curl https://api.digilist.no/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-15T15:23:00.000Z",
  "uptime": 12345,
  "environment": "production"
}
```

### 2. Verify PM2 Status

```bash
ssh root@95.217.126.138 "pm2 status"
```

Expected output:
```
┌─────┬──────────────┬─────────┬─────────┬─────────┬──────────┐
│ id  │ name         │ status  │ restart │ uptime  │ cpu      │
├─────┼──────────────┼─────────┼─────────┼─────────┼──────────┤
│ 0   │ xala-api     │ online  │ 15      │ 2h      │ 0.3%     │
└─────┴──────────────┴─────────┴─────────┴─────────┴──────────┘
```

### 3. Check Logs

```bash
# API logs
ssh root@95.217.126.138 "pm2 logs xala-api --lines 50"

# Nginx logs
ssh root@95.217.126.138 "tail -f /var/log/nginx/error.log"
```

### 4. Test Integrations Configuration UI

1. Navigate to: `https://backoffice.digilist.no/settings`
2. Click "Integrasjoner" tab
3. Verify all 5 integrations are listed:
   - ID-porten (BankID)
   - Vipps
   - Visma
   - RCO
   - ACOS
4. Click "Konfigurer" on any integration
5. Verify modal opens with configuration fields
6. Test connection functionality

## Rollback Plan

If deployment fails:

### 1. Rollback API

```bash
ssh root@95.217.126.138
cd /var/www/xala-api
git checkout <previous-commit>
pnpm install
pm2 reload xala-api
```

### 2. Restore Previous .env

```bash
ssh root@95.217.126.138
cp /var/www/xala-api/.env.backup /var/www/xala-api/.env
pm2 reload xala-api
```

## Troubleshooting

### Issue: SSH Connection Timeout

**Solution:**
1. Check VPN connection
2. Verify server is running: `ping 95.217.126.138`
3. Check SSH key permissions: `chmod 600 ~/.ssh/id_rsa`
4. Try with verbose mode: `ssh -vvv root@95.217.126.138`

### Issue: PM2 Not Restarting API

**Solution:**
```bash
ssh root@95.217.126.138
pm2 delete xala-api
cd /var/www/xala-api
pm2 start main.js --name xala-api
pm2 save
```

### Issue: Environment Variables Not Loading

**Solution:**
1. Verify `.env` file exists in API directory
2. Check file permissions: `chmod 600 .env`
3. Verify dotenv is loading correctly (check main.ts line 9)
4. Restart PM2: `pm2 reload xala-api`

### Issue: Integrations UI Not Loading

**Solution:**
1. Clear browser cache
2. Verify backoffice build includes IntegrationConfigModal
3. Check browser console for errors
4. Verify SDK hooks are exported in `packages/client-sdk/src/hooks/index.ts`

## Security Checklist

Before going live:

- [ ] Update all production secrets in `.env.production`
- [ ] Verify `NODE_ENV=production`
- [ ] Enable HTTPS/SSL certificates
- [ ] Set secure `JWT_SECRET` (32+ characters, random)
- [ ] Update `IDPORTEN_CALLBACK_URL` to production domain
- [ ] Verify firewall rules (only allow ports 80, 443, 22)
- [ ] Enable rate limiting in Nginx
- [ ] Configure database backups
- [ ] Set up monitoring/alerting
- [ ] Review CORS settings in API
- [ ] Verify all API keys are production values

## Environment Variables Reference

### Required Production Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | PostgreSQL connection |
| `REDIS_URL` | `redis://host:6379` | Redis connection |
| `API_BASE_URL` | `https://api.digilist.no` | API public URL |
| `VITE_API_URL` | `https://api.digilist.no` | API URL for frontend |
| `VITE_TENANT_ID` | `uuid` | Default tenant ID |
| `JWT_SECRET` | `random-32char-string` | JWT signing secret |
| `IDPORTEN_CLIENT_ID` | `prod-client-id` | Signicat production client |
| `IDPORTEN_CLIENT_SECRET` | `secret` | Signicat production secret |
| `VIPPS_CLIENT_ID` | `uuid` | Vipps production client |
| `VIPPS_CLIENT_SECRET` | `secret` | Vipps production secret |
| `VIPPS_SUBSCRIPTION_KEY` | `key` | Vipps subscription key |
| `VIPPS_MSN` | `123456` | Merchant serial number |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `API_PORT` | `4000` | API server port |
| `API_HOST` | `0.0.0.0` | API bind address |
| `VITE_WS_URL` | `wss://api.digilist.no/ws/events` | WebSocket URL |
| `FEATURE_VIPPS_LOGIN` | `true` | Enable Vipps login |
| `FEATURE_VIPPS_PAYMENTS` | `true` | Enable Vipps payments |
| `FEATURE_IDPORTEN_LOGIN` | `true` | Enable ID-porten login |

## Support

For deployment issues:
- Check logs: `pm2 logs xala-api`
- Review Nginx logs: `/var/log/nginx/error.log`
- Contact support: support@xala.no
- GitHub Issues: https://github.com/xala/xala-digdir-monorepo/issues

---

**Last Updated:** 2026-01-15  
**Version:** 2.0.0 (Consolidated Environment Configuration)
