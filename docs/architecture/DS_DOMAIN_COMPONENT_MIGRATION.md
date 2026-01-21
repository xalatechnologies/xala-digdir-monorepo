# Design System Domain Component Migration Plan

> **Document Status**: Analysis Complete - Ready for Implementation
> **Created**: 2026-01-21
> **PR Reference**: D.1 - Domain Component Analysis and Migration Planning

---

## Executive Summary

This document outlines the migration plan for moving domain-specific UI components from `@xalatechnologies/platform/ui` (packages/platform/src/ui/) to `@digilist/ui` (packages/digilist-ui/). The goal is to maintain a clear separation between:

1. **Platform-agnostic components** - Reusable across any domain (stay in `@xalatechnologies/platform/ui`)
2. **Domain-specific components** - Specific to Digilist booking domain (move to `@digilist/ui`)

---

## Current State Analysis

### Source Location
`packages/platform/src/ui/blocks/` - Contains 74 TSX files across multiple directories.

### Target Location
`packages/digilist-ui/src/blocks/` - Already has domain components with own implementations.

### Migration Strategy
- **Phase 1** (This PR): Analysis and stub creation for backward compatibility
- **Phase 2** (Follow-up PR): Actual code migration with source deletion
- **Phase 3** (Follow-up PR): Deprecation warnings and app updates

---

## Component Classification

### KEEP in Platform (Domain-Agnostic) - 40 Components

These components are generic, reusable across any domain, and contain no booking/rental-specific terminology.

| Component | Path | Rationale |
|-----------|------|-----------|
| **UI Foundation** |
| `AccessibilityDashboard` | blocks/ | Generic accessibility tooling |
| `AuthComponents` | blocks/ | Generic authentication UI |
| `BarChart` | blocks/ | Generic data visualization |
| `DashboardComponents` | blocks/ | Generic StatCard, KPICard |
| `ErrorBoundary` | blocks/ | Generic error handling |
| `GlobalErrorHandler` | blocks/ | Generic error handler |
| `HeatmapChart` | blocks/ | Generic data visualization |
| `ImageGallery` | blocks/ | Generic image display |
| `ImageSlider` | blocks/ | Generic image slider |
| `LoginComponents` | blocks/ | Generic login UI |
| `NotificationBell` | blocks/ | Generic notification icon |
| `NotificationCenter` | blocks/ | Generic notification list |
| `NotificationItem` | blocks/ | Generic notification display |
| `PushNotificationPrompt` | blocks/ | Generic push prompt |
| `RequireAuthModal` | blocks/ | Generic auth gating |
| `ResultsEmptyState` | blocks/ | Generic empty states |
| `ResultsSkeleton` | blocks/ | Generic loading states |
| **Account Management** |
| `AccountSelectionModal` | blocks/account/ | Generic account switching |
| `AccountSelector` | blocks/account/ | Generic account picker |
| `AccountSwitcher` | blocks/account/ | Generic account UI |
| **Admin Components** |
| `EffectivePermissionsView` | blocks/admin/ | Generic RBAC display |
| `PermissionMatrix` | blocks/admin/ | Generic permission grid |
| `ScopeSelector` | blocks/admin/ | Generic scope picker |
| `UserInviteForm` | blocks/admin/ | Generic user invitation |
| **GDPR Components** |
| `ConsentManager` | blocks/gdpr/ | Generic consent management |
| `ConsentPopup` | blocks/gdpr/ | Generic consent UI |
| `ConsentSettings` | blocks/gdpr/ | Generic consent config |
| `DataExportCard` | blocks/gdpr/ | Generic data export |
| `DataSubjectRequestForm` | blocks/gdpr/ | Generic DSR form |
| `DeleteAccountCard` | blocks/gdpr/ | Generic account deletion |
| `RequestStatusBadge` | blocks/gdpr/ | Generic status display |
| **Help Components** |
| `HelpPanel` | blocks/help/ | Generic help UI |
| **Messaging** |
| `messaging` | blocks/ | Generic messaging components |
| **Profile & Settings** |
| `ProfileCard` | blocks/profile/ | Generic profile display |
| `SettingsLayout` | blocks/settings/ | Generic settings layout |
| `ProfileTab` | blocks/settings/ | Generic profile settings |
| `PreferencesTab` | blocks/settings/ | Generic preferences |
| **Notifications** |
| `NotificationItem` | blocks/notifications/ | Generic notification item |
| **Activity** |
| `ActivityFeed` | blocks/activity/ | Generic activity timeline |

