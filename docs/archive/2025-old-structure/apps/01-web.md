# Web Application

The Web application is the public-facing interface of the Xala Diglist Platform, designed for end users to discover, view, and book listings.

## Overview

The Web app serves as the primary entry point for:
- **Public users** browsing available listings
- **Registered users** managing bookings
- **Organization members** accessing their organization's listings

## Architecture

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: TanStack Query for server state
- **UI Components**: @xala/ds (Designsystemet facade)
- **Styling**: Design tokens with CSS-in-JS

### Application Structure
```
apps/web/src/
├── app.tsx                 # App root with providers
├── main.tsx               # Application entry point
├── routes/                # Route definitions
│   ├── __root.tsx         # Root layout
│   ├── index.tsx          # Home page
│   ├── listings/          # Listing routes
│   │   ├── index.tsx      # Listing list
│   │   ├── $id.tsx        # Listing details
│   │   └── search.tsx     # Search results
│   ├── booking/           # Booking routes
│   │   ├── create.tsx     # Create booking
│   │   └── confirmation.tsx # Booking confirmation
│   ├── auth/              # Authentication routes
│   │   ├── login.tsx      # Login page
│   │   └── callback.tsx   # OAuth callback
│   └── profile/           # User profile
│       ├── index.tsx      # Profile overview
│       └── bookings.tsx   # User bookings
├── features/              # Feature modules
│   ├── listings/          # Listing feature
│   │   ├── components/    # Listing components
│   │   ├── hooks/         # Listing hooks
│   │   └── services/      # Listing services
│   ├── booking/           # Booking feature
│   ├── search/            # Search feature
│   └── auth/              # Authentication feature
├── shared/                # Shared code
│   ├── components/        # Shared components
│   ├── hooks/             # Shared hooks
│   ├── utils/             # Utilities
│   └── types/             # Shared types
└── styles/                # Global styles
    └── globals.css        # Global CSS
```

## Key Features

### 1. Public Listing Discovery
```tsx
// routes/listings/index.tsx
export function Route() {
  const { data: listings, isLoading } = usePublicListings();
  
  return (
    <PageContainer>
      <SearchFilters />
      <ListingGrid>
        {listings?.map(listing => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onView={() => navigate(`/listings/${listing.id}`)}
          />
        ))}
      </ListingGrid>
    </PageContainer>
  );
}
```

### 2. Advanced Search
```tsx
// features/search/components/SearchFilters.tsx
export function SearchFilters() {
  const [filters, setFilters] = useSearchFilters();
  
  return (
    <Card>
      <Card.Header>
        <Card.Title>{t('search.title')}</Card.Title>
      </Card.Header>
      <Card.Content>
        <FormField>
          <Label>{t('search.location')}</Label>
          <Input
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            placeholder={t('search.locationPlaceholder')}
          />
        </FormField>
        
        <FormField>
          <Label>{t('search.dateRange')}</Label>
          <DateRangePicker
            value={filters.dateRange}
            onChange={(dateRange) => setFilters({ ...filters, dateRange })}
          />
        </FormField>
        
        <FormField>
          <Label>{t('search.capacity')}</Label>
          <Slider
            value={filters.capacity}
            onChange={(capacity) => setFilters({ ...filters, capacity })}
            min={1}
            max={100}
          />
        </FormField>
      </Card.Content>
    </Card>
  );
}
```

### 3. Booking Flow
```tsx
// routes/booking/create.tsx
export function Route() {
  const { listingId } = useParams({ from: '/booking/$listingId/create' });
  const { data: listing } = useListing(listingId);
  const createBooking = useCreateBooking();
  
  const handleSubmit = async (data: BookingFormData) => {
    try {
      const booking = await createBooking.mutateAsync({
        listingId,
        ...data
      });
      navigate(`/booking/confirmation/${booking.id}`);
    } catch (error) {
      showError(error);
    }
  };
  
  return (
    <PageContainer>
      <BookingForm
        listing={listing}
        onSubmit={handleSubmit}
        isSubmitting={createBooking.isPending}
      />
    </PageContainer>
  );
}
```

