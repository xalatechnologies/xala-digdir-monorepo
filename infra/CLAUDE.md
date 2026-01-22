# Infrastructure - Claude Context

> **Critical infrastructure configuration and deployment context for AI assistants**

## Overview

The `infra/` directory contains ALL infrastructure configuration for the Digilist Platform:
- Docker configurations (development, staging, production)
- PM2 process manager configurations
- Environment variable templates
- Encrypted secrets management
- Deployment scripts
- Infrastructure documentation

## Architecture

### Secrets Management: Deploy-Time Injection

**CRITICAL PRINCIPLE:** Secrets are injected at deploy/boot time, NOT fetched at runtime.

```
Encrypted Secrets (repo)
    ↓ (GitHub Actions decrypts with AGE_SECRET_KEY)
VPS: /etc/digilist/<app>/<env>.env (root:root 0600)
    ↓ (PM2 loads at startup)
App Process (runs as 'digilist' user)
```

**Why this matters:**
- No runtime dependencies on secrets services
- Simple, reliable, fast
- Standard env vars work with PM2
- Secrets loaded once at startup
- Clear audit trail in CI/CD

### Deployment Flow

1. **Developer** encrypts secrets with `age` → commits `.enc.yaml` files
2. **GitHub Actions** decrypts with `AGE_SECRET_KEY` from GitHub Secrets
3. **CI/CD** renders `.env` files and deploys to VPS via SSH
4. **VPS** stores secrets in `/etc/digilist/` (root-owned, 0600)
5. **PM2** loads env files and starts processes
6. **Apps** read secrets from environment variables

## Directory Structure

```
infra/
├── docker/
│   ├── compose/                 # docker-compose.{dev,staging,production}.yml
│   ├── dockerfiles/             # Dockerfile.{api,frontend}
│   ├── nginx/                   # Nginx configs for all apps
│   ├── postgres/                # PostgreSQL init.sql
│   └── docs/                    # Docker documentation
├── pm2/
│   ├── ecosystem.staging.config.js
│   ├── ecosystem.production.config.js
│   └── ecosystem.config.cjs     # Legacy
├── env/
│   ├── .env.example             # Templates for all environments
│   ├── .env.development.example
│   ├── .env.staging.example
│   ├── .env.production.example
│   └── .env.docker.dev
├── secrets/
│   ├── age.key.pub              # Public key (committed)
│   ├── staging/                 # Encrypted secrets
│   │   ├── api.enc.yaml
│   │   ├── web.enc.yaml
│   │   └── [... all 8 apps]
│   └── production/              # Encrypted secrets
│       ├── api.enc.yaml
│       └── [... all 8 apps]
├── scripts/
│   ├── deploy-staging.sh
│   ├── deploy-production.sh
│   └── encrypt-secrets.sh
└── docs/
    └── SECRETS_MANAGEMENT.md
```

## Critical Rules

### 🔒 Security Rules (NEVER VIOLATE)

1. **NEVER commit plaintext secrets** - Only `.enc.yaml` files
2. **NEVER commit age.key** (private key) - Only `age.key.pub`
3. **NEVER share age.key** via Slack/email/chat
4. **NEVER use same secrets** for staging and production
5. **NEVER skip encryption** "just this once"
6. **NEVER store secrets in code** or config files
7. **NEVER expose secrets** in logs or error messages
8. **NEVER give frontend apps** backend secrets

### ✅ Required Practices

1. **ALWAYS encrypt secrets** before committing
2. **ALWAYS use strong secrets** (48+ characters for production)
3. **ALWAYS test in staging** before production
4. **ALWAYS rotate secrets** every 90 days
5. **ALWAYS use PM2 reload** for zero-downtime deployments
6. **ALWAYS monitor logs** after deployment
7. **ALWAYS backup database** before production deployment
8. **ALWAYS verify health checks** after deployment

## Key Concepts

### Age Encryption

- **age** = Modern, simple, secure encryption tool
- **age.key** = Private key (NEVER commit)
- **age.key.pub** = Public key (safe to commit)
- **Encryption:** `age -r $(cat age.key.pub) -o file.enc.yaml file.yaml`
- **Decryption:** `age -d -i age.key file.enc.yaml`

### PM2 Ecosystem Configs

- **ecosystem.staging.config.js** - 2 API instances, staging env
- **ecosystem.production.config.js** - 4 API instances, production env
- **env_file** - Path to secrets file (`/etc/digilist/<app>/<env>.env`)
- **Reload** - Zero-downtime: `pm2 reload ecosystem.production.config.js`

### Docker Environments

- **Development** - Hot reload, dev tools, relaxed security
- **Staging** - Production builds, real auth, debug logging
- **Production** - Optimized builds, max security, JSON logging

### VPS Structure

```
/etc/digilist/          # Secrets (root:root 0600)
/var/www/digilist/      # Applications (digilist:digilist)
/var/log/digilist/      # Logs (digilist:digilist)
/home/digilist/         # PM2 configs
```

## Common Patterns

### Creating Encrypted Secrets

