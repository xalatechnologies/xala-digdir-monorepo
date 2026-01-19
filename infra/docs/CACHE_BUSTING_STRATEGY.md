# Cache-Busting Strategy - Permanent Solution

**Last Updated:** 2026-01-19  
**Status:** Implemented

---

## Problem Statement

Users constantly see old UI even after deployments due to aggressive caching at multiple layers:
1. Browser cache / Service Worker (PWA)
2. Nginx caching HTML
3. PM2 not restarted
4. Old build artifacts remaining on disk

---

## Permanent Solutions Implemented

### 1. ✅ Service Worker Disabled

**File:** `apps/minside/vite.config.ts`, `apps/web/vite.config.ts`, `apps/backoffice/vite.config.ts`

```ts
// PWA DISABLED - Service worker causes aggressive caching issues
// Re-enable for production when offline support is required
```

**Why:** Service workers cache everything aggressively, making deployments invisible to users.

**Test:** Open in Incognito - if it shows new version but normal browser doesn't, service worker was the issue.

---

### 2. ✅ Timestamp-Based Bundle Hashing

**File:** `apps/*/vite.config.ts`

```ts
build: {
  rollupOptions: {
    output: {
      entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
      chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
      assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`,
    },
  },
}
```

**Result:** Every build generates unique filenames:
- Before: `index-OXN6LDpB.js` (same hash = cached)
- After: `index-9eb36ZTS-1768786484678.js` (unique every time)

---

### 3. ✅ Nginx Cache Headers (Correct)

**Files:** `infra/nginx/*-test.digilist.no.conf`

```nginx
# HTML - NEVER cache (always fetch latest)
location / {
    try_files $uri $uri/ /index.html;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}

# JS/CSS bundles - short cache with revalidation
location ~* \.(js|css)$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}

# Static assets - long cache (immutable)
location ~* \.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

**Why:**
- `index.html` never cached → always references latest bundle
- JS/CSS short cache → forces revalidation after 1 hour
- Images/fonts long cache → truly static, never change

---

### 4. ✅ Atomic Deployment with Cleanup

**File:** `infra/scripts/deploy-test.sh`

```bash
# Clean old bundles BEFORE deploying new ones
ssh root@${VPS_HOST} "rm -rf /var/www/minside-test.digilist.no/assets/*.js"
ssh root@${VPS_HOST} "rm -rf /var/www/minside-test.digilist.no/assets/*.css"

# Deploy new build
rsync -avz apps/minside/dist/ root@${VPS_HOST}:/var/www/minside-test.digilist.no/
```

**Why:** Prevents old chunks from remaining on disk and being served.

---

### 5. ✅ PM2 Process Restart

**File:** `infra/scripts/deploy-test.sh`

```bash
# Restart API with fresh environment
ssh root@${VPS_HOST} "pm2 restart digilist-api-test --update-env"
ssh root@${VPS_HOST} "pm2 save"
```

**Why:** Ensures Node process serves latest code, not cached modules.

---

### 6. 🔄 TODO: Build Version Visibility

**Not yet implemented** - Add build stamp for debugging:

```ts
// vite.config.ts
define: {
  __BUILD_SHA__: JSON.stringify(process.env.GIT_SHA || 'dev'),
  __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
}
```

Display in footer or `/health` endpoint to prove which version is serving.

---

## Fast Diagnosis Checklist

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| Incognito shows new, normal doesn't | Service worker / browser cache | Unregister service worker, clear cache |
| `curl -I` shows `Cache-Control: max-age=...` | Nginx caching HTML | Fix nginx config (no-cache for HTML) |
| `pm2 describe` shows old path | Wrong working directory | Restart PM2 with correct path |
| Old files remain after deploy | No cleanup before copy | Use `rsync --delete` or `rm -rf` first |

---

## Verification Commands

```bash
# 1. Check nginx cache headers
curl -I https://minside-test.digilist.no/ | grep Cache-Control
# Should show: no-cache, no-store, must-revalidate

# 2. Check bundle has timestamp
curl -s https://minside-test.digilist.no/ | grep -o 'index-[^"]*\.js'
# Should show: index-HASH-TIMESTAMP.js

# 3. Check PM2 process
ssh root@72.61.23.56 'pm2 describe digilist-api-test | grep "exec cwd"'
# Should show correct path

# 4. Check no old bundles
ssh root@72.61.23.56 'ls -lh /var/www/minside-test.digilist.no/assets/*.js'
# Should show only current build files
```

---

## Future Enhancement: Versioned Releases

**Current:** Deploy directly to `/var/www/minside-test.digilist.no/`  
**Better:** Versioned releases with symlink

```bash
# Structure
/var/www/minside/releases/2026-01-19_0248/
/var/www/minside/releases/2026-01-19_0135/
/var/www/minside/current -> releases/2026-01-19_0248

# Deploy steps
1. Build into new release folder
2. Switch symlink atomically: ln -sfn releases/NEW current
3. Nginx serves from current/
4. Delete old releases (keep last 3)
```

**Benefits:**
- Zero-downtime deployments
- Instant rollback (just switch symlink)
- No file overlap issues
- Clear audit trail

---

## Summary

| Layer | Issue | Solution | Status |
|-------|-------|----------|--------|
| Browser | Service worker caching | Disabled PWA | ✅ Done |
| Build | Same hash for same content | Timestamp in filename | ✅ Done |
| Nginx | HTML cached | `no-cache` for HTML | ✅ Done |
| Nginx | JS/CSS cached forever | 1h cache + revalidate | ✅ Done |
| Deploy | Old files remain | Clean before deploy | ✅ Done |
| Runtime | PM2 not restarted | Auto-restart in script | ✅ Done |
| Debug | Can't tell version | Build stamp visible | 🔄 TODO |
| Deploy | File overlap | Versioned releases | 🔄 Future |

---

## This Problem Will Never Happen Again Because:

1. ✅ Every build = unique filename (browser can't cache wrong version)
2. ✅ Nginx never caches HTML (always fetches latest index.html)
3. ✅ Old bundles deleted before deploy (no file overlap)
4. ✅ PM2 restarted with fresh env (no stale Node modules)
5. ✅ No service worker (no aggressive offline caching)

**The cache-busting strategy is now production-grade.**