---

### MOVE to @digilist/ui (Domain-Specific) - 34 Components

These components contain domain-specific terminology (booking, rental, season, venue) or Digilist-specific business logic.

| Component | Current Path | Domain Indicators | Migration Status |
|-----------|--------------|-------------------|------------------|
| **Core Rental Object Components** |
| `RentalObjectCard` | blocks/ | "RentalObject", domain props | Has impl in digilist-ui |
| `RentalObjectDetailHeader` | blocks/ | "RentalObject", domain layout | Has impl in digilist-ui |
| `RentalObjectGrid` | blocks/ | "RentalObject" | Has impl in digilist-ui |
| `RentalObjectListItem` | blocks/ | "RentalObject" | Has impl in digilist-ui |
| `RentalObjectMap` | blocks/ | "RentalObject", markers | Has impl in digilist-ui |
| `RentalObjectTableView` | blocks/ | "RentalObject", admin table | Has impl in digilist-ui |
| `RentalObjectTabs` | blocks/ | "RentalObject", detail tabs | Has impl in digilist-ui |
| `RentalObjectToolbar` | blocks/ | "RentalObject", search/filter | Has impl in digilist-ui |
| `RentalObjectAvailabilityCalendar` | blocks/ | Calendar modes, booking slots | Has impl in digilist-ui |
| **Booking Components** |
| `AvailabilityCalendar` | blocks/ | Booking availability | Has impl in digilist-ui |
| `BookingConfirmation` | blocks/ | "Booking" terminology | Has impl in digilist-ui |
| `BookingFormModal` | blocks/ | "Booking", form fields | Has impl in digilist-ui |
| `BookingSection` | blocks/ | "Booking" section | Needs stub |
| `BookingSuccess` | blocks/ | "Booking" confirmation | Has impl in digilist-ui |
| `PriceSummaryCard` | blocks/ | Booking pricing | Has impl in digilist-ui |
| **Booking Engine (Full Directory)** |
| `UnifiedBookingEngine` | blocks/booking-engine/ | Multi-step booking | Has impl in digilist-ui |
| `PriceSummary` | blocks/booking-engine/components/ | Booking price | Has impl in digilist-ui |
| `icons` | blocks/booking-engine/ | Booking icons | Has impl in digilist-ui |
| `DailyModeView` | blocks/booking-engine/modes/ | Booking mode | Has impl in digilist-ui |
| `DateRangeModeView` | blocks/booking-engine/modes/ | Booking mode | Has impl in digilist-ui |
| `EventModeView` | blocks/booking-engine/modes/ | Booking mode | Has impl in digilist-ui |
| `InstantModeView` | blocks/booking-engine/modes/ | Booking mode | Has impl in digilist-ui |
| `RecurringModeView` | blocks/booking-engine/modes/ | Booking mode | Has impl in digilist-ui |
| `BookingConfirmStep` | blocks/booking-engine/steps/ | Booking step | Has impl in digilist-ui |
| `BookingFormStep` | blocks/booking-engine/steps/ | Booking step | Has impl in digilist-ui |
| **Season Components** |
| `SeasonCard` | blocks/seasons/ | "Season", "Venue" | Has impl in digilist-ui |
| `VenueCard` | blocks/seasons/ | "Venue", allocation | Has impl in digilist-ui |
| **Status Components (Domain-Specific)** |
| `StatusBadges` | blocks/ | BookingStatusBadge, PaymentStatusBadge | Partial in digilist-ui |
| **Detail Page Components** |
| `FAQTab` | blocks/ | "rental object" FAQ | Needs stub |
| `GuidelinesTab` | blocks/ | "rental object" guidelines | Needs stub |
| `ContactInfoCard` | blocks/ | Venue contact info | Needs stub |
| `LocationCard` | blocks/ | Venue location | Needs stub |
| `OpeningHoursCard` | blocks/ | Venue hours | Needs stub |
| `CapacityCard` | blocks/ | Venue capacity | Needs stub |
| **Supporting Components** |
| `KeyFactsRow` | blocks/ | Rental object facts | Has impl in digilist-ui |
| `FavoriteButton` | blocks/ | Rental favorites | Has impl in digilist-ui |
| `ShareButton` | blocks/ | Rental sharing | Has impl in digilist-ui |
| `FacilityChips` | blocks/ | Venue amenities | Has impl as AmenityChips |
| `AdditionalServicesList` | blocks/ | Booking services | Needs stub |