### 4. User Authentication
```tsx
// features/auth/components/AuthProvider.tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check for existing session
    checkSession().then(setUser);
  }, []);
  
  const login = async () => {
    const authUrl = await getAuthUrl();
    window.location.href = authUrl;
  };
  
  const logout = async () => {
    await logout();
    setUser(null);
    navigate('/');
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## Design System Integration

### Theme Configuration
```tsx
// app.tsx
export function App() {
  return (
    <DesignsystemetProvider
      theme="digdir"
      colorScheme="auto"
      size="md"
    >
      <BrowserRouter>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <I18nProvider>
              <Routes>
                <Route path="/" component={Root} />
              </Routes>
            </I18nProvider>
          </QueryClientProvider>
        </AuthProvider>
      </BrowserRouter>
    </DesignsystemetProvider>
  );
}
```

### Component Usage
```tsx
// Always use @xala/ds components
import { Button, Card, Input } from '@xala/ds';

function ListingCard({ listing }: { listing: ListingProjectionDTO }) {
  return (
    <Card className="listing-card">
      <Card.Media>
        <img src={listing.imageUrl} alt={listing.title} />
      </Card.Media>
      <Card.Content>
        <Card.Title>{listing.title}</Card.Title>
        <Card.Text>{listing.description}</Card.Text>
      </Card.Content>
      <Card.Actions>
        <Button variant="primary" onClick={handleView}>
          {t('common.view')}
        </Button>
      </Card.Actions>
    </Card>
  );
}
```

## Performance Optimizations

### 1. Code Splitting
```tsx
// Lazy load routes
const ListingDetails = lazy(() => import('../routes/listings/$id'));
const BookingCreate = lazy(() => import('../routes/booking/create'));

// Use Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/listings/:id" component={ListingDetails} />
    <Route path="/booking/:listingId/create" component={BookingCreate} />
  </Routes>
