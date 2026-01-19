# Design System Compliance Audit - Master Summary

**Generated:** 2026-01-19T11:37:59.538Z

## Overview

| Target | Files | Violations | Critical | Major | Minor |
|--------|-------|------------|----------|-------|-------|
| [apps/api](apps-api-compliance-report.md) | 314 | 11 | 11 | 0 | 0 |
| [apps/backoffice](apps-backoffice-compliance-report.md) | 207 | 1186 | 951 | 113 | 122 |
| [apps/docs-learning](apps-docs-learning-compliance-report.md) | 37 | 993 | 909 | 13 | 71 |
| [apps/minside](apps-minside-compliance-report.md) | 76 | 1153 | 909 | 152 | 92 |
| [apps/monitoring](apps-monitoring-compliance-report.md) | 78 | 1153 | 911 | 150 | 92 |
| [apps/saas-admin](apps-saas-admin-compliance-report.md) | 53 | 1005 | 913 | 17 | 75 |
| [apps/web](apps-web-compliance-report.md) | 79 | 1117 | 932 | 80 | 105 |
| [packages/ds](packages-ds-compliance-report.md) | 140 | 205 | 39 | 110 | 56 |
| [packages/ds-registry](packages-ds-registry-compliance-report.md) | 20 | 28 | 0 | 14 | 14 |
| [packages/auth](packages-auth-compliance-report.md) | 19 | 0 | 0 | 0 | 0 |
| [packages/i18n](packages-i18n-compliance-report.md) | 18 | 0 | 0 | 0 | 0 |
| [packages/client-sdk](packages-client-sdk-compliance-report.md) | 191 | 0 | 0 | 0 | 0 |
| **TOTAL** | **1232** | **6851** | **5575** | **649** | **627** |

## Priority Actions

> [!CAUTION]
> 5575 critical violations require immediate attention.

> [!WARNING]
> 649 major violations should be addressed soon.

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
