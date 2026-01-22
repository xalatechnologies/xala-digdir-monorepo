# Design System Compliance Report: apps/dashboard

**Generated:** 2026-01-22T10:27:50.697Z

## Summary

| Metric | Value |
|--------|-------|
| Files Scanned | 67 |
| Total Violations | 1092 |
| Critical | 909 |
| Major | 94 |
| Minor | 89 |

## Violations by Type

| Type | Count |
|------|-------|
| hexColor | 865 |
| hardcodedSpacing | 113 |
| hardcodedLineHeight | 45 |
| hardcodedFontWeight | 44 |
| rgbaColor | 25 |

## Critical Violations (909)

> [!CAUTION]
> These violations should be fixed immediately.

### apps/dashboard/public/themes/digilist-extensions.css

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

### apps/dashboard/public/themes/digilist.css

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

## Major Violations (94)

### apps/dashboard/public/themes/digilist-extensions.css

- **Line 600**: Hardcoded spacing: 992px - `width: 992px`
- **Line 624**: Hardcoded spacing: 599px - `width: 599px`
- **Line 684**: Hardcoded spacing: 992px - `top: 992px`
- **Line 801**: Hardcoded spacing: 1024px - `width: 1024px`
- **Line 822**: Hardcoded spacing: 1024px - `width: 1024px`
- ... and 5 more

### apps/dashboard/src/components/layout/Header.tsx

- **Line 129**: Hardcoded spacing: 32px - `height: '32px`

### apps/dashboard/src/components/layout/Sidebar.tsx

- **Line 211**: Hardcoded spacing: 44px - `width: '44px`
- **Line 212**: Hardcoded spacing: 44px - `height: '44px`

### apps/dashboard/src/features/seasons/components/ApplicationCard.tsx

- **Line 146**: Hardcoded spacing: 32px - `width: '32px`
- **Line 147**: Hardcoded spacing: 32px - `height: '32px`
- **Line 173**: Hardcoded spacing: 32px - `width: '32px`
- **Line 174**: Hardcoded spacing: 32px - `height: '32px`
- **Line 201**: Hardcoded spacing: 32px - `width: '32px`
- ... and 1 more

### apps/dashboard/src/routes/billing.tsx

- **Line 179**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 239**: Hardcoded spacing: 44px - `Height: '44px`

### apps/dashboard/src/routes/bookings.tsx

- **Line 156**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 314**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 324**: Hardcoded spacing: 44px - `Height: '44px`

### apps/dashboard/src/routes/calendar.tsx

- **Line 166**: Hardcoded spacing: 48px - `height: '48px`

### apps/dashboard/src/routes/favorites.tsx

- **Line 154**: Hardcoded spacing: 32px - `width: '32px`
- **Line 154**: Hardcoded spacing: 32px - `height: '32px`
- **Line 319**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 319**: Hardcoded spacing: 44px - `Width: '44px`

### apps/dashboard/src/routes/help.tsx

- **Line 234**: Hardcoded spacing: 44px - `Height: '44px`

### apps/dashboard/src/routes/messages.tsx

- **Line 191**: Hardcoded spacing: 32px - `width: '32px`
- **Line 192**: Hardcoded spacing: 32px - `height: '32px`
- **Line 307**: Hardcoded spacing: 56px - `width: '56px`
- **Line 308**: Hardcoded spacing: 56px - `height: '56px`
- **Line 351**: Hardcoded spacing: 48px - `width: '48px`
- ... and 12 more

### apps/dashboard/src/routes/org/bookings.tsx

- **Line 90**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 99**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 108**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 117**: Hardcoded spacing: 44px - `Height: '44px`

### apps/dashboard/src/routes/org/dashboard.tsx

- **Line 130**: Hardcoded spacing: 48px - `width: '48px`
- **Line 131**: Hardcoded spacing: 48px - `height: '48px`
- **Line 156**: Hardcoded spacing: 48px - `width: '48px`
- **Line 157**: Hardcoded spacing: 48px - `height: '48px`
- **Line 182**: Hardcoded spacing: 48px - `width: '48px`
- ... and 1 more

### apps/dashboard/src/routes/org/invoices.tsx

- **Line 109**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 156**: Hardcoded spacing: 44px - `Height: '44px`

### apps/dashboard/src/routes/org/members.tsx

- **Line 162**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 240**: Hardcoded spacing: 44px - `width: '44px`
- **Line 241**: Hardcoded spacing: 44px - `height: '44px`
- **Line 278**: Hardcoded spacing: 44px - `Height: '44px`

### apps/dashboard/src/routes/org/season-rental.tsx

- **Line 217**: Hardcoded spacing: 24px - `width: '24px`
- **Line 218**: Hardcoded spacing: 24px - `height: '24px`
- **Line 349**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 439**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 450**: Hardcoded spacing: 44px - `Height: '44px`
- ... and 1 more

### apps/dashboard/src/routes/preferences.tsx

- **Line 163**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 211**: Hardcoded spacing: 44px - `Height: '44px`

### apps/dashboard/src/routes/privacy.tsx

- **Line 186**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 324**: Hardcoded spacing: 44px - `Height: '44px`

### apps/dashboard/src/routes/season-applications.tsx

- **Line 178**: Hardcoded spacing: 56px - `width: '56px`
- **Line 179**: Hardcoded spacing: 56px - `height: '56px`
- **Line 210**: Hardcoded spacing: 56px - `width: '56px`
- **Line 211**: Hardcoded spacing: 56px - `height: '56px`
- **Line 242**: Hardcoded spacing: 56px - `width: '56px`
- ... and 3 more

### apps/dashboard/src/routes/season-detail.tsx

- **Line 290**: Hardcoded spacing: 48px - `width: '48px`
- **Line 291**: Hardcoded spacing: 48px - `height: '48px`
- **Line 319**: Hardcoded spacing: 48px - `width: '48px`
- **Line 320**: Hardcoded spacing: 48px - `height: '48px`
- **Line 349**: Hardcoded spacing: 48px - `width: '48px`
- ... and 2 more

### apps/dashboard/src/routes/seasons.tsx

- **Line 145**: Hardcoded spacing: 56px - `width: '56px`
- **Line 146**: Hardcoded spacing: 56px - `height: '56px`
- **Line 183**: Hardcoded spacing: 56px - `width: '56px`
- **Line 184**: Hardcoded spacing: 56px - `height: '56px`
- **Line 221**: Hardcoded spacing: 56px - `width: '56px`
- ... and 1 more

