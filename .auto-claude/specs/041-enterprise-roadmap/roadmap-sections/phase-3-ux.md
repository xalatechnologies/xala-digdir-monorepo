# Phase 3: Role-Specific UX

**Phase Type:** User Experience / MUST-HAVE
**Priority Level:** HIGH
**Status:** IN PROGRESS
**Estimated Duration:** 4-6 weeks
**Last Updated:** 2026-01-15

---

## Overview

Phase 3 delivers role-specific user experiences across all three frontend applications (web, backoffice, minside). Each of the 7 platform roles requires tailored dashboards, navigation, workflows, and UI components. This phase ensures that users see only what they need based on their role, improving usability, security, and productivity.

**Key Focus Areas:**
- Public user browsing and discovery experience
- Authenticated user self-service portal (MinSide)
- Organization user team management workflows
- Case handler productivity tools
- Admin tenant management dashboards
- Tenant Admin configuration interfaces
- Super Admin platform operations views

**Dependencies:**
- Phase 1 Core Platform Stability (7-Role RBAC)
- Phase 2 Functional Completion (Booking Engine, Workflows)

**Success Criteria:**
- Each role has a dedicated dashboard view
- Navigation adapts dynamically to user role
- Role-specific features are accessible and intuitive
- Unauthorized UI elements are hidden (not just disabled)
- WCAG 2.1 AA compliance for all role UIs

---

## 3.1 Public User Experience (apps/web)

### 3.1.1 Public Landing Page

- ✅ **Description**: Optimized landing page for public users with featured listings, search, and category browsing
- 🔍 **Verification**:
  - Visit `apps/web` at root path without authentication
  - Verify featured listings displayed
  - Search bar prominent and functional
  - Category navigation visible
  - No authenticated-only features visible
- 📦 **Affected**: apps/web (LandingPage, FeaturedListings)
- 👤 **Roles**: Public
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.1.2 Listing Discovery Flow

- ✅ **Description**: Browse and filter listings without authentication
- 🔍 **Verification**:
  - `/listings` route accessible without login
  - Filter by category, location, date
  - Map view shows listing locations
  - SDK `PublicService.getListings()` used
  - Pagination works correctly
- 📦 **Affected**: apps/web (ListingsPage, ListingFilters, MapView)
- 👤 **Roles**: Public
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.1.3 Listing Detail View

- ✅ **Description**: Detailed listing information with availability calendar and booking prompt
- 🔍 **Verification**:
  - `/listings/:id` route shows full listing details
  - Image gallery functional
  - Availability calendar visible (read-only for public)
  - "Login to book" prompt for unauthenticated users
  - SDK `PublicService.getListing()` used
- 📦 **Affected**: apps/web (ListingDetailPage)
- 👤 **Roles**: Public
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.1.4 Public Search Experience

- ✅ **Description**: Full-text and faceted search for listings
- 🔍 **Verification**:
  - Search from header returns results
  - Results show relevance ranking
  - Facets for category, price range, availability
  - Search analytics tracked (anonymously)
  - Mobile-optimized search UI
- 📦 **Affected**: apps/web (SearchPage, SearchResults)
- 👤 **Roles**: Public
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Poor discoverability reduces booking conversion
- ➡️ **Action**: Implement faceted search filters and search suggestions

### 3.1.5 Login/Register Prompts

- ✅ **Description**: Contextual login prompts when public user attempts authenticated action
- 🔍 **Verification**:
  - "Login to book" button on listing detail
  - Login modal shows BankID/ID-porten options
  - Register flow for new users
  - Redirect back to original page after auth
  - Social login options visible
- 📦 **Affected**: apps/web (AuthModal, LoginPage)
- 👤 **Roles**: Public (transitioning to Authenticated)
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.1.6 Public Category Pages

- ✅ **Description**: Dedicated pages for each listing category with optimized content
- 🔍 **Verification**:
  - `/categories/:slug` routes for each category
  - Category-specific hero images
  - Featured listings per category
  - SEO metadata for category pages
  - Category navigation breadcrumbs
- 📦 **Affected**: apps/web (CategoryPage)
- 👤 **Roles**: Public
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Reduced SEO and discoverability
- ➡️ **Action**: Create dedicated category landing pages

### 3.1.7 Mobile-Responsive Public UI

- ✅ **Description**: Optimized mobile experience for public browsing
- 🔍 **Verification**:
  - Test on mobile viewport (375px width)
  - Touch-friendly navigation
  - Mobile map interactions work
  - Image galleries swipeable
  - Forms usable on mobile keyboard
- 📦 **Affected**: apps/web (all public pages)
- 👤 **Roles**: Public
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

---

## 3.2 Authenticated User Experience (apps/web, apps/minside)

### 3.2.1 User Dashboard (MinSide)

- ✅ **Description**: Personal dashboard showing upcoming bookings, notifications, and quick actions
- 🔍 **Verification**:
  - `apps/minside` default route shows dashboard
  - Upcoming bookings widget
  - Unread notifications count
  - Quick booking action
  - SDK `useMyBookings()` hook used
