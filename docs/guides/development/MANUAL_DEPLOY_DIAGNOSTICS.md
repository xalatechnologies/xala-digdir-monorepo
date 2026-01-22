# Manual Deployment - Diagnostic Endpoints

## 🎯 Goal
Deploy diagnostic endpoints to production to check database configuration

## 📦 Files to Upload

### 1. Main Application File
**Local**: `apps/api/dist/main.js` (579 KB)
**Remote**: `/var/www/digilist-api/dist/main.js`

### 2. Health Controller Source (optional, for tsx execution)
**Local**: `apps/api/src/modules/health/health.controller.ts`
**Remote**: `/var/www/digilist-api/src/modules/health/health.controller.ts`

---

## 🚀 Deployment Steps (via Hostinger File Manager)

### Step 1: Login to Hostinger
1. Go to: https://hpanel.hostinger.com
2. Click on your VPS/hosting
3. Click "File Manager"

### Step 2: Navigate to API Directory
```
/var/www/digilist-api/dist/
```

### Step 3: Backup Current File
1. Right-click `main.js`
2. Select "Rename"
3. Rename to `main.js.backup-2026-01-17`

### Step 4: Upload New File
1. Click "Upload" button
2. Select: `/Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/apps/api/dist/main.js`
3. Wait for upload to complete (579 KB)

### Step 5: Restart PM2
In Hostinger terminal or SSH:
```bash
pm2 restart digilist-api
```

**OR** via Hostinger Control Panel:
1. Go to "Applications"
2. Find "digilist-api"
3. Click "Restart"

---

## 🧪 Test Diagnostic Endpoints

### 1. Check Environment Configuration
```bash
curl "https://api.digilist.no/health/env" | jq .
```

**What to look for**:
```json
{
  "environment": {
    "hasDatabaseUrl": true,  // Should be true
    "databaseInfo": {
      "host": "localhost",    // Check if correct
      "database": "digilist_prod",  // Check if correct
      "user": "postgres"      // Check if correct
    }
  }
}
```

### 2. Check Database Connection
```bash
curl "https://api.digilist.no/health/db" | jq .
```

**What to look for**:
```json
{
  "database": {
    "connected": true,       // Should be true
    "databaseName": "digilist_prod",  // Actual DB name
    "currentSchema": "public",        // Default schema
    "availableSchemas": ["platform", "domain", "compliance", "public"],
    "rentalObjectsTable": {
      "schemaname": "platform",  // Which schema has the table
      "tablename": "rental_objects"
    },
    "rentalObjectsCounts": {
      "total": 0,          // Total rental objects
      "published": 0,      // Published rental objects
      "error": null
    }
  }
}
```

---

## 🔍 Diagnosis Scenarios

### Scenario 1: Database Not Connected
```json
{
  "database": {
    "connected": false,
    "error": "connection refused"
  }
}
```

**Means**: DATABASE_URL is wrong or database is down
**Fix**: Check `.env` file in `/var/www/digilist-api/.env`

### Scenario 2: Wrong Database
```json
{
  "databaseName": "postgres"  // Default database, not digilist_prod
}
```

**Means**: DATABASE_URL points to wrong database
**Fix**: Update DATABASE_URL in .env:
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/digilist_prod
```

### Scenario 3: Table Not Found
```json
{
  "rentalObjectsTable": null
}
```

**Means**: rental_objects table doesn't exist
**Fix**: Run migrations or check schema

### Scenario 4: Table in Wrong Schema
```json
{
  "rentalObjectsTable": {
    "schemaname": "public",  // Should be "platform"
    "tablename": "rental_objects"
  }
}
```

**Means**: Table exists but in wrong schema
**Fix**: Code expects `platform.rental_objects`, but it's in `public.rental_objects`

### Scenario 5: Table Empty
```json
{
  "rentalObjectsCounts": {
    "total": 0,
    "published": 0
  }
}
```

**Means**: Table exists but no data
**Fix**: Run seed script (manual-seed.sql)

---

## 🔧 Quick Fixes Based on Diagnosis

### If DATABASE_URL is wrong:

1. **Via Hostinger File Manager**:
   - Navigate to `/var/www/digilist-api/`
   - Edit `.env` file
   - Update `DATABASE_URL=postgresql://...`
   - Save

2. **Restart API**:
   ```bash
   pm2 restart digilist-api
   ```

3. **Test again**:
   ```bash
   curl "https://api.digilist.no/health/db"
   ```

### If table is in `public` schema instead of `platform`:

**Option A**: Move table to platform schema
```sql
ALTER TABLE public.rental_objects SET SCHEMA platform;
```

**Option B**: Update code to use public schema (not recommended)

### If table is empty:

Run manual seed (from earlier):
```sql
INSERT INTO platform.rental_objects (...) VALUES (...);
```

---

## 📋 Expected Production Configuration

**Correct `.env` should have**:
```bash
DATABASE_URL=postgresql://digilist_user:password@localhost:5432/digilist_prod
NODE_ENV=production
PORT=4000
```

**Correct database structure**:
- Database: `digilist_prod`
- Schemas: `platform`, `domain`, `compliance`
- Table: `platform.rental_objects`
- Schema structure matches code in `src/database/schema/`

---

## ✅ Success Checklist

After deployment:
- [ ] `/health/env` returns correct database host
- [ ] `/health/db` shows `connected: true`
- [ ] `databaseName` matches expected production DB
- [ ] `availableSchemas` includes `platform`
- [ ] `rentalObjectsTable.schemaname` is `platform`
- [ ] `/api/public/rental-objects` returns 200 (not 500)

---

**Next**: After you upload and restart, run the diagnostic endpoints and share the output so we can identify the exact issue!
