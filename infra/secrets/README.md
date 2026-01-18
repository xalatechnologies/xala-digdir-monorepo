# Secrets Management

This directory contains encrypted secrets for all environments.

## Structure

```
secrets/
├── age.key.pub              # Public encryption key (safe to commit)
├── staging/                 # Staging encrypted secrets
│   ├── api.enc.yaml
│   ├── web.enc.yaml
│   ├── minside.enc.yaml
│   ├── backoffice.enc.yaml
│   ├── tenant-admin.enc.yaml
│   ├── saas-admin.enc.yaml
│   ├── monitoring.enc.yaml
│   └── docs-learning.enc.yaml
└── production/              # Production encrypted secrets
    ├── api.enc.yaml
    ├── web.enc.yaml
    ├── minside.enc.yaml
    ├── backoffice.enc.yaml
    ├── tenant-admin.enc.yaml
    ├── saas-admin.enc.yaml
    ├── monitoring.enc.yaml
    └── docs-learning.enc.yaml
```

## Setup

### 1. Generate Age Key Pair

```bash
# Install age
brew install age  # macOS
# or
sudo apt install age  # Ubuntu

# Generate key pair
age-keygen -o age.key

# Extract public key
age-keygen -y age.key > infra/secrets/age.key.pub

# Commit public key
git add infra/secrets/age.key.pub
git commit -m "Add age public key"

# NEVER commit age.key (private key)
```

### 2. Add Private Key to GitHub Secrets

```bash
# Copy private key content
cat age.key

# Go to GitHub:
# Repo → Settings → Secrets and variables → Actions → New repository secret
# Name: AGE_SECRET_KEY
# Value: <paste age.key content>
```

## Creating Encrypted Secrets

### Manual Method

```bash
# 1. Create plaintext secrets file
cat > /tmp/api-staging.yaml <<EOF
NODE_ENV: staging
DATABASE_URL: postgresql://user:pass@localhost:5432/digilist_staging
REDIS_URL: redis://localhost:6379
JWT_SECRET: $(openssl rand -base64 48)
JWT_REFRESH_SECRET: $(openssl rand -base64 48)
CSRF_SECRET: $(openssl rand -base64 48)
SESSION_SECRET: $(openssl rand -base64 48)
SENTRY_DSN: https://your-sentry-dsn@sentry.io/project
EOF

# 2. Encrypt with age
age -r $(cat infra/secrets/age.key.pub) \
    -o infra/secrets/staging/api.enc.yaml \
    /tmp/api-staging.yaml

# 3. Delete plaintext file
rm /tmp/api-staging.yaml

# 4. Commit encrypted file
git add infra/secrets/staging/api.enc.yaml
git commit -m "Add encrypted staging secrets for API"
```

### Using Helper Script

```bash
# Encrypt secrets for an app
./infra/scripts/encrypt-secrets.sh staging api

# This will:
# 1. Prompt for secrets
# 2. Encrypt with age
# 3. Save to infra/secrets/staging/api.enc.yaml
```

## Decrypting Secrets (Local Testing)

```bash
# Decrypt to view
age -d -i age.key infra/secrets/staging/api.enc.yaml

# Decrypt to file
age -d -i age.key infra/secrets/staging/api.enc.yaml > /tmp/api.yaml
```

## Deployment

Secrets are automatically decrypted during deployment:

1. **GitHub Actions** decrypts using `AGE_SECRET_KEY` secret
2. Secrets are uploaded to VPS at `/etc/digilist/<app>/<env>.env`
3. PM2 loads secrets at startup
4. Plaintext secrets are never stored in repo

See [../docs/SECRETS_MANAGEMENT.md](../docs/SECRETS_MANAGEMENT.md) for complete guide.

## Rotation

```bash
# 1. Decrypt current secrets
age -d -i age.key infra/secrets/production/api.enc.yaml > /tmp/api.yaml

# 2. Update secrets
nano /tmp/api.yaml  # Change JWT_SECRET, etc.

# 3. Re-encrypt
age -r $(cat infra/secrets/age.key.pub) \
    -o infra/secrets/production/api.enc.yaml \
    /tmp/api.yaml

# 4. Clean up
rm /tmp/api.yaml

# 5. Commit and deploy
git add infra/secrets/production/api.enc.yaml
git commit -m "Rotate JWT secret for API production"
git push  # Triggers deployment
```

## Security Best Practices

✅ **DO:**
- Encrypt ALL secrets before committing
- Use strong secrets (48+ characters)
- Rotate secrets every 90 days
- Store age.key in password manager
- Add age.key to .gitignore

❌ **DON'T:**
- Commit plaintext secrets
- Commit age.key (private key)
- Share age.key via Slack/email
- Use same secrets for staging and production
- Skip encryption "just this once"

## Troubleshooting

### Cannot decrypt

```bash
# Verify age key format
head -1 age.key
# Should start with: AGE-SECRET-KEY-1...

# Verify encrypted file
head -1 infra/secrets/staging/api.enc.yaml
# Should show age encryption header
```

### Wrong public key

```bash
# Regenerate public key from private key
age-keygen -y age.key > infra/secrets/age.key.pub
```

## Support

For secrets management issues: security@xala.no