- 📦 **Affected**: apps/minside (DashboardPage)
- 👤 **Roles**: Authenticated User
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.2.2 Booking Flow (Web)

- ✅ **Description**: Complete booking flow from selection to confirmation for authenticated users
- 🔍 **Verification**:
  - Select time slot on availability calendar
  - Review booking details and pricing
  - Proceed to payment (Vipps)
  - Confirmation page with booking reference
  - Email confirmation sent
- 📦 **Affected**: apps/web (BookingFlow, BookingConfirmation)
- 👤 **Roles**: Authenticated User
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Users cannot complete bookings end-to-end
- ➡️ **Action**: Complete payment integration in booking flow

### 3.2.3 My Bookings List

- ✅ **Description**: View all user's own bookings with filtering and status
- 🔍 **Verification**:
  - `/my/bookings` route shows booking list
  - Filter by status (upcoming, past, cancelled)
  - Booking details accessible
  - Cancel action for cancellable bookings
  - SDK `useMyBookings()` hook used
- 📦 **Affected**: apps/minside (MyBookingsPage)
- 👤 **Roles**: Authenticated User
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.2.4 Booking Cancellation Flow

- ✅ **Description**: User-initiated booking cancellation with confirmation and refund info
- 🔍 **Verification**:
  - Cancel button on upcoming bookings
  - Confirmation dialog shows cancellation policy
  - Refund amount displayed if applicable
  - SDK `useCancelBooking()` mutation used
  - Audit logged
- 📦 **Affected**: apps/minside (BookingDetail, CancelDialog)
- 👤 **Roles**: Authenticated User
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Users cannot self-service cancel bookings
- ➡️ **Action**: Complete cancellation flow with refund display

### 3.2.5 User Profile Management

- ✅ **Description**: View and edit user profile information
- 🔍 **Verification**:
  - `/my/profile` route shows profile form
  - Edit name, phone, email preferences
  - Profile picture upload
  - SDK `useUpdateProfile()` mutation used
  - Changes audited
- 📦 **Affected**: apps/minside (ProfilePage)
- 👤 **Roles**: Authenticated User
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.2.6 Notification Center

- ✅ **Description**: View and manage in-app notifications
- 🔍 **Verification**:
  - Notification bell in header with count
  - Dropdown shows recent notifications
  - Mark as read functionality
  - Link to full notification history
  - SDK `useNotifications()` hook used
- 📦 **Affected**: apps/minside (NotificationCenter, NotificationBell)
- 👤 **Roles**: Authenticated User
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.2.7 Notification Preferences

- ✅ **Description**: Configure notification channels and frequency
- 🔍 **Verification**:
  - `/my/settings/notifications` route
  - Toggle email, SMS, push per notification type
  - SDK `useNotificationPreferences()` hook used
  - Preferences persisted and respected
  - GDPR consent for each channel
- 📦 **Affected**: apps/minside (NotificationSettingsPage)
- 👤 **Roles**: Authenticated User
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.2.8 Payment History

- ✅ **Description**: View payment and invoice history
- 🔍 **Verification**:
  - `/my/payments` route shows payment list
  - Invoice download available
  - Payment status visible
  - Filter by date range
  - SDK `useMyPayments()` hook used
- 📦 **Affected**: apps/minside (PaymentsPage)
- 👤 **Roles**: Authenticated User
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Users cannot track their payment history
- ➡️ **Action**: Connect to SDK payment hooks

### 3.2.9 Messages/Conversations

- ✅ **Description**: Direct messaging with listing owners or case handlers
- 🔍 **Verification**:
  - `/my/messages` route shows conversations
  - Send/receive messages
  - Unread indicator
  - SDK `useConversations()` hook used
  - Real-time message updates
- 📦 **Affected**: apps/minside (MessagesPage, ConversationView)
- 👤 **Roles**: Authenticated User
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.2.10 GDPR Data Export Request

- ✅ **Description**: Request export of all personal data per GDPR Article 20
- 🔍 **Verification**:
  - `/my/settings/privacy` shows data export option
  - Request button triggers export job
  - User notified when export ready
  - Download link provided
  - Request logged to audit
- 📦 **Affected**: apps/minside (PrivacySettingsPage), api
- 👤 **Roles**: Authenticated User
- 📊 **Status**: MISSING
- 🚨 **Risk**: GDPR non-compliance - data portability required
- ➡️ **Action**: Implement data export request flow

### 3.2.11 Account Deletion Request

- ✅ **Description**: Request account deletion per GDPR Article 17 (right to erasure)
- 🔍 **Verification**:
  - `/my/settings/privacy` shows deletion option
  - Confirmation dialog explains consequences
  - Request triggers deletion workflow
  - Outstanding bookings handled
  - Request logged to audit
- 📦 **Affected**: apps/minside (PrivacySettingsPage), api
- 👤 **Roles**: Authenticated User
- 📊 **Status**: MISSING
- 🚨 **Risk**: GDPR non-compliance - erasure rights required
- ➡️ **Action**: Implement account deletion request flow

