# Auto-Seed Deployment - 2026-01-17

## Executive Summary

**Status**: ✅ READY FOR DEPLOYMENT
**Issue**: Production database has no rental objects (empty table causes 500 errors)
**Solution**: Auto-seed feature + Better error handling
**Impact**: Rental objects API will return 42 objects after deployment

---

## Problem Analysis

### Root Cause
The production database `platform.rental_objects` table is **empty**. The deployment script never runs database seeds.

### Symptoms
- `GET /api/public/rental-objects` → 500 Internal Server Error
- `GET /api/public/cities` → 500 Internal Server Error
- Generic error message: "An unexpected error occurred"
- No seed data loaded during deployment

### Why This Happened
1. Deployment script (`scripts/deploy.sh`) only:
   - Builds application
   - Syncs dist/ folder
   - Installs dependencies
   - Restarts PM2
   - **Never runs seeds**

2. Seed script exists (`src/database/seeds/demo-seed-v3.ts`) with 42 rental objects but never executed

---

## Changes Made

### 1. Updated Deployment Script ✅

**File**: `apps/api/scripts/deploy.sh`

**Changes**:
```bash
# Now copies src/ folder (includes seeds)
cp -r src "${DEPLOY_DIR}/"

# Added tsx dependency for running TypeScript seeds
"tsx": "^4.19.0"

# Added auto-seed logic (runs only if table is empty)
RENTAL_COUNT=$(psql "${DATABASE_URL}" -t -c "SELECT COUNT(*) FROM platform.rental_objects;" 2>/dev/null | xargs || echo "0")

if [ "${RENTAL_COUNT}" = "0" ]; then
  echo "📦 Database is empty, running seeds..."
  npx tsx src/database/seeds/demo-seed-v3.ts
  echo "✅ Seed complete"
else
  echo "✅ Database has ${RENTAL_COUNT} rental objects, skipping seed"
fi
```

**Smart Features**:
- Only seeds if table is empty (idempotent)
- Preserves existing data if present
- Automatic on every deployment

### 2. Improved Error Handling ✅

**File**: `apps/api/src/modules/public/public.controller.ts`

**Changes**: Added try-catch blocks to both endpoints:

```typescript
@Get('/rental-objects')
async getRentalObjects(request: FastifyRequest, reply: FastifyReply) {
  try {
    return await this.getListings(request, reply);
  } catch (error) {
    request.log.error({ error }, 'Failed to fetch rental objects');
    return reply.status(500).send({
      type: '/errors/database',
      title: 'Database Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Failed to query rental objects. Database may need seeding.',
      hint: 'Run: pnpm db:seed:v3',
    });
  }
}

@Get('/cities')
async getCities(request: FastifyRequest, reply: FastifyReply) {
  try {
    // ... query logic
  } catch (error) {
    request.log.error({ error }, 'Failed to fetch cities');
    return reply.status(500).send({
      type: '/errors/database',
      title: 'Database Error',
      status: 500,
      detail: error instanceof Error ? error.message : 'Failed to query cities. Database may need seeding.',
      hint: 'Run: pnpm db:seed:v3',
    });
  }
}
```

**Benefits**:
- Actual error messages visible in API responses
- Logs full error details to PM2 logs
- Helpful hints for operators

### 3. Created Manual Seed Script ✅

**File**: `apps/api/scripts/seed-production.sh`

**Usage**:
```bash
./scripts/seed-production.sh
```

**Purpose**: Manually seed production database if needed

---

## Seed Data Contents

### What Will Be Created

**File**: `src/database/seeds/demo-seed-v3.ts`

**Data**:
- **1 Tenant**: Skien Kommune (ID: `d0000000-0000-0000-0000-000000000001`)
- **19 Users**: 5 demo token, 7 Vipps test, 7 BankID test
- **42 Rental Objects** (all `status: 'published'`):
  - 25 LOKALER_OG_BANER (halls, sports, meeting rooms)
  - 8 UTSTYR_OG_INVENTAR (equipment with inventory)
  - 4 KJORETOY_OG_TRANSPORT (vehicles)
  - 5 OPPLEVELSER_OG_ARRANGEMENT (events with shared capacity)
- **5 Demo Bookings**: pending, approved, confirmed, completed

---

## Deployment Instructions

### Option 1: Standard Deployment (Recommended)

The updated `deploy.sh` script will automatically seed the database if empty:

