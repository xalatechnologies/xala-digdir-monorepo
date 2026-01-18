# Docker Development Environment

This directory contains Docker configurations for the Digilist Platform development environment.

## 📁 Directory Structure

```
docker/
├── README.md                      # This file
├── docker-compose.dev.yml         # Development environment
├── docker-compose.staging.yml     # Staging environment
├── .env.docker.dev               # Development environment variables
├── DOCKER_DEPLOYMENT_GUIDE.md    # Deployment documentation
├── nginx/                        # Nginx configurations
│   ├── backoffice.conf
│   ├── minside.conf
│   ├── saas-admin.conf
│   ├── tenant-admin.conf
│   └── web.conf
├── postgres/                     # PostgreSQL initialization
│   └── init.sql                  # Database setup script
└── start.sh                      # Startup script
```

## 🚀 Quick Start

### Development Environment

```bash
# From repository root
cd docker

# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f api

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Reset database (WARNING: deletes all data)
docker-compose -f docker-compose.dev.yml down -v
```

### Access Services

- **API:** http://localhost:4000
- **API Health:** http://localhost:4000/health
- **Adminer (DB GUI):** http://localhost:8080
- **Redis Commander:** http://localhost:8081

### Database Management

```bash
# Run migrations (uses @digilist/database-schema)
docker-compose -f docker-compose.dev.yml exec api pnpm --filter @digilist/database-schema db:generate
docker-compose -f docker-compose.dev.yml exec api pnpm --filter @digilist/database-schema db:push

# Seed database (uses @digilist/database-schema seeds)
docker-compose -f docker-compose.dev.yml exec api pnpm --filter @digilist/database-schema seed

# Open Drizzle Studio
docker-compose -f docker-compose.dev.yml exec api pnpm --filter @digilist/database-schema db:studio
```

## 🔧 Development Authentication

The development environment uses **DevTokenService** for automatic authentication bypass.

### How It Works

1. **AUTO_DEV_AUTH=true** enables the DevTokenService
2. Service generates real JWT tokens for a configured dev user
3. Tokens are automatically injected into HTTP-only cookies
4. All API requests are authenticated as the dev user (admin role)

### Security

- ✅ DevTokenService ONLY works when `NODE_ENV !== 'production'`
- ✅ Fails-fast if someone tries to enable in production
- ✅ Tokens go through normal validation (same as production)
- ✅ Only difference: tokens are auto-generated for convenience

### Testing Different Users

Change these environment variables in `.env.docker.dev`:

```bash
DEV_AUTH_USER_ID=<user-uuid>
DEV_AUTH_TENANT_ID=<tenant-uuid>
DEV_AUTH_ROLE=<role>  # admin, user, org_admin, org_member, saksbehandler
```

Then restart the API:

```bash
docker-compose -f docker-compose.dev.yml restart api
```

### Authentication Endpoints

1. **Demo Token Login**
   ```bash
   POST /api/auth/demo-token
   Body: { "email": "user@example.com" }
   ```

2. **OAuth Callback (Simulated)**
   ```bash
   POST /api/auth/callback
   Body: { "code": "demo", "nationalId": "12345678901" }
   ```

3. **Session Check**
   ```bash
   GET /api/auth/session
   ```

## 📦 Database Schema Management

**IMPORTANT:** Do NOT create new migration files or seed data manually.

All database schemas and migrations are managed by the `@digilist/database-schema` package:

- **Location:** `packages/database-schema/`
- **Migrations:** `packages/database-schema/migrations/`
- **Seeds:** `packages/database-schema/seeds/`

### Migration Files

```
migrations/
├── 0000_schemas.sql       # Schema namespaces (platform, domain, compliance, etc.)
├── 0001_platform.sql      # Core tables (tenants, users, sessions)
├── 0002_domain.sql        # Business entities (listings, bookings)
├── 0003_compliance.sql    # Audit logs, GDPR
├── 0004_monitoring.sql    # Incidents, alerts
└── 0005_translations.sql  # i18n translations
```

### Seed Data

```
seeds/
├── tenants.json
├── users.json
├── route-policies.json
├── nav-policies.json
├── plan-entitlements.json
└── import.ts              # Seed import script
```

## 🔍 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose -f docker-compose.dev.yml ps postgres

# View PostgreSQL logs
docker-compose -f docker-compose.dev.yml logs postgres

# Connect to PostgreSQL directly
docker-compose -f docker-compose.dev.yml exec postgres psql -U digilist_dev -d digilist_dev
```

### API Not Starting

```bash
# View API logs
docker-compose -f docker-compose.dev.yml logs api

# Rebuild API container
docker-compose -f docker-compose.dev.yml build api
docker-compose -f docker-compose.dev.yml up -d api
```

### Authentication Issues

```bash
# Check environment variables
docker-compose -f docker-compose.dev.yml exec api env | grep DEV_AUTH

# Verify JWT secret is set
docker-compose -f docker-compose.dev.yml exec api env | grep JWT_SECRET

# Test session endpoint
curl http://localhost:4000/api/auth/session
```

### Database Schema Mismatch

```bash
# Reset database and run migrations
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d postgres
docker-compose -f docker-compose.dev.yml exec api pnpm --filter @digilist/database-schema db:push
docker-compose -f docker-compose.dev.yml exec api pnpm --filter @digilist/database-schema seed
```

## 🏗️ Architecture

### Services

1. **postgres** - PostgreSQL 16 database
2. **redis** - Redis 7 for sessions and queues
3. **api** - Fastify API with hot reload
4. **adminer** - Database GUI (optional)
5. **redis-commander** - Redis GUI (optional)

### Networks

- **digilist-dev-network** - Bridge network for all services

### Volumes

- **postgres_dev_data** - PostgreSQL data persistence
- **redis_dev_data** - Redis data persistence

## 📚 Additional Documentation

- **Deployment Guide:** `DOCKER_DEPLOYMENT_GUIDE.md`
- **Database Schema:** `../packages/database-schema/README.md`
- **API Documentation:** `../apps/api/README.md`
- **Platform Documentation:** `../docs/`

## ⚠️ Important Notes

1. **Never use in production** - This setup is for development only
2. **Secrets are not secure** - JWT secrets are hardcoded for convenience
3. **Auto-authentication** - DevTokenService bypasses normal auth flow
4. **Database resets** - Use `down -v` carefully as it deletes all data
5. **Migrations** - Always use `@digilist/database-schema` package
6. **Seeds** - Use existing seed data from `@digilist/database-schema`

## 🔐 Security Checklist

Before deploying to production:

- [ ] Disable AUTO_DEV_AUTH
- [ ] Generate secure JWT secrets
- [ ] Use environment-specific .env files
- [ ] Enable HTTPS/TLS
- [ ] Configure proper CORS origins
- [ ] Set up proper database backups
- [ ] Enable rate limiting
- [ ] Configure monitoring and alerts
- [ ] Review and update security headers
- [ ] Audit all environment variables
