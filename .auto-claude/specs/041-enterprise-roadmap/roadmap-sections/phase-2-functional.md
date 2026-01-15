# Phase 2: Functional Completion

**Phase Type:** Feature Delivery / MUST-HAVE
**Priority Level:** CRITICAL
**Status:** IN PROGRESS
**Estimated Duration:** 6-8 weeks
**Last Updated:** 2026-01-15

---

## Overview

Phase 2 delivers the core functional requirements for the Digilist booking platform. This phase focuses on completing all tender-required features for listings management, booking engine with all 4 booking types, calendar control, approval workflows, payment integration, and notifications. All items are **MUST-HAVE** for tender compliance.

**Key Focus Areas:**
- Complete listings lifecycle management
- Booking engine with 4 booking types (slot, all-day, recurring, event)
- Calendar blocking, maintenance windows, blackout periods
- Multi-stage approval workflows
- Payment gateway integration (Vipps)
- Email/SMS notification delivery

**Dependencies:**
- Phase 1 Core Platform Stability (RBAC, Tenant Isolation, Audit)

**Success Criteria:**
- All 4 booking types fully operational
- Public-to-completion booking flow working
- Payment processing with receipts
- Email/SMS notifications delivered
- Calendar blocking and conflict detection

---

## 2.1 Listings Lifecycle

### 2.1.1 Listing CRUD Operations

- ✅ **Description**: Complete create, read, update, delete operations for listings with status workflow
- 🔍 **Verification**:
  - Test `POST /api/listings` creates listing with draft status
  - Test `PUT /api/listings/:id` updates listing fields
  - Test `DELETE /api/listings/:id` soft-deletes listing
  - Verify audit logs for all mutations
  - SDK hooks: `useCreateListing`, `useUpdateListing`, `useDeleteListing`
- 📦 **Affected**: api, client-sdk (ListingService), apps/backoffice
- 👤 **Roles**: Admin, Case Handler (read), Organization User (org-scoped)
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A - Core functionality complete
- ➡️ **Action**: None required

### 2.1.2 Listing Status Workflow

- ✅ **Description**: Status transitions: draft → published → archived, with validation at each stage
- 🔍 **Verification**:
  - `PUT /api/listings/:id/publish` requires all mandatory fields
  - `PUT /api/listings/:id/archive` moves to archived status
  - Status changes logged to audit
  - Unpublish returns to draft
- 📦 **Affected**: api, client-sdk, apps/backoffice
- 👤 **Roles**: Admin, Case Handler
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.1.3 Listing Types (5 Categories)

- ✅ **Description**: Support for 5 listing categories as defined in tender requirements
- 🔍 **Verification**:
  - `GET /api/categories` returns all 5 category types
  - Each listing has `categoryId` field
  - Category-specific fields validated on create/update
  - Categories: Sports halls, Meeting rooms, Outdoor facilities, Equipment, Other
- 📦 **Affected**: api, client-sdk, apps/backoffice, apps/web
- 👤 **Roles**: All
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.1.4 Media Management

- ✅ **Description**: Image upload, ordering, and deletion for listing media
- 🔍 **Verification**:
  - `POST /api/listings/:id/media` uploads images
  - `DELETE /api/listings/:id/media/:mediaId` removes media
  - SDK `ListingService.uploadMedia()` method works
  - Images stored with tenant isolation
- 📦 **Affected**: api, client-sdk, apps/backoffice
- 👤 **Roles**: Admin, Case Handler
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.1.5 Listing Rules Configuration

- ✅ **Description**: Configurable booking rules per listing (min/max duration, advance notice, cancellation policy)
- 🔍 **Verification**:
  - `GET /backoffice/listings/:id/rules` returns listing rules
  - `PUT /backoffice/listings/:id/rules` updates rules
  - SDK `BackofficePriceRulesService.getListingRules()` method
  - Rules enforced during booking creation
- 📦 **Affected**: api, client-sdk, apps/backoffice
- 👤 **Roles**: Admin
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.1.6 Price Rules System

- ✅ **Description**: Flexible pricing rules per listing (base price, time-based, day-based, seasonal)
- 🔍 **Verification**:
  - `GET /backoffice/listings/:id/price-rules` returns price rules
  - `PUT /backoffice/listings/:id/price-rules` replaces rules
  - `GET /api/bookings/pricing` calculates price based on rules
  - Multiple rule types supported: base, weekend, evening, seasonal
