# 🗄️ **DATABASE SETUP - NEXT STEPS**

**Date:** 2026-01-17 @ 08:47 AM  
**Status:** ⚠️ **PostgreSQL Not Running**

---

## 📋 **DATABASE CONFIGURATION**

From `.env.production`:
```
DATABASE_URL=postgresql://digilist:digilist_secure_2026@localhost:5432/digilist_prod
```

**Parsed:**
- Host: `localhost`
- Port: `5432`
- Database: `digilist_prod`
- User: `digilist`
- Password: `digilist_secure_2026`

---

## ⚠️ **CURRENT ISSUE**

```
❌ Connection refused on localhost:5432
❌ PostgreSQL is not running
```

---

## 🔧 **SOLUTIONS**

### Option 1: Start PostgreSQL (if installed)

#### Using Homebrew Services:
```bash
brew services start postgresql@16
# or
brew services start postgresql
```

#### Using pg_ctl:
```bash
pg_ctl -D /usr/local/var/postgresql@16 start
# or
pg_ctl -D /usr/local/var/postgres start
```

#### Check if it's running:
```bash
brew services list | grep postgres
# or
ps aux | grep postgres
```

---

### Option 2: Start PostgreSQL with Docker

```bash
# Start PostgreSQL in Docker
docker run -d \
  --name digilist-postgres \
  -e POSTGRES_USER=digilist \
  -e POSTGRES_PASSWORD=digilist_secure_2026 \
  -e POSTGRES_DB=digilist_prod \
  -p 5432:5432 \
  postgres:16

# Verify it's running
docker ps | grep digilist-postgres
```

---

### Option 3: Use Remote Database

If you have a remote PostgreSQL server (like on your VPS), update `.env.production`:

```bash
# Change localhost to your server IP/hostname
DATABASE_URL=postgresql://digilist:digilist_secure_2026@YOUR_SERVER_IP:5432/digilist_prod
```

---

## ✅ **ONCE POSTGRESQL IS RUNNING**

Run the fresh database setup:

```bash
# 1. Load environment
source .env.production

# 2. Test connection
psql $DATABASE_URL -c "SELECT version();"

# 3. Run fresh database setup
./scripts/setup-fresh-db.sh
```

This will:
1. ✅ Drop and recreate schemas
2. ✅ Run all 31 migrations
3. ✅ Seed platform data (tenants, users, roles)
4. ✅ Optionally seed domain data (rental objects, etc.)

---

## 🚀 **AFTER DATABASE IS READY**

```bash
# 1. Start API
cd apps/api
pnpm dev

# 2. Verify it works
curl http://localhost:3001/health

# 3. Deploy all apps
cd ../..
./scripts/deploy.sh all
```

---

## 📝 **QUICK START COMMANDS**

```bash
# Option 1: Homebrew PostgreSQL
brew services start postgresql@16
source .env.production
./scripts/setup-fresh-db.sh

# Option 2: Docker PostgreSQL  
docker run -d --name digilist-postgres \
  -e POSTGRES_USER=digilist \
  -e POSTGRES_PASSWORD=digilist_secure_2026 \
  -e POSTGRES_DB=digilist_prod \
  -p 5432:5432 postgres:16
source .env.production
./scripts/setup-fresh-db.sh
```

---

**Status:** ⏳ Waiting for PostgreSQL to start

**Which option would you like to use?**
1. Start local PostgreSQL (Homebrew)
2. Start PostgreSQL in Docker
3. Use remote database

Let me know and I'll help you proceed! 🚀
