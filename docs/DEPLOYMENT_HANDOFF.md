# CSP Headers Deployment Handoff

**Date:** 2026-01-14
**Task:** 018-implement-content-security-policy-csp-headers
**Status:** Configuration Ready for Deployment

---

## Executive Summary

✅ **Configuration Complete** - CSP headers have been successfully implemented in `scripts/nginx-subdomains.conf`
⏳ **Deployment Pending** - Configuration must be deployed to production servers and nginx reloaded
🎯 **Objective** - Add Content-Security-Policy headers to all three Digilist subdomains for XSS protection and SOC2/OWASP ASVS compliance

---

## Verification Completed (Development)

### ✅ Configuration File Status

**File:** `scripts/nginx-subdomains.conf`

**CSP Headers Present:**
- Line 22: web-test.digilist.no server block
- Line 48: backoffice-test.digilist.no server block
- Line 73: minside-test.digilist.no server block

**CSP Policy:**
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; connect-src 'self' https://api.digilist.no wss://api.digilist.no; img-src 'self' data: https:; frame-ancestors 'self'; base-uri 'self'; form-action 'self'
```

**Deprecated Header Removed:**
- ✅ X-XSS-Protection removed from all server blocks

**Other Security Headers Intact:**
- ✅ X-Frame-Options: SAMEORIGIN
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy: strict-origin-when-cross-origin

---

## Deployment Required

### Current Production Status

**Last Verified:** 2026-01-14 (multiple checks)

All three domains currently return **basic headers only**:
- ❌ Content-Security-Policy: **MISSING**
- ❌ X-Frame-Options: **MISSING**
- ❌ X-Content-Type-Options: **MISSING**
- ❌ Referrer-Policy: **MISSING**

**Root Cause:** Updated nginx configuration exists in repository but has not been deployed to production servers.

---

## Deployment Instructions

### Prerequisites

- SSH access to production server
- sudo privileges for nginx operations
- Access to `/home/digilist/domains/` directory structure

### Step-by-Step Deployment

#### 1. Backup Current Configuration

```bash
# SSH to production server
ssh digilist@<server-ip>

# Backup existing nginx configuration
sudo cp /etc/nginx/sites-available/digilist /etc/nginx/sites-available/digilist.backup.$(date +%Y%m%d-%H%M%S)
```

#### 2. Deploy New Configuration

```bash
# Navigate to repository (adjust path as needed)
cd /path/to/xala-digdir-monorepo

# Pull latest changes
git pull origin main

# Copy updated configuration to nginx directory
sudo cp scripts/nginx-subdomains.conf /etc/nginx/sites-available/digilist

# Or if using a different path structure:
# sudo cp scripts/nginx-subdomains.conf /etc/nginx/conf.d/digilist.conf
```

#### 3. Verify Nginx Syntax

```bash
# Test nginx configuration syntax
sudo nginx -t
```

**Expected Output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

If syntax errors occur, review the configuration and fix before proceeding.

#### 4. Apply Configuration

```bash
# Reload nginx (graceful, no downtime)
sudo systemctl reload nginx

# Alternative (if reload doesn't work):
# sudo systemctl restart nginx
```

#### 5. Verify Deployment

**Check nginx status:**
```bash
sudo systemctl status nginx
```

**Verify headers are present:**
```bash
# Check web-test
curl -I https://web-test.digilist.no | grep -i content-security-policy

# Check backoffice-test
curl -I https://backoffice-test.digilist.no | grep -i content-security-policy

# Check minside-test
curl -I https://minside-test.digilist.no | grep -i content-security-policy
```

**Expected Output (each domain):**
```
content-security-policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; connect-src 'self' https://api.digilist.no wss://api.digilist.no; img-src 'self' data: https:; frame-ancestors 'self'; base-uri 'self'; form-action 'self'
```

---

## Post-Deployment Verification Checklist

### Server-Side Checks

- [ ] nginx syntax test passes (`nginx -t`)
- [ ] nginx service reloaded successfully
- [ ] nginx service status is active/running
- [ ] No errors in nginx error log (`/var/log/nginx/error.log`)

### Header Verification

- [ ] **web-test.digilist.no**
  - [ ] Content-Security-Policy header present
  - [ ] X-Frame-Options present
  - [ ] X-Content-Type-Options present
  - [ ] Referrer-Policy present
  - [ ] X-XSS-Protection removed

- [ ] **backoffice-test.digilist.no**
  - [ ] Content-Security-Policy header present
  - [ ] X-Frame-Options present
  - [ ] X-Content-Type-Options present
  - [ ] Referrer-Policy present
  - [ ] X-XSS-Protection removed

- [ ] **minside-test.digilist.no**
  - [ ] Content-Security-Policy header present
  - [ ] X-Frame-Options present
  - [ ] X-Content-Type-Options present
  - [ ] Referrer-Policy present
  - [ ] X-XSS-Protection removed

### Browser Verification

Test each domain in a web browser:

- [ ] **web-test.digilist.no**
  - [ ] Page loads correctly
  - [ ] No CSP violations in DevTools Console (F12 → Console)
  - [ ] Google Fonts load correctly
  - [ ] API calls succeed (Network tab)
  - [ ] WebSocket connection works (if applicable)

- [ ] **backoffice-test.digilist.no**
  - [ ] Page loads correctly
  - [ ] No CSP violations in DevTools Console
  - [ ] Google Fonts load correctly
  - [ ] Administrative functions work

- [ ] **minside-test.digilist.no**
  - [ ] Page loads correctly
  - [ ] No CSP violations in DevTools Console
  - [ ] Google Fonts load correctly
  - [ ] User dashboard functions work

---

## Troubleshooting

### Issue: CSP Violations in Browser Console

**Symptom:** Console shows "Refused to load... because it violates the following Content Security Policy directive"

**Solutions:**

1. **Blocked external resource** - If a legitimate resource is blocked, update the CSP policy to whitelist the domain
2. **Inline scripts** - If inline scripts are blocked, consider moving to external files or using nonces
3. **Inline styles** - Already allowed via 'unsafe-inline' for Vite HMR and Designsystemet

### Issue: Google Fonts Not Loading

**Check:**
- Verify `fonts.googleapis.com` and `fonts.gstatic.com` are in CSP policy
- Check browser console for CSP violations
- Verify network connectivity to Google Fonts

### Issue: API Calls Failing

**Check:**
- Verify `api.digilist.no` is in `connect-src` directive
- Check browser console for CSP violations related to fetch/XHR
- Verify API server is accessible

### Issue: WebSocket Connection Fails

**Check:**
- Verify `wss://api.digilist.no` is in `connect-src` directive
- Check browser console for CSP violations related to WebSocket
- Verify WebSocket server is accessible

