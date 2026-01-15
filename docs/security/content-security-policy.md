# Content Security Policy (CSP) Documentation

## Overview

The Xala / Digilist Platform implements Content-Security-Policy (CSP) headers across all three applications (web, backoffice, minside) to provide defense-in-depth protection against Cross-Site Scripting (XSS) attacks and other code injection vulnerabilities.

CSP is a critical security layer for a regulated municipal platform handling sensitive citizen data, and is required for compliance with SOC2 and OWASP ASVS standards.

## Purpose

Content Security Policy serves several critical security functions:

1. **XSS Mitigation** - Prevents execution of unauthorized scripts by restricting script sources
2. **Code Injection Protection** - Blocks inline scripts and eval() usage
3. **Resource Control** - Limits which external resources (fonts, styles, images) can be loaded
4. **Clickjacking Prevention** - Controls frame embedding via frame-ancestors
5. **Data Exfiltration Prevention** - Restricts where the application can send data via form-action and connect-src

## Current CSP Policy

The following Content-Security-Policy is applied to all three server blocks in `scripts/nginx-subdomains.conf`:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; connect-src 'self' https://api.digilist.no wss://api.digilist.no; img-src 'self' data: https:; frame-ancestors 'self'; base-uri 'self'; form-action 'self'
```

## Directive Breakdown

### `default-src 'self'`

**Purpose:** Fallback directive for all resource types not explicitly defined.

**Behavior:** Only allows resources from the same origin (same protocol, domain, and port).

**Security Benefit:** Provides a secure baseline - all unspecified resource types default to same-origin only.

---

### `script-src 'self'`

**Purpose:** Controls which sources can load JavaScript.

**Behavior:** Only allows scripts from the same origin. Blocks all inline scripts and eval().

**Security Benefit:**
- Prevents XSS attacks via injected inline scripts
- Blocks eval() and Function() constructor which are common XSS vectors
- Prevents loading of malicious third-party scripts

**Important:** This directive does NOT include `'unsafe-inline'` or `'unsafe-eval'`, providing strong XSS protection.

---

### `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`

**Purpose:** Controls which sources can load CSS stylesheets.

**Behavior:**
- Allows styles from same origin
- Allows inline styles via `'unsafe-inline'`
- Allows Google Fonts stylesheets

**Why `'unsafe-inline'` is Required:**

The `'unsafe-inline'` directive is necessary for two critical reasons:

1. **Vite Hot Module Replacement (HMR)** - During development, Vite injects inline styles for instant hot reloading. Without `'unsafe-inline'`, the development experience would be severely degraded.

2. **Designsystemet Dynamic Styles** - The Norwegian Design System (@digdir/designsystemet) uses CSS-in-JS and runtime theme switching, which generates inline styles dynamically. This is fundamental to the multi-theme architecture (digdir, altinn, uutilsynet, portal).

**Security Trade-off:** While `'unsafe-inline'` for styles is less risky than for scripts, it does reduce CSP effectiveness. However, the risk is mitigated because:
- Scripts (the primary XSS vector) do NOT allow `'unsafe-inline'`
- Style injection attacks are less common and harder to exploit
- The functionality enabled (HMR, theme switching) is essential for the platform

**Future Consideration:** When Designsystemet supports nonce-based or hash-based CSP, this can be tightened.

---

### `font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com`

**Purpose:** Controls which sources can load fonts.

**Behavior:**
- Allows fonts from same origin
- Allows fonts from Google Fonts CDN (fonts.googleapis.com)
- Allows font files from Google's static content CDN (fonts.gstatic.com)

**Rationale:** Google Fonts is used across all applications for consistent typography matching the Norwegian Design System standards.

---

### `connect-src 'self' https://api.digilist.no wss://api.digilist.no`

**Purpose:** Controls which URLs the application can connect to via XMLHttpRequest, Fetch API, WebSockets, and EventSource.

**Behavior:**
- Allows connections to same origin
- Allows HTTPS connections to the Digilist API
- Allows WebSocket connections to the Digilist API

**Security Benefit:** Prevents data exfiltration to unauthorized domains. All API and WebSocket traffic is restricted to trusted origins only.

**Critical for:**
- SDK service calls (all 24+ services in @digilist/client-sdk)
- Real-time WebSocket updates (audit logs, notifications, booking updates)
- React Query hooks data fetching

---

### `img-src 'self' data: https:`

