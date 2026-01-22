# Design System Compliance Report: packages/ds

**Generated:** 2026-01-19T11:37:59.479Z

## Summary

| Metric | Value |
|--------|-------|
| Files Scanned | 140 |
| Total Violations | 205 |
| Critical | 39 |
| Major | 110 |
| Minor | 56 |

## Violations by Type

| Type | Count |
|------|-------|
| hardcodedSpacing | 157 |
| hexColor | 36 |
| rgbaColor | 7 |
| hardcodedFontSize | 3 |
| hardcodedLineHeight | 2 |

## Critical Violations (39)

> [!CAUTION]
> These violations should be fixed immediately.

### packages/ds/src/blocks/BookingSection.tsx

- **Line 708**: Hardcoded font-size - `font-size: 9px`

### packages/ds/src/blocks/LoginComponents.tsx

- **Line 116**: Hardcoded hex color - `#ffffff`
- **Line 193**: Hardcoded hex color - `#ffffff`
- **Line 566**: Hardcoded hex color - `#ffffff`
- **Line 582**: Hardcoded hex color - `#ffffff`
- **Line 593**: Hardcoded hex color - `#ffffff`

### packages/ds/src/blocks/ShareButton.tsx

- **Line 239**: Hardcoded hex color - `#1877F2`
- **Line 244**: Hardcoded hex color - `#000000`
- **Line 249**: Hardcoded hex color - `#0A66C2`
- **Line 254**: Hardcoded hex color - `#25D366`

### packages/ds/src/blocks/booking-engine/styles.ts

- **Line 308**: Hardcoded font-size - `font-size: 9px`
- **Line 758**: Hardcoded font-size - `font-size: 9px`

### packages/ds/src/primitives/icons.tsx

- **Line 603**: Hardcoded hex color - `#1E2B3C`
- **Line 621**: Hardcoded hex color - `#F3F3F3`
- **Line 622**: Hardcoded hex color - `#F25022`
- **Line 623**: Hardcoded hex color - `#7FBA00`
- **Line 624**: Hardcoded hex color - `#00A4EF`
- **Line 625**: Hardcoded hex color - `#FFB900`
- **Line 640**: Hardcoded hex color - `#FFFFFF`
- **Line 641**: Hardcoded hex color - `#4285F4`
- **Line 642**: Hardcoded hex color - `#34A853`
- **Line 643**: Hardcoded hex color - `#FBBC05`
- ... and 3 more

### packages/ds/src/utils.ts

- **Line 130**: Hardcoded hex color - `#1F2F6E`
- **Line 135**: Hardcoded hex color - `#2F55A4`
- **Line 140**: Hardcoded hex color - `#9EDBE5`
- **Line 145**: Hardcoded hex color - `#D6F3F6`
- **Line 150**: Hardcoded hex color - `#8BC34A`
- **Line 155**: Hardcoded hex color - `#FFFFFF`
- **Line 160**: Hardcoded hex color - `#0F172A`
- **Line 172**: Hardcoded hex color - `#1F2F6E`
- **Line 173**: Hardcoded hex color - `#2F55A4`
- **Line 174**: Hardcoded hex color - `#9EDBE5`
- ... and 4 more

## Major Violations (110)

### packages/ds/src/blocks/AdditionalServicesList.tsx

- **Line 205**: Hardcoded spacing: 44px - `width: '44px`
- **Line 206**: Hardcoded spacing: 44px - `height: '44px`
- **Line 288**: Hardcoded spacing: 24px - `width: '24px`
- **Line 289**: Hardcoded spacing: 24px - `height: '24px`

### packages/ds/src/blocks/AuthComponents.tsx

- **Line 100**: Hardcoded spacing: 64px - `width: '64px`
- **Line 101**: Hardcoded spacing: 64px - `height: '64px`
- **Line 290**: Hardcoded spacing: 64px - `width: '64px`
- **Line 291**: Hardcoded spacing: 64px - `height: '64px`

### packages/ds/src/blocks/AvailabilityCalendar.tsx

