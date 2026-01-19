# Thin App Policy

**Version:** 1.0  
**Effective Date:** 2026-01-19  
**Status:** MANDATORY

---

## Overview

Apps in the Digilist monorepo must be **thin wrappers** that only:

1. **Define routes** - Page routing configuration
2. **Compose wrappers** - Components that wire SDK data to DS blocks
3. **Provide context** - App-level providers (auth, theme, etc.)

Apps must **NOT** contain:
- Reusable UI components
- Business logic
- Styling (CSS files)
- Data fetching logic (use SDK)
- Custom layout implementations

---

## Allowed App Structure

```
apps/{appname}/src/
├── main.tsx                  # Entry point
├── App.tsx                   # Root component with providers
├── root.css                  # ONLY allowed CSS (imports DS styles)
├── vite-env.d.ts
│
├── routes/                   # Page components (wrappers)
│   ├── index.tsx             # Root route
│   ├── dashboard.tsx         # Dashboard page wrapper
│   ├── bookings.tsx          # Bookings page wrapper
│   └── settings.tsx          # Settings page wrapper
│
├── providers/                # App-level providers only
│   ├── index.ts
│   └── AuthProvider.tsx      # If app-specific auth needed
│
├── hooks/                    # UI-only hooks (no business logic)
│   ├── useNavigation.ts      # App navigation state
│   └── useMobileDetect.ts    # Viewport detection
│
└── lib/                      # App configuration
    └── sentry.ts             # Monitoring setup
```

---

## Forbidden Patterns

### 1. Reusable Components in Apps

```tsx
// ❌ FORBIDDEN - Component defined in app
// apps/backoffice/src/components/Header.tsx
export function Header({ title }: HeaderProps) {
  return <div className="header">{title}</div>;
}

// ✅ CORRECT - Import from DS
import { DashboardHeader } from '@xala/ds';
```

### 2. CSS Files in Apps

```
// ❌ FORBIDDEN
apps/saas-admin/src/components/layout/Header.module.css
apps/backoffice/src/routes/dashboard.module.css

// ✅ ALLOWED (only these)
apps/*/src/root.css           # DS style imports only
apps/*/public/themes/*.css    # Theme files
```

### 3. Business Logic in Apps

```tsx
// ❌ FORBIDDEN - Business logic in app
// apps/backoffice/src/hooks/useBookingFilters.ts
export function useBookingFilters() {
  const [filters, setFilters] = useState({});
  // Complex filtering logic...
  return { filters, setFilters, applyFilters };
}

// ✅ CORRECT - Use SDK hook
import { useBookings, useBookingFilters } from '@digilist/client-sdk';
```

### 4. Inline Layout Styles

```tsx
// ❌ FORBIDDEN
<div style={{ display: 'flex', gap: '16px', padding: '20px' }}>

// ✅ CORRECT - Use DS components
<Stack direction="row" gap={4} padding={5}>
```

### 5. Direct API Calls

```tsx
// ❌ FORBIDDEN
const response = await fetch('/api/bookings');

// ✅ CORRECT - Use SDK
const { data } = useBookings();
```

---

## Wrapper Component Pattern

### Purpose
Wrappers connect SDK data to DS blocks. They contain **ZERO business logic**.

### Structure
```tsx
// apps/backoffice/src/routes/bookings.tsx

import { useT } from '@xala/i18n';
import { ListPageShell, DataTable, EmptyState } from '@xala/ds';
import { useBookings } from '@digilist/client-sdk';

export function BookingsPage() {
  const t = useT();
  
  // 1. Call SDK hooks (data fetching)
  const { data, isLoading, error } = useBookings();
  
  // 2. Pure mapping: SDK DTO → DS block props
  const columns = [
    { key: 'id', header: t('bookings.columns.id') },
    { key: 'status', header: t('bookings.columns.status') },
  ];
  
  // 3. Event handlers call SDK mutations
  const handleRowClick = (booking: Booking) => {
    navigate(`/bookings/${booking.id}`);
  };
  
  // 4. Render DS blocks only
  return (
    <ListPageShell
      title={t('bookings.title')}
      isLoading={isLoading}
      error={error}
    >
      <DataTable
        data={data ?? []}
        columns={columns}
        onRowClick={handleRowClick}
        emptyState={<EmptyState title={t('bookings.empty')} />}
      />
    </ListPageShell>
  );
}
```

