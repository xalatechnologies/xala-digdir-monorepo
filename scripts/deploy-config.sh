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
export WEB_SUBDOMAIN="web-test"
export BACKOFFICE_SUBDOMAIN="backoffice-test"
export MINSIDE_SUBDOMAIN="minside-test"

# Remote Paths (adjust based on your Hostinger setup)
# For Hostinger VPS with multiple subdomains:
export REMOTE_BASE="/home/${HOSTINGER_USER}/domains"
export WEB_REMOTE_PATH="${REMOTE_BASE}/${WEB_SUBDOMAIN}.${DOMAIN_BASE}/public_html"
export BACKOFFICE_REMOTE_PATH="${REMOTE_BASE}/${BACKOFFICE_SUBDOMAIN}.${DOMAIN_BASE}/public_html"
export MINSIDE_REMOTE_PATH="${REMOTE_BASE}/${MINSIDE_SUBDOMAIN}.${DOMAIN_BASE}/public_html"

# API Configuration
export VITE_API_URL="https://api.digilist.no"
export VITE_WS_URL="wss://api.digilist.no/ws/events"
export VITE_TENANT_ID="f47ac10b-58cc-4372-a567-0e02b2c3d479"

# Build Output Directories
export WEB_DIST="apps/web/dist"
export BACKOFFICE_DIST="apps/backoffice/dist"
export MINSIDE_DIST="apps/minside/dist"
