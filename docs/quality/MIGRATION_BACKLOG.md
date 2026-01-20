# Thin App Migration Backlog

**Date:** 2026-01-20  
**Status:** READY FOR PRIORITIZATION

---

## Phase 1: Critical Blockers (Week 1-2)

### P1.1: Eliminate Direct API Calls

| Task | App | Files | Effort | Acceptance Criteria |
|:-----|:----|:------|:------:|:--------------------|
| Create `usePermissions` SDK hook | backoffice | 1 | 2h | SDK hook for `/api/admin/permissions` CRUD |
| Migrate PermissionManagement | backoffice | 1 | 1h | Remove 3 fetch calls, use SDK hook |
| Create `useActivities` SDK hook | web | 1 | 2h | SDK hook for `/api/activities` |
| Migrate ActivityCalendar | web | 1 | 1h | Remove fetch, use SDK hook |
| Create `useGeocode` SDK hook | web | 1 | 1h | Geocoding via SDK |
| Create `useSeedData` SDK hook | saas-admin | 3 | 4h | SDK hooks for seed operations |
| Create `useAISeedGenerator` SDK hook | saas-admin | 2 | 3h | SDK hook for AI generation |
| Create `useScanners` SDK hook | saas-admin | 1 | 1h | SDK hook for scanner operations |

**Tests Required:**
- Unit tests for each new SDK hook
- Integration test for API endpoints

### P1.2: Remove Emojis (Replace with DS Icons)

| Task | App | Files | Effort | Acceptance Criteria |
|:-----|:----|:------|:------:|:--------------------|
| Replace emojis in docs-learning | docs-learning | 3 | 2h | Use `<Icon name="..." />` from DS |
| Replace emojis in web | web | 3 | 2h | Use `<Icon name="..." />` from DS |
| Replace emojis in backoffice | backoffice | 4 | 2h | Use `<Icon name="..." />` from DS |
| Replace emojis in minside | minside | 3 | 1h | Use `<Icon name="..." />` from DS |
| Replace emojis in monitoring | monitoring | 4 | 2h | Use `<Icon name="..." />` from DS |
| Replace emojis in saas-admin | saas-admin | 2 | 1h | Use `<Icon name="..." />` from DS |

**DS Changes Required:**
- Ensure icon registry has all needed icons
- Add missing icons: calendar, lock, card, gear, monitor, plug, person, building, search, folder, check, warning

---

## Phase 2: Styling Consolidation (Week 3-4)

### P2.1: Migrate docs-learning Styles

| Task | Files | Effort | Acceptance Criteria |
|:-----|:------|:------:|:--------------------|
| Remove extensions.css | 1 | 0.5h | Merge needed styles to root.css |
| Create DS DocsSidebar | 1 | 4h | Reusable docs sidebar shell |
| Create DS DocsHeader | 1 | 3h | Reusable docs header |
| Create DS DocsLayout | 1 | 4h | Complete docs layout shell |
| Create DS TOC component | 1 | 3h | Table of contents block |
| Migrate DocsHomePage | 1 | 2h | Remove inline styles, use DS blocks |
| Migrate DocsArticlePage | 1 | 2h | Remove inline styles, use DS blocks |
| Migrate DocsSectionPage | 1 | 2h | Remove inline styles, use DS blocks |
| Migrate DocsSearchPage | 1 | 2h | Remove inline styles, use DS blocks |
| Migrate DocsReleasesPage | 1 | 2h | Remove inline styles, use DS blocks |
| Migrate RoleGuidePage | 1 | 2h | Remove inline styles, use DS blocks |

**DS Changes Required:**
- Create `DocsShell` in `@xala/ds/shells`
- Create `TOC` block in `@xala/ds/blocks`

### P2.2: Create DS Layout Components

| Task | Target | Effort | Acceptance Criteria |
|:-----|:-------|:------:|:--------------------|
| Create `Stack` layout | DS | 2h | Flexbox column with gap support |
| Create `Flex` layout | DS | 2h | Flexbox row with gap/align support |
| Create `Grid` layout | DS | 2h | CSS Grid with responsive columns |
| Create `ContentLayout` primitive | DS | 2h | maxWidth + centered content |

---

## Phase 3: Component Consolidation (Week 5-6)

### P3.1: Migrate Backoffice Components

