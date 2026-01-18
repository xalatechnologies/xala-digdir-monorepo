# Infrastructure Setup Guide

Complete step-by-step guide to set up the Digilist Platform infrastructure.

## Prerequisites

- macOS or Linux machine
- GitHub account with repository access
- VPS access (Hostinger or similar)
- Node.js 20+ and pnpm installed

---

## Step 1: Install Age Encryption Tool

### macOS

```bash
brew install age
```

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install age
```

### Verify Installation

```bash
age --version
# Should output: v1.1.1 or higher
```

---

## Step 2: Generate Age Key Pair

```bash
# Navigate to repository root
cd /path/to/xala-digdir-monorepo

# Generate private key
age-keygen -o age.key

# This will output:
# Public key: age1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# (Save this, you'll need it)

# Extract public key to file
age-keygen -y age.key > infra/secrets/age.key.pub

# Verify files
ls -la age.key infra/secrets/age.key.pub
```

**IMPORTANT:**
- `age.key` = Private key (NEVER commit, NEVER share)
- `infra/secrets/age.key.pub` = Public key (safe to commit)

### Secure the Private Key

```bash
# Set restrictive permissions
chmod 600 age.key

# Store in password manager (1Password, LastPass, etc.)
cat age.key
# Copy the output and save securely

# Optional: Move to secure location
mkdir -p ~/.secrets
mv age.key ~/.secrets/digilist-age.key
chmod 600 ~/.secrets/digilist-age.key

# Create symlink for convenience
ln -s ~/.secrets/digilist-age.key age.key
```

### Commit Public Key

```bash
git add infra/secrets/age.key.pub
git commit -m "Add age public encryption key"
git push
```

---

## Step 3: Configure GitHub Secrets

### 3.1 Add AGE_SECRET_KEY

```bash
# Copy private key content
cat age.key
# or
cat ~/.secrets/digilist-age.key
```

Go to GitHub:
1. Navigate to your repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `AGE_SECRET_KEY`
5. Value: Paste the entire content of `age.key` (including `AGE-SECRET-KEY-1...`)
6. Click **Add secret**

### 3.2 Add SSH_PRIVATE_KEY

```bash
# Generate SSH key for VPS deployment (if you don't have one)
ssh-keygen -t ed25519 -C "github-actions@digilist.no" -f ~/.ssh/digilist_deploy

# Copy public key to VPS
ssh-copy-id -i ~/.ssh/digilist_deploy.pub user@your-vps-ip

# Test connection
ssh -i ~/.ssh/digilist_deploy user@your-vps-ip

