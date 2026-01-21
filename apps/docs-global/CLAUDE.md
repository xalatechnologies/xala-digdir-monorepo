# apps/docs-global - Global Documentation Portal

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

The **docs-global** app is the Global Documentation Portal for the Xala Platform. It provides platform-agnostic documentation including API reference, SDK guides, architecture documentation, and component library docs.

**Port:** 5180
**URL (local):** http://localhost:5180
**URL (production):** https://docs.xala.dev (planned)

---

## CRITICAL: Platform-Only App

**This app is PLATFORM-ONLY.** It must NOT import any domain-specific packages.

### Allowed Imports

```typescript
// ✅ ALLOWED - Platform packages
import { Button, Card, Heading } from '@xala/ds';
import { useT } from '@xala/i18n';
import { RuntimeProvider } from '@xala/runtime';
import type { RuntimeConfig } from '@xala/runtime';
```

### FORBIDDEN Imports

```typescript
// ❌ FORBIDDEN - Domain packages
import { useBookings } from '@digilist/client-sdk';       // ❌
import { ListingCard } from '@digilist/ui';               // ❌
import { rentalObjectSchema } from '@digilist/contracts'; // ❌
import { initializeClient } from '@digilist/client-sdk';  // ❌
```

**Rationale:** This documentation portal is meant to be domain-agnostic and serve as reference for the platform layer. It should not have any dependencies on Digilist-specific code.

---

## Directory Structure

```
apps/docs-global/
├── src/
│   ├── routes/              # React Router routes
│   │   ├── index.tsx        # Docs home page
│   │   ├── api-reference.tsx# API documentation
│   │   ├── sdk-guide.tsx    # SDK usage guide
│   │   ├── architecture.tsx # Architecture docs
│   │   └── components.tsx   # Component library
│   ├── components/          # Doc-specific components
│   │   └── layout/          # Layout components
│   │       └── DocsLayout.tsx
│   ├── main.tsx             # App entry point
│   ├── App.tsx              # Routing configuration
│   └── root.css             # Global styles
├── public/                  # Static assets
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript config
├── package.json             # Dependencies
└── CLAUDE.md                # This file
```

---

## Development Commands

```bash
# From repository root
pnpm --filter @xala/docs-global dev        # Start dev server (port 5180)
pnpm --filter @xala/docs-global build      # Production build
pnpm --filter @xala/docs-global preview    # Preview production build

# From this directory
pnpm dev                                   # Start dev server
pnpm build                                 # Production build
pnpm preview                               # Preview build
```

---

## App-Specific Rules

### 1. No SDK Initialization

This app does NOT initialize any domain SDK. It uses RuntimeProvider directly with a minimal configuration:

```typescript
// main.tsx - Platform-only config
const runtimeConfig: RuntimeConfig = {
  appType: 'docs-global',
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.digilist.no',
  locale: 'en', // Global docs default to English
  theme: 'digdir',
  colorScheme: 'auto',
  authConfig: {
    requireAuth: false, // Docs are public
  },
};
```

### 2. Static Documentation

All documentation content is hardcoded in the route components. This is intentional to:
- Keep the app simple and fast
- Avoid external dependencies
- Enable easy updates through code changes

### 3. Multi-Language Support

Use `@xala/i18n` for UI strings with fallback values:

```typescript
const t = useT();
const title = t('docs.home.title') || 'Xala Platform Documentation';
```

### 4. Design Token Compliance

All styling MUST use Designsystemet tokens:

```css
/* ✅ CORRECT */
padding: var(--ds-spacing-4);
color: var(--ds-color-accent-text-default);

/* ❌ WRONG */
padding: 16px;
color: #0067c5;
```

---

## Routing Structure

```
/                    # Documentation home
/api-reference       # API endpoint documentation
/sdk-guide           # SDK usage guide
/architecture        # System architecture
/components          # Component library
```

---

## Key Features

### Documentation Home (`/`)
- Overview cards for each documentation section
- Quick start guide
- Navigation to all documentation areas

### API Reference (`/api-reference`)
- Complete endpoint listing
- Request/response examples
- Authentication documentation
- RFC 7807 error handling

### SDK Guide (`/sdk-guide`)
- Installation instructions
- Client initialization
- React Query hooks usage
- Real-time WebSocket subscriptions
- Error handling patterns

### Architecture (`/architecture`)
- Monorepo structure
- Package dependencies
- Design principles
- Data flow diagrams
- Import rules

### Components (`/components`)
- Live component examples
- Category organization (primitives, composed, blocks, shells)
- Design token reference
- Import instructions

---

## Integration Points

### Packages Used

```typescript
// Design System
import { Button, Card, Heading, ... } from '@xala/ds';

// Internationalization
import { useT } from '@xala/i18n';

// Runtime
import { RuntimeProvider } from '@xala/runtime';
```

### NO SDK Integration

This app does NOT use:
- `@digilist/client-sdk`
- Any domain-specific hooks
- Any API data fetching

All content is static documentation.

---

## Environment Variables

```bash
VITE_API_URL=https://api.digilist.no  # For documentation examples only
```

---

## Common Patterns

### Documentation Card

```tsx
<Card style={{ padding: 'var(--ds-spacing-4)' }}>
  <Heading level={3}>{title}</Heading>
  <Paragraph>{description}</Paragraph>
</Card>
```

### Code Block

```tsx
<pre>
  <code>{`const example = 'code';`}</code>
</pre>
```

### Navigation Link

```tsx
<Link
  to="/api-reference"
  className={`nav-link ${isActive ? 'active' : ''}`}
>
  {label}
</Link>
```

---

## Testing

Tests are located in `packages/testing/`:
- **E2E:** `packages/testing/suites/e2e/docs-global/`
- **Unit:** Co-located with components

```bash
# Run docs-global E2E tests
pnpm --filter @digilist/testing test:e2e -- --grep "docs-global"
```

---

## Deployment

```bash
# Build for production
pnpm --filter @xala/docs-global build

# Preview locally
pnpm --filter @xala/docs-global preview
```

---

## Common Issues

### 1. Import Error: Cannot find module '@digilist/*'

**Cause:** Attempting to import domain packages.
**Solution:** This is a platform-only app. Use only `@xala/*` packages.

### 2. Missing Design Tokens

**Cause:** Using hardcoded values instead of CSS custom properties.
**Solution:** Replace with `var(--ds-*)` tokens.

### 3. Translation Missing

**Cause:** i18n key not defined.
**Solution:** Provide fallback value: `t('key') || 'Fallback'`

---

## Thin App Compliance

This app follows the **Thin App Strategy**:
- All UI components from `@xala/ds`
- No business logic (static docs only)
- Design tokens only
- All text supports localization via `@xala/i18n`

---

## When in Doubt

1. Can I import from `@digilist/*`? -> **NO, platform-only app**
2. Should I use `fetch()` for data? -> **NO, static docs only**
3. Should I use hardcoded colors? -> **NO, use design tokens**
4. Should I hardcode text? -> **NO, use `t()` with fallback**
5. Check root CLAUDE.md for architecture rules

---

**Last Updated:** 2026-01-21
**Status:** Initial Implementation
**Next Review:** After integration testing
