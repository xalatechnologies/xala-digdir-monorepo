# @xala/ds-themes - Theme URL Registry

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

`@xala/ds-themes` provides theme CSS files and URL registry for runtime theme switching across the Xala/Digilist Platform.

**Package Name:** `@xala/ds-themes`

---

## Available Themes

| Theme | Description |
|-------|-------------|
| `digdir` | Default Digdir theme |
| `altinn` | Altinn theme |
| `uutilsynet` | Utsynet theme |
| `portal` | Portal theme |
| `digilist` | Custom Digilist theme |

---

## Usage

Themes are applied via the `DesignsystemetProvider` in `@xala/ds`:

```tsx
import { DesignsystemetProvider } from '@xala/ds';

function App() {
  return (
    <DesignsystemetProvider
      theme="digdir"     // or "altinn", "uutilsynet", etc.
      colorScheme="auto" // "light", "dark", "auto"
    >
      <YourApp />
    </DesignsystemetProvider>
  );
}
```

---

## Thin App Strategy

- Theme CSS is centralized in this package
- Apps never define custom themes
- Use `DesignsystemetProvider` from @xala/ds
- No inline color overrides

---

## Commands

```bash
pnpm --filter @xala/ds-themes build
pnpm tokens:create   # Generate tokens
pnpm tokens:build    # Build theme CSS
```

---

**Last Updated:** 2026-01-20
**Status:** Active
