# Design System Compliance Report: apps/backoffice

**Generated:** 2026-01-22T10:27:50.671Z

## Summary

| Metric | Value |
|--------|-------|
| Files Scanned | 210 |
| Total Violations | 1187 |
| Critical | 943 |
| Major | 118 |
| Minor | 126 |

## Violations by Type

| Type | Count |
|------|-------|
| hexColor | 899 |
| hardcodedSpacing | 172 |
| hardcodedLineHeight | 45 |
| hardcodedFontWeight | 44 |
| rgbaColor | 27 |

## Critical Violations (943)

> [!CAUTION]
> These violations should be fixed immediately.

### apps/backoffice/public/themes/digilist-extensions.css

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

### apps/backoffice/public/themes/digilist.css

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

### apps/backoffice/src/components/organizations/BrandingStep.tsx

- **Line 318**: Hardcoded hex color - `#0062BA`
- **Line 330**: Hardcoded hex color - `#0062BA`
- **Line 352**: Hardcoded hex color - `#004C93`
- **Line 364**: Hardcoded hex color - `#004C93`

### apps/backoffice/src/components/organizations/OrganizationWizard.tsx

- **Line 85**: Hardcoded hex color - `#0062BA`
- **Line 86**: Hardcoded hex color - `#004C93`

### apps/backoffice/src/features/settings/hooks/useBrandingSettings.ts

- **Line 42**: Hardcoded hex color - `#1A56DB`
- **Line 43**: Hardcoded hex color - `#6B7280`
- **Line 52**: Hardcoded hex color - `#1A56DB`
- **Line 53**: Hardcoded hex color - `#6B7280`
- **Line 77**: Hardcoded hex color - `#1A56DB`
- **Line 78**: Hardcoded hex color - `#6B7280`
- **Line 119**: Hardcoded hex color - `#1A56DB`
- **Line 120**: Hardcoded hex color - `#6B7280`

### apps/backoffice/src/routes/allocation-planner.tsx

- **Line 32**: Hardcoded hex color - `#2563eb`
- **Line 33**: Hardcoded hex color - `#2563eb`
- **Line 34**: Hardcoded hex color - `#16a34a`
- **Line 35**: Hardcoded hex color - `#16a34a`
- **Line 36**: Hardcoded hex color - `#2563eb`
- **Line 37**: Hardcoded hex color - `#2563eb`

### apps/backoffice/src/routes/settings.tsx

- **Line 92**: Hardcoded hex color - `#1A56DB`
- **Line 93**: Hardcoded hex color - `#6B7280`
- **Line 1270**: Hardcoded hex color - `#1A56DB`
- **Line 1283**: Hardcoded hex color - `#6B7280`

### apps/backoffice/src/routes/tenant/branding.tsx

- **Line 27**: Hardcoded hex color - `#2563eb`
- **Line 27**: Hardcoded hex color - `#3b82f6`
- **Line 28**: Hardcoded hex color - `#16a34a`
- **Line 28**: Hardcoded hex color - `#22c55e`
- **Line 29**: Hardcoded hex color - `#7c3aed`
- **Line 29**: Hardcoded hex color - `#8b5cf6`
- **Line 30**: Hardcoded hex color - `#ea580c`
- **Line 30**: Hardcoded hex color - `#f97316`
- **Line 45**: Hardcoded hex color - `#2563eb`
- **Line 46**: Hardcoded hex color - `#3b82f6`

## Major Violations (118)

### apps/backoffice/public/themes/digilist-extensions.css

- **Line 600**: Hardcoded spacing: 992px - `width: 992px`
- **Line 624**: Hardcoded spacing: 599px - `width: 599px`
- **Line 684**: Hardcoded spacing: 992px - `top: 992px`
- **Line 801**: Hardcoded spacing: 1024px - `width: 1024px`
- **Line 822**: Hardcoded spacing: 1024px - `width: 1024px`
- ... and 5 more

### apps/backoffice/src/components/RefundDialog.tsx

- **Line 247**: Hardcoded spacing: 44px - `width: '44px`
- **Line 248**: Hardcoded spacing: 44px - `height: '44px`

### apps/backoffice/src/components/RoleSelector.tsx

