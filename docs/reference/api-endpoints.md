# API Endpoints Reference

**Last Updated:** 2026-01-17  
**API Version:** 1.0  
**Base URL:** `http://localhost:4000` (development) | `https://api.digilist.no` (production)

## Overview

The Unified API provides **58+ modules** with RESTful endpoints, GraphQL support, and WebSocket real-time capabilities.

## Authentication

All endpoints (except `/health` and `/api/public/*`) require authentication via JWT token or session cookie.

```bash
# Cookie-based (recommended for web apps)
Cookie: session=<session_token>

# JWT Bearer token (for API clients)
Authorization: Bearer <jwt_token>
```

## Core Modules

### Health & Status
- `GET /health` - Health check (no auth required)
- `GET /api/health` - Detailed health status

### Authentication (`/api/auth`)
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Current user info
- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### ID-porten Integration (`/api/auth/idporten`)
- `GET /api/auth/idporten/login` - Initiate ID-porten login
- `GET /api/auth/idporten/callback` - ID-porten callback
- `GET /api/auth/idporten/oidc/login` - OIDC login
- `GET /api/auth/idporten/oidc/callback` - OIDC callback

### Signicat eID Hub (`/api/auth/signicat`)
- `GET /api/auth/signicat/login` - Initiate Signicat login
- `GET /api/auth/signicat/callback` - Signicat callback

### Authorization (`/api/authz`)
- `GET /api/authz/permissions` - User permissions
- `GET /api/authz/roles` - Available roles
- `POST /api/authz/check` - Check permission
- `GET /api/me` - Current user with permissions

## Domain Modules

### Rental Objects (`/api/rental-objects`)
- `GET /api/rental-objects` - List rental objects (with filters)
- `GET /api/rental-objects/:id` - Get rental object details
- `POST /api/rental-objects` - Create rental object
- `PUT /api/rental-objects/:id` - Update rental object
- `DELETE /api/rental-objects/:id` - Delete rental object
- `GET /api/rental-objects/:id/availability` - Check availability
- `GET /api/rental-objects/:id/calendar` - Get calendar view
- `POST /api/rental-objects/:id/images` - Upload images
- `GET /api/rental-objects/categories` - List categories
- `GET /api/rental-objects/:id/details` - Extended details

### Bookings (`/api/bookings`)
- `GET /api/bookings` - List bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking
- `POST /api/bookings/:id/approve` - Approve booking
- `POST /api/bookings/:id/reject` - Reject booking
- `GET /api/bookings/:id/conflicts` - Check conflicts

### Activities/Events (`/api/activities`) **NEW**
- `GET /api/activities` - List public activities
- `GET /api/activities/:id` - Get activity details
- `POST /api/activities` - Create activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Cancel activity
- `POST /api/activities/:id/register` - Register for activity
- `GET /api/activities/:id/registrations` - List registrations
- `GET /api/activities/:id/availability` - Check availability