---

## 3.3 Organization User Experience (apps/web, apps/minside)

### 3.3.1 Organization Dashboard

- ✅ **Description**: Dashboard for organization users showing org listings, bookings, and team stats
- 🔍 **Verification**:
  - Organization context visible in header
  - Org-specific KPIs displayed
  - Team member activity summary
  - Organization listings widget
  - SDK `useOrganization()` hook used
- 📦 **Affected**: apps/minside (OrgDashboardPage)
- 👤 **Roles**: Organization User
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Organization users lack visibility into org activity
- ➡️ **Action**: Create organization dashboard view

### 3.3.2 Organization Listings Management

- ✅ **Description**: View and manage listings belonging to the organization
- 🔍 **Verification**:
  - `/org/listings` route shows org listings
  - Create new listing for organization
  - Edit org listing details
  - SDK `useOrgListings()` hook used
  - Proper org-scoped permissions enforced
- 📦 **Affected**: apps/minside (OrgListingsPage)
- 👤 **Roles**: Organization User
- 📊 **Status**: MISSING
- 🚨 **Risk**: Organizations cannot manage their own listings
- ➡️ **Action**: Implement organization listing management UI

### 3.3.3 Organization Bookings View

- ✅ **Description**: View bookings for all organization listings
- 🔍 **Verification**:
  - `/org/bookings` route shows org bookings
  - Filter by listing, date, status
  - Booking details accessible
  - SDK `useOrgBookings()` hook used
  - Read-only (no approval rights)
- 📦 **Affected**: apps/minside (OrgBookingsPage)
- 👤 **Roles**: Organization User
- 📊 **Status**: MISSING
- 🚨 **Risk**: Organizations cannot track bookings on their listings
- ➡️ **Action**: Implement organization bookings view

### 3.3.4 Team Member Management

- ✅ **Description**: View and manage organization team members
- 🔍 **Verification**:
  - `/org/members` route shows member list
  - Invite new members by email
  - Remove members (org admin only)
  - SDK `useOrgMembers()` hook used
  - Role assignment within org
- 📦 **Affected**: apps/minside (OrgMembersPage)
- 👤 **Roles**: Organization User
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Organizations cannot manage team access
- ➡️ **Action**: Complete member management with invite flow

### 3.3.5 Organization Profile

- ✅ **Description**: View and edit organization profile information
- 🔍 **Verification**:
  - `/org/profile` route shows org profile
  - Edit org name, description, logo
  - Organization contact information
  - SDK `useOrganization()` hook used
  - Changes audited
- 📦 **Affected**: apps/minside (OrgProfilePage)
- 👤 **Roles**: Organization User
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Organization profile incomplete
- ➡️ **Action**: Complete organization profile editing

### 3.3.6 Seasonal Lease Applications

- ✅ **Description**: Submit and track seasonal lease applications on behalf of organization
- 🔍 **Verification**:
  - `/org/applications` route shows applications
  - New application form
  - Application status tracking
  - SDK `useSeasonApplications()` hook used
  - Historical applications visible
- 📦 **Affected**: apps/minside (OrgApplicationsPage)
- 👤 **Roles**: Organization User
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Organizations cannot apply for seasonal leases
- ➡️ **Action**: Complete application flow in MinSide

### 3.3.7 Organization Billing

- ✅ **Description**: View organization invoices and billing summary
- 🔍 **Verification**:
  - `/org/billing` route shows billing info
  - Invoice list with download
  - Outstanding balance shown
  - SDK `useOrgBilling()` hook used
  - Payment history visible
- 📦 **Affected**: apps/minside (OrgBillingPage)
- 👤 **Roles**: Organization User
- 📊 **Status**: MISSING
- 🚨 **Risk**: Organizations cannot view their billing status
- ➡️ **Action**: Implement organization billing view

### 3.3.8 Organization Switcher

- ✅ **Description**: Switch between organizations for users with multiple org memberships
- 🔍 **Verification**:
  - Dropdown in header shows user's organizations
  - Switching org updates context throughout app
  - Current org clearly indicated
  - SDK `useMyOrganizations()` hook used
  - Session maintains selected org
- 📦 **Affected**: apps/minside (OrgSwitcher)
- 👤 **Roles**: Organization User (multi-org)
- 📊 **Status**: MISSING
- 🚨 **Risk**: Multi-org users cannot easily switch context
- ➡️ **Action**: Implement organization switcher component

---

## 3.4 Case Handler Experience (apps/backoffice)

### 3.4.1 Case Handler Dashboard

- ✅ **Description**: Dedicated dashboard for case handlers with work queue and KPIs
- 🔍 **Verification**:
  - Dashboard shows pending items count
  - Today's schedule visible
  - Quick action buttons
  - Performance metrics widget
  - SDK `useCaseHandlerStats()` hook used