| Task | From | To | Effort | Acceptance Criteria |
|:-----|:-----|:---|:------:|:--------------------|
| Migrate BookingComponents | backoffice/components/bookings | DS blocks | 4h | Reusable booking blocks |
| Migrate DashboardWidgets | backoffice/components/dashboard | DS blocks | 4h | Dashboard widget blocks |
| Migrate IntegrationComponents | backoffice/components/integrations | DS blocks | 4h | Integration management blocks |
| Migrate OrganizationComponents | backoffice/components/organizations | DS blocks | 4h | Organization management blocks |
| Migrate SeasonComponents | backoffice/components/seasons | DS blocks | 4h | Season management blocks |
| Migrate UserComponents | backoffice/components/users | DS blocks | 4h | User management blocks |
| Migrate SharedComponents | backoffice/components/shared | DS primitives | 2h | Common primitives |
| DELETE gdpr components | backoffice/components/gdpr | - | 0.5h | Already in DS |
| Migrate Layout to DS shells | backoffice/components/layout | DS shells | 4h | Backoffice shell |

### P3.2: Migrate MinSide Components

| Task | From | To | Effort | Acceptance Criteria |
|:-----|:-----|:---|:------:|:--------------------|
| Migrate NotificationComponents | minside/components/notifications | DS blocks | 3h | Notification blocks |
| Migrate Layout to DS shells | minside/components/layout | DS shells | 3h | MinSide shell |
| Keep GDPR wrappers | minside/components/gdpr | - | 0h | Already thin wrappers |

### P3.3: Remove Duplicate Components

| Task | Source | Action | Effort |
|:-----|:-------|:-------|:------:|
| DELETE monitoring/gdpr | monitoring | Delete (duplicate of minside) | 0.5h |
| DELETE monitoring/notifications | monitoring | Delete (duplicate of minside) | 0.5h |
| Consolidate layouts | monitoring | Use shared DS shell | 2h |

---

## Phase 4: CI Gates & Hardening (Week 7-8)

### P4.1: Add CI Lint Rules

| Rule | Check | Exit Code |
|:-----|:------|:---------:|
| No components in apps | `find apps -path "*/components/*.tsx" \| grep -v index.ts` | 1 |
| No CSS modules | `find apps -name "*.module.css"` | 1 |
| No fetch in apps | `grep -r "fetch(" apps/*/src --include="*.tsx"` | 1 |
| No axios | `grep -r "axios" apps/*/src --include="*.ts"` | 1 |
| No inline styles | `grep -r "style={{" apps/*/src --include="*.tsx"` | 1 (after Phase 2) |
| No emojis | Unicode range grep | 1 |

### P4.2: Add ESLint Plugin

```javascript
// eslint-plugin-thin-app/rules/no-components-in-apps.js
module.exports = {
  create(context) {
    return {
      ExportNamedDeclaration(node) {
        const filename = context.getFilename();
        if (filename.includes('/apps/') && 
            filename.includes('/components/') &&
            !filename.endsWith('index.ts')) {
          context.report({
            node,
            message: 'Components must be in @xala/ds, not in apps'
          });
        }
      }
    };
  }
};
```

### P4.3: GitHub Workflow

```yaml
name: thin-app-check
on: [push, pull_request]
jobs:
  thin-app-compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check for app components
        run: |
          if find apps -path "*/components/*.tsx" | grep -v index.ts | head -1; then
            echo "::error::Found components in apps. Move to @xala/ds"
            exit 1
          fi
      
      - name: Check for CSS modules
        run: |
          if find apps -name "*.module.css" | head -1; then
            echo "::error::CSS modules not allowed in apps"
            exit 1
          fi
      
      - name: Check for direct fetch
        run: |
          if grep -r "fetch(" apps/*/src --include="*.tsx" | grep -v test | head -1; then
            echo "::warning::Direct fetch calls found - migrate to SDK"
          fi
      
      - name: Check for emojis
        run: |
          if grep -rP '[\x{1F300}-\x{1F9FF}]' apps/*/src --include="*.tsx" | head -1; then
            echo "::error::Emojis not allowed - use DS icons"
            exit 1
          fi
```

---

## Summary Timeline

| Week | Phase | Focus | Deliverables |
|:----:|:------|:------|:-------------|
| 1-2 | P1 | Critical Blockers | SDK hooks, emoji removal |
| 3-4 | P2 | Styling | DS layouts, docs migration |
| 5-6 | P3 | Components | Backoffice/MinSide consolidation |
| 7-8 | P4 | CI Gates | ESLint rules, GitHub workflow |

---

*Updated: 2026-01-20*