- 📦 **Affected**: api, client-sdk (PricingService), apps/backoffice
- 👤 **Roles**: Admin
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.1.7 Listing Duplication

- ✅ **Description**: Clone existing listing with all settings for quick setup
- 🔍 **Verification**:
  - `POST /api/listings/:id/duplicate` creates copy
  - SDK `ListingService.duplicate()` method
  - New listing created in draft status
  - Media references copied, not files
- 📦 **Affected**: api, client-sdk, apps/backoffice
- 👤 **Roles**: Admin
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.1.8 Listing Statistics

- ✅ **Description**: View analytics per listing (bookings, revenue, utilization)
- 🔍 **Verification**:
  - `GET /api/listings/:id/stats` returns statistics
  - SDK `ListingService.getStats()` method
  - Stats include: total bookings, revenue, utilization rate
  - Time period filtering supported
- 📦 **Affected**: api, client-sdk, apps/backoffice
- 👤 **Roles**: Admin, Case Handler
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

---

## 2.2 Booking Engine

### 2.2.1 Standard Time-Slot Booking

- ✅ **Description**: Book specific time slots within operating hours (primary booking type)
- 🔍 **Verification**:
  - `POST /api/bookings` with `type: 'slot'` creates time-slot booking
  - Start/end time validation against listing operating hours
  - Conflict detection with existing bookings
  - SDK `BookingService.create()` with slot parameters
- 📦 **Affected**: api, client-sdk, apps/web, apps/backoffice
- 👤 **Roles**: Authenticated User, Organization User
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.2.2 All-Day Booking

- ✅ **Description**: Book entire day(s) for exclusive use
- 🔍 **Verification**:
  - `POST /api/bookings` with `type: 'all-day'` creates full-day booking
  - Blocks entire day in calendar
  - Multi-day booking spans calculated correctly
  - Conflicts with any time-slot bookings on same day
- 📦 **Affected**: api, client-sdk, apps/web, apps/backoffice
- 👤 **Roles**: Authenticated User, Organization User
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Cannot support event booking scenarios requiring full-day blocks
- ➡️ **Action**: Implement all-day booking type with proper calendar visualization

### 2.2.3 Recurring Booking

- ✅ **Description**: Create repeating bookings (daily, weekly, monthly patterns)
- 🔍 **Verification**:
  - `POST /api/bookings/recurring` creates recurring series
  - `GET /api/bookings/recurring` lists recurring bookings
  - SDK `BookingService.createRecurring()` and `getRecurring()` methods
  - Recurrence patterns: daily, weekly (specific days), monthly
  - Individual occurrence editing supported
- 📦 **Affected**: api, client-sdk, apps/backoffice
- 👤 **Roles**: Admin, Case Handler
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.2.4 Event Booking

- ✅ **Description**: Special event bookings with extended setup/teardown time
- 🔍 **Verification**:
  - `POST /api/bookings` with `type: 'event'` creates event booking
  - Setup/teardown buffer times respected in availability
  - Event-specific fields: title, description, attendee count
  - Blocks appropriate buffer time before/after event
- 📦 **Affected**: api, client-sdk, apps/web, apps/backoffice
- 👤 **Roles**: Authenticated User, Organization User
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Cannot handle large events with preparation requirements
- ➡️ **Action**: Implement event booking type with setup/teardown buffers

**Event Booking Requirements:**
| Field | Description | Status |
|-------|-------------|--------|
| Event title | Display name for calendar | MISSING |
| Setup buffer | Time before event start | MISSING |
| Teardown buffer | Time after event end | MISSING |
| Expected attendees | Capacity validation | MISSING |
| Equipment requests | Add-on services | MISSING |

### 2.2.5 Booking Status Workflow

- ✅ **Description**: Complete booking status workflow: pending → confirmed → completed OR cancelled
- 🔍 **Verification**:
  - `PUT /api/bookings/:id/confirm` moves to confirmed
  - `PUT /api/bookings/:id/cancel` moves to cancelled
  - `PUT /api/bookings/:id/complete` moves to completed
  - SDK hooks: `useConfirmBooking`, `useCancelBooking`
  - Each status change logged to audit
- 📦 **Affected**: api, client-sdk, apps/backoffice
- 👤 **Roles**: Case Handler, Admin (confirm/complete), All (cancel own)
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.2.6 Booking Pricing Calculation

