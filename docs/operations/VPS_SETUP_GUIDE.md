# VPS Setup Guide - Digilist Platform

**Date:** January 18, 2026  
**Target OS:** Ubuntu 22.04 LTS or 24.04 LTS

---

## Prerequisites

Before starting, you need:

1. **VPS Server** from a hosting provider:
   - Hostinger
   - DigitalOcean
   - Hetzner
   - Linode
   - Vultr

2. **Minimum Specifications:**
   - 2 CPU cores
   - 4 GB RAM
   - 50 GB SSD storage
   - Ubuntu 22.04 LTS or 24.04 LTS

3. **Root SSH Access:**
   - SSH key or password
   - Public IP address

---

## Quick Setup (Automated)

### Step 1: Connect to VPS

```bash
ssh root@your-vps-ip
```

### Step 2: Download Setup Script

```bash
curl -o setup-vps.sh https://raw.githubusercontent.com/xalatechnologies/xala-digdir-monorepo/demo-v3/infra/scripts/setup-vps.sh
chmod +x setup-vps.sh
```

### Step 3: Run Setup Script

```bash
sudo bash setup-vps.sh
```

This will install:
- Node.js 20.x
- pnpm
- PM2
- age encryption
- PostgreSQL 16
- Redis 7
- Create `digilist` user
- Setup directory structure
- Configure firewall

**Duration:** 5-10 minutes

---

## Manual Setup (Step-by-Step)

If you prefer manual installation or the script fails:

### 1. Update System

```bash
apt update
apt upgrade -y
```

### 2. Install Essential Packages

```bash
apt install -y curl wget git build-essential ufw fail2ban
```

### 3. Install Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify
node --version  # Should be v20.x.x
npm --version
```

### 4. Install pnpm

```bash
npm install -g pnpm
pnpm --version
```

### 5. Install PM2

```bash
npm install -g pm2
pm2 --version
```

### 6. Install age Encryption

```bash
apt install -y age
age --version
```

### 7. Install PostgreSQL 16

```bash
apt install -y postgresql-common
/usr/share/postgresql-common/pgdg/apt.postgresql.org.sh -y
apt install -y postgresql-16 postgresql-contrib-16

# Start and enable
systemctl start postgresql
systemctl enable postgresql

# Verify
psql --version
```

### 8. Install Redis 7

```bash
apt install -y redis-server

# Start and enable
systemctl start redis-server
systemctl enable redis-server

# Verify
redis-server --version
```

### 9. Create Digilist User

```bash
useradd -m -s /bin/bash digilist
```

### 10. Create Directory Structure

```bash
# Application directories (digilist user)
mkdir -p /var/www/digilist/{api,web,minside,backoffice,tenant-admin,saas-admin,monitoring,docs-learning}
chown -R digilist:digilist /var/www/digilist

