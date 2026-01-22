# Design System Compliance Audit - Master Summary

**Generated:** 2026-01-22T10:27:50.830Z

## Overview

| Target | Files | Violations | Critical | Major | Minor |
|--------|-------|------------|----------|-------|-------|
| [apps/api](apps-api-compliance-report.md) | 222 | 2 | 2 | 0 | 0 |
| [apps/backoffice](apps-backoffice-compliance-report.md) | 210 | 1187 | 943 | 118 | 126 |
| [apps/dashboard](apps-dashboard-compliance-report.md) | 67 | 1092 | 909 | 94 | 89 |
| [apps/docs-learning](apps-docs-learning-compliance-report.md) | 26 | 990 | 909 | 10 | 71 |
| [apps/monitoring](apps-monitoring-compliance-report.md) | 70 | 1125 | 911 | 122 | 92 |
| [apps/web](apps-web-compliance-report.md) | 76 | 1111 | 932 | 76 | 103 |
| [packages/client-sdk](packages-client-sdk-compliance-report.md) | 217 | 0 | 0 | 0 | 0 |
| **TOTAL** | **888** | **5507** | **4606** | **420** | **481** |

## Priority Actions

> [!CAUTION]
> 4606 critical violations require immediate attention.

> [!WARNING]
> 420 major violations should be addressed soon.

## Remediation Guide

### Color Violations
Replace hardcoded colors with design tokens:
- `#ffffff` → `var(--ds-color-neutral-background-default)`
- `#000000` → `var(--ds-color-neutral-text-default)`

### Spacing Violations
Replace hardcoded spacing with tokens:
- `8px` → `var(--ds-spacing-2)`
- `16px` → `var(--ds-spacing-4)`
- `24px` → `var(--ds-spacing-6)`

### Typography Violations
Replace hardcoded typography with tokens:
- `14px` → `var(--ds-font-size-sm)`
- `16px` → `var(--ds-font-size-md)`
- `font-weight: 600` → `var(--ds-font-weight-semibold)`