```bash
# Use helper script (recommended)
./infra/scripts/encrypt-secrets.sh staging api

# Manual
cat > /tmp/api.yaml <<EOF
DATABASE_URL: postgresql://...
JWT_SECRET: $(openssl rand -base64 48)
EOF

age -r $(cat infra/secrets/age.key.pub) \
    -o infra/secrets/staging/api.enc.yaml \
    /tmp/api.yaml

rm /tmp/api.yaml
git add infra/secrets/staging/api.enc.yaml
```

### Deploying

```bash
# Staging
./infra/scripts/deploy-staging.sh

# Production
./infra/scripts/deploy-production.sh

# Via CI/CD
git push origin develop  # Triggers staging deployment
git push origin main     # Triggers production deployment
```

### Rotating Secrets

```bash
# 1. Decrypt
age -d -i age.key infra/secrets/production/api.enc.yaml > /tmp/api.yaml

# 2. Update secrets
nano /tmp/api.yaml  # Change JWT_SECRET, etc.

# 3. Re-encrypt
age -r $(cat infra/secrets/age.key.pub) \
    -o infra/secrets/production/api.enc.yaml \
    /tmp/api.yaml

# 4. Clean up
rm /tmp/api.yaml

# 5. Deploy
git add infra/secrets/production/api.enc.yaml
git commit -m "Rotate JWT secret"
git push  # Triggers deployment
```

## Frontend vs Backend Secrets

### Frontend Apps (Web, Dashboard, Backoffice, etc.)

**CAN have:**
- `VITE_API_URL` - Public API endpoint
- `VITE_WS_URL` - Public WebSocket endpoint
- `VITE_SENTRY_DSN` - Frontend Sentry DSN (public)
- `VITE_GOOGLE_MAPS_KEY` - Public API keys (domain-restricted)

**CANNOT have:**
- Database credentials
- JWT secrets
- OAuth client secrets
- Email API keys
- AWS credentials
- Backend Sentry DSN

**Pattern:** Frontend calls API, API uses secrets to access services.

### Backend API

Has ALL secrets:
- Database credentials
- Redis credentials
- JWT secrets (signing, refresh, CSRF, session)
- OAuth credentials (ID-porten, Vipps)
- Email service keys (SendGrid)
- File storage keys (AWS S3)
- Monitoring keys (Sentry)

## GitHub Secrets

Required in GitHub → Settings → Secrets → Actions:

| Secret | Purpose | Example |
|--------|---------|---------|
| `AGE_SECRET_KEY` | Decrypt secrets in CI/CD | `AGE-SECRET-KEY-1...` |
| `SSH_PRIVATE_KEY` | Deploy to VPS | `-----BEGIN OPENSSH PRIVATE KEY-----` |
| `VPS_HOST` | VPS hostname/IP | `staging.digilist.no` |
| `VPS_USER` | SSH user | `digilist` |
| `VPS_ROOT_USER` | Root user | `root` |

## Troubleshooting

### Secrets won't decrypt

**Check:**
1. Age key format: `head -1 age.key` → starts with `AGE-SECRET-KEY-1`
2. Encrypted file: `head -1 file.enc.yaml` → shows age header
3. Public key matches: `age-keygen -y age.key` → compare with `age.key.pub`

### Deployment fails

**Check:**
1. GitHub Actions logs
2. SSH access: `ssh digilist@vps "whoami"`
3. VPS disk space: `ssh root@vps "df -h"`
4. Age installed on VPS: `ssh root@vps "age --version"`

### PM2 won't start

**Check:**
1. Env file exists: `ssh root@vps "ls -la /etc/digilist/api/staging.env"`
2. Permissions: Should be `root:root 0600`
3. PM2 logs: `ssh digilist@vps "pm2 logs api-staging --lines 100"`
4. Ecosystem config: `cat infra/pm2/ecosystem.staging.config.js`

## Important Files

- `infra/SETUP_GUIDE.md` - Complete setup (60+ pages)
- `infra/docs/SECRETS_MANAGEMENT.md` - Secrets guide
- `infra/docker/docs/DEPLOYMENT_GUIDE.md` - Deployment procedures
- `infra/secrets/README.md` - Secrets usage
- `infra/env/README.md` - Environment variables

## When Making Changes

### Adding New Secret

1. Update template in `infra/env/.env.{environment}.example`
2. Decrypt existing secrets: `age -d -i age.key file.enc.yaml > /tmp/file.yaml`
3. Add new secret to `/tmp/file.yaml`
4. Re-encrypt: `age -r $(cat age.key.pub) -o file.enc.yaml /tmp/file.yaml`
5. Clean up: `rm /tmp/file.yaml`
6. Commit and deploy

### Adding New App

1. Create secrets file: `./infra/scripts/encrypt-secrets.sh staging newapp`
2. Add to PM2 config: `infra/pm2/ecosystem.staging.config.js`
3. Add to Docker compose: `infra/docker/compose/docker-compose.*.yml`
4. Create nginx config: `infra/docker/nginx/newapp.conf`
5. Update deployment scripts

### Changing Deployment Flow

1. Update scripts in `infra/scripts/`
2. Update GitHub Actions in `.github/workflows/`
3. Update PM2 configs in `infra/pm2/`
4. Update documentation
5. Test in staging first

## Support

- **Infrastructure:** infrastructure@xala.no
- **Security:** security@xala.no
- **Deployment:** devops@xala.no
