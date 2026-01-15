# Deployment Guide & Lessons Learned

> Last Updated: January 15, 2026

This document captures the deployment process for the Digilist monorepo
applications and the critical lessons learned from production deployment issues.

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Critical Issues & Fixes](#critical-issues--fixes)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Deployment Commands](#deployment-commands)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Troubleshooting Guide](#troubleshooting-guide)

---

## Deployment Overview

### Applications

| App        | Subdomain                     | Purpose                    |
| ---------- | ----------------------------- | -------------------------- |
| Web        | `web-test.digilist.no`        | Public-facing booking site |
| Backoffice | `backoffice-test.digilist.no` | Admin dashboard            |
| Minside    | `minside-test.digilist.no`    | User self-service portal   |
| API        | `api.digilist.no`             | Backend API (PM2 managed)  |

### Deployment Stack

- **Host**: Hostinger VPS (72.61.23.56)
- **Transport**: rsync over SSH
- **Build**: Vite + Turbo
- **Process Manager**: PM2 (for API)

---

## Critical Issues & Fixes

### Issue 1: Missing CSS Styles in Production

**Symptom**: Login pages showed broken layout with unstyled elements.

**Root Cause**: Theme CSS files were loaded from `/node_modules/...` paths which
don't exist in production.

**Fix Applied**:

1. Updated `packages/ds-themes/src/index.ts` to use `/themes/` paths:
   ```typescript
   // ❌ WRONG - node_modules paths don't exist in production
   const DIGILIST_THEME = [
       "/node_modules/@xala/ds-themes/generated/digilist.css",
       "/node_modules/@xala/ds-themes/themes/digilist-extensions.css",
   ];

   // ✅ CORRECT - public folder paths
   const DIGILIST_THEME = [
       "/themes/digilist.css",
       "/themes/digilist-extensions.css",
   ];
   ```

2. Created `public/themes/` directories in each app
3. Copied CSS files to public folders:
   ```bash
   cp packages/ds-themes/generated/digilist.css apps/*/public/themes/
   cp packages/ds-themes/themes/digilist-extensions.css apps/*/public/themes/
   ```

**Prevention**: The updated deploy script now automatically copies theme files.

---

### Issue 2: Circular Chunk Dependency (Blank Page)

**Symptom**: Web app showed blank page with error:

```
Uncaught ReferenceError: Cannot access 'Ui' before initialization
    at vendor-misc-CvGwCr6A.js:19:9356
```

**Root Cause**: Vite's `manualChunks` configuration created circular
dependencies:

- `vendor-misc` → imported React
- `vendor-react` → imported by Designsystemet in `vendor-misc`
- Circular: `vendor-misc` ↔ `vendor-react`

**Fix Applied**: Updated `apps/web/vite.config.ts` to consolidate all
node_modules into a single vendor chunk:

```typescript
manualChunks: ((id) => {
    // Large libraries get their own chunks
    if (id.includes("node_modules/mapbox-gl")) return "vendor-mapbox";
    if (id.includes("node_modules/@tanstack/react-query")) {
        return "vendor-query";
    }

    // Local packages get own chunks
    if (id.includes("packages/client-sdk/src")) return "vendor-sdk";
    if (id.includes("packages/ds/src") || id.includes("@xala/ds")) {
        return "vendor-ds";
    }

    // ✅ Everything else in ONE chunk - prevents circular deps
    if (id.includes("node_modules")) return "vendor";
});
```

**Prevention**: Added Vite configuration validation to deploy script.

---

### Issue 3: Stale Vite Config Files

**Symptom**: Build kept producing old chunk names despite config changes.

**Root Cause**: Both `vite.config.js` AND `vite.config.ts` existed in the web
app. Vite prefers `.js` over `.ts`, so changes to `.ts` were ignored.

**Fix Applied**:

```bash
rm apps/web/vite.config.js  # Remove stale .js file
```

**Prevention**: Added check in deploy script to detect duplicate config files.

---

### Issue 4: Browser Cache Serving Old Files

**Symptom**: After deployment, browser still showed errors from old JS files.

**Root Cause**: Browser cached old JavaScript bundles. Even though server had
new files, browsers served from cache.

**Fix Applied**:

- Deploy uses `rsync --delete` to remove old files
- Users must hard-refresh (`Cmd+Shift+R` / `Ctrl+Shift+R`)

**Prevention**:

- Vite uses content hashes in filenames (automatic)
- Consider adding cache-control headers on server

---

## Pre-Deployment Checklist

Run this checklist before every deployment:

```bash
# 1. Check for duplicate Vite configs
find apps -name "vite.config.*" -type f | sort | uniq -d

# 2. Verify theme files exist in public folders
for app in web backoffice minside; do
  ls apps/$app/public/themes/digilist.css || echo "MISSING: $app themes"
done

# 3. Clear all caches
rm -rf .turbo apps/*/dist apps/*/.turbo node_modules/.cache apps/*/node_modules/.vite

# 4. Run full build and check for circular chunk warnings
pnpm build 2>&1 | grep -i "circular"

# 5. Run tests
pnpm --filter @digilist/client-sdk test
pnpm --filter @digilist/api test
```

---

## Deployment Commands

### Deploy All Apps

```bash
./scripts/deploy.sh all
```

### Deploy Individual App

```bash
./scripts/deploy.sh web
./scripts/deploy.sh backoffice
./scripts/deploy.sh minside
```

### Deploy API

```bash
cd apps/api && ./scripts/deploy.sh production
```

### Force Clean Deploy

```bash
# When caching issues occur
rm -rf .turbo apps/*/dist
pnpm build
./scripts/deploy.sh all
```

### Manual rsync (Emergency)

```bash
source scripts/deploy-config.sh
rsync -avz --delete -e "ssh -p $HOSTINGER_PORT" \
  apps/web/dist/ "$HOSTINGER_USER@$HOSTINGER_HOST:$WEB_REMOTE_PATH/"
```

---

## Post-Deployment Verification

### 1. Check Server Files

```bash
source scripts/deploy-config.sh
ssh -p $HOSTINGER_PORT "$HOSTINGER_USER@$HOSTINGER_HOST" \
  "ls -la ${WEB_REMOTE_PATH}/assets/*.js"
```

**Expected**: Only new hash-named files, no old `vendor-misc` or `vendor-react`
files.

### 2. Browser Verification

Open each URL in an incognito window:

- https://web-test.digilist.no
- https://backoffice-test.digilist.no
- https://minside-test.digilist.no

### 3. Check Console for Errors

- No `ReferenceError` or `cannot access before initialization`
- No 404 errors for CSS files
- No 404 errors for `/themes/` files

---

## Troubleshooting Guide

### "Cannot access 'X' before initialization"

**Cause**: Circular dependency between chunks **Fix**:

1. Check for duplicate vite.config files
2. Consolidate vendor chunks in vite.config.ts
3. Clear caches and rebuild

### Missing Styles / Broken Layout

**Cause**: Theme CSS not bundled or wrong paths **Fix**:

1. Verify `/themes/` folder exists in public
2. Check `ds-themes/src/index.ts` uses `/themes/` not `/node_modules/`
3. Copy theme CSS files to public folders

### Old Files Served After Deploy

**Cause**: Browser cache or CDN cache **Fix**:

1. Hard refresh (Cmd+Shift+R)
2. Incognito window
3. Verify server has new files with SSH

### Build Uses Old Config

**Cause**: Turbo cache or duplicate config files **Fix**:

1. Remove duplicate vite.config.* files
2. `rm -rf .turbo apps/*/.turbo`
3. Rebuild

---

## Architecture Notes

### Theme Loading Strategy

```
DesignsystemetProvider (theme="digilist")
        ↓
getThemeUrls("digilist")
        ↓
["/themes/digilist.css", "/themes/digilist-extensions.css"]
        ↓
Browser loads CSS from public folder
```

### Chunk Strategy

```
vendor-mapbox.js   → Mapbox GL (1.6 MB, rarely changes)
vendor-ds.js       → Design System components
vendor-sdk.js      → Client SDK
vendor-query.js    → React Query
vendor.js          → All other node_modules (React, etc.)
index.js           → Application code
```

---

## Database Migrations

### Migration Process

Database migrations must be run on the production database before deploying API changes.

**Step-by-step:**

```bash
# 1. SSH into server
ssh -p $HOSTINGER_PORT "$HOSTINGER_USER@$HOSTINGER_HOST"

# 2. Navigate to API directory
cd /var/www/digilist/api

# 3. Backup database (CRITICAL!)
sudo -u postgres pg_dump digilist_prod > /tmp/backup_$(date +%Y%m%d_%H%M%S).sql

# 4. Run migration files
psql -U digilist -d digilist_prod -f drizzle/0004_gdpr_consent_system.sql
psql -U digilist -d digilist_prod -f drizzle/0005_notification_system.sql

# 5. Verify migration
psql -U digilist -d digilist_prod -c "\dt" | grep -E "(consent_|notification_|data_subject_)"

# 6. Restart API
pm2 restart xala-api

# 7. Check logs
pm2 logs xala-api --lines 50
```

### Recent Migrations

| Tag | Date | Tables Created | Notes |
|-----|------|----------------|-------|
| `0004_gdpr_consent_system` | 2026-01-15 | 5 tables | GDPR compliance system |
| `0005_notification_system` | 2026-01-15 | 6 tables | Multi-channel notifications |

**GDPR Tables:**
- `consent_types` - Consent definitions with versioning
- `user_consents` - User consent records
- `consent_audit_log` - Audit trail for consent changes
- `data_subject_requests` - GDPR data requests
- `data_processing_records` - Article 30 processing records

**Notification Tables:**
- `notification_templates` - Template definitions with i18n
- `notifications` - Individual notification instances
- `notification_delivery_logs` - Delivery tracking
- `notification_queue` - Scheduled notifications
- `sms_provider_configs` - SMS provider settings
- `email_provider_configs` - Email provider settings

### Schema Fixes Applied

During deployment, several schema mismatches were discovered and fixed:

```sql
-- Missing columns in consent_types
ALTER TABLE consent_types ADD COLUMN IF NOT EXISTS tenant_id text;
ALTER TABLE consent_types ADD COLUMN IF NOT EXISTS code varchar(100);
ALTER TABLE consent_types ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;
ALTER TABLE consent_types ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE consent_types ADD COLUMN IF NOT EXISTS is_required boolean DEFAULT false;
ALTER TABLE consent_types ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE consent_types ADD COLUMN IF NOT EXISTS show_on_registration boolean DEFAULT false;

-- Update existing records
UPDATE consent_types SET tenant_id = 'default' WHERE tenant_id IS NULL;
UPDATE consent_types SET code = 'terms_of_service' WHERE name = 'Terms of Service';
UPDATE consent_types SET code = 'privacy_policy' WHERE name = 'Privacy Policy';
UPDATE consent_types SET code = 'marketing_emails' WHERE name = 'Marketing Emails';
UPDATE consent_types SET code = 'analytics_cookies' WHERE name = 'Analytics Cookies';
```

### Rollback Procedures

If migration fails or causes issues:

```bash
# Restore from backup
psql -U digilist -d digilist_prod < /tmp/backup_YYYYMMDD_HHMMSS.sql

# Verify restoration
psql -U digilist -d digilist_prod -c "SELECT COUNT(*) FROM tenants;"

# Restart API with old version
pm2 stop xala-api
cd /var/www/digilist/api.backup
pm2 start ecosystem.config.cjs
```

---

## GDPR + Notification System Deployment (2026-01-15)

### Overview

This deployment added comprehensive GDPR compliance and multi-channel notification system.

**Features Added:**
- Consent management with versioning
- Data subject requests (6 types)
- Multi-channel notifications (in-app, email, SMS, push)
- Real-time WebSocket notifications
- GDPR-notification integration
- Frontend components across all 3 apps

### Issues Encountered & Fixes

#### Issue 1: Drizzle Interactive Prompts

**Symptom**: `pnpm db:generate` prompted for user input, couldn't run non-interactively

**Root Cause**: Drizzle detected schema changes and prompted for column categorization

**Fix Applied**: Created manual SQL migration files instead of using Drizzle generate
- Created `0004_gdpr_consent_system.sql` manually
- Created `0005_notification_system.sql` manually
- Updated `drizzle/meta/_journal.json` to register migrations

#### Issue 2: Database Schema Mismatches

**Symptom**: API errors `column "tenant_id" does not exist`, then `column "code" does not exist`

**Root Cause**: Migration didn't include all columns expected by TypeScript types

**Fix Applied**: Added missing columns via ALTER TABLE statements
```sql
ALTER TABLE consent_types ADD COLUMN tenant_id text NOT NULL DEFAULT 'default';
ALTER TABLE consent_types ADD COLUMN code varchar(100) NOT NULL;
ALTER TABLE consent_types ADD COLUMN display_order integer NOT NULL DEFAULT 0;
-- Plus 4 more columns
```

#### Issue 3: Route Conflicts

**Symptom**: `FastifyError: Method 'GET' already declared for route '/api/notifications/:id'`

**Root Cause**: Both old `NotificationsController` and new `NotificationSystemController` were active

**Fix Applied**: Disabled old controller
```typescript
// apps/api/src/modules/notifications/notifications.controller.ts
// DEPRECATED: Commenting out to prevent route conflicts
// @Controller('/api/notifications')
export class NotificationsController {
```

#### Issue 4: GDPR Routes Not Registered

**Symptom**: `curl https://api.digilist.no/api/gdpr/consent-types` returned 404

**Root Cause**: GDPR controller imported but routes not registered (requires custom registration)

**Fix Applied**: Added manual registration in main.ts
```typescript
// apps/api/src/main.ts
const gdprController = container.resolve('GdprController') as GdprController;
await gdprController.register(app);
console.log('✓ GDPR routes registered');
```

### Post-Deployment Verification

**Database:**
```bash
# Verify tables created
psql -U digilist -d digilist_prod -c "\dt" | grep -E "(consent_|notification_|data_subject_)"

# Expected: 11 new tables
# - consent_types
# - user_consents
# - consent_audit_log
# - data_subject_requests
# - data_processing_records
# - notification_templates
# - notifications
# - notification_delivery_logs
# - notification_queue
# - sms_provider_configs
# - email_provider_configs
```

**API Endpoints:**
```bash
# Test GDPR endpoints
curl https://api.digilist.no/api/gdpr/consent-types
curl -H "Authorization: Bearer $TOKEN" https://api.digilist.no/api/gdpr/my-consents

# Test notification endpoints
curl -H "Authorization: Bearer $TOKEN" https://api.digilist.no/api/notifications
curl -H "Authorization: Bearer $TOKEN" https://api.digilist.no/api/notifications/count
```

**Frontend:**
```bash
# Verify apps load
curl -I https://web-test.digilist.no
curl -I https://backoffice-test.digilist.no
curl -I https://minside-test.digilist.no

# Expected: HTTP 200 for all
```

**WebSocket:**
```javascript
// Test real-time notifications
const ws = new WebSocket('wss://api.digilist.no/ws/notifications');
ws.onopen = () => console.log('Connected');
ws.onmessage = (e) => console.log('Notification:', JSON.parse(e.data));
```

### Files Modified

| File | Change |
|------|--------|
| `apps/api/drizzle/0004_gdpr_consent_system.sql` | **CREATED** - GDPR database migration |
| `apps/api/drizzle/0005_notification_system.sql` | **CREATED** - Notification system migration |
| `apps/api/src/main.ts` | Added GDPR + notification route registration |
| `apps/api/src/modules/notifications/notifications.controller.ts` | Disabled to prevent conflicts |
| `apps/web/src/components/ConsentPopup.tsx` | **CREATED** - Initial consent collection |
| `apps/web/src/components/ConsentSettings.tsx` | **CREATED** - Consent management page |
| `apps/web/src/components/DataSubjectRequestForm.tsx` | **CREATED** - GDPR request form |
| `apps/backoffice/src/routes/gdpr/index.tsx` | **CREATED** - Admin GDPR dashboard |
| `packages/i18n/src/locales/nb.ts` | Added 100+ GDPR translation keys |
| `packages/i18n/src/locales/en.ts` | Added 100+ GDPR translation keys |
| `CLAUDE.md` | Updated with GDPR + notification system info |

---

## Files Modified in This Deployment Session

| File                                      | Change                                                 |
| ----------------------------------------- | ------------------------------------------------------ |
| `packages/ds-themes/src/index.ts`         | Changed theme URLs from `/node_modules/` to `/themes/` |
| `apps/web/vite.config.ts`                 | Consolidated vendor chunks to prevent circular deps    |
| `apps/web/vite.config.js`                 | **DELETED** (was causing config conflicts)             |
| `apps/*/public/themes/`                   | Created directories and copied CSS files               |
| `apps/backoffice/src/routes/settings.tsx` | Fixed duplicate aria-label attributes                  |
| `apps/api/src/main.ts`                    | Removed duplicate ReviewsController registration       |
