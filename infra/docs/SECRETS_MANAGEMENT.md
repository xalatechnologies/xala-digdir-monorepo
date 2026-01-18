# Digilist Platform - Secrets Management Standard

**Version:** 1.0  
**Last Updated:** January 18, 2026  
**Deployment:** Hostinger VPS with PM2  
**Strategy:** Deploy-time Injection (No Runtime Fetch)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Folder Structure](#folder-structure)
4. [Setup Instructions](#setup-instructions)
5. [Deployment Workflow](#deployment-workflow)
6. [Secrets Rotation](#secrets-rotation)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### Principle: Deploy-Time Injection

**Secrets are injected into the process environment at deploy/boot time, NOT fetched by apps at runtime.**

### Why This Approach?

✅ **No runtime dependencies** - Apps never call secrets services  
✅ **Simple and reliable** - Standard env vars, works with PM2  
✅ **Secure** - Secrets stored encrypted, decrypted only during deploy  
✅ **Fast** - No network calls for secrets  
✅ **Auditable** - Clear deployment trail  

### Technology Stack

- **Encryption:** `age` (modern, simple, secure)
- **Structured Secrets:** `sops` (optional, for YAML/JSON)
- **Process Manager:** PM2 (with ecosystem configs)
- **CI/CD:** GitHub Actions
- **VPS:** Hostinger with Ubuntu

---

## Architecture

### Secrets Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Developer encrypts secrets with age                      │
│    secrets.staging.enc.yaml (committed to private repo)     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. GitHub Actions CI/CD                                     │
│    - Decrypts secrets using age key (from GitHub Secrets)   │
│    - Renders .env files                                     │
│    - Deploys to VPS via SSH                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. VPS: /etc/digilist/<app>/<env>.env                      │
│    - Owned by root:root, mode 0600                          │
│    - PM2 loads env at startup                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. PM2 Process                                              │
│    - Runs as 'digilist' user                                │
│    - Env vars loaded from file                              │
│    - No plaintext secrets in code                           │
└─────────────────────────────────────────────────────────────┘
```

### Security Layers

1. **Encryption at Rest** - Secrets encrypted with `age` in repo
2. **Secure Transport** - SSH for deployment, HTTPS for CI
3. **Strict Permissions** - Root-owned env files, mode 0600
4. **Process Isolation** - Apps run as dedicated user
5. **No Runtime Fetch** - Secrets loaded once at startup
6. **Audit Trail** - All deployments logged in CI/CD

---

## Folder Structure

### On VPS

```
/etc/digilist/
├── api/
│   ├── staging.env          # API staging secrets (root:root 0600)
│   └── production.env       # API production secrets (root:root 0600)
├── web/
│   ├── staging.env          # Web staging env vars (root:root 0600)
│   └── production.env       # Web production env vars (root:root 0600)
├── minside/
│   ├── staging.env
│   └── production.env
├── backoffice/
│   ├── staging.env
│   └── production.env
├── tenant-admin/
│   ├── staging.env
│   └── production.env
├── saas-admin/
│   ├── staging.env
│   └── production.env
├── monitoring/
│   ├── staging.env
│   └── production.env
└── docs-learning/
    ├── staging.env
    └── production.env

/var/www/digilist/
├── api/                     # API application
├── web/                     # Web application
├── minside/                 # MinSide application
├── backoffice/              # Backoffice application
├── tenant-admin/            # Tenant Admin application
├── saas-admin/              # SaaS Admin application
├── monitoring/              # Monitoring application
└── docs-learning/           # Docs & Learning application

/home/digilist/
├── ecosystem.staging.config.js    # PM2 config for staging
└── ecosystem.production.config.js # PM2 config for production
```

### In Repository

```
.secrets/
├── age.key.pub              # Public key (committed)
├── staging/
│   ├── api.enc.yaml         # Encrypted API secrets
│   ├── web.enc.yaml         # Encrypted Web env vars
│   ├── minside.enc.yaml
│   ├── backoffice.enc.yaml
│   ├── tenant-admin.enc.yaml
│   ├── saas-admin.enc.yaml
│   ├── monitoring.enc.yaml
│   └── docs-learning.enc.yaml
└── production/
    ├── api.enc.yaml
    ├── web.enc.yaml
    ├── minside.enc.yaml
    ├── backoffice.enc.yaml
    ├── tenant-admin.enc.yaml
    ├── saas-admin.enc.yaml
    ├── monitoring.enc.yaml
    └── docs-learning.enc.yaml

scripts/
├── deploy-staging.sh        # Staging deployment script
├── deploy-production.sh     # Production deployment script
├── encrypt-secrets.sh       # Encrypt secrets helper
├── decrypt-secrets.sh       # Decrypt secrets helper
└── rotate-secrets.sh        # Secrets rotation helper

.github/
└── workflows/
    ├── deploy-staging.yml   # CI/CD for staging
    └── deploy-production.yml # CI/CD for production
```

---

## Setup Instructions

### 1. Install Tools on VPS

```bash
# SSH into VPS
ssh root@your-vps-ip

# Install age
wget https://github.com/FiloSottile/age/releases/download/v1.1.1/age-v1.1.1-linux-amd64.tar.gz
tar xzf age-v1.1.1-linux-amd64.tar.gz
sudo mv age/age age/age-keygen /usr/local/bin/
rm -rf age age-v1.1.1-linux-amd64.tar.gz

# Verify installation
age --version
```

### 2. Generate Age Key Pair

```bash
# On your local machine (NOT on VPS)
age-keygen -o age.key

# This creates:
# - age.key (private key - NEVER commit)
# - Public key printed to console

# Save public key
age-keygen -y age.key > age.key.pub

# Add private key to GitHub Secrets:
# GitHub Repo → Settings → Secrets → Actions → New secret
# Name: AGE_SECRET_KEY
# Value: <paste contents of age.key>
```

### 3. Create Folder Structure on VPS

```bash
# Create secrets directories
sudo mkdir -p /etc/digilist/{api,web,minside,backoffice,tenant-admin,saas-admin,monitoring,docs-learning}

# Create application directories
sudo mkdir -p /var/www/digilist/{api,web,minside,backoffice,tenant-admin,saas-admin,monitoring,docs-learning}

# Create digilist user
sudo useradd -r -s /bin/bash -d /home/digilist -m digilist

# Set permissions
sudo chown -R digilist:digilist /var/www/digilist
sudo chown -R root:root /etc/digilist
sudo chmod -R 700 /etc/digilist
```

### 4. Install PM2

```bash
# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Set up PM2 to start on boot
sudo pm2 startup systemd -u digilist --hp /home/digilist
```

### 5. Create Encrypted Secrets Files

```bash
# On your local machine, in repository root
mkdir -p .secrets/{staging,production}

# Create secrets file (example for API staging)
cat > .secrets/staging/api.yaml <<EOF
NODE_ENV: staging
DATABASE_URL: postgresql://user:password@localhost:5432/digilist_staging
REDIS_URL: redis://localhost:6379
JWT_SECRET: your-jwt-secret-here
JWT_REFRESH_SECRET: your-refresh-secret-here
CSRF_SECRET: your-csrf-secret-here
SESSION_SECRET: your-session-secret-here
SENTRY_DSN: your-sentry-dsn
EOF

# Encrypt the file
age -r $(cat .secrets/age.key.pub) -o .secrets/staging/api.enc.yaml .secrets/staging/api.yaml

# Delete plaintext file
rm .secrets/staging/api.yaml

# Commit encrypted file
git add .secrets/staging/api.enc.yaml .secrets/age.key.pub
git commit -m "Add encrypted staging secrets for API"
```

### 6. Test Decryption Locally

```bash
# Decrypt to verify
age -d -i age.key .secrets/staging/api.enc.yaml

# Should output your secrets in YAML format
```

---

## Deployment Workflow

### Manual Deployment (Testing)

```bash
# 1. Decrypt secrets
age -d -i age.key .secrets/staging/api.enc.yaml > /tmp/api.staging.env

# 2. Convert YAML to ENV format (if needed)
# Or use a script to parse YAML → ENV

# 3. Copy to VPS
scp /tmp/api.staging.env root@vps:/etc/digilist/api/staging.env

# 4. Set permissions
ssh root@vps "chmod 600 /etc/digilist/api/staging.env"

# 5. Deploy application
ssh digilist@vps "cd /var/www/digilist/api && git pull && pnpm install && pnpm build"

# 6. Restart PM2
ssh digilist@vps "pm2 restart ecosystem.staging.config.js"

# 7. Clean up
rm /tmp/api.staging.env
```

### Automated Deployment (GitHub Actions)

See `.github/workflows/deploy-staging.yml` for complete workflow.

**Key steps:**
1. Checkout code
2. Decrypt secrets using `AGE_SECRET_KEY` from GitHub Secrets
3. Render `.env` files from decrypted YAML
4. Deploy to VPS via SSH
5. Copy env files to `/etc/digilist/`
6. Restart PM2 processes
7. Verify deployment

---

## Secrets Rotation

### When to Rotate

- **Immediately:** If secrets are compromised
- **Regularly:** Every 90 days for JWT secrets
- **After:** Employee departure with access
- **Compliance:** As required by security policy

### Rotation Procedure

```bash
# 1. Generate new secrets
openssl rand -base64 48  # New JWT secret

# 2. Update secrets file
age -d -i age.key .secrets/production/api.enc.yaml > /tmp/api.yaml
nano /tmp/api.yaml  # Update JWT_SECRET

# 3. Re-encrypt
age -r $(cat .secrets/age.key.pub) -o .secrets/production/api.enc.yaml /tmp/api.yaml
rm /tmp/api.yaml

# 4. Commit and push
git add .secrets/production/api.enc.yaml
git commit -m "Rotate JWT secret for API production"
git push

# 5. Deploy (triggers CI/CD)
# Or manually: ./scripts/deploy-production.sh

# 6. Verify
curl https://api.digilist.no/health
```

### Zero-Downtime Rotation

For JWT secrets, use a grace period:

1. Add new secret as `JWT_SECRET_NEW`
2. Update API to accept both old and new
3. Deploy
4. Wait 24 hours (token expiry)
5. Remove old secret
6. Rename `JWT_SECRET_NEW` to `JWT_SECRET`
7. Deploy again

---

## Security Best Practices

### ✅ DO

- **Encrypt all secrets** before committing to repo
- **Use strong secrets** (min 48 characters for production)
- **Rotate regularly** (90 days for sensitive secrets)
- **Audit access** (who can decrypt secrets)
- **Use separate keys** for staging and production
- **Store age private key** in GitHub Secrets only
- **Set strict permissions** (0600 for env files)
- **Run apps as dedicated user** (not root)
- **Monitor deployments** (CI/CD logs)
- **Test in staging first** before production

### ❌ DON'T

- **Never commit plaintext secrets** to repo
- **Never share age private key** via Slack/email
- **Never store secrets in code** or config files
- **Never expose secrets** in logs or error messages
- **Never give frontend apps** backend secrets
- **Never use same secrets** for staging and production
- **Never skip encryption** "just this once"
- **Never deploy without testing** decryption first
- **Never store age key** on the VPS
- **Never make env files** world-readable

### Frontend Apps (Special Case)

Frontend apps (Web, MinSide, Backoffice, etc.) should **NEVER** have backend secrets.

**What they CAN have:**
- `VITE_API_URL` - Public API endpoint
- `VITE_WS_URL` - Public WebSocket endpoint
- `VITE_SENTRY_DSN` - Frontend-specific Sentry DSN (public)
- `VITE_GOOGLE_MAPS_KEY` - Public API keys (with domain restrictions)

**What they CANNOT have:**
- Database credentials
- JWT secrets
- OAuth client secrets
- Email API keys
- AWS credentials
- Backend Sentry DSN

**Pattern:** Frontend calls API, API uses secrets to access services.

---

## Troubleshooting

### Secrets Not Loading

```bash
# Check if env file exists
ls -la /etc/digilist/api/staging.env

# Check permissions
stat /etc/digilist/api/staging.env
# Should be: root:root 0600

# Check PM2 is loading env file
pm2 show api-staging
# Look for "env" section

# Check env vars in process
pm2 env 0  # Replace 0 with process ID
```

### Decryption Fails

```bash
# Verify age key format
cat age.key
# Should start with: AGE-SECRET-KEY-1...

# Test decryption manually
age -d -i age.key .secrets/staging/api.enc.yaml

# Check file was encrypted with correct public key
head -1 .secrets/staging/api.enc.yaml
# Should show age encryption header
```

### PM2 Not Starting

```bash
# Check PM2 logs
pm2 logs api-staging --lines 100

# Check ecosystem config
cat /home/digilist/ecosystem.staging.config.js

# Verify env file path is correct
pm2 show api-staging | grep env_file

# Test PM2 config syntax
pm2 start ecosystem.staging.config.js --dry-run
```

### Deployment Fails

```bash
# Check GitHub Actions logs
# Go to: GitHub Repo → Actions → Latest workflow run

# Verify SSH access
ssh digilist@vps "whoami"

# Check disk space on VPS
ssh root@vps "df -h"

# Verify age is installed
ssh root@vps "age --version"
```

---

## Summary

This secrets management system provides:

✅ **Secure** - Encrypted at rest, strict permissions  
✅ **Simple** - Standard env vars, no runtime complexity  
✅ **Reliable** - No external dependencies at runtime  
✅ **Auditable** - Clear deployment trail in CI/CD  
✅ **Scalable** - Works for all 8 apps consistently  
✅ **Maintainable** - Easy rotation and updates  

**Next Steps:**
1. Review `scripts/` directory for helper scripts
2. Review `.github/workflows/` for CI/CD configs
3. Review `ecosystem.*.config.js` for PM2 configs
4. Test in staging before production
5. Set up monitoring and alerting

---

**Last Updated:** January 18, 2026  
**Maintained By:** Xala Technologies  
**Support:** support@xala.no
