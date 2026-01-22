# Backoffice Application

The Backoffice application is the administrative interface for the Xala Diglist Platform, designed for organization administrators to manage listings, bookings, users, and organizational settings.

## Overview

The Backoffice serves as the central hub for:
- **Listing management** - Create, edit, and manage organization listings
- **Booking oversight** - View, approve, and manage all bookings
- **User administration** - Manage user roles and permissions
- **Analytics & Reporting** - Monitor usage and generate reports
- **Organization settings** - Configure organization-specific features

## Architecture

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: TanStack Query + Zustand
- **Routing**: React Router v6
- **UI Components**: @xala/ds
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts / D3.js
- **Tables**: TanStack Table

### Application Structure
```
apps/backoffice/src/
├── app.tsx                    # App root with providers
├── main.tsx                  # Entry point
├── routes/                   # Route definitions
│   ├── __root.tsx           # Root layout with navigation
│   ├── index.tsx            # Dashboard
│   ├── listings/            # Listing management
│   │   ├── index.tsx        # Listing list
│   │   ├── $id.tsx          # Listing details/edit
│   │   ├── create.tsx       # Create new listing
│   │   └── bulk.tsx         # Bulk operations
│   ├── bookings/            # Booking management
│   │   ├── index.tsx        # Booking list
│   │   ├── $id.tsx          # Booking details
│   │   ├── calendar.tsx     # Calendar view
│   │   └── conflicts.tsx    # Conflict resolution
│   ├── users/               # User management
│   │   ├── index.tsx        # User list
│   │   ├── $id.tsx          # User details
│   │   ├── roles.tsx        # Role management
│   │   └── permissions.tsx  # Permission matrix
│   ├── analytics/           # Analytics & reports
│   │   ├── index.tsx        # Overview dashboard
│   │   ├── listings.tsx     # Listing analytics
│   │   ├── bookings.tsx     # Booking analytics
│   │   └── reports.tsx      # Report generation
│   └── settings/            # Organization settings
│       ├── index.tsx        # General settings
│       ├── branding.tsx     # Brand customization
│       ├── integrations.tsx # API integrations
│       └── audit.tsx        # Audit logs
├── features/                # Feature modules
│   ├── listings/            # Listing feature
│   │   ├── components/      # Listing components
│   │   ├── hooks/           # Listing hooks
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utilities
│   ├── bookings/            # Booking feature
│   ├── users/               # User feature
│   ├── analytics/           # Analytics feature
│   └── settings/            # Settings feature
├── shared/                  # Shared code
│   ├── components/          # Shared components
│   ├── hooks/               # Shared hooks
│   ├── stores/              # Zustand stores
│   └── utils/               # Utilities
└── styles/                  # Global styles
```

## Key Features

### 1. Dashboard Overview
```typescript
// routes/index.tsx
export function Route() {
  const { data: stats } = useDashboardStats();
  const { data: recentBookings } = useRecentBookings();
  const { data: popularListings } = usePopularListings();
  
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Dashboard</PageTitle>
        <PageActions>
          <Button onClick={exportReport}>
            <Icon name="download" />
            Export Report
          </Button>
        </PageActions>
      </PageHeader>
      
      <StatsGrid>
        <StatCard
          title="Total Listings"
          value={stats.totalListings}
          change={stats.listingsChange}
          icon="building"
        />
        <StatCard
          title="Active Bookings"
          value={stats.activeBookings}
          change={stats.bookingsChange}
          icon="calendar"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          change={stats.usersChange}
          icon="users"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.revenue)}
          change={stats.revenueChange}
          icon="currency"
        />
      </StatsGrid>
      
      <ChartsSection>
        <BookingTrendChart data={stats.bookingTrend} />
        <PopularListingsChart data={popularListings} />
      </ChartsSection>
      
      <RecentActivity>
        <RecentBookings bookings={recentBookings} />
      </RecentActivity>
    </PageContainer>
  );
}
```

