# Infrastructure Setup Checklist

**Status:** In Progress  
**Date:** January 18, 2026

---

## ✅ Step 1: Install Age Encryption

### Fix Homebrew Permissions (Required First)

```bash
# Fix Homebrew ownership
sudo chown -R ibrahimrahmani /opt/homebrew

# Verify permissions
ls -la /opt/homebrew | head -5
```

### Install Age

```bash
# Install via Homebrew
brew install age

# Verify installation
age --version
# Should output: v1.1.1 or higher
```

**Status:** ⏸️ Waiting - Homebrew permissions need to be fixed first

---

## ⏸️ Step 2: Generate Age Key Pair

```bash
cd /Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo

# Generate private key
age-keygen -o age.key

# This will output something like:
# Public key: age1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Extract public key to file
age-keygen -y age.key > infra/secrets/age.key.pub

# Secure the private key
chmod 600 age.key

# Verify files created
ls -la age.key infra/secrets/age.key.pub
```

**Expected Output:**
```
-rw-------  1 ibrahimrahmani  staff  184 Jan 18 14:30 age.key
-rw-r--r--  1 ibrahimrahmani  staff   63 Jan 18 14:30 infra/secrets/age.key.pub
```

**Status:** ⏸️ Pending - Requires Step 1 completion

---

## ⏸️ Step 3: Secure and Backup Private Key

```bash
# Create secure directory
mkdir -p ~/.secrets

# Copy private key to secure location
cp age.key ~/.secrets/digilist-age.key
chmod 600 ~/.secrets/digilist-age.key

# Create symlink (optional)
ln -sf ~/.secrets/digilist-age.key age.key

# IMPORTANT: Add to password manager
cat age.key
# Copy this output and save in 1Password/LastPass/etc.
```

**Status:** ⏸️ Pending

---

## ⏸️ Step 4: Commit Public Key

```bash
# Add public key to git
git add infra/secrets/age.key.pub

# Commit
git commit -m "Add age public encryption key"

# Push
git push origin develop
```

**Status:** ⏸️ Pending

---

## ⏸️ Step 5: Configure GitHub Secrets

Go to: **GitHub Repository → Settings → Secrets and variables → Actions**

### 5.1 Add AGE_SECRET_KEY

```bash
# Copy private key content
cat age.key
# or
cat ~/.secrets/digilist-age.key
```

- Click **New repository secret**
- Name: `AGE_SECRET_KEY`
- Value: Paste the entire content (starts with `AGE-SECRET-KEY-1...`)
- Click **Add secret**

### 5.2 Add SSH_PRIVATE_KEY

```bash
# If you don't have an SSH key for deployment, generate one:
ssh-keygen -t ed25519 -C "github-actions@digilist.no" -f ~/.ssh/digilist_deploy

# Copy public key to VPS (when VPS is ready)
ssh-copy-id -i ~/.ssh/digilist_deploy.pub user@your-vps-ip

# Copy private key
cat ~/.ssh/digilist_deploy
```

- Name: `SSH_PRIVATE_KEY`
- Value: Paste the entire private key content

### 5.3 Add VPS Configuration

| Secret Name | Value | Example |
|-------------|-------|---------|
| `VPS_HOST` | Your VPS hostname/IP | `staging.digilist.no` or `123.45.67.89` |
| `VPS_USER` | SSH user for deployment | `digilist` |
| `VPS_ROOT_USER` | Root user | `root` |

**Status:** ⏸️ Pending - Requires age key generation

---

## ⏸️ Step 6: Create Encrypted Secrets

### 6.1 API Secrets (Staging)

```bash
./infra/scripts/encrypt-secrets.sh staging api
```

This will open an editor. Fill in these values:

```yaml
NODE_ENV: staging
DATABASE_URL: postgresql://digilist_staging:CHANGE_PASSWORD@localhost:5432/digilist_staging
REDIS_URL: redis://localhost:6379
JWT_SECRET: <generate with: openssl rand -base64 48>
JWT_REFRESH_SECRET: <generate with: openssl rand -base64 48>
CSRF_SECRET: <generate with: openssl rand -base64 48>
SESSION_SECRET: <generate with: openssl rand -base64 48>
SENTRY_DSN: https://your-sentry-dsn@sentry.io/project
IDPORTEN_CLIENT_ID: your-idporten-client-id
IDPORTEN_CLIENT_SECRET: your-idporten-client-secret
VIPPS_CLIENT_ID: your-vipps-client-id
VIPPS_CLIENT_SECRET: your-vipps-client-secret
SENDGRID_API_KEY: your-sendgrid-api-key
AWS_ACCESS_KEY_ID: your-aws-access-key
AWS_SECRET_ACCESS_KEY: your-aws-secret-key
```