- **Line 376**: Hardcoded spacing: 44px - `Height: '44px`

### packages/ds/src/blocks/BookingFormModal.tsx

- **Line 272**: Hardcoded spacing: 36px - `width: '36px`
- **Line 273**: Hardcoded spacing: 36px - `height: '36px`
- **Line 591**: Hardcoded spacing: 599px - `width: 599px`

### packages/ds/src/blocks/BookingSection.tsx

- **Line 520**: Hardcoded spacing: 36px - `width: 36px`
- **Line 521**: Hardcoded spacing: 36px - `height: 36px`
- **Line 627**: Hardcoded spacing: 36px - `width: 36px`
- **Line 628**: Hardcoded spacing: 36px - `height: 36px`
- **Line 853**: Hardcoded spacing: 64px - `width: 64px`
- ... and 4 more

### packages/ds/src/blocks/BookingSuccess.tsx

- **Line 136**: Hardcoded spacing: 36px - `width: '36px`
- **Line 137**: Hardcoded spacing: 36px - `height: '36px`

### packages/ds/src/blocks/FacilityChips.tsx

- **Line 220**: Hardcoded spacing: 36px - `width: '36px`
- **Line 221**: Hardcoded spacing: 36px - `height: '36px`

### packages/ds/src/blocks/ImageGallery.tsx

- **Line 207**: Hardcoded spacing: 768px - `width: 768px`

### packages/ds/src/blocks/ImageSlider.tsx

- **Line 263**: Hardcoded spacing: 48px - `width: '48px`
- **Line 264**: Hardcoded spacing: 48px - `height: '48px`
- **Line 289**: Hardcoded spacing: 48px - `width: '48px`
- **Line 290**: Hardcoded spacing: 48px - `height: '48px`
- **Line 468**: Hardcoded spacing: 48px - `width: '48px`
- ... and 1 more

### packages/ds/src/blocks/LoginComponents.tsx

- **Line 134**: Hardcoded spacing: 36px - `width: '36px`
- **Line 135**: Hardcoded spacing: 36px - `height: '36px`
- **Line 339**: Hardcoded spacing: 1024px - `width: 1024px`

### packages/ds/src/blocks/NotificationCenter.tsx

- **Line 349**: Hardcoded spacing: 36px - `width: '36px`
- **Line 350**: Hardcoded spacing: 36px - `height: '36px`

### packages/ds/src/blocks/NotificationItem.tsx

- **Line 393**: Hardcoded spacing: 32px - `width: '32px`
- **Line 394**: Hardcoded spacing: 32px - `height: '32px`
- **Line 424**: Hardcoded spacing: 32px - `width: '32px`
- **Line 425**: Hardcoded spacing: 32px - `height: '32px`

### packages/ds/src/blocks/PushNotificationPrompt.tsx

- **Line 102**: Hardcoded spacing: 32px - `width: '32px`
- **Line 103**: Hardcoded spacing: 32px - `height: '32px`
- **Line 128**: Hardcoded spacing: 64px - `width: '64px`
- **Line 129**: Hardcoded spacing: 64px - `height: '64px`

### packages/ds/src/blocks/RentalObjectAvailabilityCalendar.tsx

- **Line 430**: Hardcoded spacing: 36px - `Height: '36px`
- **Line 532**: Hardcoded spacing: 56px - `Height: '56px`
- **Line 680**: Hardcoded spacing: 56px - `Height: '56px`
- **Line 1045**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 1074**: Hardcoded spacing: 44px - `Height: '44px`

### packages/ds/src/blocks/RentalObjectTabs.tsx

- **Line 212**: Hardcoded spacing: 48px - `width: '48px`
- **Line 213**: Hardcoded spacing: 48px - `height: '48px`

### packages/ds/src/blocks/RequireAuthModal.tsx

- **Line 116**: Hardcoded spacing: 32px - `width: '32px`
- **Line 117**: Hardcoded spacing: 32px - `height: '32px`
- **Line 142**: Hardcoded spacing: 64px - `width: '64px`
- **Line 143**: Hardcoded spacing: 64px - `height: '64px`

