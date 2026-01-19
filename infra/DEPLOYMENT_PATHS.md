# Frontend Deployment Paths - CRITICAL REFERENCE

**Last Updated:** 2026-01-19  
**Status:** ✅ FIXED PERMANENTLY

---

## ⚠️ CRITICAL: Nginx Root Directories

Frontend apps **MUST** be deployed to their nginx-configured root directories:

| App | Nginx Root Directory | Deploy Command |
|-----|---------------------|----------------|
| **Web** | `/var/www/web-test.digilist.no` | `rsync -avz apps/web/dist/ root@72.61.23.56:/var/www/web-test.digilist.no/` |
| **MinSide** | `/var/www/minside-test.digilist.no` | `rsync -avz apps/minside/dist/ root@72.61.23.56:/var/www/minside-test.digilist.no/` |
| **Backoffice** | `/var/www/backoffice-test.digilist.no` | `rsync -avz apps/backoffice/dist/ root@72.61.23.56:/var/www/backoffice-test.digilist.no/` |

---

## 🚨 What Was Wrong (2026-01-19)

### **The Problem:**
- Deployment script was deploying MinSide to `/var/www/digilist/minside/`
- Nginx was configured to serve from `/var/www/minside-test.digilist.no/`
- **Result:** Old cached files served, new deployments ignored

### **Symptoms:**
- Browser loaded old bundle hash (`index-CmYMlpKs.js`)
- New bundle existed but wasn't served (`index-OXN6LDpB.js`)
- Hard refresh didn't help (server-side caching issue)
- Missing translations persisted despite being added

---

## ✅ The Fix

### **1. Updated `deploy-test.sh` (Line 116-118):**

```bash
# OLD (WRONG):
rsync -avz apps/minside/dist/ ${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/apps/minside/dist/

# NEW (CORRECT):
rsync -avz apps/minside/dist/ root@${VPS_HOST}:/var/www/minside-test.digilist.no/
rsync -avz apps/web/dist/ root@${VPS_HOST}:/var/www/web-test.digilist.no/
rsync -avz apps/backoffice/dist/ root@${VPS_HOST}:/var/www/backoffice-test.digilist.no/
```

### **2. Updated `infra/nginx/minside-test.digilist.no.conf` (Line 31):**

```nginx
# OLD (WRONG):
root /var/www/minside;

# NEW (CORRECT):
root /var/www/minside-test.digilist.no;
```

### **3. Fixed SSL Certificate Path (Line 14-15):**

```nginx
# Uses shared certificate (minside-test doesn't have its own cert yet)
ssl_certificate /etc/letsencrypt/live/api.digilist.no-0002/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/api.digilist.no-0002/privkey.pem;
```

---

## 📋 Verification Checklist

After deployment, **ALWAYS** verify:

```bash
# 1. Check files are in correct location
ssh root@72.61.23.56 'ls -lah /var/www/minside-test.digilist.no/assets/ | head -5'

# 2. Check index.html references correct bundle
ssh root@72.61.23.56 'grep "index-" /var/www/minside-test.digilist.no/index.html'

# 3. Verify nginx config
ssh root@72.61.23.56 'grep "root " /etc/nginx/sites-available/minside-test.digilist.no.conf'

# 4. Test in browser (hard refresh: Cmd+Shift+R)
curl -I https://minside-test.digilist.no/
```

---

## 🔧 Quick Deploy Script

Use the dedicated frontend deployment script:

```bash
# Deploy all frontends (recommended)
./infra/scripts/deploy-frontends.sh

# Or deploy individually
rsync -avz apps/minside/dist/ root@72.61.23.56:/var/www/minside-test.digilist.no/
ssh root@72.61.23.56 'nginx -s reload'
```

---

## 🚫 Common Mistakes to Avoid

1. ❌ **Don't deploy to `/var/www/digilist/minside/`** - nginx doesn't serve from there
2. ❌ **Don't use `${DEPLOY_PATH}` for frontends** - that's for API only
3. ❌ **Don't forget to reload nginx** after config changes
4. ❌ **Don't assume hard refresh fixes server-side caching** - check actual files on server

---

## 📚 Related Files

- `infra/scripts/deploy-test.sh` - Main deployment script
- `infra/scripts/deploy-frontends.sh` - Frontend-only deployment
- `infra/nginx/minside-test.digilist.no.conf` - Nginx configuration
- `infra/nginx/web-test.digilist.no.conf` - Web nginx config
- `infra/nginx/backoffice-test.digilist.no.conf` - Backoffice nginx config

---

## 🎯 Key Takeaway

**Frontend apps deploy to domain-specific directories, NOT to `/var/www/digilist/`**

This is now **permanently fixed** in:
- ✅ `deploy-test.sh` (deployment script)
- ✅ `minside-test.digilist.no.conf` (nginx config)
- ✅ `deploy-frontends.sh` (frontend deployment script)

**Never deploy frontends to `/var/www/digilist/` again!**