- ✅ **Description**: Real-time price calculation based on listing rules and duration
- 🔍 **Verification**:
  - `GET /api/bookings/pricing?listingId=X&start=X&end=X` returns price quote
  - SDK `BookingService.calculatePricing()` method
  - Applies all relevant price rules (base, weekend, seasonal)
  - Returns breakdown of price components
- 📦 **Affected**: api, client-sdk, apps/web
- 👤 **Roles**: All
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.2.7 Booking Receipt Generation (KRAV-ADM-07)

- ✅ **Description**: Generate PDF receipt for completed bookings per tender requirement
- 🔍 **Verification**:
  - `GET /api/bookings/:id/receipt` returns receipt data
  - SDK `BookingService.getReceipt()` method
  - Receipt includes: booking details, price breakdown, payment info
  - PDF download available from backoffice
- 📦 **Affected**: api, client-sdk, apps/backoffice
- 👤 **Roles**: Authenticated User (own booking), Admin, Case Handler
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Tender compliance issue - receipts required for all paid bookings
- ➡️ **Action**: Complete PDF generation implementation (currently returns data, not PDF)

### 2.2.8 User's Own Bookings

- ✅ **Description**: View and manage user's own bookings in MinSide
- 🔍 **Verification**:
  - `GET /api/bookings/my` returns current user's bookings
  - SDK `BookingService.getMyBookings()` method
  - Filter by status, date range
  - User can cancel own pending/confirmed bookings
- 📦 **Affected**: api, client-sdk, apps/web, apps/minside
- 👤 **Roles**: Authenticated User, Organization User
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.2.9 Booking Modification Requests

- ✅ **Description**: Request changes to existing bookings (time, date)
- 🔍 **Verification**:
  - `POST /api/bookings/:id/request-change` submits change request
  - SDK `BookingService.requestChange()` method
  - Change request goes to case handler queue
  - Notification sent on approval/rejection
- 📦 **Affected**: api, client-sdk, apps/minside, apps/backoffice
- 👤 **Roles**: Authenticated User (requester), Case Handler (approver)
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Users cannot modify bookings without full cancellation
- ➡️ **Action**: Complete change request workflow with notifications

### 2.2.10 Waitlist Functionality

- ✅ **Description**: Join waitlist when desired time slot is unavailable
- 🔍 **Verification**:
  - `POST /api/bookings/waitlist` adds user to waitlist
  - Notification sent when slot becomes available
  - Auto-convert to booking if user confirms
  - Waitlist position tracking
- 📦 **Affected**: api, client-sdk, apps/web, apps/minside
- 👤 **Roles**: Authenticated User
- 📊 **Status**: MISSING
- 🚨 **Risk**: Users cannot be notified when popular slots open up
- ➡️ **Action**: Design and implement waitlist service

**Waitlist Requirements:**
| Feature | Description | Priority |
|---------|-------------|----------|
| Waitlist CRUD | Add/remove from waitlist | SHOULD-HAVE |
| Position tracking | Show queue position | SHOULD-HAVE |
| Auto-notification | Alert when slot available | SHOULD-HAVE |
| Time-limited hold | Reserve slot briefly for user | NICE-TO-HAVE |

### 2.2.11 Group Booking

- ✅ **Description**: Book for multiple attendees with shared payment responsibility
- 🔍 **Verification**:
  - `POST /api/bookings` with `attendees` array
  - Capacity validation against listing max
  - Per-attendee pricing calculation
  - Attendee management (add/remove)
- 📦 **Affected**: api, client-sdk, apps/web
- 👤 **Roles**: Authenticated User, Organization User
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot support team bookings or events with registration
- ➡️ **Action**: Design group booking schema and API

---

## 2.3 Calendar & Availability

### 2.3.1 Calendar View API

- ✅ **Description**: Retrieve calendar events for visualization in day/week/month views
- 🔍 **Verification**:
  - `GET /api/calendar/events?listingId=X&start=X&end=X` returns events
  - SDK `CalendarService.getEvents()` method
  - Returns bookings, blocks, and allocations
  - Supports multiple listing aggregation
- 📦 **Affected**: api, client-sdk, apps/backoffice
- 👤 **Roles**: Admin, Case Handler
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.3.2 Availability Check API

- ✅ **Description**: Check if specific time range is available for booking
- 🔍 **Verification**:
  - `GET /api/listings/:id/availability?start=X&end=X` returns slots
  - SDK `AvailabilityService.check()` method
  - Considers existing bookings, blocks, and operating hours
  - Returns conflict reasons if unavailable