- **Line 75**: Hardcoded spacing: 88px - `Height: '88px`
- **Line 81**: Hardcoded spacing: 48px - `width: '48px`
- **Line 82**: Hardcoded spacing: 48px - `height: '48px`

### apps/backoffice/src/components/RoleSwitcher.tsx

- **Line 149**: Hardcoded spacing: 24px - `width: '24px`
- **Line 150**: Hardcoded spacing: 24px - `height: '24px`
- **Line 240**: Hardcoded spacing: 32px - `width: '32px`
- **Line 241**: Hardcoded spacing: 32px - `height: '32px`

### apps/backoffice/src/components/layout/Sidebar.tsx

- **Line 90**: Hardcoded spacing: 48px - `width: '48px`
- **Line 91**: Hardcoded spacing: 48px - `height: '48px`
- **Line 140**: Hardcoded spacing: 32px - `Width: '32px`
- **Line 141**: Hardcoded spacing: 32px - `height: '32px`
- **Line 482**: Hardcoded spacing: 72px - `height: '72px`
- ... and 2 more

### apps/backoffice/src/components/organizations/BrandingStep.tsx

- **Line 458**: Hardcoded spacing: 32px - `width: '32px`
- **Line 458**: Hardcoded spacing: 32px - `height: '32px`

### apps/backoffice/src/components/organizations/OrganizationWizard.tsx

- **Line 316**: Hardcoded spacing: 48px - `width: '48px`
- **Line 317**: Hardcoded spacing: 48px - `height: '48px`
- **Line 387**: Hardcoded spacing: 24px - `Top: '24px`

### apps/backoffice/src/features/rental-objects/components/RentalObjectsListView.tsx

- **Line 221**: Hardcoded spacing: 18px - `width: '18px`
- **Line 222**: Hardcoded spacing: 18px - `height: '18px`
- **Line 251**: Hardcoded spacing: 18px - `width: '18px`
- **Line 252**: Hardcoded spacing: 18px - `height: '18px`
- **Line 281**: Hardcoded spacing: 18px - `width: '18px`
- ... and 3 more

### apps/backoffice/src/features/rental-objects/components/list/BulkActionsBar.tsx

- **Line 60**: Hardcoded spacing: 32px - `height: '32px`
- **Line 88**: Hardcoded spacing: 32px - `height: '32px`

### apps/backoffice/src/features/rental-objects/components/list/RentalObjectsTable.tsx

- **Line 253**: Hardcoded spacing: 768px - `width: 768px`

### apps/backoffice/src/features/rental-objects/components/wizard/EnhancedWizardStepper.tsx

- **Line 93**: Hardcoded spacing: 24px - `width: '24px`
- **Line 94**: Hardcoded spacing: 24px - `height: '24px`

### apps/backoffice/src/features/rental-objects/components/wizard/WizardStepper.tsx

- **Line 70**: Hardcoded spacing: 32px - `width: '32px`
- **Line 71**: Hardcoded spacing: 32px - `height: '32px`

### apps/backoffice/src/features/rental-objects/components/wizard/steps/CloneSelectionStep.tsx

- **Line 78**: Hardcoded spacing: 48px - `width: '48px`
- **Line 79**: Hardcoded spacing: 48px - `height: '48px`
- **Line 115**: Hardcoded spacing: 48px - `width: '48px`
- **Line 116**: Hardcoded spacing: 48px - `height: '48px`

### apps/backoffice/src/features/reviews/components/ReviewModerationTable.tsx

- **Line 370**: Hardcoded spacing: 48px - `width: '48px`

### apps/backoffice/src/features/settings/hooks/useBrandingSettings.ts

- **Line 164**: Hardcoded spacing: 32px - `width: '32px`
- **Line 165**: Hardcoded spacing: 32px - `height: '32px`

### apps/backoffice/src/routes/admin-reports.tsx

- **Line 101**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 104**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 139**: Hardcoded spacing: 44px - `Height: '44px`

### apps/backoffice/src/routes/allocation-planner.tsx

- **Line 90**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 232**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 235**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 238**: Hardcoded spacing: 44px - `Height: '44px`

### apps/backoffice/src/routes/audit-timeline.tsx

- **Line 134**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 178**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 210**: Hardcoded spacing: 24px - `width: '24px`

### apps/backoffice/src/routes/bookings.tsx