# Copy private key
cat ~/.ssh/digilist_deploy
```

Add to GitHub Secrets:
- Name: `SSH_PRIVATE_KEY`
- Value: Paste the entire private key content

### 3.3 Add VPS Configuration

Add these secrets to GitHub:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `VPS_HOST` | Your VPS hostname/IP | `staging.digilist.no` or `123.45.67.89` |
| `VPS_USER` | SSH user for deployment | `digilist` |
| `VPS_ROOT_USER` | Root user (for secrets) | `root` |

### 3.4 Verify GitHub Secrets

You should now have these secrets configured:
- ✅ `AGE_SECRET_KEY`
- ✅ `SSH_PRIVATE_KEY`
- ✅ `VPS_HOST`
- ✅ `VPS_USER`
- ✅ `VPS_ROOT_USER`

---

## Step 4: Create Encrypted Secrets for All Apps

### 4.1 API Secrets (Staging)

```bash
./infra/scripts/encrypt-secrets.sh staging api
```

This will:
1. Open an editor with a template
2. Fill in your actual secrets
3. Save and close
4. Encrypt the file
5. Save to `infra/secrets/staging/api.enc.yaml`

**Required secrets for API:**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret (48+ characters)
- `JWT_REFRESH_SECRET` - Refresh token secret (48+ characters)
- `CSRF_SECRET` - CSRF protection secret (48+ characters)
- `SESSION_SECRET` - Session secret (48+ characters)
- `SENTRY_DSN` - Sentry error tracking DSN
- `IDPORTEN_CLIENT_ID` - ID-porten client ID
- `IDPORTEN_CLIENT_SECRET` - ID-porten client secret
- `VIPPS_CLIENT_ID` - Vipps client ID
- `VIPPS_CLIENT_SECRET` - Vipps client secret
- `SENDGRID_API_KEY` - SendGrid API key
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key

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

**Required secrets for frontend apps:**
- `VITE_API_URL` - API endpoint URL
- `VITE_WS_URL` - WebSocket endpoint URL
- `VITE_SENTRY_DSN` - Frontend Sentry DSN (optional)

### 4.3 Production Secrets

Repeat the same process for production:

```bash
./infra/scripts/encrypt-secrets.sh production api
./infra/scripts/encrypt-secrets.sh production web
./infra/scripts/encrypt-secrets.sh production minside
./infra/scripts/encrypt-secrets.sh production backoffice
./infra/scripts/encrypt-secrets.sh production tenant-admin
./infra/scripts/encrypt-secrets.sh production saas-admin
./infra/scripts/encrypt-secrets.sh production monitoring
./infra/scripts/encrypt-secrets.sh production docs-learning
```

**IMPORTANT for Production:**
- Use STRONG secrets (48+ characters)
- Use DIFFERENT secrets than staging
- Use production OAuth credentials
- Use production Sentry project

### 4.4 Commit Encrypted Secrets

```bash
git add infra/secrets/staging/*.enc.yaml
git add infra/secrets/production/*.enc.yaml
git commit -m "Add encrypted secrets for all apps (staging and production)"
git push
```

---

## Step 5: Setup VPS

### 5.1 Initial VPS Setup

```bash
# SSH into VPS as root
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y curl wget git build-essential

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2
npm install -g pm2

# Install age
wget https://github.com/FiloSottile/age/releases/download/v1.1.1/age-v1.1.1-linux-amd64.tar.gz
tar xzf age-v1.1.1-linux-amd64.tar.gz
mv age/age age/age-keygen /usr/local/bin/
rm -rf age age-v1.1.1-linux-amd64.tar.gz

# Verify installations
node --version
pnpm --version
pm2 --version
age --version
```

### 5.2 Create Digilist User

```bash
# Create user
useradd -r -s /bin/bash -d /home/digilist -m digilist

# Add to sudo group (optional)
usermod -aG sudo digilist

# Set up SSH for digilist user
mkdir -p /home/digilist/.ssh
cp ~/.ssh/authorized_keys /home/digilist/.ssh/
chown -R digilist:digilist /home/digilist/.ssh
chmod 700 /home/digilist/.ssh
chmod 600 /home/digilist/.ssh/authorized_keys
```

### 5.3 Create Directory Structure

```bash
# Create application directories
mkdir -p /var/www/digilist/{api,web,minside,backoffice,tenant-admin,saas-admin,monitoring,docs-learning}

# Create secrets directories
mkdir -p /etc/digilist/{api,web,minside,backoffice,tenant-admin,saas-admin,monitoring,docs-learning}

# Create log directory
mkdir -p /var/log/digilist

# Set ownership
chown -R digilist:digilist /var/www/digilist
chown -R digilist:digilist /var/log/digilist
chown -R root:root /etc/digilist

# Set permissions
chmod -R 755 /var/www/digilist
chmod -R 700 /etc/digilist
chmod -R 755 /var/log/digilist
```

### 5.4 Install PostgreSQL

```bash
# Install PostgreSQL 16
apt install -y postgresql-16 postgresql-contrib-16

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql <<EOF
CREATE USER digilist_staging WITH PASSWORD 'your-secure-password';
CREATE DATABASE digilist_staging OWNER digilist_staging;
GRANT ALL PRIVILEGES ON DATABASE digilist_staging TO digilist_staging;
EOF
```

### 5.5 Install Redis

```bash
# Install Redis
apt install -y redis-server

# Configure Redis
sed -i 's/supervised no/supervised systemd/' /etc/redis/redis.conf

# Start Redis
systemctl start redis
systemctl enable redis

# Verify
redis-cli ping
# Should output: PONG
```

### 5.6 Setup PM2

```bash
# Switch to digilist user
su - digilist

# Setup PM2 startup
pm2 startup systemd

# Exit back to root
exit

# Run the command that PM2 outputs
# It will look like:
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u digilist --hp /home/digilist
```

---

## Step 6: Test Deployment to Staging

### 6.1 Manual Test Deployment

```bash
# On your local machine
./infra/scripts/deploy-staging.sh
```

This will:
1. Check prerequisites
2. Decrypt secrets
3. Deploy all applications
4. Upload secrets to VPS
5. Run database migrations
6. Restart PM2 processes
7. Verify deployment

### 6.2 Verify Deployment

```bash
# Check PM2 status
ssh digilist@your-vps "pm2 list"

# Check API health
curl http://your-vps:4000/health

# Check logs
ssh digilist@your-vps "pm2 logs api-staging --lines 50"
```

---

## Step 7: Setup CI/CD (GitHub Actions)

### 7.1 Update Workflow File

The workflow file is already created at `.github/workflows/deploy-staging.yml`

Verify it references the correct paths:
- `infra/secrets/staging/*.enc.yaml`
- `infra/pm2/ecosystem.staging.config.js`
- `infra/scripts/deploy-staging.sh`

### 7.2 Test CI/CD

```bash
# Push to develop branch
git checkout develop
git push origin develop

# Watch GitHub Actions
# Go to: GitHub Repo → Actions → Latest workflow run
```

---

## Step 8: Deploy to Production

### 8.1 Review Production Checklist

Before deploying to production, ensure:

- [ ] All production secrets are created and encrypted
- [ ] Production secrets are STRONG (48+ characters)
- [ ] Production secrets are DIFFERENT from staging
- [ ] Production OAuth credentials configured
- [ ] Production Sentry project configured
- [ ] Production database is backed up
- [ ] SSL certificates are configured
- [ ] Firewall rules are in place
- [ ] Monitoring and alerting are set up
- [ ] Tested thoroughly in staging

### 8.2 Deploy to Production

```bash
# Manual deployment
./infra/scripts/deploy-production.sh

# Or via CI/CD
git checkout main
git merge develop
git push origin main
```

---

## Troubleshooting

### Cannot decrypt secrets

```bash
# Verify age key
cat age.key | head -1
# Should start with: AGE-SECRET-KEY-1

# Test decryption
age -d -i age.key infra/secrets/staging/api.enc.yaml
```

### Deployment fails

```bash
# Check GitHub Actions logs
# Repo → Actions → Failed workflow → View logs

# Check SSH access
ssh digilist@your-vps "whoami"

# Check VPS disk space
ssh root@your-vps "df -h"
```

### PM2 not starting

```bash
# Check PM2 logs
ssh digilist@your-vps "pm2 logs api-staging --lines 100"

# Check env file exists
ssh root@your-vps "ls -la /etc/digilist/api/staging.env"

# Check permissions
ssh root@your-vps "stat /etc/digilist/api/staging.env"
```

---

## Next Steps

1. **Set up monitoring** - Configure Grafana, Prometheus, Sentry
2. **Set up backups** - Automated database backups
3. **Set up SSL** - Let's Encrypt certificates
4. **Set up reverse proxy** - Nginx for HTTPS
5. **Set up firewall** - UFW or iptables
6. **Set up log aggregation** - ELK stack or similar

---

## Support

For infrastructure setup help: infrastructure@xala.no

## Documentation

- [Secrets Management](docs/SECRETS_MANAGEMENT.md)
- [Docker Setup](docker/docs/README.md)
- [Deployment Guide](docker/docs/DEPLOYMENT_GUIDE.md)
