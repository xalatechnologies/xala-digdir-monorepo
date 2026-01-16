# @xala/i18n - Agent Guide

## Package Overview

Internationalization package for the Xala/Digilist Platform.

- **Canonical locale:** Norwegian Bokmål (nb)
- **Secondary locale:** English (en)
- **Keys:** 1,387 per locale
- **Tests:** 234 unit tests

## Critical Commands

```bash
# Build package
pnpm -F @xala/i18n build

# Run tests
pnpm -F @xala/i18n test

# Check key parity (REQUIRED before commit)
pnpm i18n:check

# Find unused keys
pnpm i18n:unused

# Scan for hardcoded strings
pnpm i18n:scan apps/minside/src
```

## Adding a Translation Key

1. Add to `src/locales/nb.ts`:
   ```ts
   'namespace.keyName': 'Norsk tekst',
   ```

2. Add to `src/locales/en.ts`:
   ```ts
   'namespace.keyName': 'English text',
   ```

3. Rebuild:
   ```bash
   pnpm -F @xala/i18n build
   ```

4. Verify:
   ```bash
   pnpm i18n:check
   ```

## Key Rules

| Rule | Example |
|------|---------|
| Dot notation | `dashboard.title` |
| camelCase | `welcomeBack` |
| Interpolation | `{{name}}` |
| No hardcoded strings | Use `t('key')` |

## Valid Namespaces

- `common`, `auth`, `nav`, `dashboard`
- `listings`, `bookings`, `calendar`
- `errors`, `policy`, `actions`, `ui`
- `sdk`, `status`, `settings`, `profile`

## Exports

### Providers

- `I18nProvider` - Standard sync provider
- `LazyI18nProvider` - Lazy loading (recommended)

### Hooks

- `useT()` / `useLazyT()` - Translation function
- `useLocale()` / `useLazyLocale()` - Current locale
- `useI18n()` / `useLazyI18n()` - Full context

### Formatters

- `formatDate()`, `formatTime()`, `formatDateTime()`
- `formatNumber()`, `formatCurrency()`, `formatPercent()`
- `formatRelativeTime()`, `formatDuration()`

### Lazy Loading

- `loadLocale()` - Load locale dynamically
- `preloadLocale()` - Preload in background
- `isLocaleLoaded()` - Check if loaded

## CI Integration

Pre-commit hook runs:
1. `pnpm i18n:check` on translation file changes
2. `pnpm i18n:scan` on app file changes

GitHub Actions runs `i18n-compliance` job on every PR.

## When Modifying

1. Always add keys to BOTH nb.ts and en.ts
2. Run `pnpm i18n:check` before committing
3. Run tests: `pnpm -F @xala/i18n test`
4. Rebuild: `pnpm -F @xala/i18n build`
