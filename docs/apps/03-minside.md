# Min Side Application

Min Side (My Page) is the personal dashboard for registered users of the Xala Diglist Platform, providing access to personal bookings, profile management, and account settings.

## Overview

Min Side serves as the user's personal hub for:
- **Booking management** - View, modify, and cancel personal bookings
- **Profile management** - Update personal information and preferences
- **Booking history** - Access past and upcoming bookings
- **Notifications** - Manage notifications and alerts
- **Personal settings** - Configure language, theme, and privacy

## Architecture

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: TanStack Query + Zustand
- **Routing**: React Router v6
- **UI Components**: @xala/ds
- **Forms**: React Hook Form + Zod
- **Authentication**: ID-porten integration

### Application Structure
```
apps/minside/src/
├── app.tsx                    # App root with providers
├── main.tsx                  # Entry point
├── routes/                   # Route definitions
│   ├── __root.tsx           # Root layout with navigation
│   ├── index.tsx            # Dashboard
│   ├── bookings/            # Booking management
│   │   ├── index.tsx        # Active bookings
│   │   ├── history.tsx      # Booking history
│   │   ├── $id.tsx          # Booking details
│   │   └── cancel.tsx       # Cancellation flow
│   ├── profile/             # Profile management
│   │   ├── index.tsx        # Profile overview
│   │   ├── personal.tsx     # Personal information
│   │   ├── security.tsx     # Security settings
│   │   └── preferences.tsx   # User preferences
│   ├── notifications/       # Notifications
│   │   ├── index.tsx        # Notification list
│   │   └── settings.tsx     # Notification settings
│   └── settings/            # Account settings
│       ├── index.tsx        # General settings
│       ├── privacy.tsx      # Privacy settings
│       ├── connected.tsx    # Connected services
│       └── help.tsx         # Help & support
├── features/                # Feature modules
│   ├── bookings/            # Booking feature
│   ├── profile/             # Profile feature
│   ├── notifications/       # Notification feature
│   └── settings/            # Settings feature
├── shared/                  # Shared code
│   ├── components/          # Shared components
│   ├── hooks/               # Shared hooks
│   ├── stores/              # Zustand stores
│   └── utils/               # Utilities
└── styles/                  # Global styles
```

## Key Features

### 1. Personal Dashboard
```typescript
// routes/index.tsx
export function Route() {
  const { data: user } = useCurrentUser();
  const { data: upcomingBookings } = useUpcomingBookings();
  const { data: notifications } = useUnreadNotifications();
  
  return (
    <PageContainer>
      <WelcomeSection>
        <WelcomeMessage>
          <Heading level={1}>
            {t('dashboard.welcome', { name: user.firstName })}
          </Heading>
          <Text>{t('dashboard.subtitle')}</Text>
        </WelcomeMessage>
        <QuickActions>
          <Button onClick={() => navigate('/bookings/new')}>
            <Icon name="plus" />
            {t('dashboard.newBooking')}
          </Button>
          <Button variant="outline" onClick={() => navigate('/bookings')}>
            <Icon name="calendar" />
            {t('dashboard.viewBookings')}
          </Button>
        </QuickActions>
      </WelcomeSection>
      
      <DashboardGrid>
        <Card>
          <Card.Header>
            <Card.Title>{t('dashboard.upcomingBookings')}</Card.Title>
            <Card.Link to="/bookings">{t('common.viewAll')}</Card.Link>
          </Card.Header>
          <Card.Content>
            {upcomingBookings?.length > 0 ? (
              <BookingList bookings={upcomingBookings.slice(0, 3)} compact />
            ) : (
              <EmptyState
                icon="calendar"
                title={t('dashboard.noUpcomingBookings')}
                description={t('dashboard.noUpcomingBookingsDesc')}
              />
            )}
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Header>
            <Card.Title>{t('dashboard.notifications')}</Card.Title>
            <Badge count={notifications?.length} />
          </Card.Header>
          <Card.Content>
            {notifications?.length > 0 ? (
              <NotificationList notifications={notifications.slice(0, 3)} />
            ) : (
              <EmptyState
                icon="bell"
                title={t('dashboard.noNotifications')}
                description={t('dashboard.noNotificationsDesc')}
              />
            )}
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Header>
            <Card.Title>{t('dashboard.quickStats')}</Card.Title>
          </Card.Header>
          <Card.Content>
            <StatsList>
              <StatItem
                label={t('dashboard.totalBookings')}
                value={user.stats.totalBookings}
              />
              <StatItem
                label={t('dashboard.thisMonth')}
                value={user.stats.bookingsThisMonth}
              />
              <StatItem
                label={t('dashboard.favoriteVenue')}
                value={user.stats.favoriteVenue}
              />
            </StatsList>
          </Card.Content>
        </Card>
      </DashboardGrid>
    </PageContainer>
  );
}
```

