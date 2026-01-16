# Development Workflow

This guide outlines the day-to-day development practices for working on the Xala Diglist Platform.

## Code Organization

### Feature-Based Structure
We organize code by features, not by file types:

```
apps/backoffice/src/
├── features/
│   ├── listings/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── bookings/
│   └── users/
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── app.tsx
```

### Naming Conventions
- **Components**: PascalCase (e.g., `ListingCard.tsx`)
- **Files**: kebab-case for folders, PascalCase for components
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types**: PascalCase with descriptive suffixes (e.g., `ListingDTO`)

## Daily Development Process

### 1. Start Your Day
```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
pnpm install

# Start development servers
pnpm dev
```

### 2. Create a Feature Branch
```bash
# Use conventional commits
git checkout -b feature/listing-search-filter
# or
git checkout -b fix/booking-validation-error
# or
git checkout -b docs/api-endpoint-updates
```

### 3. Development Checklist
Before writing code:
- [ ] Understand the requirements and acceptance criteria
- [ ] Check for existing similar implementations
- [ ] Review the contract-first principles
- [ ] Plan your component structure

While coding:
- [ ] Use only `@xala/ds` components
- [ ] Follow the no-transformers rule
- [ ] Write tests alongside code
- [ ] Add proper TypeScript types
- [ ] Include accessibility attributes

Before committing:
- [ ] Run `pnpm lint` - check linting
- [ ] Run `pnpm scan` - check design system compliance
- [ ] Run `pnpm test` - run unit tests
- [ ] Run `pnpm scan:compliance` - check contract compliance

### 4. Code Review Process
- Create a pull request with clear description
- Ensure all checks pass
- Request review from team members
- Address feedback promptly
- Maintain clean commit history

## Component Development

### Creating a New Component
```tsx
// apps/backoffice/src/features/listings/components/ListingCard.tsx
import { Card } from '@xala/ds';
import { t } from '@xala/i18n';
import type { ListingCardProjectionDTO } from '@digilist/client-sdk';

interface ListingCardProps {
  listing: ListingCardProjectionDTO;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ListingCard({ listing, onEdit, onDelete }: ListingCardProps) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>{listing.title}</Card.Title>
        {listing.permissions.canEdit && (
          <Card.Actions>
            {onEdit && <Button onClick={onEdit}>{t('common.edit')}</Button>}
            {onDelete && <Button variant="danger" onClick={onDelete}>{t('common.delete')}</Button>}
          </Card.Actions>
        )}
      </Card.Header>
      <Card.Content>
        <p>{listing.description}</p>
      </Card.Content>
    </Card>
  );
}
```

### Component Best Practices
1. **Use Projection DTOs directly** - no transformation
2. **Handle permissions in UI** - based on DTO permissions
3. **Internationalize all text** - use `t()` function
4. **Make components composable** - use composition over inheritance
5. **Add proper props interface** - with TypeScript types

## API Integration

### Using the Client SDK
```tsx
// apps/backoffice/src/features/listings/hooks/useListings.ts
import { useQuery } from '@tanstack/react-query';
import { sdk } from '@digilist/client-sdk';
import { queryKeys } from '../services/query-keys';

export function useListings(filters?: ListingFilters) {
  return useQuery({
    queryKey: queryKeys.listings.filtered(filters),
    queryFn: () => sdk.listing.findMany(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### API Development Pattern
1. **Define contract in API** - create Projection DTO
2. **Generate SDK types** - automatic from OpenAPI
3. **Implement in frontend** - use SDK directly
4. **Add tests** - contract parity tests

## Testing Strategy

### Unit Tests
```tsx
// apps/backoffice/src/features/listings/components/__tests__/ListingCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ListingCard } from '../ListingCard';
import { mockListingCard } from '../../__mocks__/listing.mock';

describe('ListingCard', () => {
  it('renders listing information', () => {
    render(<ListingCard listing={mockListingCard} />);
    
    expect(screen.getByText(mockListingCard.title)).toBeInTheDocument();
    expect(screen.getByText(mockListingCard.description)).toBeInTheDocument();
  });

  it('shows edit button when user has permission', () => {
    render(<ListingCard listing={mockListingCard} onEdit={jest.fn()} />);
    
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });
});
```

### Test Organization
- **Unit tests**: Next to components (`__tests__/` folder)
- **Integration tests**: Feature level (`__tests__/integration/`)
- **E2E tests**: In `tests/e2e/` directory
- **Contract tests**: In SDK package

## Internationalization

### Adding Translations
1. **Use translation keys in code**:
```tsx
const title = t('listing.card.title');
const message = t('listing.card.description', { count: items.length });
```

2. **Add to locale files**:
```typescript
// packages/i18n/src/locales/nb.ts
export default {
  listing: {
    card: {
      title: 'Listingskort',
      description: 'Beskrivelse',
    },
  },
};
```

3. **Scan for missing keys**:
```bash
node scripts/scan-i18n.js apps/backoffice/src
```

## Design System Usage

### Correct Usage
```tsx
import { Button, Card, Input } from '@xala/ds';

// Always use DS components
<Button variant="primary" onClick={handleClick}>
  {t('common.save')}
</Button>
```

### Incorrect Usage
```tsx
// NEVER import directly from @digdir
import { Button as DsButton } from '@digdir/designsystemet-react';

// NEVER use raw HTML elements
<button onClick={handleClick}>Save</button>

// NEVER hardcode styles
<div style={{ padding: '16px' }}>Content</div>
```

## Performance Considerations

### React Best Practices
1. **Use React.memo** for expensive components
2. **Implement proper dependency arrays** in hooks
3. **Lazy load routes and components**
4. **Optimize re-renders** with useCallback/useMemo

### Bundle Optimization
```tsx
// Lazy load components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Dynamic imports for large libraries
const loadChart = () => import('chart.js').then(mod => mod.default);
```

## Debugging Tips

### Common Issues
1. **Design system errors** - check imports are from `@xala/ds`
2. **Type errors** - ensure using SDK types directly
3. **Test failures** - check mock data matches contracts
4. **Build errors** - verify all imports are correct

### Debug Tools
- **React DevTools** - component inspection
- **TanStack DevTools** - query debugging
- **Browser Console** - error tracking
- **Network Tab** - API debugging

## Git Workflow

### Commit Message Format
```
type(scope): description

feat(listings): add search filters
fix(bookings): resolve validation error
docs(api): update endpoint documentation
refactor(components): extract common button styles
```

### Branch Strategy
- `main` - production-ready code
- `develop` - integration branch
- `feature/*` - new features
- `fix/*` - bug fixes
- `docs/*` - documentation changes

## Code Quality Tools

### Automated Checks
```bash
# Lint all code
pnpm lint

# Check design system compliance
pnpm scan

# Verify contract compliance
pnpm scan:compliance

# Run all tests
pnpm test:all
```

### Manual Reviews
- Code review in pull requests
- Architecture review for major changes
- Security review for sensitive changes
- Performance review for optimizations

## Getting Help

### Resources
- [Architecture documentation](./architecture/01-overview.md)
- [Component library docs](./packages/02-design-system.md)
- [API documentation](./apps/04-api.md)
- [Troubleshooting guide](./reference/02-troubleshooting.md)

### Team Communication
- Daily standups for progress updates
- Slack channels for quick questions
- Regular code review sessions
- Architecture decision records (ADRs)
