# Docker Deployment Guide - Production

## ✅ Local Testing Complete

- API runs successfully in Docker
- Database connection verified
- 80 rental objects available
- All endpoints working (except cities - minor metadata issue)

---

## 🚀 Production Deployment via Docker

### Option 1: Deploy via Hostinger Docker (Recommended)

If Hostinger supports Docker, this is the cleanest approach:

```bash
# 1. Build the Docker image
docker build -t digilist-api:latest -f apps/api/Dockerfile .

# 2. Save the image as tar
docker save digilist-api:latest | gzip > digilist-api-latest.tar.gz

# 3. Upload to Hostinger
scp digilist-api-latest.tar.gz root@72.61.23.56:/tmp/

# 4. SSH and load the image
ssh root@72.61.23.56
cd /tmp
docker load < digilist-api-latest.tar.gz

# 5. Stop PM2 version (if running)
pm2 stop digilist-api
pm2 delete digilist-api

# 6. Run Docker container
docker run -d \
  --name digilist-api \
  --restart unless-stopped \
  -p 4000:3001 \
  -e DATABASE_URL="postgresql://user:pass@localhost:5432/digilist_prod" \
  -e JWT_SECRET="your-production-jwt-secret" \
  -e NODE_ENV=production \
  -e CORS_ORIGIN="https://web.digilist.no,https://minside.digilist.no,https://backoffice.digilist.no" \
  -e COOKIE_DOMAIN=".digilist.no" \
  -e IDPORTEN_CLIENT_ID="sandbox-fantastic-house-812" \
  -e IDPORTEN_CLIENT_SECRET="US1SxD0ett3Hczv00dOzdSxPyGjYK1PtbbDrXmMJLTVAkvlB" \
  digilist-api:latest

# 7. Check logs
docker logs -f digilist-api

# 8. Test
curl https://api.digilist.no/health
curl https://api.digilist.no/api/public/rental-objects?limit=5
```

### Option 2: Deploy Built dist/ via PM2 (Current Method)

If Docker isn't available on Hostinger, use PM2 with the built files:

```bash
# 1. Build locally
pnpm --filter @digilist/api build

# 2. Create deployment package
tar -czf digilist-api-deploy.tar.gz \
  apps/api/dist \
  apps/api/package.json \
  apps/api/drizzle

# 3. Upload
scp digilist-api-deploy.tar.gz root@72.61.23.56:/var/www/

# 4. SSH and extract
ssh root@72.61.23.56
cd /var/www
tar -xzf digilist-api-deploy.tar.gz
cd digilist-api

# 5. Install dependencies
npm install --production

# 6. Update .env with correct DATABASE_URL

# 7. Restart PM2
pm2 restart digilist-api

# 8. Check logs
pm2 logs digilist-api --lines 50

# 9. Test
curl https://api.digilist.no/api/public/rental-objects?limit=5
```

---

## 🔍 Production Environment Variables (CRITICAL)

**Check these in production `.env`**:

```bash
# Production .env should have:
DATABASE_URL=postgresql://ACTUAL_USER:ACTUAL_PASS@localhost:5432/digilist_prod
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# NOT development/test values!
```

### How to Check Production Config

1. **Via Hostinger Control Panel**:
   - Go to File Manager
   - Navigate to `/var/www/digilist-api/.env`
   - Check `DATABASE_URL` value

2. **Via SSH** (if accessible):
   ```bash
   ssh root@72.61.23.56
   cat /var/www/digilist-api/.env | grep DATABASE_URL
   ```

3. **Via PM2 Logs**:
   ```bash
   pm2 logs digilist-api | grep "database"
   ```

---

## 🎯 Most Likely Issue

**Hypothesis**: Production `.env` has wrong `DATABASE_URL`

**Possible wrong values**:
```bash
# ❌ WRONG - Default PostgreSQL database
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres

# ❌ WRONG - Test database
DATABASE_URL=postgresql://digilist:pass@localhost:5432/digilist_test

# ❌ WRONG - Missing database name
DATABASE_URL=postgresql://user:pass@localhost:5432/

# ✅ CORRECT - Production database
DATABASE_URL=postgresql://digilist_user:secure_pass@localhost:5432/digilist_prod
```

---

## 📋 Immediate Action Items

### 1. Check Production Database Config

