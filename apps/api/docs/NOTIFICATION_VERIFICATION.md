# Notification Triggers Verification Guide

## Overview
This document provides steps to manually verify that notification triggers are working correctly for application status changes.

## Implementation Summary
Added notification triggers to three endpoints in `season-applications.controller.ts`:
1. **Approve** (`PUT /api/season-applications/:id/approve`)
2. **Reject** (`PUT /api/season-applications/:id/reject`)
3. **Allocate** (`POST /api/season-applications/:id/allocate`)

## Prerequisites
1. Start the API server:
   ```bash
   cd apps/api
   pnpm dev
   ```

2. Ensure you have:
   - A season created in the database
   - At least one season application in "pending" status
   - The application should be linked to a season and listing

## Verification Steps

### 1. Test Approve Notification

```bash
# Replace {application-id} with an actual application ID
curl -X PUT http://localhost:3002/api/season-applications/{application-id}/approve \
  -H "Content-Type: application/json"
```

**Expected Result:**
- API returns 200 status with updated application
- Console log shows:
  ```
  [NOTIFICATION] application_approved - Søknad godkjent to applicant@email.com
  ```

**Notification Contains:**
- Type: `application_approved`
- Title: "Søknad godkjent"
- Message: Details about the listing, weekday, time slot, and season
- Applicant email and name
- All application metadata

### 2. Test Reject Notification

```bash
# Replace {application-id} with an actual application ID
curl -X PUT http://localhost:3002/api/season-applications/{application-id}/reject \
  -H "Content-Type: application/json" \
  -d '{"rejectionReason": "Tidsrommet er allerede allokert til et annet lag"}'
```

**Expected Result:**
- API returns 200 status with updated application
- Console log shows:
  ```
  [NOTIFICATION] application_rejected - Søknad avvist to applicant@email.com
  ```

**Notification Contains:**
- Type: `application_rejected`
- Title: "Søknad avvist"
- Message: Details including rejection reason
- All application metadata

### 3. Test Allocate Notification

```bash
# Replace {application-id} with an APPROVED application ID
curl -X POST http://localhost:3002/api/season-applications/{application-id}/allocate \
  -H "Content-Type: application/json"
```

**Expected Result:**
- API returns 200 status with created bookings
- Console log shows:
  ```
  [NOTIFICATION] application_allocated - Sesongallokering bekreftet to applicant@email.com
  ```

**Notification Contains:**
- Type: `application_allocated`
- Title: "Sesongallokering bekreftet"
- Message: Details including number of bookings created
- All application metadata
- Booking count

## Notification Format

Each notification follows this structure:

```json
{
  "id": "notif-{timestamp}-{random}",
  "type": "application_approved | application_rejected | application_allocated",
  "title": "Norwegian title",
  "message": "Norwegian message with details",
  "read": false,
  "createdAt": "ISO timestamp",
  "data": {
    "applicationId": "uuid",
    "applicantEmail": "email@example.com",
    "applicantName": "Name",
    "seasonName": "Season Name",
    "listingName": "Listing Name",
    "weekday": 1,
    "startTime": "10:00",
    "endTime": "12:00",
    "rejectionReason": "Optional reason",
    "bookingsCreated": 10
  }
}
```

## Weekday Mapping (Norwegian)
- 0: Søndag
- 1: Mandag
- 2: Tirsdag
- 3: Onsdag
- 4: Torsdag
- 5: Fredag
- 6: Lørdag

## Future Integration
Currently, notifications are logged to console with a TODO comment indicating future integration with:
- Real notification service (when implemented)
- Database persistence in notifications table (when schema is added)
- SDK notification hooks (when available)
- Email/SMS delivery (when notification channels are configured)

The notification helper function `createApplicationNotification()` is designed to be easily replaced with a real notification service call.

## Troubleshooting

### Application not found (404)
- Verify the application ID exists in the database
- Check that you're using the correct tenant context

### Cannot allocate (400)
- Ensure the application status is "approved" before calling allocate
- Only approved applications can be allocated

### No console logs visible
- Check that the API server is running in development mode
- Verify console log level is set to show INFO logs

## Next Steps
After verification:
1. Test all three notification types
2. Verify Norwegian messages are correct and understandable
3. Confirm all notification data fields are populated correctly
4. Document any issues or improvements needed
5. Proceed to subtask-6-2: Batch notifications for finalize-allocations endpoint
