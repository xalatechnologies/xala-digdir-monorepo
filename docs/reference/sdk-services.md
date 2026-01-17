# Client SDK Services Reference

**Last Updated:** 2026-01-17  
**SDK Version:** 1.1.0  
**Package:** `@digilist/client-sdk`

## Overview

The Client SDK provides **47 type-safe services** with React Query hooks for seamless integration with the Digilist API.

## Installation

```bash
pnpm add @digilist/client-sdk
```

## Core Services

### Authentication Service
**File:** `auth.service.ts`

```typescript
import { authService } from '@digilist/client-sdk/services';

// Login
await authService.login({ email, password });

// Logout
await authService.logout();

// Get current user
const user = await authService.me();

// Refresh token
await authService.refresh();
```

### Authorization Service
**File:** `authz.service.ts`

```typescript
import { authzService } from '@digilist/client-sdk/services';

// Get user permissions
const permissions = await authzService.getPermissions();

// Check specific permission
const canBook = await authzService.checkPermission('booking:create');

// Get user roles
const roles = await authzService.getRoles();
```

### ID-porten Service
**File:** `idporten.service.ts`

```typescript
import { idportenService } from '@digilist/client-sdk/services';

// Initiate ID-porten login
const loginUrl = await idportenService.getLoginUrl();

// Handle callback
await idportenService.handleCallback(code, state);
```

## Domain Services

### Rental Object Service
**File:** `rental-object.service.ts`

```typescript
import { rentalObjectService } from '@digilist/client-sdk/services';

// List rental objects
const objects = await rentalObjectService.list({ 
  category: 'SPORTS_HALL',
  city: 'Oslo',
  page: 1,
  limit: 20 
});

// Get by ID
const object = await rentalObjectService.getById(id);

// Create
const newObject = await rentalObjectService.create({
  name: 'Oslo Sports Hall',
  category: 'SPORTS_HALL',
  capacity: 100
});

// Update
await rentalObjectService.update(id, { capacity: 150 });

// Delete
await rentalObjectService.delete(id);

// Check availability
const availability = await rentalObjectService.checkAvailability(id, {
  startTime: '2026-01-20T10:00:00Z',
  endTime: '2026-01-20T12:00:00Z'
});
```

### Booking Service
**File:** `booking.service.ts`

```typescript
import { bookingService } from '@digilist/client-sdk/services';

// List bookings
const bookings = await bookingService.list({ 
  status: 'CONFIRMED',
  startDate: '2026-01-01',
  endDate: '2026-12-31'
});

// Create booking
const booking = await bookingService.create({
  rentalObjectId: 'uuid',
  startTime: '2026-01-20T10:00:00Z',
  endTime: '2026-01-20T12:00:00Z',
  purpose: 'Sports training'
});

// Approve booking
await bookingService.approve(id);

// Reject booking
await bookingService.reject(id, { reason: 'Not available' });

// Cancel booking
await bookingService.cancel(id);

// Check conflicts
const conflicts = await bookingService.checkConflicts(id);
```

### Favorites Service **NEW**
**File:** `favorites.service.ts`

```typescript
import { favoritesService } from '@digilist/client-sdk/services';

// List user favorites
const favorites = await favoritesService.list();

// Add to favorites
await favoritesService.add({
  rentalObjectId: 'uuid',
  notes: 'My favorite venue',
  tags: ['sports', 'indoor']
});

// Remove from favorites
await favoritesService.remove(id);

// Update favorite
await favoritesService.update(id, {
  notes: 'Updated notes',
  tags: ['sports', 'outdoor']
});
```

### Organization Service
**File:** `organization.service.ts`

```typescript
import { organizationService } from '@digilist/client-sdk/services';

// List organizations
const orgs = await organizationService.list();

// Get organization
const org = await organizationService.getById(id);

// Create organization
const newOrg = await organizationService.create({
  name: 'Oslo Kommune',
  type: 'MUNICIPALITY'
});

// List members
const members = await organizationService.getMembers(id);

// Add member
await organizationService.addMember(id, {
  userId: 'uuid',
  role: 'MEMBER'
});
```

