# Authentication Manual Test Checklist
**Date:** 2026-01-16
**Deployment:** backoffice-test.digilist.no & minside-test.digilist.no

---

## Critical Fixes Applied

1. **Router Context Error** - FIXED
   - Removed SDK auth guard hooks causing timing issues
   - Session restoration now handled by ProtectedRoute

2. **Login Redirect Loop** - FIXED
   - Changed `/dashboard` to `/` (correct route)
   - Auth callback now redirects to root index route

---

## Backoffice Manual Tests

### Test 1: Unauthenticated Access
**URL:** https://backoffice-test.digilist.no

**Expected Behavior:**
- [x] Page loads without errors
- [ ] NO "useNavigate() Router context" error in console
- [ ] Redirects to `/login` automatically
- [ ] Login page displays with ID-porten button

**How to Verify:**
1. Open browser in incognito/private mode
2. Navigate to https://backoffice-test.digilist.no
3. Open DevTools Console (F12)
4. Check for errors (there should be NONE)
5. Verify you see the login page

---

### Test 2: Direct Login Page Access
**URL:** https://backoffice-test.digilist.no/login

**Expected Behavior:**
- [x] Page loads without errors
- [ ] NO redirect loop (stays on /login)
- [ ] Login page displays correctly
- [ ] ID-porten button is clickable
- [ ] Microsoft button shows "Coming Soon" (disabled)

**How to Verify:**
1. Open https://backoffice-test.digilist.no/login
2. Page should load and stay at /login
3. Should NOT redirect back to /login repeatedly
4. Check console for errors (there should be NONE)

---

### Test 3: ID-porten OAuth Login
**URL:** https://backoffice-test.digilist.no/login

**Expected Behavior:**
- [ ] Click ID-porten button
- [ ] Redirects to ID-porten login page
- [ ] After authentication, redirects back to app
- [ ] Returns to `/` (root/dashboard)
- [ ] User is logged in
- [ ] Dashboard displays

**How to Verify:**
1. Click "Logg inn med ID-porten"
2. Complete ID-porten authentication
3. After callback, verify URL is `https://backoffice-test.digilist.no/`
4. Verify you see the dashboard, not stuck at login

---

### Test 4: Protected Route Access (While Authenticated)
**URL:** https://backoffice-test.digilist.no/rental-objects

**Expected Behavior:**
- [ ] If not logged in, redirects to `/login`
- [ ] After login, redirects back to `/rental-objects`
- [ ] Page displays correctly
- [ ] No console errors

**How to Verify:**
1. While logged in, navigate to /rental-objects
2. Page should load without issues
3. If not logged in, should redirect to login then back after auth

---

### Test 5: Role-Based Access Control
**URL:** https://backoffice-test.digilist.no/users (admin-only)

**Expected Behavior:**
- [ ] Admin users can access
- [ ] Non-admin users see "No access" message
- [ ] No crashes or errors

**How to Verify:**
1. Log in as non-admin user
2. Try to access /users route
3. Should be redirected or show access denied
4. Log in as admin user
5. Should be able to access /users

---

### Test 6: Logout Flow
**URL:** Any page while authenticated

**Expected Behavior:**
- [ ] Click logout
- [ ] Session is cleared
- [ ] Redirects to `/login`
- [ ] Cannot access protected routes without re-authenticating

**How to Verify:**
1. While logged in, click logout
2. Verify redirect to /login
3. Try to access /rental-objects
4. Should redirect back to login

---

## Minside Manual Tests

### Test 7: Minside Unauthenticated Access
**URL:** https://minside-test.digilist.no

**Expected Behavior:**
- [x] Page loads without errors
- [ ] NO "useNavigate() Router context" error
- [ ] Redirects to `/login`
- [ ] Login page displays

**How to Verify:**
1. Open https://minside-test.digilist.no in incognito
2. Check console for errors (should be none)
3. Verify redirect to /login