- 📦 **Affected**: apps/backoffice (CaseHandlerDashboard)
- 👤 **Roles**: Case Handler
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Case handlers lack role-specific dashboard
- ➡️ **Action**: Create case handler specific dashboard view

### 3.4.2 Work Queue Interface

- ✅ **Description**: Centralized queue for booking approvals and case management
- 🔍 **Verification**:
  - `/work-queue` route shows pending items
  - Filter by type, priority, date
  - Sort by urgency
  - Bulk actions available
  - SDK `usePendingBookings()` hook used (not mock data)
- 📦 **Affected**: apps/backoffice (WorkQueuePage)
- 👤 **Roles**: Case Handler
- 📊 **Status**: PARTIAL (uses mock data)
- 🚨 **Risk**: Case handlers cannot process real booking requests
- ➡️ **Action**: Connect work queue to SDK hooks

### 3.4.3 Booking Review Panel

- ✅ **Description**: Detailed booking review with approve/reject actions
- 🔍 **Verification**:
  - Click booking in queue opens review panel
  - All booking details visible
  - Customer history shown
  - Approve/reject buttons functional
  - Reason field for rejection
- 📦 **Affected**: apps/backoffice (BookingReviewPanel)
- 👤 **Roles**: Case Handler
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.4.4 Calendar Management View

- ✅ **Description**: Visual calendar for managing bookings and blocks
- 🔍 **Verification**:
  - `/calendar` route shows full calendar
  - Day/week/month views
  - Drag to create blocks
  - Click booking for details
  - Real-time updates via WebSocket
- 📦 **Affected**: apps/backoffice (CalendarPage)
- 👤 **Roles**: Case Handler
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.4.5 Conflict Resolution Interface

- ✅ **Description**: Tools to identify and resolve booking conflicts
- 🔍 **Verification**:
  - Calendar highlights conflicts
  - Conflict details shown on hover
  - Resolution suggestions offered
  - Contact customer action available
  - SDK `useConflictDetection()` hook used
- 📦 **Affected**: apps/backoffice (ConflictResolution)
- 👤 **Roles**: Case Handler
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.4.6 Customer Lookup

- ✅ **Description**: Search and view customer information for case handling
- 🔍 **Verification**:
  - Search customers by name, email, phone
  - Customer booking history visible
  - Payment history visible
  - Notes and flags shown
  - SDK `useCustomerSearch()` hook used
- 📦 **Affected**: apps/backoffice (CustomerLookup)
- 👤 **Roles**: Case Handler
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Case handlers cannot research customer context
- ➡️ **Action**: Implement customer search and detail view

### 3.4.7 Seasonal Lease Review

- ✅ **Description**: Review and process seasonal lease applications
- 🔍 **Verification**:
  - `/season-applications/review` route accessible
  - Application details with org info
  - Historical application data
  - Allocation suggestions visible
  - SDK hooks connected (not mock data)
- 📦 **Affected**: apps/backoffice (SeasonApplicationsReviewPage)
- 👤 **Roles**: Case Handler
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.4.8 Allocation Planner

- ✅ **Description**: Visual tool for planning seasonal allocations
- 🔍 **Verification**:
  - `/allocation-planner` route accessible
  - Drag-and-drop allocation interface
  - Conflict detection during planning
  - Save draft allocations
  - SDK `useAllocationPlanner()` hooks used
- 📦 **Affected**: apps/backoffice (AllocationPlannerPage)
- 👤 **Roles**: Case Handler
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.4.9 Decision Form Generation

- ✅ **Description**: Generate formal decision documents for allocations
- 🔍 **Verification**:
  - `/decision-forms` route accessible
  - Generate decision from allocation
  - PDF export available
  - Template customization
  - Decision linked to audit trail
- 📦 **Affected**: apps/backoffice (DecisionFormsPage)
- 👤 **Roles**: Case Handler
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Formal documentation requirements not met
- ➡️ **Action**: Complete decision form PDF generation

### 3.4.10 Case Notes

- ✅ **Description**: Add internal notes to bookings and applications for case tracking
- 🔍 **Verification**:
  - Notes field on booking/application detail
  - Notes history visible
  - Notes searchable
  - SDK `useNotes()` hook used
  - Notes not visible to customers
- 📦 **Affected**: apps/backoffice (CaseNotes)
- 👤 **Roles**: Case Handler
- 📊 **Status**: MISSING
- 🚨 **Risk**: Case handlers cannot document their work
- ➡️ **Action**: Implement internal notes system

---

## 3.5 Admin Experience (apps/backoffice)

### 3.5.1 Admin Dashboard

- ✅ **Description**: Comprehensive dashboard with tenant-wide KPIs and management tools
- 🔍 **Verification**:
  - Dashboard shows tenant-wide metrics
  - Booking stats, revenue, utilization
  - Active users count
  - Recent activity feed
  - SDK `useDashboard()` hook used
- 📦 **Affected**: apps/backoffice (DashboardPage)
- 👤 **Roles**: Admin
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.5.2 Listing Management

