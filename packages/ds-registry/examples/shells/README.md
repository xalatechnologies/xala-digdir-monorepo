# Shells Component Examples

This directory contains practical examples demonstrating how to use shells components from the Xala Design System.

## What are Shells Components?

Shells components are application-level layout components that provide the complete structural foundation for your application. They combine header, footer, and main content areas into a cohesive, full-page layout.

**Key characteristics:**
- Provide full-page application structure
- Handle header, footer, and main content areas
- Manage viewport height and scrolling behavior
- Support fluid and fixed-width layouts
- Work seamlessly with composed and primitive components
- Follow design system tokens and guidelines

## Available Shells Components

The Xala Design System includes shells components for complete application layouts:

### Application Shells
- **AppShell** - Main application shell with header, footer, and content areas
- **Shell** - Generic shell component for custom layouts (if available)

## Usage Examples

Examples provided in this directory:

### 1. AppShell (`app-shell.tsx`)
Demonstrates complete application layout with header, footer, customization options, and various use cases including:
- Basic shell setup
- Header and footer integration
- Fluid vs fixed-width layouts
- Custom backgrounds and dimensions
- Dashboard layouts

## Best Practices

### 1. Import from @xala/ds
Always import shells components through the design system facade:

```typescript
// ✅ CORRECT
import { AppShell } from '@xala/ds';

// ❌ WRONG - Never import directly from @digdir/*
import { AppShell } from '@digdir/designsystemet-react';
```

### 2. Use as Top-Level Container
Place AppShell at the root of your application:

```typescript
import { DesignsystemetProvider, AppShell } from '@xala/ds';

function App() {
  return (
    <DesignsystemetProvider theme="digdir" colorScheme="auto" size="md">
      <AppShell header={<AppHeader />} footer={<AppFooter />}>
        {/* Your application routes and content */}
      </AppShell>
    </DesignsystemetProvider>
  );
}
```

### 3. Combine with ContentLayout
Use ContentLayout inside AppShell for proper content width management:

```typescript
import { AppShell, ContentLayout, PageHeader } from '@xala/ds';

function Dashboard() {
  return (
    <AppShell header={<MyHeader />}>
      <ContentLayout headerOffset="md" maxWidth="1440px">
        <PageHeader title="Dashboard" />
        {/* Your content */}
      </ContentLayout>
    </AppShell>
  );
}
```

### 4. Design Token Usage
Always use design tokens for styling:

```typescript
// ✅ CORRECT - Use design tokens
<AppShell
  background="var(--ds-color-neutral-background-default)"
  header={header}
/>

// ❌ WRONG - Don't use hardcoded colors
<AppShell
  background="#f5f5f5"
  header={header}
/>
```

### 5. Semantic HTML Structure
AppShell automatically provides semantic HTML:

```typescript
// AppShell renders:
<div>
  <header>{/* Your header */}</header>
  <main>{/* Your content */}</main>
  <footer>{/* Your footer */}</footer>
</div>
```

## Common Patterns

### Standard Application Layout

```typescript
import { AppShell, ContentLayout } from '@xala/ds';

function App() {
  const header = (
    <div style={{
      padding: '16px 24px',
      borderBottom: '1px solid var(--ds-color-neutral-border-default)',
      background: 'var(--ds-color-neutral-background-subtle)'
    }}>
      <h1>My Application</h1>
    </div>
  );

  const footer = (
    <div style={{
      padding: '24px',
      textAlign: 'center',
      borderTop: '1px solid var(--ds-color-neutral-border-default)'
    }}>
      <p>© 2024 My Company</p>
    </div>
  );

  return (
    <AppShell header={header} footer={footer}>
      <ContentLayout>
        {/* Your content */}
      </ContentLayout>
    </AppShell>
  );
}
```

### Dashboard with Navigation

```typescript
import { AppShell, ContentLayout, Button } from '@xala/ds';

function DashboardApp() {
  const header = (
    <div style={{
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid var(--ds-color-neutral-border-default)'
    }}>
      <h1>Dashboard</h1>
      <nav style={{ display: 'flex', gap: '16px' }}>
        <Button variant="tertiary">Home</Button>
        <Button variant="tertiary">Listings</Button>
        <Button variant="tertiary">Bookings</Button>
      </nav>
    </div>
  );

  return (
    <AppShell header={header}>
      <ContentLayout headerOffset="md" fluid>
        {/* Dashboard content */}
      </ContentLayout>
    </AppShell>
  );
}
```

### Full-Width Application

```typescript
import { AppShell, ContentLayout } from '@xala/ds';

function DataDashboard() {
  return (
    <AppShell fluid header={<MyHeader />}>
      <ContentLayout fluid padding="24px">
        {/* Full-width charts, tables, and data visualizations */}
      </ContentLayout>
    </AppShell>
  );
}
```

### Minimal Shell

```typescript
import { AppShell, ContentLayout } from '@xala/ds';

function SimpleApp() {
  return (
    <AppShell>
      <ContentLayout>
        {/* Just content, no header or footer */}
      </ContentLayout>
    </AppShell>
  );
}
```

## Accessibility Features

Shells components include built-in accessibility features:

- **Semantic HTML**: Proper use of `<header>`, `<main>`, and `<footer>` landmarks
- **Document Structure**: Correct page structure for screen readers
- **Keyboard Navigation**: Focus management for navigation elements
- **Skip Links**: Consider adding skip-to-content links in your header
- **ARIA Landmarks**: Automatic landmark regions for assistive technology

## Layout Behavior

### Flexbox Structure
AppShell uses flexbox to create a sticky footer layout:
- Header: `flex-shrink: 0` (stays at top)
- Main: `flex: 1` (grows to fill space)
- Footer: `flex-shrink: 0` and `margin-top: auto` (stays at bottom)

