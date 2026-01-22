# Design System Compliance Report: apps/web

**Generated:** 2026-01-22T10:27:50.773Z

## Summary

| Metric | Value |
|--------|-------|
| Files Scanned | 76 |
| Total Violations | 1111 |
| Critical | 932 |
| Major | 76 |
| Minor | 103 |

## Violations by Type

| Type | Count |
|------|-------|
| hexColor | 888 |
| hardcodedSpacing | 108 |
| hardcodedLineHeight | 45 |
| hardcodedFontWeight | 44 |
| rgbaColor | 26 |

## Critical Violations (932)

> [!CAUTION]
> These violations should be fixed immediately.

### apps/web/public/themes/digilist-extensions.css

- **Line 81**: Hardcoded hex color - `#f5f6f8`
- **Line 83**: Hardcoded hex color - `#eceef2`
- **Line 86**: Hardcoded hex color - `#FFFFFF`
- **Line 87**: Hardcoded hex color - `#FFFFFF`
- **Line 131**: Hardcoded hex color - `#0c1a22`
- **Line 132**: Hardcoded hex color - `#102a35`
- **Line 133**: Hardcoded hex color - `#143a4a`
- **Line 134**: Hardcoded hex color - `#184a5d`
- **Line 135**: Hardcoded hex color - `#1c5a70`
- **Line 136**: Hardcoded hex color - `#216b83`
- ... and 267 more

### apps/web/public/themes/digilist.css

- **Line 94**: Hardcoded hex color - `#ffffff`
- **Line 95**: Hardcoded hex color - `#f0f4f8`
- **Line 96**: Hardcoded hex color - `#ffffff`
- **Line 97**: Hardcoded hex color - `#e2e9f1`
- **Line 98**: Hardcoded hex color - `#d0dbe9`
- **Line 99**: Hardcoded hex color - `#bcccdf`
- **Line 100**: Hardcoded hex color - `#a9bed6`
- **Line 101**: Hardcoded hex color - `#527bad`
- **Line 102**: Hardcoded hex color - `#315f97`
- **Line 103**: Hardcoded hex color - `#315f97`
- ... and 622 more

### apps/web/src/features/rental-object-details/components/PaymentSection.tsx

- **Line 29**: Hardcoded hex color - `#FF5B24`

### apps/web/src/features/rental-object-details/components/RentalObjectDetailsLayout.tsx

- **Line 85**: Hardcoded hex color - `#64748B`

### apps/web/src/features/rental-object-details/components/RulesTab.tsx

- **Line 107**: Hardcoded hex color - `#FEE2E2`
- **Line 108**: Hardcoded hex color - `#DC2626`
- **Line 113**: Hardcoded hex color - `#DBEAFE`
- **Line 114**: Hardcoded hex color - `#2563EB`
- **Line 119**: Hardcoded hex color - `#FEF3C7`
- **Line 120**: Hardcoded hex color - `#D97706`
- **Line 125**: Hardcoded hex color - `#F3E8FF`
- **Line 126**: Hardcoded hex color - `#9333EA`
- **Line 131**: Hardcoded hex color - `#DBEAFE`
- **Line 132**: Hardcoded hex color - `#2563EB`
- ... and 8 more

### apps/web/src/features/rental-object-details/components/Sidebar/components/BookingConfirmationStep.tsx

- **Line 340**: Hardcoded hex color - `#ff5b24`

### apps/web/vite.config.ts

- **Line 26**: Hardcoded hex color - `#ffffff`
- **Line 27**: Hardcoded hex color - `#ffffff`

## Major Violations (76)

### apps/web/public/themes/digilist-extensions.css

- **Line 600**: Hardcoded spacing: 992px - `width: 992px`
- **Line 624**: Hardcoded spacing: 599px - `width: 599px`
- **Line 684**: Hardcoded spacing: 992px - `top: 992px`
- **Line 801**: Hardcoded spacing: 1024px - `width: 1024px`
- **Line 822**: Hardcoded spacing: 1024px - `width: 1024px`
- ... and 5 more

### apps/web/src/App.tsx

- **Line 76**: Hardcoded spacing: 599px - `width: 599px`

### apps/web/src/features/rental-object-details/components/BookingDialog.tsx

- **Line 375**: Hardcoded spacing: 36px - `width: '36px`
- **Line 376**: Hardcoded spacing: 36px - `height: '36px`
- **Line 428**: Hardcoded spacing: 28px - `width: '28px`
- **Line 429**: Hardcoded spacing: 28px - `height: '28px`
- **Line 475**: Hardcoded spacing: 28px - `width: '28px`
- ... and 3 more

### apps/web/src/features/rental-object-details/components/OverviewTab.tsx

- **Line 324**: Hardcoded spacing: 48px - `width: '48px`
- **Line 325**: Hardcoded spacing: 48px - `height: '48px`
- **Line 412**: Hardcoded spacing: 24px - `width: '24px`
- **Line 413**: Hardcoded spacing: 24px - `height: '24px`

### apps/web/src/features/rental-object-details/components/RecurringPatternBuilder.tsx

- **Line 408**: Hardcoded spacing: 32px - `width: '32px`
- **Line 409**: Hardcoded spacing: 32px - `height: '32px`
- **Line 503**: Hardcoded spacing: 48px - `Width: '48px`