- 📦 **Affected**: api, client-sdk, apps/web
- 👤 **Roles**: All
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.3.3 Time Blocking (Allocations)

- ✅ **Description**: Block time ranges for maintenance, staff use, or other non-booking purposes
- 🔍 **Verification**:
  - `POST /api/allocations` creates time block
  - `DELETE /api/allocations/:id` removes block
  - SDK `AllocationService` methods
  - Blocks appear in calendar, prevent bookings
  - Audit logged
- 📦 **Affected**: api, client-sdk, apps/backoffice
- 👤 **Roles**: Admin, Case Handler
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.3.4 Recurring Blocks

- ✅ **Description**: Create recurring time blocks (e.g., weekly maintenance window)
- 🔍 **Verification**:
  - `POST /api/allocations` with recurrence pattern
  - Pattern types: daily, weekly, monthly
  - Individual occurrence override
  - Series deletion
- 📦 **Affected**: api, client-sdk, apps/backoffice
- 👤 **Roles**: Admin
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Cannot schedule regular maintenance without manual blocks
- ➡️ **Action**: Add recurrence support to allocation API

### 2.3.5 Blackout Periods

- ✅ **Description**: Define periods when listing is completely unavailable (holidays, closures)
- 🔍 **Verification**:
  - `POST /api/allocations` with `type: 'blackout'`
  - Blackout blocks all booking types
  - Public calendar shows "Closed"
  - Multiple day span support
- 📦 **Affected**: api, client-sdk, apps/backoffice
- 👤 **Roles**: Admin, Tenant Admin
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Cannot mark holidays/closures without individual blocks
- ➡️ **Action**: Add blackout period type with public visibility message

### 2.3.6 Operating Hours Management

- ✅ **Description**: Configure operating hours per listing and day of week
- 🔍 **Verification**:
  - Operating hours stored in listing configuration
  - Availability API respects operating hours
  - Bookings outside hours rejected
  - Holiday exceptions supported
- 📦 **Affected**: api, client-sdk, apps/backoffice
- 👤 **Roles**: Admin
- 📊 **Status**: DONE (via ListingWizard OpeningHoursStep)
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.3.7 Conflict Detection

- ✅ **Description**: Real-time detection of booking conflicts in calendar view
- 🔍 **Verification**:
  - Calendar UI shows conflict indicators
  - `useConflictDetection` hook in backoffice
  - Overlapping bookings highlighted
  - Tooltip explains conflict type
- 📦 **Affected**: apps/backoffice
- 👤 **Roles**: Admin, Case Handler
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.3.8 Real-time Availability Updates

- ✅ **Description**: WebSocket push of availability changes for live calendar updates
- 🔍 **Verification**:
  - `/ws/events/:tenantId` broadcasts booking changes
  - Calendar auto-refreshes on event
  - `useRealtimeCalendar` hook in backoffice
  - No stale availability shown
- 📦 **Affected**: api, client-sdk, apps/backoffice
- 👤 **Roles**: Admin, Case Handler
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.3.9 Public Availability WebSocket

- ✅ **Description**: Real-time availability updates for public booking widget
- 🔍 **Verification**:
  - `/ws/availability/:listingId` endpoint exists and broadcasts
  - Public widget receives slot updates
  - Connection authenticated with listing token
  - Handles reconnection gracefully
- 📦 **Affected**: api, client-sdk, apps/web
- 👤 **Roles**: Public
- 📊 **Status**: MISSING
- 🚨 **Risk**: Users may book slots that just became unavailable
- ➡️ **Action**: Implement `/ws/availability/:listingId` WebSocket endpoint

### 2.3.10 Calendar Export (iCal)

- ✅ **Description**: Export bookings and blocks to iCal format for external calendars
- 🔍 **Verification**:
  - `GET /api/calendar/export?format=ical` returns .ics file
  - Events include booking details
  - VEVENT format per RFC 5545
  - Subscription URL for auto-sync
- 📦 **Affected**: api, client-sdk, apps/backoffice, apps/minside
- 👤 **Roles**: Admin, Authenticated User (own bookings)
- 📊 **Status**: MISSING
- 🚨 **Risk**: Staff cannot sync work schedule with personal calendars
- ➡️ **Action**: Implement iCal export endpoint