### Calendar Service
**File:** `calendar.service.ts`

```typescript
import { calendarService } from '@digilist/client-sdk/services';

// Get calendar events
const events = await calendarService.getEvents({
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  rentalObjectId: 'uuid'
});

// Get timeline view
const timeline = await calendarService.getTimeline({
  date: '2026-01-20',
  rentalObjectIds: ['uuid1', 'uuid2']
});

// Detect conflicts
const conflicts = await calendarService.detectConflicts({
  rentalObjectId: 'uuid',
  startTime: '2026-01-20T10:00:00Z',
  endTime: '2026-01-20T12:00:00Z'
});
```

### Dashboard Service
**File:** `dashboard.service.ts`

```typescript
import { dashboardService } from '@digilist/client-sdk/services';

// Get dashboard stats
const stats = await dashboardService.getStats();

// Get recent activity
const activity = await dashboardService.getRecentActivity({ limit: 10 });
```

### Reports Service
**File:** `reports.service.ts`

```typescript
import { reportsService } from '@digilist/client-sdk/services';

// Get booking report
const report = await reportsService.getBookingReport({
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  format: 'pdf'
});

// Get revenue report
const revenue = await reportsService.getRevenueReport({
  period: 'monthly',
  year: 2026
});

// Schedule report
await reportsService.scheduleReport({
  type: 'bookings',
  frequency: 'weekly',
  recipients: ['admin@example.com']
});
```

## Platform Services

### Notification Service
**File:** `notification.service.ts`

```typescript
import { notificationService } from '@digilist/client-sdk/services';

// List notifications
const notifications = await notificationService.list({ unreadOnly: true });

// Mark as read
await notificationService.markAsRead(id);

// Mark all as read
await notificationService.markAllAsRead();

// Delete notification
await notificationService.delete(id);
```

### Push Notification Service
**File:** `push-notification.service.ts`

```typescript
import { pushNotificationService } from '@digilist/client-sdk/services';

// Subscribe to push notifications
await pushNotificationService.subscribe({
  endpoint: 'https://...',
  keys: { p256dh: '...', auth: '...' }
});

// Unsubscribe
await pushNotificationService.unsubscribe();
```

### Settings Service
**File:** `settings.service.ts`

```typescript
import { settingsService } from '@digilist/client-sdk/services';

// Get all settings
const settings = await settingsService.getAll();

// Get specific setting
const theme = await settingsService.get('theme');

// Update setting
await settingsService.update('theme', 'dark');

// Update multiple settings
await settingsService.updateBulk({
  theme: 'dark',
  language: 'nb-NO',
  notifications: true
});
```

### Integration Service
**File:** `integration.service.ts`

```typescript
import { integrationService } from '@digilist/client-sdk/services';

// List integrations
const integrations = await integrationService.list();

// Create integration
await integrationService.create({
  type: 'CALENDAR',
  provider: 'GOOGLE',
  credentials: { apiKey: '...' }
});

// Test integration
const result = await integrationService.test(id);

// Delete integration
await integrationService.delete(id);
```

### Audit Service
**File:** `audit.service.ts`

```typescript
import { auditService } from '@digilist/client-sdk/services';

// Get audit logs
const logs = await auditService.getLogs({
  action: 'booking:create',
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  userId: 'uuid'
});

// Get audit events
const events = await auditService.getEvents({ limit: 50 });
```

## SaaS Services **NEW**

### SaaS Service
**File:** `saas.service.ts`

```typescript
import { saasService } from '@digilist/client-sdk/services';

// List subscription plans
const plans = await saasService.getPlans();

// Get current subscription
const subscription = await saasService.getCurrentSubscription();

// Create subscription
await saasService.createSubscription({
  planId: 'uuid',
  billingInterval: 'monthly'
});

// Cancel subscription
await saasService.cancelSubscription(id);

// List licenses
const licenses = await saasService.getLicenses();

// Generate license
await saasService.generateLicense({
  type: 'standard',
  expiresAt: '2027-01-01'
});
```

## Additional Services