---

## Components Already Migrated

The following components already have implementations in `@digilist/ui` and do NOT need stubs:

### In `packages/digilist-ui/src/blocks/rental-objects/`
- `RentalObjectCard.tsx`
- `RentalObjectGrid.tsx`
- `RentalObjectListItem.tsx`
- `RentalObjectDetailHeader.tsx`
- `RentalObjectTableView.tsx`
- `RentalObjectTabs.tsx`
- `RentalObjectToolbar.tsx`
- `RentalObjectMap.tsx`
- `RentalObjectAvailabilityCalendar.tsx`
- `AvailabilityCalendar.tsx`
- `KeyFactsRow.tsx`
- `FavoriteButton.tsx`
- `ShareButton.tsx`
- `StatusBadges.tsx` (StatusTag, partial status badges)

### In `packages/digilist-ui/src/blocks/booking/`
- `BookingFormModal.tsx`
- `BookingConfirmation.tsx`
- `BookingSuccess.tsx`
- `PriceSummaryCard.tsx`

### In `packages/digilist-ui/src/blocks/seasons/`
- `SeasonCard.tsx`
- `VenueCard.tsx`

### In `packages/digilist-ui/src/booking-engine/`
- `UnifiedBookingEngine.tsx`
- `modes/DailyModeView.tsx`
- `modes/DateRangeModeView.tsx`
- `modes/EventModeView.tsx`
- `modes/InstantModeView.tsx`
- `modes/RecurringModeView.tsx`
- `steps/BookingConfirmStep.tsx`
- `steps/BookingFormStep.tsx`
- `components/PriceSummary.tsx`
- `icons.tsx`

### In `packages/digilist-ui/src/blocks/`
- `AmenityChips.tsx` (renamed from FacilityChips)

---

## Components Requiring New Stubs

The following components exist in platform but NOT yet in digilist-ui and need backward-compatibility stubs:

### High Priority (Used in Apps)
1. `BookingSection` - Used in rental object detail pages
2. `AdditionalServicesList` - Used in booking flow
3. `FAQTab` - Used in rental object detail pages
4. `GuidelinesTab` - Used in rental object detail pages
5. `ContactInfoCard` - Used in rental object detail pages
6. `LocationCard` - Used in rental object detail pages
7. `OpeningHoursCard` - Used in rental object detail pages
8. `CapacityCard` - Used in rental object detail pages

### Lower Priority (Assess Usage)
- Domain-specific status badges from `StatusBadges.tsx` (BookingStatusBadge, PaymentStatusBadge, etc.)

---

## Stub File Pattern

For backward compatibility, create stub files that re-export from the platform location:

