#!/bin/bash
set -e

VPS_HOST="${VPS_HOST:-72.61.23.56}"
EMAIL="admin@digilist.no"

echo "🔒 Setting up Nginx with SSL for Test Environment"
echo "=================================================="
echo ""

# Upload Nginx configs
echo "📤 Uploading Nginx configurations..."
scp infra/nginx/api.digilist.no.conf root@$VPS_HOST:/etc/nginx/sites-available/
scp infra/nginx/web-test.digilist.no.conf root@$VPS_HOST:/etc/nginx/sites-available/
scp infra/nginx/minside-test.digilist.no.conf root@$VPS_HOST:/etc/nginx/sites-available/
scp infra/nginx/backoffice-test.digilist.no.conf root@$VPS_HOST:/etc/nginx/sites-available/
echo "✅ Configs uploaded"
echo ""

# Install certbot if not installed
echo "📦 Installing certbot..."
ssh root@$VPS_HOST "apt-get update && apt-get install -y certbot python3-certbot-nginx"
echo "✅ Certbot installed"
echo ""

# Create temporary HTTP-only configs for certbot verification
echo "🔧 Creating temporary configs for SSL setup..."
ssh root@$VPS_HOST "cat > /etc/nginx/sites-available/api.digilist.no.temp << 'EOF'
server {
    listen 80;
    server_name api.digilist.no;
    location / {
        proxy_pass http://localhost:4000;
    }
}
EOF"

ssh root@$VPS_HOST "cat > /etc/nginx/sites-available/web-test.digilist.no.temp << 'EOF'
server {
    listen 80;
    server_name web-test.digilist.no;
    root /var/www/web;
    index index.html;
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF"

ssh root@$VPS_HOST "cat > /etc/nginx/sites-available/minside-test.digilist.no.temp << 'EOF'
server {
    listen 80;
    server_name minside-test.digilist.no;
    root /var/www/minside;
    index index.html;
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF"

ssh root@$VPS_HOST "cat > /etc/nginx/sites-available/backoffice-test.digilist.no.temp << 'EOF'
server {
    listen 80;
    server_name backoffice-test.digilist.no;
    root /var/www/backoffice;
    index index.html;
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF"

# Enable temporary configs
echo "🔗 Enabling temporary configs..."
ssh root@$VPS_HOST "ln -sf /etc/nginx/sites-available/api.digilist.no.temp /etc/nginx/sites-enabled/api.digilist.no"
ssh root@$VPS_HOST "ln -sf /etc/nginx/sites-available/web-test.digilist.no.temp /etc/nginx/sites-enabled/web-test.digilist.no"
ssh root@$VPS_HOST "ln -sf /etc/nginx/sites-available/minside-test.digilist.no.temp /etc/nginx/sites-enabled/minside-test.digilist.no"
ssh root@$VPS_HOST "ln -sf /etc/nginx/sites-available/backoffice-test.digilist.no.temp /etc/nginx/sites-enabled/backoffice-test.digilist.no"

# Test and reload Nginx
echo "🔄 Reloading Nginx..."
ssh root@$VPS_HOST "nginx -t && systemctl reload nginx"
echo "✅ Nginx reloaded"
echo ""

# Obtain SSL certificates
echo "🔐 Obtaining SSL certificates..."
ssh root@$VPS_HOST "certbot --nginx -d api.digilist.no -d web-test.digilist.no -d minside-test.digilist.no -d backoffice-test.digilist.no --non-interactive --agree-tos --email $EMAIL --redirect"
echo "✅ SSL certificates obtained"
echo ""

# Replace with full SSL configs
echo "🔧 Applying full SSL configurations..."
ssh root@$VPS_HOST "ln -sf /etc/nginx/sites-available/api.digilist.no.conf /etc/nginx/sites-enabled/api.digilist.no"
ssh root@$VPS_HOST "ln -sf /etc/nginx/sites-available/web-test.digilist.no.conf /etc/nginx/sites-enabled/web-test.digilist.no"
ssh root@$VPS_HOST "ln -sf /etc/nginx/sites-available/minside-test.digilist.no.conf /etc/nginx/sites-enabled/minside-test.digilist.no"
ssh root@$VPS_HOST "ln -sf /etc/nginx/sites-available/backoffice-test.digilist.no.conf /etc/nginx/sites-enabled/backoffice-test.digilist.no"

# Remove temporary configs
ssh root@$VPS_HOST "rm -f /etc/nginx/sites-available/*.temp"

# Final reload
echo "🔄 Final Nginx reload..."
ssh root@$VPS_HOST "nginx -t && systemctl reload nginx"
echo "✅ Nginx configured with SSL"
echo ""

echo "=================================================="
echo "✅ SSL Setup Complete!"
echo "=================================================="
echo ""
echo "Your applications are now available at:"
echo "  API:        https://api.digilist.no"
echo "  Web:        https://web-test.digilist.no"
echo "  MinSide:    https://minside-test.digilist.no"
echo "  Backoffice: https://backoffice-test.digilist.no"
echo ""
echo "SSL certificates will auto-renew via certbot."
echo ""