- ✅ **Description**: Full CRUD for tenant listings with status workflow
- 🔍 **Verification**:
  - `/listings` route shows all tenant listings
  - Create, edit, archive, delete actions
  - Listing wizard for new listings
  - Bulk operations available
  - SDK `useListings()` hooks used
- 📦 **Affected**: apps/backoffice (ListingsPage, ListingWizard)
- 👤 **Roles**: Admin
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.5.3 User Management

- ✅ **Description**: Manage users within tenant (view, edit roles, deactivate)
- 🔍 **Verification**:
  - `/users` route shows tenant users
  - Role assignment dropdown
  - Deactivate user action
  - User detail view with activity
  - SDK `useUsers()` hooks used
- 📦 **Affected**: apps/backoffice (UsersPage)
- 👤 **Roles**: Admin
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.5.4 Organization Management

- ✅ **Description**: Manage organizations registered with the tenant
- 🔍 **Verification**:
  - `/organizations` route shows org list
  - View org details and members
  - Verify/unverify organizations
  - View org booking activity
  - SDK `useOrganizations()` hooks used
- 📦 **Affected**: apps/backoffice (OrganizationsPage)
- 👤 **Roles**: Admin
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.5.5 Booking Oversight

- ✅ **Description**: View and manage all bookings within tenant
- 🔍 **Verification**:
  - `/bookings` route shows all tenant bookings
  - Filter by listing, status, date, customer
  - Admin override actions (cancel, modify)
  - Bulk export functionality
  - SDK `useBookings()` hooks used
- 📦 **Affected**: apps/backoffice (BookingsPage)
- 👤 **Roles**: Admin
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.5.6 Reports Dashboard

- ✅ **Description**: Analytics and reporting for tenant performance
- 🔍 **Verification**:
  - `/reports` route shows report options
  - Revenue reports
  - Utilization reports
  - Customer activity reports
  - SDK `useReports()` hooks used
- 📦 **Affected**: apps/backoffice (ReportsPage)
- 👤 **Roles**: Admin
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.5.7 Price Rules Management

- ✅ **Description**: Configure pricing rules for listings
- 🔍 **Verification**:
  - Price rules accessible per listing
  - Multiple rule types supported
  - Preview pricing calculation
  - SDK `useBackofficePriceRules()` hooks used
  - Rules audited
- 📦 **Affected**: apps/backoffice (PriceRulesPage)
- 👤 **Roles**: Admin
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.5.8 Notification Templates

- ✅ **Description**: Manage notification templates and content
- 🔍 **Verification**:
  - `/settings/notifications` accessible
  - Edit email/SMS templates
  - Preview template rendering
  - Multi-language support
  - SDK `useNotificationTemplates()` hooks used
- 📦 **Affected**: apps/backoffice (NotificationTemplatesPage)
- 👤 **Roles**: Admin
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Cannot customize notification content
- ➡️ **Action**: Complete template management UI

### 3.5.9 Discount Code Management

- ✅ **Description**: Create and manage promotional discount codes
- 🔍 **Verification**:
  - `/discounts` route shows code list
  - Create codes with rules
  - Track code usage
  - Deactivate codes
  - SDK `useDiscountCodes()` hooks used
- 📦 **Affected**: apps/backoffice (DiscountsPage)
- 👤 **Roles**: Admin
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.5.10 Audit Log Viewer (Admin)

- ✅ **Description**: View audit logs for tenant activity monitoring
- 🔍 **Verification**:
  - `/audit` route shows audit log
  - Filter by action, user, resource
  - Search functionality
  - Export capability
  - SDK `useAuditLog()` hooks used (not mock data)
- 📦 **Affected**: apps/backoffice (AuditLogPage)
- 👤 **Roles**: Admin
- 📊 **Status**: PARTIAL (uses mock data)
- 🚨 **Risk**: Admins cannot monitor actual system activity
- ➡️ **Action**: Connect audit viewer to SDK hooks

---

## 3.6 Tenant Admin Experience (apps/backoffice)

### 3.6.1 Tenant Settings

- ✅ **Description**: Configure tenant-wide settings and branding
- 🔍 **Verification**:
  - `/tenant/settings` route accessible
  - Tenant name, logo configuration
  - Contact information settings
  - Default timezone and locale
  - SDK `useTenant()` hooks used
- 📦 **Affected**: apps/backoffice (TenantSettingsPage)
- 👤 **Roles**: Tenant Admin
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.6.2 Integration Configuration

- ✅ **Description**: Configure third-party integrations (Vipps, Visma, etc.)
- 🔍 **Verification**:
  - `/tenant/integrations` route accessible
  - Integration enable/disable toggles
  - Credential configuration (secure)
  - Connection testing
  - SDK `useIntegrations()` hooks used
- 📦 **Affected**: apps/backoffice (IntegrationsPage)
- 👤 **Roles**: Tenant Admin
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Cannot configure payment and ERP integrations
- ➡️ **Action**: Complete integration configuration UI

