# Manual Testing Guide - Data Page Components

## Overview

This guide provides step-by-step instructions for manually testing the reusable dashboard components in SaaS Admin and Tenant Admin apps.

## Prerequisites

1. Start the development servers:
```bash
# Terminal 1: SaaS Admin
cd apps/saas-admin && pnpm dev
# Runs on http://localhost:5176

# Terminal 2: Tenant Admin  
cd apps/tenant-admin && pnpm dev
# Runs on http://localhost:5177
```

2. Ensure you have test data or can create test tenants/plans/users

## Test Scenarios

### 1. Status Tab Filtering and Counts

#### SaaS Admin - Tenants Page

**Steps:**
1. Navigate to http://localhost:5176/tenants
2. **Verify Status Tabs Display:**
   - [ ] See tabs: "All", "Active", "Inactive", "Suspended", "Pending"
   - [ ] Each tab shows a count badge (e.g., "All (10)")
   - [ ] Active tab is highlighted with colored border

3. **Test Tab Filtering:**
   - [ ] Click "Active" tab
   - [ ] Verify only active tenants are shown
   - [ ] Check that API is called with `status: 'active'`
   - [ ] Click "All" tab
   - [ ] Verify all tenants are shown again

4. **Test Count Updates:**
   - [ ] Note the count on "Active" tab (e.g., "5")
   - [ ] Create or suspend an active tenant
   - [ ] Verify count updates automatically

**Expected Results:**
- Tabs filter data correctly
- Counts match actual data
- Active tab is visually distinct
- Smooth transitions between tabs

#### SaaS Admin - Plans Page

**Steps:**
1. Navigate to http://localhost:5176/plans
2. Follow same steps as Tenants page
3. Test with "Active", "Inactive", "Deprecated" statuses

### 2. Filter Chips Removal and Reset

#### SaaS Admin - Tenants Page

**Steps:**
1. Navigate to http://localhost:5176/tenants
2. **Activate Filter:**
   - [ ] Click "Active" status tab
   - [ ] Verify filter chip appears below tabs
   - [ ] Chip shows: "Status: Active" with X button

3. **Remove Individual Filter:**
   - [ ] Click X button on filter chip
   - [ ] Verify filter is removed
   - [ ] Verify "All" tab becomes active
   - [ ] Verify all tenants are shown

4. **Test Multiple Filters:**
   - [ ] Click "Active" tab
   - [ ] Enter search query in search box
   - [ ] Verify two filter chips appear:
     - "Status: Active"
     - "Search: [query]"
   - [ ] Click X on "Status: Active" chip
   - [ ] Verify only search filter remains

5. **Test Reset All:**
   - [ ] Activate multiple filters (status + search)
   - [ ] Click "Reset all" button
   - [ ] Verify all filters cleared
   - [ ] Verify "All" tab active
   - [ ] Verify search box is empty

**Expected Results:**
- Chips appear when filters active
- Individual removal works
- Reset all clears everything
- UI updates smoothly

### 3. Empty States with Different Scenarios

#### Scenario A: No Data, No Filters

**Steps:**
1. Navigate to http://localhost:5176/tenants
2. Delete all tenants (or use empty database)
3. **Verify Empty State:**
   - [ ] See BuildingIcon icon
   - [ ] See title: "No tenants" (or translated)
   - [ ] See description: "Create first tenant" (or translated)
   - [ ] See "Create Tenant" button
   - [ ] Button navigates to create page when clicked

#### Scenario B: No Data, Filters Active

**Steps:**
1. Navigate to http://localhost:5176/tenants
2. Click "Active" tab (assuming no active tenants)
3. **Verify Empty State:**
   - [ ] See BuildingIcon icon
   - [ ] See title: "No tenants"
   - [ ] See description: "Try changing the search criteria" (or translated)
   - [ ] NO "Create Tenant" button shown

#### Scenario C: Search with No Results

**Steps:**
1. Navigate to http://localhost:5176/tenants
2. Enter search query that matches no tenants
3. **Verify Empty State:**
   - [ ] Shows "try different filters" message
   - [ ] Filter chips show active search filter

#### Tenant Admin - Users Page

**Steps:**
1. Navigate to http://localhost:5177/users
2. Test same scenarios as above
3. Verify UsersIcon is used instead of BuildingIcon

### 4. Responsive Behavior on Mobile

#### Test on Mobile Viewport (375px)

**Steps:**
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
3. Select "iPhone 12 Pro" or set custom width: 375px
4. Navigate to http://localhost:5176/tenants

**Status Tabs:**
- [ ] Tabs are horizontally scrollable
- [ ] Can swipe/scroll to see all tabs
- [ ] Active tab remains visible
- [ ] Counts are still visible

**Filter Chips:**
- [ ] Chips wrap to multiple lines
- [ ] Chips remain clickable
- [ ] Reset button is accessible

**Data Page Header:**
- [ ] Title and count badge stack vertically or adapt
- [ ] Actions button is accessible
- [ ] Layout doesn't break

**Empty State:**
- [ ] Icon, title, description stack vertically
- [ ] Buttons are full-width or appropriately sized
- [ ] Content is readable

**Test Breakpoints:**
- [ ] 375px (iPhone)
- [ ] 768px (Tablet)
- [ ] 1024px (Desktop)

### 5. i18n Translations Verification

#### Test Norwegian (nb) Locale

**Steps:**
1. Set browser language to Norwegian (nb-NO)
2. Or check if app has language switcher
3. Navigate to http://localhost:5176/tenants