### Favorites (`/api/favorites`) **NEW**
- `GET /api/favorites` - List user favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:id` - Remove from favorites
- `PUT /api/favorites/:id` - Update favorite notes/tags

### Organizations (`/api/organizations`)
- `GET /api/organizations` - List organizations
- `GET /api/organizations/:id` - Get organization
- `POST /api/organizations` - Create organization
- `PUT /api/organizations/:id` - Update organization
- `GET /api/organizations/:id/members` - List members
- `POST /api/organizations/:id/members` - Add member

### Users (`/api/users`)
- `GET /api/users` - List users (admin)
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Calendar (`/api/calendar`)
- `GET /api/calendar` - Get calendar events
- `GET /api/calendar/timeline` - Timeline view
- `GET /api/calendar/conflicts` - Detect conflicts

### Availability (`/api/availability`)
- `GET /api/availability/check` - Check availability
- `POST /api/availability/rules` - Create availability rule
- `GET /api/availability/rules` - List rules

### Pricing (`/api/pricing`)
- `GET /api/pricing/calculate` - Calculate price
- `GET /api/pricing/rules` - List pricing rules
- `POST /api/pricing/rules` - Create pricing rule
- `PUT /api/pricing/rules/:id` - Update pricing rule

### Seasons (`/api/seasons`)
- `GET /api/seasons` - List seasons
- `POST /api/seasons` - Create season
- `PUT /api/seasons/:id` - Update season
- `DELETE /api/seasons/:id` - Delete season

### Blocks (`/api/blocks`)
- `GET /api/blocks` - List time blocks
- `POST /api/blocks` - Create block
- `DELETE /api/blocks/:id` - Remove block

### Reviews (`/api/reviews`)
- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Submit review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Messages (`/api/messages`)
- `GET /api/messages` - List messages
- `POST /api/messages` - Send message
- `GET /api/messages/:id` - Get message
- `PUT /api/messages/:id/read` - Mark as read

### Conversations (`/api/conversations`)
- `GET /api/conversations` - List conversations
- `GET /api/conversations/:id` - Get conversation
- `POST /api/conversations/:id/messages` - Send message

### Notifications (`/api/notifications`)
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Push Notifications (`/api/push-notifications`)
- `POST /api/push-notifications/subscribe` - Subscribe to push
- `DELETE /api/push-notifications/unsubscribe` - Unsubscribe

## Platform Modules

### Tenants (`/api/tenants`)
- `GET /api/tenants` - List tenants (super admin)
- `GET /api/tenants/:id` - Get tenant
- `POST /api/tenants` - Create tenant
- `PUT /api/tenants/:id` - Update tenant

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/recent` - Recent activity

### Reports (`/api/reports`)
- `GET /api/reports/bookings` - Booking reports
- `GET /api/reports/revenue` - Revenue reports
- `GET /api/reports/usage` - Usage statistics
- `POST /api/reports/schedule` - Schedule report

### Audit (`/api/audit`)
- `GET /api/audit/logs` - Audit log entries
- `GET /api/audit/events` - Audit events

### Settings (`/api/settings`)
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings
- `GET /api/settings/:key` - Get specific setting
- `PUT /api/settings/:key` - Update specific setting

### Integrations (`/api/integrations`)
- `GET /api/integrations` - List integrations
- `POST /api/integrations` - Create integration
- `PUT /api/integrations/:id` - Update integration
- `DELETE /api/integrations/:id` - Delete integration
- `POST /api/integrations/:id/test` - Test integration

### Webhooks (`/api/webhooks`)
- `GET /api/webhooks` - List webhooks
- `POST /api/webhooks` - Create webhook
- `DELETE /api/webhooks/:id` - Delete webhook

### Feature Flags (`/api/features`)
- `GET /api/features` - List feature flags
- `GET /api/features/:key` - Check if enabled
- `PUT /api/features/:key` - Toggle feature (admin)

## SaaS Admin (`/api/saas`) **NEW**

### Plans
- `GET /api/saas/plans` - List subscription plans
- `GET /api/saas/plans/:id` - Get plan details
- `POST /api/saas/plans` - Create plan (super admin)
- `PUT /api/saas/plans/:id` - Update plan

### Subscriptions
- `GET /api/saas/subscriptions` - List subscriptions
- `POST /api/saas/subscriptions` - Create subscription
- `PUT /api/saas/subscriptions/:id` - Update subscription
- `DELETE /api/saas/subscriptions/:id` - Cancel subscription

### Licenses
- `GET /api/saas/licenses` - List licenses
- `POST /api/saas/licenses` - Generate license
- `PUT /api/saas/licenses/:id` - Update license
- `DELETE /api/saas/licenses/:id` - Revoke license

## RBAC Modules

### Access Grants (`/api/access-grants`)
- `GET /api/access-grants` - List access grants
- `POST /api/access-grants` - Create access grant
- `DELETE /api/access-grants/:id` - Revoke access grant

### Permission Assignments (`/api/permission-assignments`)
- `GET /api/permission-assignments` - List assignments
- `POST /api/permission-assignments` - Assign permission
- `DELETE /api/permission-assignments/:id` - Remove assignment

### User Groups (`/api/user-groups`)
- `GET /api/user-groups` - List user groups
- `POST /api/user-groups` - Create group
- `PUT /api/user-groups/:id` - Update group
- `DELETE /api/user-groups/:id` - Delete group