### 2. Listing Management
```typescript
// features/listings/components/ListingManager.tsx
export function ListingManager() {
  const [filters, setFilters] = useListingFilters();
  const { data: listings, isLoading } = useListings(filters);
  const selectedRows = useSelectedRows();
  const permissions = usePermissions();
  
  return (
    <div>
      <ListingHeader>
        <SearchFilters filters={filters} onChange={setFilters} />
        <Actions>
          {permissions.canCreateListing && (
            <Button onClick={() => navigate('/listings/create')}>
              Create Listing
            </Button>
          )}
          {selectedRows.length > 0 && (
            <BulkActions selectedIds={selectedRows} />
          )}
        </Actions>
      </ListingHeader>
      
      <ListingTable
        data={listings}
        columns={createListingColumns(permissions)}
        onRowSelect={selectedRows.toggle}
        loading={isLoading}
      />
      
      <Pagination
        page={filters.page}
        pageSize={filters.pageSize}
        total={listings?.total}
        onChange={setFilters}
      />
    </div>
  );
}

// features/listings/components/ListingForm.tsx
export function ListingForm({ listing, onSave }: ListingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: listing,
  });
  
  const [images, setImages] = useState(listing?.images || []);
  const [amenities, setAmenities] = useState(listing?.amenities || []);
  
  return (
    <form onSubmit={handleSubmit(onSave)}>
      <Tabs defaultValue="basic">
        <Tabs.List>
          <Tabs.Trigger value="basic">Basic Info</Tabs.Trigger>
          <Tabs.Trigger value="details">Details</Tabs.Trigger>
          <Tabs.Trigger value="availability">Availability</Tabs.Trigger>
          <Tabs.Trigger value="images">Images</Tabs.Trigger>
        </Tabs.List>
        
        <Tabs.Content value="basic">
          <FormField>
            <Label>Title</Label>
            <Input
              {...register('title')}
              error={errors.title?.message}
              placeholder="Enter listing title"
            />
          </FormField>
          
          <FormField>
            <Label>Description</Label>
            <Textarea
              {...register('description')}
              error={errors.description?.message}
              rows={4}
            />
          </FormField>
          
          <FormField>
            <Label>Category</Label>
            <Select
              value={watch('category')}
              onValueChange={(value) => setValue('category', value)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Select category" />
              </Select.Trigger>
              <Select.Content>
                {categories.map(cat => (
                  <Select.Item key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </FormField>
        </Tabs.Content>
        
        <Tabs.Content value="details">
          <LocationSelector
            value={watch('location')}
            onChange={(location) => setValue('location', location)}
          />
          
          <CapacitySelector
            value={watch('capacity')}
            onChange={(capacity) => setValue('capacity', capacity)}
          />
          
          <AmenitySelector
            value={amenities}
            onChange={setAmenities}
          />
        </Tabs.Content>
        
        <Tabs.Content value="availability">
          <AvailabilityRules
            value={watch('availabilityRules')}
            onChange={(rules) => setValue('availabilityRules', rules)}
          />
        </Tabs.Content>
        
        <Tabs.Content value="images">
          <ImageUploader
            images={images}
            onChange={setImages}
            maxImages={10}
          />
        </Tabs.Content>
      </Tabs>
      
      <FormActions>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {listing ? 'Update' : 'Create'} Listing
        </Button>
      </FormActions>
    </form>
  );
}
```

### 3. Booking Management
```typescript
// features/bookings/components/BookingCalendar.tsx
export function BookingCalendar() {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const { data: bookings } = useBookingsForDate(date);
  
  return (
    <div>
      <CalendarHeader>
        <DatePicker value={date} onChange={setDate} />
        <ViewToggle value={view} onChange={setView} />
        <Filters>
          <StatusFilter />
          <ListingFilter />
        </Filters>
      </CalendarHeader>
      
      <Calendar
        date={date}
        view={view}
        events={bookings}
        onEventClick={handleBookingClick}
        onSlotClick={handleTimeSlotClick}
      />
      
      <BookingDrawer
        isOpen={selectedBooking !== null}
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
}

// features/bookings/components/ConflictResolution.tsx
export function ConflictResolution({ conflicts }: ConflictResolutionProps) {
  return (
    <Alert variant="warning">
      <Alert.Title>Booking Conflicts Detected</Alert.Title>
      <Alert.Description>
        The following time slots have conflicts:
      </Alert.Description>
      
      <ConflictList>
        {conflicts.map(conflict => (
          <ConflictItem key={conflict.id}>
            <ConflictInfo>
              <Text>{conflict.listingTitle}</Text>
              <Text color="secondary">
                {formatDateTime(conflict.startTime)} - {formatDateTime(conflict.endTime)}
              </Text>
            </ConflictInfo>
            <ConflictActions>
              <Button size="sm" onClick={() => resolveConflict(conflict)}>
                Resolve
              </Button>
            </ConflictActions>
          </ConflictItem>
        ))}
      </ConflictList>
    </Alert>
  );
}
```

