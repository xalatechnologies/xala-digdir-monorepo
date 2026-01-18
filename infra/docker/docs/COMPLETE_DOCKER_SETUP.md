# Complete Docker Development Environment

**Status:** ✅ **FULLY CONFIGURED**  
**Date:** January 18, 2026

---

## Overview

The Docker development environment now includes **ALL** applications, packages, and services from the Digilist Platform monorepo.

---

## 🎯 Complete Service List

### **Infrastructure Services (3)**

| Service | Container | Port | Status |
|---------|-----------|------|--------|
| PostgreSQL 16 | `digilist-dev-postgres` | 5433 | ✅ Running |
| Redis 7 | `digilist-dev-redis` | 6380 | ✅ Running |
| API (Fastify) | `digilist-dev-api` | 4000 | ⏸️ Ready to start |

### **Frontend Applications (7)**

| App | Container | Port | Purpose |
|-----|-----------|------|---------|
| **Web** | `digilist-dev-web` | 5173 | Public website |
| **MinSide** | `digilist-dev-minside` | 5174 | User portal |
| **Backoffice** | `digilist-dev-backoffice` | 5175 | Admin portal |
| **Tenant Admin** | `digilist-dev-tenant-admin` | 5176 | Tenant management |
| **SaaS Admin** | `digilist-dev-saas-admin` | 5177 | Platform admin |
| **Monitoring** | `digilist-dev-monitoring` | 5178 | Observability dashboard |
| **Docs & Learning** | `digilist-dev-docs-learning` | 5179 | Documentation site |

### **Development Tools (2)**

| Tool | Container | Port | Purpose |
|------|-----------|------|---------|
| **Adminer** | `digilist-dev-adminer` | 8080 | Database GUI |
| **Redis Commander** | `digilist-dev-redis-commander` | 8081 | Redis GUI |

### **Total: 12 Services**

---

## 📦 Shared Packages (Included via Volumes)

All frontend apps have access to these shared packages:

1. **@digilist/client-sdk** - API client with 24 services
2. **@xala/auth** - Authentication (OAuth 2.0, HTTP-only cookies)
3. **@xala/i18n** - Internationalization (4,656 keys, nb/en)
4. **@xala/ds** - Design system (Norwegian Designsystemet)
5. **@xala/ds-themes** - Theme configurations
6. **@xala/contracts** - TypeScript DTOs and schemas
7. **@digilist/database-schema** - Drizzle ORM schemas
8. **@xala/observability** - Monitoring and metrics
9. **@xala/testing** - Test utilities
10. **@xala/platform** - Environment validation
11. **@xala/utils** - Shared utilities
12. **@xala/config** - Configuration management
13. **@xala/websocket** - WebSocket client
14. **@xala/storage** - File storage utilities

---

## 🚀 Quick Start - All Services

### Start Everything

```bash
cd docker

# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs for all services
docker-compose -f docker-compose.dev.yml logs -f

# View logs for specific service
docker-compose -f docker-compose.dev.yml logs -f web
docker-compose -f docker-compose.dev.yml logs -f api
```

### Start Specific Services

```bash
# Start only infrastructure
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Start only API
docker-compose -f docker-compose.dev.yml up -d api

# Start only frontend apps
docker-compose -f docker-compose.dev.yml up -d web minside backoffice

# Start specific app
docker-compose -f docker-compose.dev.yml up -d web
```

---

## 🌐 Access All Services

### Frontend Applications

| Application | URL | Description |
|-------------|-----|-------------|
| Web | http://localhost:5173 | Public website - listing discovery, booking |
| MinSide | http://localhost:5174 | User portal - my bookings, profile |
| Backoffice | http://localhost:5175 | Admin portal - manage listings, users |
| Tenant Admin | http://localhost:5176 | Tenant management |
| SaaS Admin | http://localhost:5177 | Platform administration |
| Monitoring | http://localhost:5178 | Observability dashboard |
| Docs & Learning | http://localhost:5179 | Documentation and guides |

### Backend Services