### apps/web/src/features/rental-object-details/components/RecurringPreviewTable.tsx

- **Line 382**: Hardcoded spacing: 28px - `width: '28px`
- **Line 383**: Hardcoded spacing: 28px - `height: '28px`

### apps/web/src/features/rental-object-details/components/RecurringResultSummary.tsx

- **Line 588**: Hardcoded spacing: 28px - `width: '28px`
- **Line 589**: Hardcoded spacing: 28px - `height: '28px`
- **Line 695**: Hardcoded spacing: 28px - `width: '28px`
- **Line 696**: Hardcoded spacing: 28px - `height: '28px`

### apps/web/src/features/rental-object-details/components/RulesTab.tsx

- **Line 261**: Hardcoded spacing: 44px - `width: '44px`
- **Line 262**: Hardcoded spacing: 44px - `height: '44px`

### apps/web/src/features/rental-object-details/components/Sidebar/BookingWidgetPlacement.tsx

- **Line 1223**: Hardcoded spacing: 32px - `width: '32px`
- **Line 1223**: Hardcoded spacing: 32px - `height: '32px`
- **Line 1241**: Hardcoded spacing: 32px - `width: '32px`
- **Line 1241**: Hardcoded spacing: 32px - `height: '32px`

### apps/web/src/features/rental-object-details/components/Sidebar/components/BookingAddOnsSelector.tsx

- **Line 394**: Hardcoded spacing: 28px - `width: '28px`
- **Line 395**: Hardcoded spacing: 28px - `height: '28px`
- **Line 422**: Hardcoded spacing: 28px - `width: '28px`
- **Line 423**: Hardcoded spacing: 28px - `height: '28px`

### apps/web/src/features/rental-object-details/components/Sidebar/components/BookingAvailabilityConflictDialog.tsx

- **Line 188**: Hardcoded spacing: 32px - `width: '32px`
- **Line 189**: Hardcoded spacing: 32px - `height: '32px`

### apps/web/src/features/rental-object-details/components/Sidebar/components/BookingConfirmationStep.tsx

- **Line 299**: Hardcoded spacing: 64px - `width: '64px`
- **Line 300**: Hardcoded spacing: 64px - `height: '64px`
- **Line 425**: Hardcoded spacing: 32px - `width: '32px`
- **Line 426**: Hardcoded spacing: 32px - `height: '32px`

### apps/web/src/features/rental-object-details/components/Sidebar/components/BookingContextSelector.tsx

- **Line 248**: Hardcoded spacing: 24px - `width: '24px`
- **Line 249**: Hardcoded spacing: 24px - `height: '24px`
- **Line 369**: Hardcoded spacing: 24px - `width: '24px`
- **Line 370**: Hardcoded spacing: 24px - `height: '24px`

### apps/web/src/features/rental-object-details/components/Sidebar/components/BookingSelectedSlotsSidebar.tsx

- **Line 159**: Hardcoded spacing: 24px - `width: '24px`
- **Line 160**: Hardcoded spacing: 24px - `height: '24px`

### apps/web/src/features/rental-object-details/components/Sidebar/components/BookingStepperHeader.tsx

- **Line 131**: Hardcoded spacing: 32px - `width: '32px`
- **Line 132**: Hardcoded spacing: 32px - `height: '32px`
- **Line 209**: Hardcoded spacing: 24px - `width: '24px`
- **Line 210**: Hardcoded spacing: 24px - `height: '24px`

### apps/web/src/features/rental-object-details/components/Sidebar/components/BookingVisibilitySelector.tsx

- **Line 195**: Hardcoded spacing: 18px - `width: '18px`
- **Line 196**: Hardcoded spacing: 18px - `height: '18px`

### apps/web/src/features/rental-object-details/components/Sidebar/components/ConflictResolver.tsx

- **Line 185**: Hardcoded spacing: 24px - `width: '24px`
- **Line 186**: Hardcoded spacing: 24px - `height: '24px`

### apps/web/src/features/rental-object-details/components/Sidebar/components/RecurringBuilder.tsx

- **Line 272**: Hardcoded spacing: 44px - `width: '44px`
- **Line 273**: Hardcoded spacing: 44px - `height: '44px`

### apps/web/src/features/rental-object-details/components/Sidebar/components/RecurringPreview.tsx

- **Line 385**: Hardcoded spacing: 18px - `width: '18px`
- **Line 386**: Hardcoded spacing: 18px - `height: '18px`
- **Line 397**: Hardcoded spacing: 28px - `width: '28px`
- **Line 398**: Hardcoded spacing: 28px - `height: '28px`

### apps/web/src/pages/PaymentCallbackPage.tsx

- **Line 105**: Hardcoded spacing: 64px - `width: '64px`
- **Line 106**: Hardcoded spacing: 64px - `height: '64px`
- **Line 173**: Hardcoded spacing: 64px - `width: '64px`
- **Line 174**: Hardcoded spacing: 64px - `height: '64px`
- **Line 266**: Hardcoded spacing: 64px - `width: '64px`
- ... and 1 more

### apps/web/src/pages/RentalObjectDetailPage.tsx

- **Line 495**: Hardcoded spacing: 599px - `width: 599px`

### apps/web/src/pages/RentalObjectsPage.tsx

- **Line 585**: Hardcoded spacing: 1024px - `width: 1024px`