### 2. Booking Management
```typescript
// features/bookings/components/BookingCard.tsx
export function BookingCard({ booking }: BookingCardProps) {
  const cancelMutation = useCancelBooking();
  const modifyMutation = useModifyBooking();
  
  const handleCancel = async () => {
    const confirmed = await confirm(t('booking.cancelConfirm'));
    if (confirmed) {
      await cancelMutation.mutateAsync(booking.id);
    }
  };
  
  return (
    <Card className={cn('booking-card', { 'is-past': isPast(booking.endTime) })}>
      <Card.Content>
        <BookingHeader>
          <BookingInfo>
            <Heading level={3}>{booking.listingTitle}</Heading>
            <Text color="secondary">{booking.organizationName}</Text>
          </BookingInfo>
          <BookingStatus status={booking.status} />
        </BookingHeader>
        
        <BookingDetails>
          <DetailItem>
            <Icon name="calendar" />
            <span>{formatDate(booking.startTime)}</span>
          </DetailItem>
          <DetailItem>
            <Icon name="clock" />
            <span>
              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
            </span>
          </DetailItem>
          <DetailItem>
            <Icon name="map-pin" />
            <span>{booking.location}</span>
          </DetailItem>
        </BookingDetails>
        
        {booking.purpose && (
          <BookingPurpose>
            <Text weight="medium">{t('booking.purpose')}:</Text>
            <Text>{booking.purpose}</Text>
          </BookingPurpose>
        )}
      </Card.Content>
      
      {!isPast(booking.endTime) && (
        <Card.Actions>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/bookings/${booking.id}/modify`)}
          >
            {t('booking.modify')}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleCancel}
            disabled={cancelMutation.isLoading}
          >
            {t('booking.cancel')}
          </Button>
        </Card.Actions>
      )}
    </Card>
  );
}

// features/bookings/components/BookingHistory.tsx
export function BookingHistory() {
  const [filters, setFilters] = useBookingFilters();
  const { data: bookings, isLoading } = useBookingHistory(filters);
  
  return (
    <div>
      <HistoryHeader>
        <Heading level={2}>{t('booking.history.title')}</Heading>
        <Filters>
          <DateRangePicker
            value={filters.dateRange}
            onChange={(range) => setFilters({ ...filters, dateRange: range })}
          />
          <StatusFilter
            value={filters.status}
            onChange={(status) => setFilters({ ...filters, status })}
          />
        </Filters>
      </HistoryHeader>
      
      <BookingList>
        {bookings?.map(booking => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </BookingList>
      
      {isLoading && <BookingSkeleton count={5} />}
    </div>
  );
}
```

### 3. Profile Management
```typescript
// features/profile/components/PersonalInfo.tsx
export function PersonalInfo() {
  const { data: user } = useCurrentUser();
  const updateMutation = useUpdateProfile();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: user,
  });
  
  const onSubmit = async (data: PersonalInfoForm) => {
    try {
      await updateMutation.mutateAsync(data);
      reset(data);
      toast.success(t('profile.updateSuccess'));
    } catch (error) {
      toast.error(t('profile.updateError'));
    }
  };
  
  return (
    <Card>
      <Card.Header>
        <Card.Title>{t('profile.personalInfo.title')}</Card.Title>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit(onSubmit)}>
          <AvatarSection>
            <Avatar
              src={user.avatar}
              size="lg"
              editable
              onAvatarChange={handleAvatarChange}
            />
            <AvatarInfo>
              <Text weight="medium">{t('profile.avatar')}</Text>
              <Text size="sm" color="secondary">
                {t('profile.avatarHint')}
              </Text>
            </AvatarInfo>
          </AvatarSection>
          
          <FormGrid>
            <FormField>
              <Label>{t('profile.firstName')}</Label>
              <Input
                {...register('firstName')}
                error={errors.firstName?.message}
              />
            </FormField>
            
            <FormField>
              <Label>{t('profile.lastName')}</Label>
              <Input
                {...register('lastName')}
                error={errors.lastName?.message}
              />
            </FormField>
            
            <FormField>
              <Label>{t('profile.email')}</Label>
              <Input
                {...register('email')}
                type="email"
                error={errors.email?.message}
                disabled // Email change requires verification
              />
            </FormField>
            
            <FormField>
              <Label>{t('profile.phone')}</Label>
              <Input
                {...register('phone')}
                type="tel"
                error={errors.phone?.message}
              />
            </FormField>
          </FormGrid>
          
          <FormActions>
            <Button
              type="submit"
              disabled={!isDirty || updateMutation.isLoading}
            >
              {updateMutation.isLoading
                ? t('common.saving')
                : t('common.save')
              }
            </Button>
          </FormActions>
        </form>
      </Card.Content>
    </Card>
  );
}

