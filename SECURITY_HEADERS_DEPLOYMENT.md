# Security Headers Deployment Guide

**Date:** 2026-01-18  
**Status:** Ready to Deploy

---

## What Was Fixed

Added comprehensive security headers to protect against common web vulnerabilities:

1. **X-Frame-Options: DENY** - Prevents clickjacking attacks
2. **X-Content-Type-Options: nosniff** - Prevents MIME-sniffing
3. **X-XSS-Protection: 1; mode=block** - XSS protection for legacy browsers
4. **Referrer-Policy: strict-origin-when-cross-origin** - Controls referrer information
5. **Content-Security-Policy** - Prevents content injection attacks

---

## Changes Made

### 1. API Security Headers ✅
**File:** `apps/api/src/adapters/fastify.adapter.ts`

Added `onSend` hook to apply security headers to all API responses:

```typescript
// Security headers middleware
app.addHook('onSend', async (request, reply) => {
  reply.header('X-Frame-Options', 'DENY');
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-XSS-Protection', '1; mode=block');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  reply.header('Content-Security-Policy', "default-src 'self'");
});
```

**Status:** ✅ Committed to `demo-v3` branch

---

### 2. Nginx Configuration Template ✅
**File:** `infra/nginx-security-headers.conf`

Created reusable Nginx configuration for frontend apps:

```nginx
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; ..." always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

**Status:** ✅ Created and ready for deployment

---

## Deployment Steps

### Step 1: Deploy API Changes

```bash
# From repository root
./infra/scripts/deploy-test.sh
```

This will:
- Build the API with new security headers
- Deploy to test environment
- Restart API service
- Run automated tests

### Step 2: Configure Nginx (On VPS)

SSH into the VPS and add security headers to Nginx configuration:

```bash
# SSH to VPS
ssh root@72.61.23.56

# Create security headers file
cat > /etc/nginx/security-headers.conf << 'EOF'
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
EOF

# Update each frontend server block
# For web-test.digilist.no
nano /etc/nginx/sites-available/web-test.digilist.no

# Add this line inside the server block:
# include /etc/nginx/security-headers.conf;

# Repeat for:
# - minside-test.digilist.no
# - backoffice-test.digilist.no

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

### Step 3: Verify Security Headers

```bash
# Test API
curl -I https://api.digilist.no/health | grep -i "x-frame\|x-content\|x-xss"

# Test Web
curl -I https://web-test.digilist.no | grep -i "x-frame\|x-content\|x-xss"

# Test MinSide
curl -I https://minside-test.digilist.no | grep -i "x-frame\|x-content\|x-xss"

# Test Backoffice
curl -I https://backoffice-test.digilist.no | grep -i "x-frame\|x-content\|x-xss"
```

**Expected Output:**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
```

---

## Verification Checklist

After deployment, verify:

- [ ] API returns security headers on all endpoints
- [ ] Web frontend returns security headers
- [ ] MinSide frontend returns security headers
- [ ] Backoffice frontend returns security headers
- [ ] HSTS header still present (should already be there)
- [ ] No errors in browser console
- [ ] All apps still function correctly

---

## Testing Commands

```bash
# Quick test all apps
for app in api web-test minside-test backoffice-test; do
  if [ "$app" = "api" ]; then
    URL="https://api.digilist.no/health"
  else
    URL="https://$app.digilist.no"
  fi
  echo "Testing: $app"
  curl -I "$URL" | grep -i "x-frame\|x-content\|x-xss\|strict-transport"
  echo ""
done
```

---

## Rollback Plan

If issues occur after deployment:

### API Rollback
```bash
# SSH to VPS
ssh root@72.61.23.56

# Revert to previous commit
cd /home/digilist/digilist-platform
git checkout HEAD~1 apps/api/src/adapters/fastify.adapter.ts

# Rebuild and restart
pnpm --filter @digilist/api build
pm2 restart digilist-api-test
```

### Nginx Rollback
```bash
# Remove security headers include
nano /etc/nginx/sites-available/web-test.digilist.no
# Comment out: # include /etc/nginx/security-headers.conf;

nginx -t
systemctl reload nginx
```

---

## Security Headers Explained

### X-Frame-Options: DENY
**Purpose:** Prevents clickjacking attacks  
**Effect:** Page cannot be embedded in `<iframe>`, `<frame>`, or `<object>`  
**Impact:** Protects users from UI redressing attacks

### X-Content-Type-Options: nosniff
**Purpose:** Prevents MIME-sniffing  
**Effect:** Browser must respect declared Content-Type  
**Impact:** Prevents execution of malicious scripts disguised as other file types

### X-XSS-Protection: 1; mode=block
**Purpose:** XSS protection (legacy)  
**Effect:** Enables browser's built-in XSS filter  
**Impact:** Blocks page rendering if XSS attack detected (older browsers)

### Referrer-Policy: strict-origin-when-cross-origin
**Purpose:** Controls referrer information  
**Effect:** Only sends origin on cross-origin requests  
**Impact:** Protects user privacy and prevents information leakage

### Content-Security-Policy
**Purpose:** Prevents content injection  
**Effect:** Restricts sources for scripts, styles, images, etc.  
**Impact:** Mitigates XSS, data injection, and other code injection attacks

---

## Next Steps

1. ✅ Deploy API changes
2. ⏳ Configure Nginx on VPS
3. ⏳ Verify all security headers
4. ⏳ Run comprehensive tests
5. ⏳ Update test results document

---

## References

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security)
- [Security Headers Scanner](https://securityheaders.com/)

---

**Ready to deploy!** 🚀
