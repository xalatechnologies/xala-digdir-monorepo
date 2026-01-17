# @xala/ds Structure

This package follows the Xala SDK architecture pattern with a clear component hierarchy:

## Directory Structure

```
src/
├── primitives/     # Low-level building blocks
│   ├── container.tsx
│   ├── grid.tsx
│   ├── stack.tsx
│   └── index.ts
├── composed/       # Mid-level components
│   ├── content-layout.tsx
│   ├── content-section.tsx
│   ├── page-header.tsx
│   ├── GlobalSearch.tsx
│   ├── ProtectedRoute.tsx
│   └── index.ts
├── blocks/         # Business logic components
│   ├── gdpr/       # GDPR compliance components
│   │   ├── ConsentPopup.tsx
│   │   ├── ConsentSettings.tsx
│   │   ├── DataSubjectRequestForm.tsx
│   │   └── index.ts
│   ├── ErrorBoundary.tsx
│   └── index.ts
├── shells/         # Application-level layouts
│   ├── app-shell.tsx
│   ├── AppLayout.tsx
│   └── index.ts
├── utils.ts        # Utility functions
├── provider.tsx    # Theme provider
└── index.ts        # Main exports
```

## Component Hierarchy

### 1. Primitives (Low-level)
- **Container**: Wrapper with max-width, padding, and fluid options
- **Grid**: CSS Grid layout with gap and spacing controls
- **Stack**: Flexbox stack for vertical/horizontal layouts
- **All Digdir components**: Button, Input, Card, etc. (re-exported)

### 2. Composed (Mid-level)
Built from primitives:
- **ContentLayout**: Page layout with optional grid and header offset
- **ContentSection**: Section wrapper with title, subtitle, and spacing
- **PageHeader**: Page header with actions and breadcrumbs
- **GlobalSearch**: Global search with typeahead and recent searches
- **ProtectedRoute**: Unified route protection with auth, role, and capability checks

### 3. Blocks (Business logic)
Built from composed components:
- **GDPR Components** (`blocks/gdpr/`):
  - **ConsentPopup**: GDPR consent management popup dialog
  - **ConsentSettings**: GDPR consent management settings page
  - **DataSubjectRequestForm**: GDPR data subject request form
- **ErrorBoundary**: React error boundary with optional Sentry and audit logging
- StatsGrid, KPICard, DataCard
- FormBlock, ToolbarBlock
- EmptyState, etc.

### 4. Shells (Application level)
- **AppShell**: Complete application layout with header/footer
- **AppLayout**: Flexible application layout with sidebar + header + content structure

## Usage Example

```tsx
import { 
  AppShell,        // Shell
  ContentLayout,   // Composed
  ContentSection,  // Composed
  Grid,           // Primitive
  Container       // Primitive
} from '@xala/ds';

function MyApp() {
  return (
    <AppShell title="My App">
      <ContentLayout>
        <ContentSection title="Dashboard">
          <Grid columns="repeat(3, 1fr)" gap={24}>
            <Card>Content</Card>
          </Grid>
        </ContentSection>
      </ContentLayout>
    </AppShell>
  );
}
```

## Design Principles

1. **Clear separation**: Each layer has a specific responsibility
2. **Composable**: Higher-level components use lower-level ones
3. **Flexible**: All components accept className and style props
4. **TypeScript**: Full type safety with proper interfaces
5. **Forward refs**: All components support ref forwarding

## Component Migration Guide

### Migrated Components (2024)

The following components have been migrated from individual apps to `@xala/ds`:

#### Phase 1: Exact Duplicates
- **ConsentPopup** → `packages/ds/src/blocks/gdpr/ConsentPopup.tsx`
- **ConsentSettings** → `packages/ds/src/blocks/gdpr/ConsentSettings.tsx`
- **DataSubjectRequestForm** → `packages/ds/src/blocks/gdpr/DataSubjectRequestForm.tsx`

#### Phase 2: Near-Duplicates
- **GlobalSearch** → `packages/ds/src/composed/GlobalSearch.tsx`
- **ErrorBoundary** → `packages/ds/src/blocks/ErrorBoundary.tsx` (enhanced with optional Sentry/audit logging)

#### Phase 3: Pattern Unification
- **ProtectedRoute** → `packages/ds/src/composed/ProtectedRoute.tsx` (unified version supporting all app patterns)
- **AppLayout** → `packages/ds/src/shells/AppLayout.tsx` (flexible base layout)

### Usage

All migrated components are exported from `@xala/ds`:

```tsx
import {
  // GDPR Components
  ConsentPopup,
  ConsentSettings,
  DataSubjectRequestForm,
  // Composed Components
  GlobalSearch,
  ProtectedRoute,
  // Shells
  AppLayout,
  // Blocks
  ErrorBoundary,
} from '@xala/ds';
```

### Migration Notes

- **ProtectedRoute**: The unified version supports all app-specific patterns via props. Apps may need to adapt their usage to pass callbacks for capability checks, account context, etc.
- **ErrorBoundary**: Enhanced with optional `enableSentry` and `enableAuditLogging` props. Apps can enable these features as needed.
- **AppLayout**: Base layout component that accepts Sidebar and Header as props. Apps can customize as needed.

## Industry Standards

- **Max-width**: 1440px default (adjustable)
- **Padding**: 32px default (responsive)
- **Grid gaps**: 24px default
- **Section spacing**: 32px default
