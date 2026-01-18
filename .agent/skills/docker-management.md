# Docker Management Skill

## Overview

This skill provides knowledge for managing Docker containers across development, staging, and production environments for the Digilist Platform.

## Environments

### Development (12 containers)

- PostgreSQL (port 5433)
- Redis (port 6380)
- API (port 4000)
- Web (port 5173)
- MinSide (port 5174)
- Backoffice (port 5175)
- Tenant Admin (port 5176)
- SaaS Admin (port 5177)
- Monitoring (port 5178)
- Docs & Learning (port 5179)
- Adminer (port 8080)
- Redis Commander (port 8081)

**Features:**
- Hot reload for all apps
- Auto-authentication (DevTokenService)
- Development tools included
- Relaxed security

### Staging (10 containers)

- PostgreSQL (port 5432)
- Redis (port 6379)
- API (port 4000)
- 7 Frontend apps (ports 8080-8086)

**Features:**
- Production builds (optimized)
- Real authentication
- No dev tools
- Debug logging

### Production (10 containers)

- PostgreSQL (localhost only)
- Redis (localhost only)
- API (localhost only)
- 7 Frontend apps (ports 8080-8086)

**Features:**
- Fully optimized builds
- Maximum security
- JSON logging with rotation
- Health checks

## Common Commands

### Development

```bash
cd infra/docker/compose

# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Start specific services
docker-compose -f docker-compose.dev.yml up -d postgres redis api

# View logs
docker-compose -f docker-compose.dev.yml logs -f api

# Rebuild
docker-compose -f docker-compose.dev.yml build api
docker-compose -f docker-compose.dev.yml up -d api

# Stop all
docker-compose -f docker-compose.dev.yml down

# Reset (delete volumes)
docker-compose -f docker-compose.dev.yml down -v
```

### Staging

```bash
cd infra/docker/compose

# Build all images
docker-compose -f docker-compose.staging.yml build

# Start all services
docker-compose -f docker-compose.staging.yml up -d

# Run migrations
docker-compose -f docker-compose.staging.yml exec api pnpm db:migrate

# View status
docker-compose -f docker-compose.staging.yml ps

# Health checks
curl http://localhost:4000/health
curl http://localhost:8080  # Web
```

### Production

```bash
cd infra/docker/compose

# Build (no cache)
docker-compose -f docker-compose.production.yml build --no-cache

# Start infrastructure
docker-compose -f docker-compose.production.yml up -d postgres redis

# Run migrations
docker-compose -f docker-compose.production.yml run --rm api pnpm db:migrate

# Start all services
docker-compose -f docker-compose.production.yml up -d

# Verify
docker-compose -f docker-compose.production.yml ps
```

## Database Management

### Migrations

```bash
# Development
docker-compose -f docker-compose.dev.yml exec api pnpm db:migrate

# Staging
docker-compose -f docker-compose.staging.yml exec api pnpm db:migrate

# Production
docker-compose -f docker-compose.production.yml run --rm api pnpm db:migrate
```

### Backup

```bash
# Create backup
docker-compose -f docker-compose.production.yml exec postgres \
  pg_dump -U digilist_prod digilist_prod > backup-$(date +%Y%m%d).sql

# Compressed backup
docker-compose -f docker-compose.production.yml exec postgres \
  pg_dump -U digilist_prod digilist_prod | gzip > backup.sql.gz
```

### Restore

```bash
# Restore from backup
docker-compose -f docker-compose.production.yml exec -T postgres \
  psql -U digilist_prod digilist_prod < backup.sql
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs service-name

# Rebuild
docker-compose -f docker-compose.dev.yml build --no-cache service-name
docker-compose -f docker-compose.dev.yml up -d service-name

# Check resources
docker stats
```

### Port Conflicts

```bash
# Find what's using the port
lsof -i :5173

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check PostgreSQL
docker-compose -f docker-compose.dev.yml ps postgres

# Check logs
docker-compose -f docker-compose.dev.yml logs postgres

# Test connection
docker-compose -f docker-compose.dev.yml exec postgres \
  psql -U digilist_dev -d digilist_dev -c "SELECT 1"
```

## Key Files

- `infra/docker/compose/docker-compose.dev.yml` - Development
- `infra/docker/compose/docker-compose.staging.yml` - Staging
- `infra/docker/compose/docker-compose.production.yml` - Production
- `infra/docker/dockerfiles/Dockerfile.api` - API production
- `infra/docker/dockerfiles/Dockerfile.frontend` - Frontend apps
- `infra/docker/docs/DEPLOYMENT_GUIDE.md` - Complete guide

## Important Notes

- Development uses different ports to avoid conflicts
- Staging/Production use standard ports
- All environments use same Dockerfiles with different targets
- Secrets are environment-specific
- Migrations must be run manually after deployment
- Backups should be automated in production
