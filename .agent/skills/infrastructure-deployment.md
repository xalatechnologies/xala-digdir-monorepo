# Infrastructure Deployment Skill

## Overview

This skill provides comprehensive knowledge for deploying and managing the Digilist Platform infrastructure across development, staging, and production environments.

## Key Concepts

### Secrets Management (Deploy-Time Injection)

**Principle:** Secrets are injected at deploy/boot time, NOT fetched at runtime.

**Flow:**
1. Developer encrypts secrets with `age` → commits `.enc.yaml` files
2. GitHub Actions decrypts with `AGE_SECRET_KEY`
3. CI/CD renders `.env` files and deploys to VPS
4. VPS stores secrets at `/etc/digilist/<app>/<env>.env` (root:root 0600)
5. PM2 loads env files at startup
6. Apps read from environment variables

### Age Encryption

- **Tool:** Modern, simple, secure encryption
- **Private Key:** `age.key` (NEVER commit)
- **Public Key:** `age.key.pub` (safe to commit)
- **Location:** `infra/secrets/`

### Deployment Environments

1. **Development** - Docker with hot reload, auto-auth, dev tools
2. **Staging** - Production builds, real auth, debug logging
3. **Production** - Optimized builds, max security, JSON logging

## Directory Structure

```
infra/
├── docker/
│   ├── compose/                 # docker-compose.{dev,staging,production}.yml
│   ├── dockerfiles/             # Dockerfile.{api,frontend}
│   ├── nginx/                   # Nginx configs
│   └── postgres/                # PostgreSQL init
├── pm2/
│   ├── ecosystem.staging.config.js
│   └── ecosystem.production.config.js
├── env/                         # Environment templates
├── secrets/
│   ├── staging/                 # Encrypted secrets
│   └── production/              # Encrypted secrets
└── scripts/
    ├── deploy-staging.sh
    ├── deploy-production.sh
    └── encrypt-secrets.sh
```

## Common Tasks

### Setup Age Encryption

```bash
# Install
brew install age  # macOS
sudo apt install age  # Ubuntu

# Generate key pair
age-keygen -o age.key
age-keygen -y age.key > infra/secrets/age.key.pub

# Secure private key
chmod 600 age.key
mv age.key ~/.secrets/digilist-age.key
```

### Create Encrypted Secrets

```bash
# Interactive
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
```

### Deploy to Staging

```bash
# Manual
./infra/scripts/deploy-staging.sh

# Via CI/CD
git push origin develop
```

### Deploy to Production

```bash
# Manual
./infra/scripts/deploy-production.sh

# Via CI/CD
git push origin main
```

### Rotate Secrets

```bash
# Decrypt
age -d -i age.key infra/secrets/production/api.enc.yaml > /tmp/api.yaml

# Update
nano /tmp/api.yaml

# Re-encrypt
age -r $(cat infra/secrets/age.key.pub) \
    -o infra/secrets/production/api.enc.yaml \
    /tmp/api.yaml

# Clean up
rm /tmp/api.yaml

# Deploy
git add infra/secrets/production/api.enc.yaml
git commit -m "Rotate secrets"
git push
```

## Security Rules

### ✅ ALWAYS

- Encrypt ALL secrets before committing
- Use strong secrets (48+ characters for production)
- Rotate secrets every 90 days
- Store age.key in password manager
- Use different secrets for staging and production
- Test in staging before production

### ❌ NEVER

- Commit plaintext secrets
- Commit age.key (private key)
- Share age.key via Slack/email
- Use same secrets across environments
- Skip encryption
- Deploy without testing

## VPS Structure

```
/etc/digilist/          # Secrets (root:root 0600)
├── api/
│   ├── staging.env
│   └── production.env
└── [... all 8 apps]

/var/www/digilist/      # Applications (digilist:digilist)
├── api/
└── [... all 8 apps]

/home/digilist/         # PM2 configs
├── ecosystem.staging.config.js
└── ecosystem.production.config.js
```

## GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `AGE_SECRET_KEY` | Private age encryption key |
| `SSH_PRIVATE_KEY` | SSH key for VPS deployment |
| `VPS_HOST` | VPS hostname or IP |
| `VPS_USER` | SSH user for deployment |
| `VPS_ROOT_USER` | Root user for secrets upload |

## Troubleshooting

### Cannot decrypt secrets

```bash
# Verify age key
head -1 age.key  # Should start with AGE-SECRET-KEY-1

# Test decryption
age -d -i age.key infra/secrets/staging/api.enc.yaml
```

### Deployment fails

```bash
# Check GitHub Actions logs
# Check SSH access
ssh digilist@vps "whoami"

# Check VPS disk space
ssh root@vps "df -h"
```

### PM2 not starting

```bash
# Check logs
pm2 logs api-staging --lines 100

# Check env file
ssh root@vps "ls -la /etc/digilist/api/staging.env"

# Restart
pm2 restart api-staging
```

## Documentation

- `infra/SETUP_GUIDE.md` - Complete setup (60+ pages)
- `infra/docs/SECRETS_MANAGEMENT.md` - Secrets guide
- `infra/docker/docs/DEPLOYMENT_GUIDE.md` - Deployment procedures
- `infra/AGENTS.md` - Infrastructure commands
- `infra/CLAUDE.md` - Infrastructure context