### Scrolling Behavior
- The main content area scrolls while header and footer remain fixed
- Minimum height is `100vh` by default
- Works correctly with short and long content

### Responsive Design
- Content automatically adapts to viewport width
- Use `fluid` prop for full-width layouts
- Use `maxWidth` prop to constrain content width
- Combine with ContentLayout's responsive grid capabilities

## Integration with Other Components

### With AppHeader Component
```typescript
import { AppShell, AppHeader, ContentLayout } from '@xala/ds';

function MyApp() {
  return (
    <AppShell
      header={
        <AppHeader
          logo={<Logo />}
          navigation={<Navigation />}
          actions={<HeaderActions />}
        />
      }
    >
      <ContentLayout>
        {/* Content */}
      </ContentLayout>
    </AppShell>
  );
}
```

### With Navigation Components
```typescript
import { AppShell, Navigation, NavigationLink, ContentLayout } from '@xala/ds';

function AppWithNav() {
  const header = (
    <Navigation>
      <NavigationLink href="/">Home</NavigationLink>
      <NavigationLink href="/listings">Listings</NavigationLink>
      <NavigationLink href="/bookings">Bookings</NavigationLink>
    </Navigation>
  );

  return (
    <AppShell header={header}>
      <ContentLayout>
        {/* Content */}
      </ContentLayout>
    </AppShell>
  );
}
```

### With PageHeader Component
```typescript
import { AppShell, ContentLayout, PageHeader } from '@xala/ds';

function PageWithHeader() {
  return (
    <AppShell header={<GlobalHeader />}>
      <ContentLayout headerOffset="md">
        <PageHeader
          title="Dashboard"
          subtitle="View your analytics"
          actions={<Button>Export</Button>}
        />
        {/* Page content */}
      </ContentLayout>
    </AppShell>
  );
}
```

## Testing Your Implementation

When using shells components, verify:

1. **Layout Structure**: Shell renders with correct header, main, and footer sections
2. **Scrolling Behavior**: Content scrolls while header/footer stay fixed
3. **Viewport Height**: Shell fills at least the full viewport height
4. **Responsive Design**: Layout adapts to different screen sizes
5. **Theme Switching**: Shell respects theme changes
6. **Accessibility**: Test with screen readers and keyboard navigation
7. **TypeScript**: No type errors when using component props

## Related Documentation

- [Design System Primitives](../README.md#primitives) - Base components
- [Composed Components](../composed/README.md) - Mid-level layout components
- [Blocks Components](../blocks/README.md) - Business logic components
- [Provider Usage](../provider-usage.tsx) - Theme and provider setup
- [Component Registry](../../registry.json) - Full component catalog

## Contributing Examples

When adding new shells component examples:

1. Follow the existing file naming convention: `component-name.tsx`
2. Include JSDoc comments explaining the example's purpose
3. Demonstrate key props and common use cases
4. Show both basic and advanced usage patterns
5. Include accessibility considerations
6. Demonstrate integration with other components (ContentLayout, PageHeader, etc.)
7. Show responsive behavior
8. Add the example to `index.ts` and update this README

## Important Notes

### Application Structure

Shells components define the overall application structure:

```
App (DesignsystemetProvider)
└── AppShell
    ├── Header (AppHeader, Navigation)
    ├── Main Content
    │   └── ContentLayout
    │       ├── PageHeader
    │       └── ContentSection(s)
    │           └── Blocks/Primitives
    └── Footer
```

### One Shell Per App

- Use only ONE AppShell at the application root
- Don't nest multiple shells
- All pages should render within the same shell
- Use routing to change content, not shells

### With React Router

```typescript
import { AppShell, ContentLayout } from '@xala/ds';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <AppShell header={<GlobalHeader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

function HomePage() {
  return (
    <ContentLayout>
      {/* Home page content */}
    </ContentLayout>
  );
}
```

### Performance Considerations

- Header and footer components should be memoized if complex
- Avoid re-rendering the entire shell on route changes
- Use React.memo for header/footer components
- Keep shell props stable (use useMemo for complex objects)

## Common Pitfalls

1. **Nesting shells** - Only use one AppShell per application
2. **Missing ContentLayout** - Always use ContentLayout inside AppShell
3. **Hardcoded dimensions** - Use design tokens for spacing and colors
4. **Direct Designsystemet imports** - Always use `@xala/ds` facade
5. **Missing headerOffset** - Set headerOffset in ContentLayout when using fixed headers
6. **Overriding flex properties** - Don't override the shell's flexbox structure
7. **Not using semantic HTML** - Let AppShell handle header/main/footer elements
8. **Forgetting DesignsystemetProvider** - Wrap shell with provider for theming

## Design Tokens Reference

Common design tokens used with shells:

### Background Colors
- `var(--ds-color-neutral-background-default)`
- `var(--ds-color-neutral-background-subtle)`
- `var(--ds-color-brand-1-background-default)`

### Border Colors
- `var(--ds-color-neutral-border-default)`
- `var(--ds-color-neutral-border-subtle)`

### Spacing
- Use component props that map to tokens (padding, gap, etc.)
- Don't use hardcoded pixel values

## Examples Summary

This directory includes these AppShell examples:

1. **BasicAppShell** - Minimal shell setup
2. **AppShellWithHeader** - Shell with header section
3. **AppShellWithFooter** - Shell with footer section
4. **CompleteAppShell** - Full shell with header and footer
5. **FluidAppShell** - Full-width layout without max-width
6. **CustomMaxWidthAppShell** - Custom maximum width configuration
7. **CustomBackgroundAppShell** - Custom background color using tokens
8. **DashboardAppShell** - Complete dashboard layout example

Each example demonstrates different use cases and can be composed together based on your application's needs.
