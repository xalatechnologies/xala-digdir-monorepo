#!/bin/bash

# Generate Strong Secrets Helper Script
# Generates cryptographically secure random secrets for use in encrypted secret files

set -e

echo "🔐 Generating Strong Secrets for Digilist Platform"
echo "=================================================="
echo ""

echo "Copy these secrets for use in your encrypted secret files:"
echo ""

echo "JWT_SECRET:"
openssl rand -base64 48
echo ""

echo "JWT_REFRESH_SECRET:"
openssl rand -base64 48
echo ""

echo "CSRF_SECRET:"
openssl rand -base64 48
echo ""

echo "SESSION_SECRET:"
openssl rand -base64 48
echo ""

echo "DATABASE_PASSWORD (32 chars):"
openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
echo ""

echo "=================================================="
echo "✅ Secrets generated successfully!"
echo ""
echo "IMPORTANT: Copy these secrets immediately."
echo "They will not be shown again."
echo ""
