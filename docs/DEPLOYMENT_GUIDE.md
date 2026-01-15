# Deployment Guide - GDPR System to Hostinger

## Overview
This guide walks through deploying the new GDPR consent system to production on Hostinger VPS.

## Prerequisites
- SSH access to Hostinger VPS (72.61.23.56)
- Production database access
- Domain: digilist.no with subdomains configured

## Step 1: Run Database Migrations on Production

### Option A: Run migrations via SSH (Recommended)

```bash
# SSH into Hostinger VPS
ssh root@72.61.23.56

# Navigate to API directory
cd /path/to/unified-api  # Adjust path as needed

# Load production environment
export $(cat .env.production | xargs)

# Run migrations
pnpm db:migrate
```

### Option B: Run migrations locally with production DB

**WARNING**: Only use if you have direct database access from local machine.

```bash
# In project root, set production DATABASE_URL temporarily
cd apps/api
export DATABASE_URL="postgresql://digilist:digilist_secure_2026@72.61.23.56:5432/unified_api"

# Run migrations
pnpm db:migrate

# Unset the variable
unset DATABASE_URL
```

### Migration Contents
The migration (`0004_gdpr_consent_system.sql`) creates:
- `consent_types` - Defines consent types (terms, privacy, marketing, analytics)
- `user_consents` - User consent decisions with versioning
- `consent_audit_log` - Complete audit trail (GDPR Article 30)
- `data_processing_records` - Processing activities record (GDPR Article 30)
- `data_subject_requests` - Tracks user data requests

### Verify Migration Success

```sql
-- Connect to database
psql postgresql://digilist:digilist_secure_2026@localhost:5432/unified_api

-- Check tables were created
\dt

-- Verify consent types were seeded
SELECT * FROM consent_types;

-- Should see 4 default consent types:
-- 1. Terms of Service (required)
-- 2. Privacy Policy (required)
-- 3. Marketing Communications (optional)
-- 4. Analytics and Improvement (optional)
```

## Step 2: Build Frontend Apps

From project root:

```bash
# Build all apps
pnpm build

# Or build individually
pnpm --filter "@xala/web" build
pnpm --filter "@xala/backoffice" build
pnpm --filter "@xala/minside" build
```

### Verify Build Output

```bash
# Check dist folders exist
ls -la apps/web/dist
ls -la apps/backoffice/dist
ls -la apps/minside/dist
```

## Step 3: Deploy to Hostinger

### Deploy All Apps

```bash
# From project root
pnpm deploy:all
```

### Deploy Individual Apps

```bash
pnpm deploy:web          # web-test.digilist.no
pnpm deploy:backoffice   # backoffice-test.digilist.no
pnpm deploy:minside      # minside-test.digilist.no
```

### What Happens During Deployment

1. **Pre-flight Checks**:
   - Removes duplicate Vite configs
   - Copies theme CSS files to public folders
   - Clears build caches

2. **Build Process**:
   - Creates production `.env` files
   - Builds each app with Vite
   - Validates no circular dependencies

3. **Deployment**:
   - Creates remote directories on Hostinger
   - Syncs dist files via rsync over SSH
   - Updates live sites

## Step 4: Verify Deployment

### Check Sites Are Accessible

```bash
# Test each subdomain
curl -I https://web-test.digilist.no
curl -I https://backoffice-test.digilist.no
curl -I https://minside-test.digilist.no
```

### Test GDPR Features

1. **Web App** (`https://web-test.digilist.no`):
   - Visit site as new user → Should see consent popup
   - Grant consents → Popup should dismiss
   - Visit `/privacy` → Should see consent settings

2. **MinSide** (`https://minside-test.digilist.no`):
   - Login → Should see consent popup if not granted
   - Visit `/privacy` → Manage consents and submit data requests

3. **Backoffice** (`https://backoffice-test.digilist.no`):
   - Login as admin
   - Visit `/gdpr` → Should see data request management dashboard
   - Submit test data request from MinSide
   - Verify it appears in backoffice GDPR dashboard

## Step 5: SSL Configuration (If Needed)

If SSL certificates are not configured:

```bash
# From project root
pnpm deploy:ssl
```

This will use Certbot/Let's Encrypt to set up SSL for:
- web-test.digilist.no
- backoffice-test.digilist.no
- minside-test.digilist.no

## Troubleshooting

### Migration Fails

```bash
# Check if tables already exist
psql $DATABASE_URL -c "\dt"

# If they exist, you can skip migration or manually verify schema
```

### Build Fails

```bash
# Clear all caches
rm -rf .turbo node_modules/.cache apps/*/dist apps/*/.turbo

# Reinstall dependencies
pnpm install

# Try build again
pnpm build
```

### Deployment SSH Issues

```bash
# Test SSH connection
ssh -p 22 root@72.61.23.56 "echo 'Connection successful'"

# Check deploy-config.sh has correct credentials
cat scripts/deploy-config.sh
```

### Site Shows 404

```bash
# SSH into server and check files were uploaded
ssh root@72.61.23.56

# Check public_html directories
ls -la /home/root/domains/web-test.digilist.no/public_html
ls -la /home/root/domains/backoffice-test.digilist.no/public_html
ls -la /home/root/domains/minside-test.digilist.no/public_html

# Verify index.html exists
cat /home/root/domains/web-test.digilist.no/public_html/index.html
```

## Production Checklist

- [ ] Database migrations completed successfully
- [ ] All 5 GDPR tables created
- [ ] 4 default consent types seeded
- [ ] All apps built without errors
- [ ] All apps deployed to Hostinger
- [ ] Web app accessible and consent popup shows
- [ ] MinSide privacy settings accessible
- [ ] Backoffice GDPR dashboard accessible
- [ ] SSL certificates active
- [ ] Test consent flow end-to-end
- [ ] Test data subject request flow

## Rollback Plan

If issues occur:

1. **Database Rollback**:
   ```sql
   DROP TABLE IF EXISTS data_subject_requests CASCADE;
   DROP TABLE IF EXISTS data_processing_records CASCADE;
   DROP TABLE IF EXISTS consent_audit_log CASCADE;
   DROP TABLE IF EXISTS user_consents CASCADE;
   DROP TABLE IF EXISTS consent_types CASCADE;
   ```

2. **Frontend Rollback**:
   ```bash
   # Re-deploy previous version from git
   git checkout <previous-commit>
   pnpm deploy:all
   ```

## Next Steps

After successful deployment:

1. **Monitor Logs**:
   ```bash
   # API logs
   ssh root@72.61.23.56 "pm2 logs unified-api"

   # Database logs
   ssh root@72.61.23.56 "tail -f /var/log/postgresql/postgresql-16-main.log"
   ```

2. **Test with Real Users**:
   - Have test users go through consent flow
   - Submit various data request types
   - Verify admin can process requests

3. **Update Documentation**:
   - Document consent types and their purposes
   - Create user guide for GDPR features
   - Train support team on data request process

## Support Contacts

- **VPS Provider**: Hostinger
- **Server IP**: 72.61.23.56
- **Database**: PostgreSQL 16
- **PM2 Process**: unified-api

## Deployment History

| Date | Version | Changes | Deployed By |
|------|---------|---------|-------------|
| 2026-01-15 | v1.1.0 | GDPR Consent System | Claude Code |
