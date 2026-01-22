# Design System Compliance Report: apps/monitoring

**Generated:** 2026-01-22T10:27:50.737Z

## Summary

| Metric | Value |
|--------|-------|
| Files Scanned | 70 |
| Total Violations | 1125 |
| Critical | 911 |
| Major | 122 |
| Minor | 92 |

## Violations by Type

| Type | Count |
|------|-------|
| hexColor | 867 |
| hardcodedSpacing | 144 |
| hardcodedLineHeight | 45 |
| hardcodedFontWeight | 44 |
| rgbaColor | 25 |

## Critical Violations (911)

> [!CAUTION]
> These violations should be fixed immediately.

### apps/monitoring/public/themes/digilist-extensions.css

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

### apps/monitoring/public/themes/digilist.css

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

### apps/monitoring/vite.config.ts

- **Line 21**: Hardcoded hex color - `#ffffff`
- **Line 22**: Hardcoded hex color - `#ffffff`

## Major Violations (122)

### apps/monitoring/public/themes/digilist-extensions.css

- **Line 600**: Hardcoded spacing: 992px - `width: 992px`
- **Line 624**: Hardcoded spacing: 599px - `width: 599px`
- **Line 684**: Hardcoded spacing: 992px - `top: 992px`
- **Line 801**: Hardcoded spacing: 1024px - `width: 1024px`
- **Line 822**: Hardcoded spacing: 1024px - `width: 1024px`
- ... and 5 more

### apps/monitoring/src/components/layout/Header.tsx

- **Line 198**: Hardcoded spacing: 72px - `height: '72px`
- **Line 210**: Hardcoded spacing: 32px - `height: '32px`
- **Line 260**: Hardcoded spacing: 32px - `width: '32px`
- **Line 261**: Hardcoded spacing: 32px - `height: '32px`
- **Line 360**: Hardcoded spacing: 28px - `height: '28px`

### apps/monitoring/src/components/layout/Sidebar.tsx

- **Line 96**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 113**: Hardcoded spacing: 48px - `width: '48px`
- **Line 114**: Hardcoded spacing: 48px - `height: '48px`
- **Line 163**: Hardcoded spacing: 32px - `Width: '32px`
- **Line 164**: Hardcoded spacing: 32px - `height: '32px`
- ... and 5 more

### apps/monitoring/src/features/seasons/components/ApplicationCard.tsx

- **Line 148**: Hardcoded spacing: 32px - `width: '32px`
- **Line 149**: Hardcoded spacing: 32px - `height: '32px`
- **Line 175**: Hardcoded spacing: 32px - `width: '32px`
- **Line 176**: Hardcoded spacing: 32px - `height: '32px`
- **Line 203**: Hardcoded spacing: 32px - `width: '32px`
- ... and 1 more

### apps/monitoring/src/routes/billing.tsx

- **Line 181**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 241**: Hardcoded spacing: 44px - `Height: '44px`

### apps/monitoring/src/routes/bookings.tsx

- **Line 179**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 281**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 294**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 307**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 320**: Hardcoded spacing: 44px - `Height: '44px`
- ... and 2 more

### apps/monitoring/src/routes/calendar.tsx

- **Line 165**: Hardcoded spacing: 48px - `height: '48px`

### apps/monitoring/src/routes/dashboard.tsx

- **Line 302**: Hardcoded spacing: 48px - `width: '48px`
- **Line 303**: Hardcoded spacing: 48px - `height: '48px`
- **Line 329**: Hardcoded spacing: 48px - `width: '48px`
- **Line 330**: Hardcoded spacing: 48px - `height: '48px`
- **Line 356**: Hardcoded spacing: 48px - `width: '48px`
- ... and 3 more

### apps/monitoring/src/routes/favorites.tsx

- **Line 169**: Hardcoded spacing: 32px - `width: '32px`
- **Line 169**: Hardcoded spacing: 32px - `height: '32px`
- **Line 334**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 334**: Hardcoded spacing: 44px - `Width: '44px`

### apps/monitoring/src/routes/help.tsx

- **Line 237**: Hardcoded spacing: 44px - `Height: '44px`