### 4. User Management
```typescript
// features/users/components/UserManagement.tsx
export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  
  return (
    <div>
      <UserHeader>
        <SearchBar onSearch={handleSearch} />
        <Actions>
          <Button onClick={() => setShowInviteModal(true)}>
            Invite User
          </Button>
          <Button variant="outline" onClick={exportUsers}>
            Export
          </Button>
        </Actions>
      </UserHeader>
      
      <UserTable
        data={users}
        columns={createUserColumns()}
        onRowClick={setSelectedUser}
      />
      
      <RoleModal
        isOpen={showRoleModal}
        user={selectedUser}
        onClose={() => setShowRoleModal(false)}
        onSave={handleRoleChange}
      />
    </div>
  );
}

// features/users/components/PermissionMatrix.tsx
export function PermissionMatrix() {
  const { data: roles } = useRoles();
  const { data: permissions } = usePermissions();
  const [matrix, setMatrix] = useState<PermissionMatrix>({});
  
  return (
    <Card>
      <Card.Header>
        <Card.Title>Permission Matrix</Card.Title>
      </Card.Header>
      <Card.Content>
        <PermissionTable>
          <PermissionHeader>
            <PermissionCell>Permission</PermissionCell>
            {roles?.map(role => (
              <PermissionCell key={role.id}>{role.name}</PermissionCell>
            ))}
          </PermissionHeader>
          
          {permissions?.map(permission => (
            <PermissionRow key={permission.id}>
              <PermissionCell>{permission.name}</PermissionCell>
              {roles?.map(role => (
                <PermissionCell key={role.id}>
                  <Checkbox
                    checked={matrix[role.id]?.[permission.id]}
                    onCheckedChange={(checked) =>
                      updatePermission(role.id, permission.id, checked)
                    }
                  />
                </PermissionCell>
              ))}
            </PermissionRow>
          ))}
        </PermissionTable>
      </Card.Content>
    </Card>
  );
}
```

### 5. Analytics & Reporting
```typescript
// features/analytics/components/AnalyticsDashboard.tsx
export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: subDays(new Date(), 30),
    end: new Date(),
  });
  
  const { data: analytics } = useAnalytics(dateRange);
  
  return (
    <div>
      <AnalyticsHeader>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
        <ExportButton onClick={exportAnalytics} />
      </AnalyticsHeader>
      
      <KPISection>
        <KPICard
          title="Total Bookings"
          value={analytics.totalBookings}
          previous={analytics.previousBookings}
        />
        <KPICard
          title="Occupancy Rate"
          value={`${analytics.occupancyRate}%`}
          previous={analytics.previousOccupancyRate}
        />
        <KPICard
          title="Average Duration"
          value={`${analytics.avgDuration}h`}
          previous={analytics.previousAvgDuration}
        />
      </KPISection>
      
      <ChartsSection>
        <BookingTrendChart data={analytics.bookingTrend} />
        <ListingPerformanceChart data={analytics.listingPerformance} />
        <UserActivityChart data={analytics.userActivity} />
      </ChartsSection>
    </div>
  );
}

// features/analytics/components/ReportGenerator.tsx
export function ReportGenerator() {
  const [reportType, setReportType] = useState<ReportType>('bookings');
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const report = await generateReport(reportType, format);
      downloadFile(report);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card>
      <Card.Header>
        <Card.Title>Generate Report</Card.Title>
      </Card.Header>
      <Card.Content>
        <FormField>
          <Label>Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="bookings">Booking Report</Select.Item>
              <Select.Item value="listings">Listing Report</Select.Item>
              <Select.Item value="users">User Report</Select.Item>
              <Select.Item value="revenue">Revenue Report</Select.Item>
            </Select.Content>
          </Select>
        </FormField>
        
        <FormField>
          <Label>Format</Label>
          <RadioGroup value={format} onValueChange={setFormat}>
            <RadioGroupItem value="pdf">PDF</RadioGroupItem>
            <RadioGroupItem value="excel">Excel</RadioGroupItem>
            <RadioGroupItem value="csv">CSV</RadioGroupItem>
          </RadioGroup>
        </FormField>
        
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </Button>
      </Card.Content>
    </Card>
  );
}
```

## Permission System

### Role-Based Access Control
```typescript
// shared/hooks/usePermissions.ts
export function usePermissions() {
  const { user } = useAuth();
  
  return {
    canViewListings: user?.permissions.includes('listing:read'),
    canCreateListing: user?.permissions.includes('listing:create'),
    canEditListing: user?.permissions.includes('listing:update'),
    canDeleteListing: user?.permissions.includes('listing:delete'),
    
    canViewBookings: user?.permissions.includes('booking:read'),
    canApproveBooking: user?.permissions.includes('booking:approve'),
    canCancelBooking: user?.permissions.includes('booking:cancel'),
    
    canManageUsers: user?.permissions.includes('user:manage'),
    canViewAnalytics: user?.permissions.includes('analytics:read'),
    canManageSettings: user?.permissions.includes('settings:manage'),
  };
}

// shared/components/PermissionGuard.tsx
export function PermissionGuard({ 
  permission, 
  children, 
  fallback 
}: PermissionGuardProps) {
  const { [permission]: hasPermission } = usePermissions();
  
  if (!hasPermission) {
    return fallback || <AccessDenied />;
  }
  
  return <>{children}</>;
}
```