## Backoffice Modules

### Backoffice User Groups (`/api/backoffice/user-groups`)
- Extended user group management for backoffice

### Backoffice Price Rules (`/api/backoffice/price-rules`)
- Advanced pricing rule management

### Backoffice Rental Objects (`/api/backoffice/rental-objects`)
- Extended rental object management

## Additional Modules

### Search (`/api/search`)
- `GET /api/search` - Global search
- `GET /api/search/rental-objects` - Search rental objects
- `GET /api/search/suggest` - Search suggestions

### Profile (`/api/profile`)
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/avatar` - Upload avatar

### Help (`/api/help`)
- `GET /api/help/articles` - Help articles
- `GET /api/help/faq` - FAQ items
- `POST /api/help/contact` - Contact support

### Public (`/api/public`)
- `GET /api/public/rental-objects` - Public rental objects
- `GET /api/public/activities` - Public activities
- `GET /api/public/organizations` - Public organizations

### Discount Codes (`/api/discount-codes`)
- `GET /api/discount-codes` - List codes
- `POST /api/discount-codes` - Create code
- `POST /api/discount-codes/validate` - Validate code

### Amenities (`/api/amenities`)
- `GET /api/amenities` - List amenities
- `POST /api/amenities` - Create amenity

### Add-ons (`/api/addons`)
- `GET /api/addons` - List add-ons
- `POST /api/addons` - Create add-on

### Allocations (`/api/allocations`)
- `GET /api/allocations` - List allocations
- `POST /api/allocations` - Create allocation

### Seasonal Leases (`/api/seasonal-leases`)
- `GET /api/seasonal-leases` - List seasonal leases
- `POST /api/seasonal-leases` - Create seasonal lease

### Widgets (`/api/widgets`)
- `GET /api/widgets` - List embeddable widgets
- `POST /api/widgets` - Create widget

### Share (`/api/share`)
- `POST /api/share/rental-object` - Generate share link
- `POST /api/share/booking` - Share booking

### GDPR (`/api/gdpr`)
- `GET /api/gdpr/data` - Export user data
- `POST /api/gdpr/delete` - Request data deletion
- `GET /api/gdpr/consent` - Get consent status
- `POST /api/gdpr/consent` - Update consent

### Monitoring (`/api/monitoring`)
- `GET /api/monitoring/health` - System health
- `GET /api/monitoring/metrics` - System metrics
- `GET /api/monitoring/alerts` - Active alerts

## GraphQL

### Endpoint
- `POST /graphql` - GraphQL endpoint
- `GET /graphql` - GraphiQL playground (development)

### Example Query
```graphql
query {
  rentalObjects(limit: 10) {
    id
    name
    category
    status
  }
}
```

## WebSocket

### Connection
- `ws://localhost:4000/ws/audit` - Audit log stream
- `ws://localhost:4000/ws/bookings` - Booking updates
- `ws://localhost:4000/ws/notifications` - Real-time notifications

### Events
- `booking:created`
- `booking:updated`
- `booking:cancelled`
- `activity:created`
- `notification:new`
- `audit:event`

## Rate Limiting

All endpoints are rate-limited:
- **Authenticated:** 1000 requests/hour
- **Unauthenticated:** 100 requests/hour
- **GraphQL:** 500 requests/hour

## Error Responses

All errors follow RFC 7807 Problem Details format:

```json
{
  "type": "https://api.digilist.no/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "Invalid input data",
  "instance": "/api/bookings",
  "errors": [
    {
      "field": "start_time",
      "message": "Start time must be in the future"
    }
  ]
}
```

## Pagination

List endpoints support pagination:

```bash
GET /api/rental-objects?page=1&limit=20&sort=created_at&order=desc
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## Filtering

Most list endpoints support filtering:

```bash
GET /api/bookings?status=CONFIRMED&start_date=2026-01-01&end_date=2026-12-31
GET /api/rental-objects?category=SPORTS_HALL&city=Oslo
```

## Tenant Isolation

All requests are automatically scoped to the authenticated user's tenant. Multi-tenant queries require super admin privileges.