// features/profile/components/SecuritySettings.tsx
export function SecuritySettings() {
  const { data: user } = useCurrentUser();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  
  return (
    <div>
      <Section>
        <Card>
          <Card.Header>
            <Card.Title>{t('profile.security.password')}</Card.Title>
          </Card.Header>
          <Card.Content>
            <SecurityItem>
              <SecurityInfo>
                <Text weight="medium">{t('profile.security.currentPassword')}</Text>
                <Text size="sm" color="secondary">
                  {t('profile.security.lastChanged', {
                    date: formatDate(user.passwordLastChanged),
                  })}
                </Text>
              </SecurityInfo>
              <Button
                variant="outline"
                onClick={() => setShowPasswordForm(true)}
              >
                {t('profile.security.changePassword')}
              </Button>
            </SecurityItem>
          </Card.Content>
        </Card>
      </Section>
      
      <Section>
        <Card>
          <Card.Header>
            <Card.Title>{t('profile.security.twoFactor')}</Card.Title>
          </Card.Header>
          <Card.Content>
            <SecurityItem>
              <SecurityInfo>
                <Text weight="medium">
                  {user.twoFactorEnabled
                    ? t('profile.security.2faEnabled')
                    : t('profile.security.2faDisabled')
                  }
                </Text>
                <Text size="sm" color="secondary">
                  {t('profile.security.2faDescription')}
                </Text>
              </SecurityInfo>
              <Toggle
                pressed={user.twoFactorEnabled}
                onPressedChange={() => setShow2FAModal(true)}
              />
            </SecurityItem>
          </Card.Content>
        </Card>
      </Section>
      
      <PasswordChangeModal
        isOpen={showPasswordForm}
        onClose={() => setShowPasswordForm(false)}
      />
      
      <TwoFAModal
        isOpen={show2FAModal}
        enabled={user.twoFactorEnabled}
        onClose={() => setShow2FAModal(false)}
      />
    </div>
  );
}
```

### 4. Notifications
```typescript
// features/notifications/components/NotificationList.tsx
export function NotificationList() {
  const { data: notifications, isLoading } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  
  const handleMarkAsRead = async (id: string) => {
    await markAsReadMutation.mutateAsync(id);
  };
  
  return (
    <div>
      <NotificationHeader>
        <Heading level={2}>{t('notifications.title')}</Heading>
        <MarkAllAsRead onClick={handleMarkAllAsRead}>
          {t('notifications.markAllAsRead')}
        </MarkAllAsRead>
      </NotificationHeader>
      
      <NotificationGroup>
        {notifications?.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRead={() => handleMarkAsRead(notification.id)}
          />
        ))}
      </NotificationGroup>
      
      {isLoading && <NotificationSkeleton count={5} />}
    </div>
  );
}

