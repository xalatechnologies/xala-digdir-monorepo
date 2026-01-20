# 🧪 Navigation Testing Checklist

**Test Environment:** https://api.digilist.no  
**Date:** 2026-01-18  
**Status:** BankID Login Enabled ✅

---

## 🔐 Authentication Testing

### Demo Login (All Frontends)
- [ ] **Web** (https://web-test.digilist.no) - Demo token login works
- [ ] **MinSide** (https://minside-test.digilist.no) - Demo token login works
- [ ] **Backoffice** (https://backoffice-test.digilist.no) - Demo token login works

### BankID Login (NEW - Just Enabled)
- [ ] **Web** - BankID option appears in login screen
- [ ] **MinSide** - BankID option appears in login screen
- [ ] **Backoffice** - BankID option appears in login screen
- [ ] **Test BankID credentials** from image work correctly

### Demo Users Available
| Role | Token | Vipps | BankID National ID |
|------|-------|-------|-------------------|
| Bruker | `demo-user-token` | 95303914 | 15860771346 |
| Admin | `demo-admin-token` | 93279034 | 30916326773 |
| Saksbehandler | `demo-case-handler-token` | 48637228 | 06881271913 |
| Organisasjon | `demo-org-token` | 40825303 | 19860324957 |
| Aktør Admin | `demo-aktar-admin-token` | 91138813 | 03852358504 |
| Aktør Utleier | `demo-aktar-utleier-token` | 98393410 | 13891199915 |
| Aktør Saksbehandler | `demo-aktar-saksbehandler-token` | 47030508 | 16837147593 |

---

## 📱 **BACKOFFICE** Navigation Testing
**URL:** https://backoffice-test.digilist.no  
**Login with:** `demo-admin-token`

### Overview Section
- [ ] `/` - **Dashboard** - Loads without errors
  - Check: Statistics cards display
  - Check: Charts render correctly
  - Check: No console errors

### Work Section
- [ ] `/bookings` - **Bookings** (Badge: 20)
  - Check: Booking list loads
  - Check: Filters work
  - Check: Can view booking details
- [ ] `/calendar` - **Calendar**
  - Check: Calendar view renders
  - Check: Events display
  - Check: Date navigation works

### Communication Section
- [ ] `/messages` - **Messages** (Badge: 3)
  - Check: Message list loads
  - Check: Can read messages
  - Check: No errors

### Economy Section
- [ ] `/economy/invoices` - **Invoices**
  - Check: Invoice list displays
  - Check: Can view invoice details

### Reports Section
- [ ] `/reports` - **Reports**
  - Check: Report options display
  - Check: Can generate reports

### Help Section
- [ ] `/help` - **Help**
  - Check: Help content loads
  - Check: Search works

### Organization Section
- [ ] `/blocks` - **Blocks**
  - Check: Blocks management interface loads

### Administration Section
- [ ] `/rental-objects` - **Rental Objects**
  - Check: Rental objects list loads
  - Check: Can view object details
  - Check: Images display correctly (130+ seed images)
- [ ] `/seasons` - **Seasons**
  - Check: Seasons list loads
  - Check: Can manage seasons

### Users and Organizations Section
- [ ] `/organizations` - **Organizations**
  - Check: Organization list loads
  - Check: Can view org details
- [ ] `/users` - **Users**
  - Check: User list loads
  - Check: Can view user profiles

### Case Handler Section
- [ ] `/work-queue` - **Work Queue**
  - Check: Queue items display
  - Check: Can process items
- [ ] `/season-applications` - **Season Applications**
  - Check: Applications list loads
  - Check: Can review applications
- [ ] `/allocation-planner` - **Allocation Planner**
  - Check: Planner interface loads
  - Check: Calendar functions work
- [ ] `/decision-forms` - **Decision Forms**
  - Check: Forms list displays
  - Check: Can create/edit forms
- [ ] `/audit-timeline` - **Audit Timeline**
  - Check: Timeline loads
  - Check: Events display chronologically

### Admin Section
- [ ] `/pricing-rules` - **Pricing Rules**
  - Check: Rules list loads
  - Check: Can manage rules

### Tenant Section
- [ ] `/tenant/features` - **Features**
  - Check: Feature flags display
  - Check: Can toggle features
- [ ] `/tenant/settings` - **Platform Settings**
  - Check: Settings form loads
  - Check: Can update settings
- [ ] `/tenant/branding` - **Branding**
  - Check: Branding options display
  - Check: Can upload logo/colors
- [ ] `/tenant/audit-log` - **System Log**
  - Check: Audit log loads
  - Check: Can filter logs

### System Section
- [ ] `/gdpr-requests` - **GDPR Requests** (Badge: count)
  - Check: Requests list loads
  - Check: Can process requests
- [ ] `/reviews/moderation` - **Reviews**
  - Check: Reviews list loads
  - Check: Can moderate reviews
- [ ] `/settings` - **Settings**
  - Check: System settings load
  - Check: Can update configuration

---

## 👤 **MINSIDE** Navigation Testing
**URL:** https://minside-test.digilist.no  
**Login with:** `demo-user-token`

### Personal Context
- [ ] `/` - **Dashboard**
  - Check: Personal dashboard loads
  - Check: Widgets display correctly

### My Activity Section
- [ ] `/bookings` - **My Bookings**
  - Check: User's bookings display
  - Check: Can view booking details
- [ ] `/calendar` - **My Calendar**
  - Check: Personal calendar loads
  - Check: Events show correctly
- [ ] `/seasons` - **Seasons**
  - Check: Season rentals display
  - Check: Can apply for seasons
- [ ] `/messages` - **Messages**
  - Check: Messages load
  - Check: Can send/receive
- [ ] `/billing` - **Billing**
  - Check: Billing history loads
  - Check: Payment methods display
- [ ] `/notifications` - **Notifications** (Badge: 2)
  - Check: Notifications list loads
  - Check: Can mark as read

### Account Section
- [ ] `/settings` - **Settings**
  - Check: User settings load
  - Check: Can update profile
- [ ] `/preferences` - **Preferences**
  - Check: Preferences form loads
  - Check: Can save preferences
- [ ] `/help` - **Help**
  - Check: Help content displays

### Organization Context (Switch to Org Mode)
- [ ] `/org` - **Organization Dashboard**
  - Check: Org dashboard loads
  - Check: Different from personal dashboard
- [ ] `/org/bookings` - **Org Bookings**
  - Check: Organization bookings display
- [ ] `/org/invoices` - **Org Invoices**
  - Check: Invoices list loads
- [ ] `/org/members` - **Org Members**
  - Check: Member list displays
  - Check: Can manage members
- [ ] `/org/season-rental` - **Season Rental**
  - Check: Season applications load
- [ ] `/org/notifications` - **Org Notifications**
  - Check: Org notifications display
- [ ] `/org/settings` - **Org Settings**
  - Check: Settings form loads
- [ ] `/org/activity` - **Org Activity**
  - Check: Activity log displays

---

## 🌐 **WEB** (Public Frontend) Testing
**URL:** https://web-test.digilist.no

### Public Pages
- [ ] `/` - **Home**
  - Check: Landing page loads
  - Check: Hero section displays
  - Check: Featured listings show
- [ ] `/listings` - **Browse Listings**
  - Check: Listing grid loads
  - Check: 70 rental objects with images display
  - Check: Filters work
  - Check: Search works
- [ ] `/listing/[id]` - **Listing Details**
  - Check: Detail page loads
  - Check: Images carousel works
  - Check: Booking form displays
- [ ] `/about` - **About**
  - Check: About page loads
- [ ] `/contact` - **Contact**
  - Check: Contact form displays

---

## ✅ Critical Checks for ALL Pages

### Performance
- [ ] Page loads in < 3 seconds
- [ ] No JavaScript errors in console
- [ ] No 404 errors for assets
- [ ] Images load correctly

### Functionality
- [ ] Navigation menu works
- [ ] Sidebar items are clickable
- [ ] Active state highlights correctly
- [ ] Back button works
- [ ] Breadcrumbs work (if present)

### Responsive Design
- [ ] Desktop view (1920x1080)
- [ ] Tablet view (768x1024)
- [ ] Mobile view (375x667)

### Accessibility
- [ ] Tab navigation works
- [ ] Screen reader compatible
- [ ] Proper heading hierarchy
- [ ] Color contrast meets WCAG

---

## 🐛 Error Reporting Template

```
**Page:** [URL]
**User Role:** [demo-admin-token / demo-user-token / etc.]
**Error Type:** [404 / 500 / Console Error / UI Issue]
**Description:** [What went wrong]
**Steps to Reproduce:**
1. 
2. 
3. 
**Expected:** [What should happen]
**Actual:** [What actually happened]
**Console Errors:** [Copy from browser console]
**Screenshot:** [If applicable]
```

---

## 📊 Testing Progress

**Backoffice:** ☐ 0/35 routes tested  
**MinSide:** ☐ 0/16 routes tested  
**Web:** ☐ 0/5 routes tested  

**Total:** ☐ 0/56 routes tested

---

## 🚀 Quick Start Testing

1. **Open Backoffice:** https://backoffice-test.digilist.no
2. **Login:** Use `demo-admin-token`
3. **Test Each Sidebar Item:** Click through systematically
4. **Check Console:** F12 → Console tab (should be clean)
5. **Report Issues:** Use error template above

---

## 📝 Notes

- All 9 demo users are seeded and ready
- BankID login is now enabled (test with credentials from image)
- 70 rental objects with 130+ real images are seeded
- Storage files deployed to `/var/www/digilist-storage/uploads`
- API health check passing
- All frontends accessible via HTTPS

---

**Happy Testing!** 🎉