---

## 2.4 Approval Workflows

### 2.4.1 Booking Approval Queue

- ✅ **Description**: Centralized queue for case handlers to review and approve bookings
- 🔍 **Verification**:
  - Backoffice work queue shows pending bookings
  - Filter by type, priority, date
  - Quick approve/reject actions
  - SDK hooks for queue data
- 📦 **Affected**: apps/backoffice (WorkQueuePage)
- 👤 **Roles**: Case Handler
- 📊 **Status**: PARTIAL (UI exists, uses mock data)
- 🚨 **Risk**: Case handlers cannot efficiently process booking requests
- ➡️ **Action**: Connect work queue to SDK `usePendingBookings` hook

### 2.4.2 Single-Click Approve/Reject

- ✅ **Description**: Streamlined approval actions from queue and booking list
- 🔍 **Verification**:
  - Approve button calls `useConfirmBooking` mutation
  - Reject button calls `useCancelBooking` mutation
  - Confirmation dialog for destructive actions
  - Success/error toast feedback
- 📦 **Affected**: apps/backoffice
- 👤 **Roles**: Case Handler, Admin
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.4.3 Bulk Approval

- ✅ **Description**: Approve or reject multiple bookings in single action
- 🔍 **Verification**:
  - Checkbox selection on booking list
  - "Bulk Approve" and "Bulk Reject" buttons
  - Confirmation with count
  - Progress indicator during operation
- 📦 **Affected**: apps/backoffice
- 👤 **Roles**: Case Handler, Admin
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.4.4 Approval Reason/Notes

- ✅ **Description**: Record reason when rejecting bookings for audit trail
- 🔍 **Verification**:
  - Reject modal includes reason text field
  - Reason stored with booking record
  - Reason visible in booking history
  - Reason included in rejection notification
- 📦 **Affected**: api, client-sdk, apps/backoffice
- 👤 **Roles**: Case Handler, Admin
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Audit trail incomplete without rejection reasons
- ➡️ **Action**: Add reason field to cancel/reject API and UI

### 2.4.5 Seasonal Lease Application Workflow

- ✅ **Description**: Multi-stage approval for seasonal lease applications (KRAV-ADM-05)
- 🔍 **Verification**:
  - Application submission flow
  - Review by case handler
  - Allocation suggestions per KRAV-ADM-05
  - Approval/rejection with notification
  - SDK `SeasonApplicationService` methods
- 📦 **Affected**: api, client-sdk, apps/backoffice (SeasonApplicationsReviewPage)
- 👤 **Roles**: Organization User (apply), Case Handler (review), Admin (approve)
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.4.6 Allocation Suggestions (KRAV-ADM-05)

- ✅ **Description**: AI-assisted allocation suggestions based on history and rules
- 🔍 **Verification**:
  - `GET /api/seasonal-leases/suggestions` returns suggestions
  - SDK `SeasonalLeaseService.getSuggestions()` method
  - Priority queue algorithm considers history
  - Case handler can accept/modify suggestions
- 📦 **Affected**: api, client-sdk, apps/backoffice (AllocationPlannerPage)
- 👤 **Roles**: Case Handler
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.4.7 Decision Forms

- ✅ **Description**: Formal decision documentation for seasonal lease allocations
- 🔍 **Verification**:
  - Decision form generation from allocation
  - PDF export for archival
  - Decision forms page in backoffice
  - Linked to audit trail
- 📦 **Affected**: apps/backoffice (DecisionFormsPage)
- 👤 **Roles**: Case Handler
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Formal documentation requirements may not be met
- ➡️ **Action**: Complete decision form template and PDF export

### 2.4.8 Assignment to Case Handler

- ✅ **Description**: Assign specific booking requests to case handlers
- 🔍 **Verification**:
  - Assignment dropdown in work queue
  - Filter queue by assigned handler
  - Notification on assignment
  - Assignment tracking in audit
- 📦 **Affected**: api, client-sdk, apps/backoffice
- 👤 **Roles**: Admin, Case Handler (self-assign)
- 📊 **Status**: MISSING
- 🚨 **Risk**: Work distribution unclear, no accountability
- ➡️ **Action**: Add assignee field to booking/request model

### 2.4.9 Priority System

- ✅ **Description**: Priority levels for booking requests (Low, Normal, High, Urgent)
- 🔍 **Verification**:
  - Priority field on bookings/requests
  - Priority badges in work queue
  - Sort by priority option
  - Auto-escalation based on time
