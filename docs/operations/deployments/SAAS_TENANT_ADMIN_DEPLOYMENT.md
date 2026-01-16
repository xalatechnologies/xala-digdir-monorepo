# SaaS Admin & Tenant Admin Deployment Report
**Date:** 2026-01-16 18:37 CET  
**Status:** ✅ Successfully Deployed with SSL

## Deployment Summary

Successfully deployed and configured SSL certificates for the new SaaS Admin and Tenant Admin applications.

### Applications Deployed

| Application | Domain | Status | SSL |
|-------------|--------|--------|-----|
| **SaaS Admin** | https://saas-admin.digilist.no | ✅ Live | ✅ Enabled |
| **Tenant Admin** | https://tenant-admin.digilist.no | ✅ Live | ✅ Enabled |

## Steps Completed

### 1. ✅ Nginx Configuration
Created server blocks for both applications:
- `/etc/nginx/sites-available/saas-admin.digilist.no`
- `/etc/nginx/sites-available/tenant-admin.digilist.no`

Both configured with:
- HTTP/2 support
- Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- Gzip compression
- SPA routing (try_files fallback to index.html)

### 2. ✅ Application Build & Deployment
**SaaS Admin Build:**
- Built successfully in 4.43s
- Bundle size: 683.04 kB (main), 1,677.65 kB (mapbox)
- Deployed to `/var/www/digilist/saas-admin`

**Tenant Admin Build:**
- Built successfully in 3.92s
- Bundle size: 665.16 kB (main), 1,677.65 kB (mapbox)
- Deployed to `/var/www/digilist/tenant-admin`

### 3. ✅ SSL Certificate Configuration
Expanded existing Let's Encrypt certificate to include new domains:
- Certificate includes: web-test, backoffice-test, minside-test, **saas-admin**, **tenant-admin**
- Certificate location: `/etc/letsencrypt/live/web-test.digilist.no/`
- Expiration: April 16, 2026
- Auto-renewal: Enabled

Certificate successfully deployed to:
- `/etc/nginx/sites-enabled/saas-admin.digilist.no`
- `/etc/nginx/sites-enabled/tenant-admin.digilist.no`

### 4. ✅ Verification
Both applications are accessible and serving over HTTPS:
```
HTTP/2 200
server: nginx/1.24.0 (Ubuntu)
content-type: text/html
```

## Configuration Updates

### Updated Files
1. **scripts/deploy-config.sh**
   - Added `SAAS_ADMIN_SUBDOMAIN="saas-admin"`
   - Added `TENANT_ADMIN_SUBDOMAIN="tenant-admin"`
   - Added remote paths and dist directories

2. **scripts/deploy.sh**
   - Added `deploy_saas_admin()` function
   - Added `deploy_tenant_admin()` function
   - Updated safety checks to include new apps
   - Updated `all` command to deploy all 5 apps

3. **scripts/setup-ssl.sh**
   - Added saas-admin and tenant-admin to SSL setup
   - Updated to request certificates for all 5 domains

## Access URLs

All applications are now live with SSL:
- ✅ https://web-test.digilist.no
- ✅ https://backoffice-test.digilist.no
- ✅ https://minside-test.digilist.no
- ✅ https://saas-admin.digilist.no (NEW)
- ✅ https://tenant-admin.digilist.no (NEW)

## Future Deployments

To deploy these applications in the future:

```bash
# Deploy individually
./scripts/deploy.sh saas-admin
./scripts/deploy.sh tenant-admin

# Deploy all applications at once
./scripts/deploy.sh all
```

SSL certificates will auto-renew 30 days before expiration via Certbot's scheduled task.

## Notes

- Both applications use the same API endpoint: `https://api.digilist.no`
- Both applications use the same tenant ID: `f47ac10b-58cc-4372-a567-0e02b2c3d479`
- Applications are built with production environment variables
- Theme files are automatically copied during deployment
- Build caches are cleared on each deployment for consistency

## Server Configuration

**Server:** 72.61.23.56  
**Web Server:** nginx/1.24.0 (Ubuntu 24.04.3 LTS)  
**SSL Provider:** Let's Encrypt (Certbot)  
**Document Roots:**
- `/var/www/digilist/saas-admin`
- `/var/www/digilist/tenant-admin`

---
**Deployment completed successfully! 🚀**