## State Management

### Zustand Stores
```typescript
// shared/stores/ui-store.ts
interface UIState {
  sidebarCollapsed: boolean;
  theme: string;
  notifications: Notification[];
  
  // Actions
  toggleSidebar: () => void;
  setTheme: (theme: string) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarCollapsed: false,
  theme: 'digdir',
  notifications: [],
  
  toggleSidebar: () => set(state => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),
  
  setTheme: (theme) => set({ theme }),
  
  addNotification: (notification) => set(state => ({
    notifications: [...state.notifications, notification]
  })),
  
  removeNotification: (id) => set(state => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
}));
```

## Performance Optimizations

### Virtual Scrolling
```typescript
// features/listings/components/VirtualizedTable.tsx
export function VirtualizedTable({ data }: VirtualizedTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div ref={tableContainerRef} className="table-container">
      <FixedSizeList
        height={600}
        itemCount={data.length}
        itemSize={60}
        itemData={data}
      >
        {({ index, style, data }) => (
          <div style={style}>
            <TableRow data={data[index]} />
          </div>
        )}
      </FixedSizeList>
    </div>
  );
}
```

### Data Caching
```typescript
// features/listings/hooks/useListings.ts
export function useListings(filters: ListingFilters) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => sdk.listing.findMany(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
```

## Testing

### Component Testing
```typescript
// features/listings/components/__tests__/ListingManager.test.tsx
describe('ListingManager', () => {
  it('renders listing table', () => {
    const listings = createMockListings(10);
    
    render(
      <ListingManager />,
      {
        initialRouteEntries: ['/listings'],
        wrapper: TestWrapper,
      }
    );
    
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(11); // + header
  });
  
  it('handles bulk actions', async () => {
    render(<ListingManager />, { wrapper: TestWrapper });
    
    // Select rows
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // First data row
    fireEvent.click(checkboxes[2]); // Second data row
    
    // Bulk action appears
    expect(screen.getByText('Bulk Actions')).toBeInTheDocument();
    
    // Perform bulk action
    fireEvent.click(screen.getByText('Delete Selected'));
    
    // Confirmation dialog appears
    expect(screen.getByText('Delete 2 listings?')).toBeInTheDocument();
  });
});
```

### E2E Testing
```typescript
// e2e/backoffice/listing-management.spec.ts
test.describe('Listing Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/listings');
  });
  
  test('can create new listing', async ({ page }) => {
    await page.click('[data-testid="create-listing"]');
    
    await page.fill('[data-testid="title"]', 'Test Meeting Room');
    await page.fill('[data-testid="description"]', 'A test meeting room');
    await page.selectOption('[data-testid="category"]', 'meeting-room');
    
    await page.click('[data-testid="save"]');
    
    await expect(page.locator('text=Listing created successfully')).toBeVisible();
    await expect(page).toHaveURL(/\/listings\/[a-zA-Z0-9-]+/);
  });
  
  test('can filter listings', async ({ page }) => {
    await page.selectOption('[data-testid="status-filter"]', 'available');
    await page.fill('[data-testid="search"]', 'meeting');
    
    const rows = page.locator('[data-testid="listing-row"]');
    await expect(rows).toHaveCount(5);
    
    for (const row of await rows.all()) {
      await expect(row).toContainText('meeting');
    }
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
          charts: ['recharts'],
        },
      },
    },
    sourcemap: true,
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
```

### Environment Variables
```bash
# .env.production
VITE_API_BASE_URL=https://api.diglist.no
VITE_APP_NAME=Backoffice
VITE_SENTRY_DSN=https://sentry-dsn
VITE_ENABLE_ANALYTICS=true
```

## Best Practices

### 1. Component Design
- Use composition over inheritance
- Keep components focused and single-purpose
- Extract reusable logic into hooks
- Use proper TypeScript types

### 2. Data Fetching
- Use TanStack Query for server state
- Implement proper error boundaries
- Show loading states for better UX
- Cache data appropriately

### 3. Performance
- Implement virtual scrolling for large lists
- Use React.memo for expensive components
- Lazy load routes and components
- Optimize bundle size

### 4. Accessibility
- Ensure keyboard navigation
- Provide ARIA labels
- Test with screen readers
- Maintain color contrast

## Related Documentation

- [Client SDK](../packages/01-client-sdk.md)
- [Application Architecture](../architecture/03-applications.md)
- [Security Architecture](../architecture/05-security.md)
- [Testing Strategy](../guides/02-testing.md)
