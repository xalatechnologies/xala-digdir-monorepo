# apps/docs-learning - Documentation & Learning Portal

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

The **docs-learning** app is the documentation and learning portal for the Xala/Digilist Platform. It provides users with training materials, guides, tutorials, and interactive documentation to learn the platform.

**Port:** 5179
**URL (local):** http://localhost:5179
**URL (test):** https://docs-test.digilist.no

---

## Key Characteristics

- **Public & authenticated content** - Some docs public, training requires login
- **Interactive tutorials** - Step-by-step guided learning
- **Search-enabled** - Full-text search across documentation
- **Multi-language** - Norwegian (nb) and English (en)
- **Markdown-based** - Content from @xala/docs-content package
- **Role-based content** - Different guides for different user types

---

## Directory Structure

```
apps/docs-learning/
├── src/
│   ├── routes/              # React Router routes
│   │   ├── DocsHomePage.tsx # Documentation home
│   │   ├── guides/          # User guides
│   │   ├── tutorials/       # Interactive tutorials
│   │   ├── api/             # API documentation
│   │   └── faq/             # Frequently asked questions
│   ├── components/          # Doc-specific components
│   │   ├── DocViewer/       # Markdown renderer
│   │   ├── CodeBlock/       # Syntax highlighted code
│   │   ├── SearchBar/       # Documentation search
│   │   └── TableOfContents/ # Navigation sidebar
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries
│   ├── providers/           # Context providers
│   ├── types/               # TypeScript types
│   └── main.tsx             # App entry point
├── public/                  # Static assets
│   └── themes/              # Theme CSS files
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies
```

---

## Development Commands

```bash
# From repository root
pnpm --filter @xala/docs-learning dev        # Start dev server
pnpm --filter @xala/docs-learning build      # Production build
pnpm --filter @xala/docs-learning preview    # Preview production build

# From this directory
pnpm dev                                     # Start dev server (port 5179)
pnpm build                                   # Production build
pnpm preview                                 # Preview build
```

---

## App-Specific Rules

### 1. Content Organization
- Public docs accessible without login
- Training content requires authentication
- Role-specific content (admin vs user guides)
- Version-specific documentation

### 2. Markdown Processing
- Use @xala/docs-content for content
- Support MDX for interactive components
- Syntax highlighting for code blocks
- Automatic table of contents generation

### 3. Search Implementation
- Full-text search across all docs
- Search suggestions and autocomplete
- Recent searches history
- Category filtering

### 4. Multi-Language Support
- All content in nb (Norwegian) and en (English)
- Language switcher in UI
- Fallback to Norwegian if translation missing
- Use @xala/i18n for UI strings

---

## Key Features

### Documentation Home
- **Location:** `src/routes/DocsHomePage.tsx`
- Quick start guides
- Popular documentation links
- Recent updates
- Search bar

### User Guides
- **Location:** `src/routes/guides/`
- Getting started
- Feature-specific guides
- Best practices
- Troubleshooting

### Tutorials
- **Location:** `src/routes/tutorials/`
- Step-by-step walkthroughs
- Interactive exercises
- Progress tracking
- Completion certificates

### API Documentation
- **Location:** `src/routes/api/`
- Endpoint reference
- Request/response examples
- Authentication guide
- Rate limit information

### FAQ
- **Location:** `src/routes/faq/`
- Common questions
- Searchable FAQ database
- Category filtering
- Expandable answers

---

## Integration Points

### SDK Services Used
```tsx
import {
  useAuth,                # User authentication
  useDocSearch,           # Documentation search
  useTutorialProgress,    # Tutorial progress tracking
} from '@digilist/client-sdk/hooks';
```

### Docs Content Package
```tsx
import {
  getGuide,
  searchDocs,
  getTableOfContents,
} from '@xala/docs-content';

// Load documentation content
const guide = await getGuide('getting-started', 'nb');
```

---

## Routing Structure

```
/                           # Documentation home
/guides                     # All guides
/guides/:category           # Category guides
/guides/:category/:slug     # Specific guide
/tutorials                  # All tutorials
/tutorials/:id              # Specific tutorial
/api                        # API documentation
/api/:endpoint              # Endpoint details
/faq                        # FAQ
/search                     # Search results
```

---

## Environment Variables

```bash
VITE_API_URL=https://api.digilist.no
VITE_DOCS_BASE_URL=https://docs.digilist.no
```

---

## Common Patterns

### Markdown Document Display
```tsx
import { DocViewer } from '@xala/ds';
import { getGuide } from '@xala/docs-content';

export function GuidePage({ slug }: { slug: string }) {
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    getGuide(slug, 'nb').then(setContent);
  }, [slug]);

  return <DocViewer content={content} />;
}
```

### Documentation Search
```tsx
import { useDocSearch } from '@digilist/client-sdk/hooks';

export function SearchResults({ query }: { query: string }) {
  const { data: results, isLoading } = useDocSearch(query);

  return (
    <SearchResultsList>
      {results?.map(result => (
        <SearchResultItem
          key={result.id}
          title={result.title}
          excerpt={result.excerpt}
          url={result.url}
        />
      ))}
    </SearchResultsList>
  );
}
```

### Tutorial Progress
```tsx
import { useTutorialProgress } from '@digilist/client-sdk/hooks';

export function TutorialStep({ tutorialId, step }: Props) {
  const { progress, markComplete } = useTutorialProgress(tutorialId);

  return (
    <TutorialContent>
      <StepContent />
      <Button onClick={() => markComplete(step)}>
        Mark Complete
      </Button>
      <ProgressBar value={progress} />
    </TutorialContent>
  );
}
```

---

## Testing

Tests are located in `../../tests/`:
- **E2E:** `tests/e2e/docs-*.spec.ts`
- **Unit:** Co-located with components (`src/**/*.test.tsx`)

```bash
# Run docs-specific E2E tests
pnpm test:e2e tests/e2e/docs-*.spec.ts
```

---

## Deployment

```bash
# Build for production
pnpm build

# Deploy to test environment
pnpm deploy:docs-learning

# Preview locally
pnpm preview
```

---

## Common Issues

### 1. Content Not Loading
- Check @xala/docs-content is built
- Verify content path is correct
- Check language fallback

### 2. Search Not Working
- Verify search index is built
- Check API connection
- Review search query syntax

### 3. Tutorial Progress Not Saving
- Verify user is authenticated
- Check API connectivity
- Review progress API response

---

## Thin App Compliance

This app follows the **Thin App Strategy**:
- All UI components imported from `@xala/ds`
- No business logic in UI (SDK-first)
- Design tokens only (one allowed exception: `extensions.css`)
- All text localized via `@xala/i18n`

---

## When in Doubt

1. Is content public or protected? -> Check route configuration
2. Is content available in both languages? -> Verify translations
3. Should this be searchable? -> Add to search index
4. Check root CLAUDE.md for architecture rules
5. Use SDK hooks for ALL data operations
6. Import components from `@xala/ds` only
7. Use `t()` for ALL user-facing text

---

**Last Updated:** 2026-01-20
**Status:** Production Ready
**Next Review:** After significant changes