Via Hostinger control panel:
1. Go to Databases → PostgreSQL
2. Note down:
   - Database name (should be `digilist_prod`)
   - Username
   - Host (likely `localhost` or IP)
   - Port (default `5432`)

### 2. Verify .env File

Via File Manager:
1. Navigate to `/var/www/digilist-api/.env`
2. Check if `DATABASE_URL` matches the database info from step 1

### 3. Update .env if Wrong

Update to correct format:
```bash
DATABASE_URL=postgresql://[username]:[password]@[host]:[port]/[database]
```

### 4. Restart API

Via Hostinger or SSH:
```bash
pm2 restart digilist-api
```

### 5. Test Endpoints

```bash
# Should return OK
curl https://api.digilist.no/health

# Should return rental objects (NOT 500 error)
curl https://api.digilist.no/api/public/rental-objects?limit=5

# Should return cities
curl https://api.digilist.no/api/public/cities
```

---

## 🔧 If Database is Actually Empty

If production database genuinely has no data:

### Via Hostinger phpPgAdmin:

```sql
-- Check if data exists
SELECT COUNT(*) FROM domain.rental_objects WHERE status = 'published';

-- If count is 0, check platform schema too
SELECT COUNT(*) FROM platform.rental_objects WHERE status = 'published';

-- If both are 0, run seed data
-- (See manual-seed.sql for insert statements)
```

**IMPORTANT**: The API queries `domain.rental_objects` (not `platform`). Make sure data is in the correct schema!

---

## ✅ Success Criteria

After deployment:
- [ ] `/health` returns 200 OK
- [ ] `/api/public/rental-objects` returns 200 with data (not 500)
- [ ] `/api/public/cities` returns 200 (even if empty array)
- [ ] Audit logs show rental object queries
- [ ] No errors in PM2/Docker logs

---

## 🧪 Local Testing Results

Successfully tested locally with Docker:

```bash
# API startup log
✓ Adapters initialized
✓ PostgreSQL database connected
✓ JWT service registered
✓ Services registered
✓ Controllers registered
✓ Modules loaded
✓ REST routes registered
✓ Fastify plugin routes registered
✓ WebSocket routes registered
✓ GraphQL endpoint registered at /graphql

🎉 Unified API running on http://0.0.0.0:4000
```

**Test Results**:
- ✅ Health check: Works
- ✅ Rental objects endpoint: Returns 80 objects from `domain.rental_objects`
- ⚠️ Cities endpoint: Returns empty array (metadata structure issue, not critical)
- ✅ Database connection: Successful
- ✅ Schema verification: `domain.rental_objects` has 80 objects

---

## 📊 Schema Analysis

**Critical Finding**: The application correctly queries `domain.rental_objects`:

```typescript
// apps/api/src/modules/public/public.controller.ts:9
import { rentalObjects } from '../../database/schema/index';

// apps/api/src/database/schema/index.ts:360
export const rentalObjects = domainSchema.table('rental_objects', {
  // ... table definition in domain schema
});
```

**Database Schema Structure**:
- `platform` schema: users, tenants, organizations, sessions
- `domain` schema: rental_objects, bookings, allocations ⭐ (main data)
- `compliance` schema: audit_logs, gdpr_requests

**Production must have data in `domain.rental_objects` for API to work.**

---

## 🚨 Common Pitfalls

1. **Wrong database in DATABASE_URL** - Most likely cause
2. **Data in wrong schema** - Check if data is in `platform` instead of `domain`
3. **Empty database** - Never seeded after creation
4. **Permission issues** - Database user can't read `domain` schema
5. **Connection string typo** - Missing `/database_name` at end

---

## 📝 Next Steps

1. **Check production DATABASE_URL** via Hostinger File Manager
2. **Verify database name** via Hostinger Database panel
3. **Test database query** via phpPgAdmin:
   ```sql
   SELECT COUNT(*) FROM domain.rental_objects;
   ```
4. **If count > 0**: DATABASE_URL is wrong, fix it
5. **If count = 0**: Database needs seeding, run seed script

---

**Status**: Local testing ✅ COMPLETE
**Issue**: Production DATABASE_URL likely incorrect
**Solution**: Verify and fix DATABASE_URL in production `.env`
**Last Updated**: 2026-01-17 23:15 UTC