</Suspense>
```

### 2. Image Optimization
```tsx
// features/listings/components/OptimizedImage.tsx
export function OptimimizedImage({ 
  src, 
  alt, 
  width, 
  height 
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <div className="image-container">
      <img
        src={`${src}?w=${width}&h=${height}&f=webp`}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={cn('image', { loaded: isLoaded })}
      />
      {!isLoaded && <ImageSkeleton />}
    </div>
  );
}
```

### 3. Caching Strategy
```tsx
// features/listings/hooks/useListings.ts
export function usePublicListings(filters?: ListingFilters) {
  return useQuery({
    queryKey: queryKeys.listings.public(filters),
    queryFn: () => sdk.listing.findPublic(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}
```

## Accessibility

### ARIA Implementation
```tsx
// features/search/components/SearchInput.tsx
export function SearchInput() {
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  return (
    <div className="search-container">
      <Input
        role="combobox"
        aria-expanded={suggestions.length > 0}
        aria-autocomplete="list"
        aria-describedby="search-description"
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      {suggestions.length > 0 && (
        <ul role="listbox" aria-label="Search suggestions">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              role="option"
              aria-selected={index === activeIndex}
            >
              {suggestion.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Keyboard Navigation
```tsx
// features/listings/components/ListingGrid.tsx
export function ListingGrid() {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
        navigateNext();
        break;
      case 'ArrowLeft':
        navigatePrevious();
        break;
      case 'Enter':
        openCurrentListing();
        break;
    }
  };
  
  return (
    <div
      className="listing-grid"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="grid"
      aria-label="Listings"
    >
      {/* Listings */}
    </div>
  );
}
```

## Internationalization

### Language Switching
```tsx
// features/i18n/components/LanguageSwitcher.tsx
export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  
  return (
    <Select value={locale} onValueChange={setLocale}>
      <Select.Trigger>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="nb">Norsk</Select.Item>
        <Select.Item value="en">English</Select.Item>
      </Select.Content>
    </Select>
  );
}
```

### Date/Time Formatting
```tsx
// features/booking/components/BookingSummary.tsx
export function BookingSummary({ booking }: { booking: BookingProjectionDTO }) {
  const { formatDate, formatTime } = useI18n();
  
  return (
    <Card>
      <Card.Content>
        <p>
          {t('booking.date')}: {formatDate(booking.startTime)}
        </p>
        <p>
          {t('booking.time')}: {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
        </p>
      </Card.Content>
    </Card>
  );
}
```

## Error Handling

### Error Boundaries
```tsx
// shared/components/ErrorBoundary.tsx
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={() => this.setState({ hasError: false })} />;
    }
    
    return this.props.children;
  }
}
```

### API Error Handling
```tsx
// shared/hooks/useApiError.ts
export function useApiError() {
  const showError = useCallback((error: ApiError) => {
    if (error.status === 401) {
      navigate('/login');
    } else if (error.status === 403) {
      toast.error(t('error.forbidden'));
    } else {
      toast.error(error.title || t('error.unknown'));
    }
  }, []);
  
  return { showError };
}
```

## Testing

### Component Testing
```tsx
// features/listings/components/__tests__/ListingCard.test.tsx
describe('ListingCard', () => {
  it('renders listing information correctly', () => {
    const listing = createMockListing();
    
    render(<ListingCard listing={listing} />);
    
    expect(screen.getByText(listing.title)).toBeInTheDocument();
    expect(screen.getByText(listing.description)).toBeInTheDocument();
    expect(screen.getByAltText(listing.title)).toBeInTheDocument();
  });
  
  it('handles view button click', () => {
    const onView = jest.fn();
    const listing = createMockListing();
    
    render(<ListingCard listing={listing} onView={onView} />);
    
    fireEvent.click(screen.getByRole('button', { name: /view/i }));
    expect(onView).toHaveBeenCalledWith(listing.id);
  });
});
```

### E2E Testing
```typescript
// e2e/listing-search.spec.ts
test('should search and filter listings', async ({ page }) => {
  await page.goto('/');
  
  // Enter search term
  await page.fill('[data-testid="search-input"]', 'meeting room');
  await page.press('[data-testid="search-input"]', 'Enter');
  
  // Verify search results
  await expect(page.locator('[data-testid="listing-card"]')).toHaveCount(5);
  
  // Apply filter
  await page.selectOption('[data-testid="capacity-filter"]', '10-20');
  
  // Verify filtered results
  await expect(page.locator('[data-testid="listing-card"]')).toHaveCount(2);
});
```

## Deployment

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          ui: ['@xala/ds'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['@digilist/client-sdk'],
  },
});
```

### Environment Variables
```bash
# .env.production
VITE_API_BASE_URL=https://api.diglist.no
VITE_IDPORTEN_CLIENT_ID=web-prod
VITE_SENTRY_DSN=https://sentry-dsn
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

## Analytics & Monitoring

### Performance Monitoring
```tsx
// shared/hooks/usePerformanceTracking.ts
export function usePerformanceTracking() {
  useEffect(() => {
    // Track Core Web Vitals
    trackWebVitals({
      onLCP: (metric) => sendToAnalytics('LCP', metric),
      onFID: (metric) => sendToAnalytics('FID', metric),
      onCLS: (metric) => sendToAnalytics('CLS', metric),
    });
  }, []);
}
```

### User Analytics
```tsx
// shared/hooks/useAnalytics.ts
export function useAnalytics() {
  const trackEvent = useCallback((event: string, properties?: object) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', event, properties);
    }
  }, []);
  
  const trackPageView = useCallback((path: string) => {
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA-XXXXXXXXX', { page_path: path });
    }
  }, []);
  
  return { trackEvent, trackPageView };
}
```

## Best Practices

1. **Use projection DTOs directly** - no transformation
2. **Implement proper loading states** - enhance UX
3. **Handle errors gracefully** - show user-friendly messages
4. **Optimize images and assets** - improve performance
5. **Follow accessibility guidelines** - WCAG 2.1 AA
6. **Write comprehensive tests** - unit and E2E
7. **Use semantic HTML** - better SEO and accessibility

## Related Documentation

- [Client SDK](../packages/01-client-sdk.md)
- [Design System](../packages/02-design-system.md)
- [API Documentation](../apps/04-api.md)
- [Deployment Guide](../guides/03-deployment.md)
