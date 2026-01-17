# 🎭 **ENVIRONMENT FILES**

## 📝 **Environment Structure**

```
.env.production    →  Production (VPS deployment)
.env.staging      →  Staging (Local Docker)
.env.local        →  Personal dev overrides (gitignored)
```

---

## 🏭 **PRODUCTION (.env.production)**

**For:** VPS deployment via `./scripts/deploy.sh`

```bash
DATABASE_URL=postgresql://user:pass@production-db:5432/digilist
API_URL=https://api.digilist.no
# ... production settings
```

**Keep this file for production deployments!**

---

## 🎭 **STAGING (.env.staging)**

**For:** Local Docker development

```bash
DATABASE_URL=postgresql://digilist:digilist_secure_2026@localhost:5432/digilist_prod
REDIS_URL=redis://localhost:6379
JWT_SECRET=staging-secret-key-minimum-32-characters-long-for-development
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:8081,http://localhost:8082,http://localhost:8083,http://localhost:8084
ENABLE_DEMO_MODE=true
ENABLE_DEBUG=true
```

**Use this for local staging environment!**

---

## 🚀 **USAGE**

### Start Staging
```bash
# Load staging env
source .env.staging

# Start API
cd apps/api
pnpm dev
```

### Deploy Production
```bash
# Uses .env.production automatically
./scripts/deploy.sh all
```

---

## 🔐 **SECURITY**

- ✅ `.env.production` - Committed (no secrets)
- ✅ `.env.staging` - Committed (local only)
- ❌ `.env.local` - Gitignored (personal secrets)

---

**Now you have proper environment separation!** 🎉