### 3.6.3 Billing Management

- ✅ **Description**: View and manage tenant billing (subscription, invoices)
- 🔍 **Verification**:
  - `/tenant/billing` route accessible
  - Current plan visible
  - Invoice history
  - Payment method management
  - Usage metrics
- 📦 **Affected**: apps/backoffice (TenantBillingPage)
- 👤 **Roles**: Tenant Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Tenant cannot manage subscription
- ➡️ **Action**: Implement tenant billing management

### 3.6.4 Admin User Management

- ✅ **Description**: Manage admin and case handler accounts for tenant
- 🔍 **Verification**:
  - `/tenant/admins` route accessible
  - Create admin/case handler accounts
  - Role assignment for backoffice users
  - MFA enforcement settings
  - Activity monitoring
- 📦 **Affected**: apps/backoffice (TenantAdminsPage)
- 👤 **Roles**: Tenant Admin
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Cannot manage backoffice user access
- ➡️ **Action**: Complete admin user management

### 3.6.5 API Key Management

- ✅ **Description**: Create and manage API keys for integrations
- 🔍 **Verification**:
  - `/tenant/api-keys` route accessible
  - Create new API keys
  - Revoke existing keys
  - Key usage monitoring
  - Scope restrictions
- 📦 **Affected**: apps/backoffice (ApiKeysPage)
- 👤 **Roles**: Tenant Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot enable third-party integrations
- ➡️ **Action**: Implement API key management

### 3.6.6 Tenant Audit Log

- ✅ **Description**: Full audit log access with export capability
- 🔍 **Verification**:
  - `/tenant/audit-log` route accessible
  - Complete audit history
  - Advanced filtering
  - Export to CSV/JSON
  - Compliance reports
- 📦 **Affected**: apps/backoffice (TenantAuditLogPage)
- 👤 **Roles**: Tenant Admin
- 📊 **Status**: PARTIAL (uses mock data)
- 🚨 **Risk**: Cannot demonstrate compliance
- ➡️ **Action**: Connect to SDK with export functionality

### 3.6.7 Seasonal Configuration

- ✅ **Description**: Configure seasonal lease periods and rules
- 🔍 **Verification**:
  - `/tenant/seasons` route accessible
  - Define season periods
  - Application window settings
  - Allocation rules configuration
  - SDK `useTenantSeasons()` hooks used
- 📦 **Affected**: apps/backoffice (SeasonsConfigPage)
- 👤 **Roles**: Tenant Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot configure seasonal lease parameters
- ➡️ **Action**: Implement seasonal configuration UI

### 3.6.8 Email Domain Verification

- ✅ **Description**: Configure and verify email sending domains
- 🔍 **Verification**:
  - `/tenant/email-settings` route accessible
  - Add custom email domain
  - DNS verification instructions
  - Verification status display
  - Test email sending
- 📦 **Affected**: apps/backoffice (EmailSettingsPage)
- 👤 **Roles**: Tenant Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Emails may be marked as spam
- ➡️ **Action**: Implement email domain configuration

---

## 3.7 Super Admin Experience (apps/backoffice)

### 3.7.1 Super Admin Dashboard

- ✅ **Description**: Platform-wide dashboard with cross-tenant metrics
- 🔍 **Verification**:
  - `/admin/dashboard` route accessible for Super Admin only
  - Total tenants count
  - Platform-wide booking stats
  - System health indicators
  - Revenue across all tenants
- 📦 **Affected**: apps/backoffice (SuperAdminDashboard)
- 👤 **Roles**: Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Platform operators lack visibility
- ➡️ **Action**: Create Super Admin dashboard view

### 3.7.2 Tenant Management

- ✅ **Description**: Create, view, and manage all tenants
- 🔍 **Verification**:
  - `/admin/tenants` route accessible
  - Tenant list with status
  - Create new tenant
  - Tenant detail view
  - Suspend/activate tenant
  - SDK `useTenants()` hooks used
- 📦 **Affected**: apps/backoffice (SuperAdminTenantsPage)
- 👤 **Roles**: Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot onboard new municipalities
- ➡️ **Action**: Implement tenant management UI

### 3.7.3 Tenant Impersonation

- ✅ **Description**: View tenant as tenant admin for support purposes
- 🔍 **Verification**:
  - "Impersonate" button on tenant detail
  - Clear impersonation indicator in UI
  - All actions logged to audit
  - Exit impersonation action
  - Limited to view operations
- 📦 **Affected**: apps/backoffice (ImpersonationBanner)
- 👤 **Roles**: Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot provide effective tenant support
- ➡️ **Action**: Implement impersonation mode with audit

### 3.7.4 Platform Configuration

- ✅ **Description**: Configure platform-wide settings and feature flags
- 🔍 **Verification**:
  - `/admin/config` route accessible
  - Feature flag management
  - Default tenant settings
  - Platform branding
  - Maintenance mode toggle
- 📦 **Affected**: apps/backoffice (PlatformConfigPage)
- 👤 **Roles**: Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot control platform behavior
- ➡️ **Action**: Implement platform configuration UI

