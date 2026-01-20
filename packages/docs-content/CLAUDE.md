# @xala/docs-content - Documentation Content

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

`@xala/docs-content` provides markdown-based documentation content for the docs-learning app, including guides, tutorials, and training materials.

**Package Name:** `@xala/docs-content`

---

## Content Structure

```
packages/docs-content/
├── content/
│   ├── guides/          # User guides (nb/en)
│   ├── tutorials/       # Interactive tutorials
│   ├── api/             # API documentation
│   └── faq/             # FAQ content
├── src/
│   ├── loader.ts        # Content loader
│   └── search.ts        # Search index
└── package.json
```

---

## Multi-Language Support

All content available in:
- `nb` - Norwegian (primary)
- `en` - English

```
content/guides/
├── getting-started/
│   ├── nb.md
│   └── en.md
```

---

## Usage in docs-learning

```tsx
import { getGuide, searchDocs } from '@xala/docs-content';

// Load guide
const content = await getGuide('getting-started', 'nb');

// Search
const results = await searchDocs('booking', 'nb');
```

---

## Thin App Strategy

- Content is centralized in this package
- docs-learning app just renders content
- Use @xala/ds components for display
- All UI text via @xala/i18n

---

## Commands

```bash
pnpm --filter @xala/docs-content build
```

---

**Last Updated:** 2026-01-20
**Status:** Active
