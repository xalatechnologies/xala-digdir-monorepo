# @xala/i18n Package

> **Internationalization for Xala/Digilist Platform**

## Package Purpose

This package provides the complete i18n solution for all Xala apps:
- Translation management (1,387 keys in nb and en)
- Locale resolution and persistence
- Intl-based formatting (dates, numbers, currency)
- Lazy loading for optimized bundle size
- CI validation tools

## Quick Reference

### Imports

```tsx
// Standard provider
import { I18nProvider, useT, useLocale } from '@xala/i18n';

// Lazy provider (recommended)
import { LazyI18nProvider, useLazyT } from '@xala/i18n';

// Formatters
import { formatDate, formatCurrency, formatNumber } from '@xala/i18n';

// Lazy loading utilities
import { loadLocale, preloadLocale } from '@xala/i18n';
```

### Key Statistics

| Metric | Value |
|--------|-------|
| Translation keys | 1,387 |
| Locales | nb (canonical), en |
| Unit tests | 234 |
| Bundle size | ~64KB per locale |

## Development Commands

```bash
# Build
pnpm -F @xala/i18n build

# Test
pnpm -F @xala/i18n test

# Type check
pnpm -F @xala/i18n typecheck

# Check key parity
pnpm -F @xala/i18n check:keys
```

## File Structure

```
src/
├── index.ts              # Main exports
├── context.tsx           # I18nProvider
├── LazyI18nProvider.tsx  # LazyI18nProvider ✨
├── hooks.ts              # useT, useLocale, etc.
├── lazy-loader.ts        # Dynamic import utilities
├── formatters.ts         # Intl-based formatters
├── keys.ts               # Type-safe key registry
├── storage.ts            # Cookie + localStorage
├── reasonKeys.ts         # RFC 7807 resolver
├── types.ts              # TypeScript types
├── utils.ts              # Interpolation
└── locales/
    ├── nb.ts             # Norwegian (canonical)
    └── en.ts             # English
```

## Adding Translations

1. Add key to `src/locales/nb.ts`:
   ```ts
   'myFeature.newKey': 'Norsk tekst',
   ```

2. Add key to `src/locales/en.ts`:
   ```ts
   'myFeature.newKey': 'English text',
   ```

3. Rebuild: `pnpm -F @xala/i18n build`

4. Verify: `pnpm i18n:check`

## Key Conventions

- Use dot notation: `namespace.feature.element`
- Use camelCase: `dashboard.welcomeBack`
- Interpolation: `{{paramName}}`

## Non-Negotiable Rules

1. **Norwegian is canonical** - Add nb first, then en
2. **Key parity required** - Both locales must have same keys
3. **No hardcoded strings** - Use `t()` in all UI components
4. **Run checks before commit** - `pnpm i18n:check`

## Related Docs

- [Full Guide](../../docs/i18n.md)
- [Package Docs](../../docs/packages/06-i18n.md)
