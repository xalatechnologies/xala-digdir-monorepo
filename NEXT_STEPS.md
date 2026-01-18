# Infrastructure Setup - Next Steps

**Status:** Age encryption setup complete ✅  
**Date:** January 18, 2026

---

## ✅ Completed Steps

1. ✅ **Age installed** - v1.3.1
2. ✅ **Age key pair generated**
   - Private key: `age.key` (permissions: 600)
   - Public key: `infra/secrets/age.key.pub`
   - Backup: `~/.secrets/digilist-age.key`
3. ✅ **Public key staged for commit**
4. ✅ **Encryption/decryption verified** - Working correctly

**Your public key:**
```
age1u55ptsh8wpy8d4kglqxf5tyxnvaqr0v0a4qe4c6qg5x8sfnt5a4sqwqs5t
```

---

## 🎯 Next Steps (In Order)

### Step 1: Commit Public Key

```bash
git commit -m "Add age public encryption key for secrets management"
git push origin develop
```

### Step 2: Save Private Key to Password Manager

**CRITICAL:** Your private key must be saved securely!

```bash
# Display private key
cat age.key
```

**Copy the entire output** (starts with `AGE-SECRET-KEY-1...`) and save it in:
- 1Password
- LastPass
- Bitwarden
- Or your preferred password manager

**Title:** Digilist Age Private Key  
**Notes:** Used for encrypting/decrypting secrets in infra/secrets/

### Step 3: Configure GitHub Secrets

Go to: **https://github.com/YOUR_ORG/xala-digdir-monorepo/settings/secrets/actions**

#### 3.1 Add AGE_SECRET_KEY

```bash
# Copy private key content
cat age.key
```

- Click **New repository secret**
- Name: `AGE_SECRET_KEY`
- Value: Paste the entire content
- Click **Add secret**

#### 3.2 Add SSH_PRIVATE_KEY (For VPS Deployment)

If you don't have a deployment SSH key yet:

```bash
# Generate deployment SSH key
ssh-keygen -t ed25519 -C "github-actions@digilist.no" -f ~/.ssh/digilist_deploy

# Display private key
cat ~/.ssh/digilist_deploy
```

- Name: `SSH_PRIVATE_KEY`
- Value: Paste the entire private key

**Note:** You'll need to add the public key to your VPS later:
```bash
cat ~/.ssh/digilist_deploy.pub
```

#### 3.3 Add VPS Configuration

| Secret Name | Value | Example |
|-------------|-------|---------|
| `VPS_HOST` | Your VPS hostname/IP | `staging.digilist.no` |
| `VPS_USER` | SSH user | `digilist` |
| `VPS_ROOT_USER` | Root user | `root` |

**Note:** If you don't have a VPS yet, you can add these later.

---

## 📝 Step 4: Create Encrypted Secrets

### Generate Strong Secrets

```bash
# Generate JWT secrets (run 4 times for different secrets)
openssl rand -base64 48
```

### 4.1 API Secrets (Staging)

```bash
./infra/scripts/encrypt-secrets.sh staging api
```

When the editor opens, fill in:

```yaml
NODE_ENV: staging
DATABASE_URL: postgresql://digilist_staging:STRONG_PASSWORD_HERE@localhost:5432/digilist_staging
REDIS_URL: redis://localhost:6379
JWT_SECRET: <paste output from: openssl rand -base64 48>
JWT_REFRESH_SECRET: <paste output from: openssl rand -base64 48>
CSRF_SECRET: <paste output from: openssl rand -base64 48>
SESSION_SECRET: <paste output from: openssl rand -base64 48>
SENTRY_DSN: https://your-sentry-dsn@sentry.io/project
IDPORTEN_CLIENT_ID: your-idporten-client-id
IDPORTEN_CLIENT_SECRET: your-idporten-client-secret
IDPORTEN_BASE_URL: https://digilist.sandbox.signicat.com
IDPORTEN_API_URL: https://api.signicat.com
IDPORTEN_CALLBACK_URL: https://api-staging.digilist.no/api/auth/idporten/callback
VIPPS_CLIENT_ID: your-vipps-client-id
VIPPS_CLIENT_SECRET: your-vipps-client-secret
SENDGRID_API_KEY: your-sendgrid-api-key
AWS_ACCESS_KEY_ID: your-aws-access-key
AWS_SECRET_ACCESS_KEY: your-aws-secret-key
AWS_REGION: eu-north-1
AWS_S3_BUCKET: digilist-staging-uploads
```