```typescript
// packages/digilist-ui/src/blocks/rental-objects/FAQTab.tsx
/**
 * FAQTab - Domain stub for backward compatibility
 *
 * @deprecated Import from @xalatechnologies/platform/ui instead.
 * This re-export will be removed in a future version.
 */
export {
  FAQTab,
  type FAQTabProps,
} from '@xalatechnologies/platform/ui/blocks';

// Log deprecation warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '[@digilist/ui] FAQTab imported from @digilist/ui is deprecated. ' +
    'Import from @xalatechnologies/platform/ui instead.'
  );
}
```

---

## Implementation Checklist

### Phase 1: Stub Creation (This PR)
- [x] Analyze all components in platform/ui/blocks
- [x] Classify components as platform vs domain
- [x] Document migration plan
- [ ] Create stub files for missing domain components
- [ ] Update digilist-ui index exports

### Phase 2: Migration (Follow-up PR)
- [ ] Move domain component source code to digilist-ui
- [ ] Update imports in digilist-ui implementations
- [ ] Test all apps for regressions
- [ ] Update platform/ui to re-export from digilist-ui (temporary)

### Phase 3: Cleanup (Follow-up PR)
- [ ] Remove domain components from platform/ui
- [ ] Update all app imports
- [ ] Remove re-exports and deprecation warnings
- [ ] Update documentation

---

## Import Migration Guide

### Before (Old Pattern)
```typescript
// Apps importing domain components from platform
import { RentalObjectCard, BookingFormModal } from '@xala/ds';
import { RentalObjectCard } from '@xalatechnologies/platform/ui';
```

### After (New Pattern)
```typescript
// Domain components from @digilist/ui
import { RentalObjectCard, BookingFormModal } from '@digilist/ui';

// Platform components stay in platform
import { Button, Card, Modal } from '@xalatechnologies/platform/ui';
```

---

## Decision Criteria for Classification

A component is **domain-specific** if it:
1. Contains "Booking", "Rental", "Season", "Venue", "Listing" in name or props
2. Uses `@digilist/client-sdk` hooks or types
3. Contains Norwegian rental/booking business terminology
4. Has business logic specific to resource booking

A component is **platform-agnostic** if it:
1. Uses generic props (title, children, onClick)
2. Could be used in any domain (CRM, ERP, etc.)
3. Contains no domain-specific terminology
4. Only uses design system tokens and primitives

---

## Files Created by This Analysis

1. `/docs/architecture/DS_DOMAIN_COMPONENT_MIGRATION.md` - This document

## Files to Create (Stubs)

1. `packages/digilist-ui/src/blocks/detail/index.ts` - Detail page stubs
2. `packages/digilist-ui/src/blocks/detail/FAQTab.tsx`
3. `packages/digilist-ui/src/blocks/detail/GuidelinesTab.tsx`
4. `packages/digilist-ui/src/blocks/detail/ContactInfoCard.tsx`
5. `packages/digilist-ui/src/blocks/detail/LocationCard.tsx`
6. `packages/digilist-ui/src/blocks/detail/OpeningHoursCard.tsx`
7. `packages/digilist-ui/src/blocks/detail/CapacityCard.tsx`
8. `packages/digilist-ui/src/blocks/booking/BookingSection.tsx`
9. `packages/digilist-ui/src/blocks/booking/AdditionalServicesList.tsx`

---

## Notes

1. **digilist-ui already has implementations** - Many components have been independently implemented in digilist-ui with proper domain separation. These do NOT need stubs.

2. **AmenityChips replaces FacilityChips** - The term "facility" has been deprecated in favor of "amenity" per coding standards.

3. **Booking engine is complete** - The entire booking-engine directory has been migrated to digilist-ui.

4. **Platform blocks note in index** - The digilist-ui rental-objects index already documents that platform-neutral blocks should be imported from platform/ui.

---

**Last Updated**: 2026-01-21
**Author**: Claude Code (AI Analysis)
**Reviewed By**: Pending
