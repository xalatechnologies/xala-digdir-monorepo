# Infrastructure Directory

This directory contains all infrastructure configuration, deployment scripts, and environment files for the Digilist Platform.

## Directory Structure

```
infra/
├── README.md                    # This file
├── docker/                      # Docker configurations
│   ├── compose/                 # Docker Compose files
│   │   ├── docker-compose.dev.yml
│   │   ├── docker-compose.staging.yml
│   │   └── docker-compose.production.yml
│   ├── dockerfiles/             # Dockerfiles
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.frontend
│   │   └── Dockerfile.dev
│   ├── nginx/                   # Nginx configurations
│   │   ├── web.conf
│   │   ├── minside.conf
│   │   ├── backoffice.conf
│   │   ├── tenant-admin.conf
│   │   ├── saas-admin.conf
│   │   ├── monitoring.conf
│   │   └── docs-learning.conf
│   ├── postgres/                # PostgreSQL initialization
│   │   └── init.sql
│   └── docs/                    # Docker documentation
│       ├── README.md
│       ├── DEPLOYMENT_GUIDE.md
│       ├── COMPLETE_DOCKER_SETUP.md
│       └── DOCKER_TEST_REPORT.md
├── pm2/                         # PM2 configurations
│   ├── ecosystem.staging.config.js
│   ├── ecosystem.production.config.js
│   └── ecosystem.config.cjs     # Legacy config
├── env/                         # Environment files
│   ├── .env.example             # Template for all environments
│   ├── .env.development.example # Development template
│   ├── .env.staging.example     # Staging template
│   ├── .env.production.example  # Production template
│   ├── .env.docker.dev          # Docker development
│   └── README.md                # Environment documentation
├── secrets/                     # Secrets management
│   ├── age.key.pub              # Public encryption key (committed)
│   ├── staging/                 # Staging encrypted secrets
│   │   ├── api.enc.yaml
│   │   ├── web.enc.yaml
│   │   ├── minside.enc.yaml
│   │   ├── backoffice.enc.yaml
│   │   ├── tenant-admin.enc.yaml
│   │   ├── saas-admin.enc.yaml
│   │   ├── monitoring.enc.yaml
│   │   └── docs-learning.enc.yaml
│   ├── production/              # Production encrypted secrets
│   │   ├── api.enc.yaml
│   │   ├── web.enc.yaml
│   │   ├── minside.enc.yaml
│   │   ├── backoffice.enc.yaml
│   │   ├── tenant-admin.enc.yaml
│   │   ├── saas-admin.enc.yaml
│   │   ├── monitoring.enc.yaml
│   │   └── docs-learning.enc.yaml
│   └── README.md                # Secrets documentation
├── scripts/                     # Deployment and utility scripts
│   ├── deploy-staging.sh        # Deploy to staging
│   ├── deploy-production.sh     # Deploy to production
│   ├── encrypt-secrets.sh       # Encrypt secrets helper
│   ├── decrypt-secrets.sh       # Decrypt secrets helper
│   ├── rotate-secrets.sh        # Rotate secrets
│   ├── backup-db.sh             # Database backup
│   ├── restore-db.sh            # Database restore
│   └── health-check.sh          # Health check all services
└── docs/                        # Infrastructure documentation
    ├── SECRETS_MANAGEMENT.md    # Secrets management guide
    ├── DEPLOYMENT.md            # Deployment procedures
    ├── VPS_SETUP.md             # VPS initial setup
    └── MONITORING.md            # Monitoring and logging
```

## Quick Links

- **Docker Setup**: [infra/docker/docs/README.md](docker/docs/README.md)
- **Secrets Management**: [infra/docs/SECRETS_MANAGEMENT.md](docs/SECRETS_MANAGEMENT.md)
- **Deployment Guide**: [infra/docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Environment Variables**: [infra/env/README.md](env/README.md)

## Common Tasks

### Deploy to Staging

```bash
./infra/scripts/deploy-staging.sh
```

### Deploy to Production

```bash
./infra/scripts/deploy-production.sh
```

### Encrypt Secrets

```bash
./infra/scripts/encrypt-secrets.sh staging api
```

### Start Docker Development

```bash
cd infra/docker/compose
docker-compose -f docker-compose.dev.yml up -d
```

### Backup Database

```bash
./infra/scripts/backup-db.sh production
```

## Security Notes

- **Never commit** `.env` files (only `.env.example` templates)
- **Never commit** `age.key` (private key)
- **Always encrypt** secrets before committing
- **Use strong secrets** (min 48 characters for production)
- **Rotate secrets** every 90 days

## Support

For infrastructure issues, contact: infrastructure@xala.no
