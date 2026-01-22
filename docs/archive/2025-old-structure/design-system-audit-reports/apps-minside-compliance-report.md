# Design System Compliance Report: apps/minside

**Generated:** 2026-01-19T11:37:59.309Z

## Summary

| Metric | Value |
|--------|-------|
| Files Scanned | 76 |
| Total Violations | 1153 |
| Critical | 909 |
| Major | 152 |
| Minor | 92 |

## Violations by Type

| Type | Count |
|------|-------|
| hexColor | 865 |
| hardcodedSpacing | 174 |
| hardcodedLineHeight | 45 |
| hardcodedFontWeight | 44 |
| rgbaColor | 25 |

## Critical Violations (909)

> [!CAUTION]
> These violations should be fixed immediately.

### apps/minside/public/themes/digilist-extensions.css

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

### apps/minside/public/themes/digilist.css

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

## Major Violations (152)

### apps/minside/public/themes/digilist-extensions.css

- **Line 600**: Hardcoded spacing: 992px - `width: 992px`
- **Line 624**: Hardcoded spacing: 599px - `width: 599px`
- **Line 684**: Hardcoded spacing: 992px - `top: 992px`
- **Line 801**: Hardcoded spacing: 1024px - `width: 1024px`
- **Line 822**: Hardcoded spacing: 1024px - `width: 1024px`
- ... and 5 more

### apps/minside/src/components/AccountSelectionModal.tsx

- **Line 223**: Hardcoded spacing: 64px - `width: '64px`
- **Line 224**: Hardcoded spacing: 64px - `height: '64px`
- **Line 289**: Hardcoded spacing: 64px - `width: '64px`
- **Line 290**: Hardcoded spacing: 64px - `height: '64px`
- **Line 376**: Hardcoded spacing: 24px - `width: '24px`
- ... and 1 more

### apps/minside/src/components/AccountSelector.tsx

- **Line 102**: Hardcoded spacing: 88px - `Height: '88px`
- **Line 108**: Hardcoded spacing: 48px - `width: '48px`
- **Line 109**: Hardcoded spacing: 48px - `height: '48px`

### apps/minside/src/components/AccountSwitcher.tsx

- **Line 135**: Hardcoded spacing: 24px - `width: '24px`
- **Line 136**: Hardcoded spacing: 24px - `height: '24px`
- **Line 218**: Hardcoded spacing: 32px - `width: '32px`
- **Line 219**: Hardcoded spacing: 32px - `height: '32px`
- **Line 309**: Hardcoded spacing: 32px - `width: '32px`
- ... and 3 more

### apps/minside/src/components/gdpr/ConsentManager.tsx

- **Line 130**: Hardcoded spacing: 44px - `Height: '44px`

### apps/minside/src/components/gdpr/DataExportCard.tsx

- **Line 105**: Hardcoded spacing: 44px - `Height: '44px`

### apps/minside/src/components/gdpr/DeleteAccountCard.tsx

- **Line 132**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 166**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 179**: Hardcoded spacing: 44px - `Height: '44px`

### apps/minside/src/components/layout/Header.tsx

- **Line 198**: Hardcoded spacing: 72px - `height: '72px`
- **Line 210**: Hardcoded spacing: 32px - `height: '32px`
- **Line 260**: Hardcoded spacing: 32px - `width: '32px`
- **Line 261**: Hardcoded spacing: 32px - `height: '32px`
- **Line 360**: Hardcoded spacing: 28px - `height: '28px`

### apps/minside/src/components/layout/Sidebar.tsx

- **Line 80**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 97**: Hardcoded spacing: 48px - `width: '48px`
- **Line 98**: Hardcoded spacing: 48px - `height: '48px`
- **Line 147**: Hardcoded spacing: 32px - `Width: '32px`
- **Line 148**: Hardcoded spacing: 32px - `height: '32px`
- ... and 5 more

### apps/minside/src/features/seasons/components/ApplicationCard.tsx

- **Line 148**: Hardcoded spacing: 32px - `width: '32px`
- **Line 149**: Hardcoded spacing: 32px - `height: '32px`
- **Line 175**: Hardcoded spacing: 32px - `width: '32px`
- **Line 176**: Hardcoded spacing: 32px - `height: '32px`
- **Line 203**: Hardcoded spacing: 32px - `width: '32px`
- ... and 1 more

### apps/minside/src/features/seasons/components/SeasonCard.tsx

- **Line 125**: Hardcoded spacing: 32px - `width: '32px`
- **Line 126**: Hardcoded spacing: 32px - `height: '32px`
- **Line 152**: Hardcoded spacing: 32px - `width: '32px`
- **Line 153**: Hardcoded spacing: 32px - `height: '32px`
- **Line 180**: Hardcoded spacing: 32px - `width: '32px`
- ... and 1 more

### apps/minside/src/routes/billing.tsx

- **Line 181**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 241**: Hardcoded spacing: 44px - `Height: '44px`

### apps/minside/src/routes/bookings.tsx

- **Line 187**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 289**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 302**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 315**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 328**: Hardcoded spacing: 44px - `Height: '44px`
- ... and 2 more

