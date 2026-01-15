# Nginx & SSL Quick Reference Guide
**Xala Digilist Platform**

---

## 🚀 Common Operations

### Check Nginx Status
```bash
ssh root@72.61.23.56 "systemctl status nginx"
```

### Test Nginx Configuration
```bash
ssh root@72.61.23.56 "nginx -t"
```

### Reload Nginx (Apply Config Changes)
```bash
ssh root@72.61.23.56 "systemctl reload nginx"
```

### Restart Nginx (Full Restart)
```bash
ssh root@72.61.23.56 "systemctl restart nginx"
```

### View Nginx Error Logs
```bash
ssh root@72.61.23.56 "tail -f /var/log/nginx/error.log"
```

### View Site-Specific Logs
```bash
# API logs
ssh root@72.61.23.56 "tail -f /var/log/nginx/digilist-api.access.log"
ssh root@72.61.23.56 "tail -f /var/log/nginx/digilist-api.error.log"

# Backoffice logs
ssh root@72.61.23.56 "tail -f /var/log/nginx/backoffice.access.log"

# Web logs
ssh root@72.61.23.56 "tail -f /var/log/nginx/web.access.log"
```

---

## 🔒 SSL Certificate Management

### List All Certificates
```bash
ssh root@72.61.23.56 "certbot certificates"
```

### Obtain New Certificate
```bash
ssh root@72.61.23.56
certbot certonly --webroot -w /var/www/certbot -d your-domain.digilist.no \
  --non-interactive --agree-tos --email admin@digilist.no
```

### Renew All Certificates (Manual)
```bash
ssh root@72.61.23.56 "certbot renew"
```

### Test Certificate Renewal (Dry Run)
```bash
ssh root@72.61.23.56 "certbot renew --dry-run"
```

### Check Auto-Renewal Timer
```bash
ssh root@72.61.23.56 "systemctl status certbot.timer"
```

### Force Certificate Renewal
```bash
ssh root@72.61.23.56 "certbot renew --force-renewal"
```

---

## ⚙️ Site Management

