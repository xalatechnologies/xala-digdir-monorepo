# apps/web - Public-Facing Web Application

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

The **web** app is the public-facing Vite + React application for the Xala/Digilist Platform. It serves as the main entry point for end-users to discover, browse, and book resources from Norwegian municipalities.

**Port:** 5173
**URL (local):** http://localhost:5173
**URL (test):** https://web-test.digilist.no

---

## Key Characteristics

- **Public-facing** - No authentication required for browsing
- **Discovery-focused** - Search and filter rental objects
- **Booking initiation** - Users can start booking flows
- **Responsive design** - Mobile-first, optimized for all devices
- **SEO-optimized** - Server-side rendering considerations for public pages
- **Multi-tenant** - Kommune branding via subdomain/path routing

---

## Directory Structure

```
apps/web/
├── src/
│   ├── features/           # Feature-based modules
│   │   ├── rental objects/       # Rental object discovery and details
│   │   ├── booking/        # Booking initiation flows
│   │   └── search/         # Search and filters
│   ├── routes/             # React Router routes
│   ├── components/         # Shared UI components
│   ├── providers/          # Context providers
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Helper utilities
│   └── main.tsx            # App entry point
├── public/                 # Static assets
│   └── themes/             # Theme CSS files
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript config
└── package.json            # Dependencies
```

---

## Development Commands

```bash
# From repository root
pnpm --filter @xala/web dev        # Start dev server
pnpm --filter @xala/web build      # Production build
pnpm --filter @xala/web preview    # Preview production build

# From this directory
pnpm dev                           # Start dev server
pnpm build                         # Production build
pnpm preview                       # Preview build
```

---

## App-Specific Rules

### 1. Public Access First
- Most pages are public (no auth required)
- Only booking confirmation/management requires authentication
- Handle anonymous users gracefully
- Use optional authentication pattern

### 2. Discovery UX
- Prominent search and filter UI
- Map-based browsing for location-based rental objects
- Category navigation
- Featured rental objects and promotions

### 3. Performance Critical
- Code splitting by route
- Lazy loading for heavy components (maps, calendars)
- Image optimization for rental object galleries
- Fast initial page load (<2s)

### 4. SEO Requirements
- Semantic HTML structure
- Meta tags for rental object pages
- Open Graph tags for social sharing
- Structured data (JSON-LD) for rental objects

### 5. Mobile-First Design
- Touch-friendly UI (minimum 44px tap targets)
- Responsive images and layouts
- Mobile-optimized booking flow
- Progressive Web App (PWA) capabilities

---

## Key Features

### Listing Discovery
- **Location:** `src/features/rental objects/`
- Search by location, category, date
- Map view with clustered markers
- List view with filters
- Sorting options (price, rating, distance)

### Booking Flow
- **Location:** `src/features/booking/`
- Calendar availability check
- Resource selection
- Guest information collection
- Redirect to payment/confirmation

### Search & Filters
- **Location:** `src/features/search/`
- Full-text search
- Multi-select filters (category, amenities, price range)
- Date range picker
- Location-based search (map bounds)

---

## Integration Points

### SDK Services Used
```tsx
import {
  useRental objects,        // Fetch and search rental objects
  useListingDetails,  // Get single listing
  useAvailability,    // Check booking availability
  useBooking,         // Create booking
  useCategories,      // Fetch categories
} from '@digilist/client-sdk/hooks';
```

### Design System Components
```tsx
import {
  AppShell,           // Main layout
  ContentLayout,      // Page content wrapper
  Card,               // Listing cards
  Button,             // CTAs
  SearchField,        # Search input
  FilterBar,          # Filter UI
  MapView,            # Map component
  Calendar,           # Date picker
} from '@xala/ds';
```

---

## Routing Structure

```
/                           # Homepage (featured rental objects)
/rental objects                   # Listing search/browse
/rental objects/:id               # Listing details
/rental objects/:id/book          # Booking flow
/categories/:slug           # Category page
/search                     # Search results
/about                      # About page
/contact                    # Contact page
/help                       # Help/FAQ
```

---

## Environment Variables

```bash
VITE_API_URL=https://api.digilist.no
VITE_WS_URL=wss://api.digilist.no/ws
VITE_TENANT_ID=default
VITE_GOOGLE_MAPS_API_KEY=...
VITE_VIPPS_CLIENT_ID=...
```

---

## Common Patterns

### Public Page Template
```tsx
import { useT } from '@xala/i18n';
import { AppShell, ContentLayout } from '@xala/ds';

export function PublicPage() {
  const t = useT();

  return (
    <AppShell title={t('page.title')}>
      <ContentLayout>
        {/* Page content */}
      </ContentLayout>
    </AppShell>
  );
}
```

### Listing Card Component
```tsx
import { Card, Heading, Paragraph, Button } from '@xala/ds';
import { useT } from '@xala/i18n';
import type { ListingCardProjectionDTO } from '@digilist/client-sdk/types';

interface ListingCardProps {
  listing: ListingCardProjectionDTO;
}

export function ListingCard({ listing }: ListingCardProps) {
  const t = useT();

  return (
    <Card>
      <img src={listing.imageUrl} alt={listing.title} />
      <Heading level={3}>{listing.title}</Heading>
      <Paragraph>{listing.description}</Paragraph>
      <Button href={`/rental objects/${listing.id}`}>
        {t('rental objects.viewDetails')}
      </Button>
    </Card>
  );
}
```

---

## Testing

Tests are located in `../../tests/`:
- **E2E:** `tests/e2e/web-*.spec.ts`
- **Unit:** Co-located with components (`src/**/*.test.tsx`)

```bash
# Run web-specific E2E tests
pnpm test:e2e tests/e2e/web-*.spec.ts

# Run unit tests
pnpm test
```

---

## Deployment

```bash
# Build for production
pnpm build

# Deploy to test environment
pnpm deploy:web

# Preview locally
pnpm preview
```

**Output:** `dist/` directory with static assets ready for CDN/hosting.

---

## Common Issues

### 1. Map Not Loading
- Check `VITE_GOOGLE_MAPS_API_KEY` is set
- Verify API key has Maps JavaScript API enabled
- Check browser console for API errors

### 2. Rental objects Not Appearing
- Verify API URL is correct
- Check tenant ID matches backend
- Confirm rental objects exist for the tenant

### 3. Search Performance
- Implement debouncing for search input (300ms)
- Use query caching via React Query
- Consider server-side pagination

---

## Performance Budget

- **Initial Load:** <2s (desktop), <3s (mobile)
- **Time to Interactive:** <3s
- **First Contentful Paint:** <1.5s
- **Bundle Size:** <300KB (main), <1MB (total)

---

## Analytics & Tracking

- Track page views on route change
- Track listing views and clicks
- Track booking initiation and completion
- Track search queries and filters used

---

## When in Doubt

1. Is this page public or private? → Default to public
2. Check root CLAUDE.md for architecture rules
3. Use SDK hooks for ALL data fetching
4. Import components from `@xala/ds` only
5. Use `t()` for ALL user-facing text
6. Optimize for mobile-first experience
