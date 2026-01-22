# MinSide UI Patterns

> Last Updated: 2026-01-19

This document defines the canonical UI patterns for the MinSide citizen dashboard, ensuring consistency with the `@xala/ds` design system.

---

## Layout Pattern

### DashboardLayout (AppLayout)

The shell for all MinSide pages using existing `AppLayout` structure:
- **Desktop**: Sidebar (360px) + Header (72px) + Content
- **Mobile**: Header + Content + BottomNavigation (64px)

**Source**: `apps/minside/src/components/layout/AppLayout.tsx`

**Migration Target**: Consider adopting `@xala/ds` shells if available.

---

## PageHeader Pattern

Every page MUST use a consistent header with:
- Title (H1)
- Subtitle/description (optional)
- Breadcrumbs (for nested pages)
- Actions slot (primary CTA on right)

**DS Component**: [`PageHeader`](file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/packages/ds/src/composed/page-header.tsx)

```tsx
<PageHeader
  title={t('minside.myBookings')}
  subtitle={t('minside.myBookingsDesc')}
  actions={<Button variant="primary">{t('minside.bookNow')}</Button>}
/>
```

---

## ListToolbar Pattern

For all list pages with search/filter capabilities:

| Slot | Component | Purpose |
|------|-----------|---------|
| Search | `SearchInput` (debounced) | Filter by text |
| Filters | `Button` group or `FilterBar` | Status/type filters |
| Sort | `SortSelect` | Ordering |
| View Mode | `ViewModeToggle` | Grid/List/Map |
| Primary Action | Slot | Create/Add button |

**DS Component**: [`FilterBar`](file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/packages/ds/src/composed/filter-bar.tsx) or new `ListToolbar`

---

## DataTable Pattern

All tabular data displays:

| Feature | DS Support |
|---------|------------|
| Sortable columns | Yes |
| Keyboard navigation | Yes |
| Loading skeleton | Yes |
| Empty state | Yes |
| Responsive (hide columns) | Yes |
| Row click handler | Yes |

**DS Component**: [`DataTable`](file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/packages/ds/src/composed/DataTable.tsx)

---

## DashboardItem Pattern (Card/Row)

Widget for dashboard summaries:

**DS Components**:
- [`StatCard`](file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/packages/ds/src/blocks/DashboardComponents.tsx) — KPI display
- [`ActivityItem`](file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/packages/ds/src/blocks/DashboardComponents.tsx) — Activity feed
- [`QuickActionCard`](file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/packages/ds/src/blocks/DashboardComponents.tsx) — Quick actions

---

## Empty/Loading/Error Patterns

### Empty State

**DS Component**: [`EmptyState`](file:///Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/packages/ds/src/composed/data-page/EmptyState.tsx)

```tsx
<EmptyState
  icon={<CalendarIcon size={48} />}
  title={t('minside.noUpcomingBookings')}
  description={t('minside.noUpcomingBookingsDesc')}
  action={{ label: t('minside.bookNow'), onClick: handleBook }}
/>
```

### Loading State

Use `<Skeleton>` components or `DataTable` built-in loading.

### Error State

Map RFC7807 error responses to user-friendly messages using `EmptyState` with `variant="warning"`.

---

## Non-Negotiable Rules

1. **No raw HTML in pages** — Compose only from DS components
2. **No inline styles** — Use design tokens only
3. **No custom CSS** — Use DS primitives or extend tokens centrally
4. **No emojis** — Use SVG icons from `@xala/ds`
5. **All strings via i18n** — Use `useT()` hook
6. **All data via SDK hooks** — No direct fetch calls