| Service | URL | Description |
|---------|-----|-------------|
| API | http://localhost:4000 | REST + GraphQL API |
| API Health | http://localhost:4000/health | Health check endpoint |
| API Docs | http://localhost:4000/docs | API documentation |

### Development Tools

| Tool | URL | Credentials |
|------|-----|-------------|
| Adminer | http://localhost:8080 | Server: `postgres`<br>User: `digilist_dev`<br>Password: `dev_password_2026`<br>Database: `digilist_dev` |
| Redis Commander | http://localhost:8081 | Auto-connected |

### Database Connections

| Service | Connection String |
|---------|-------------------|
| PostgreSQL | `postgresql://digilist_dev:dev_password_2026@localhost:5433/digilist_dev` |
| Redis | `redis://localhost:6380` |

---

## 🔧 Development Features

### Hot Reload

All frontend apps and the API support hot reload:
- Edit files in `apps/*/src/`
- Changes automatically reflected in browser
- No need to rebuild containers

### Shared Packages

All apps share packages via volumes:
- Edit `packages/*/src/`
- Changes automatically available to all apps
- No need to rebuild

### Authentication Bypass

DevTokenService provides automatic authentication:
- `AUTO_DEV_AUTH=true` in `.env.docker.dev`
- JWT tokens auto-generated
- All requests authenticated as admin user
- **Security:** Only works in development

---

## 📊 Resource Usage

### Expected Resource Consumption

| Service Type | RAM per Container | Total RAM |
|--------------|-------------------|-----------|
| PostgreSQL | ~50 MB | 50 MB |
| Redis | ~10 MB | 10 MB |
| API (Node.js) | ~200 MB | 200 MB |
| Frontend Apps (7) | ~150 MB each | ~1 GB |
| Tools (2) | ~50 MB each | ~100 MB |
| **Total** | | **~1.4 GB** |

### Startup Times

| Service | Startup Time |
|---------|--------------|
| PostgreSQL | 2-3 seconds |
| Redis | 1-2 seconds |
| API | 10-15 seconds |
| Frontend Apps | 5-10 seconds each |

---

## 🛠️ Common Operations

### Check Status

```bash
# All services
docker-compose -f docker-compose.dev.yml ps

# Specific service
docker-compose -f docker-compose.dev.yml ps web
```

### View Logs

```bash
# All services (follow)
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f api

# Last 100 lines
docker-compose -f docker-compose.dev.yml logs --tail=100 web
```

### Restart Services

```bash
# Restart all
docker-compose -f docker-compose.dev.yml restart

# Restart specific service
docker-compose -f docker-compose.dev.yml restart api
```

### Stop Services

```bash
# Stop all (keeps data)
docker-compose -f docker-compose.dev.yml down

# Stop specific service
docker-compose -f docker-compose.dev.yml stop web

# Stop all and remove volumes (deletes data)
docker-compose -f docker-compose.dev.yml down -v
```

### Rebuild Containers

```bash
# Rebuild all
docker-compose -f docker-compose.dev.yml build

# Rebuild specific service
docker-compose -f docker-compose.dev.yml build web

# Rebuild and start
docker-compose -f docker-compose.dev.yml up -d --build
```

---

## 🗄️ Database Management

### Run Migrations

```bash
# Using @digilist/database-schema package
docker-compose -f docker-compose.dev.yml exec api pnpm --filter @digilist/database-schema db:push
```

### Seed Database

```bash
# Using existing seed data
docker-compose -f docker-compose.dev.yml exec api pnpm --filter @digilist/database-schema seed
```

### Access Database

```bash
# Via psql
docker-compose -f docker-compose.dev.yml exec postgres psql -U digilist_dev -d digilist_dev

# Via Adminer
# Open http://localhost:8080 in browser
```

### Backup Database

```bash
# Create backup
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U digilist_dev digilist_dev > backup.sql

# Restore backup
docker-compose -f docker-compose.dev.yml exec -T postgres psql -U digilist_dev digilist_dev < backup.sql
```

---

## 🧪 Testing

### Run Tests in Containers

