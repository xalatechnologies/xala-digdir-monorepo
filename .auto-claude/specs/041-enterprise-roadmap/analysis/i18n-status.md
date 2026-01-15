# Internationalization (i18n) Coverage Status

## Overview

This document analyzes the i18n implementation in the Digilist platform, documenting coverage for Norwegian (nb) and English (en) translations. The analysis covers the `@xala/i18n` package, translation key coverage, and app integration status.

**Analysis Date:** 2026-01-15
**Package:** `@xala/i18n` (packages/i18n)
**Supported Locales:** Norwegian Bokmål (nb), English (en)
**Default Locale:** Norwegian Bokmål (nb)

---

## Current Implementation Summary

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  I18N FLOW                                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  @xala/i18n Package           App Integration                       │
│  ─────────────────           ─────────────────                      │
│                                                                      │
│  I18nProvider ────────────▶ App.tsx (wraps entire app)             │
│      │                                                               │
│      ├── locale state                                                │
│      ├── setLocale()                                                 │
│      └── t() function ────▶ useT() / useI18n() in components       │
│                                                                      │
│  Translations Registry:                                              │
│  ├── nb.ts (Norwegian) ──▶ Primary language (313 keys)             │
│  └── en.ts (English) ────▶ Fallback language (313 keys)            │
│                                                                      │
│  Fallback Strategy: locale → en → key.split('.').pop()             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Package Components

| Component | Location | Status |
|-----------|----------|--------|
| I18nProvider | `packages/i18n/src/context.tsx` | DONE |
| I18nContext | `packages/i18n/src/context.tsx` | DONE |
| useI18n hook | `packages/i18n/src/hooks.ts` | DONE |
| useT hook | `packages/i18n/src/hooks.ts` | DONE |
| useLocale hook | `packages/i18n/src/hooks.ts` | DONE |
| Norwegian translations | `packages/i18n/src/locales/nb.ts` | DONE |
| English translations | `packages/i18n/src/locales/en.ts` | DONE |
| Interpolation utility | `packages/i18n/src/utils.ts` | DONE |
| TypeScript types | `packages/i18n/src/types.ts` | DONE |

---

## Translation Key Coverage

### Summary Statistics

| Metric | Count |
|--------|-------|
| **Total Translation Keys** | 313 |
| **Norwegian (nb) Keys** | 313 |
| **English (en) Keys** | 313 |
| **Coverage Parity** | 100% |
| **Namespaces** | 17 |

### Keys by Namespace

| Namespace | Key Count | Description |
|-----------|-----------|-------------|
| `common.*` | 39 | UI actions, states, common labels |
| `listings.*` | 30 | Listing/resource management |
| `minside.*` | 24 | User dashboard (Min Side) |
| `reports.*` | 23 | Reporting and analytics |
| `bookings.*` | 21 | Booking management |
| `auth.*` | 21 | Authentication and login |
| `dashboard.*` | 20 | Admin dashboard |
| `messages.*` | 18 | Messaging/conversations |
| `organizations.*` | 17 | Organization management |
| `settings.*` | 16 | System/user settings |
| `requests.*` | 15 | Booking requests |
| `nav.*` | 15 | Navigation items |
| `seasons.*` | 14 | Seasonal lease management |
| `calendar.*` | 12 | Calendar views |
| `users.*` | 11 | User management |
| `org.*` | 11 | Organization portal (minside) |
| `booking.*` | 6 | Booking status values |

---

## App Integration Status

### Usage Statistics

| App | Files Using i18n | Status |
|-----|------------------|--------|
| **apps/backoffice** | 15+ files | ACTIVE |
| **apps/minside** | 18+ files | ACTIVE |
| **apps/web** | 2 files | PARTIAL |

**Total i18n Hook Usages:** ~85 files across all apps

### App-Specific Integration

#### Backoffice (`apps/backoffice`)

| Feature | i18n Status | Notes |
|---------|-------------|-------|
| Login page | DONE | Full translation support |
| Role selection | DONE | Includes fallback strings |
| Dashboard | PARTIAL | Some hardcoded strings remain |
| Bookings | PARTIAL | Status labels translated |
| Organizations | PARTIAL | List page translated |
| Reports | PARTIAL | Headers translated, some hardcoded |
| Audit pages | PARTIAL | Mock data with hardcoded labels |
| Work queue | DONE | Translated |
| Settings | PARTIAL | Some labels hardcoded |

#### Minside (`apps/minside`)

