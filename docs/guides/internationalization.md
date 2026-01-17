# i18n Localization Guide

> **Canonical Locale:** Norwegian Bokmål (`nb`)  
> **Secondary Locale:** English (`en`)  
> **Package:** `@xala/i18n`  
> **Last Updated:** January 2026

This document describes the internationalization (i18n) system for the Xala/Digilist Platform.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Locale Resolution](#locale-resolution)
4. [Provider Options](#provider-options)
5. [Translation Hooks](#translation-hooks)
6. [Namespaces](#namespaces)
7. [Key Conventions](#key-conventions)
8. [Fallback Behavior](#fallback-behavior)
9. [Formatting (Intl-based)](#formatting-intl-based)
10. [Adding Translations](#adding-translations)
11. [Adding a New Namespace](#adding-a-new-namespace)
12. [Adding a New Locale](#adding-a-new-locale)
13. [CI Gates & Validation](#ci-gates--validation)
14. [Do/Don't Examples](#dodont-examples)
15. [Performance Strategy](#performance-strategy)
16. [API Error Codes (RFC 7807)](#api-error-codes-rfc-7807)
17. [Migration & Maintenance](#migration--maintenance)
18. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Import and Use

```tsx
import { useT } from '@xala/i18n';

function MyComponent() {
  const t = useT();

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.welcomeBack', { name: 'Ola' })}</p>
    </div>
  );
}
```

### 2. App Setup

The `I18nProvider` wraps your app in `App.tsx`:

```tsx
import { I18nProvider } from '@xala/i18n';

function App() {
  return (
    <I18nProvider>
      {/* Your app */}
    </I18nProvider>
  );
}
```

### 3. Verify Before Commit

```bash
# Check key completeness (both locales have same keys)
pnpm i18n:check

# Scan for hardcoded strings
pnpm i18n:scan apps/minside/src
```

---

## Architecture Overview

### Package Structure

```
packages/i18n/
├── src/
│   ├── index.ts              # Main exports
│   ├── context.tsx           # I18nProvider (standard)
│   ├── LazyI18nProvider.tsx  # LazyI18nProvider (optimized)
│   ├── hooks.ts              # useT, useLocale, etc.
│   ├── lazy-loader.ts        # Dynamic import utilities
│   ├── formatters.ts         # Intl-based formatters
│   ├── keys.ts               # Type-safe key registry
│   ├── storage.ts            # Cookie/localStorage persistence
│   ├── types.ts              # TypeScript types
│   ├── utils.ts              # Interpolation utilities
│   └── locales/
│       ├── index.ts          # Locale registry
│       ├── nb.ts             # Norwegian (canonical) - 1,387 keys
│       └── en.ts             # English - 1,387 keys
└── __tests__/                # 234 tests
```

### Key Statistics

| Metric | Value |
|--------|-------|
| Total translation keys | 1,387 |
| Supported locales | 2 (nb, en) |
| Unit tests | 234 |
| Bundle size (per locale) | ~64KB |
| Core translations | ~2KB |

### Consumer Apps

| App | Port | i18n Usage |
|-----|------|------------|
| `apps/web` | 5173 | Public-facing, SEO |
| `apps/backoffice` | 5175 | Admin portal |
| `apps/minside` | 5174 | User portal |

---

## Locale Resolution

The locale is resolved in this **deterministic order**:

| Priority | Source | Description |
|----------|--------|-------------|
| 1 | `initialLocale` prop | SSR override (server-side) |
| 2 | Cookie (`digilist_locale`) | Persisted user preference |
| 3 | localStorage (`locale`) | Fallback persistence |
| 4 | Default: `nb` | Norwegian Bokmål (canonical) |

### Persistence

When a user explicitly changes their locale:

1. Cookie is set (`digilist_locale`, 365 days, `SameSite=Lax`)
2. localStorage is set (`locale`)
3. Both are updated to ensure SSR/CSR consistency

### Changing Locale

```tsx
import { useLocale } from '@xala/i18n';

function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <select value={locale} onChange={(e) => setLocale(e.target.value)}>
      <option value="nb">Norsk</option>
      <option value="en">English</option>
    </select>
  );
}
```

---

## Provider Options

### 1. Standard Provider (`I18nProvider`)

Loads all translations synchronously at app startup.

```tsx
import { I18nProvider } from '@xala/i18n';

function App() {
  return (
    <I18nProvider locale="nb">
      <YourApp />
    </I18nProvider>
  );
}
```

**Best for:** Apps where locale rarely changes, or when you want guaranteed instant translations.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `locale` | `'nb' \| 'en'` | `'nb'` | Initial locale |
| `children` | `ReactNode` | required | App content |

### 2. Lazy Provider (`LazyI18nProvider`) ✨ RECOMMENDED

Loads translations on demand via dynamic imports. Only loads the active locale.

```tsx
import { LazyI18nProvider } from '@xala/i18n';

function App() {
  return (
    <LazyI18nProvider 
      locale="nb"
      fallbackLocale="nb"
      loadingFallback={<LoadingSpinner />}
    >
      <YourApp />
    </LazyI18nProvider>
  );
}
```

**Benefits:**
- Only loads active locale (saves ~64KB if user never switches)
- Core translations (~2KB) available immediately
- Full translations loaded async in background
- Automatic preloading of fallback locale

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `locale` | `'nb' \| 'en'` | from storage | Initial locale |
| `fallbackLocale` | `'nb' \| 'en'` | `'nb'` | Fallback for missing keys |
| `loadingFallback` | `ReactNode` | `undefined` | Loading UI |
| `persistLocale` | `boolean` | `true` | Save to storage |
| `children` | `ReactNode` | required | App content |

---

## Translation Hooks

### Standard Hooks (with `I18nProvider`)

```tsx
import { useT, useLocale, useI18n } from '@xala/i18n';

// Get translation function
const t = useT();
t('common.save'); // "Lagre"
t('welcome', { name: 'Ola' }); // "Velkommen, Ola!"

// Get locale state
const { locale, setLocale } = useLocale();

// Get full context
const { t, locale, setLocale } = useI18n();
```

### Lazy Hooks (with `LazyI18nProvider`)

```tsx
import { useLazyT, useLazyLocale, useLazyI18n } from '@xala/i18n';

// Get translation function
const t = useLazyT();

// Get locale
const locale = useLazyLocale();

// Get full context with loading state
const { t, locale, setLocale, isLoading, isReady } = useLazyI18n();
```

### Formatting Hooks

```tsx
import { useFormatRelativeTime, useFormatDuration } from '@xala/i18n';

function TimeDisplay({ date }) {
  const formatRelative = useFormatRelativeTime();
  return <span>{formatRelative(date)}</span>; // "for 2 timer siden"
}
```

---

## Namespaces

Translations are organized by domain namespace:

| Namespace | Description | Used In |
|-----------|-------------|---------|
| `common` | Shared UI strings (save, cancel, error) | All apps |
| `nav` | Navigation items | All apps |
| `auth` | Authentication pages | All apps |
| `dashboard` | Dashboard pages | backoffice, minside |
| `listings` | Listing management | backoffice, web |
| `bookings` | Booking flows | All apps |
| `calendar` | Calendar UI | backoffice, minside |
| `messages` | Messaging | backoffice, minside |
| `reports` | Reports and analytics | backoffice |
| `organizations` | Org management | backoffice |
| `users` | User management | backoffice |
| `settings` | Settings pages | All apps |
| `seasons` | Season rental | backoffice |
| `requests` | Booking requests | backoffice |
| `minside` | User portal specific | minside |
| `org` | Organization portal | minside |
| `security` | Security & compliance | backoffice |
| `policy` | Policy reason codes | SDK |
| `actions` | Action reason codes | SDK |
| `errors` | RFC 7807 error types | SDK |
| `ui` | Generic UI elements | All apps |
| `sdk` | SDK placeholders | SDK |
| `status` | Status labels | All apps |

---

## Key Conventions

### Naming Pattern

```
{namespace}.{feature}.{element}
```

**Examples:**
- `common.save` - Common save button
- `dashboard.welcomeBack` - Dashboard greeting
- `listings.confirmArchive` - Listing archive confirmation
- `errors.FORBIDDEN.title` - RFC 7807 error title

### Rules

1. **Use dot notation** - `namespace.feature.element`
2. **Use camelCase** for multi-word segments - `welcomeBack`, `quickActions`
3. **Use lowercase** for namespaces - `common`, `dashboard`
4. **Be descriptive** - `listings.confirmArchive` not `listings.confirm`
5. **Avoid abbreviations** - `navigation` not `nav` (exception: `nav` namespace is historical)

### Reserved Prefixes

| Prefix | Usage |
|--------|-------|
| `common.*` | Cross-app shared strings |
| `errors.*` | RFC 7807 error types |
| `policy.*` | Policy reason codes from API |
| `actions.*` | Action disabled reason codes |
| `ui.*` | Generic UI elements |

---

## Fallback Behavior

### Missing Key Fallback

1. Try current locale (`en`)
2. Fall back to canonical locale (`nb`)
3. Return the key itself (e.g., `my.missing.key`)
4. Log warning in development: `Missing translation key: my.missing.key`

### Locale Fallback Chain

```
nb-NO → nb → (no further fallback, nb is canonical)
en-US → en → nb → (canonical fallback)
```

---

## Formatting (Intl-based)

All formatting uses the standard **Intl API** for consistency across locales.

### Available Formatters

```tsx
import {
  formatDate,
  formatTime,
  formatDateTime,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatRelativeTime,
  formatDuration,
} from '@xala/i18n';

// Dates
formatDate(new Date(), 'nb');           // "16.01.2026"
formatDate(new Date(), 'en');           // "1/16/2026"

// Time
formatTime(new Date(), 'nb');           // "14:30"
formatTime(new Date(), 'en');           // "2:30 PM"

// DateTime
formatDateTime(new Date(), 'nb');       // "16.01.2026, 14:30"

// Numbers
formatNumber(1234.56, 'nb');            // "1 234,56"
formatNumber(1234.56, 'en');            // "1,234.56"

// Currency (default: NOK)
formatCurrency(1234.56, 'NOK', 'nb');   // "kr 1 234,56"
formatCurrency(1234.56, 'NOK', 'en');   // "NOK 1,234.56"
formatCurrency(99.99, 'USD', 'en');     // "$99.99"

// Percentage
formatPercent(0.75, 'nb');              // "75 %"

// Relative time
formatRelativeTime(pastDate, 'nb');     // "for 2 timer siden"

// Duration
formatDuration(5400000, { locale: 'nb' }); // "1t 30m"
formatDuration(5400000, { style: 'long', locale: 'nb' }); // "1 time 30 minutter"
```

---

## Adding Translations

### Step-by-Step

1. **Add key to Norwegian (canonical):**

   ```ts
   // packages/i18n/src/locales/nb.ts
   export const nb: Record<string, string> = {
     // ... existing keys
     'myFeature.newKey': 'Ny tekst på norsk',
   };
   ```

2. **Add key to English:**

   ```ts
   // packages/i18n/src/locales/en.ts
   export const en: Record<string, string> = {
     // ... existing keys
     'myFeature.newKey': 'New text in English',
   };
   ```

3. **Rebuild package:**

   ```bash
   pnpm -F @xala/i18n build
   ```

4. **Verify (run CI check):**

   ```bash
   pnpm i18n:check
   ```

5. **Use in component:**

   ```tsx
   const t = useT();
   return <p>{t('myFeature.newKey')}</p>;
   ```

### Interpolation

Use `{{paramName}}` syntax for dynamic values:

```ts
// nb.ts
'welcome.greeting': 'Velkommen tilbake, {{name}}!',

// en.ts
'welcome.greeting': 'Welcome back, {{name}}!',
```

```tsx
t('welcome.greeting', { name: user.firstName })
// → "Velkommen tilbake, Ola!"
```

---

## Adding a New Namespace

1. **Add keys to both locales** with the new namespace prefix
2. **Document the namespace** in this file under [Namespaces](#namespaces)
3. **Run completeness check:**

   ```bash
   pnpm i18n:check
   ```

---

## Adding a New Locale

> ⚠️ **Note:** Adding a new locale requires significant effort and should be coordinated with the product team.

1. **Create locale file:**

   ```ts
   // packages/i18n/src/locales/sv.ts
   export const sv: Record<string, string> = {
     'common.save': 'Spara',
     // ... all 1,387+ keys
   };
   ```

2. **Update registry:**

   ```ts
   // packages/i18n/src/locales/index.ts
   import { sv } from './sv';

   export const translations: TranslationsRegistry = {
     nb,
     en,
     sv,
   };
   ```

3. **Update types:**

   ```ts
   // packages/i18n/src/types.ts
   export type SupportedLocale = 'nb' | 'en' | 'sv';
   ```

4. **Update lazy loader:**

   ```ts
   // packages/i18n/src/lazy-loader.ts
   // Add dynamic import for new locale
   ```

5. **Run completeness check:**

   ```bash
   pnpm i18n:check
   ```

---

## CI Gates & Validation

### Available Scripts

| Script | Purpose | Exit Code |
|--------|---------|-----------|
| `pnpm i18n:check` | Check key parity (nb ↔ en) | 1 if errors |
| `pnpm i18n:check:strict` | Strict mode (convention warnings fail) | 1 if warnings |
| `pnpm i18n:unused` | Find potentially unused keys | 1 if found |
| `pnpm i18n:scan <path>` | Scan for hardcoded strings | 1 if found |
| `pnpm i18n:migrate` | Analyze legacy keys for migration | 0 always |

### Pre-commit Hook (Automatic)

The repository includes a Husky pre-commit hook that automatically:

1. Runs `pnpm i18n:check` when translation files are modified
2. Scans changed app files for hardcoded strings

**Configuration:** `.husky/pre-commit`

### CI Pipeline Integration

The `i18n-compliance` job runs in GitHub Actions on every push/PR:

```yaml
# .github/workflows/comprehensive-testing.yml
i18n-compliance:
  name: i18n Compliance
  steps:
    - name: Check translation key parity
      run: pnpm i18n:check
    
    - name: Run i18n unit tests
      run: pnpm -F @xala/i18n test
    
    - name: Scan for hardcoded strings
      run: node scripts/scan-i18n.js apps/minside/src
```

**Critical:** The i18n-compliance job is a required check - PRs cannot merge if it fails.

---

## Do/Don't Examples

### ✅ DO

```tsx
// Use t() for all user-facing text
<Button>{t('common.save')}</Button>

// Use interpolation for dynamic content
<p>{t('dashboard.welcomeBack', { name: user.name })}</p>

// Use formatters for dates/numbers/currency
<span>{formatDate(booking.date, locale)}</span>
<span>{formatCurrency(price, 'NOK', locale)}</span>

// Add keys to BOTH locale files
// nb.ts: 'feature.text': 'Norsk tekst'
// en.ts: 'feature.text': 'English text'

// Use LazyI18nProvider for optimal bundle size
<LazyI18nProvider locale="nb">
  <App />
</LazyI18nProvider>
```

### ❌ DON'T

```tsx
// Hardcoded strings
<Button>Save</Button>
<Button>Lagre</Button>

// Manual date formatting
<span>{date.toLocaleDateString()}</span>

// String concatenation for sentences
<p>{'Welcome ' + user.name}</p>

// Missing translation in one locale
// nb.ts: 'feature.text': 'Norsk tekst'
// en.ts: (missing!)

// Translation logic in components
{locale === 'nb' ? 'Lagre' : 'Save'}
```

---

## Performance Strategy

### Bundle Sizes

| Component | Size (approx.) |
|-----------|----------------|
| Core translations | ~2KB |
| Each locale (nb/en) | ~64KB |
| Formatters & utilities | ~4KB |
| **Total per locale** | **~70KB** |

### Optimization Recommendations

1. **Use `LazyI18nProvider`** - Only loads active locale
2. **Keep translation values concise** - Avoid verbose text
3. **Use shared `common.*` keys** - Reduce duplication
4. **Remove unused keys** - Run `pnpm i18n:unused` periodically
5. **Preload alternate locale** - On language switcher hover

### Manual Locale Loading

For advanced control:

```tsx
import { loadLocale, preloadLocale, isLocaleLoaded } from '@xala/i18n';

// Preload English in background (for language switcher)
preloadLocale('en');

// Check if locale is ready
if (!isLocaleLoaded('en')) {
  const translations = await loadLocale('en');
}
```

---

## API Error Codes (RFC 7807)

The API returns error codes, NOT localized strings. The frontend is responsible for localization.

### Error Type Mapping

| API Error Type | Translation Key |
|----------------|-----------------|
| `VALIDATION_ERROR` | `errors.VALIDATION_ERROR.title` |
| `NOT_FOUND` | `errors.NOT_FOUND.title` |
| `UNAUTHORIZED` | `errors.UNAUTHORIZED.title` |
| `FORBIDDEN` | `errors.FORBIDDEN.title` |
| `INTERNAL_ERROR` | `errors.INTERNAL_ERROR.title` |

### Reason Key Resolution

```tsx
import { resolveReasonKey } from '@xala/i18n';

// Policy reason from SDK
const message = resolveReasonKey('policy.role.insufficient_permissions', 'nb');
// → "Du har ikke tilstrekkelige rettigheter for denne handlingen"

// Action disabled reason
const reason = resolveReasonKey('actions.book.disabled.slot_unavailable', 'en');
// → "This time slot is no longer available"

// RFC 7807 error code
const errorTitle = resolveReasonKey('FORBIDDEN', 'nb');
// → "Tilgang nektet"
```

---

## Migration & Maintenance

### Key Migration Tool

Analyze legacy keys that don't follow namespace conventions:

```bash
# Run migration analysis
pnpm i18n:migrate

# Generate JSON report
pnpm i18n:migrate --json
```

**Current Status (January 2026):**
- 1,387 total keys
- 319 properly namespaced
- 1,065 legacy keys (working, but should be migrated)
- 3 false positives filtered

### Unused Key Detection

Find keys that may no longer be used:

```bash
pnpm i18n:unused
```

> ⚠️ **Note:** Some keys are used dynamically. Review carefully before removing.

### Maintenance Schedule

| Task | Frequency | Command |
|------|-----------|---------|
| Key parity check | Every commit | `pnpm i18n:check` |
| Hardcoded string scan | Every commit | `pnpm i18n:scan` |
| Unused key review | Monthly | `pnpm i18n:unused` |
| Key migration | Quarterly | `pnpm i18n:migrate` |

---

## Troubleshooting

### Missing Translation Warning

```
Missing translation key: my.key.here
```

**Solution:** Add the key to both `nb.ts` and `en.ts`.

### Key Completeness Check Failing

```
❌ Key "feature.text" exists in nb but missing in en
```

**Solution:** Add the missing key to the other locale file.

### Hardcoded String Detected

```
🔴 Line 42: hardcoded_jsx_text
   String: "Settings"
```

**Solution:** Replace with `{t('nav.settings')}`.

### Hydration Mismatch

If the server renders a different locale than the client:

1. Ensure cookie is accessible on server
2. Pass `initialLocale` prop to `I18nProvider`
3. Verify cookie settings (`SameSite`, `Secure`)

### Build Failing

If TypeScript fails on locale files:

1. Check for syntax errors in translation files
2. Ensure all keys use single quotes (or double for values with apostrophes)
3. Run `pnpm -F @xala/i18n build` to see detailed errors

### Pre-commit Hook Issues

If the pre-commit hook fails:

```bash
# Run checks manually
pnpm i18n:check

# Fix issues, then retry commit
```

---

## Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Architecture overview
- [packages/i18n/CLAUDE.md](../packages/i18n/CLAUDE.md) - Package details
- [Development Workflow](./03-development-workflow.md)
- [Testing Strategy](./guides/02-testing.md)

---

## Changelog

### January 2026 - i18n Hardening

**New Features:**
- ✅ `LazyI18nProvider` - Lazy loading for locale bundles
- ✅ `loadLocale()`, `preloadLocale()` - Manual locale loading
- ✅ Pre-commit hooks via Husky
- ✅ CI pipeline integration (`i18n-compliance` job)
- ✅ Key migration analysis tool

**Improvements:**
- ✅ Intl-based formatters (`formatCurrency`, `formatDate`, etc.)
- ✅ Type-safe key registry
- ✅ Comprehensive test suite (234 tests)
- ✅ Documentation overhaul

**Scripts Added:**
- `pnpm i18n:check` - Key parity validation
- `pnpm i18n:unused` - Unused key detection
- `pnpm i18n:scan` - Hardcoded string scanner
- `pnpm i18n:migrate` - Legacy key analysis