---

### Test 8: Minside Login Flow
**URL:** https://minside-test.digilist.no/login

**Expected Behavior:**
- [ ] Login page displays
- [ ] ID-porten, Vipps, or other login options available
- [ ] After auth, redirects to dashboard
- [ ] User can access personal data

**How to Verify:**
1. Open /login page
2. Complete authentication
3. Verify redirect to minside dashboard
4. Check user can view bookings

---

## Common Issues to Watch For

### Router Context Error (FIXED)
```
Error: useNavigate() may be used only in the context of a <Router> component.
```
- **Status:** Should be FIXED
- **Test:** Navigate to any URL, check console
- **Expected:** NO errors

### Login Redirect Loop (FIXED)
- **Symptom:** URL constantly switching between /login and /login
- **Status:** Should be FIXED
- **Test:** Go to /login directly
- **Expected:** Stays at /login, no loop

### Dashboard Route Not Found (FIXED)
- **Symptom:** 404 error or blank page after login
- **Status:** Should be FIXED (changed /dashboard to /)
- **Test:** Complete OAuth login
- **Expected:** Redirects to / and shows dashboard

---

## Browser Console Checks

### Expected Console Output (Good)
```
[BACKOFFICE AUTH] User session check:
  Email: user@example.com
  Name: User Name
  API Role: admin
[BACKOFFICE AUTH] Access granted:
  Legacy Role: admin
  Granted Roles: ['admin']
```

### Error Patterns to Watch For (Bad)
```
❌ Error: useNavigate() may be used only in the context of a <Router> component
❌ TypeError: Cannot read properties of undefined
❌ Warning: Maximum update depth exceeded
❌ Error: Too many re-renders
```

---

## E2E Test Summary

### Chromium Tests (Passing)
- ✅ US-001: User can view login button (7.6s)
- ✅ US-002: User can click login button (6.7s)
- ✅ US-004: Dropdown menu options visible (6.7s)
- ✅ SP-001: Session persists across refreshes (7.5s)
- ✅ SP-002: Session loaded from localStorage (2.3s)
- ✅ EC-001: Expired session handled (1.9s)
- ✅ EC-002: OAuth error handled (1.6s)
- ✅ EC-003: Missing cookie handled (1.4s)
- ✅ EC-004: Corrupted localStorage handled (1.0s)

### Tests with Issues
- ❌ SP-003: Session cookie sent with API requests
- ❌ EC-005: Dropdown closes when clicking outside
- ❌ FC-002: Expired flow context notification

---

## Production Verification Steps

1. **Clear all browser data:**
   ```
   - Clear cookies for *.digilist.no
   - Clear localStorage
   - Clear sessionStorage
   - Restart browser
   ```

2. **Test in incognito mode:**
   - Ensures clean state
   - No cached auth tokens
   - Fresh session

3. **Check DevTools Console:**
   - Open F12 before navigating
   - Watch for errors during page load
   - Verify no Router context errors

4. **Check DevTools Network:**
   - Monitor API calls to api.digilist.no
   - Verify session cookies are sent
   - Check for 401/403 errors

5. **Test OAuth Callback:**
   - Watch URL during OAuth flow
   - Should see: login → idporten → callback → dashboard
   - No redirect loops

---

## Rollback Criteria

Rollback if ANY of these occur:
- [ ] Router context error appears in console
- [ ] Login redirect loop occurs
- [ ] Users cannot complete authentication
- [ ] Dashboard doesn't load after login
- [ ] Console shows critical React errors

---

## Sign-off

**Manual Testing Status:**
- [ ] All backoffice tests passed
- [ ] All minside tests passed
- [ ] No console errors observed
- [ ] OAuth flow works end-to-end
- [ ] Session persistence verified

**Tested By:** _________________
**Date:** _________________
**Browser:** Chrome / Firefox / Safari (circle one)
**Notes:**