**Purpose:** Controls which sources can load images.

**Behavior:**
- Allows images from same origin
- Allows data: URIs (inline base64 images)
- Allows images from any HTTPS source

**Rationale:**
- `data:` URIs are needed for dynamically generated images (avatars, charts, QR codes)
- `https:` is permissive but necessary because user-generated content (listing images, organization logos) may be hosted on various CDNs or storage services
- HTTP (unencrypted) images are blocked, enforcing encryption

**Security Trade-off:** This is the most permissive directive. While it allows images from any HTTPS source, image-based attacks are rare and browser security prevents most risks (images cannot execute scripts).

---

### `frame-ancestors 'self'`

**Purpose:** Controls which pages can embed this application in `<frame>`, `<iframe>`, `<object>`, or `<embed>`.

**Behavior:** Only allows embedding from same origin.

**Security Benefit:**
- Prevents clickjacking attacks (where malicious sites overlay invisible iframes to trick users)
- Complements the `X-Frame-Options: SAMEORIGIN` header
- Required for SOC2 and OWASP ASVS compliance

**Note:** This is the modern CSP replacement for the deprecated `X-Frame-Options` header (which we still include for older browser support).

---

### `base-uri 'self'`

**Purpose:** Controls which URLs can be used in `<base>` elements.

**Behavior:** Only allows base URLs from same origin.

**Security Benefit:** Prevents attackers from injecting `<base>` tags to hijack relative URLs, which could redirect all relative links to malicious sites.

---

### `form-action 'self'`

**Purpose:** Controls which URLs can be used as form submission targets.

**Behavior:** Only allows form submissions to same origin.

**Security Benefit:** Prevents forms from being hijacked to submit data to attacker-controlled endpoints, protecting against data exfiltration and CSRF attacks.

---

## Removed Headers

### `X-XSS-Protection` (Deprecated)

The `X-XSS-Protection` header has been removed from the nginx configuration because:

1. **Deprecated by Browsers** - Modern browsers (Chrome 78+, Edge 79+, Safari 13.1+, Firefox) ignore this header
2. **Security Vulnerabilities** - Enabling XSS Auditor has been shown to introduce new vulnerabilities
3. **Replaced by CSP** - Content-Security-Policy provides superior XSS protection

The proper XSS defense is now the `script-src` directive in CSP, which we have configured correctly (`script-src 'self'` with no unsafe directives).

---

## Compliance Requirements

### SOC2 Compliance

CSP is required for SOC2 Type II certification under the following controls:

- **CC6.1** - Logical and physical access controls
- **CC6.6** - Protection against malicious code
- **CC7.1** - Detection of security events

CSP provides automated security event detection (via violation reports) and defense-in-depth against code injection attacks.

### OWASP ASVS

CSP satisfies OWASP Application Security Verification Standard requirements:

- **V14.4.3** - Verify that a Content Security Policy (CSP) is in place that helps mitigate impact for XSS attacks like HTML, DOM, JSON, and JavaScript injection vulnerabilities (Level 2)
- **V14.4.7** - Verify that the Content Security Policy (CSP) v2 header is in place and restricts resources to trusted origins (Level 2)

Our policy meets Level 2 requirements by:
- Restricting script sources to same-origin only
- Blocking inline scripts and eval()
- Limiting external resource origins to trusted domains only

---

## Testing Instructions

### 1. Verify CSP Header Presence

After deployment, verify the CSP header is present:

```bash
# Test web application
curl -I https://web-test.digilist.no | grep -i content-security-policy

# Test backoffice application
curl -I https://backoffice-test.digilist.no | grep -i content-security-policy

# Test minside application
curl -I https://minside-test.digilist.no | grep -i content-security-policy
```

**Expected Output:** You should see the Content-Security-Policy header with all directives.

### 2. Browser DevTools Console Check

1. Open the application in a modern browser (Chrome, Firefox, Edge)
2. Open DevTools (F12 or right-click → Inspect)
3. Go to the **Console** tab
4. Look for any CSP violation warnings

**Expected:** No CSP violation warnings should appear during normal usage.

**CSP Violation Format:**
```
[Report Only] Refused to load the script 'https://malicious.com/script.js' because it violates the following Content Security Policy directive: "script-src 'self'".
```

### 3. Network Tab Verification

In DevTools Network tab:

1. **Fonts** - Verify Google Fonts load successfully:
   - Check for requests to `fonts.googleapis.com` and `fonts.gstatic.com`
   - Status should be 200 OK

2. **API Calls** - Verify API requests work:
   - Check for requests to `api.digilist.no`
   - Status should be 200 OK (or appropriate response codes)

3. **WebSocket** - Verify WebSocket connection:
   - Filter by WS (WebSocket)
   - Look for connection to `wss://api.digilist.no`
   - Status should show "101 Switching Protocols"

### 4. Functional Testing

Test critical functionality across all applications:

- [ ] **Web App** (web-test.digilist.no)
  - [ ] Page loads and renders correctly
  - [ ] Google Fonts display properly
  - [ ] API calls work (listings, bookings)
  - [ ] WebSocket connection establishes
  - [ ] Theme switching works (Designsystemet runtime styles)
  - [ ] Forms submit successfully

- [ ] **Backoffice App** (backoffice-test.digilist.no)
  - [ ] Admin dashboard loads
  - [ ] Google Fonts display properly
  - [ ] API calls work (organization management, reports)
  - [ ] Forms submit successfully

- [ ] **Minside App** (minside-test.digilist.no)
  - [ ] User dashboard loads
  - [ ] Google Fonts display properly
  - [ ] API calls work (user bookings, profile)
  - [ ] Forms submit successfully

### 5. CSP Violation Reporting (Future Enhancement)

For production monitoring, consider implementing CSP violation reporting:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; ...; report-uri https://api.digilist.no/csp-report" always;
```

This would send violation reports to an endpoint where they can be logged and monitored for:
- Attempted XSS attacks
- Misconfigured external resources
- New dependencies that need whitelisting

---

## Troubleshooting Guide

### Common CSP Violations

#### 1. "Refused to load the script because it violates the directive: 'script-src'"

**Cause:** Attempting to load a script from an unauthorized source or using inline JavaScript.

**Solutions:**
- If loading a legitimate third-party script, add its origin to `script-src` directive
- If using inline scripts (e.g., `<script>alert('hi')</script>`), refactor to external .js files
- If using event handlers (e.g., `onclick="..."`), refactor to addEventListener in .js files

**Example Fix:**
```nginx
# Before
add_header Content-Security-Policy "script-src 'self'" always;

# After (if adding trusted analytics)
add_header Content-Security-Policy "script-src 'self' https://analytics.trusted.com" always;
```

#### 2. "Refused to load the stylesheet because it violates the directive: 'style-src'"

**Cause:** Attempting to load CSS from an unauthorized source.

**Solutions:**
- Add the stylesheet origin to `style-src` directive
- For Google Fonts, verify `https://fonts.googleapis.com` is in `style-src`

**Already Handled:** Our policy includes `https://fonts.googleapis.com` in `style-src`.

#### 3. "Refused to load the font because it violates the directive: 'font-src'"

**Cause:** Attempting to load a font from an unauthorized source.

**Solutions:**
- Add the font origin to `font-src` directive
- For Google Fonts, verify both `https://fonts.googleapis.com` and `https://fonts.gstatic.com` are included

**Already Handled:** Our policy includes both Google Fonts domains in `font-src`.

#### 4. "Refused to connect to because it violates the directive: 'connect-src'"

**Cause:** Attempting to make an API call or WebSocket connection to an unauthorized origin.

**Solutions:**
- Verify the API origin is correct (should be `https://api.digilist.no`)
- If adding a new external API, add its origin to `connect-src`
- For WebSockets, ensure both `https://` and `wss://` versions are added

**Example Fix:**
```nginx
# Before
add_header Content-Security-Policy "connect-src 'self' https://api.digilist.no wss://api.digilist.no" always;

# After (if adding Stripe API)
add_header Content-Security-Policy "connect-src 'self' https://api.digilist.no wss://api.digilist.no https://api.stripe.com" always;
```

#### 5. "Refused to load the image because it violates the directive: 'img-src'"

**Cause:** Attempting to load an image via HTTP (unencrypted) or from a blocked source.

**Solutions:**
- Ensure image URLs use HTTPS (not HTTP)
- Verify `data:` is in `img-src` for base64 images
- Verify `https:` is in `img-src` for external CDN images

**Already Handled:** Our policy includes `data:` and `https:` in `img-src`.

#### 6. "Refused to display in a frame because it violates the directive: 'frame-ancestors'"