```bash
# API tests
docker-compose -f docker-compose.dev.yml exec api pnpm test

# Frontend app tests
docker-compose -f docker-compose.dev.yml exec web pnpm test
docker-compose -f docker-compose.dev.yml exec minside pnpm test
docker-compose -f docker-compose.dev.yml exec backoffice pnpm test
```

### E2E Tests

```bash
# Run E2E tests against running containers
pnpm test:e2e
```

---

## 🔐 Security Notes

⚠️ **DEVELOPMENT ONLY - NOT FOR PRODUCTION**

- JWT secrets are hardcoded
- Auto-authentication bypasses normal flow
- Simple database password
- All feature flags enabled
- Wide-open CORS
- No rate limiting
- Debug logging enabled

**Never deploy this configuration to production!**

---

## 📝 Environment Variables

All apps share environment variables from `.env.docker.dev`:

```bash
# API Configuration
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000/ws/events

# Authentication Bypass
AUTO_DEV_AUTH=true
DEV_AUTH_ROLE=admin

# Feature Flags (all enabled)
FEATURE_VIPPS_LOGIN=true
FEATURE_VIPPS_PAYMENTS=true
FEATURE_IDPORTEN_LOGIN=true
VITE_ENABLE_DEMO_LOGIN=true
```

---

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs service-name

# Rebuild container
docker-compose -f docker-compose.dev.yml build service-name
docker-compose -f docker-compose.dev.yml up -d service-name
```

### Port Already in Use

```bash
# Find what's using the port
lsof -i :5173

# Kill the process or change port in docker-compose.dev.yml
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose -f docker-compose.dev.yml ps postgres

# Check PostgreSQL logs
docker-compose -f docker-compose.dev.yml logs postgres

# Test connection
docker-compose -f docker-compose.dev.yml exec postgres psql -U digilist_dev -d digilist_dev -c "SELECT 1"
```

### Frontend App Not Loading

```bash
# Check if API is running
curl http://localhost:4000/health

# Check app logs
docker-compose -f docker-compose.dev.yml logs web

# Rebuild app
docker-compose -f docker-compose.dev.yml build web
docker-compose -f docker-compose.dev.yml up -d web
```

---

## 📚 Documentation

- **Setup Guide:** `docker/README.md`
- **Test Report:** `docker/DOCKER_TEST_REPORT.md`
- **This File:** `docker/COMPLETE_DOCKER_SETUP.md`
- **API Docs:** `apps/api/README.md`
- **Frontend Docs:** `apps/*/README.md`

---

## ✅ Verification Checklist

After starting all services, verify:

- [ ] PostgreSQL is healthy: `docker-compose -f docker-compose.dev.yml ps postgres`
- [ ] Redis is healthy: `docker-compose -f docker-compose.dev.yml ps redis`
- [ ] API responds: `curl http://localhost:4000/health`
- [ ] Web app loads: Open http://localhost:5173
- [ ] MinSide loads: Open http://localhost:5174
- [ ] Backoffice loads: Open http://localhost:5175
- [ ] Tenant Admin loads: Open http://localhost:5176
- [ ] SaaS Admin loads: Open http://localhost:5177
- [ ] Monitoring loads: Open http://localhost:5178
- [ ] Docs loads: Open http://localhost:5179
- [ ] Adminer works: Open http://localhost:8080
- [ ] Redis Commander works: Open http://localhost:8081

---

## 🎉 Summary

The Docker development environment now includes:

✅ **12 Services** - All apps, infrastructure, and tools  
✅ **14 Shared Packages** - Available to all apps via volumes  
✅ **Hot Reload** - For all apps and API  
✅ **Auto-Authentication** - DevTokenService configured  
✅ **Database Management** - Migrations and seeds from @digilist/database-schema  
✅ **Development Tools** - Adminer and Redis Commander  
✅ **Complete Documentation** - Setup guides and troubleshooting  

**The entire Digilist Platform is now containerized and ready for development!** 🚀

---

**Last Updated:** January 18, 2026  
**Configuration:** Development  
**Status:** ✅ Production-Ready for Development
