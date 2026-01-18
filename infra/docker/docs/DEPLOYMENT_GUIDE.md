# Digilist Platform - Complete Deployment Guide

**Version:** 2.0  
**Last Updated:** January 18, 2026  
**Environments:** Development, Staging, Production

---

## Table of Contents

1. [Overview](#overview)
2. [Environment Comparison](#environment-comparison)
3. [Development Deployment](#development-deployment)
4. [Staging Deployment](#staging-deployment)
5. [Production Deployment](#production-deployment)
6. [Database Management](#database-management)
7. [Monitoring & Logging](#monitoring--logging)
8. [Backup & Recovery](#backup--recovery)
9. [Security Checklist](#security-checklist)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Digilist Platform uses Docker Compose for all environments with three separate configurations:

- **Development** (`docker-compose.dev.yml`) - Local development with hot reload
- **Staging** (`docker-compose.staging.yml`) - Pre-production testing
- **Production** (`docker-compose.production.yml`) - Production deployment

### Complete Service List (All Environments)

| Service | Development | Staging | Production |
|---------|-------------|---------|------------|
| PostgreSQL 16 | ✅ Port 5433 | ✅ Port 5432 | ✅ Localhost only |
| Redis 7 | ✅ Port 6380 | ✅ Port 6379 | ✅ Localhost only |
| API (Fastify) | ✅ Hot reload | ✅ Built | ✅ Built + optimized |
| Web App | ✅ Hot reload | ✅ Nginx | ✅ Nginx + logging |
| MinSide | ✅ Hot reload | ✅ Nginx | ✅ Nginx + logging |
| Backoffice | ✅ Hot reload | ✅ Nginx | ✅ Nginx + logging |
| Tenant Admin | ✅ Hot reload | ✅ Nginx | ✅ Nginx + logging |
| SaaS Admin | ✅ Hot reload | ✅ Nginx | ✅ Nginx + logging |
| Monitoring | ✅ Hot reload | ✅ Nginx | ✅ Nginx + logging |
| Docs & Learning | ✅ Hot reload | ✅ Nginx | ✅ Nginx + logging |
| Adminer | ✅ Included | ❌ Not included | ❌ Not included |
| Redis Commander | ✅ Included | ❌ Not included | ❌ Not included |

---

## Environment Comparison

### Development

**Purpose:** Local development with hot reload and debugging tools

**Features:**
- Hot reload for all apps
- Auto-authentication (DevTokenService)
- Development tools (Adminer, Redis Commander)
- Relaxed security
- Debug logging
- All feature flags enabled

**Ports:**
- PostgreSQL: 5433 (to avoid conflicts)
- Redis: 6380 (to avoid conflicts)
- API: 4000
- Apps: 5173-5179
- Adminer: 8080
- Redis Commander: 8081

### Staging

**Purpose:** Pre-production testing environment

**Features:**
- Production builds (optimized)
- Real authentication (no bypass)
- No development tools
- Production-like security
- Debug logging enabled
- Feature flags configurable

**Ports:**
- PostgreSQL: 5432
- Redis: 6379
- API: 4000
- Apps: 8080-8086

### Production

**Purpose:** Live production environment

**Features:**
- Fully optimized builds
- Maximum security
- Database/Redis localhost only
- JSON logging for aggregation
- Sentry error tracking
- Automated backups
- Health checks
- Rate limiting

**Ports:**
- PostgreSQL: 127.0.0.1:5432 (localhost only)
- Redis: 127.0.0.1:6379 (localhost only)
- API: 127.0.0.1:4000 (use reverse proxy)
- Apps: 8080-8086 (use reverse proxy)

---

## Development Deployment

### Prerequisites

```bash
# Install Docker and Docker Compose
docker --version
docker-compose --version

# Navigate to docker directory
cd /path/to/xala-digdir-monorepo/docker
```

### Quick Start

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Check status
docker-compose -f docker-compose.dev.yml ps
```

### First-Time Setup

```bash
# 1. Start infrastructure
docker-compose -f docker-compose.dev.yml up -d postgres redis

# 2. Wait for health checks
docker-compose -f docker-compose.dev.yml ps

# 3. Start API
docker-compose -f docker-compose.dev.yml up -d api

# 4. Run migrations
docker-compose -f docker-compose.dev.yml exec api pnpm --filter @digilist/database-schema db:push

# 5. Seed database
docker-compose -f docker-compose.dev.yml exec api pnpm --filter @digilist/database-schema seed

# 6. Start frontend apps
docker-compose -f docker-compose.dev.yml up -d web minside backoffice tenant-admin saas-admin monitoring docs-learning
```

### Access Services

- Web: http://localhost:5173
- MinSide: http://localhost:5174
- Backoffice: http://localhost:5175
- API: http://localhost:4000
- Adminer: http://localhost:8080

---

## Staging Deployment

### Prerequisites

```bash
# 1. Create .env.staging from template
cp .env.staging.example .env.staging

# 2. Edit .env.staging and set all required values
nano .env.staging

# 3. Generate secure secrets
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 32  # JWT_REFRESH_SECRET
openssl rand -base64 32  # CSRF_SECRET
openssl rand -base64 32  # SESSION_SECRET
```

### Deployment Steps

```bash
# 1. Build all images
docker-compose -f docker-compose.staging.yml build --no-cache

# 2. Start infrastructure
docker-compose -f docker-compose.staging.yml up -d postgres redis

# 3. Wait for health checks
docker-compose -f docker-compose.staging.yml ps

# 4. Run migrations
docker-compose -f docker-compose.staging.yml run --rm api pnpm --filter @digilist/database-schema db:push

# 5. Seed database (optional)
docker-compose -f docker-compose.staging.yml run --rm api pnpm --filter @digilist/database-schema seed

# 6. Start all services
docker-compose -f docker-compose.staging.yml up -d

# 7. Verify all services are healthy
docker-compose -f docker-compose.staging.yml ps

# 8. Check logs
docker-compose -f docker-compose.staging.yml logs -f
```

### Health Checks

```bash
# Check API health
curl http://localhost:4000/health

# Check each frontend app
curl http://localhost:8080  # Web
curl http://localhost:8081  # MinSide
curl http://localhost:8082  # Backoffice
curl http://localhost:8083  # Tenant Admin
curl http://localhost:8084  # SaaS Admin
curl http://localhost:8085  # Monitoring
curl http://localhost:8086  # Docs
```

---

## Production Deployment

### Prerequisites

⚠️ **CRITICAL: Complete security checklist before production deployment**

```bash
# 1. Create .env.production from template
cp .env.production.example .env.production

# 2. Edit .env.production with STRONG secrets
nano .env.production

# 3. Generate STRONG secrets (minimum 32 characters)
openssl rand -base64 48  # Use 48 for extra security

# 4. Set up SSL certificates (Let's Encrypt recommended)
# 5. Configure reverse proxy (Nginx/Traefik)
# 6. Set up firewall rules
# 7. Configure backup strategy
# 8. Set up monitoring and alerting
```

### Security Configuration

```bash
# Required environment variables (all must be set):
# - POSTGRES_PASSWORD (min 32 chars, complex)
# - REDIS_PASSWORD (min 32 chars, complex)
# - JWT_SECRET (48+ chars)
# - JWT_REFRESH_SECRET (48+ chars)
# - CSRF_SECRET (48+ chars)
# - SESSION_SECRET (48+ chars)
# - SENTRY_DSN (production project)
# - All OAuth credentials (production)
# - AWS credentials (production, minimal permissions)
```

### Deployment Steps

```bash
# 1. Build all images with no cache
docker-compose -f docker-compose.production.yml build --no-cache

# 2. Start infrastructure
docker-compose -f docker-compose.production.yml up -d postgres redis

# 3. Wait for health checks (critical)
watch docker-compose -f docker-compose.production.yml ps

# 4. Create database backup point
docker-compose -f docker-compose.production.yml exec postgres \
  pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > pre-migration-backup.sql

# 5. Run migrations
docker-compose -f docker-compose.production.yml run --rm api \
  pnpm --filter @digilist/database-schema db:push

# 6. Verify migrations
docker-compose -f docker-compose.production.yml exec postgres \
  psql -U ${POSTGRES_USER} ${POSTGRES_DB} -c "\dt platform.*"

# 7. Start API
docker-compose -f docker-compose.production.yml up -d api

# 8. Verify API health
curl http://localhost:4000/health

# 9. Start all frontend apps
docker-compose -f docker-compose.production.yml up -d \
  web minside backoffice tenant-admin saas-admin monitoring docs-learning

# 10. Verify all services
docker-compose -f docker-compose.production.yml ps

# 11. Monitor logs for errors
docker-compose -f docker-compose.production.yml logs -f --tail=100
```

### Post-Deployment Verification

```bash
# 1. Check all containers are healthy
docker-compose -f docker-compose.production.yml ps

# 2. Test API endpoints
curl http://localhost:4000/health
curl http://localhost:4000/api/health

# 3. Test database connection
docker-compose -f docker-compose.production.yml exec postgres \
  psql -U ${POSTGRES_USER} ${POSTGRES_DB} -c "SELECT 1"

# 4. Test Redis connection
docker-compose -f docker-compose.production.yml exec redis \
  redis-cli --pass ${REDIS_PASSWORD} ping

# 5. Check Sentry integration
# Verify errors are being reported to Sentry dashboard

# 6. Monitor resource usage
docker stats

# 7. Set up automated backups (cron job)
# See Backup & Recovery section
```

---

## Database Management

### Migrations

```bash
# Development
docker-compose -f docker-compose.dev.yml exec api \
  pnpm --filter @digilist/database-schema db:push

# Staging
docker-compose -f docker-compose.staging.yml run --rm api \
  pnpm --filter @digilist/database-schema db:push

# Production
docker-compose -f docker-compose.production.yml run --rm api \
  pnpm --filter @digilist/database-schema db:push
```

### Seeding

```bash
# Development (safe)
docker-compose -f docker-compose.dev.yml exec api \
  pnpm --filter @digilist/database-schema seed

# Staging (optional)
docker-compose -f docker-compose.staging.yml run --rm api \
  pnpm --filter @digilist/database-schema seed

# Production (DO NOT SEED - use real data)
```

### Direct Database Access

```bash
# Development
docker-compose -f docker-compose.dev.yml exec postgres \
  psql -U digilist_dev -d digilist_dev

# Staging
docker-compose -f docker-compose.staging.yml exec postgres \
  psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}

# Production
docker-compose -f docker-compose.production.yml exec postgres \
  psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}
```

---

## Monitoring & Logging

### View Logs

```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f api

# Last 100 lines
docker-compose -f docker-compose.production.yml logs --tail=100 api

# Follow with timestamps
docker-compose -f docker-compose.production.yml logs -f -t api
```

### Health Checks

```bash
# Check all container health
docker-compose -f docker-compose.production.yml ps

# API health endpoint
curl http://localhost:4000/health

# Database health
docker-compose -f docker-compose.production.yml exec postgres \
  pg_isready -U ${POSTGRES_USER}

# Redis health
docker-compose -f docker-compose.production.yml exec redis \
  redis-cli --pass ${REDIS_PASSWORD} ping
```

### Resource Monitoring

```bash
# Real-time stats
docker stats

# Disk usage
docker system df

# Container resource limits
docker-compose -f docker-compose.production.yml config
```

---

## Backup & Recovery

### Database Backup

```bash
# Create backup
docker-compose -f docker-compose.production.yml exec postgres \
  pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > backup-$(date +%Y%m%d-%H%M%S).sql

# Compressed backup
docker-compose -f docker-compose.production.yml exec postgres \
  pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} | gzip > backup-$(date +%Y%m%d-%H%M%S).sql.gz
```

### Database Restore

```bash
# Restore from backup
docker-compose -f docker-compose.production.yml exec -T postgres \
  psql -U ${POSTGRES_USER} ${POSTGRES_DB} < backup.sql

# Restore from compressed backup
gunzip < backup.sql.gz | docker-compose -f docker-compose.production.yml exec -T postgres \
  psql -U ${POSTGRES_USER} ${POSTGRES_DB}
```

### Automated Backups (Cron)

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * cd /path/to/docker && docker-compose -f docker-compose.production.yml exec postgres pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} | gzip > /backups/digilist-$(date +\%Y\%m\%d).sql.gz

# Weekly backup at 3 AM on Sundays
0 3 * * 0 cd /path/to/docker && docker-compose -f docker-compose.production.yml exec postgres pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} | gzip > /backups/digilist-weekly-$(date +\%Y\%m\%d).sql.gz
```

---

## Security Checklist

### Pre-Production Deployment

- [ ] All secrets are strong (min 48 characters)
- [ ] Database password is complex and unique
- [ ] Redis password is set
- [ ] CORS origins are restricted to production domains
- [ ] Sentry DSN points to production project
- [ ] ID-porten uses production credentials
- [ ] Vipps uses production credentials
- [ ] SendGrid uses production API key
- [ ] AWS credentials have minimal permissions
- [ ] SSL certificates are configured
- [ ] Firewall rules are in place
- [ ] Database accessible only from localhost
- [ ] Redis accessible only from localhost
- [ ] API accessible only via reverse proxy
- [ ] Rate limiting is enabled
- [ ] Automated backups are configured
- [ ] Monitoring and alerting are set up
- [ ] Log aggregation is configured
- [ ] Security headers are set in reverse proxy
- [ ] DDoS protection is enabled
- [ ] Regular security updates are scheduled

### Reverse Proxy Configuration (Nginx Example)

```nginx
# /etc/nginx/sites-available/digilist

# API
server {
    listen 443 ssl http2;
    server_name api.digilist.no;

    ssl_certificate /etc/letsencrypt/live/api.digilist.no/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.digilist.no/privkey.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Web App
server {
    listen 443 ssl http2;
    server_name digilist.no www.digilist.no;

    ssl_certificate /etc/letsencrypt/live/digilist.no/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/digilist.no/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# MinSide
server {
    listen 443 ssl http2;
    server_name minside.digilist.no;

    ssl_certificate /etc/letsencrypt/live/minside.digilist.no/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/minside.digilist.no/privkey.pem;

    location / {
        proxy_pass http://localhost:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backoffice
server {
    listen 443 ssl http2;
    server_name backoffice.digilist.no;

    ssl_certificate /etc/letsencrypt/live/backoffice.digilist.no/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/backoffice.digilist.no/privkey.pem;

    location / {
        proxy_pass http://localhost:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Add similar blocks for tenant-admin, saas-admin, monitoring, docs-learning
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose -f docker-compose.production.yml logs service-name

# Rebuild container
docker-compose -f docker-compose.production.yml build --no-cache service-name
docker-compose -f docker-compose.production.yml up -d service-name

# Check resource usage
docker stats
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose -f docker-compose.production.yml ps postgres

# Check PostgreSQL logs
docker-compose -f docker-compose.production.yml logs postgres

# Test connection
docker-compose -f docker-compose.production.yml exec postgres \
  psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "SELECT 1"

# Check connection from API
docker-compose -f docker-compose.production.yml exec api \
  node -e "console.log(process.env.DATABASE_URL)"
```

### High Memory Usage

```bash
# Check container stats
docker stats

# Restart specific service
docker-compose -f docker-compose.production.yml restart service-name

# Check for memory leaks in logs
docker-compose -f docker-compose.production.yml logs --tail=1000 api | grep -i "memory\|heap"
```

### Slow Performance

```bash
# Check database queries
docker-compose -f docker-compose.production.yml exec postgres \
  psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "SELECT * FROM pg_stat_activity"

# Check Redis memory
docker-compose -f docker-compose.production.yml exec redis \
  redis-cli --pass ${REDIS_PASSWORD} INFO memory

# Analyze slow queries
docker-compose -f docker-compose.production.yml logs api | grep "slow query"
```

---

## Summary

This deployment guide covers all three environments (Development, Staging, Production) with complete instructions for:

✅ **12 Services** - All apps and infrastructure  
✅ **Security** - Production-grade configuration  
✅ **Monitoring** - Health checks and logging  
✅ **Backups** - Automated and manual procedures  
✅ **Troubleshooting** - Common issues and solutions  

**For additional help, refer to:**
- `docker/README.md` - Development setup
- `docker/COMPLETE_DOCKER_SETUP.md` - Complete service inventory
- `docker/DOCKER_TEST_REPORT.md` - Test results

---

**Last Updated:** January 18, 2026  
**Maintained By:** Xala Technologies  
**Support:** support@xala.no
