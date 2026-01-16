# Deployment Script Updates - Multi-App Configuration

## Summary
Updated the deployment scripts to support deployment of all applications in the monorepo, including the newly added SaaS Admin and Tenant Admin applications.

## Applications Configured

| Application | Directory | Domain | Remote Path |
|-------------|-----------|--------|-------------|
| **Web** | `apps/web` | `web-test.digilist.no` | `/var/www/digilist/web` |
| **Backoffice** | `apps/backoffice` | `backoffice-test.digilist.no` | `/var/www/digilist/backoffice` |
| **Minside** | `apps/minside` | `minside-test.digilist.no` | `/var/www/digilist/minside` |
| **SaaS Admin** | `apps/saas-admin` | `saas-admin.digilist.no` | `/var/www/digilist/saas-admin` |
| **Tenant Admin** | `apps/tenant-admin` | `tenant-admin.digilist.no` | `/var/www/digilist/tenant-admin` |

## Files Updated

### 1. `scripts/deploy-config.sh`
Added configuration variables for the new applications:

```bash
# New subdomain mappings
export SAAS_ADMIN_SUBDOMAIN="saas-admin"
export TENANT_ADMIN_SUBDOMAIN="tenant-admin"

# New remote paths
export SAAS_ADMIN_REMOTE_PATH="${REMOTE_BASE}/saas-admin"
export TENANT_ADMIN_REMOTE_PATH="${REMOTE_BASE}/tenant-admin"

# New build output directories
export SAAS_ADMIN_DIST="apps/saas-admin/dist"
export TENANT_ADMIN_DIST="apps/tenant-admin/dist"
```

### 2. `scripts/deploy.sh`
Enhanced the deployment script with:

- Updated usage documentation
- Added `saas-admin` and `tenant-admin` to safety checks (duplicate configs, theme files, cache clearing)
- Created `deploy_saas_admin()` function
- Created `deploy_tenant_admin()` function
- Updated `all` command to deploy all 5 applications
- Added verification checks for the new domains
- Updated help text and output messages

## Usage

### Deploy Individual Apps

```bash
# Deploy only the web app
./scripts/deploy.sh web

# Deploy only SaaS Admin
./scripts/deploy.sh saas-admin

# Deploy only Tenant Admin
./scripts/deploy.sh tenant-admin
```

### Deploy All Apps

```bash
# Deploy all 5 applications at once
./scripts/deploy.sh all
```

### What the Script Does

For each application, the deployment script:

1. **Pre-flight Checks**
   - Checks for duplicate Vite config files
   - Ensures theme CSS files are in public folders
   - Clears build caches

2. **Build**
   - Creates production `.env.production` file
   - Runs `pnpm build` for the app
   - Validates no circular dependencies

3. **Deploy**
   - Creates remote directory on VPS
   - Syncs files using rsync over SSH
   - Verifies the deployed site is accessible

4. **Verification**
   - Tests that the URL returns a successful response
   - Reports deployment status

## Next Steps

After updating the deployment scripts, you'll need to:

### 1. Configure DNS Records
Add A records for the new subdomains pointing to your VPS IP (`72.61.23.56`):

```
saas-admin.digilist.no    → 72.61.23.56
tenant-admin.digilist.no  → 72.61.23.56
```

### 2. Configure Nginx
Add server blocks for the new applications in your Nginx configuration:

```nginx
# SaaS Admin
server {
    listen 80;
    listen [::]:80;
    server_name saas-admin.digilist.no;
    
    root /var/www/digilist/saas-admin;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Tenant Admin
server {
    listen 80;
    listen [::]:80;
    server_name tenant-admin.digilist.no;
    
    root /var/www/digilist/tenant-admin;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. Setup SSL Certificates
Run the SSL setup script for the new domains:

```bash
./scripts/setup-ssl.sh
```

Or manually with certbot:

```bash
sudo certbot --nginx -d saas-admin.digilist.no
sudo certbot --nginx -d tenant-admin.digilist.no
```

### 4. Deploy the Applications

```bash
# Deploy all apps including the new ones
./scripts/deploy.sh all

# Or deploy individually
./scripts/deploy.sh saas-admin
./scripts/deploy.sh tenant-admin
```

## Verification

After deployment, verify each application is accessible:

- ✅ https://web-test.digilist.no
- ✅ https://backoffice-test.digilist.no
- ✅ https://minside-test.digilist.no
- ✅ https://saas-admin.digilist.no
- ✅ https://tenant-admin.digilist.no

## Notes

- All applications deploy to `/var/www/digilist/{app-name}/`
- The web app uses `web-test` as subdomain (not production `web`)
- SaaS Admin and Tenant Admin use production-style domains (no `-test` suffix)
- The deployment script automatically handles theme files and environment variables for all apps