### Wrapper Rules

1. **No Layout Markup**
   - No `<div>`, `<section>`, `<main>`, etc.
   - Only DS components/blocks

2. **No Styling**
   - No `style={}` props
   - No `className={}` props (except data-testid)

3. **No Business Rules**
   - No `if (status === 'pending' && user.role === 'admin')` 
   - This logic belongs in SDK or API

4. **No Data Transformation**
   - No complex `map()`, `filter()`, `reduce()`
   - Simple mapping only (DTO field → component prop)

5. **No Permission Checks**
   - Permissions come from server via SDK
   - Use `<PermissionGate>` from DS if needed

---

## App-Allowed Hooks

### Allowed (UI State Only)
```typescript
// Navigation state
function useNavigation() {
  const location = useLocation();
  return { currentPath: location.pathname };
}

// Mobile detection
function useMobileDetect() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    // viewport resize listener
  }, []);
  return isMobile;
}

// Local UI state
function useDrawerState() {
  const [isOpen, setIsOpen] = useState(false);
  return { isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) };
}
```

### Forbidden (Business Logic)
```typescript
// ❌ These belong in SDK
useBookingFilters()     // → SDK
usePermissions()        // → SDK
useCalendarState()      // → SDK
useSearchResults()      // → SDK
```

---

## Migration Guide

### Step 1: Identify Violations
Run this grep to find app components:
```bash
# Find components that should be in DS
grep -r "export function" apps/*/src/components/

# Find CSS files
find apps -name "*.module.css"

# Find business logic hooks
grep -r "useState\|useEffect" apps/*/src/hooks/
```

### Step 2: Move to DS or SDK
| Current Location | Target |
|-----------------|--------|
| `apps/*/components/*.tsx` | `packages/ds/src/blocks/` |
| `apps/*/hooks/use*Data.ts` | `packages/client-sdk/src/hooks/` |
| `apps/*/hooks/use*UI.ts` | Keep in app (or move to DS) |
| `apps/*/*.module.css` | Delete, use DS tokens |

### Step 3: Update Imports
```tsx
// BEFORE
import { Header } from '../components/layout/Header';
import { useBookingFilters } from '../hooks/useBookingFilters';

// AFTER
import { DashboardHeader } from '@xala/ds';
import { useBookingFilters } from '@digilist/client-sdk';
```

### Step 4: Delete App-Local Files
Once migrated, delete:
- `apps/*/src/components/` (all subdirectories)
- `apps/*/src/*.module.css`
- `apps/*/src/hooks/` (business logic hooks only)

---

## Enforcement

### Folder Structure Validation
```javascript
// eslint-plugin-custom/thin-app-rule.js
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

### CI Pipeline Checks
```yaml
# .github/workflows/thin-app-check.yml
- name: Check for app components
  run: |
    if find apps -path "*/components/*.tsx" | grep -v index.ts; then
      echo "Error: Found components in apps. Move to @xala/ds"
      exit 1
    fi

- name: Check for CSS modules
  run: |
    if find apps -name "*.module.css"; then
      echo "Error: CSS modules not allowed in apps"
      exit 1
    fi
```

---

## Exceptions

### Allowed Exceptions (Require Approval)
1. `root.css` - Theme imports only
2. `vite-env.d.ts` - TypeScript environment
3. App-specific page layouts (if DS shell doesn't fit)

### How to Request Exception
1. Create issue with justification
2. DS Governor review
3. If approved, add to `.thin-app-exceptions.json`

---

*This policy is enforced automatically. Violations block PR merge.*
