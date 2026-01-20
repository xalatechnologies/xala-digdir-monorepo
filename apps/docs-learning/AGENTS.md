# apps/docs-learning - Agent Commands

> **Extends:** [Root AGENTS.md](../../AGENTS.md)

## Quick Reference

```bash
# Development
pnpm dev                    # Start dev server (port 5179)
pnpm build                  # Build for production
pnpm preview                # Preview production build

# Testing
pnpm test                   # Run unit tests
pnpm test:e2e tests/e2e/docs-*.spec.ts  # Docs E2E tests

# Deployment
pnpm deploy:docs-learning   # Deploy to test environment
```

## Package Filter Commands

```bash
# From repository root
pnpm --filter @xala/docs-learning dev
pnpm --filter @xala/docs-learning build
pnpm --filter @xala/docs-learning test
```

## Key Files

- `src/main.tsx` - App entry point
- `src/routes/DocsHomePage.tsx` - Documentation home
- `src/routes/guides/` - User guide routes
- `src/routes/tutorials/` - Tutorial routes
- `src/components/` - Doc viewer components
- `vite.config.ts` - Build configuration (port 5179)

## SDK Services Used

- `useAuth()` - Authentication for protected content
- `useDocSearch()` - Documentation search
- `useTutorialProgress()` - Tutorial progress tracking

## Content Package

```tsx
import { getGuide, searchDocs } from '@xala/docs-content';

// Load guide content
const content = await getGuide('getting-started', 'nb');

// Search documentation
const results = await searchDocs('booking');
```

## Common Tasks

### Add New Guide
1. Create content in @xala/docs-content
2. Add route in `src/routes/guides/`
3. Add to navigation sidebar
4. Verify translations (nb/en)

### Add New Tutorial
1. Create tutorial content
2. Define steps and progress checkpoints
3. Add route in `src/routes/tutorials/`
4. Test progress tracking

### Update API Documentation
1. Update content in docs-content package
2. Regenerate API reference if needed
3. Verify endpoint examples work
4. Test code samples

## Testing Commands

```bash
# Unit tests
pnpm test                   # Watch mode
pnpm test:run               # Run once

# E2E tests
pnpm test:e2e tests/e2e/docs-*.spec.ts     # All docs tests
pnpm test:e2e tests/e2e/docs-search.spec.ts # Search tests
pnpm test:e2e tests/e2e/docs-tutorial.spec.ts # Tutorial tests
```

## Environment Setup

```bash
# Required environment variables
VITE_API_URL=https://api.digilist.no
VITE_DOCS_BASE_URL=https://docs.digilist.no
```

## Build & Deploy

```bash
# Local build
pnpm build                  # Output: dist/

# Analyze bundle
pnpm build --mode analyze

# Deploy
pnpm deploy:docs-learning   # Deploy to docs-test.digilist.no
```

## Common Debugging

```bash
# Check docs-content package
pnpm --filter @xala/docs-content build

# Verify content files exist
ls packages/docs-content/content/

# Test API connectivity
curl https://api.digilist.no/health
```

## Important Notes

- **Mixed access** - Public docs + protected training
- **Multi-language** - All content in nb and en
- **Search-enabled** - Full-text search available
- **Progress tracking** - Tutorial progress saved
- **Markdown-based** - Content from docs-content package

## Thin App Rules

- Import ALL components from `@xala/ds`
- Use SDK hooks for ALL data operations
- No inline styles (except extensions.css)
- All text through `t()` function
