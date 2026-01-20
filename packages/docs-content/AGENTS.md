# @xala/docs-content - Agent Commands

> **Extends:** [Root AGENTS.md](../../AGENTS.md)

## Quick Reference

```bash
pnpm --filter @xala/docs-content build
```

## Content Structure

```
content/
├── guides/          # User guides
├── tutorials/       # Tutorials
├── api/             # API docs
└── faq/             # FAQ
```

## Multi-Language

All content in `nb` (Norwegian) and `en` (English).

## Usage

```tsx
import { getGuide, searchDocs } from '@xala/docs-content';

const content = await getGuide('getting-started', 'nb');
```

---

**Status:** Active