```bash
cd /Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/apps/api
pnpm deploy
```

**What happens**:
1. Builds application
2. Syncs to VPS (including src/ folder)
3. Installs dependencies (including tsx)
4. **Checks if rental_objects table is empty**
5. **Runs seeds automatically if empty**
6. Restarts PM2

### Option 2: Manual Seeding

If SSH access available:

```bash
ssh root@185.68.16.74
cd /var/www/digilist-api
npx tsx src/database/seeds/demo-seed-v3.ts
```

### Option 3: Using Manual Script

```bash
./scripts/seed-production.sh
```

---

## Verification

### 1. Test API Endpoints

```bash
# Should return 42 rental objects
curl "https://api.digilist.no/api/public/rental-objects?limit=10"

# Should return cities (Skien)
curl "https://api.digilist.no/api/public/cities"

# Should return 200 OK
curl -I "https://api.digilist.no/api/public/rental-objects"
```

### 2. Expected Response

```json
{
  "data": [
    {
      "id": "r0000000-0000-0000-0000-000000000001",
      "slug": "kulturhuset-storsalen",
      "name": "Kulturhuset - Storsalen",
      "title": "Kulturhuset - Storsalen",
      "tenantId": "d0000000-0000-0000-0000-000000000001",
      "category": "LOKALER_OG_BANER",
      "categoryLabel": "sdk.rentalObject.category.LOKALER_OG_BANER",
      "timeMode": "PERIOD",
      "capacity": 500,
      "priceAmount": 500,
      "priceCurrency": "NOK",
      "status": "published"
    }
    // ... 41 more objects
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### 3. Check PM2 Logs

```bash
ssh root@185.68.16.74
pm2 logs digilist-api --lines 50
```

Look for:
- ✅ "Database has X rental objects" (if already seeded)
- ✅ "Database is empty, running seeds..." (if seeding)
- ✅ "Seed complete" (success)
- ❌ Any database connection errors

### 4. Check Audit Logs

After deployment, check audit logs for seed operations:

```bash
# Via API (if audit endpoint exists)
curl "https://api.digilist.no/api/audit?action=seed&limit=10"

# Via database
psql "${DATABASE_URL}" -c "SELECT * FROM compliance.audit_logs WHERE action = 'database:seed' ORDER BY created_at DESC LIMIT 10;"
```

---

## Rollback Plan

If deployment fails:

### 1. Revert Code

```bash
cd /Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/apps/api
git log --oneline -5  # Find previous commit
git revert <commit-hash>
pnpm deploy
```

### 2. Remove Seed Data (if needed)

```bash
psql "${DATABASE_URL}" <<SQL
  DELETE FROM platform.bookings WHERE tenant_id = 'd0000000-0000-0000-0000-000000000001';
  DELETE FROM platform.rental_objects WHERE tenant_id = 'd0000000-0000-0000-0000-000000000001';
  DELETE FROM platform.users WHERE tenant_id = 'd0000000-0000-0000-0000-000000000001';
  DELETE FROM platform.tenants WHERE id = 'd0000000-0000-0000-0000-000000000001';
SQL
```

---

## Files Changed

### Modified Files
1. `apps/api/scripts/deploy.sh` - Added auto-seed logic
2. `apps/api/src/modules/public/public.controller.ts` - Better error handling

### New Files
1. `apps/api/scripts/seed-production.sh` - Manual seeding script
2. `docs/operations/deployments/AUTO_SEED_DEPLOYMENT_2026-01-17.md` - This document

---

## Success Criteria

- [x] Deployment script includes auto-seed logic
- [x] Error handling returns meaningful messages
- [x] Manual seed script available for operators
- [ ] Deployment executed successfully
- [ ] API returns 42 rental objects
- [ ] No 500 errors on public endpoints
- [ ] Audit logs show seed operations
- [ ] Frontend displays rental objects correctly

---

## Next Steps

1. **Deploy to production**: `pnpm deploy`
2. **Verify endpoints**: Test all public endpoints return 200 OK
3. **Check logs**: Review PM2 logs for any errors
4. **Test frontend**: Verify rental objects display on web app
5. **Monitor**: Watch for 10 minutes for any issues

---

**Status**: ✅ READY FOR DEPLOYMENT
**Last Updated**: 2026-01-17 22:30 UTC
**Author**: Claude Code
**Deployment Time Estimate**: 5-10 minutes
