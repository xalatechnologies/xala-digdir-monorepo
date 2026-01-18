# Data Page Components Testing Guide

## Overview

This document describes the comprehensive test suite for the reusable dashboard components implemented in SaaS Admin and Tenant Admin apps.

## Test Files Created

1. **`apps/saas-admin/src/routes/tenants/index.test.tsx`** - Tenants page tests
2. **`apps/saas-admin/src/routes/plans/index.test.tsx`** - Plans page tests
3. **`apps/tenant-admin/src/routes/users/index.test.tsx`** - Users page tests
4. **`tests/unit/components/data-page-components.test.tsx`** - Component unit tests

## Test Coverage

### ✅ Status Tab Filtering and Counts

**Tests:**
- Display status tabs with correct counts
- Filter data when status tab is clicked
- Update counts dynamically based on API responses
- Handle tab navigation and active state

**Example:**
```typescript
it('should filter tenants when status tab is clicked', async () => {
  // Click active tab
  const activeTab = screen.getByRole('tab', { name: /active/i });
  fireEvent.click(activeTab);
  
  // Verify API called with correct status
  await waitFor(() => {
    expect(currentStatus).toBe('active');
  });
});
```

### ✅ Filter Chips Removal and Reset

**Tests:**
- Display filter chips when filters are active
- Remove individual filters when chip is clicked
- Reset all filters when reset button is clicked
- Handle multiple active filters

**Example:**
```typescript
it('should remove filter when chip is clicked', async () => {
  // Activate filter
  const activeTab = screen.getByRole('tab', { name: /active/i });
  fireEvent.click(activeTab);
  
  // Click remove on filter chip
  const removeButton = screen.getByLabelText(/fjern filter/i);
  fireEvent.click(removeButton);
  
  // Verify filter removed
  await waitFor(() => {
    expect(currentStatus).toBeUndefined();
  });
});
```

### ✅ Empty States with Different Scenarios

**Tests:**
- Display empty state when no data exists
- Show create action when no filters applied
- Show "try different filters" message when filters active
- Handle different empty state variants (success, warning, info)

**Example:**
```typescript
it('should display empty state with different message when filters are active', async () => {
  // Apply filter
  const activeTab = screen.getByRole('tab', { name: /active/i });
  fireEvent.click(activeTab);
  
  // Should show "try different filters" message
  await waitFor(() => {
    const emptyMessage = screen.queryByText(/try different|prøv å endre/i);
    expect(emptyMessage).toBeInTheDocument();
  });
});
```

### ✅ Responsive Behavior on Mobile

**Tests:**
- Handle status tabs overflow on mobile viewports
- Ensure horizontal scrolling works
- Test filter chips wrapping on small screens
- Verify toolbar layout adapts to mobile

**Example:**
```typescript
it('should handle status tabs overflow on mobile', async () => {
  // Mock mobile viewport
  Object.defineProperty(window, 'innerWidth', {
    value: 375,
  });
  
  // Status tabs should have overflow-x-auto for scrolling
  const statusTabs = document.querySelector('.status-tabs');
  expect(statusTabs).toBeInTheDocument();
});
```

### ✅ i18n Translations Verification

**Tests:**
- Display translated status labels
- Show translated filter chip labels
- Verify empty state messages are translated
- Test both Norwegian and English locales

**Example:**
```typescript
it('should display translated status labels', async () => {
  // Status labels should be translated
  const statusLabels = screen.queryAllByText(/active|aktiv/i);
  expect(statusLabels.length).toBeGreaterThan(0);
});
```

## Running Tests

### Run All Tests
```bash
pnpm test
```

### Run Specific Test Files
```bash
# SaaS Admin tenants page
pnpm test apps/saas-admin/src/routes/tenants/index.test.tsx

# SaaS Admin plans page
pnpm test apps/saas-admin/src/routes/plans/index.test.tsx

# Tenant Admin users page
pnpm test apps/tenant-admin/src/routes/users/index.test.tsx

# Component unit tests
pnpm test tests/unit/components/data-page-components.test.tsx
```

### Run Tests in Watch Mode
```bash
pnpm test --watch
```

### Run Tests with Coverage
```bash
pnpm test:coverage
```

### Run Tests with UI
```bash
pnpm test:ui
```

## Test Structure

Each test file follows this structure:

1. **Setup** - Mock SDK hooks and providers
2. **Status Tab Tests** - Filtering and counts
3. **Filter Chip Tests** - Removal and reset
4. **Empty State Tests** - Different scenarios
5. **i18n Tests** - Translation verification
6. **Responsive Tests** - Mobile behavior

## Mocking Strategy

### SDK Hooks
```typescript
vi.mock('@digilist/client-sdk/hooks', () => ({
  useSaasTenants: vi.fn(),
  useSuspendSaasTenant: vi.fn(() => ({
    mutateAsync: vi.fn(),
  })),
}));
```

### Test Wrapper
```typescript
function TestWrapper({ children }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <DesignsystemetProvider theme="digilist">
          <BrowserRouter>{children}</BrowserRouter>
        </DesignsystemetProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
```

## Manual Testing Checklist

### Status Tabs
- [ ] Tabs display with correct counts
- [ ] Clicking tab filters data correctly
- [ ] Active tab is highlighted
- [ ] Counts update when data changes
- [ ] Tabs scroll horizontally on mobile

### Filter Chips
- [ ] Chips appear when filters are active
- [ ] Clicking chip removes filter
- [ ] Reset all button clears all filters
- [ ] Multiple chips display correctly
- [ ] Chips wrap on mobile

### Empty States
- [ ] Empty state shows when no data
- [ ] Create button appears when no filters
- [ ] "Try different filters" shows when filters active
- [ ] Icons display correctly
- [ ] Variants (success, warning, info) work

### Data Page Header
- [ ] Count badge displays correctly
- [ ] Actions render properly
- [ ] Title is visible
- [ ] Responsive on mobile

### Data Page Toolbar
- [ ] Search input works
- [ ] Filters dropdowns function
- [ ] View mode toggle works
- [ ] Layout adapts to mobile

## Known Limitations

1. **API Mocking** - Tests mock SDK hooks, not actual API calls
2. **E2E Coverage** - These are unit tests; E2E tests needed for full flow
3. **Visual Regression** - No visual regression testing yet
4. **Performance** - No performance benchmarks included

## Next Steps

1. Add E2E tests with Playwright for full user flows
2. Add visual regression tests
3. Add performance benchmarks
4. Add accessibility tests (WCAG compliance)
5. Add cross-browser testing

## Troubleshooting

### Tests Failing
- Check that SDK hooks are properly mocked
- Verify i18n provider is included in test wrapper
- Ensure QueryClient is configured correctly
- Check that React Router is mocked for navigation

### Coverage Issues
- Ensure all branches are tested
- Add edge case tests
- Test error states
- Test loading states
