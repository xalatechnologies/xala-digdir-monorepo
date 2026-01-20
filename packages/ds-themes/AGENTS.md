# @xala/ds-themes - Agent Commands

> **Extends:** [Root AGENTS.md](../../AGENTS.md)

## Quick Reference

```bash
pnpm --filter @xala/ds-themes build
pnpm tokens:create    # Generate theme tokens
pnpm tokens:build     # Build theme CSS files
```

## Available Themes

- `digdir` - Default
- `altinn` - Altinn theme
- `uutilsynet` - Utsynet theme
- `portal` - Portal theme
- `digilist` - Custom theme

## Usage in Apps

```tsx
// Use via DesignsystemetProvider
import { DesignsystemetProvider } from '@xala/ds';

<DesignsystemetProvider theme="digdir">
  <App />
</DesignsystemetProvider>
```

---

**Status:** Active