- **Line 498**: Hardcoded spacing: 18px - `width: '18px`
- **Line 499**: Hardcoded spacing: 18px - `height: '18px`
- **Line 568**: Hardcoded spacing: 18px - `width: '18px`
- **Line 569**: Hardcoded spacing: 18px - `height: '18px`
- **Line 835**: Hardcoded spacing: 48px - `width: '48px`

### apps/backoffice/src/routes/calendar.tsx

- **Line 353**: Hardcoded spacing: 48px - `height: '48px`
- **Line 501**: Hardcoded spacing: 48px - `height: '48px`

### apps/backoffice/src/routes/decision-forms.tsx

- **Line 258**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 267**: Hardcoded spacing: 44px - `Height: '44px`

### apps/backoffice/src/routes/gdpr/index.tsx

- **Line 130**: Hardcoded spacing: 48px - `padding: '48px`
- **Line 153**: Hardcoded spacing: 48px - `padding: '48px`

### apps/backoffice/src/routes/messages.tsx

- **Line 340**: Hardcoded spacing: 56px - `width: '56px`
- **Line 341**: Hardcoded spacing: 56px - `height: '56px`
- **Line 384**: Hardcoded spacing: 44px - `width: '44px`
- **Line 385**: Hardcoded spacing: 44px - `height: '44px`
- **Line 479**: Hardcoded spacing: 44px - `width: '44px`
- ... and 7 more

### apps/backoffice/src/routes/reports.tsx

- **Line 529**: Hardcoded spacing: 32px - `height: '32px`
- **Line 548**: Hardcoded spacing: 32px - `height: '32px`
- **Line 586**: Hardcoded spacing: 24px - `width: '24px`
- **Line 860**: Hardcoded spacing: 28px - `width: '28px`
- **Line 861**: Hardcoded spacing: 28px - `height: '28px`

### apps/backoffice/src/routes/requests.tsx

- **Line 215**: Hardcoded spacing: 48px - `width: '48px`
- **Line 216**: Hardcoded spacing: 48px - `height: '48px`
- **Line 251**: Hardcoded spacing: 48px - `width: '48px`
- **Line 252**: Hardcoded spacing: 48px - `height: '48px`
- **Line 287**: Hardcoded spacing: 48px - `width: '48px`
- ... and 1 more

### apps/backoffice/src/routes/season-applications.tsx

- **Line 193**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 327**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 330**: Hardcoded spacing: 44px - `Height: '44px`

### apps/backoffice/src/routes/tenant/audit-log.tsx

- **Line 145**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 209**: Hardcoded spacing: 44px - `Height: '44px`

### apps/backoffice/src/routes/tenant/branding.tsx

- **Line 101**: Hardcoded spacing: 44px - `Height: '44px`

### apps/backoffice/src/routes/tenant/settings.tsx

- **Line 94**: Hardcoded spacing: 44px - `Height: '44px`

### apps/backoffice/src/routes/training/admin-training.tsx

- **Line 193**: Hardcoded spacing: 48px - `width: '48px`
- **Line 194**: Hardcoded spacing: 48px - `height: '48px`

### apps/backoffice/src/routes/training/domain-guides.tsx

- **Line 215**: Hardcoded spacing: 56px - `width: '56px`
- **Line 216**: Hardcoded spacing: 56px - `height: '56px`
- **Line 303**: Hardcoded spacing: 48px - `width: '48px`
- **Line 304**: Hardcoded spacing: 48px - `height: '48px`

### apps/backoffice/src/routes/training/index.tsx

- **Line 111**: Hardcoded spacing: 64px - `width: '64px`
- **Line 112**: Hardcoded spacing: 64px - `height: '64px`
- **Line 177**: Hardcoded spacing: 48px - `width: '48px`
- **Line 178**: Hardcoded spacing: 48px - `height: '48px`

### apps/backoffice/src/routes/users-management.tsx

- **Line 174**: Hardcoded spacing: 44px - `Height: '44px`
- **Line 229**: Hardcoded spacing: 36px - `width: '36px`
- **Line 230**: Hardcoded spacing: 36px - `height: '36px`

### apps/backoffice/src/routes/work-queue.tsx

- **Line 206**: Hardcoded spacing: 44px - `Height: '44px`

