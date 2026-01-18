# CRITICAL FIXES IMPLEMENTATION PLAN

**Date**: 2026-01-16 11:25:00  
**Status**: IN PROGRESS

---

## CRITICAL FIX #1: RBAC Middleware ✅ COMPLETE

**File Created**: `apps/api/src/middleware/rbac.ts`

**Features**:
- `requireAuth()` - Verify user is logged in
- `requireRole(role)` - Require minimum role level
- `requireAnyRole(roles[])` - Require one of multiple roles
- `requireTenantAccess()` - Ensure tenant isolation
- Helper functions: `hasRole()`, `hasAnyRole()`

**Role Hierarchy**:
1. CITIZEN (level 1)
2. CASEWORKER (level 2)
3. ADMIN (level 3)
4. SAAS_ADMIN (level 4)

**RFC7807 Errors**: All unauthorized/forbidden responses use RFC7807 format

---

## CRITICAL FIX #2: Booking Approve/Reject Endpoints

**Status**: IN PROGRESS

**Required Changes**:

### 1. Add to BookingService (`apps/api/src/modules/booking/booking.service.ts`)

```typescript
/**
 * Approve booking (caseworker/admin only)
 */
async approve(id: string, userId: string, reason?: string): Promise<Booking> {
  const booking = await this.repository.findByIdOrFail(id);
  
  // Update status to approved
  const updated = await this.repository.update(id, {
    status: 'approved',
    metadata: {
      ...booking.metadata,
      approvedBy: userId,
      approvedAt: new Date().toISOString(),
      approvalReason: reason,
    },
  });

  // Audit log
  getAuditService().log({
    tenantId: booking.tenantId,
    userId,
    action: 'approve',
    resource: 'booking',
    resourceId: id,
    metadata: { reason },
  });

  // Broadcast event
  broadcastBookingEvent({
    type: 'approved',
    bookingId: id,
    rentalObjectId: booking.rentalObjectId,
    tenantId: booking.tenantId,
    userId,
  });

  return updated as unknown as Booking;
}

/**
 * Reject booking (caseworker/admin only)
 */
async reject(id: string, userId: string, reason: string): Promise<Booking> {
  const booking = await this.repository.findByIdOrFail(id);
  
  // Update status to rejected
  const updated = await this.repository.update(id, {
    status: 'rejected',
    metadata: {
      ...booking.metadata,
      rejectedBy: userId,
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason,
    },
  });

  // Audit log
  getAuditService().log({
    tenantId: booking.tenantId,
    userId,
    action: 'reject',
    resource: 'booking',
    resourceId: id,
    severity: 'warning',
    metadata: { reason },
  });

  // Broadcast event
  broadcastBookingEvent({
    type: 'rejected',
    bookingId: id,
    rentalObjectId: booking.rentalObjectId,
    tenantId: booking.tenantId,
    userId,
    metadata: { reason },
  });

  return updated as unknown as Booking;
}
```

### 2. Add to BookingController (`apps/api/src/modules/booking/booking.controller.ts`)

```typescript
import { requireAuth, requireRole, UserRole } from '../../middleware/rbac';

/**
 * PATCH /api/bookings/:id/approve - Approve booking
 */
@Patch('/:id/approve')
async approve(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  // Apply RBAC middleware
  await requireAuth(request, reply);
  await requireRole(UserRole.CASEWORKER)(request, reply);
  
  const { reason } = request.body as { reason?: string };
  const userId = request.user!.userId;
  
  const booking = await this.service.approve(request.params.id, userId, reason);
  return { data: booking };
}

/**
 * PATCH /api/bookings/:id/reject - Reject booking
 */
@Patch('/:id/reject')
async reject(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  // Apply RBAC middleware
  await requireAuth(request, reply);
  await requireRole(UserRole.CASEWORKER)(request, reply);
  
  const { reason } = request.body as { reason: string };
  
  if (!reason) {
    return reply.status(400).send({
      type: 'https://api.digilist.no/errors/validation-error',
      title: 'Validation Error',
      status: 400,
      detail: 'Rejection reason is required',
    });
  }
  
  const userId = request.user!.userId;
  const booking = await this.service.reject(request.params.id, userId, reason);
  return { data: booking };
}
```

---

## CRITICAL FIX #3: Demo Seed Script

**Status**: READY TO IMPLEMENT

**File**: `apps/api/src/database/seeds/demo-seed.ts`

**Requirements**:
- 40+ rental objects (30 LOCALE, 10+ ARRANGEMENT)
- Demo users with known credentials
- Sample bookings in various states
- Blocked periods
- Feature flags configured

**Demo Credentials**:
```
citizen@demo.no / Demo2026!
caseworker@demo.no / Demo2026!
admin@demo.no / Demo2026!
```

---

## NEXT STEPS

1. ✅ Implement RBAC middleware
2. ⏳ Add approve/reject to BookingService
3. ⏳ Add approve/reject to BookingController
4. ⏳ Create demo seed script
5. ⏳ Test all endpoints
6. ⏳ Update SDK hooks
7. ⏳ Add Backoffice UI

---

**Estimated Time Remaining**: 2-3 hours
