# Quick Deployment Commands

## Pre-Deployment Status

### ✅ Completed
- [x] GDPR backend implementation (API, SDK, hooks)
- [x] GDPR frontend components (popup, settings, requests)
- [x] GDPR admin dashboard (backoffice)
- [x] Database migration file created
- [x] Migration journal updated
- [x] i18n translations added (Norwegian + English)
- [x] Deployment scripts reviewed and ready

### 📋 Pending
- [ ] Run database migrations on production
- [ ] Build and deploy frontend apps

## Step-by-Step Deployment

### 1. Run Database Migrations on Production

**Option A: Via SSH on Hostinger Server**

```bash
# SSH into Hostinger
ssh root@72.61.23.56

# Navigate to API directory (adjust path as needed)
cd /path/to/api

# Load production environment
export $(cat .env.production | xargs)

# Run migrations
pnpm db:migrate

# Verify tables created
psql $DATABASE_URL -c "\dt" | grep -E "(consent|data_subject)"
```

**Option B: Using Helper Script (Recommended)**

```bash
# From project root on Hostinger server
export $(cat apps/api/.env.production | xargs)
./scripts/run-production-migration.sh
```

### 2. Build All Frontend Apps

```bash
# From project root
pnpm build

# Expected output:
# ✓ Built @xala/web
# ✓ Built @xala/backoffice
# ✓ Built @xala/minside
```

### 3. Deploy to Hostinger

```bash
# Deploy all apps at once
pnpm deploy:all

# Or deploy individually
pnpm deploy:web
pnpm deploy:backoffice
pnpm deploy:minside
```

### 4. Verify Deployment

```bash
# Check sites are accessible
curl -I https://web-test.digilist.no
curl -I https://backoffice-test.digilist.no
curl -I https://minside-test.digilist.no

# Test GDPR features:
# 1. Visit web-test.digilist.no → should show consent popup
# 2. Visit minside-test.digilist.no/privacy → consent management
# 3. Visit backoffice-test.digilist.no/gdpr → admin dashboard
```

## Quick Reference

### Environment Variables
```bash
# Hostinger Production
HOSTINGER_HOST=72.61.23.56
DATABASE_URL=postgresql://digilist:digilist_secure_2026@localhost:5432/unified_api

# Subdomains
WEB=web-test.digilist.no
BACKOFFICE=backoffice-test.digilist.no
MINSIDE=minside-test.digilist.no
```

### Migration Files
```
apps/api/drizzle/
├── 0000_mute_agent_zero.sql
├── 0001_sparkling_microchip.sql
├── 0002_fancy_jack_power.sql
├── 0003_rental_objects_category.sql
└── 0004_gdpr_consent_system.sql  ← NEW
```

### GDPR Tables Created
```sql
consent_types              -- 4 default types seeded
user_consents             -- User consent decisions
consent_audit_log         -- Audit trail (GDPR Article 30)
data_processing_records   -- Processing records (GDPR Article 30)
data_subject_requests     -- Access, erasure, portability requests
```

### New Routes Added

**Web App:**
- `/privacy` - User consent & data request management

**MinSide:**
- `/privacy` - User consent & data request management

**Backoffice:**
- `/gdpr` - Admin dashboard for data requests (30-day SLA tracking)

## Troubleshooting

### Migration Fails

```bash
# Check if tables already exist
psql $DATABASE_URL -c "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE '%consent%';"

# If tables exist but migration fails, drop and retry:
psql $DATABASE_URL -c "DROP TABLE IF EXISTS data_subject_requests, data_processing_records, consent_audit_log, user_consents, consent_types CASCADE;"
```

### Build Fails

```bash
# Clear all caches
rm -rf .turbo node_modules/.cache apps/*/dist apps/*/.turbo apps/*/node_modules/.vite

# Reinstall and rebuild
pnpm install
pnpm build
```

### Deploy Fails

```bash
# Test SSH connection
ssh -p 22 root@72.61.23.56 "echo 'SSH OK'"

# Check deploy config
cat scripts/deploy-config.sh

# Verify remote directories exist
ssh root@72.61.23.56 "ls -la /home/root/domains/"
```

## Rollback

If you need to rollback:

```bash
# 1. Rollback database
psql $DATABASE_URL -f scripts/rollback-gdpr.sql  # Create this if needed

# 2. Rollback code
git checkout <previous-commit>
pnpm deploy:all
```

## Testing Checklist

After deployment:

- [ ] New user sees consent popup
- [ ] Required consents cannot be revoked
- [ ] Optional consents can be toggled
- [ ] Consent history shows in audit log
- [ ] Users can submit data requests
- [ ] Admins see requests in dashboard
- [ ] 30-day deadline tracking works
- [ ] Request status updates work
- [ ] Admin notes are visible to users

## Key Files Modified

```
Backend:
├── apps/api/src/database/schema/index.ts    (GDPR tables)
├── apps/api/src/modules/gdpr/               (GDPR controller)
└── apps/api/drizzle/0004_gdpr_consent_system.sql

SDK:
├── packages/client-sdk/src/types/gdpr.ts    (Types)
├── packages/client-sdk/src/services/gdpr.service.ts
└── packages/client-sdk/src/hooks/use-gdpr.ts

Frontend:
├── apps/web/src/components/ConsentPopup.tsx
├── apps/web/src/components/ConsentSettings.tsx
├── apps/web/src/components/DataSubjectRequestForm.tsx
├── apps/minside/src/components/               (same components)
└── apps/backoffice/src/routes/gdpr/index.tsx

i18n:
├── packages/i18n/src/locales/nb.ts          (100+ keys)
└── packages/i18n/src/locales/en.ts          (100+ keys)
```

## Support

For issues:
1. Check logs: `ssh root@72.61.23.56 "pm2 logs unified-api"`
2. Check database: `psql $DATABASE_URL`
3. Review DEPLOYMENT_GUIDE.md for detailed troubleshooting

## Next Steps After Deployment

1. **Seed Production Data** (optional):
   ```sql
   -- Add additional consent types if needed
   INSERT INTO consent_types (name, description, required, legal_basis, version)
   VALUES ('Custom Consent', 'Description...', false, 'consent', 1);
   ```

2. **Monitor Usage**:
   ```bash
   # Watch consent grants
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM user_consents WHERE granted=true;"

   # Watch data requests
   psql $DATABASE_URL -c "SELECT request_type, status, COUNT(*) FROM data_subject_requests GROUP BY request_type, status;"
   ```

3. **Update DNS** (if changing from test to production):
   - Update A records to remove "test" prefix
   - Run SSL setup for new domains
   - Update CORS_ORIGINS in API .env

---

**Deployment prepared by**: Claude Code
**Date**: 2026-01-15
**Version**: v1.1.0 (GDPR Consent System)