### Pricing Service
**File:** `pricing.service.ts`

```typescript
import { pricingService } from '@digilist/client-sdk/services';

// Calculate price
const price = await pricingService.calculate({
  rentalObjectId: 'uuid',
  startTime: '2026-01-20T10:00:00Z',
  endTime: '2026-01-20T12:00:00Z',
  discountCode: 'WINTER2026'
});

// List pricing rules
const rules = await pricingService.getRules();
```

### Discount Code Service
**File:** `discount-code.service.ts`

```typescript
import { discountCodeService } from '@digilist/client-sdk/services';

// Validate discount code
const validation = await discountCodeService.validate('WINTER2026');

// List discount codes
const codes = await discountCodeService.list();

// Create discount code
await discountCodeService.create({
  code: 'SPRING2026',
  discountPercent: 20,
  validFrom: '2026-03-01',
  validUntil: '2026-05-31'
});
```

### Review Service
**File:** `review.service.ts`

```typescript
import { reviewService } from '@digilist/client-sdk/services';

// List reviews
const reviews = await reviewService.list({ rentalObjectId: 'uuid' });

// Submit review
await reviewService.create({
  rentalObjectId: 'uuid',
  rating: 5,
  comment: 'Excellent venue!'
});

// Update review
await reviewService.update(id, { rating: 4 });

// Delete review
await reviewService.delete(id);
```

### Search Service
**File:** `search.service.ts`

```typescript
import { searchService } from '@digilist/client-sdk/services';

// Global search
const results = await searchService.search('Oslo sports hall');

// Search rental objects
const objects = await searchService.searchRentalObjects({
  query: 'sports',
  filters: { city: 'Oslo', capacity: { min: 50 } }
});

// Get search suggestions
const suggestions = await searchService.getSuggestions('osl');
```

### Profile Service
**File:** `profile.service.ts`

```typescript
import { profileService } from '@digilist/client-sdk/services';

// Get profile
const profile = await profileService.get();

// Update profile
await profileService.update({
  firstName: 'John',
  lastName: 'Doe',
  phone: '+4712345678'
});

// Upload avatar
await profileService.uploadAvatar(file);
```

### GDPR Service
**File:** `gdpr.service.ts`

```typescript
import { gdprService } from '@digilist/client-sdk/services';

// Export user data
const data = await gdprService.exportData();

// Request data deletion
await gdprService.requestDeletion();

// Get consent status
const consent = await gdprService.getConsent();

// Update consent
await gdprService.updateConsent({
  marketing: true,
  analytics: false
});
```

### Monitoring Service
**File:** `monitoring.service.ts`

```typescript
import { monitoringService } from '@digilist/client-sdk/services';

// Get system health
const health = await monitoringService.getHealth();

// Get metrics
const metrics = await monitoringService.getMetrics();

// Get active alerts
const alerts = await monitoringService.getAlerts();
```

### Allocation Service
**File:** `allocation.service.ts`

```typescript
import { allocationService } from '@digilist/client-sdk/services';

// List allocations
const allocations = await allocationService.list();

// Create allocation
await allocationService.create({
  rentalObjectId: 'uuid',
  organizationId: 'uuid',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  hoursPerWeek: 4
});
```

### Amenities Service
**File:** `amenities.service.ts`

```typescript
import { amenitiesService } from '@digilist/client-sdk/services';

// List amenities
const amenities = await amenitiesService.list();

// Create amenity
await amenitiesService.create({
  name: 'Parking',
  icon: 'parking',
  category: 'FACILITY'
});
```

### Billing Service
**File:** `billing.service.ts`

```typescript
import { billingService } from '@digilist/client-sdk/services';

// Get invoices
const invoices = await billingService.getInvoices();

// Get invoice by ID
const invoice = await billingService.getInvoice(id);

// Download invoice PDF
const pdf = await billingService.downloadInvoice(id);
```

### Conversation Service
**File:** `conversation.service.ts`

```typescript
import { conversationService } from '@digilist/client-sdk/services';

// List conversations
const conversations = await conversationService.list();

// Get conversation
const conversation = await conversationService.getById(id);

// Send message
await conversationService.sendMessage(id, {
  content: 'Hello!',
  attachments: []
});
```

