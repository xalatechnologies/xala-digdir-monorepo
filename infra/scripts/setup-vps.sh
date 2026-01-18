#!/bin/bash

# VPS Setup Script for Digilist Platform
# Run this script as root on a fresh Ubuntu 22.04/24.04 VPS
# Usage: sudo bash setup-vps.sh

set -e

echo "=========================================="
echo "Digilist Platform - VPS Setup"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo "ERROR: This script must be run as root"
   echo "Usage: sudo bash setup-vps.sh"
   exit 1
fi

# Update system
echo "Step 1/10: Updating system packages..."
apt update
apt upgrade -y

# Install essential packages
echo "Step 2/10: Installing essential packages..."
apt install -y curl wget git build-essential ufw fail2ban

# Install Node.js 20.x
echo "Step 3/10: Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify Node.js installation
node --version
npm --version

# Install pnpm
echo "Step 4/10: Installing pnpm..."
npm install -g pnpm
pnpm --version

# Install PM2
echo "Step 5/10: Installing PM2..."
npm install -g pm2
pm2 --version

# Install age encryption
echo "Step 6/10: Installing age encryption..."
apt install -y age
age --version

# Install PostgreSQL 16
echo "Step 7/10: Installing PostgreSQL 16..."
apt install -y postgresql-common
/usr/share/postgresql-common/pgdg/apt.postgresql.org.sh -y
apt install -y postgresql-16 postgresql-contrib-16

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Install Redis 7
echo "Step 8/10: Installing Redis 7..."
apt install -y redis-server
systemctl start redis-server
systemctl enable redis-server

# Create digilist user
echo "Step 9/10: Creating digilist user..."
if id "digilist" &>/dev/null; then
    echo "User 'digilist' already exists"
else
    useradd -m -s /bin/bash digilist
    echo "User 'digilist' created"
fi

# Create directory structure
echo "Step 10/10: Creating directory structure..."

# Application directories (owned by digilist user)
mkdir -p /var/www/digilist/{api,web,minside,backoffice,tenant-admin,saas-admin,monitoring,docs-learning}
chown -R digilist:digilist /var/www/digilist

# Secrets directories (owned by root, mode 700)
mkdir -p /etc/digilist/{api,web,minside,backoffice,tenant-admin,saas-admin,monitoring,docs-learning}
chmod 700 /etc/digilist
chmod 700 /etc/digilist/*

# PM2 config directory
mkdir -p /home/digilist
chown digilist:digilist /home/digilist

# Setup PM2 startup
echo "Setting up PM2 startup..."
su - digilist -c "pm2 startup systemd -u digilist --hp /home/digilist" | grep -v "sudo" | bash

# Configure firewall
echo "Configuring firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 4000/tcp  # API (optional - can be localhost only)
ufw status

# Configure fail2ban
echo "Configuring fail2ban..."
systemctl start fail2ban
systemctl enable fail2ban

echo ""
echo "=========================================="
echo "VPS Setup Complete!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Create PostgreSQL databases:"
echo "   sudo -u postgres psql"
echo "   CREATE DATABASE digilist_staging;"
echo "   CREATE DATABASE digilist_prod;"
echo "   CREATE USER digilist_staging WITH PASSWORD 'your-password';"
echo "   CREATE USER digilist_prod WITH PASSWORD 'your-password';"
echo "   GRANT ALL PRIVILEGES ON DATABASE digilist_staging TO digilist_staging;"
echo "   GRANT ALL PRIVILEGES ON DATABASE digilist_prod TO digilist_prod;"
echo ""
echo "2. Add SSH key for GitHub Actions:"
echo "   mkdir -p /home/digilist/.ssh"
echo "   echo 'YOUR_PUBLIC_KEY' >> /home/digilist/.ssh/authorized_keys"
echo "   chown -R digilist:digilist /home/digilist/.ssh"
echo "   chmod 700 /home/digilist/.ssh"
echo "   chmod 600 /home/digilist/.ssh/authorized_keys"
echo ""
echo "3. Test deployment from CI/CD"
echo ""
echo "Installed Versions:"
echo "  Node.js: $(node --version)"
echo "  pnpm: $(pnpm --version)"
echo "  PM2: $(pm2 --version)"
echo "  age: $(age --version)"
echo "  PostgreSQL: $(psql --version | head -1)"
echo "  Redis: $(redis-server --version)"
echo ""