### 6.2 Frontend Apps Secrets (Staging)

```bash
# Web
./infra/scripts/encrypt-secrets.sh staging web

# MinSide
./infra/scripts/encrypt-secrets.sh staging minside

# Backoffice
./infra/scripts/encrypt-secrets.sh staging backoffice

# Tenant Admin
./infra/scripts/encrypt-secrets.sh staging tenant-admin

# SaaS Admin
./infra/scripts/encrypt-secrets.sh staging saas-admin

# Monitoring
./infra/scripts/encrypt-secrets.sh staging monitoring

# Docs & Learning
./infra/scripts/encrypt-secrets.sh staging docs-learning
```

Frontend apps need:
```yaml
VITE_API_URL: https://api-staging.digilist.no
VITE_WS_URL: wss://api-staging.digilist.no/ws/events
VITE_SENTRY_DSN: https://your-frontend-sentry-dsn@sentry.io/project
```

### 6.3 Production Secrets

Repeat the same process for production:

```bash
./infra/scripts/encrypt-secrets.sh production api
./infra/scripts/encrypt-secrets.sh production web
# ... etc for all 8 apps
```

**IMPORTANT:** Use DIFFERENT and STRONGER secrets for production (48+ characters)

### 6.4 Commit Encrypted Secrets

```bash
git add infra/secrets/staging/*.enc.yaml
git add infra/secrets/production/*.enc.yaml
git commit -m "Add encrypted secrets for all apps"
git push origin develop
```

**Status:** ⏸️ Pending - Requires age key generation

---

## ⏸️ Step 7: Verify Setup Locally

```bash
# Test decryption
age -d -i age.key infra/secrets/staging/api.enc.yaml

# Should output the decrypted YAML content
```

**Status:** ⏸️ Pending

---

## ⏸️ Step 8: VPS Setup (When Ready)

Follow complete guide in: `infra/SETUP_GUIDE.md`

Quick summary:
1. SSH into VPS as root
2. Install Node.js 20, pnpm, PM2, age
3. Create `digilist` user
4. Create directory structure
5. Install PostgreSQL 16 and Redis 7
6. Setup PM2 startup

**Status:** ⏸️ Pending - VPS not configured yet

---

## ⏸️ Step 9: Test Deployment

```bash
# Deploy to staging (when VPS is ready)
./infra/scripts/deploy-staging.sh
```

**Status:** ⏸️ Pending - Requires VPS setup

---

## Current Status Summary

| Step | Status | Blocker |
|------|--------|---------|
| 1. Install Age | ⏸️ Blocked | Homebrew permissions need fixing |
| 2. Generate Keys | ⏸️ Pending | Requires Step 1 |
| 3. Secure Keys | ⏸️ Pending | Requires Step 2 |
| 4. Commit Public Key | ⏸️ Pending | Requires Step 2 |
| 5. GitHub Secrets | ⏸️ Pending | Requires Step 2 |
| 6. Encrypted Secrets | ⏸️ Pending | Requires Step 2 |
| 7. Verify Setup | ⏸️ Pending | Requires Step 6 |
| 8. VPS Setup | ⏸️ Pending | VPS not available |
| 9. Test Deployment | ⏸️ Pending | Requires Step 8 |

---

## Next Action Required

**Fix Homebrew permissions first:**

```bash
sudo chown -R ibrahimrahmani /opt/homebrew
```

Then run:

```bash
brew install age
age --version
```

Once age is installed, proceed with Step 2.

---

## Quick Reference Commands

```bash
# Generate strong secrets
openssl rand -base64 48

# Encrypt secrets
./infra/scripts/encrypt-secrets.sh staging api

# Decrypt secrets (verify)
age -d -i age.key infra/secrets/staging/api.enc.yaml

# Deploy to staging
./infra/scripts/deploy-staging.sh
```

---

**Last Updated:** January 18, 2026  
**Status:** Waiting for Homebrew permissions fix