### Access Grant Service
**File:** `access-grant.service.ts`

```typescript
import { accessGrantService } from '@digilist/client-sdk/services';

// List access grants
const grants = await accessGrantService.list();

// Create access grant
await accessGrantService.create({
  userId: 'uuid',
  resourceType: 'rental_object',
  resourceId: 'uuid',
  permissions: ['read', 'book']
});

// Revoke access grant
await accessGrantService.revoke(id);
```

### Permission Assignment Service
**File:** `permission-assignment.service.ts`

```typescript
import { permissionAssignmentService } from '@digilist/client-sdk/services';

// List assignments
const assignments = await permissionAssignmentService.list();

// Assign permission
await permissionAssignmentService.assign({
  userId: 'uuid',
  permission: 'booking:approve',
  scope: 'organization'
});

// Remove assignment
await permissionAssignmentService.remove(id);
```

## React Query Hooks

All services have corresponding React Query hooks:

```typescript
import { 
  useRentalObjects,
  useRentalObject,
  useCreateRentalObject,
  useUpdateRentalObject,
  useDeleteRentalObject,
  useBookings,
  useFavorites,
  useNotifications
} from '@digilist/client-sdk/hooks';

// List with auto-refetch
const { data: objects, isLoading } = useRentalObjects({ 
  category: 'SPORTS_HALL' 
});

// Single object
const { data: object } = useRentalObject(id);

// Mutations with optimistic updates
const createMutation = useCreateRentalObject();
await createMutation.mutateAsync(data);

// Favorites
const { data: favorites } = useFavorites();
```

## Type Safety

All services are fully typed with TypeScript:

```typescript
import type { 
  RentalObject,
  Booking,
  CreateBookingDTO,
  UpdateBookingDTO,
  BookingStatus
} from '@digilist/client-sdk/types';
```

## Error Handling

All services throw typed errors:

```typescript
import { ApiError } from '@digilist/client-sdk';

try {
  await bookingService.create(data);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.status, error.message, error.details);
  }
}
```

## Base Service

All services extend `BaseService` which provides:
- Automatic authentication
- Request/response interceptors
- Error handling
- Retry logic
- Type safety

```typescript
import { BaseService } from '@digilist/client-sdk/services';

class CustomService extends BaseService {
  constructor() {
    super('/api/custom');
  }
  
  async customMethod() {
    return this.get('/endpoint');
  }
}
```

## Configuration

Configure the SDK globally:

```typescript
import { configure } from '@digilist/client-sdk';

configure({
  baseURL: 'https://api.digilist.no',
  timeout: 30000,
  retries: 3
});
```

## Total Services: 47

1. auth.service.ts
2. authz.service.ts
3. idporten.service.ts
4. rental-object.service.ts
5. booking.service.ts
6. favorites.service.ts (NEW)
7. organization.service.ts
8. calendar.service.ts
9. dashboard.service.ts
10. reports.service.ts
11. notification.service.ts
12. push-notification.service.ts
13. settings.service.ts
14. integration.service.ts
15. audit.service.ts
16. saas.service.ts (NEW)
17. pricing.service.ts
18. discount-code.service.ts
19. review.service.ts
20. search.service.ts
21. profile.service.ts
22. gdpr.service.ts
23. monitoring.service.ts
24. allocation.service.ts
25. amenities.service.ts
26. billing.service.ts
27. conversation.service.ts
28. access-grant.service.ts
29. permission-assignment.service.ts
30. price-rules.service.ts
31. user.service.ts
32. tenant.service.ts
33. help.service.ts
34. metadata.service.ts
35. notification-system.service.ts
36. integration-credentials.service.ts
37. integrations.service.ts
38. economy.service.ts
39. widget.service.ts
40. share.service.ts
41. season.service.ts
42. block.service.ts
43. availability.service.ts
44. seasonal-lease.service.ts
45. message.service.ts
46. public.service.ts
47. accessibility-monitoring.service.ts