# Secrets directories (root only)
mkdir -p /etc/digilist/{api,web,minside,backoffice,tenant-admin,saas-admin,monitoring,docs-learning}
chmod 700 /etc/digilist
chmod 700 /etc/digilist/*
```

### 11. Setup PM2 Startup

```bash
su - digilist -c "pm2 startup systemd -u digilist --hp /home/digilist"
# Copy the command output and run it
```

### 12. Configure Firewall

```bash
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw status
```

### 13. Configure fail2ban

```bash
systemctl start fail2ban
systemctl enable fail2ban
```

---

## Database Setup

### Create Databases

```bash
sudo -u postgres psql
```

In PostgreSQL shell:

```sql
-- Staging database
CREATE DATABASE digilist_staging;
CREATE USER digilist_staging WITH PASSWORD 'PASTE_DB_PASSWORD_FROM_SECRETS';
GRANT ALL PRIVILEGES ON DATABASE digilist_staging TO digilist_staging;

-- Production database
CREATE DATABASE digilist_prod;
CREATE USER digilist_prod WITH PASSWORD 'PASTE_DB_PASSWORD_FROM_SECRETS';
GRANT ALL PRIVILEGES ON DATABASE digilist_prod TO digilist_prod;

-- Create schemas (staging)
\c digilist_staging
CREATE SCHEMA IF NOT EXISTS platform;
CREATE SCHEMA IF NOT EXISTS domain;
CREATE SCHEMA IF NOT EXISTS compliance;
CREATE SCHEMA IF NOT EXISTS monitoring;
CREATE SCHEMA IF NOT EXISTS saas;
GRANT ALL ON SCHEMA platform TO digilist_staging;
GRANT ALL ON SCHEMA domain TO digilist_staging;
GRANT ALL ON SCHEMA compliance TO digilist_staging;
GRANT ALL ON SCHEMA monitoring TO digilist_staging;
GRANT ALL ON SCHEMA saas TO digilist_staging;

-- Create schemas (production)
\c digilist_prod
CREATE SCHEMA IF NOT EXISTS platform;
CREATE SCHEMA IF NOT EXISTS domain;
CREATE SCHEMA IF NOT EXISTS compliance;
CREATE SCHEMA IF NOT EXISTS monitoring;
CREATE SCHEMA IF NOT EXISTS saas;
GRANT ALL ON SCHEMA platform TO digilist_prod;
GRANT ALL ON SCHEMA domain TO digilist_prod;
GRANT ALL ON SCHEMA compliance TO digilist_prod;
GRANT ALL ON SCHEMA monitoring TO digilist_prod;
GRANT ALL ON SCHEMA saas TO digilist_prod;

\q
```

### Verify Database Setup

```bash
sudo -u postgres psql -c "\l"  # List databases
sudo -u postgres psql -d digilist_staging -c "\dn"  # List schemas
```

---

## SSH Key Setup for Deployment

### Add GitHub Actions SSH Key

```bash
# Create .ssh directory for digilist user
mkdir -p /home/digilist/.ssh

# Add your GitHub Actions public key
echo "YOUR_GITHUB_ACTIONS_PUBLIC_KEY" >> /home/digilist/.ssh/authorized_keys

# Set permissions
chown -R digilist:digilist /home/digilist/.ssh
chmod 700 /home/digilist/.ssh
chmod 600 /home/digilist/.ssh/authorized_keys
```

### Test SSH Access

From your local machine:

```bash
ssh -i ~/.ssh/digilist_deploy digilist@your-vps-ip
```

Should connect without password.

---

## Verification Checklist

Run these commands to verify setup:

```bash
# Check Node.js
node --version  # Should be v20.x.x

# Check pnpm
pnpm --version  # Should be 8.x.x or higher

# Check PM2
pm2 --version

# Check age
age --version  # Should be v1.1.1 or higher

# Check PostgreSQL
systemctl status postgresql  # Should be active
psql --version

# Check Redis
systemctl status redis-server  # Should be active
redis-cli ping  # Should return PONG

# Check directories
ls -la /var/www/digilist/  # Should show 8 app directories
ls -la /etc/digilist/  # Should show 8 secret directories

# Check user
id digilist  # Should exist

# Check firewall
ufw status  # Should be active

# Check PM2 startup
systemctl status pm2-digilist  # Should be enabled
```

---

## Security Hardening (Optional but Recommended)

### 1. Disable Root SSH Login

```bash
nano /etc/ssh/sshd_config
```

Change:
```
PermitRootLogin no
PasswordAuthentication no
```

Restart SSH:
```bash
systemctl restart sshd
```

### 2. Configure PostgreSQL for Localhost Only

```bash
nano /etc/postgresql/16/main/postgresql.conf
```

Set:
```
listen_addresses = 'localhost'
```

Restart PostgreSQL:
```bash
systemctl restart postgresql
```

### 3. Configure Redis for Localhost Only

```bash
nano /etc/redis/redis.conf
```

Set:
```
bind 127.0.0.1 ::1
protected-mode yes
```

Restart Redis:
```bash
systemctl restart redis-server
```

### 4. Setup Automatic Security Updates

```bash
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

---

## Next Steps

After VPS setup is complete:

1. **Configure GitHub Secrets** (if not done):
   - `VPS_HOST` - Your VPS IP or hostname
   - `VPS_USER` - `digilist`
   - `VPS_ROOT_USER` - `root`
   - `SSH_PRIVATE_KEY` - Your deployment SSH private key
   - `AGE_SECRET_KEY` - Your age private key

2. **Test Deployment:**
   ```bash
   # From your local machine
   ./infra/scripts/deploy-staging.sh
   ```

3. **Verify Deployment:**
   - SSH into VPS
   - Check PM2 processes: `pm2 list`
   - Check logs: `pm2 logs`
   - Test API: `curl http://localhost:4000/health`

---

## Troubleshooting

### PostgreSQL Won't Start

```bash
systemctl status postgresql
journalctl -u postgresql -n 50
```

### Redis Won't Start

```bash
systemctl status redis-server
journalctl -u redis-server -n 50
```

### PM2 Processes Not Starting

```bash
pm2 logs
pm2 describe api-staging
```

### Firewall Blocking Connections

```bash
ufw status verbose
ufw allow 4000/tcp  # If API needs external access
```

### Disk Space Issues

```bash
df -h
du -sh /var/www/digilist/*
```

---

## Support

For VPS setup issues:
- Infrastructure: infrastructure@xala.no
- Documentation: `infra/SETUP_GUIDE.md`

---

**Last Updated:** January 18, 2026  
**Status:** Ready for VPS deployment