### 3.7.5 Platform Audit Log

- ✅ **Description**: Cross-tenant audit log with advanced filtering
- 🔍 **Verification**:
  - `/admin/audit` route accessible
  - Filter by tenant
  - Security event filtering
  - Anomaly detection alerts
  - Export for compliance
- 📦 **Affected**: apps/backoffice (PlatformAuditPage)
- 👤 **Roles**: Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot monitor platform security
- ➡️ **Action**: Implement platform-wide audit viewer

### 3.7.6 System Health Monitoring

- ✅ **Description**: Real-time system health and performance metrics
- 🔍 **Verification**:
  - `/admin/health` route accessible
  - API response times
  - Database performance
  - Queue depths
  - Error rates
  - Service status indicators
- 📦 **Affected**: apps/backoffice (SystemHealthPage)
- 👤 **Roles**: Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot proactively identify issues
- ➡️ **Action**: Implement health monitoring dashboard

### 3.7.7 User Lookup (Cross-Tenant)

- ✅ **Description**: Search for users across all tenants for support
- 🔍 **Verification**:
  - Global user search
  - User detail with tenant context
  - Activity history
  - Password reset capability (logged)
  - Account status management
- 📦 **Affected**: apps/backoffice (GlobalUserLookup)
- 👤 **Roles**: Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot provide user support
- ➡️ **Action**: Implement global user search

### 3.7.8 Announcements/Maintenance

- ✅ **Description**: Create platform-wide announcements and maintenance notices
- 🔍 **Verification**:
  - `/admin/announcements` route accessible
  - Create announcement with schedule
  - Target specific tenants or all
  - Maintenance window scheduling
  - Announcement displayed in all apps
- 📦 **Affected**: apps/backoffice (AnnouncementsPage), all apps
- 👤 **Roles**: Super Admin
- 📊 **Status**: MISSING
- 🚨 **Risk**: Cannot communicate with users during incidents
- ➡️ **Action**: Implement announcement system

---

## 3.8 Cross-Role UI Components

### 3.8.1 Role-Based Navigation

- ✅ **Description**: Dynamic navigation that adapts to user role
- 🔍 **Verification**:
  - Navigation items match user permissions
  - Hidden items (not just disabled) for unauthorized
  - Role-specific menu sections
  - Uses RBAC from SDK `useAuthz()` hook
  - Consistent across all apps
- 📦 **Affected**: apps/backoffice, apps/minside, apps/web
- 👤 **Roles**: All
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Users may see unauthorized navigation items
- ➡️ **Action**: Implement permission-based navigation filtering

### 3.8.2 Permission-Based Component Visibility

- ✅ **Description**: Hide or show UI components based on user permissions
- 🔍 **Verification**:
  - `<PermissionGuard permission="X">` component exists
  - Guards check SDK `useAuthz()` permissions
  - Graceful handling of missing permissions
  - Works in all applications
- 📦 **Affected**: apps/backoffice, apps/minside, apps/web
- 👤 **Roles**: All
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Unauthorized actions may be visible
- ➡️ **Action**: Create reusable PermissionGuard component

### 3.8.3 Role Context Display

- ✅ **Description**: Clear indication of current role/context in UI
- 🔍 **Verification**:
  - Role badge in header/profile
  - Organization context shown when applicable
  - Impersonation indicator when active
  - Tenant name in backoffice
- 📦 **Affected**: apps/backoffice, apps/minside
- 👤 **Roles**: All authenticated
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Users unsure of current permissions
- ➡️ **Action**: Add role indicator to user menu

### 3.8.4 Action Feedback

- ✅ **Description**: Consistent feedback for actions (success, error, loading)
- 🔍 **Verification**:
  - Toast notifications for action results
  - Loading states on buttons
  - Error messages with recovery guidance
  - Success confirmations
  - Uses @xala/ds Toast component
- 📦 **Affected**: all apps
- 👤 **Roles**: All
- 📊 **Status**: DONE
- 🚨 **Risk**: N/A
- ➡️ **Action**: None required

### 3.8.5 Accessibility (WCAG 2.1 AA)

- ✅ **Description**: All role UIs meet WCAG 2.1 AA accessibility standards
- 🔍 **Verification**:
  - Keyboard navigation works throughout
  - Screen reader compatibility
  - Color contrast ratios met
  - Focus indicators visible
  - ARIA labels on interactive elements
  - Run `pnpm scan:a11y` for compliance check
- 📦 **Affected**: all apps
- 👤 **Roles**: All
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Legal accessibility requirement not met
- ➡️ **Action**: Complete accessibility audit and remediation

### 3.8.6 Mobile Responsiveness

- ✅ **Description**: All role UIs work on mobile devices
- 🔍 **Verification**:
  - Test all critical flows on 375px viewport
  - Touch-friendly interactions
  - Mobile navigation patterns
  - Form usability on mobile
  - PDF/document viewing on mobile
