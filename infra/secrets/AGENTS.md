# infra/secrets/ - Agent Commands

> **Secrets Management with Age Encryption**

## Quick Reference

```bash
# Setup
age-keygen -o age.key
age-keygen -y age.key > infra/secrets/age.key.pub

# Encrypt (interactive)
./infra/scripts/encrypt-secrets.sh staging api

# Encrypt (manual)
age -r $(cat infra/secrets/age.key.pub) -o infra/secrets/staging/api.enc.yaml /tmp/api.yaml

# Decrypt
age -d -i age.key infra/secrets/staging/api.enc.yaml

# Verify
age -d -i age.key infra/secrets/staging/api.enc.yaml | head -5
```

## Directory Structure

```
secrets/
├── age.key.pub              # Public key (committed)
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

## Setup Age Encryption

### Install Age

```bash
# macOS
brew install age

# Ubuntu/Debian
sudo apt install age

# Verify
age --version
```

### Generate Key Pair

```bash
# Generate private key
age-keygen -o age.key

# Extract public key
age-keygen -y age.key > infra/secrets/age.key.pub

# Secure private key
chmod 600 age.key

# Move to secure location
mkdir -p ~/.secrets
mv age.key ~/.secrets/digilist-age.key

# Create symlink (optional)
ln -s ~/.secrets/digilist-age.key age.key
```

### Commit Public Key

```bash
git add infra/secrets/age.key.pub
git commit -m "Add age public encryption key"
git push
```

## Creating Encrypted Secrets

### Using Helper Script (Recommended)

```bash
# API secrets
./infra/scripts/encrypt-secrets.sh staging api
./infra/scripts/encrypt-secrets.sh production api

# Frontend app secrets
./infra/scripts/encrypt-secrets.sh staging web
./infra/scripts/encrypt-secrets.sh staging minside
./infra/scripts/encrypt-secrets.sh staging backoffice
./infra/scripts/encrypt-secrets.sh staging tenant-admin
./infra/scripts/encrypt-secrets.sh staging saas-admin
./infra/scripts/encrypt-secrets.sh staging monitoring
./infra/scripts/encrypt-secrets.sh staging docs-learning
```

### Manual Encryption

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

# 2. Encrypt
age -r $(cat infra/secrets/age.key.pub) \
    -o infra/secrets/staging/api.enc.yaml \
    /tmp/api-staging.yaml

# 3. Delete plaintext
rm /tmp/api-staging.yaml

# 4. Commit
git add infra/secrets/staging/api.enc.yaml
git commit -m "Add encrypted staging secrets for API"
```

## Decrypting Secrets

### View Secrets

```bash
# Decrypt to stdout
age -d -i age.key infra/secrets/staging/api.enc.yaml

# Decrypt first 5 lines
age -d -i age.key infra/secrets/staging/api.enc.yaml | head -5

# Decrypt to file
age -d -i age.key infra/secrets/staging/api.enc.yaml > /tmp/api.yaml
```

### Verify Secrets

```bash
# Check if file is encrypted
head -1 infra/secrets/staging/api.enc.yaml
# Should show age encryption header

# Test decryption
age -d -i age.key infra/secrets/staging/api.enc.yaml > /dev/null
echo $?
# Should output: 0 (success)
```

## Rotating Secrets

### Standard Rotation

```bash
# 1. Decrypt current secrets
age -d -i age.key infra/secrets/production/api.enc.yaml > /tmp/api.yaml

# 2. Update secrets
nano /tmp/api.yaml
# Change JWT_SECRET, JWT_REFRESH_SECRET, etc.

# 3. Re-encrypt
age -r $(cat infra/secrets/age.key.pub) \
    -o infra/secrets/production/api.enc.yaml \
    /tmp/api.yaml

# 4. Clean up
rm /tmp/api.yaml

# 5. Commit and deploy
git add infra/secrets/production/api.enc.yaml
git commit -m "Rotate JWT secrets for API production"
git push
```

### Zero-Downtime Rotation (JWT)

```bash
# 1. Add new secret alongside old
age -d -i age.key infra/secrets/production/api.enc.yaml > /tmp/api.yaml
nano /tmp/api.yaml
# Add: JWT_SECRET_NEW: <new-secret>

# 2. Deploy (API accepts both old and new)
age -r $(cat infra/secrets/age.key.pub) \
    -o infra/secrets/production/api.enc.yaml \
    /tmp/api.yaml
git add infra/secrets/production/api.enc.yaml
git commit -m "Add new JWT secret"
git push

# 3. Wait 24 hours (token expiry)

# 4. Remove old secret
age -d -i age.key infra/secrets/production/api.enc.yaml > /tmp/api.yaml
nano /tmp/api.yaml
# Remove: JWT_SECRET (old)
# Rename: JWT_SECRET_NEW → JWT_SECRET

# 5. Deploy again
age -r $(cat infra/secrets/age.key.pub) \
    -o infra/secrets/production/api.enc.yaml \
    /tmp/api.yaml
git add infra/secrets/production/api.enc.yaml
git commit -m "Complete JWT secret rotation"
git push
```