**Verify Translations:**
- [ ] Status tabs: "Alle", "Aktiv", "Inaktiv", "Suspender", "Venter"
- [ ] Filter chips: "Aktive filter:", "Nullstill alle"
- [ ] Empty state: "Ingen leietakere", "Prøv å endre søkekriteriene"
- [ ] Buttons: "Opprett leietaker", "Fjern valg"

#### Test English (en) Locale

**Steps:**
1. Set browser language to English (en-US)
2. Navigate to http://localhost:5176/tenants

**Verify Translations:**
- [ ] Status tabs: "All", "Active", "Inactive", "Suspended", "Pending"
- [ ] Filter chips: "Active filters:", "Reset all"
- [ ] Empty state: "No tenants", "Try changing the search criteria"
- [ ] Buttons: "Create Tenant", "Clear selection"

#### Verify Translation Keys Exist

**Check Files:**
```bash
# Norwegian translations
grep -E "dataPage\.|bulkActions\.|filterChips\." packages/i18n/src/locales/nb.ts

# English translations  
grep -E "dataPage\.|bulkActions\.|filterChips\." packages/i18n/src/locales/en.ts
```

**Expected Keys:**
- `dataPage.emptyState.noData`
- `dataPage.emptyState.tryDifferentFilters`
- `dataPage.bulkActions.selected`
- `dataPage.bulkActions.clearSelection`
- `dataPage.filterChips.activeFilters`
- `dataPage.filterChips.resetAll`

## Browser Testing

### Test Across Browsers

**Chrome/Edge:**
- [ ] All features work correctly
- [ ] No console errors
- [ ] Smooth animations

**Firefox:**
- [ ] Status tabs scroll correctly
- [ ] Filter chips display properly
- [ ] Empty states render correctly

**Safari:**
- [ ] Mobile viewport works
- [ ] Touch interactions work
- [ ] No layout issues

## Performance Testing

### Test Loading Performance

**Steps:**
1. Open DevTools → Network tab
2. Navigate to tenants page
3. **Verify:**
   - [ ] Page loads in < 2 seconds
   - [ ] Status tabs render quickly
   - [ ] No layout shift (CLS)
   - [ ] Smooth interactions

### Test with Large Datasets

**Steps:**
1. Create 100+ tenants
2. Navigate to tenants page
3. **Verify:**
   - [ ] Status tabs show correct counts
   - [ ] Filtering is fast (< 500ms)
   - [ ] No performance degradation
   - [ ] Smooth scrolling

## Accessibility Testing

### Keyboard Navigation

**Steps:**
1. Navigate to page
2. Press Tab to navigate
3. **Verify:**
   - [ ] Can tab to status tabs
   - [ ] Can activate tabs with Enter/Space
   - [ ] Can tab to filter chips
   - [ ] Can remove chips with Enter/Space
   - [ ] Focus indicators are visible

### Screen Reader

**Steps:**
1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Navigate through page
3. **Verify:**
   - [ ] Status tabs announced correctly
   - [ ] Counts announced (e.g., "Active, 5 items")
   - [ ] Filter chips announced with remove action
   - [ ] Empty states announced clearly

## Edge Cases

### Test Edge Cases

1. **Zero Counts:**
   - [ ] Status tab with 0 count still shows "0"
   - [ ] Empty state shows when all tabs have 0

2. **Very Long Labels:**
   - [ ] Status tab labels wrap or truncate
   - [ ] Filter chip labels handle long text

3. **Rapid Tab Switching:**
   - [ ] Click multiple tabs quickly
   - [ ] Verify no race conditions
   - [ ] Verify correct data shown

4. **Network Errors:**
   - [ ] Simulate network failure
   - [ ] Verify error handling
   - [ ] Verify empty state or error message

## Test Results Template

```
Date: [DATE]
Tester: [NAME]
Browser: [BROWSER] [VERSION]
Viewport: [WIDTH]x[HEIGHT]

Status Tabs: ✅ PASS / ❌ FAIL
- Counts display correctly: ✅
- Filtering works: ✅
- Active state visible: ✅
Notes: [ANY ISSUES]

Filter Chips: ✅ PASS / ❌ FAIL
- Display when active: ✅
- Remove individual: ✅
- Reset all: ✅
Notes: [ANY ISSUES]

Empty States: ✅ PASS / ❌ FAIL
- No data scenario: ✅
- Filters active scenario: ✅
- Create button appears: ✅
Notes: [ANY ISSUES]

Responsive: ✅ PASS / ❌ FAIL
- Mobile (375px): ✅
- Tablet (768px): ✅
- Desktop (1024px+): ✅
Notes: [ANY ISSUES]

i18n: ✅ PASS / ❌ FAIL
- Norwegian translations: ✅
- English translations: ✅
Notes: [ANY ISSUES]

Overall: ✅ PASS / ❌ FAIL
```

## Reporting Issues

If you find issues:

1. **Document:**
   - Screenshot or video
   - Browser and version
   - Viewport size
   - Steps to reproduce
   - Expected vs actual behavior

2. **Check Console:**
   - Open DevTools → Console
   - Look for errors or warnings
   - Include in bug report

3. **Check Network:**
   - Open DevTools → Network
   - Verify API calls are correct
   - Check response data

## Success Criteria

✅ **All tests pass if:**
- Status tabs filter correctly with accurate counts
- Filter chips appear and can be removed
- Empty states show appropriate messages
- Layout works on mobile (375px+)
- All text is translated (no hardcoded strings)
- No console errors
- Smooth interactions and animations
- Accessible via keyboard and screen reader
