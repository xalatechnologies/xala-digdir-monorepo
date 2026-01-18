# @xala/ds-themes

⚠️ **INTERNAL PACKAGE** - Do not import directly in apps.

## Purpose

This package generates design tokens and theme CSS files at **build time**. It is infrastructure code used internally by `@xala/ds`.

## Architecture

```
@xala/ds-themes (Build-time infrastructure)
    ├── Token generation scripts
    ├── Theme configurations  
    └── Generated CSS output
         └── Used by @xala/ds internally
```

## Build Process

```bash
# Generates design tokens from Designsystemet CLI
npm run tokens:create

# Compiles tokens to CSS
npm run tokens:build

# Both (runs automatically on prebuild)
npm run tokens:generate
```

## Generated Files

```
generated/
├── primitives/        # Base tokens (color, size, typography)
│   ├── modes/
│   │   ├── color-scheme/  # Light/dark modes
│   │   ├── size/          # Responsive sizes
│   │   └── typography/    # Font settings
│   └── globals.json
├── semantic/          # Semantic tokens (brand colors, etc.)
│   ├── color.json
│   └── style.json
├── themes/            # Theme configurations
│   └── digilist.json
└── digilist.css      # Final compiled CSS
```

## For App Developers

❌ **DON'T** import this package directly:
```typescript
// ❌ WRONG
import { THEMES } from '@xala/ds-themes';
```

✅ **DO** use the theme API from `@xala/ds`:
```typescript
// ✅ CORRECT
import { ThemeProvider, useTheme } from '@xala/ds';

function MyApp() {
  return (
    <ThemeProvider defaultTheme="digilist">
      <YourApp />
    </ThemeProvider>
  );
}
```

## For Design System Developers

You should only work with this package if you're:
- ✅ Creating new theme variants
- ✅ Modifying design tokens
- ✅ Debugging token generation
- ✅ Updating Designsystemet configuration

## Theme Configuration

Theme tokens are defined in:
- `designsystemet.config.json` (root of monorepo)
- `themes/*.css` (custom CSS extensions)

## Dependencies

- `@digdir/designsystemet-theme` - Official token generation CLI
- `@digdir/designsystemet` - CLI tools

## Related Documentation

- [Design System Architecture](../../docs/architecture/design-system.md)
- [Design System Package Analysis](../../docs/DESIGN_SYSTEM_PACKAGES_ANALYSIS.md)
- [@xala/ds README](../ds/README.md)
