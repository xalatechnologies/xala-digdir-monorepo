# Creating Encrypted Secrets - Step-by-Step Guide

**Date:** January 18, 2026  
**Status:** Ready to create secrets

---

## 🎯 Overview

You need to create encrypted secrets for **8 apps** in **2 environments** (staging + production) = **16 encrypted files total**

**Apps:**
1. api
2. web
3. minside
4. backoffice
5. tenant-admin
6. saas-admin
7. monitoring
8. docs-learning

---

## 📋 Prerequisites

✅ Age encryption installed  
✅ Age key pair generated  
✅ Public key committed  
✅ Private key saved in password manager  

---

## 🔐 Step 1: Generate Strong Secrets

Run this command to generate secrets:

```bash
./infra/scripts/generate-secrets.sh
```

**Copy the output** - you'll need these values for the next steps.

---

## 📝 Step 2: Create Staging Secrets

### 2.1 API Secrets (Staging)

```bash
./infra/scripts/encrypt-secrets.sh staging api
```

This opens your editor. Fill in:

```yaml
NODE_ENV: staging
DATABASE_URL: postgresql://digilist_staging:PASTE_DB_PASSWORD_HERE@localhost:5432/digilist_staging
REDIS_URL: redis://localhost:6379

# Paste secrets from generate-secrets.sh output
JWT_SECRET: PASTE_JWT_SECRET_HERE
JWT_REFRESH_SECRET: PASTE_JWT_REFRESH_SECRET_HERE
CSRF_SECRET: PASTE_CSRF_SECRET_HERE
SESSION_SECRET: PASTE_SESSION_SECRET_HERE

# Sentry (optional - use your Sentry DSN or leave empty)
SENTRY_DSN: https://your-sentry-dsn@sentry.io/project

# ID-porten / BankID (Signicat sandbox)
IDPORTEN_CLIENT_ID: sandbox-fantastic-house-812
IDPORTEN_CLIENT_SECRET: US1SxD0ett3Hczv00dOzdSxPyGjYK1PtbbDrXmMJLTVAkvlB
IDPORTEN_BASE_URL: https://digilist.sandbox.signicat.com
IDPORTEN_API_URL: https://api.signicat.com
IDPORTEN_CALLBACK_URL: https://api-staging.digilist.no/api/auth/idporten/callback

# Vipps (optional - use your credentials or leave empty)
VIPPS_CLIENT_ID: your-vipps-client-id
VIPPS_CLIENT_SECRET: your-vipps-client-secret

# SendGrid (optional - use your API key or leave empty)
SENDGRID_API_KEY: your-sendgrid-api-key

# AWS S3 (optional - use your credentials or leave empty)
AWS_ACCESS_KEY_ID: your-aws-access-key
AWS_SECRET_ACCESS_KEY: your-aws-secret-key
AWS_REGION: eu-north-1
AWS_S3_BUCKET: digilist-staging-uploads
```

**Save and close** the editor. The script will encrypt and save to `infra/secrets/staging/api.enc.yaml`.

### 2.2 Frontend Apps Secrets (Staging)

For all frontend apps, use the same template:

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

**Template for all frontend apps:**

```yaml
VITE_API_URL: https://api-staging.digilist.no
VITE_WS_URL: wss://api-staging.digilist.no/ws/events
VITE_SENTRY_DSN: https://your-frontend-sentry-dsn@sentry.io/project
```

---

## 🏭 Step 3: Create Production Secrets

**IMPORTANT:** Use DIFFERENT and STRONGER secrets for production!

### 3.1 Generate New Secrets for Production

```bash
./infra/scripts/generate-secrets.sh
```

**Copy these NEW secrets** - they must be different from staging.

### 3.2 API Secrets (Production)

```bash
./infra/scripts/encrypt-secrets.sh production api
```

```yaml
NODE_ENV: production
DATABASE_URL: postgresql://digilist_prod:PASTE_NEW_DB_PASSWORD_HERE@localhost:5432/digilist_prod
REDIS_URL: redis://localhost:6379

# Use NEW secrets (different from staging!)
JWT_SECRET: PASTE_NEW_JWT_SECRET_HERE
JWT_REFRESH_SECRET: PASTE_NEW_JWT_REFRESH_SECRET_HERE
CSRF_SECRET: PASTE_NEW_CSRF_SECRET_HERE
SESSION_SECRET: PASTE_NEW_SESSION_SECRET_HERE

# Sentry (production DSN)
SENTRY_DSN: https://your-production-sentry-dsn@sentry.io/project

# ID-porten / BankID (PRODUCTION credentials - different from sandbox!)
IDPORTEN_CLIENT_ID: your-production-idporten-client-id
IDPORTEN_CLIENT_SECRET: your-production-idporten-client-secret
IDPORTEN_BASE_URL: https://digilist.signicat.com
IDPORTEN_API_URL: https://api.signicat.com
IDPORTEN_CALLBACK_URL: https://api.digilist.no/api/auth/idporten/callback

# Vipps (production credentials)
VIPPS_CLIENT_ID: your-production-vipps-client-id
VIPPS_CLIENT_SECRET: your-production-vipps-client-secret

# SendGrid (production API key)
SENDGRID_API_KEY: your-production-sendgrid-api-key

# AWS S3 (production credentials)
AWS_ACCESS_KEY_ID: your-production-aws-access-key
AWS_SECRET_ACCESS_KEY: your-production-aws-secret-key
AWS_REGION: eu-north-1
AWS_S3_BUCKET: digilist-production-uploads
```