- 📦 **Affected**: apps/backoffice (WorkQueuePage)
- 👤 **Roles**: Case Handler, Admin
- 📊 **Status**: PARTIAL (UI exists, backend incomplete)
- 🚨 **Risk**: Urgent requests may be missed
- ➡️ **Action**: Add priority field to booking API schema

---

## 2.5 Payment Integration

### 2.5.1 Vipps Payment Integration

- ✅ **Description**: Norwegian mobile payment via Vipps for booking payments
- 🔍 **Verification**:
  - SDK `VippsService.initiatePayment()` method exists
  - `POST /api/integrations/vipps/initiate` creates payment
  - Redirect to Vipps app/site
  - Callback handles payment confirmation
- 📦 **Affected**: api, client-sdk (VippsService), apps/web
- 👤 **Roles**: Authenticated User
- 📊 **Status**: PARTIAL (SDK service exists, flow incomplete)
- 🚨 **Risk**: Cannot collect payment for bookings; revenue blocked
- ➡️ **Action**: Complete Vipps payment flow end-to-end

**Vipps Integration Status:**
| Method | Status | Notes |
|--------|--------|-------|
| `initiatePayment(data)` | EXISTS | Needs testing |
| `getPaymentStatus(orderId)` | EXISTS | Needs testing |
| `capturePayment(data)` | EXISTS | Needs testing |
| `refundPayment(data)` | EXISTS | Needs testing |
| Payment callback handling | PARTIAL | Needs production config |

### 2.5.2 Payment Status Tracking

- ✅ **Description**: Track payment status (pending, completed, failed, refunded) for bookings
- 🔍 **Verification**:
  - Payment status field on booking model
  - `PaymentStatusBadge` component in backoffice
  - SDK `VippsService.getPaymentStatus()` method
  - Payment status updates via webhook
- 📦 **Affected**: api, client-sdk, apps/backoffice
- 👤 **Roles**: Admin, Case Handler
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Cannot track payment completion for bookings
- ➡️ **Action**: Implement payment webhook handler

### 2.5.3 Refund Processing

- ✅ **Description**: Process refunds for cancelled bookings with Vipps
- 🔍 **Verification**:
  - `RefundDialog` component in backoffice exists
  - SDK `VippsService.refundPayment()` method
  - Refund amount calculation (full/partial)
  - Refund status tracking
- 📦 **Affected**: api, client-sdk, apps/backoffice
- 👤 **Roles**: Admin
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Cannot process customer refunds
- ➡️ **Action**: Complete refund flow with Vipps API

### 2.5.4 Invoice Generation (KRAV-ADM-07)

- ✅ **Description**: Generate invoices for organization bookings per tender requirement
- 🔍 **Verification**:
  - SDK `EconomyService` invoice methods exist
  - `GET /api/me/invoices/:id/download` returns PDF
  - Invoice includes all required fields
  - Audit logged
- 📦 **Affected**: api, client-sdk (EconomyService), apps/backoffice
- 👤 **Roles**: Admin, Organization User (own invoices)
- 📊 **Status**: PARTIAL (mock PDF, not production)
- 🚨 **Risk**: Tender compliance - invoices required for organizations
- ➡️ **Action**: Implement production PDF generation with proper template

### 2.5.5 Visma ERP Integration

- ✅ **Description**: Sync invoices and payments to Visma ERP system
- 🔍 **Verification**:
  - SDK `VismaService` methods exist
  - SDK `EconomyService.syncToVisma()` method
  - Status check: `EconomyService.checkVismaStatus()`
  - Error handling for sync failures
- 📦 **Affected**: api, client-sdk (VismaService, EconomyService)
- 👤 **Roles**: Tenant Admin
- 📊 **Status**: PARTIAL (service exists, needs production config)
- 🚨 **Risk**: Manual accounting if sync fails
- ➡️ **Action**: Complete Visma integration testing with tenant credentials

### 2.5.6 Payment History

- ✅ **Description**: View payment history for bookings and invoices
- 🔍 **Verification**:
  - `GET /api/bookings/:id/payment-history` returns history
  - SDK `BookingService.getPaymentHistory()` method
  - `PaymentDetailsDrawer` component in backoffice
  - History includes timestamps and status changes
