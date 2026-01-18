# infra/docker/ - Agent Commands

> **Docker Configuration and Container Management**

## Quick Reference

```bash
# Development
cd infra/docker/compose
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml logs -f
docker-compose -f docker-compose.dev.yml ps

# Staging
docker-compose -f docker-compose.staging.yml build
docker-compose -f docker-compose.staging.yml up -d
docker-compose -f docker-compose.staging.yml logs -f api

# Production
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
docker-compose -f docker-compose.production.yml ps

# Database Migrations
docker-compose -f docker-compose.dev.yml exec api pnpm db:migrate
docker-compose -f docker-compose.staging.yml exec api pnpm db:migrate
docker-compose -f docker-compose.production.yml run --rm api pnpm db:migrate
```

## Directory Structure

```
docker/
├── compose/                     # Docker Compose files
│   ├── docker-compose.dev.yml
│   ├── docker-compose.staging.yml
│   └── docker-compose.production.yml
├── dockerfiles/                 # Dockerfiles
│   ├── Dockerfile.api
│   ├── Dockerfile.api.dev
│   └── Dockerfile.frontend
├── nginx/                       # Nginx configurations
│   ├── web.conf
│   ├── minside.conf
│   ├── backoffice.conf
│   ├── tenant-admin.conf
│   ├── saas-admin.conf
│   ├── monitoring.conf
│   └── docs-learning.conf
├── postgres/                    # PostgreSQL initialization
│   └── init.sql
└── docs/                        # Documentation
    ├── README.md
    ├── DEPLOYMENT_GUIDE.md
    ├── COMPLETE_DOCKER_SETUP.md
    └── DOCKER_TEST_REPORT.md
```

## Development Environment

### Start All Services (12 containers)

```bash
cd infra/docker/compose
docker-compose -f docker-compose.dev.yml up -d
```

**Services:**
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

### Start Specific Services

```bash
# Infrastructure only
docker-compose -f docker-compose.dev.yml up -d postgres redis

# API only
docker-compose -f docker-compose.dev.yml up -d api

# Frontend apps only
docker-compose -f docker-compose.dev.yml up -d web minside backoffice

# Specific app
docker-compose -f docker-compose.dev.yml up -d web
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f api

# Last 100 lines
docker-compose -f docker-compose.dev.yml logs --tail=100 web
```

### Rebuild Services

```bash
# Rebuild all
docker-compose -f docker-compose.dev.yml build

# Rebuild specific service
docker-compose -f docker-compose.dev.yml build api

# Rebuild without cache
docker-compose -f docker-compose.dev.yml build --no-cache api

# Rebuild and restart
docker-compose -f docker-compose.dev.yml up -d --build api
```

### Stop Services

```bash
# Stop all (keeps data)
docker-compose -f docker-compose.dev.yml down

# Stop specific service
docker-compose -f docker-compose.dev.yml stop api

# Stop all and remove volumes (deletes data)
docker-compose -f docker-compose.dev.yml down -v
```

## Staging Environment

### Build and Deploy

```bash
cd infra/docker/compose

# Build all images
docker-compose -f docker-compose.staging.yml build

# Start all services
docker-compose -f docker-compose.staging.yml up -d

# View status
docker-compose -f docker-compose.staging.yml ps
```

### Run Migrations

```bash
# Run migrations
docker-compose -f docker-compose.staging.yml exec api pnpm --filter @digilist/database-schema db:push

# Seed database (optional)
docker-compose -f docker-compose.staging.yml exec api pnpm --filter @digilist/database-schema seed
```

### Health Checks

```bash
# Check all services
docker-compose -f docker-compose.staging.yml ps

# Test API health
curl http://localhost:4000/health

# Test frontend apps
curl http://localhost:8080  # Web
curl http://localhost:8081  # MinSide
curl http://localhost:8082  # Backoffice
```

## Production Environment

### Pre-Deployment Checklist

- [ ] All production secrets configured
- [ ] Database backed up
- [ ] SSL certificates configured
- [ ] Reverse proxy configured
- [ ] Firewall rules in place
- [ ] Monitoring set up
- [ ] Tested in staging

### Build and Deploy