### apps/minside/src/routes/calendar.tsx

- **Line 165**: Hardcoded spacing: 48px - `height: '48px`

### apps/minside/src/routes/dashboard.tsx

- **Line 302**: Hardcoded spacing: 48px - `width: '48px`
- **Line 303**: Hardcoded spacing: 48px - `height: '48px`
- **Line 329**: Hardcoded spacing: 48px - `width: '48px`
- **Line 330**: Hardcoded spacing: 48px - `height: '48px`
- **Line 356**: Hardcoded spacing: 48px - `width: '48px`
- ... and 3 more

### apps/minside/src/routes/favorites.tsx

- **Line 169**: Hardcoded spacing: 32px - `width: '32px`
- **Line 169**: Hardcoded spacing: 32px - `height: '32px`
- **Line 334**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 334**: Hardcoded spacing: 44px - `Width: '44px`

### apps/minside/src/routes/help.tsx

- **Line 233**: Hardcoded spacing: 44px - `Height: '44px`

### apps/minside/src/routes/messages.tsx

- **Line 191**: Hardcoded spacing: 32px - `width: '32px`
- **Line 192**: Hardcoded spacing: 32px - `height: '32px`
- **Line 307**: Hardcoded spacing: 56px - `width: '56px`
- **Line 308**: Hardcoded spacing: 56px - `height: '56px`
- **Line 351**: Hardcoded spacing: 48px - `width: '48px`
- ... and 12 more

### apps/minside/src/routes/notifications.tsx

- **Line 139**: Hardcoded spacing: 44px - `Height: '44px`

### apps/minside/src/routes/org/activity.tsx

- **Line 175**: Hardcoded spacing: 44px - `Height: '44px`

### apps/minside/src/routes/org/bookings.tsx

- **Line 90**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 99**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 108**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 117**: Hardcoded spacing: 44px - `Height: '44px`

### apps/minside/src/routes/org/dashboard.tsx

- **Line 141**: Hardcoded spacing: 48px - `width: '48px`
- **Line 142**: Hardcoded spacing: 48px - `height: '48px`
- **Line 167**: Hardcoded spacing: 48px - `width: '48px`
- **Line 168**: Hardcoded spacing: 48px - `height: '48px`
- **Line 193**: Hardcoded spacing: 48px - `width: '48px`
- ... and 1 more

### apps/minside/src/routes/org/invoices.tsx

- **Line 107**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 154**: Hardcoded spacing: 44px - `Height: '44px`

### apps/minside/src/routes/org/members.tsx

- **Line 171**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 249**: Hardcoded spacing: 44px - `width: '44px`
- **Line 250**: Hardcoded spacing: 44px - `height: '44px`
- **Line 287**: Hardcoded spacing: 44px - `Height: '44px`

### apps/minside/src/routes/org/notifications.tsx

- **Line 309**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 319**: Hardcoded spacing: 44px - `Height: '44px`

### apps/minside/src/routes/org/season-rental.tsx

- **Line 220**: Hardcoded spacing: 24px - `width: '24px`
- **Line 221**: Hardcoded spacing: 24px - `height: '24px`
- **Line 352**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 442**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 453**: Hardcoded spacing: 44px - `Height: '44px`
- ... and 1 more

### apps/minside/src/routes/org/settings.tsx

- **Line 90**: Hardcoded spacing: 44px - `Height: '44px`

### apps/minside/src/routes/preferences.tsx

- **Line 103**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 174**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 222**: Hardcoded spacing: 44px - `Height: '44px`

### apps/minside/src/routes/privacy.tsx

- **Line 186**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 324**: Hardcoded spacing: 44px - `Height: '44px`

### apps/minside/src/routes/season-applications.tsx

- **Line 173**: Hardcoded spacing: 56px - `width: '56px`
- **Line 174**: Hardcoded spacing: 56px - `height: '56px`
- **Line 205**: Hardcoded spacing: 56px - `width: '56px`
- **Line 206**: Hardcoded spacing: 56px - `height: '56px`
- **Line 237**: Hardcoded spacing: 56px - `width: '56px`
- ... and 3 more

### apps/minside/src/routes/season-detail.tsx

- **Line 290**: Hardcoded spacing: 48px - `width: '48px`
- **Line 291**: Hardcoded spacing: 48px - `height: '48px`
- **Line 319**: Hardcoded spacing: 48px - `width: '48px`
- **Line 320**: Hardcoded spacing: 48px - `height: '48px`
- **Line 349**: Hardcoded spacing: 48px - `width: '48px`
- ... and 2 more

### apps/minside/src/routes/seasons.tsx

- **Line 149**: Hardcoded spacing: 56px - `width: '56px`
- **Line 150**: Hardcoded spacing: 56px - `height: '56px`
- **Line 187**: Hardcoded spacing: 56px - `width: '56px`
- **Line 188**: Hardcoded spacing: 56px - `height: '56px`
- **Line 225**: Hardcoded spacing: 56px - `width: '56px`
- ... and 1 more

