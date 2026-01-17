# i18n Localization Violations Summary
**Date:** 2026-01-17
**Scanned:** Minside + Backoffice apps

## Executive Summary

Total violations found: **1,542 issues**
- Minside: 311 issues (93 files)
- Backoffice: 1,231 issues (192 files)

## Critical Files (Top 10 by issue count)

| File | App | Issues | Priority |
|------|-----|--------|----------|
| `Sidebar.tsx` | Backoffice | 67 | 🔴 CRITICAL |
| `AddressesTab.tsx` | Minside | 27 | 🔴 HIGH |
| `preferences.tsx` | Minside | 23 | 🔴 HIGH |
| (Additional files) | Both | 1,425+ | 🟡 MEDIUM |

## Violation Types

1. **Hardcoded JSX Text** - Text directly in JSX elements
2. **Hardcoded Props** - label, placeholder, aria-label with literal strings
3. **Hardcoded Object Values** - Navigation items, form options
4. **Missing t() Import** - Files with hardcoded text but no useT() hook

## Critical Findings

### App Name Hardcoded
**File:** `apps/backoffice/src/components/layout/Sidebar.tsx:416`
```tsx
<img src={logoUrl} alt="Digilist" /> // ❌ Hardcoded
```

### Navigation Items Hardcoded
**File:** `apps/backoffice/src/components/layout/Sidebar.tsx`
All navigation items use hardcoded Norwegian strings:
- "Dashboard", "Oversikt og statistikk"
- "Bookinger", "Forespørsler og reservasjoner"
- "Kalender", "Visuell oversikt"
- Etc. (60+ hardcoded navigation strings)

### Form Labels Hardcoded
**File:** `apps/minside/src/features/settings/components/AddressesTab.tsx`
- "Gateadresse", "Poststed", "Postnummer"
- Country names: "Norge", "Sverige", "Danmark", "Finland"

## Recommended Fix Strategy

### Phase 1: Critical (Week 1)
1. Fix Sidebar.tsx - App name and navigation
2. Fix AddressesTab.tsx - Form labels
3. Fix preferences.tsx - Theme and language selectors

### Phase 2: High Priority (Week 2)
4. Fix all remaining Backoffice files (170+ files)
5. Fix all remaining Minside files (90+ files)

### Phase 3: Validation (Week 3)
6. Run i18n scanner
7. Verify 0 violations
8. Test language switching (Norwegian ↔ English)

## Action Items

- [ ] Create i18n keys for all navigation items
- [ ] Create i18n keys for all form labels
- [ ] Update Sidebar to use t() for all text
- [ ] Update all form components to use t()
- [ ] Add missing useT() imports
- [ ] Re-run scanner to verify compliance

## Tools Available

```bash
# Scan specific app
node scripts/scan-i18n.js apps/backoffice/src

# Scan specific file
node scripts/scan-i18n.js apps/backoffice/src/components/layout/Sidebar.tsx
```

