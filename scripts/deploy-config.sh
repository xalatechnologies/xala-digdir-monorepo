#!/bin/bash
# =============================================================================
# Hostinger Deployment Configuration
# =============================================================================
# Edit these values to match your Hostinger setup

# SSH Connection
export HOSTINGER_HOST="72.61.23.56"           # Hostinger VPS IP
export HOSTINGER_USER="root"                   # SSH username (change if different)
export HOSTINGER_PORT="22"                     # SSH port

# Domain Configuration
export DOMAIN_BASE="digilist.no"
export WEB_SUBDOMAIN="web-test"              # apps/web → web-test.digilist.no
export BACKOFFICE_SUBDOMAIN="backoffice-test"
export MINSIDE_SUBDOMAIN="minside-test"
export SAAS_ADMIN_SUBDOMAIN="saas-admin"     # apps/saas-admin → saas-admin.digilist.no
export TENANT_ADMIN_SUBDOMAIN="tenant-admin" # apps/tenant-admin → tenant-admin.digilist.no

# Remote Paths (matches nginx configuration)
# Test environments are under /var/www/digilist/
export REMOTE_BASE="/var/www/digilist"
export WEB_REMOTE_PATH="${REMOTE_BASE}/web"
export BACKOFFICE_REMOTE_PATH="${REMOTE_BASE}/backoffice"
export MINSIDE_REMOTE_PATH="${REMOTE_BASE}/minside"
export SAAS_ADMIN_REMOTE_PATH="${REMOTE_BASE}/saas-admin"
export TENANT_ADMIN_REMOTE_PATH="${REMOTE_BASE}/tenant-admin"

# API Configuration
export VITE_API_URL="https://api.digilist.no"
export VITE_WS_URL="wss://api.digilist.no/ws/events"
export VITE_TENANT_ID="f47ac10b-58cc-4372-a567-0e02b2c3d479"

# Build Output Directories
export WEB_DIST="apps/web/dist"
export BACKOFFICE_DIST="apps/backoffice/dist"
export MINSIDE_DIST="apps/minside/dist"
export SAAS_ADMIN_DIST="apps/saas-admin/dist"
export TENANT_ADMIN_DIST="apps/tenant-admin/dist"