Save and close the editor. The script will encrypt and save to `infra/secrets/staging/api.enc.yaml`.

### 4.2 Frontend Apps Secrets (Staging)

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

For each frontend app, use:

```yaml
VITE_API_URL: https://api-staging.digilist.no
VITE_WS_URL: wss://api-staging.digilist.no/ws/events
VITE_SENTRY_DSN: https://your-frontend-sentry-dsn@sentry.io/project
```

### 4.3 Production Secrets

**IMPORTANT:** Use DIFFERENT and STRONGER secrets for production!

```bash
# API
./infra/scripts/encrypt-secrets.sh production api

# All frontend apps
./infra/scripts/encrypt-secrets.sh production web
./infra/scripts/encrypt-secrets.sh production minside
./infra/scripts/encrypt-secrets.sh production backoffice
./infra/scripts/encrypt-secrets.sh production tenant-admin
./infra/scripts/encrypt-secrets.sh production saas-admin
./infra/scripts/encrypt-secrets.sh production monitoring
./infra/scripts/encrypt-secrets.sh production docs-learning
```

### 4.4 Commit Encrypted Secrets

```bash
git add infra/secrets/staging/*.enc.yaml
git add infra/secrets/production/*.enc.yaml
git commit -m "Add encrypted secrets for all apps (staging and production)"
git push origin develop
```

---

## 🔍 Step 5: Verify Setup

### Test Decryption

```bash
# Decrypt staging API secrets to verify
age -d -i age.key infra/secrets/staging/api.enc.yaml

# Should output your secrets in YAML format
```

### Verify GitHub Secrets

1. Go to GitHub Actions
2. Trigger a workflow (or wait for next push)
3. Check if secrets are accessible in workflow logs (they should be masked)

---

## 🚀 Step 6: VPS Setup (When Ready)

When you have a VPS available, follow: `infra/SETUP_GUIDE.md`

Quick summary:
1. SSH into VPS as root
2. Install Node.js 20, pnpm, PM2, age
3. Create `digilist` user
4. Create directory structure (`/etc/digilist/`, `/var/www/digilist/`)
5. Install PostgreSQL 16 and Redis 7
6. Setup PM2 startup script

---

## 📊 Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Age encryption | ✅ Complete | v1.3.1 installed |
| Key pair | ✅ Generated | Public key ready to commit |
| Private key backup | ⏸️ Pending | Save to password manager |
| GitHub Secrets | ⏸️ Pending | Configure AGE_SECRET_KEY |
| Encrypted secrets | ⏸️ Pending | Create for all 8 apps |
| VPS setup | ⏸️ Pending | VPS not available yet |
| Deployment | ⏸️ Pending | Requires VPS |

---

## 🎯 Immediate Actions

1. **Commit public key** (1 minute)
2. **Save private key to password manager** (2 minutes)
3. **Configure GitHub Secrets** (5 minutes)
4. **Create encrypted secrets for staging** (15 minutes)
5. **Create encrypted secrets for production** (15 minutes)

**Total time:** ~40 minutes

---

## 📚 Documentation

- Complete guide: `infra/SETUP_GUIDE.md`
- Secrets management: `infra/docs/SECRETS_MANAGEMENT.md`
- Quick commands: `infra/AGENTS.md`
- Docker deployment: `infra/docker/docs/DEPLOYMENT_GUIDE.md`

---

## ⚠️ Security Reminders

- ✅ **DO** save private key in password manager
- ✅ **DO** use different secrets for staging and production
- ✅ **DO** use strong secrets (48+ characters)
- ✅ **DO** commit encrypted `.enc.yaml` files
- ❌ **DON'T** commit `age.key` (private key)
- ❌ **DON'T** commit plaintext secrets
- ❌ **DON'T** share private key via Slack/email

---

**Last Updated:** January 18, 2026  
**Status:** Ready for GitHub Secrets configuration