- 📦 **Affected**: api, client-sdk, apps/backoffice
- 👤 **Roles**: Admin, Case Handler
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Difficult to investigate payment issues
- ➡️ **Action**: Complete payment history API implementation

### 2.5.7 Billing Summary

- ✅ **Description**: User and organization billing summaries
- 🔍 **Verification**:
  - `GET /api/me/billing/summary` returns user billing
  - `GET /api/orgs/:orgId/billing/summary` returns org billing
  - SDK `BillingService.getSummary()` method
  - Includes outstanding balance, recent transactions
- 📦 **Affected**: api, client-sdk (BillingService), apps/minside
- 👤 **Roles**: Authenticated User, Organization User
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.5.8 Discount Codes

- ✅ **Description**: Apply promotional discount codes to bookings
- 🔍 **Verification**:
  - SDK `DiscountCodeService` methods
  - Validate code: `DiscountCodeService.validate(code)`
  - Apply to pricing calculation
  - Admin code management
- 📦 **Affected**: api, client-sdk (DiscountCodeService), apps/web, apps/backoffice
- 👤 **Roles**: Authenticated User (use), Admin (manage)
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

---

## 2.6 Notifications

### 2.6.1 In-App Notifications

- ✅ **Description**: Real-time in-app notification delivery
- 🔍 **Verification**:
  - `GET /api/notifications/my` returns user notifications
  - `POST /api/notifications/:id/read` marks as read
  - SDK `NotificationService` methods complete
  - Unread badge count in header
- 📦 **Affected**: api, client-sdk (NotificationService), all apps
- 👤 **Roles**: All authenticated users
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.6.2 Email Notification Delivery

- ✅ **Description**: Send transactional emails (booking confirmation, reminders)
- 🔍 **Verification**:
  - Email templates exist for key events
  - Backend email service configured (Sendgrid/SES)
  - SDK `NotificationService.sendEmail()` method exists
  - Delivery tracking and retry logic
- 📦 **Affected**: api, client-sdk
- 👤 **Roles**: All authenticated users (recipients)
- 📊 **Status**: MISSING
- 🚨 **Risk**: Users don't receive booking confirmations outside of app
- ➡️ **Action**: Configure email provider and implement email templates

**Required Email Templates:**
| Template | Trigger | Status |
|----------|---------|--------|
| Booking confirmation | Booking confirmed | MISSING |
| Booking reminder | 24h before booking | MISSING |
| Booking cancelled | Booking cancelled | MISSING |
| Payment confirmation | Payment completed | MISSING |
| Seasonal application | Status change | MISSING |
| Account welcome | User registration | MISSING |

### 2.6.3 SMS Notification Delivery

- ✅ **Description**: Send SMS for time-sensitive notifications (reminders)
- 🔍 **Verification**:
  - SMS provider configured (Twilio/Link Mobility)
  - Backend SMS service implemented
  - Opt-in consent required per GDPR
  - Delivery tracking
- 📦 **Affected**: api
- 👤 **Roles**: All authenticated users (recipients)
- 📊 **Status**: MISSING
- 🚨 **Risk**: Missed bookings due to lack of reminders
- ➡️ **Action**: Configure SMS provider and implement SMS delivery

### 2.6.4 Push Notifications

- ✅ **Description**: Browser/mobile push notifications for real-time alerts
- 🔍 **Verification**:
  - SDK `PushNotificationService` methods complete
  - `POST /api/push-notifications/register` registers subscription
  - Service worker configuration
  - Push delivery via Web Push API
- 📦 **Affected**: api, client-sdk (PushNotificationService), all apps
- 👤 **Roles**: All authenticated users
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.6.5 Notification Preferences

- ✅ **Description**: User-configurable notification preferences (channels, frequency)
- 🔍 **Verification**:
  - `GET /api/users/me/notification-prefs` returns preferences
  - `PUT /api/users/me/notification-prefs` updates preferences
  - SDK `UserService.getNotificationPrefs()` method
  - Per-channel opt-in/opt-out
- 📦 **Affected**: api, client-sdk (UserService), apps/minside
- 👤 **Roles**: All authenticated users
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 2.6.6 Notification Templates

- ✅ **Description**: Admin-manageable notification templates
- 🔍 **Verification**:
  - `GET /api/notifications/templates` returns templates
  - SDK `NotificationService.getTemplates()` method
  - Template variables for personalization
  - Multi-language support
