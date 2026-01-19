# Design System Component Gaps and Plan

> Last Updated: 2026-01-19

This document identifies gaps in the design system and provides a prioritized plan for implementation.

---

## Executive Summary

The `@xala/ds` design system is **mature and comprehensive**. Most baseline components already exist. The primary gaps are:

1. **Missing exports** - Some components exist but aren't exported from main index
2. **Naming inconsistencies** - Some similar patterns have different names
3. **Documentation gaps** - Some components lack proper documentation
4. **Minor feature gaps** - A few utility components could be added

---

## Baseline Component Checklist

### A) Page + Layout

| Component | Status | Notes |
|-----------|--------|-------|
| `AppShell` / `AppLayout` | ✅ Ready | Full app layout |
| `PageHeader` | ✅ Ready | Title, subtitle, breadcrumbs, actions |
| `ContentSection` | ✅ Ready | Section wrapper with title |
| `Card` | ✅ Ready | Container card (from Digdir) |
| `DataPageToolbar` | ✅ Ready | Filters/actions row |
| `Tabs` | ✅ Ready | From Digdir + StatusTabs |

### B) Data Display & States

| Component | Status | Notes |
|-----------|--------|-------|
| `InfoList` / `DefinitionList` | ⚠️ Missing | Need simple key-value display |
| `Badge` / `Tag` | ✅ Ready | Full status badge system |
| `Avatar` / `UserChip` | ⚠️ Missing | Need avatar component |
| `EmptyState` | ✅ Ready | Icon, title, description, action |
| `Skeleton` | ✅ Ready | From Digdir |
| `LoadingScreen` | ✅ Ready | Full-screen loader |
| `ErrorScreen` | ✅ Ready | Error state display |
| `StatusPill` | ✅ Ready | StatusTag + domain badges |

### C) Tables

| Component | Status | Notes |
|-----------|--------|-------|
| `DataTable` | ✅ Ready | Sorting, pagination, loading, empty |
| `TableFilter` | ✅ Ready | Search + filters |
| `StatusTabs` | ✅ Ready | Quick status filters |
| `BulkActionsBar` | ✅ Ready | Bulk selection actions |
| `FilterChips` | ✅ Ready | Active filter display |
| `data-testid` support | ⚠️ Partial | Need to audit coverage |

### D) Forms

| Component | Status | Notes |
|-----------|--------|-------|
| `FormField` | ✅ Ready | Field wrapper |
| `Textfield` / `Textarea` | ✅ Ready | From Digdir |
| `Select` / `Combobox` | ✅ Ready | From Digdir |
| `DatePicker` / `TimePicker` | ⚠️ Missing | Need custom implementation |
| `Wizard` | ✅ Ready | Multi-step form |
| `FormActions` | ✅ Ready | Submit/cancel bar |
| Validation styles | ✅ Ready | Error states in Digdir |

### E) Overlays

| Component | Status | Notes |
|-----------|--------|-------|
| `Dialog` | ✅ Ready | From Digdir |
| `Drawer` | ✅ Ready | Full drawer system |
| `ConfirmDialog` | ✅ Ready | Destructive action confirm |
| `AlertDialog` | ✅ Ready | Alert modal |
| `Toast/Notification` | ⚠️ Partial | Have NotificationBell, need toast |

### F) Navigation

| Component | Status | Notes |
|-----------|--------|-------|
| `Navigation` | ✅ Ready | Main navigation |
| `MobileNav` | ✅ Ready | Mobile drawer |
| `BottomNavigation` | ✅ Ready | Mobile bottom bar |
| `Breadcrumb` | ✅ Ready | Breadcrumb trail |
| `AppHeader` | ✅ Ready | Top bar with search |
| `RoleAwareNav` | ✅ Ready | PermissionGate handles this |

### G) Domain Components

| Component | Status | Notes |
|-----------|--------|-------|
| `BookingStatusBadge` | ✅ Ready | Full badge system |
| `ApprovalDecisionPanel` | ⚠️ Missing | Approval UI pattern |
| `DateRangePill` | ⚠️ Missing | Date range display |
| `Money` formatter | ⚠️ Missing | Currency formatting |

---

## Gap Analysis & Implementation Plan

### P0 - Critical (Implement ASAP)