### packages/ds/src/blocks/ShareButton.tsx

- **Line 289**: Hardcoded spacing: 32px - `width: '32px`
- **Line 290**: Hardcoded spacing: 32px - `height: '32px`

### packages/ds/src/blocks/booking-engine/styles.ts

- **Line 108**: Hardcoded spacing: 36px - `width: 36px`
- **Line 109**: Hardcoded spacing: 36px - `height: 36px`
- **Line 219**: Hardcoded spacing: 36px - `width: 36px`
- **Line 220**: Hardcoded spacing: 36px - `height: 36px`
- **Line 319**: Hardcoded spacing: 38px - `height: 38px`
- ... and 14 more

### packages/ds/src/blocks/messaging.tsx

- **Line 127**: Hardcoded spacing: 18px - `Width: '18px`
- **Line 128**: Hardcoded spacing: 18px - `height: '18px`
- **Line 195**: Hardcoded spacing: 44px - `width: '44px`
- **Line 196**: Hardcoded spacing: 44px - `height: '44px`

### packages/ds/src/components/ImageUpload.tsx

- **Line 403**: Hardcoded spacing: 32px - `width: 32px`
- **Line 404**: Hardcoded spacing: 32px - `height: 32px`

### packages/ds/src/components/TimelineCalendar/TimelineCalendar.css

- **Line 265**: Hardcoded spacing: 768px - `width: 768px`

### packages/ds/src/composed/BookingStepper.tsx

- **Line 149**: Hardcoded spacing: 48px - `width: '48px`
- **Line 150**: Hardcoded spacing: 48px - `height: '48px`
- **Line 208**: Hardcoded spacing: 24px - `Top: '24px`

### packages/ds/src/composed/RentalObjectCalendar/RentalObjectCalendar.css

- **Line 369**: Hardcoded spacing: 768px - `width: 768px`

### packages/ds/src/composed/WizardStepper.tsx

- **Line 100**: Hardcoded spacing: 24px - `width: '24px`
- **Line 101**: Hardcoded spacing: 24px - `height: '24px`

### packages/ds/src/composed/bottom-navigation.tsx

- **Line 145**: Hardcoded spacing: 64px - `Width: '64px`
- **Line 146**: Hardcoded spacing: 48px - `Height: '48px`
- **Line 147**: Hardcoded spacing: 168px - `Width: '168px`
- **Line 167**: Hardcoded spacing: 24px - `width: '24px`
- **Line 168**: Hardcoded spacing: 24px - `height: '24px`
- ... and 1 more

### packages/ds/src/composed/data-page/BulkActionsBar.tsx

- **Line 98**: Hardcoded spacing: 32px - `height: '32px`
- **Line 123**: Hardcoded spacing: 32px - `height: '32px`

### packages/ds/src/composed/data-page/FilterChips.tsx

- **Line 87**: Hardcoded spacing: 32px - `height: '32px`

### packages/ds/src/composed/dialogs.tsx

- **Line 245**: Hardcoded spacing: 44px - `width: '44px`
- **Line 246**: Hardcoded spacing: 44px - `height: '44px`
- **Line 341**: Hardcoded spacing: 44px - `width: '44px`
- **Line 342**: Hardcoded spacing: 44px - `height: '44px`

### packages/ds/src/composed/header-parts.tsx

- **Line 60**: Hardcoded spacing: 599px - `width: 599px`

### packages/ds/src/composed/header.tsx

- **Line 129**: Hardcoded spacing: 599px - `width: 599px`

### packages/ds/src/composed/mobile-nav.tsx

- **Line 121**: Hardcoded spacing: 44px - `Width: '44px`
- **Line 122**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 271**: Hardcoded spacing: 48px - `Height: '48px`
- **Line 317**: Hardcoded spacing: 24px - `width: '24px`
- **Line 318**: Hardcoded spacing: 24px - `height: '24px`