- 📦 **Affected**: api, client-sdk, apps/backoffice
- 👤 **Roles**: Admin, Tenant Admin
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Cannot customize notification content
- ➡️ **Action**: Complete template management UI in backoffice

### 2.6.7 Booking Reminder System

- ✅ **Description**: Automated reminders before scheduled bookings
- 🔍 **Verification**:
  - Scheduled job sends reminders (24h, 1h before)
  - Reminder via preferred channel (email, SMS, push)
  - Reminder includes booking details and cancel link
  - Configurable reminder timing
- 📦 **Affected**: api
- 👤 **Roles**: All authenticated users (recipients)
- 📊 **Status**: MISSING
- 🚨 **Risk**: Higher no-show rate without reminders
- ➡️ **Action**: Implement reminder scheduler with cron job

---

## Phase 2 Summary

### Status Matrix

| Category | Items | DONE | PARTIAL | MISSING |
|----------|-------|------|---------|---------|
| Listings Lifecycle | 8 | 8 | 0 | 0 |
| Booking Engine | 11 | 5 | 4 | 2 |
| Calendar & Availability | 10 | 7 | 2 | 1 |
| Approval Workflows | 9 | 4 | 4 | 1 |
| Payment Integration | 8 | 2 | 5 | 1 |
| Notifications | 7 | 3 | 2 | 2 |
| **TOTAL** | **53** | **29 (55%)** | **17 (32%)** | **7 (13%)** |

### Priority Order

Based on risk and tender compliance, implement in this order:

**Week 1-2: Core Booking Completion**
1. 2.2.2 All-Day Booking type
2. 2.2.4 Event Booking type with buffers
3. 2.2.7 Booking Receipt PDF generation
4. 2.2.9 Booking Modification Requests

**Week 3-4: Payment Integration**
5. 2.5.1 Vipps Payment flow completion
6. 2.5.2 Payment Status Tracking webhooks
7. 2.5.4 Invoice PDF Generation
8. 2.5.3 Refund Processing

**Week 5-6: Approval & Calendar**
9. 2.4.1 Work Queue SDK integration
10. 2.4.4 Approval Reason/Notes
11. 2.3.4 Recurring Blocks
12. 2.3.5 Blackout Periods

**Week 7-8: Notifications & Polish**
13. 2.6.2 Email Notification Delivery
14. 2.6.3 SMS Notification Delivery
15. 2.6.7 Booking Reminder System
16. 2.3.9 Public Availability WebSocket

### Critical Blockers

| # | Blocker | Impact | Required By |
|---|---------|--------|-------------|
| 1 | Payment Integration | Cannot collect revenue | Go-live |
| 2 | Email Notifications | Users miss booking updates | Go-live |
| 3 | Booking Receipts | Tender compliance (KRAV-ADM-07) | Go-live |
| 4 | Work Queue Integration | Case handler productivity | Phase 3 |
| 5 | All Booking Types | Feature completeness | Tender demo |

### Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Booking type coverage | 50% (2/4) | 100% (4/4) | Booking types implemented |
| Payment flow | 0% | 100% | End-to-end Vipps transaction |
| Notification channels | 50% (2/4) | 100% (4/4) | Channels operational |
| Work queue integration | 0% | 100% | SDK hooks connected |
| Receipt generation | 0% | 100% | PDF download working |

### Dependencies on Later Phases

| This Phase Item | Required By |
|-----------------|-------------|
| 4 Booking Types | Phase 3 (Role-Specific UX) |
| Payment Integration | Phase 4 (Enterprise Features) |
| Email Notifications | Phase 5 (Observability) |
| Work Queue | Phase 3 (Case Handler Flows) |

### Tender Compliance Items

| KRAV ID | Requirement | Status | Action |
|---------|-------------|--------|--------|
| KRAV-ADM-05 | Allocation suggestions | DONE | None |
| KRAV-ADM-07 | Booking receipts | PARTIAL | Complete PDF generation |
| KRAV-BRK-01 | Booking types | PARTIAL | Add all-day, event types |
| KRAV-BRK-02 | Approval workflows | DONE | None |
| KRAV-INT-01 | Payment integration | PARTIAL | Complete Vipps flow |
| KRAV-NOT-01 | Notification delivery | PARTIAL | Add email/SMS |

---

*Document generated as part of Enterprise Platform Roadmap (Task 041)*
*Based on analysis files: api-routes.md, sdk-services.md, app-backoffice.md, app-web.md, app-minside.md*
