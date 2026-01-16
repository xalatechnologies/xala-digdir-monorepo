# apps/web - Agent Commands

> **Extends:** [Root AGENTS.md](../../AGENTS.md)

## Quick Reference

```bash
# Development
pnpm dev                    # Start dev server (port 5173)
pnpm build                  # Build for production
pnpm preview                # Preview production build

# Testing
pnpm test                   # Run unit tests
pnpm test:e2e tests/e2e/web-*.spec.ts  # Run web E2E tests

# Deployment
pnpm deploy:web             # Deploy to test environment
```

## Package Filter Commands

```bash
# From repository root
pnpm --filter @xala/web dev
pnpm --filter @xala/web build
pnpm --filter @xala/web test
```

## Key Files

- `src/main.tsx` - App entry point
- `src/routes/` - Route definitions
- `src/features/` - Feature modules
- `vite.config.ts` - Build configuration
- `.env` - Environment variables

## SDK Services Used

- `useListings()` - Listing discovery
- `useListingDetails()` - Single listing
- `useAvailability()` - Booking availability
- `useBooking()` - Create bookings
- `useCategories()` - Categories

## Common Tasks

### Add New Public Page
1. Create route file in `src/routes/`
2. Add to router configuration
3. Use `AppShell` layout
4. Implement with public access (no auth)

### Add New Feature Module
1. Create directory in `src/features/`
2. Follow feature-based structure
3. Export components from `index.ts`
4. Add feature-specific tests

### Update Listing Display
1. Check `ListingCardProjectionDTO` type
2. Update component in `src/features/listings/`
3. Use existing DS components
4. Test responsive behavior

## Environment Setup

```bash
# Required environment variables
VITE_API_URL=https://api.digilist.no
VITE_TENANT_ID=default
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

## Testing Commands

```bash
# Unit tests
pnpm test                                   # Watch mode
pnpm test:run                               # Run once

# E2E tests
pnpm test:e2e tests/e2e/web-*.spec.ts     # Web-specific
pnpm test:e2e tests/e2e/booking-flow.spec.ts  # Booking flow
```

## Build & Deploy

```bash
# Local build
pnpm build                  # Output: dist/

# Analyze bundle
pnpm build --mode analyze

# Deploy
pnpm deploy:web            # Deploy to web-test.digilist.no
```

## Debugging

```bash
# Check build output
ls -lh dist/

# Verify environment
cat .env

# Test API connectivity
curl https://api.digilist.no/health
```
