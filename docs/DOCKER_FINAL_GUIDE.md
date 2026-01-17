# 🚀 **COMPLETE DOCKER ENVIRONMENT - FINAL**

**Date:** 2026-01-17 @ 08:55 AM  
**Status:** ✅ **READY TO START**

---

## 🌐 **YOUR APPLICATIONS** (Unique Ports)

```
Web App:        http://localhost:8080  (Public website)
Backoffice:     http://localhost:8081  (Admin panel)
Min Side:       http://localhost:8082  (User portal)
SaaS Admin:     http://localhost:8083  (Super admin)
Tenant Admin:   http://localhost:8084  (Tenant management)
API:            http://localhost:8085  (Backend)
```

**Database:**
```
PostgreSQL:     localhost:5432
Redis:          localhost:6379
```

---

## ⚡ **START EVERYTHING NOW**

### Option 1: Start Infrastructure Only (Simplest)
```bash
# Start PostgreSQL + Redis + All Frontends
docker-compose up -d postgres redis web backoffice minside saas-admin tenant-admin

# Wait for database
sleep 10

# Run migrations
source .env.production
export DATABASE_URL="postgresql://digilist:digilist_secure_2026@localhost:5432/digilist_prod"
psql $DATABASE_URL -c "SELECT version();"

# Run fresh database setup
./scripts/setup-fresh-db.sh

# Start API locally (easier to debug)
cd apps/api
pnpm dev
```

**Access your apps:**
- Web: http://localhost:8080 ✅
- Backoffice: http://localhost:8081 ✅
- Min Side: http://localhost:8082 ✅
- SaaS Admin: http://localhost:8083 ✅
- Tenant Admin: http://localhost:8084 ✅

---

## 🎮 **USEFUL COMMANDS**

### View Logs:
```bash
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f web
```

### Stop Everything:
```bash
docker-compose down
```

### Rebuild After Code Changes:
```bash
pnpm build
docker-compose restart web backoffice minside saas-admin tenant-admin
```

### Database Access:
```bash
docker-compose exec postgres psql -U digilist -d digilist_prod
```

---

## 🎯 **START NOW**

Run this:
```bash
docker-compose up -d postgres redis web backoffice minside saas-admin tenant-admin
```

Then in another terminal:
```bash
# Wait for database
sleep 10

# Set up database
source .env.production
export DATABASE_URL="postgresql://digilist:digilist_secure_2026@localhost:5432/digilist_prod"
./scripts/setup-fresh-db.sh

# Start API
cd apps/api
pnpm dev
```

**Then visit:** http://localhost:8080 🚀

---

**All 5 apps + database + redis running!** 🎉