### apps/monitoring/src/routes/messages.tsx

- **Line 191**: Hardcoded spacing: 32px - `width: '32px`
- **Line 192**: Hardcoded spacing: 32px - `height: '32px`
- **Line 307**: Hardcoded spacing: 56px - `width: '56px`
- **Line 308**: Hardcoded spacing: 56px - `height: '56px`
- **Line 351**: Hardcoded spacing: 48px - `width: '48px`
- ... and 12 more

### apps/monitoring/src/routes/notifications.tsx

- **Line 156**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 159**: Hardcoded spacing: 44px - `Height: '44px`

### apps/monitoring/src/routes/org/activity.tsx

- **Line 151**: Hardcoded spacing: 44px - `Height: '44px`

### apps/monitoring/src/routes/org/bookings.tsx

- **Line 103**: Hardcoded spacing: 44px - `Height: '44px`

### apps/monitoring/src/routes/org/dashboard.tsx

- **Line 141**: Hardcoded spacing: 48px - `width: '48px`
- **Line 142**: Hardcoded spacing: 48px - `height: '48px`
- **Line 167**: Hardcoded spacing: 48px - `width: '48px`
- **Line 168**: Hardcoded spacing: 48px - `height: '48px`
- **Line 193**: Hardcoded spacing: 48px - `width: '48px`
- ... and 1 more

### apps/monitoring/src/routes/org/invoices.tsx

- **Line 107**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 154**: Hardcoded spacing: 44px - `Height: '44px`

### apps/monitoring/src/routes/org/members.tsx

- **Line 171**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 249**: Hardcoded spacing: 44px - `width: '44px`
- **Line 250**: Hardcoded spacing: 44px - `height: '44px`
- **Line 287**: Hardcoded spacing: 44px - `Height: '44px`

### apps/monitoring/src/routes/org/notifications.tsx

- **Line 309**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 319**: Hardcoded spacing: 44px - `Height: '44px`

### apps/monitoring/src/routes/org/season-rental.tsx

- **Line 184**: Hardcoded spacing: 24px - `width: '24px`
- **Line 185**: Hardcoded spacing: 24px - `height: '24px`
- **Line 299**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 384**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 395**: Hardcoded spacing: 44px - `Height: '44px`
- ... and 1 more

### apps/monitoring/src/routes/org/settings.tsx

- **Line 90**: Hardcoded spacing: 44px - `Height: '44px`

### apps/monitoring/src/routes/preferences.tsx

- **Line 103**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 174**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 222**: Hardcoded spacing: 44px - `Height: '44px`

### apps/monitoring/src/routes/privacy.tsx

- **Line 186**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 324**: Hardcoded spacing: 44px - `Height: '44px`

### apps/monitoring/src/routes/season-applications.tsx

- **Line 172**: Hardcoded spacing: 56px - `width: '56px`
- **Line 173**: Hardcoded spacing: 56px - `height: '56px`
- **Line 204**: Hardcoded spacing: 56px - `width: '56px`
- **Line 205**: Hardcoded spacing: 56px - `height: '56px`
- **Line 236**: Hardcoded spacing: 56px - `width: '56px`
- ... and 3 more

### apps/monitoring/src/routes/season-detail.tsx

- **Line 290**: Hardcoded spacing: 48px - `width: '48px`
- **Line 291**: Hardcoded spacing: 48px - `height: '48px`
- **Line 319**: Hardcoded spacing: 48px - `width: '48px`
- **Line 320**: Hardcoded spacing: 48px - `height: '48px`
- **Line 349**: Hardcoded spacing: 48px - `width: '48px`
- ... and 2 more

### apps/monitoring/src/routes/seasons.tsx

- **Line 148**: Hardcoded spacing: 56px - `width: '56px`
- **Line 149**: Hardcoded spacing: 56px - `height: '56px`
- **Line 186**: Hardcoded spacing: 56px - `width: '56px`
- **Line 187**: Hardcoded spacing: 56px - `height: '56px`
- **Line 224**: Hardcoded spacing: 56px - `width: '56px`
- ... and 1 more

