# Design System Compliance Report: apps/saas-admin

**Generated:** 2026-01-19T11:37:59.401Z

## Summary

| Metric | Value |
|--------|-------|
| Files Scanned | 53 |
| Total Violations | 1005 |
| Critical | 913 |
| Major | 17 |
| Minor | 75 |

## Violations by Type

| Type | Count |
|------|-------|
| hexColor | 868 |
| hardcodedLineHeight | 45 |
| hardcodedFontWeight | 45 |
| rgbaColor | 25 |
| hardcodedSpacing | 20 |
| hardcodedZIndex | 1 |
| hardcodedBorderRadius | 1 |

## Critical Violations (913)

> [!CAUTION]
> These violations should be fixed immediately.

### apps/saas-admin/public/themes/digilist-extensions.css

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

### apps/saas-admin/public/themes/digilist.css

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

### apps/saas-admin/src/routes/ai-seed-generator/AISeedGenerator.module.css

- **Line 36**: Hardcoded font-weight - `font-weight: 500`

### apps/saas-admin/src/routes/branding/[tenantId].tsx

- **Line 46**: Hardcoded hex color - `#0067c5`
- **Line 47**: Hardcoded hex color - `#1e2b3c`
- **Line 48**: Hardcoded hex color - `#0090d4`

## Major Violations (17)

### apps/saas-admin/public/themes/digilist-extensions.css

- **Line 600**: Hardcoded spacing: 992px - `width: 992px`
- **Line 624**: Hardcoded spacing: 599px - `width: 599px`
- **Line 684**: Hardcoded spacing: 992px - `top: 992px`
- **Line 801**: Hardcoded spacing: 1024px - `width: 1024px`
- **Line 822**: Hardcoded spacing: 1024px - `width: 1024px`
- ... and 5 more

### apps/saas-admin/src/components/layout/AppLayout.module.css

- **Line 25**: Hardcoded spacing: 767px - `width: 767px`

### apps/saas-admin/src/components/layout/Header.module.css

- **Line 9**: Hardcoded z-index: 100 - `z-index: 100`

### apps/saas-admin/src/components/layout/Header.tsx

- **Line 77**: Hardcoded spacing: 32px - `height: '32px`
- **Line 111**: Hardcoded spacing: 32px - `width: '32px`
- **Line 112**: Hardcoded spacing: 32px - `height: '32px`

### apps/saas-admin/src/routes/ai-seed-generator/AISeedGenerator.module.css

- **Line 78**: Hardcoded border-radius - `border-radius: 3px`
- **Line 84**: Hardcoded spacing: 768px - `width: 768px`

