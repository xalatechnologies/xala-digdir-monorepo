# 🚀 **QUICK START - COMPLETE ENVIRONMENT**

**Everything is ready! Here's how to start:**

---

## ⚡ **3 SIMPLE STEPS**

### Step 1: Start Docker Services
```bash
cd /Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo

docker-compose up -d postgres redis web backoffice minside saas-admin tenant-admin
```

**Wait 10 seconds for PostgreSQL to be ready**

---

### Step 2: Set Up Database (One Time Only)
```bash
source .env.production
export DATABASE_URL="postgresql://digilist:digilist_secure_2026@localhost:5432/digilist_prod"

# Test connection
psql $DATABASE_URL -c "SELECT version();"

# Run fresh setup (creates tables + seeds data)
./scripts/setup-fresh-db.sh
```

---

### Step 3: Start API
```bash
cd apps/api
pnpm dev
```

---

## 🌐 **ACCESS YOUR APPS**

Open these in your browser:

```
✅ Web App (Public):      http://localhost:8080
✅ Backoffice (Admin):    http://localhost:8081
✅ Min Side (User):       http://localhost:8082
✅ SaaS Admin (Super):    http://localhost:8083
✅ Tenant Admin:          http://localhost:8084
```

**API:** http://localhost:3001

---

## 🎯 **WHAT'S RUNNING**

```
✅ PostgreSQL 16    (localhost:5432)
✅ Redis 7          (localhost:6379)
✅ 5 Frontend Apps  (Nginx containers)
✅ API Server       (Running locally for easy debugging)
```

---

## 📝 **QUICK COMMANDS**

### View Logs:
```bash
docker-compose logs -f postgres
docker-compose logs -f web
```

### Stop Everything:
```bash
docker-compose down
```

### Restart After Code Changes:
```bash
pnpm build
docker-compose restart web backoffice minside saas-admin tenant-admin
```

### Database Access:
```bash
docker-compose exec postgres psql -U digilist -d digilist_prod
```

---

## 🆘 **TROUBLESHOOTING**

### "Connection refused" on PostgreSQL:
```bash
# Wait longer, then try again
sleep 15
psql $DATABASE_URL -c "SELECT 1;"
```

### "Port already in use":
```bash
# Check what's using the port
lsof -i :5432

# Stop local PostgreSQL if running
brew services stop postgresql@14
```

### Frontend showing blank page:
```bash
# Rebuild and restart
pnpm build
docker-compose restart web
```

---

## 🎉 **YOU'RE READY!**

**Run Step 1now** and start building! 🚀