// features/notifications/components/NotificationItem.tsx
export function NotificationItem({ 
  notification, 
  onRead 
}: NotificationItemProps) {
  return (
    <NotificationCard
      className={cn({ 'is-unread': !notification.read })}
      onClick={() => onRead(notification.id)}
    >
      <NotificationIcon>
        <Icon name={getNotificationIcon(notification.type)} />
      </NotificationIcon>
      
      <NotificationContent>
        <NotificationTitle>
          {notification.title}
        </NotificationTitle>
        <NotificationMessage>
          {notification.message}
        </NotificationMessage>
        <NotificationTime>
          {formatRelativeTime(notification.createdAt)}
        </NotificationTime>
      </NotificationContent>
      
      <NotificationActions>
        {notification.actionUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(notification.actionUrl);
            }}
          >
            {t('notifications.view')}
          </Button>
        )}
      </NotificationActions>
    </NotificationCard>
  );
}
```

### 5. Mobile Responsiveness
```typescript
// shared/components/MobileNavigation.tsx
export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  return (
    <>
      <MobileHeader>
        <MenuButton
          onClick={() => setIsOpen(!isOpen)}
          aria-label={t('common.menu')}
        >
          <Icon name="menu" />
        </MenuButton>
        <Logo src="/logo.svg" alt="Diglist" />
        <NotificationButton onClick={() => navigate('/notifications')}>
          <Icon name="bell" />
          <NotificationBadge count={unreadCount} />
        </NotificationButton>
      </MobileHeader>
      
      <MobileMenu isOpen={isOpen}>
        <MenuOverlay onClick={() => setIsOpen(false)} />
        <MenuContent>
          <MenuHeader>
            <UserInfo user={currentUser} />
          </MenuHeader>
          <MenuList>
            <MenuItem>
              <MenuLink
                to="/"
                active={location.pathname === '/'}
                onClick={() => setIsOpen(false)}
              >
                <Icon name="home" />
                {t('nav.dashboard')}
              </MenuLink>
            </MenuItem>
            <MenuItem>
              <MenuLink
                to="/bookings"
                active={location.pathname.startsWith('/bookings')}
                onClick={() => setIsOpen(false)}
              >
                <Icon name="calendar" />
                {t('nav.bookings')}
              </MenuLink>
            </MenuItem>
            <MenuItem>
              <MenuLink
                to="/profile"
                active={location.pathname.startsWith('/profile')}
                onClick={() => setIsOpen(false)}
              >
                <Icon name="user" />
                {t('nav.profile')}
              </MenuLink>
            </MenuItem>
          </MenuList>
          <MenuFooter>
            <ThemeSwitcher />
            <LanguageSwitcher />
            <LogoutButton onClick={handleLogout}>
              <Icon name="logout" />
              {t('nav.logout')}
            </LogoutButton>
          </MenuFooter>
        </MenuContent>
      </MobileMenu>
    </>
  );
}
```

## State Management

### User Store
```typescript
// shared/stores/user-store.ts
interface UserState {
  user: User | null;
  preferences: UserPreferences;
  
  // Actions
  setUser: (user: User) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  preferences: {
    language: 'nb',
    theme: 'auto',
    notifications: {
      email: true,
      push: false,
      sms: false,
    },
  },
  
  setUser: (user) => set({ user }),
  
  updatePreferences: (prefs) => set(state => ({
    preferences: { ...state.preferences, ...prefs }
  })),
  
  clearUser: () => set({ user: null }),
}));
```

### Booking Store
```typescript
// shared/stores/booking-store.ts
interface BookingState {
  selectedBooking: Booking | null;
  bookingHistory: Booking[];
  filters: BookingFilters;
  
  // Actions
  setSelectedBooking: (booking: Booking | null) => void;
  setFilters: (filters: BookingFilters) => void;
  addToHistory: (booking: Booking) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedBooking: null,
  bookingHistory: [],
  filters: {
    status: 'all',
    dateRange: 'upcoming',
  },
  