| Feature | i18n Status | Notes |
|---------|-------------|-------|
| Login page | DONE | Full translation support |
| Dashboard | DONE | Fully translated |
| Bookings | DONE | Status and labels translated |
| Calendar | DONE | View controls translated |
| Settings | DONE | Preference labels translated |
| Billing | DONE | Invoice labels translated |
| Organization portal | DONE | Full namespace coverage |
| Help page | PARTIAL | Some static content |

#### Web (`apps/web`)

| Feature | i18n Status | Notes |
|---------|-------------|-------|
| Listing search | PARTIAL | Basic labels only |
| Listing details | MINIMAL | Limited translation usage |
| Booking widget | MINIMAL | Mostly hardcoded |
| Command palette | DONE | Quick actions translated |

---

## Provider Configuration

### Current Setup

```typescript
// Default configuration in I18nProvider
const DEFAULT_LOCALE: SupportedLocale = 'nb';

// Locale persistence: localStorage key
const LOCALE_STORAGE_KEY = 'locale';

// Fallback chain:
// 1. Current locale translation
// 2. English fallback
// 3. Key suffix (e.g., 'common.save' → 'save')
```

### Features

| Feature | Status | Notes |
|---------|--------|-------|
| Locale persistence | DONE | localStorage-backed |
| Fallback to English | DONE | Automatic fallback |
| Missing key warning | DONE | Console warning in dev |
| Parameter interpolation | DONE | `{{param}}` syntax |
| Runtime locale switching | DONE | Via setLocale() |
| Custom translations | DONE | Via translations prop |

### Interpolation Example

```typescript
// Translation key with parameters
'dashboard.welcomeBack': 'Velkommen tilbake, {{name}}'

// Usage
t('dashboard.welcomeBack', { name: 'Ola' })
// Output: "Velkommen tilbake, Ola"
```

---

## Gap Analysis

### Missing Translation Domains

| Domain | Current Coverage | Gap Description | Priority |
|--------|------------------|-----------------|----------|
| **Error messages** | MISSING | API/form errors not translated | HIGH |
| **Validation messages** | MISSING | Form validation text hardcoded | HIGH |
| **Notification content** | PARTIAL | Toast/alert messages mixed | MEDIUM |
| **Table column headers** | PARTIAL | Many tables use hardcoded headers | MEDIUM |
| **Empty states** | PARTIAL | "No data" messages inconsistent | LOW |
| **Pluralization** | MISSING | No plural forms support | MEDIUM |
| **Date/time formatting** | MISSING | Uses browser locale, not i18n | MEDIUM |
| **Number formatting** | MISSING | Currency/numbers not localized | MEDIUM |

### Missing Keys by App

#### Backoffice Gaps

```typescript
// Keys used with fallback (not in locale files):
'auth.roleSelection.title'
'auth.roleSelection.subtitle'
'auth.roleSelection.adminFeatures'
'auth.roleSelection.adminFeaturesDesc'
'auth.roleSelection.caseHandlerFeatures'
'auth.roleSelection.caseHandlerFeaturesDesc'
'auth.roleSelection.roleSwitch'
'auth.roleSelection.roleSwitchDesc'
'auth.roleSelection.panelTitle'
```

#### Web App Gaps

- Listing detail page largely untranslated
- Booking confirmation flow hardcoded
- Search filters use English labels only
- Map controls not localized

---

## Compliance Considerations

### Norwegian Language Law (Språklova)

| Requirement | Status | Notes |
|-------------|--------|-------|
| Norwegian as default | DONE | nb is default locale |
| Both Bokmål and Nynorsk | PARTIAL | Only Bokmål implemented |
| Language switching UI | DONE | Settings pages have toggle |
| Clear language labels | DONE | "Norsk" / "English" |

### Accessibility (WCAG 2.1)

| Requirement | Status | Notes |
|-------------|--------|-------|
| `lang` attribute | PARTIAL | Set on `<html>`, not all content |
| Screen reader support | DONE | Uses semantic text |
| RTL support | N/A | Not required for nb/en |

### SSA-L Tender Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| **I18N-01** Norwegian primary | DONE | Default locale is nb |
| **I18N-02** English support | DONE | Full en translation |
| **I18N-03** Runtime switching | DONE | No reload required |
| **I18N-04** Persistent preference | DONE | localStorage |
| **I18N-05** Nynorsk support | MISSING | Not implemented |

---

## Risk Summary

### High Risks

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| 1 | **Error messages hardcoded** | Poor UX for non-English users | Add error.* namespace |
| 2 | **Web app minimal i18n** | Public-facing content not translated | Extend translation coverage |
| 3 | **No Nynorsk support** | May not meet all municipal requirements | Add nn.ts locale file |

