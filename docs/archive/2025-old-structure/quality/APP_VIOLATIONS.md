# App Thinness Violations Report

**Date:** 2026-01-19  
**Status:** AUDIT COMPLETE

## Summary
| Violation Type | Count | Priority |
|----------------|-------|----------|
| CSS Modules | 13 | P1 |
| Duplicate Layouts | 15 | P2 |
| Direct @digdir | 0 | ✅ Fixed |

## CSS Module Violations (13)

### saas-admin (3 files) - P1
- routes/plans/PlansListPage.module.css
- routes/tenants/TenantDetailPage.module.css
- routes/tenants/TenantsListPage.module.css

### docs-learning (10 files) - P2
- components/toc/DocsRightTOC.module.css
- components/layout/DocsSidebar.module.css
- components/layout/DocsHeader.module.css
- components/layout/DocsLayout.module.css
- routes/RoleGuidePage.module.css
- routes/DocsArticlePage.module.css
- routes/DocsSectionPage.module.css
- routes/DocsSearchPage.module.css
- routes/DocsHomePage.module.css
- routes/DocsReleasesPage.module.css

## Duplicate Layout Components (15)

### AppLayout.tsx (4 apps)
- minside, backoffice, saas-admin, monitoring

### Header.tsx (4 apps)  
- minside, backoffice, saas-admin, monitoring

### Sidebar.tsx (5 apps)
- minside, backoffice (BackofficeSidebar), saas-admin, monitoring, docs-learning (DocsSidebar)

## Recommendation
1. CSS modules already use DS tokens - LOW priority
2. Layout components have app-specific logic - THIN WRAPPERS are acceptable
3. Focus on SDK gaps and test coverage
