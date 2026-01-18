# 🧪 Phase 1: Foundation Validation - Testing Guide

**Status:** Ready to Execute  
**Duration:** 1-2 days  
**Environment:** https://api.digilist.no

---

## 🎯 Objectives

1. Verify all navigation routes load without errors
2. Validate authentication flows (Demo + BankID)
3. Check console for JavaScript errors
4. Verify seed data is accessible
5. Validate basic CRUD operations

---

## 📋 Pre-Test Checklist

- [x] Platform deployed to test environment
- [x] BankID login enabled
- [x] 9 demo users seeded
- [x] 70 rental objects with images seeded
- [x] All frontends accessible via HTTPS

---

## 🔐 Test Credentials

### Demo Tokens
```
Admin:              demo-admin-token
Saksbehandler:      demo-case-handler-token
User:               demo-user-token
Organisasjon:       demo-org-token
Aktør Admin:        demo-aktar-admin-token
Aktør Utleier:      demo-aktar-utleier-token
Aktør Saksbehandler: demo-aktar-saksbehandler-token
```

### BankID Credentials
```
Admin:
  National ID: 30916326773
  OTP: otp
  Password: qwer1234

User:
  National ID: 15860771346
  OTP: otp
  Password: qwer1234

Saksbehandler:
  National ID: 06881271913
  OTP: otp
  Password: qwer1234
```

---

## 🧭 Testing Workflow

### Step 1: Backoffice Navigation Testing

**URL:** https://backoffice-test.digilist.no

1. **Login**
   ```
   - Open URL in browser
   - Enter demo token: demo-admin-token
   - Click login
   - Verify redirect to dashboard
   ```

2. **Open Browser Console**
   ```
   - Press F12 (or Cmd+Option+I on Mac)
   - Go to Console tab
   - Clear console (click 🚫 icon)
   ```

3. **Test Each Route Systematically**
   
   For each sidebar item:
   - Click the navigation item
   - Wait for page to load
   - Check console for errors (should be clean)
   - Verify page content displays
   - Take note of any issues
   - Mark as ✓ or ✗ in checklist

4. **Routes to Test** (35 total)
   ```
   ✓ / - Dashboard
   ✓ /bookings - Bookings
   ✓ /calendar - Calendar
   ✓ /messages - Messages
   ✓ /economy/invoices - Invoices
   ✓ /reports - Reports
   ✓ /help - Help
   ✓ /blocks - Blocks
   ✓ /rental-objects - Rental Objects
   ✓ /seasons - Seasons
   ✓ /organizations - Organizations
   ✓ /users - Users
   ✓ /work-queue - Work Queue
   ✓ /season-applications - Season Applications
   ✓ /allocation-planner - Allocation Planner
   ✓ /decision-forms - Decision Forms
   ✓ /audit-timeline - Audit Timeline
   ✓ /pricing-rules - Pricing Rules
   ✓ /tenant/features - Features
   ✓ /tenant/settings - Platform Settings
   ✓ /tenant/branding - Branding
   ✓ /tenant/audit-log - System Log
   ✓ /gdpr-requests - GDPR Requests
   ✓ /reviews/moderation - Reviews
   ✓ /settings - Settings
   ```

### Step 2: MinSide Navigation Testing

**URL:** https://minside-test.digilist.no

1. **Login with User Token**
   ```
   - Open URL
   - Enter: demo-user-token
   - Verify login successful
   ```

2. **Test Personal Context Routes** (10 routes)
   ```
   ✓ / - Dashboard
   ✓ /bookings - My Bookings
   ✓ /calendar - My Calendar
   ✓ /seasons - Seasons
   ✓ /messages - Messages
   ✓ /billing - Billing
   ✓ /notifications - Notifications
   ✓ /settings - Settings
   ✓ /preferences - Preferences
   ✓ /help - Help
   ```

3. **Switch to Organization Context**
   ```
   - Look for context switcher (usually in header/sidebar)
   - Switch to organization mode
   - Verify dashboard changes
   ```

4. **Test Organization Context Routes** (8 routes)
   ```
   ✓ /org - Org Dashboard
   ✓ /org/bookings - Org Bookings
   ✓ /org/invoices - Org Invoices
   ✓ /org/members - Org Members
   ✓ /org/season-rental - Season Rental
   ✓ /org/notifications - Org Notifications
   ✓ /org/settings - Org Settings
   ✓ /org/activity - Org Activity
   ```

### Step 3: Web (Public) Testing

**URL:** https://web-test.digilist.no

1. **Test Public Routes** (5 routes)
   ```
   ✓ / - Home
   ✓ /listings - Browse Listings
   ✓ /listing/[id] - Listing Details (click any listing)
   ✓ /about - About
   ✓ /contact - Contact
   ```

2. **Verify Rental Objects Display**
   ```
   - Go to /listings
   - Verify 70 rental objects visible
   - Check images load correctly
   - Test search/filter functionality
   - Click on a listing to view details
   ```

### Step 4: BankID Login Testing

**Test on Each Frontend:**

1. **Backoffice**
   ```
   - Logout if logged in
   - Look for BankID login option
   - Click BankID
   - Enter: 30916326773 / otp / qwer1234
   - Verify successful login
   ```

2. **MinSide**
   ```
   - Logout
   - BankID login with: 15860771346 / otp / qwer1234
   - Verify login works
   ```

3. **Web**
   ```
   - Logout
   - BankID login with user credentials
   - Verify authentication
   ```

---

## 🐛 Issue Reporting

### When You Find an Error:

1. **Take Screenshot**
2. **Copy Console Errors**
3. **Document Using This Template:**

```markdown
### Issue #X: [Brief Description]

**Severity:** Critical / High / Medium / Low
**Frontend:** Backoffice / MinSide / Web
**Route:** /path/to/route
**User Role:** demo-admin-token / demo-user-token / etc.

**Steps to Reproduce:**
1. Login with [token]
2. Navigate to [route]
3. [Action taken]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Console Errors:**
```
[Paste console errors here]
```

**Screenshot:**
[Attach screenshot]

**Additional Notes:**
[Any other relevant information]
```

---

## ✅ Success Criteria

Phase 1 is complete when:

- [ ] All 56 routes tested
- [ ] All routes load without critical errors
- [ ] Console is clean (no red errors)
- [ ] All authentication methods work
- [ ] Seed data is visible and accessible
- [ ] Images load correctly
- [ ] Basic navigation works smoothly

---

## 📊 Progress Tracking

**Backoffice:** ☐ 0/35 routes tested  
**MinSide:** ☐ 0/16 routes tested  
**Web:** ☐ 0/5 routes tested  
**BankID:** ☐ 0/3 frontends tested  

**Total Progress:** ☐ 0/56 routes tested

---

## 🚀 Quick Start

1. Open https://backoffice-test.digilist.no
2. Login with `demo-admin-token`
3. Open browser console (F12)
4. Start clicking through sidebar items
5. Document any errors found
6. Move to next frontend when complete

---

## 📝 Daily Test Log Template

```markdown
# Test Session - [Date]

**Tester:** [Your Name]
**Duration:** [Start Time] - [End Time]
**Focus:** Phase 1 - Navigation Testing

## Routes Tested Today
- [x] /dashboard - ✓ Working
- [x] /bookings - ✗ Error: [description]
- [ ] /calendar - Not tested yet

## Issues Found
1. [Issue description]
2. [Issue description]

## Notes
- [Any observations]

## Next Session
- Continue with [next routes]
```

---

**Ready to start testing!** 🎯

Open the first URL and begin systematically testing each route.