### Medium Risks

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| 4 | No pluralization | Grammatically incorrect text | Implement plural rules |
| 5 | Date formatting inconsistent | Confusing for users | Use Intl.DateTimeFormat |
| 6 | Role selection keys missing | Uses inline fallbacks | Add to nb.ts/en.ts |

### Low Risks

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| 7 | Some empty states hardcoded | Minor UX inconsistency | Add to translations |
| 8 | Table headers mixed | Visual inconsistency | Standardize approach |

---

## Recommendations

### Immediate (Phase 1)

1. **Add Missing Keys**
   - Add role selection keys to both locale files
   - Add error message namespace
   - Add validation message namespace

2. **Improve Web App Coverage**
   - Translate listing detail page
   - Translate booking confirmation flow
   - Translate search/filter labels

3. **Standardize Error Handling**
   ```typescript
   // Add to locales:
   'error.generic': 'Noe gikk galt. Prøv igjen.',
   'error.network': 'Kunne ikke koble til serveren.',
   'error.notFound': 'Ressursen ble ikke funnet.',
   'error.unauthorized': 'Du har ikke tilgang.',
   ```

### Short-term (Phase 2)

4. **Add Pluralization Support**
   ```typescript
   // Add plural function to utils.ts
   function plural(count: number, singular: string, plural: string): string
   ```

5. **Implement Nynorsk**
   - Create `packages/i18n/src/locales/nn.ts`
   - Update `SupportedLocale` type
   - Add locale switcher option

6. **Date/Number Formatting**
   - Add `formatDate()` utility using Intl
   - Add `formatCurrency()` utility
   - Document locale-aware formatting

### Medium-term (Phase 3)

7. **Translation Management**
   - Consider external translation tool (Phrase, Crowdin)
   - Add CI check for missing translations
   - Generate type-safe keys from locale files

8. **Advanced Features**
   - Add context-based translations
   - Implement translation key extraction
   - Add translation coverage reports

---

## Verification Commands

```bash
# Count translation keys
wc -l packages/i18n/src/locales/nb.ts
wc -l packages/i18n/src/locales/en.ts

# Find files using i18n
grep -r "useTranslation\|useI18n\|useT" apps/ --include="*.tsx" | wc -l

# Find potential missing translations (fallback usage)
grep -rn "t('" apps/ --include="*.tsx" | grep "," | head -20

# Check for hardcoded Norwegian text
grep -rn '"[A-ZÆØÅ][a-zæøå]+' apps/ --include="*.tsx" | grep -v "import\|export\|//" | head -20

# Validate key parity between locales
diff <(grep -E "^  '[a-z]" packages/i18n/src/locales/nb.ts | cut -d"'" -f2 | sort) \
     <(grep -E "^  '[a-z]" packages/i18n/src/locales/en.ts | cut -d"'" -f2 | sort)
```

---

## References

- **Package Entry**: `packages/i18n/src/index.ts`
- **Provider**: `packages/i18n/src/context.tsx`
- **Hooks**: `packages/i18n/src/hooks.ts`
- **Types**: `packages/i18n/src/types.ts`
- **Norwegian Translations**: `packages/i18n/src/locales/nb.ts`
- **English Translations**: `packages/i18n/src/locales/en.ts`
- **Utils**: `packages/i18n/src/utils.ts`

---

## Appendix: Full Namespace Reference

### `common.*` (39 keys)
General UI actions, states, and common labels used across all apps.

### `nav.*` (15 keys)
Navigation menu items and section labels.

### `auth.*` (21 keys)
Authentication flows, login methods, and security messaging.

### `dashboard.*` (20 keys)
Admin dashboard statistics, welcome messages, and quick actions.

### `listings.*` (30 keys)
Resource/listing management, search, filtering, and actions.

### `booking.*` (6 keys)
Booking status values: pending, confirmed, cancelled, completed, rejected, unknown.

### `bookings.*` (21 keys)
Bookings page: list view, filtering, statistics, and actions.

### `calendar.*` (12 keys)
Calendar views, time periods, and booking display.

### `messages.*` (18 keys)
Messaging/conversation features and status labels.

### `reports.*` (23 keys)
Reporting and analytics labels, export options, statistics.

### `organizations.*` (17 keys)
Organization management and membership.

### `users.*` (11 keys)
User administration and role labels.

### `settings.*` (16 keys)
System configuration and user preferences.

### `seasons.*` (14 keys)
Seasonal lease management.

### `requests.*` (15 keys)
Booking request processing workflow.

### `minside.*` (24 keys)
User dashboard (Min Side) navigation and features.

### `org.*` (11 keys)
Organization portal within Min Side.
