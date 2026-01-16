# Deployment Guide

> Last Updated: January 16, 2026

This guide provides step-by-step instructions for deploying the Xala/Digilist Platform applications to production and staging environments.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Deployment Process](#deployment-process)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Rollback Procedures](#rollback-procedures)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Overview

### Application Architecture

The Xala/Digilist Platform consists of four deployable applications:

| Application | Purpose | Deployment Target | Port |
|-------------|---------|------------------|------|
| **Web** | Public-facing booking interface | `web-test.digilist.no` | 5173 (dev) |
| **Backoffice** | Administrative dashboard | `backoffice-test.digilist.no` | 5174 (dev) |
| **Minside** | User self-service portal | `minside-test.digilist.no` | - |
| **API** | Backend services | `api.digilist.no` | 3002 |

### Deployment Stack

- **Build System**: Vite + Turborepo
- **Package Manager**: pnpm (workspaces)
- **Transport**: rsync over SSH
- **Process Manager**: PM2 (API only)
- **Host**: Hostinger VPS
- **Multi-Tenant**: Kommune-level isolation

---

## Prerequisites

### Required Access

- SSH access to production server
- Deployment credentials (stored in `scripts/deploy-config.sh`)
- Git repository access
- PM2 process manager access (for API deployments)

### Local Environment

Ensure you have the following installed:

```bash
node -v    # v18.x or higher
pnpm -v    # v8.x or higher
git --version
```

### Environment Files

Each application requires environment variables:

```bash
# apps/web/.env.production
VITE_API_URL=https://api.digilist.no
VITE_TENANT_ID=your-kommune-id

# apps/backoffice/.env.production
VITE_API_URL=https://api.digilist.no
VITE_TENANT_ID=your-kommune-id

# apps/api/.env.production
DATABASE_URL=postgresql://...
JWT_SECRET=...
AUDIT_ENABLED=true
```

⚠️ **NEVER commit `.env` files to version control**

---

## Environment Setup

### 1. Clone and Install Dependencies

```bash
# Clone repository
git clone <repository-url>
cd xala-digdir-monorepo

# Install dependencies
pnpm install

# Verify installation
pnpm build
```

### 2. Configure Deployment Settings

Copy and configure deployment settings:

```bash
# Create deploy config (if not exists)
cp scripts/deploy-config.example.sh scripts/deploy-config.sh

# Edit with your credentials
vim scripts/deploy-config.sh
```

Required variables:

```bash
HOSTINGER_HOST="72.61.23.56"
HOSTINGER_USER="your-username"
HOSTINGER_PORT="22"
WEB_REMOTE_PATH="/path/to/web"
BACKOFFICE_REMOTE_PATH="/path/to/backoffice"
MINSIDE_REMOTE_PATH="/path/to/minside"
```

### 3. Verify SSH Connection

```bash
source scripts/deploy-config.sh
ssh -p $HOSTINGER_PORT "$HOSTINGER_USER@$HOSTINGER_HOST" "echo 'Connection successful'"
```

---

## Deployment Process

### Pre-Deployment Checklist

Before deploying, run this comprehensive checklist:

```bash
# 1. Ensure clean working directory
git status

# 2. Run all tests
pnpm test

# 3. Check for duplicate vite configs (can cause build issues)
find apps -name "vite.config.*" -type f

# 4. Verify theme files exist in public folders
for app in web backoffice minside; do
  ls apps/$app/public/themes/digilist.css || echo "MISSING: $app themes"
done

# 5. Clear all caches to prevent stale builds
rm -rf .turbo apps/*/dist apps/*/.turbo node_modules/.cache apps/*/node_modules/.vite

# 6. Run production build
pnpm build

# 7. Check for circular chunk warnings
pnpm build 2>&1 | grep -i "circular"
```

### Deploy All Applications

Deploy all frontend applications at once:

```bash
./scripts/deploy.sh all
```

This will:
1. Build all applications with production optimizations
2. Copy theme CSS files to public folders
3. Sync built files to remote server via rsync
4. Clean up old files on the server

### Deploy Individual Applications

Deploy specific applications:

```bash
# Deploy web app only
./scripts/deploy.sh web

# Deploy backoffice only
./scripts/deploy.sh backoffice

# Deploy minside only
./scripts/deploy.sh minside
```

### Deploy API

The API uses a different deployment process with PM2:

```bash
cd apps/api
./scripts/deploy.sh production
```

This will:
1. Build the API application
2. Sync files to remote server
3. Restart PM2 process
4. Run database migrations (if any)

### Manual Deployment (Emergency)

If the deploy script fails, use manual rsync:

```bash
# Source configuration
source scripts/deploy-config.sh

# Deploy web app manually
rsync -avz --delete -e "ssh -p $HOSTINGER_PORT" \
  apps/web/dist/ "$HOSTINGER_USER@$HOSTINGER_HOST:$WEB_REMOTE_PATH/"

# Deploy backoffice manually
rsync -avz --delete -e "ssh -p $HOSTINGER_PORT" \
  apps/backoffice/dist/ "$HOSTINGER_USER@$HOSTINGER_HOST:$BACKOFFICE_REMOTE_PATH/"
```

---

## Post-Deployment Verification

### 1. Verify Server Files

Check that new files were deployed correctly:

```bash
source scripts/deploy-config.sh

# Check web app files
ssh -p $HOSTINGER_PORT "$HOSTINGER_USER@$HOSTINGER_HOST" \
  "ls -la ${WEB_REMOTE_PATH}/assets/*.js | head -10"

# Check for old chunk files (should not exist)
ssh -p $HOSTINGER_PORT "$HOSTINGER_USER@$HOSTINGER_HOST" \
  "ls ${WEB_REMOTE_PATH}/assets/vendor-misc* 2>&1"
```

**Expected**: Only hash-named files (e.g., `index-a1b2c3d4.js`), no old chunk files.

### 2. Browser Verification

Open each application in an **incognito window** to bypass cache:

- https://web-test.digilist.no
- https://backoffice-test.digilist.no
- https://minside-test.digilist.no

### 3. Check Browser Console

Open Developer Tools Console and verify:

✅ **Should NOT see:**
- `ReferenceError: Cannot access before initialization`
- 404 errors for CSS files
- 404 errors for `/themes/` files
- Chunk loading errors

✅ **Should see:**
- Application loads successfully
- Design system styles applied correctly
- No JavaScript errors

### 4. Verify API Health

```bash
curl https://api.digilist.no/health
```

**Expected response:**
```json
{
  "status": "ok",
  "version": "x.x.x",
  "uptime": 12345
}
```

### 5. Check PM2 Process (API)

```bash
ssh -p $HOSTINGER_PORT "$HOSTINGER_USER@$HOSTINGER_HOST" "pm2 status"
```

**Expected**: API process status should be `online`.

---

## Rollback Procedures

### Frontend Applications

If deployment introduces issues, rollback using Git:

```bash
# 1. Find last working commit
git log --oneline -10

# 2. Checkout previous version
git checkout <commit-hash>

# 3. Rebuild and redeploy
rm -rf .turbo apps/*/dist
pnpm build
./scripts/deploy.sh all
```

### API

Rollback API using PM2:

```bash
ssh -p $HOSTINGER_PORT "$HOSTINGER_USER@$HOSTINGER_HOST" \
  "cd /path/to/api && pm2 reload api --update-env"
```

If issues persist, restore from backup:

```bash
# Restore database backup (if needed)
psql $DATABASE_URL < backups/backup-YYYY-MM-DD.sql
```

---

## Troubleshooting

### Issue: Missing Styles / Broken Layout

**Symptom**: Application loads but has no visual styling.

**Root Cause**: Theme CSS files not found or incorrect paths.

**Solution**:

```bash
# 1. Verify theme files exist
ls apps/web/public/themes/digilist.css
ls apps/web/public/themes/digilist-extensions.css

# 2. If missing, copy from ds-themes package
mkdir -p apps/{web,backoffice,minside}/public/themes
cp packages/ds-themes/generated/digilist.css apps/*/public/themes/
cp packages/ds-themes/themes/digilist-extensions.css apps/*/public/themes/

# 3. Rebuild and redeploy
pnpm build
./scripts/deploy.sh all
```

### Issue: Circular Chunk Dependency Error

**Symptom**: Blank page with console error:
```
Uncaught ReferenceError: Cannot access 'X' before initialization
```

**Root Cause**: Vite manualChunks created circular dependencies.

**Solution**:

```bash
# 1. Check for duplicate vite.config files
find apps -name "vite.config.*" -type f

# 2. Remove any .js files if .ts exists
rm apps/web/vite.config.js

# 3. Clear all caches
rm -rf .turbo apps/*/dist apps/*/.turbo node_modules/.cache

# 4. Rebuild
pnpm build
```

### Issue: Old Files Served After Deploy

**Symptom**: Browser still shows errors from previous deployment.

**Root Cause**: Browser cache or CDN cache.

**Solution**:

```bash
# Users must hard-refresh
# Mac: Cmd + Shift + R
# Windows/Linux: Ctrl + Shift + R

# Or use incognito window

# Verify server has new files
source scripts/deploy-config.sh
ssh -p $HOSTINGER_PORT "$HOSTINGER_USER@$HOSTINGER_HOST" \
  "ls -lt ${WEB_REMOTE_PATH}/assets/*.js | head -5"
```

### Issue: Build Uses Old Configuration

**Symptom**: Build output doesn't reflect vite.config.ts changes.

**Root Cause**: Turborepo cache or duplicate config files.

**Solution**:

```bash
# 1. Remove Turbo cache
rm -rf .turbo apps/*/.turbo

# 2. Remove build artifacts
rm -rf apps/*/dist

# 3. Clear Vite cache
rm -rf node_modules/.cache apps/*/node_modules/.vite

# 4. Rebuild from scratch
pnpm build
```

### Issue: API Not Responding

**Symptom**: API requests timeout or return 502/504 errors.

**Solution**:

```bash
# Check PM2 process status
ssh -p $HOSTINGER_PORT "$HOSTINGER_USER@$HOSTINGER_HOST" "pm2 status"

# Check API logs
ssh -p $HOSTINGER_PORT "$HOSTINGER_USER@$HOSTINGER_HOST" "pm2 logs api --lines 50"

# Restart API process
ssh -p $HOSTINGER_PORT "$HOSTINGER_USER@$HOSTINGER_HOST" "pm2 restart api"
```

---

## Best Practices

### 1. Always Use Production Builds

```bash
# ✅ CORRECT
NODE_ENV=production pnpm build

# ❌ WRONG - dev builds in production
pnpm dev
```

### 2. Clear Caches Before Critical Deployments

```bash
# Clear all caches to ensure fresh build
rm -rf .turbo apps/*/dist apps/*/.turbo node_modules/.cache apps/*/node_modules/.vite
```

### 3. Test in Incognito Window

Always verify deployments in incognito mode to bypass browser cache.

### 4. Monitor Error Logs

After deployment, monitor logs for errors:

```bash
# API logs
ssh -p $HOSTINGER_PORT "$HOSTINGER_USER@$HOSTINGER_HOST" "pm2 logs api --lines 100"

# Check for recent errors
ssh -p $HOSTINGER_PORT "$HOSTINGER_USER@$HOSTINGER_HOST" \
  "pm2 logs api --lines 1000 | grep -i error"
```

### 5. Maintain Deployment History

Keep deployment notes:

```bash
# Tag releases
git tag -a v1.2.3 -m "Release v1.2.3: Feature X"
git push --tags

# Document in CHANGELOG.md
echo "## [1.2.3] - $(date +%Y-%m-%d)" >> CHANGELOG.md
```

### 6. Use Semantic Versioning

Follow semantic versioning for releases:

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### 7. Backup Before Major Changes

```bash
# Backup database before migrations
pg_dump $DATABASE_URL > backups/backup-$(date +%Y-%m-%d).sql

# Backup current deployment
ssh -p $HOSTINGER_PORT "$HOSTINGER_USER@$HOSTINGER_HOST" \
  "tar -czf ~/backups/web-$(date +%Y%m%d-%H%M%S).tar.gz ${WEB_REMOTE_PATH}"
```

---

## Deployment Checklist

Use this checklist for every production deployment:

- [ ] All tests passing (`pnpm test`)
- [ ] No TypeScript errors (`pnpm type-check`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Environment variables configured
- [ ] Database migrations ready (if applicable)
- [ ] Backup created
- [ ] Caches cleared
- [ ] Production build successful
- [ ] Deployment script executed
- [ ] Post-deployment verification complete
- [ ] Error logs checked
- [ ] Stakeholders notified
- [ ] Deployment documented

---

## Related Documentation

- [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) - Detailed lessons learned
- [Architecture Guide](./01-architecture.md) - System architecture
- [Testing Guide](./02-testing.md) - Testing strategies
- [Performance Guide](./04-performance.md) - Performance optimization
- [Accessibility Guide](./05-accessibility.md) - WCAG compliance

---

## Support

For deployment issues:

1. Check [Troubleshooting](#troubleshooting) section above
2. Review [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for known issues
3. Check server logs via SSH
4. Contact DevOps team

**Emergency Rollback**: Follow [Rollback Procedures](#rollback-procedures) immediately if production is affected.
