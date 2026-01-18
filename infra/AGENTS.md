# infra/ - Agent Commands

> **Infrastructure Configuration and Deployment**

## Quick Reference

```bash
# Secrets Management
./infra/scripts/encrypt-secrets.sh staging api
./infra/scripts/encrypt-secrets.sh production api
age -d -i age.key infra/secrets/staging/api.enc.yaml

# Deployment
./infra/scripts/deploy-staging.sh
./infra/scripts/deploy-production.sh

# Docker (Development)
cd infra/docker/compose
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml logs -f

# Docker (Staging/Production)
docker-compose -f docker-compose.staging.yml up -d
docker-compose -f docker-compose.production.yml up -d

# PM2 Management
pm2 start infra/pm2/ecosystem.staging.config.js
pm2 reload infra/pm2/ecosystem.production.config.js
pm2 logs api-production
```

## Directory Structure

```
infra/
├── docker/          # Docker configurations
├── pm2/             # PM2 process manager configs
├── env/             # Environment variable templates
├── secrets/         # Encrypted secrets (age)
├── scripts/         # Deployment and utility scripts
└── docs/            # Infrastructure documentation
```

## Common Tasks

### Setup Age Encryption

```bash
# Install age
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
# Interactive helper
./infra/scripts/encrypt-secrets.sh staging api

# Manual encryption
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
# Manual deployment
./infra/scripts/deploy-staging.sh

# Via GitHub Actions
git push origin develop
```

### Deploy to Production

```bash
# Manual deployment
./infra/scripts/deploy-production.sh

# Via GitHub Actions
git push origin main
```

### Manage PM2 Processes

```bash
# Start all services
pm2 start infra/pm2/ecosystem.staging.config.js

# Reload (zero-downtime)
pm2 reload infra/pm2/ecosystem.staging.config.js

# Stop all
pm2 stop infra/pm2/ecosystem.staging.config.js

# View logs
pm2 logs api-staging
pm2 logs --lines 100

# Monitor
pm2 monit
```

### Docker Development

```bash
# Start all services
cd infra/docker/compose
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f api

# Rebuild specific service
docker-compose -f docker-compose.dev.yml build api
docker-compose -f docker-compose.dev.yml up -d api

# Stop all
docker-compose -f docker-compose.dev.yml down

# Reset (delete volumes)
docker-compose -f docker-compose.dev.yml down -v
```

### Environment Variables

```bash
# Create local .env from template
cp infra/env/.env.development.example .env

# Edit
nano .env

# Verify
cat .env | grep -v '^#' | grep -v '^$'
```

## Key Files

- `infra/SETUP_GUIDE.md` - Complete setup instructions
- `infra/docker/docs/DEPLOYMENT_GUIDE.md` - Deployment procedures
- `infra/docs/SECRETS_MANAGEMENT.md` - Secrets management guide
- `infra/secrets/README.md` - Secrets usage guide
- `infra/env/README.md` - Environment variables guide

## Security Best Practices

### ✅ DO

- Encrypt all secrets before committing
- Use strong secrets (48+ characters for production)
- Rotate secrets every 90 days
- Store age.key in password manager
- Use different secrets for staging and production
- Test in staging before production
- Review deployment logs
- Monitor application health

### ❌ DON'T

- Commit plaintext secrets
- Commit age.key (private key)
- Share secrets via Slack/email
- Use same secrets across environments
- Skip encryption "just this once"
- Deploy without testing
- Ignore health check failures
- Store secrets in code

## Troubleshooting

### Cannot decrypt secrets

```bash
# Verify age key format
head -1 age.key
# Should start with: AGE-SECRET-KEY-1

# Test decryption
age -d -i age.key infra/secrets/staging/api.enc.yaml
```

### Deployment fails

```bash
# Check GitHub Actions logs
# Repo → Actions → Failed workflow

# Check SSH access
ssh digilist@your-vps "whoami"

# Check VPS disk space
ssh root@your-vps "df -h"

# Check age installation
ssh root@your-vps "age --version"
```

### PM2 not starting

```bash
# Check logs
pm2 logs api-staging --lines 100

# Check env file
ssh root@your-vps "ls -la /etc/digilist/api/staging.env"

# Check permissions
ssh root@your-vps "stat /etc/digilist/api/staging.env"
# Should be: root:root 0600

# Restart PM2
pm2 restart api-staging
```

### Docker issues

```bash
# Check container status
docker-compose -f docker-compose.dev.yml ps

# View logs
docker-compose -f docker-compose.dev.yml logs api

# Rebuild from scratch
docker-compose -f docker-compose.dev.yml build --no-cache api
docker-compose -f docker-compose.dev.yml up -d api
```

## Important Notes

- **All secrets must be encrypted** before committing to repo
- **age.key is private** - never commit, never share
- **Test in staging first** before deploying to production
- **Use PM2 reload** for zero-downtime deployments
- **Monitor logs** after every deployment
- **Backup database** before production deployments
- **Rotate secrets** regularly (every 90 days minimum)

## GitHub Secrets Required

Configure these in GitHub → Settings → Secrets → Actions:

| Secret | Description |
|--------|-------------|
| `AGE_SECRET_KEY` | Private age encryption key |
| `SSH_PRIVATE_KEY` | SSH key for VPS deployment |
| `VPS_HOST` | VPS hostname or IP |
| `VPS_USER` | SSH user for deployment |
| `VPS_ROOT_USER` | Root user for secrets upload |

## VPS Directory Structure

```
/etc/digilist/                    # Secrets (root:root 0600)
├── api/
│   ├── staging.env
│   └── production.env
├── web/
│   ├── staging.env
│   └── production.env
└── [... all 8 apps]

/var/www/digilist/                # Applications (digilist:digilist)
├── api/
├── web/
├── minside/
└── [... all 8 apps]

/home/digilist/                   # PM2 configs
├── ecosystem.staging.config.js
└── ecosystem.production.config.js
```

## Support

For infrastructure issues: infrastructure@xala.no

## Related Documentation

- [Root AGENTS.md](../AGENTS.md) - Repository-wide commands
- [Docker AGENTS.md](docker/AGENTS.md) - Docker-specific commands
- [Secrets README](secrets/README.md) - Secrets management
- [Setup Guide](SETUP_GUIDE.md) - Complete setup instructions