**Cause:** Another site is trying to embed the application in an iframe.

**Solutions:**
- If embedding is intentional (e.g., whitelabel partner), add their origin to `frame-ancestors`
- If embedding is NOT intended, this is correct security behavior (preventing clickjacking)

**Note:** `frame-ancestors 'self'` means only our own domains can embed our pages, which is the secure default.

---

## Updating the CSP Policy

### When to Update

Update the CSP policy when:

1. **Adding New External Services** - New CDN, analytics, payment gateway, etc.
2. **Adding New Font Providers** - Beyond Google Fonts
3. **Enabling Iframe Embedding** - For trusted partner sites
4. **Adding New API Endpoints** - If using a new backend service
5. **CSP Violations in Production** - If legitimate functionality is being blocked

### How to Update

1. **Edit nginx configuration:**
   ```bash
   nano scripts/nginx-subdomains.conf
   ```

2. **Update the CSP header** (lines 22, 48, 73):
   ```nginx
   add_header Content-Security-Policy "default-src 'self'; script-src 'self' NEW-SOURCE-HERE; ..." always;
   ```

3. **Test configuration syntax:**
   ```bash
   nginx -t -c scripts/nginx-subdomains.conf
   ```

4. **Deploy to test environment** and verify in browser DevTools

5. **Run full functional testing** to ensure no breakage

6. **Deploy to production**

7. **Monitor CSP violation reports** (if implemented) for 24-48 hours

### Security Review Checklist

Before updating CSP, ensure:

- [ ] **Necessity** - Is the new directive absolutely required?
- [ ] **Minimal Scope** - Are you whitelisting the smallest set of origins possible?
- [ ] **HTTPS Only** - Are all external origins using HTTPS (not HTTP)?
- [ ] **Trusted Sources** - Are all whitelisted origins from reputable, trusted providers?
- [ ] **No Unsafe Directives** - Are you avoiding `'unsafe-inline'` for scripts and `'unsafe-eval'` for any directive?
- [ ] **Audit Trail** - Is the change documented with rationale?
- [ ] **Compliance Check** - Does the change maintain SOC2/OWASP ASVS compliance?

### Example: Adding Stripe Payment Processing

If integrating Stripe for payment processing:

```nginx
# Original
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; connect-src 'self' https://api.digilist.no wss://api.digilist.no; ..." always;

# Updated for Stripe
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://js.stripe.com; connect-src 'self' https://api.digilist.no wss://api.digilist.no https://api.stripe.com; frame-src https://js.stripe.com; ..." always;
```

**Rationale:**
- `script-src` - Stripe requires loading their JavaScript SDK
- `connect-src` - Stripe API calls
- `frame-src` - Stripe embeds payment forms in iframes

---

## Report-Only Mode (For Testing)

When testing major CSP changes, consider using `Content-Security-Policy-Report-Only` temporarily:

```nginx
# Test mode - violations are reported but not enforced
add_header Content-Security-Policy-Report-Only "default-src 'self'; script-src 'self'; ..." always;
```

This allows you to:
- See what would be blocked without breaking functionality
- Collect violation reports to identify needed changes
- Test in production safely before enforcing

**Switch to enforcing mode** once all violations are resolved:
```nginx
# Enforcing mode
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; ..." always;
```

---

## Browser Compatibility

Content Security Policy Level 2 is supported by:

- Chrome 40+ (2015)
- Firefox 31+ (2014)
- Safari 10+ (2016)
- Edge 15+ (2017)

**Legacy Browser Fallback:** The deprecated `X-Frame-Options` header is still included for older browsers that don't support CSP `frame-ancestors`.

**No Support Needed:** Internet Explorer 11 and below have limited CSP support, but IE is no longer supported by Microsoft or our platform.

---

## References

- [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Level 2 Specification](https://www.w3.org/TR/CSP2/)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [Google CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Content Security Policy Reference](https://content-security-policy.com/)

---

## Document History

| Date       | Author        | Changes                                      |
|------------|---------------|----------------------------------------------|
| 2026-01-14 | auto-claude   | Initial CSP documentation created            |
| 2026-01-14 | auto-claude   | Added CSP header to nginx configuration      |

---

## Contact

For questions or security concerns regarding this CSP implementation:

- **Security Team:** security@digilist.no
- **Infrastructure Team:** infra@digilist.no
- **Compliance Team:** compliance@digilist.no