```bash
cd infra/docker/compose

# Build all images (no cache)
docker-compose -f docker-compose.production.yml build --no-cache

# Start infrastructure
docker-compose -f docker-compose.production.yml up -d postgres redis

# Wait for health checks
watch docker-compose -f docker-compose.production.yml ps

# Run migrations
docker-compose -f docker-compose.production.yml run --rm api pnpm db:migrate

# Start all services
docker-compose -f docker-compose.production.yml up -d

# Verify
docker-compose -f docker-compose.production.yml ps
```

### Monitoring

```bash
# View logs
docker-compose -f docker-compose.production.yml logs -f --tail=100

# Check resource usage
docker stats

# Check specific service
docker-compose -f docker-compose.production.yml logs api --tail=50
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
  pg_dump -U digilist_prod digilist_prod | gzip > backup-$(date +%Y%m%d).sql.gz
```

### Restore

```bash
# Restore from backup
docker-compose -f docker-compose.production.yml exec -T postgres \
  psql -U digilist_prod digilist_prod < backup.sql

# Restore from compressed
gunzip < backup.sql.gz | docker-compose -f docker-compose.production.yml exec -T postgres \
  psql -U digilist_prod digilist_prod
```

### Direct Access

```bash
# Development
docker-compose -f docker-compose.dev.yml exec postgres \
  psql -U digilist_dev -d digilist_dev

# Production
docker-compose -f docker-compose.production.yml exec postgres \
  psql -U digilist_prod -d digilist_prod
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs service-name

# Rebuild container
docker-compose -f docker-compose.dev.yml build --no-cache service-name
docker-compose -f docker-compose.dev.yml up -d service-name

# Check resource usage
docker stats
```

### Port Conflicts

```bash
# Find what's using the port
lsof -i :5173

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose -f docker-compose.dev.yml ps postgres

# Check PostgreSQL logs
docker-compose -f docker-compose.dev.yml logs postgres

# Test connection
docker-compose -f docker-compose.dev.yml exec postgres \
  psql -U digilist_dev -d digilist_dev -c "SELECT 1"
```

### Volume Issues

```bash
# Remove all volumes (CAUTION: deletes data)
docker-compose -f docker-compose.dev.yml down -v

# Remove specific volume
docker volume rm docker_postgres_dev_data

# List volumes
docker volume ls
```

### Network Issues

```bash
# Recreate network
docker-compose -f docker-compose.dev.yml down
docker network prune
docker-compose -f docker-compose.dev.yml up -d

# Check network
docker network ls
docker network inspect digilist-dev-network
```

## Environment-Specific Notes

### Development

- **Hot reload** enabled for all apps
- **Auto-authentication** via DevTokenService
- **Development tools** included (Adminer, Redis Commander)
- **Ports** changed to avoid conflicts (5433, 6380)
- **Secrets** in `infra/env/.env.docker.dev`

### Staging

- **Production builds** (optimized)
- **Real authentication** (no bypass)
- **No dev tools**
- **Standard ports** (5432, 6379)
- **Secrets** from `infra/secrets/staging/*.enc.yaml`

### Production

- **Fully optimized** builds
- **Maximum security** (localhost-only DB/Redis)
- **JSON logging** for aggregation
- **Health checks** with start period
- **Restart policy** always
- **Secrets** from `infra/secrets/production/*.enc.yaml`

## Key Files

- `compose/docker-compose.dev.yml` - Development environment
- `compose/docker-compose.staging.yml` - Staging environment
- `compose/docker-compose.production.yml` - Production environment
- `dockerfiles/Dockerfile.api` - API production build
- `dockerfiles/Dockerfile.frontend` - Frontend apps build
- `docs/DEPLOYMENT_GUIDE.md` - Complete deployment guide

## Important Notes

- **Development** uses different ports to avoid conflicts
- **Staging/Production** use standard ports
- **All environments** use same Dockerfiles with different targets
- **Secrets** are environment-specific
- **Migrations** must be run manually after deployment
- **Backups** should be automated in production

## Related Documentation

- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Complete Docker Setup](docs/COMPLETE_DOCKER_SETUP.md)
- [Docker Test Report](docs/DOCKER_TEST_REPORT.md)
- [Infrastructure AGENTS](../AGENTS.md)