| Gap | Description | Effort | Used By |
|-----|-------------|--------|---------|
| No gaps at P0 | All critical components exist | - | - |

### P1 - High Priority (Implement Soon)

| Gap | Description | Effort | Recommendation |
|-----|-------------|--------|----------------|
| `InfoList` | Simple key-value list display | 2h | Create `InfoList` with `InfoItem` |
| `Avatar` | User avatar with fallback | 3h | Create `Avatar` with initials fallback |
| `DateRangePill` | Display date ranges compactly | 2h | Create as primitives/DateRange |
| `Toast` | Toast notifications | 4h | Create toast system with context |

### P2 - Medium Priority

| Gap | Description | Effort | Recommendation |
|-----|-------------|--------|----------------|
| `DatePicker` | Date input with calendar | 6h | Consider react-day-picker wrapper |
| `TimePicker` | Time input | 4h | Native time input wrapper |
| `Money` | Currency formatter | 2h | Create formatting component |
| `ApprovalDecisionPanel` | Approve/reject UI | 4h | Compose from existing components |
| `data-testid` audit | Ensure all components have testids | 4h | Audit and add missing |

### P3 - Low Priority

| Gap | Description | Effort | Recommendation |
|-----|-------------|--------|----------------|
| `ColorPicker` | Color selection | 6h | Only if needed |
| `FileUpload` | File upload with preview | 8h | Only if needed |
| `RichTextEditor` | WYSIWYG editor | 12h | Consider external library |

---

## Implementation Details

### InfoList Component (P1)

```tsx
// packages/ds/src/primitives/InfoList.tsx

interface InfoItemProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

interface InfoListProps {
  items: InfoItemProps[];
  columns?: 1 | 2 | 3;
  variant?: 'default' | 'compact' | 'card';
}

export function InfoList({ items, columns = 1, variant = 'default' }) {
  return (
    <dl className={`info-list info-list--${variant} info-list--cols-${columns}`}>
      {items.map((item, index) => (
        <div key={index} className="info-list__item">
          <dt className="info-list__label">{item.label}</dt>
          <dd className="info-list__value">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
```

### Avatar Component (P1)

```tsx
// packages/ds/src/primitives/Avatar.tsx

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'rounded';
}

export function Avatar({ src, name, size = 'md', variant = 'circle' }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  if (src) {
    return <img src={src} alt={name} className={`avatar avatar--${size}`} />;
  }

  return (
    <div className={`avatar avatar--${size} avatar--${variant}`}>
      {initials}
    </div>
  );
}
```

### Toast System (P1)

```tsx
// packages/ds/src/composed/Toast.tsx

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Implementation...
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
```

---

## Export Audit

The following components exist in DS but aren't exported from the main `index.ts`:

| Component | Location | Action |
|-----------|----------|--------|
| `FormSection` | `composed/FormSection.tsx` | Add to exports |
| `FormActions` | `composed/FormActions.tsx` | Add to exports |
| `InfoBox` | `composed/InfoBox.tsx` | Add to exports |
| `LoadingFallback` | `composed/LoadingFallback.tsx` | Add to exports |
| `SkipLinks` | `composed/SkipLinks.tsx` | Add to exports |
| `HeatmapChart` | `blocks/HeatmapChart.tsx` | Add to exports |
| `NotificationCenter` | `blocks/NotificationCenter.tsx` | Add to exports |
| `NotificationItem` | `blocks/NotificationItem.tsx` | Add to exports |
| `PushNotificationPrompt` | `blocks/PushNotificationPrompt.tsx` | Add to exports |
| `AccessibilityDashboard` | `blocks/AccessibilityDashboard.tsx` | Add to exports |

---

## Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Week 1 | 2 days | Export missing components, fix naming |
| Week 1 | 3 days | Implement P1 gaps (InfoList, Avatar, Toast) |
| Week 2 | 3 days | Replace app duplicates with DS imports |
| Week 2 | 2 days | Add data-testid coverage |
| Week 3+ | Ongoing | P2 gaps as needed |

---

## Success Metrics

- [ ] All baseline components exist in DS
- [ ] 0 duplicate components across apps
- [ ] 100% of pages use DS components for layout
- [ ] 100% of tables use DataTable
- [ ] 100% of headers use PageHeader
- [ ] All forms use DS form components
- [ ] All components have data-testid support