### Enable a Site
```bash
ssh root@72.61.23.56
ln -s /etc/nginx/sites-available/your-site.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### Disable a Site
```bash
ssh root@72.61.23.56
rm /etc/nginx/sites-enabled/your-site.conf
nginx -t && systemctl reload nginx
```

### List Enabled Sites
```bash
ssh root@72.61.23.56 "ls -la /etc/nginx/sites-enabled/"
```

### List Available Sites
```bash
ssh root@72.61.23.56 "ls -la /etc/nginx/sites-available/"
```

### Edit Site Configuration
```bash
ssh root@72.61.23.56
nano /etc/nginx/sites-available/your-site.conf
nginx -t  # Test before reloading
systemctl reload nginx
```

---

## 🧪 Testing & Verification

### Test HTTPS Connection
```bash
curl -I https://api.digilist.no
curl -I https://backoffice.digilist.no
curl -I https://web.digilist.no
```

### Check SSL Certificate
```bash
openssl s_client -connect api.digilist.no:443 -servername api.digilist.no < /dev/null
```

### Check Security Headers
```bash
curl -sI https://backoffice.digilist.no | grep -E "strict-transport|content-security|x-frame"
```

### Test CSP Policy
```bash
curl -sI https://backoffice.digilist.no | grep "content-security-policy"
```

### Check DNS Resolution
```bash
dig web.digilist.no +short
dig minside.digilist.no +short
```

### Full SSL Test (External)
```bash
# Use SSL Labs
# https://www.ssllabs.com/ssltest/analyze.html?d=api.digilist.no
```

---

## 📦 Deployment

### Deploy All Apps
```bash
cd /Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo
./deploy.sh
```

### Deploy Specific App
```bash
# API only
pnpm --filter @digilist/api build
scp -r apps/api/dist/* root@72.61.23.56:/var/www/digilist-api/
ssh root@72.61.23.56 "pm2 restart xala-api"

# Backoffice only
pnpm --filter @xala/backoffice build
rsync -avz apps/backoffice/dist/ root@72.61.23.56:/var/www/digilist/backoffice/
```

### Check API Status
```bash
ssh root@72.61.23.56 "pm2 status xala-api"
ssh root@72.61.23.56 "pm2 logs xala-api --lines 50"
```

### Test API Health
```bash
curl https://api.digilist.no/health
```

---

## 🔍 Debugging

### Check Nginx Process
```bash
ssh root@72.61.23.56 "ps aux | grep nginx"
```

### Check Listening Ports
```bash
ssh root@72.61.23.56 "netstat -tulpn | grep nginx"
```

### View Nginx Master Config
```bash
ssh root@72.61.23.56 "cat /etc/nginx/nginx.conf"
```

### Check for Config Syntax Errors
```bash
ssh root@72.61.23.56 "nginx -t 2>&1"
```

### Test Specific Config File
```bash
ssh root@72.61.23.56 "nginx -t -c /etc/nginx/sites-available/web.digilist.no"
```

---

## 🛠️ Troubleshooting

### Nginx Won't Start
```bash
# Check error logs
ssh root@72.61.23.56 "tail -100 /var/log/nginx/error.log"

# Check systemd journal
ssh root@72.61.23.56 "journalctl -u nginx -n 50"

# Verify config
ssh root@72.61.23.56 "nginx -t"
```

### SSL Certificate Issues
```bash
# Check certificate files exist
ssh root@72.61.23.56 "ls -la /etc/letsencrypt/live/your-domain.digilist.no/"

# Check certificate expiry
ssh root@72.61.23.56 "openssl x509 -in /etc/letsencrypt/live/api.digilist.no/cert.pem -noout -dates"

# Re-obtain certificate
ssh root@72.61.23.56 "certbot certonly --force-renewal -d your-domain.digilist.no"
```

### Port Already in Use
```bash
# Find what's using port 443
ssh root@72.61.23.56 "lsof -i :443"

# Kill process if needed
ssh root@72.61.23.56 "kill -9 <PID>"
```

### CSP Blocking Resources
```bash
# Check browser console for violations
# Update CSP in nginx config
ssh root@72.61.23.56 "nano /etc/nginx/sites-available/your-site.conf"

# Add domain to connect-src:
# connect-src 'self' https://api.digilist.no https://new-domain.com;

# Reload nginx
ssh root@72.61.23.56 "nginx -t && systemctl reload nginx"
```

---

## 📊 Monitoring

### Check Disk Space
```bash
ssh root@72.61.23.56 "df -h"
```

### Check Log Sizes
```bash
ssh root@72.61.23.56 "du -sh /var/log/nginx/*"
```

### Monitor Real-Time Requests
```bash
ssh root@72.61.23.56 "tail -f /var/log/nginx/access.log"
```

### Count Requests by Status Code
```bash
ssh root@72.61.23.56 "awk '{print \$9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn"
```

### Top IPs Accessing Site
```bash
ssh root@72.61.23.56 "awk '{print \$1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -10"
```

---

## 🔄 Backup & Restore

### Backup Nginx Configs
```bash
ssh root@72.61.23.56 "tar -czf nginx-backup-$(date +%Y%m%d).tar.gz /etc/nginx/"
scp root@72.61.23.56:~/nginx-backup-*.tar.gz ./backups/
```

### Backup SSL Certificates
```bash
ssh root@72.61.23.56 "tar -czf letsencrypt-backup-$(date +%Y%m%d).tar.gz /etc/letsencrypt/"
scp root@72.61.23.56:~/letsencrypt-backup-*.tar.gz ./backups/
```

### Restore Config
```bash
scp ./backups/nginx-backup-YYYYMMDD.tar.gz root@72.61.23.56:~/
ssh root@72.61.23.56 "tar -xzf nginx-backup-YYYYMMDD.tar.gz -C /"
ssh root@72.61.23.56 "nginx -t && systemctl reload nginx"
```

---

## 🎯 Performance Tuning

### Check Worker Processes
```bash
ssh root@72.61.23.56 "ps aux | grep 'nginx: worker' | wc -l"
```

### View Current Connections
```bash
ssh root@72.61.23.56 "ss -s"
```

### Check Nginx Status Page (if enabled)
```bash
curl http://localhost/nginx_status
```

### Enable Gzip Compression
```bash
ssh root@72.61.23.56
# Edit nginx.conf
nano /etc/nginx/nginx.conf
# Ensure these lines are uncommented:
# gzip on;
# gzip_vary on;
# gzip_comp_level 6;
nginx -t && systemctl reload nginx
```

---

## 📝 Quick Config Templates

### Add New Domain
```bash
ssh root@72.61.23.56
cat > /etc/nginx/sites-available/new-domain.digilist.no << 'EOF'
server {
    listen 80;
    server_name new-domain.digilist.no;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name new-domain.digilist.no;

    ssl_certificate /etc/letsencrypt/live/new-domain.digilist.no/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/new-domain.digilist.no/privkey.pem;

    root /var/www/digilist/new-app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

ln -s /etc/nginx/sites-available/new-domain.digilist.no /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### Add Reverse Proxy
```nginx
location /api {
    proxy_pass http://localhost:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### Add Rate Limiting
```nginx
# In http block
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# In location block
location /api {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://localhost:4000;
}
```

---

## 🔐 Security Best Practices

### Update SSL Ciphers
```bash
ssh root@72.61.23.56 "nano /etc/nginx/nginx.conf"
# Find and update:
# ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:...';
```

### Enable HTTP/2
```nginx
listen 443 ssl http2;  # Ensure http2 is present
```

### Hide Nginx Version
```nginx
server_tokens off;  # Should be in all configs
```

### Set Client Upload Limit
```nginx
client_max_body_size 10M;  # Adjust as needed
```

---

## 📱 Quick Contact

**Server:** 72.61.23.56
**SSH:** `ssh root@72.61.23.56`
**Nginx Config:** `/etc/nginx/`
**SSL Certs:** `/etc/letsencrypt/`
**Web Root:** `/var/www/digilist/`
**API Root:** `/var/www/digilist-api/`

---

**Last Updated:** 2026-01-15