## Secret Templates

### API Secrets

```yaml
NODE_ENV: staging
DATABASE_URL: postgresql://user:password@localhost:5432/digilist_staging
REDIS_URL: redis://localhost:6379
JWT_SECRET: <48+ character secret>
JWT_REFRESH_SECRET: <48+ character secret>
CSRF_SECRET: <48+ character secret>
SESSION_SECRET: <48+ character secret>
SENTRY_DSN: https://your-sentry-dsn@sentry.io/project
IDPORTEN_CLIENT_ID: your-idporten-client-id
IDPORTEN_CLIENT_SECRET: your-idporten-client-secret
VIPPS_CLIENT_ID: your-vipps-client-id
VIPPS_CLIENT_SECRET: your-vipps-client-secret
SENDGRID_API_KEY: your-sendgrid-api-key
AWS_ACCESS_KEY_ID: your-aws-access-key
AWS_SECRET_ACCESS_KEY: your-aws-secret-key
```

### Frontend App Secrets

```yaml
VITE_API_URL: https://api-staging.digilist.no
VITE_WS_URL: wss://api-staging.digilist.no/ws/events
VITE_SENTRY_DSN: https://your-frontend-sentry-dsn@sentry.io/project
```

## GitHub Secrets Configuration

### Add AGE_SECRET_KEY

```bash
# Copy private key
cat age.key
# or
cat ~/.secrets/digilist-age.key

# Add to GitHub:
# Repo → Settings → Secrets and variables → Actions
# New repository secret
# Name: AGE_SECRET_KEY
# Value: <paste entire age.key content>
```

### Verify GitHub Secret

```bash
# Trigger a deployment
git push origin develop

# Check GitHub Actions logs
# Repo → Actions → Latest workflow
# Look for "Decrypt secrets" step
```

## Security Best Practices

### ✅ DO

- **Encrypt ALL secrets** before committing
- **Use strong secrets** (48+ characters for production)
- **Rotate secrets** every 90 days
- **Store age.key** in password manager
- **Use different secrets** for staging and production
- **Test decryption** before committing
- **Verify encryption** header in .enc.yaml files
- **Clean up** temporary plaintext files

### ❌ DON'T

- **Never commit** plaintext secrets
- **Never commit** age.key (private key)
- **Never share** age.key via Slack/email
- **Never use** same secrets across environments
- **Never skip** encryption "just this once"
- **Never store** secrets in code
- **Never expose** secrets in logs
- **Never reuse** secrets after rotation

## Troubleshooting

### Cannot Decrypt

```bash
# Verify age key format
head -1 age.key
# Should start with: AGE-SECRET-KEY-1

# Verify encrypted file
head -1 infra/secrets/staging/api.enc.yaml
# Should show age encryption header

# Test decryption
age -d -i age.key infra/secrets/staging/api.enc.yaml
```

### Wrong Public Key

```bash
# Regenerate public key from private key
age-keygen -y age.key > infra/secrets/age.key.pub

# Verify
cat infra/secrets/age.key.pub
```

### File Not Encrypted

```bash
# Check file type
file infra/secrets/staging/api.enc.yaml
# Should show: data or ASCII text (age encrypted)

# Re-encrypt
age -r $(cat infra/secrets/age.key.pub) \
    -o infra/secrets/staging/api.enc.yaml \
    /tmp/api.yaml
```

### GitHub Actions Fails to Decrypt

```bash
# Verify AGE_SECRET_KEY in GitHub Secrets
# Should be entire content of age.key

# Check GitHub Actions logs
# Look for decryption errors

# Test locally
age -d -i age.key infra/secrets/staging/api.enc.yaml
```

## Important Notes

- **age.key** = Private key (NEVER commit)
- **age.key.pub** = Public key (safe to commit)
- **All .enc.yaml files** are encrypted and safe to commit
- **Plaintext secrets** should NEVER be committed
- **Rotation** should happen every 90 days minimum
- **Production secrets** must be DIFFERENT from staging
- **Strong secrets** = 48+ characters for production

## Related Documentation

- [Secrets README](README.md)
- [Infrastructure AGENTS](../AGENTS.md)
- [Setup Guide](../SETUP_GUIDE.md)
- [Secrets Management](../docs/SECRETS_MANAGEMENT.md)
