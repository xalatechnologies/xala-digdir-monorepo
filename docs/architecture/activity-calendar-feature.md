# 📅 **ACTIVITY CALENDAR FEATURE - GAP ANALYSIS**

**Date:** 2026-01-17  
**Category:** Public events and activity scheduling  
**Priority:** P1 (High value for discovery & marketing)

---

## 📋 **OVERVIEW**

The **Activity Calendar** is a public-facing feature that shows scheduled events, classes, and activities happening at rental locations. This is distinct from private bookings.

**Use Cases:**
- Sports hall shows "Youth Basketball Training" schedule
- Community center advertises "Yoga Classes"
- Concert venue displays upcoming performances
- Meeting room building shows public seminars
- Sports field shows match schedules

---

## 1. ACTIVITY CALENDAR vs BOOKINGS

### 1.1 **Key Differences**

| Aspect | Booking | Activity/Event |
|--------|---------|----------------|
| **Visibility** | Private (user's own) | Public (everyone can see) |
| **Purpose** | Reserve resource | Inform & attract |
| **Capacity** | Blocks availability | May allow concurrent bookings |
| **Discovery** | Not searchable | Searchable & filterable |
| **Registration** | Book to attend | Register/buy tickets |
| **Recurring** | Series of bookings | Recurring schedule |
| **Marketing** | No | Yes (promotions, images) |

### 1.2 **Relationship**

```
Activity Calendar Event
  ↓
May create underlying Booking (blocks time)
  OR
Runs alongside bookings (doesn't block)
```

**Examples:**
- **Blocking Activity:** "Private Soccer Training" (blocks field)
- **Non-blocking Activity:** "Open Gym Hours" (anyone can book within)
- **Public Event:** "Championship Game" (blocks + has tickets)

---

## 2. CURRENT STATUS

### 2.1 **What Exists?** 🔍

Let me check what's in the codebase...

**Searched for:**
- ❌ No `activities` module found
- ❌ No `events` module found  
- ✅ `calendar` module exists (but for bookings only)
- ❌ No public event calendar

**Coverage:** 🔴 **0% - COMPLETELY MISSING**

---

## 3. REQUIRED FEATURES

### 3.1 **Activity/Event Management**

```typescript
// Activity/Event entity
interface Activity {
  id: string;
  tenantId: string;
  organizationId: string;
  rentalObjectId: string;
  
  // Basic info
  title: string;
  description: string;
  category: "CLASS" | "EVENT" | "TRAINING" | "MATCH" | "WORKSHOP" | "PERFORMANCE";
  
  // Visibility
  isPublic: boolean;
  isSearchable: boolean;
  isFeatured: boolean;
  
  // Scheduling
  startTime: Date;
  endTime: Date;
  isRecurring: boolean;
  recurrenceRule?: string; // iCal RRULE
  
  // Capacity
  maxParticipants?: number;
  currentParticipants: number;
  allowWaitlist: boolean;
  
  // Registration
  requiresRegistration: boolean;
  registrationDeadline?: Date;
  registrationFee?: number;
  
  // Marketing
  imageUrl?: string;
  tags: string[];
  instructorName?: string;
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  
  // Integration
  blocksBookings: boolean; // Does it block the calendar?
  linkedBookingId?: string; // If it creates a booking
  
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
}
```

### 3.2 **API Endpoints** ❌ ALL MISSING

```typescript
// Public endpoints
GET    /api/activities                          // Public activity calendar
GET    /api/activities/:id                      // Activity details
GET    /api/rental-objects/:id/activities       // Activities at venue
GET    /api/activities/featured                 // Featured activities
POST   /api/activities/:id/register             // Register for activity

// Admin endpoints
POST   /api/admin/activities                    // Create activity
PATCH  /api/admin/activities/:id                // Update activity
DELETE /api/admin/activities/:id                // Delete activity
PATCH  /api/admin/activities/:id/publish        // Publish activity
PATCH  /api/admin/activities/:id/cancel         // Cancel activity

// Registration management
GET    /api/admin/activities/:id/participants   // Participant list
PATCH  /api/admin/activities/:id/participants/:userId/approve
PATCH  /api/admin/activities/:id/participants/:userId/reject

// Recurring activities
POST   /api/admin/activities/recurring          // Create recurring schedule
PATCH  /api/admin/activities/series/:id         // Update series
```

### 3.3 **Calendar Integration**

```typescript
// Unified calendar view
GET /api/rental-objects/:id/calendar
Response: {
  bookings: Booking[];      // Private bookings
  activities: Activity[];   // Public activities
  blocked: BlockedTime[];   // Maintenance/unavailable
  
  // Combined view for rendering
  slots: Array<{
    startTime: string;
    endTime: string;
    type: "BOOKING" | "ACTIVITY" | "BLOCKED" | "AVAILABLE";
    title: string;
    isPublic: boolean;
    canBook: boolean;
  }>;
}
```

---

## 4. DATABASE SCHEMA

### 4.1 **New Tables Needed** ❌

```sql
-- Activities/Events
CREATE TABLE domain.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id),
  organization_id UUID NOT NULL REFERENCES platform.organizations(id),
  rental_object_id UUID NOT NULL REFERENCES domain.rental_objects(id),
  
  -- Basic info
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  
  -- Visibility
  is_public BOOLEAN DEFAULT true,
  is_searchable BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Scheduling
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- iCal RRULE format
  parent_series_id UUID REFERENCES domain.activities(id), -- For recurring
  
  -- Capacity
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  allow_waitlist BOOLEAN DEFAULT false,
  
  -- Registration
  requires_registration BOOLEAN DEFAULT false,
  registration_deadline TIMESTAMP,
  registration_fee_cents INTEGER,
  
  -- Marketing
  image_url TEXT,
  tags TEXT[],
  instructor_name VARCHAR(100),
  difficulty VARCHAR(20),
  
  -- Integration
  blocks_bookings BOOLEAN DEFAULT true,
  linked_booking_id UUID REFERENCES domain.bookings(id),
  
  -- Status
  status VARCHAR(20) DEFAULT 'DRAFT',
  published_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  
  -- Audit
  created_by UUID REFERENCES platform.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activities_rental_object ON domain.activities(rental_object_id);
CREATE INDEX idx_activities_time_range ON domain.activities(start_time, end_time);
CREATE INDEX idx_activities_public ON domain.activities(is_public, is_searchable) WHERE status = 'PUBLISHED';
CREATE INDEX idx_activities_series ON domain.activities(parent_series_id) WHERE parent_series_id IS NOT NULL;

-- Activity registrations
CREATE TABLE domain.activity_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES domain.activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform.users(id),
  
  -- Registration details
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, CONFIRMED, CANCELLED, WAITLIST
  registered_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  -- Payment
  payment_status VARCHAR(20), -- PENDING, PAID, REFUNDED
  payment_amount_cents INTEGER,
  
  -- Additional info
  notes TEXT,
  
  UNIQUE(activity_id, user_id)
);

CREATE INDEX idx_activity_registrations_activity ON domain.activity_registrations(activity_id);
CREATE INDEX idx_activity_registrations_user ON domain.activity_registrations(user_id);
```

---

## 5. UI COMPONENTS NEEDED

### 5.1 **Public Activity Calendar**

```typescript
// Component: PublicActivityCalendar
<PublicActivityCalendar
  rentalObjectId="hall-1"
  view="month" | "week" | "list"
  showBookings={false} // Only show public activities
  onActivityClick={(activity) => navigate(`/activities/${activity.id}`)}
/>

// Features:
- Month/week/list views
- Filter by category
- Search activities
- Featured activities highlighted
- Click to see details + register
```

### 5.2 **Activity Discovery**

```typescript
// Component: ActivityGrid
<ActivityGrid
  filters={{
    category: "CLASS",
    tag: "yoga",
    difficulty: "BEGINNER",
    startDate: "2026-01-20"
  }}
  featured={true}
/>

// Features:
- Grid/list toggle
- Category filters
- Tag cloud
- Search bar
- "Featured" section
```

### 5.3 **Activity Detail Page**

```typescript
// Route: /activities/:id
<ActivityDetailPage>
  - Hero image
  - Title, description
  - Instructor info
  - Schedule (if recurring)
  - Capacity indicator
  - Registration button
  - Location map
  - Related activities
</ActivityDetailPage>
```

### 5.4 **Admin Activity Manager**

```typescript
// Backoffice component
<ActivityManager>
  - Create/edit activities
  - Recurring schedule builder
  - Participant list
  - Registration management
  - Publish/unpublish
  - Analytics (attendance, revenue)
</ActivityManager>
```

---

## 6. USE CASES

### 6.1 **Sports Club**

```typescript
// Weekly soccer training
{
  title: "Youth Soccer Training",
  category: "TRAINING",
  rentalObjectId: "soccer-field-1",
  isRecurring: true,
  recurrenceRule: "FREQ=WEEKLY;BYDAY=TU,TH;UNTIL=20260630",
  startTime: "17:00",
  endTime: "19:00",
  maxParticipants: 30,
  requiresRegistration: true,
  registrationFee: 50000, // 500 NOK per session
  blocksBookings: true, // Field not available during training
  isPublic: true
}
```

### 6.2 **Community Center**

```typescript
// Public yoga class
{
  title: "Morning Yoga",
  category: "CLASS",
  rentalObjectId: "gym-hall-a",
  isRecurring: true,
  recurrenceRule: "FREQ=WEEKLY;BYDAY=MO,WE,FR",
  startTime: "07:00",
  endTime: "08:00",
  maxParticipants: 20,
  requiresRegistration: true,
  instructorName: "Emma Hansen",
  difficulty: "BEGINNER",
  blocksBookings: false, // Others can book other parts of hall
  isPublic: true
}
```

### 6.3 **Concert Venue**

```typescript
// One-time concert
{
  title: "Winter Jazz Concert",
  category: "PERFORMANCE",
  rentalObjectId: "concert-hall",
  isRecurring: false,
  startTime: "2026-02-14T19:00:00Z",
  endTime: "2026-02-14T22:00:00Z",
  maxParticipants: 500,
  requiresRegistration: true,
  registrationFee: 250000, // 2500 NOK ticket
  isFeatured: true,
  blocksBookings: true,
  isPublic: true,
  imageUrl: "https://example.com/concert-poster.jpg"
}
```

---

## 7. INTEGRATION POINTS

### 7.1 **Calendar Module**

```typescript
// Extend existing calendar service
class CalendarService {
  // NEW: Get combined view
  async getCombinedCalendar(rentalObjectId: string, range: DateRange) {
    const bookings = await this.getBookings(rentalObjectId, range);
    const activities = await this.getActivities(rentalObjectId, range);
    
    return this.mergeCalendarItems(bookings, activities);
  }
  
  // NEW: Check availability considering activities
  async checkAvailability(rentalObjectId: string, timeSlot: TimeSlot) {
    const blockingActivity = await this.getBlockingActivity(rentalObjectId, timeSlot);
    if (blockingActivity) {
      return { available: false, reason: 'ACTIVITY_SCHEDULED' };
    }
    
    return this.checkBookingAvailability(rentalObjectId, timeSlot);
  }
}
```

### 7.2 **Booking Conflict Detection**

```typescript
// Update conflict detection to include activities
async function detectConflicts(bookingRequest) {
  const conflicts =[];
  
  // Existing: Check booking conflicts
  const bookingConflicts = await checkBookingConflicts(bookingRequest);
  conflicts.push(...bookingConflicts);
  
  // NEW: Check activity conflicts
  const activityConflicts = await checkActivityConflicts(bookingRequest);
  conflicts.push(...activityConflicts);
  
  return conflicts;
}

async function checkActivityConflicts(bookingRequest) {
  const activities = await db.activities
    .where('rental_object_id', bookingRequest.rentalObjectId)
    .where('blocks_bookings', true)
    .where('start_time', '<', bookingRequest.endTime)
    .where('end_time', '>', bookingRequest.startTime)
    .where('status', 'PUBLISHED');
    
  return activities.map(activity => ({
    type: 'ACTIVITY_CONFLICT',
    conflictWith: activity,
    message: `Public activity "${activity.title}" is scheduled at this time`
  }));
}
```

---

## 8. IMPLEMENTATION PLAN

### Phase 1: Foundation (Week 1) - P1

**Tasks:**
1. Create database schema
   ```sql
   - domain.activities table
   - domain.activity_registrations table
   - Indexes and constraints
   ```

2. Build API module
   ```typescript
   apps/api/src/modules/activities/
   ├── activities.service.ts
   ├── activities.controller.ts
   ├── activities.routes.ts
   └── activities.schema.ts
   ```

3. Create SDK service
   ```typescript
   packages/client-sdk/src/services/activities.service.ts
   packages/client-sdk/src/hooks/use-activities.ts
   ```

**Deliverables:**
- ✅ CRUD operations for activities
- ✅ Public activity listing
- ✅ Registration flow
- ✅ Basic calendar integration

**ETA:** 5 days

### Phase 2: Calendar Integration (Week 2) - P1

**Tasks:**
1. Update calendar service
   - Merge activities into calendar view
   - Activity-aware conflict detection

2. Build UI components
   - PublicActivityCalendar
   - ActivityGrid
   - ActivityDetailPage

3. Admin interface
   - Activity manager
   - Participant management

**Deliverables:**
- ✅ Combined calendar view
- ✅ Public activity discovery
- ✅ Admin activity management

**ETA:** 5 days

### Phase 3: Advanced Features (Week 3-4) - P2

**Tasks:**
1. Recurring activities
   - RRULE support
   - Series management

2. Marketing features
   - Featured activities
   - Activity recommendations
   - Email notifications

3. Analytics
   - Attendance tracking
   - Revenue reports
   - Popular activities

**Deliverables:**
- ✅ Full recurring support
- ✅ Marketing tools
- ✅ Analytics dashboard

**ETA:** 5 days

---

## 9. PRICING/BUSINESS MODEL

### 9.1 **Activity Revenue Streams**

```typescript
interface ActivityRevenue {
  // Registration fees
  registrationFees: {
    perSession: number;
    seasonal: number;
    memberDiscount: number;
  };
  
  // Commission model
  platformCommission?: {
    percentage: number; // e.g., 10% of registration
    fixed: number; // e.g., 50 NOK per registration
  };
  
  // Instructor split
  instructorPayout?: {
    percentage: number; // e.g., 70% to instructor
    minimum: number; // Minimum guaranteed payout
  };
}
```

### 9.2 **Economic Model**

**Option 1: Direct Revenue**
- Tenant charges registration fees
- Platform takes commission (e.g., 10%)

**Option 2: Instructor Platform**
- Instructors can list classes
- Platform handles registration
- Revenue split: 70% instructor / 30% platform

---

## 10. NORWEGIAN CONTEXT

### 10.1 **Typical Activities**

```typescript
// Norwegian sports/cultural activities
const commonActivities = [
  // Sports
  { no: "Fotballtrening", en: "Soccer Training" },
  { no: "Håndballkamp", en: "Handball Match" },
  { no: "Svømming", en: "Swimming" },
  { no: "Styrketrening", en: "Strength Training" },
  
  // Cultural
  { no: "Korstøvelse", en: "Choir Practice" },
  { no: "Teaterforestilling", en: "Theater Performance" },
  { no: "Kunstutstilling", en: "Art Exhibition" },
  
  // Classes
  { no: "Yoga", en: "Yoga" },
  { no: "Dans", en: "Dance" },
  { no: "Kampsport", en: "Martial Arts" },
  
  // Community
  { no: "Årsmøte", en: "Annual Meeting" },
  { no: "Barneaktiviteter", en: "Children's Activities" },
  { no: "Seniortreff", en: "Senior Gathering" }
];
```

---

## 11. SUCCESS METRICS

### 11.1 **Key Metrics**

```typescript
interface ActivityMetrics {
  // Engagement
  totalActivities: number;
  publishedActivities: number;
  averageParticipants: number;
  attendanceRate: number; // Registered vs showed up
  
  // Revenue
  totalRevenue: number;
  revenuePerActivity: number;
  averageRegistrationFee: number;
  
  // Discovery
  searchesPerDay: number;
  activityViews: number;
  conversionRate: number; // Views to registrations
  
  // Retention
  repeatParticipants: number;
  participantChurnRate: number;
}
```

---

## 12. COMPETITIVE ANALYSIS

### 12.1 **Similar Features in Other Systems**

| Platform | Activity Calendar | Notes |
|----------|-------------------|-------|
| **Eventbrite** | ✅ Yes | Full event management |
| **Meetup** | ✅ Yes | Group activities focus |
| **Mindbody** | ✅ Yes | Class schedules for studios |
| **SimplyBook.me** | ⚠️ Partial | Bookings + classes |
| **Our System** | ❌ **MISSING** | **Need to add!** |

---

## 📊 **SUMMARY**

### Current Status
- **Activity Calendar:** 🔴 **0% - COMPLETELY MISSING**
- **Public Event Discovery:** 🔴 **0% - MISSING**
- **Registration System:** 🔴 **0% - MISSING**

### Impact
- **Business Value:** 🔥 **HIGH** - New revenue stream
- **User Experience:** 🔥 **HIGH** - Discovery & engagement
- **Marketing:** 🔥 **HIGH** - Showcase venue activities

### Effort
- **Database:** 2 tables + indexes
- **Backend:** 1 module (activities)
- **Frontend:** 4 major components
- **Total:** ~15 days for full implementation

### Priority
- **P1 (High)** - Should be in Phase 2-3 roadmap
- **Quick Win:** Basic activity listing (3 days)
- **Full Feature:** 15 days

---

**Created:** 2026-01-17  
**Status:** 🔴 **CRITICAL GAP IDENTIFIED**  
**Recommendation:** Add to Sprint 3-4 (weeks 3-4) after calendar views  
**Business Case:** High value for venue marketing and community engagement

---

**Next Steps:**
1. Add to roadmap (Week 3-4)
2. Create database migration
3. Build activity module
4. Integrate with calendar
5. Build public discovery UI