### Issue: Nginx Fails to Reload

**Check:**
```bash
# Check nginx error log
sudo tail -f /var/log/nginx/error.log

# Verify configuration syntax
sudo nginx -t

# Check nginx service status
sudo systemctl status nginx
```

**Common Causes:**
- Syntax error in configuration file
- File permissions incorrect
- Port already in use
- SSL certificate issues (if using HTTPS)

---

## Rollback Procedure

If issues occur after deployment:

```bash
# Restore backup configuration
sudo cp /etc/nginx/sites-available/digilist.backup.YYYYMMDD-HHMMSS /etc/nginx/sites-available/digilist

# Test syntax
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Verify rollback successful
curl -I https://web-test.digilist.no
```

---

## Security and Compliance Notes

### Compliance Requirements Met

✅ **SOC2 Compliance** - CSP provides defense-in-depth against XSS attacks
✅ **OWASP ASVS** - Implements content security policy as recommended for secure applications
✅ **Defense in Depth** - Multiple layers of XSS protection (CSP + input validation + output encoding)

### Policy Rationale

**'unsafe-inline' for style-src:**
- Required for Vite Hot Module Replacement (HMR) during development
- Required for Designsystemet dynamic style injection
- Acceptable risk: inline styles are less dangerous than inline scripts
- Alternative: Implement nonces (future enhancement)

**https: wildcard for img-src:**
- Allows images from any HTTPS source (common for user-generated content, CDNs)
- More secure than 'unsafe-inline' or wildcard
- Blocks HTTP images (mixed content protection)

**External Resources Whitelisted:**
- `fonts.googleapis.com` - Google Fonts CSS
- `fonts.gstatic.com` - Google Fonts files
- `api.digilist.no` - Digilist API
- `wss://api.digilist.no` - WebSocket real-time communication

### Future Enhancements

Consider implementing:
- CSP nonces for inline styles (remove 'unsafe-inline')
- CSP reporting endpoint (monitor violations)
- Stricter img-src policy (if image sources are known)
- Content-Security-Policy-Report-Only mode for testing

---

## Documentation References

**CSP Documentation:**
- `docs/security/content-security-policy.md` - Comprehensive CSP documentation (506 lines)
- Includes detailed directive explanations, testing instructions, and troubleshooting guide

**Configuration File:**
- `scripts/nginx-subdomains.conf` - Nginx configuration with CSP headers

**Verification Reports:**
- `deployment-verification-report.md` - Previous verification attempts and findings

---

## Deployment Sign-Off

### Pre-Deployment Checklist

- [x] Configuration file verified correct
- [x] CSP headers present in all server blocks
- [x] Deprecated X-XSS-Protection removed
- [x] All required CSP directives included
- [x] External resources properly whitelisted
- [x] Documentation complete
- [ ] **Nginx configuration deployed to production**
- [ ] **Nginx service reloaded**
- [ ] **Headers verified in production**

### Deployment Record

**Deployed By:** ___________________________
**Date/Time:** ___________________________
**Deployment Method:** [ ] Manual [ ] Automated
**Verification Completed:** [ ] Yes [ ] No
**Issues Encountered:** ___________________________
**Resolution:** ___________________________

---

## Contact Information

**Technical Owner:** Infrastructure Team
**Documentation:** `/docs/security/content-security-policy.md`
**Support:** #infrastructure (Slack)

---

**Status:** Ready for Production Deployment
**Priority:** High (Security Enhancement)
**Risk Level:** Low (Permissive policy with proper whitelisting)
**Estimated Downtime:** None (graceful reload)