### 3.3 Frontend Apps Secrets (Production)

```bash
# Web
./infra/scripts/encrypt-secrets.sh production web

# MinSide
./infra/scripts/encrypt-secrets.sh production minside

# Backoffice
./infra/scripts/encrypt-secrets.sh production backoffice

# Tenant Admin
./infra/scripts/encrypt-secrets.sh production tenant-admin

# SaaS Admin
./infra/scripts/encrypt-secrets.sh production saas-admin

# Monitoring
./infra/scripts/encrypt-secrets.sh production monitoring

# Docs & Learning
./infra/scripts/encrypt-secrets.sh production docs-learning
```

**Template for production frontend apps:**

```yaml
VITE_API_URL: https://api.digilist.no
VITE_WS_URL: wss://api.digilist.no/ws/events
VITE_SENTRY_DSN: https://your-production-frontend-sentry-dsn@sentry.io/project
```

---

## ✅ Step 4: Verify Encrypted Secrets

```bash
# List all encrypted files
ls -la infra/secrets/staging/
ls -la infra/secrets/production/

# Test decryption (staging API)
age -d -i age.key infra/secrets/staging/api.enc.yaml

# Test decryption (production API)
age -d -i age.key infra/secrets/production/api.enc.yaml
```

**Expected output:** You should see your secrets in YAML format.

---

## 📦 Step 5: Commit Encrypted Secrets

```bash
# Add all encrypted secrets
git add infra/secrets/staging/*.enc.yaml
git add infra/secrets/production/*.enc.yaml

# Also add the new helper files
git add infra/scripts/generate-secrets.sh
git add GITHUB_SECRETS_SETUP.md
git add CREATE_ENCRYPTED_SECRETS_GUIDE.md

# Commit
git commit -m "Add encrypted secrets for all apps (staging and production)"

# Push
git push origin demo-v3
```

---

## 📊 Progress Checklist

### Staging Secrets

- [ ] `infra/secrets/staging/api.enc.yaml`
- [ ] `infra/secrets/staging/web.enc.yaml`
- [ ] `infra/secrets/staging/minside.enc.yaml`
- [ ] `infra/secrets/staging/backoffice.enc.yaml`
- [ ] `infra/secrets/staging/tenant-admin.enc.yaml`
- [ ] `infra/secrets/staging/saas-admin.enc.yaml`
- [ ] `infra/secrets/staging/monitoring.enc.yaml`
- [ ] `infra/secrets/staging/docs-learning.enc.yaml`

### Production Secrets

- [ ] `infra/secrets/production/api.enc.yaml`
- [ ] `infra/secrets/production/web.enc.yaml`
- [ ] `infra/secrets/production/minside.enc.yaml`
- [ ] `infra/secrets/production/backoffice.enc.yaml`
- [ ] `infra/secrets/production/tenant-admin.enc.yaml`
- [ ] `infra/secrets/production/saas-admin.enc.yaml`
- [ ] `infra/secrets/production/monitoring.enc.yaml`
- [ ] `infra/secrets/production/docs-learning.enc.yaml`

---

## 🚨 Important Notes

### Security

- ✅ **DO** use different secrets for staging and production
- ✅ **DO** use strong secrets (48+ characters)
- ✅ **DO** commit encrypted `.enc.yaml` files
- ❌ **DON'T** commit plaintext secrets
- ❌ **DON'T** use the same secrets across environments

### Optional Services

If you don't have credentials yet for:
- **Sentry** - Leave as placeholder or empty
- **Vipps** - Leave as placeholder or empty
- **SendGrid** - Leave as placeholder or empty
- **AWS S3** - Leave as placeholder or empty

You can update these later by:
1. Decrypting the file
2. Updating the values
3. Re-encrypting
4. Committing the updated `.enc.yaml` file

---

## 🔄 Updating Secrets Later

```bash
# 1. Decrypt
age -d -i age.key infra/secrets/staging/api.enc.yaml > /tmp/api.yaml

# 2. Edit
nano /tmp/api.yaml

# 3. Re-encrypt
age -r $(cat infra/secrets/age.key.pub) \
    -o infra/secrets/staging/api.enc.yaml \
    /tmp/api.yaml

# 4. Clean up
rm /tmp/api.yaml

# 5. Commit
git add infra/secrets/staging/api.enc.yaml
git commit -m "Update API staging secrets"
git push
```

---

## 📚 Next Steps After Creating Secrets

1. ✅ Commit and push encrypted secrets
2. ⏸️ Configure GitHub Secrets (see `GITHUB_SECRETS_SETUP.md`)
3. ⏸️ Setup VPS (see `infra/SETUP_GUIDE.md`)
4. ⏸️ Test deployment (see `NEXT_STEPS.md`)

---

**Last Updated:** January 18, 2026  
**Status:** Ready to create encrypted secrets