- 📦 **Affected**: apps/web, apps/minside
- 👤 **Roles**: Public, Authenticated User, Organization User
- 📊 **Status**: PARTIAL
- 🚨 **Risk**: Mobile users cannot complete key tasks
- ➡️ **Action**: Complete mobile UI audit and fixes

---

## Phase 3 Summary

### Status Matrix

| Category | Items | DONE | PARTIAL | MISSING |
|----------|-------|------|---------|---------|
| Public User (3.1) | 7 | 5 | 2 | 0 |
| Authenticated User (3.2) | 11 | 7 | 2 | 2 |
| Organization User (3.3) | 8 | 0 | 4 | 4 |
| Case Handler (3.4) | 10 | 5 | 4 | 1 |
| Admin (3.5) | 10 | 8 | 2 | 0 |
| Tenant Admin (3.6) | 8 | 1 | 4 | 3 |
| Super Admin (3.7) | 8 | 0 | 0 | 8 |
| Cross-Role (3.8) | 6 | 1 | 5 | 0 |
| **TOTAL** | **68** | **27 (40%)** | **23 (34%)** | **18 (26%)** |

### Priority Order

Based on role usage frequency and business impact:

**Week 1-2: Core User Flows**
1. 3.2.2 Booking Flow completion (payment integration)
2. 3.2.4 Booking Cancellation Flow
3. 3.2.10 GDPR Data Export Request
4. 3.2.11 Account Deletion Request

**Week 2-3: Organization User**
5. 3.3.1 Organization Dashboard
6. 3.3.2 Organization Listings Management
7. 3.3.3 Organization Bookings View
8. 3.3.8 Organization Switcher

**Week 3-4: Case Handler Productivity**
9. 3.4.2 Work Queue SDK Integration
10. 3.4.6 Customer Lookup
11. 3.4.9 Decision Form PDF Generation
12. 3.4.10 Case Notes System

**Week 4-5: Tenant Admin**
13. 3.6.2 Integration Configuration
14. 3.6.3 Billing Management
15. 3.6.5 API Key Management
16. 3.6.7 Seasonal Configuration

**Week 5-6: Super Admin & Cross-Role**
17. 3.7.1 Super Admin Dashboard
18. 3.7.2 Tenant Management
19. 3.8.1 Role-Based Navigation
20. 3.8.5 Accessibility Remediation

### Critical Blockers

| # | Blocker | Impact | Required By |
|---|---------|--------|-------------|
| 1 | Organization User UX | Organizations cannot self-serve | Go-live |
| 2 | Work Queue Integration | Case handlers use mock data | Go-live |
| 3 | GDPR User Rights | Legal compliance | Go-live |
| 4 | Super Admin UI | Platform operations blocked | Multi-tenant |
| 5 | Tenant Admin Billing | Cannot manage subscriptions | Enterprise |

### Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Role coverage | 57% (4/7) | 100% (7/7) | Roles with complete UX |
| GDPR flows | 0% | 100% | Export/delete implemented |
| Work queue integration | 0% | 100% | Uses SDK not mock |
| Organization features | 25% | 100% | Org flows complete |
| Super Admin UI | 0% | 100% | Platform ops available |

### Dependencies on Later Phases

| This Phase Item | Required By |
|-----------------|-------------|
| Super Admin UI | Phase 4 (Multi-tenant SaaS) |
| Organization UX | Phase 4 (White-label) |
| GDPR Flows | Phase 5 (Compliance Audit) |
| Role Navigation | Phase 6 (AI Role-Based Features) |

### Role UX Completion Matrix

| Role | Dashboard | Core Flows | Management | Status |
|------|-----------|------------|------------|--------|
| Public | DONE | DONE | N/A | **COMPLETE** |
| Authenticated User | DONE | PARTIAL | DONE | 82% |
| Organization User | PARTIAL | MISSING | PARTIAL | 25% |
| Case Handler | PARTIAL | DONE | PARTIAL | 70% |
| Admin | DONE | DONE | DONE | **COMPLETE** |
| Tenant Admin | DONE | PARTIAL | MISSING | 45% |
| Super Admin | MISSING | MISSING | MISSING | 0% |

### WCAG 2.1 AA Compliance Checklist

| Criterion | Status | Notes |
|-----------|--------|-------|
| 1.1.1 Non-text Content | PARTIAL | Alt text needed on images |
| 1.3.1 Info and Relationships | DONE | Semantic HTML used |
| 1.4.3 Contrast (Minimum) | DONE | Design system enforced |
| 2.1.1 Keyboard | PARTIAL | Some custom components need work |
| 2.4.4 Link Purpose | PARTIAL | Some generic link text |
| 3.3.1 Error Identification | DONE | Form errors marked |
| 4.1.2 Name, Role, Value | PARTIAL | ARIA labels incomplete |

---

*Document generated as part of Enterprise Platform Roadmap (Task 041)*
*Based on analysis files: app-web.md, app-backoffice.md, app-minside.md, RBAC analysis*
