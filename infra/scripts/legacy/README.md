# Deployment Scripts

## Overview

These scripts handle building and deploying the Xala/Digilist platform to the production VPS.

## Server Directory Structure

**IMPORTANT:** Understand this structure to avoid deployment mistakes.

```
/var/www/
├── digilist/
│   ├── main/           → https://digilist.no (landing page from booking-brilliance project)
│   ├── web/            → https://web-test.digilist.no (React app for public)
│   ├── backoffice/     → https://backoffice-test.digilist.no (Admin dashboard)
│   └── minside/        → https://minside-test.digilist.no (User dashboard)
└── digilist-api/
    └── dist/           → https://api.digilist.no (Node.js API)
```

### Why This Structure?

- **Landing page** (`/var/www/digilist/main`) is a separate static site (booking-brilliance)
- **Test apps** are under `/var/www/digilist/` for organization
- **API** is separate in `/var/www/digilist-api/` for isolation

## Quick Start

### 1. Configure Deployment

Edit `scripts/deploy-config.sh` with your server details:

```bash
cp scripts/deploy-config.example.sh scripts/deploy-config.sh
vim scripts/deploy-config.sh
```

**Current Configuration:**
```bash
HOSTINGER_HOST="72.61.23.56"
HOSTINGER_USER="root"

# Remote paths (DO NOT CHANGE - matches nginx config)
WEB_REMOTE_PATH="/var/www/digilist/web"
BACKOFFICE_REMOTE_PATH="/var/www/digilist/backoffice"
MINSIDE_REMOTE_PATH="/var/www/digilist/minside"
```

### 2. Deploy Test Apps

Deploy individual apps:
```bash
# Deploy single app
./scripts/deploy.sh web
./scripts/deploy.sh backoffice
./scripts/deploy.sh minside

# Deploy all apps at once
./scripts/deploy.sh all
```

The script will:
1. ✅ Run pre-flight checks (duplicate configs, theme files)
2. ✅ Build the app(s) with production environment
3. ✅ Deploy to correct server directory
4. ✅ Verify deployment is accessible

## Common Issues

### Issue 1: Deployed to Wrong Directory

**Symptom:** Site shows 500 error or old content

**Cause:** Files deployed to wrong directory (e.g., `/var/www/web-test/` instead of `/var/www/digilist/web`)

**Fix:**
```bash
# Check nginx config to confirm correct paths
ssh root@72.61.23.56 "grep 'root /var/www' /etc/nginx/sites-enabled/digilist-test.conf"

# Move files to correct location if needed
ssh root@72.61.23.56 "rsync -a /var/www/wrong-path/ /var/www/digilist/correct-path/"
```

### Issue 2: Landing Page Overwritten

**Symptom:** https://digilist.no shows React app instead of landing page

**Cause:** Accidentally deployed web app to `/var/www/digilist/main/`

**Fix:**
```bash
# Redeploy landing page from booking-brilliance project
cd /Volumes/Laravel/Loveable/booking-brilliance/
rsync -avz --delete dist/ root@72.61.23.56:/var/www/digilist/main/
```

### Issue 3: SSL Certificate Errors

**Fix:**
```bash
./scripts/setup-ssl.sh
```

## Manual Deployment (Emergency)

If the deployment script fails, you can deploy manually:

```bash
# 1. Build locally
cd /path/to/xala-digdir-monorepo
pnpm --filter @xala/web build

# 2. Deploy manually
rsync -avz --delete apps/web/dist/ root@72.61.23.56:/var/www/digilist/web/

# 3. Verify
curl -I https://web-test.digilist.no
```

## Deployment Checklist

Before deploying:
- [ ] Run tests: `pnpm test`
- [ ] Check for build warnings: `pnpm build`
- [ ] Commit and push changes
- [ ] Backup production (if needed)

After deploying:
- [ ] Verify URL is accessible
- [ ] Check browser console for errors
- [ ] Test key functionality
- [ ] Monitor error logs: `ssh root@72.61.23.56 "tail -f /var/log/nginx/error.log"`

## Environment Variables

Production `.env.production` is auto-generated during build:

```env
VITE_API_URL=https://api.digilist.no
VITE_WS_URL=wss://api.digilist.no/ws/events
VITE_TENANT_ID=f47ac10b-58cc-4372-a567-0e02b2c3d479
```

## URLs Reference

| Environment | App | URL | Server Path |
|-------------|-----|-----|-------------|
| Production | Landing | https://digilist.no | `/var/www/digilist/main` |
| Production | API | https://api.digilist.no | `/var/www/digilist-api/dist` |
| Test | Web | https://web-test.digilist.no | `/var/www/digilist/web` |
| Test | Backoffice | https://backoffice-test.digilist.no | `/var/www/digilist/backoffice` |
| Test | Minside | https://minside-test.digilist.no | `/var/www/digilist/minside` |

## Related Scripts

- `deploy.sh` - Main deployment script (use this!)
- `deploy-config.sh` - Configuration file
- `setup-ssl.sh` - SSL certificate setup
- `server-setup.sh` - Initial server configuration

## Troubleshooting

### Check Nginx Configuration
```bash
ssh root@72.61.23.56 "nginx -t"
```

### Check File Permissions
```bash
ssh root@72.61.23.56 "ls -la /var/www/digilist/"
```

### Check Nginx Error Log
```bash
ssh root@72.61.23.56 "tail -50 /var/log/nginx/error.log"
```

### Restart Nginx
```bash
ssh root@72.61.23.56 "systemctl restart nginx"
```

## Need Help?

1. Check this README
2. Review nginx config: `/etc/nginx/sites-enabled/digilist-test.conf`
3. Check deployment logs
4. Verify server directory structure matches expectations
