# Deployment Scripts Guide

## Overview

The Digilist Platform has multiple deployment scripts optimized for different scenarios:

## 1. Full Deployment (`deploy-test.sh`)

**Use when:** Initial setup, database changes, or adding new seed data

```bash
./infra/scripts/deploy-test.sh
```

**What it does:**
- ✅ Builds all packages and apps
- ✅ Runs database migrations
- ✅ Seeds database (can skip with `SKIP_SEED=true`)
- ✅ Uploads storage files (only first time, uses marker file)
- ✅ Deploys all apps
- ✅ Restarts services
- ✅ Runs health checks and tests

**Optimizations:**
- Storage files upload **once only** (marker file: `/var/www/digilist-storage/.storage-uploaded`)
- Database seeding can be skipped: `SKIP_SEED=true ./infra/scripts/deploy-test.sh`

---

## 2. Apps-Only Deployment (`deploy-apps-only.sh`)

**Use when:** Code changes only (no database/seed changes)

```bash
# Deploy all apps
./infra/scripts/deploy-apps-only.sh

# Deploy specific app
./infra/scripts/deploy-apps-only.sh web
./infra/scripts/deploy-apps-only.sh minside
./infra/scripts/deploy-apps-only.sh backoffice
./infra/scripts/deploy-apps-only.sh api
```

**What it does:**
- ✅ Builds specified app(s)
- ✅ Uploads to server
- ✅ Restarts API (if deploying API)
- ❌ **Skips** migrations
- ❌ **Skips** seeding
- ❌ **Skips** storage upload

**Benefits:**
- ⚡ **Much faster** (2-3 minutes vs 10+ minutes)
- 🎯 **Targeted** - deploy only what changed
- 🔒 **Safe** - doesn't touch database

---

## 3. Per-App Package Scripts

**Use when:** Local development or CI/CD pipelines

```bash
# Build specific app
pnpm --filter @xala/web build
pnpm --filter @xala/minside build
pnpm --filter @xala/backoffice build
pnpm --filter @digilist/api build
```

---

## Deployment Decision Tree

```
Do you have database changes (migrations/seeds)?
├─ YES → Use deploy-test.sh
└─ NO → Do you need to deploy all apps?
    ├─ YES → Use deploy-apps-only.sh
    └─ NO → Use deploy-apps-only.sh [app-name]
```

---

## Common Scenarios

### Scenario 1: Frontend Code Change (e.g., fix button styling)
```bash
./infra/scripts/deploy-apps-only.sh minside
```
**Time:** ~2 minutes

### Scenario 2: API Code Change (e.g., add new endpoint)
```bash
./infra/scripts/deploy-apps-only.sh api
```
**Time:** ~2 minutes

### Scenario 3: Added New Translation Keys
```bash
# Update seed file, then:
./infra/scripts/deploy-test.sh
```
**Time:** ~10 minutes (includes seeding)

### Scenario 4: Code Changes + Already Seeded
```bash
# Skip seeding to save time:
SKIP_SEED=true ./infra/scripts/deploy-test.sh
```
**Time:** ~8 minutes (skips seeding)

### Scenario 5: Multiple App Changes
```bash
./infra/scripts/deploy-apps-only.sh
```
**Time:** ~5 minutes

---

## Storage Files

Storage files (seed images) are uploaded **once only** using a marker file system:

**Marker file:** `/var/www/digilist-storage/.storage-uploaded`

**To force re-upload:**
```bash
ssh digilist@72.61.23.56 "rm /var/www/digilist-storage/.storage-uploaded"
./infra/scripts/deploy-test.sh
```

---

## Environment Variables

### `SKIP_SEED`
Skip database seeding (useful when data already exists)

```bash
SKIP_SEED=true ./infra/scripts/deploy-test.sh
```

---

## Troubleshooting

### Images keep uploading
Check if marker file exists:
```bash
ssh digilist@72.61.23.56 "ls -la /var/www/digilist-storage/.storage-uploaded"
```

If missing, it will be created on next full deployment.

### App not updating
1. Check build succeeded locally
2. Verify rsync completed
3. Clear browser cache (Cmd+Shift+R)
4. For API, check PM2 restarted: `ssh digilist@72.61.23.56 "pm2 status"`

### Database out of sync
Run full deployment:
```bash
./infra/scripts/deploy-test.sh
```

---

## Best Practices

1. **Use apps-only for code changes** - Much faster
2. **Use full deploy for database changes** - Ensures migrations run
3. **Skip seeding when possible** - Use `SKIP_SEED=true`
4. **Deploy specific apps** - Faster than deploying all
5. **Test locally first** - Run `pnpm build` before deploying

---

## Quick Reference

| Scenario | Command | Time |
|----------|---------|------|
| Initial setup | `./infra/scripts/deploy-test.sh` | ~10 min |
| Code change (one app) | `./infra/scripts/deploy-apps-only.sh [app]` | ~2 min |
| Code change (all apps) | `./infra/scripts/deploy-apps-only.sh` | ~5 min |
| Database change | `./infra/scripts/deploy-test.sh` | ~10 min |
| Code + skip seed | `SKIP_SEED=true ./infra/scripts/deploy-test.sh` | ~8 min |
