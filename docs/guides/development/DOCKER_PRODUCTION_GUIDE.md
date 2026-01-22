# 🐳 **COMPLETE DOCKER PRODUCTION ENVIRONMENT**

**Created:** 2026-01-17 @ 08:50 AM  
**Status:** ✅ **READY TO START**

---

## 🚀 **QUICK START**

### One Command to Rule Them All:
```bash
./docker/start.sh
```

This will:
1. ✅ Build all applications
2. ✅ Start PostgreSQL + Redis
3. ✅ Start API server
4. ✅ Start all 4 frontend apps
5. ✅ Run database migrations
6. ✅ Show you all URLs

---

## 🌐 **YOUR LOCAL PRODUCTION**

Once started, access:

```
Web App:        http://localhost:3000
Backoffice:     http://localhost:3002
Min Side:       http://localhost:3003
SaaS Admin:     http://localhost:3004
API:            http://localhost:3001
```

**Database:**
```
Host:     localhost:5432
Database: digilist_prod
User:     digilist
Password: digilist_secure_2026
```

---

## 📦 **WHAT'S INCLUDED**

### Services Running:
- ✅ **PostgreSQL 16** - Production database
- ✅ **Redis 7** - Sessions & queues
- ✅ **API Server** - Fastify backend
- ✅ **Web** - Public website (Nginx)
- ✅ **Backoffice** - Admin panel (Nginx)
- ✅ **Min Side** - User portal (Nginx)
- ✅ **SaaS Admin** - Super admin (Nginx)

### Features:
- ✅ Health checks on all services
- ✅ Auto-restart on failure
- ✅ Persistent data volumes
- ✅ Optimized Nginx configs
- ✅ Production builds
- ✅ Proper networking

---

## 🎮 **USEFUL COMMANDS**

### Start Everything:
```bash
./docker/start.sh
```

### View Logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
```

### Stop Everything:
```bash
docker-compose down
```

### Restart a Service:
```bash
docker-compose restart api
docker-compose restart web
```

### Rebuild After Code Changes:
```bash
pnpm build
docker-compose restart web backoffice minside saas-admin
```

### Database Access:
```bash
docker-compose exec postgres psql -U digilist -d digilist_prod
```

### Run Migrations:
```bash
source .env.production
./scripts/setup-fresh-db.sh
```

---

## 🗂️ **FILE STRUCTURE**

```
.
├── docker-compose.yml          # Main orchestration
├── docker/
│   ├── start.sh               # Startup script
│   └── nginx/
│       ├── web.conf           # Web app config
│       ├── backoffice.conf    # Backoffice config
│       ├── minside.conf       # Min Side config
│       └── saas-admin.conf    # SaaS Admin config
└── apps/
    └── api/
        └── Dockerfile         # API container image
```

---

## 🔧 **TROUBLESHOOTING**

### Port Already In Use:
```bash
# Check what's using port 5432
lsof -i :5432

# Stop local PostgreSQL if running
brew services stop postgresql@14

# Or change ports in docker-compose.yml
```

### Container Won't Start:
```bash
# Check logs
docker-compose logs [service-name]

# Remove and recreate
docker-compose down -v
docker-compose up -d
```

### Database Not Ready:
```bash
# Wait a bit longer, then:
docker-compose exec postgres pg_isready -U digilist

# Run migrations manually
source .env.production
./scripts/setup-fresh-db.sh
```

---

## 🎉 **READY TO GO!**

Run this now:
```bash
./docker/start.sh
```

Then visit: **http://localhost:3000** 🚀

---

**Complete local production environment in Docker!** 🐳✨