  setSelectedBooking: (booking) => set({ selectedBooking: booking }),
  setFilters: (filters) => set({ filters }),
  addToHistory: (booking) => set(state => ({
    bookingHistory: [...state.bookingHistory, booking],
  })),
}));
```

## Performance Optimizations

### Image Optimization
```typescript
// shared/components/OptimizedImage.tsx
export function OptimimizedImage({ 
  src, 
  alt, 
  width, 
  height,
  className 
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const optimizedSrc = useMemo(() => {
    if (!src) return null;
    
    // Generate responsive image URL
    const url = new URL(src, window.location.origin);
    url.searchParams.set('w', width.toString());
    url.searchParams.set('h', height.toString());
    url.searchParams.set('f', 'webp');
    
    return url.toString();
  }, [src, width, height]);
  
  return (
    <div className={cn('optimized-image', className, { loaded: isLoaded })}>
      {optimizedSrc && (
        <img
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
      {!isLoaded && !hasError && <ImageSkeleton />}
      {hasError && <ImageError />}
    </div>
  );
}
```

### Route-Based Code Splitting
```typescript
// routes/__root.tsx
import { lazy, Suspense } from 'react';

// Lazy load routes
const Profile = lazy(() => import('./profile'));
const Bookings = lazy(() => import('./bookings'));
const Settings = lazy(() => import('./settings'));

export function Route() {
  return (
    <div>
      <Navigation />
      <main>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile/*" element={<Profile />} />
            <Route path="/bookings/*" element={<Bookings />} />
            <Route path="/settings/*" element={<Settings />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
```

## Testing

### Component Testing
```typescript
// features/bookings/components/__tests__/BookingCard.test.tsx
describe('BookingCard', () => {
  it('renders booking information', () => {
    const booking = createMockBooking({
      listingTitle: 'Meeting Room A',
      startTime: new Date('2024-01-15T10:00:00Z'),
      endTime: new Date('2024-01-15T12:00:00Z'),
    });
    
    render(<BookingCard booking={booking} />);
    
    expect(screen.getByText('Meeting Room A')).toBeInTheDocument();
    expect(screen.getByText('15.01.2024')).toBeInTheDocument();
    expect(screen.getByText('10:00 - 12:00')).toBeInTheDocument();
  });
  
  it('shows action buttons for upcoming bookings', () => {
    const futureBooking = createMockBooking({
      endTime: addDays(new Date(), 1),
    });
    
    render(<BookingCard booking={futureBooking} />);
    
    expect(screen.getByText('booking.modify')).toBeInTheDocument();
    expect(screen.getByText('booking.cancel')).toBeInTheDocument();
  });
  
  it('hides action buttons for past bookings', () => {
    const pastBooking = createMockBooking({
      endTime: subDays(new Date(), 1),
    });
    
    render(<BookingCard booking={pastBooking} />);
    
    expect(screen.queryByText('booking.modify')).not.toBeInTheDocument();
    expect(screen.queryByText('booking.cancel')).not.toBeInTheDocument();
  });
});
```

### E2E Testing
```typescript
// e2e/minside/user-journey.spec.ts
test.describe('User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/');
  });
  
  test('can view and manage bookings', async ({ page }) => {
    // View dashboard
    await expect(page.locator('h1')).toContainText('Welcome, John');
    
    // Navigate to bookings
    await page.click('[data-testid="nav-bookings"]');
    await expect(page).toHaveURL('/bookings');
    
    // View booking details
    await page.click('[data-testid="booking-card"]:first-child');
    await expect(page.locator('[data-testid="booking-details"]')).toBeVisible();
    
    // Modify booking
    await page.click('[data-testid="modify-booking"]');
    await page.fill('[data-testid="purpose"]', 'Updated purpose');
    await page.click('[data-testid="save-booking"]');
    await expect(page.locator('text=Booking updated')).toBeVisible();
  });
  
  test('can update profile', async ({ page }) => {
    await page.click('[data-testid="nav-profile"]');
    await page.click('[data-testid="edit-profile"]');
    
    await page.fill('[data-testid="first-name"]', 'Jane');
    await page.fill('[data-testid="phone"]', '+47 123 45 678');
    await page.click('[data-testid="save-profile"]');
    
    await expect(page.locator('text=Profile updated')).toBeVisible();
    await expect(page.locator('[data-testid="display-name"]')).toContainText('Jane');
  });
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
    sourcemap: true,
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  server: {
    port: 5175,
  },
});
```

### PWA Configuration
```typescript
// vite.config.pwa.ts
import { VitePWA } from 'vite-plugin-pwa';

export const pwaConfig = VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
  manifest: {
    name: 'Diglist Min Side',
    short_name: 'Min Side',
    description: 'Personal dashboard for Diglist bookings',
    theme_color: '#005124',
    background_color: '#ffffff',
    display: 'standalone',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
});
```

## Best Practices

### 1. User Experience
- Provide clear feedback for all actions
- Use loading states for better perceived performance
- Implement proper error handling with recovery options
- Support keyboard navigation and screen readers

### 2. Performance
- Implement route-based code splitting
- Use image optimization and lazy loading
- Cache user data appropriately
- Minimize bundle size

### 3. Security
- Never expose sensitive information
- Implement proper session management
- Use secure communication channels
- Validate all user inputs

### 4. Accessibility
- Ensure WCAG 2.1 AA compliance
- Test with screen readers
- Provide sufficient color contrast
- Support keyboard navigation

## Related Documentation

- [Client SDK](../packages/01-client-sdk.md)
- [Application Architecture](../architecture/03-applications.md)
- [i18n Package](../packages/06-i18n.md)
- [Accessibility Guide](../guides/05-accessibility.md)
