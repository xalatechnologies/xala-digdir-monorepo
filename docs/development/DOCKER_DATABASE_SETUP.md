# 🐳 **QUICK DATABASE SETUP WITH DOCKER**

**Status:** PostgreSQL connection issues - Docker is easiest solution

---

## 🚀 **FASTEST SOLUTION: Use Docker**

### Step 1: Start PostgreSQL in Docker
```bash
docker run -d \
  --name digilist-postgres \
  -e POSTGRES_USER=digilist \
  -e POSTGRES_PASSWORD=digilist_secure_2026 \
  -e POSTGRES_DB=digilist_prod \
  -p 5432:5432 \
  postgres:16
```

### Step 2: Verify it's running
```bash
docker ps | grep digilist-postgres
```

### Step 3: Test connection
```bash
source .env.production
psql $DATABASE_URL -c "SELECT version();"
```

### Step 4: Run fresh database setup
```bash
./scripts/setup-fresh-db.sh
```

---

## ⏭️ **OR: Skip Database, Deploy Frontend Only**

If you just want to see the frontend working:

```bash
# Deploy just the frontend apps (they'll show loading states)
./scripts/deploy.sh web
./scripts/deploy.sh backoffice  
./scripts/deploy.sh minside
```

The apps will work but show "No data" until database is set up.

---

## 🎯 **RECOMMENDED: Docker Approach**

It's the fastest and cleanest. Just run:

```bash
# One command to start everything
docker run -d \
  --name digilist-postgres \
  -e POSTGRES_USER=digilist \
  -e POSTGRES_PASSWORD=digilist_secure_2026 \
  -e POSTGRES_DB=digilist_prod \
  -p 5432:5432 \
  postgres:16 \
&& sleep 3 \
&& source .env.production \
&& ./scripts/setup-fresh-db.sh
```

**Want me to run this for you?** 🚀
