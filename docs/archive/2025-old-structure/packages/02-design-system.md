# @xala/ds - Design System

@xala/ds is the official UI component library for the Xala Diglist Platform, providing a facade over Norwegian Designsystemet with enhanced features and theming capabilities.

## Overview

The design system serves as the single source of truth for all UI components across the platform:
- **Facade pattern** over @digdir/designsystemet-react
- **Runtime theme switching** support
- **Enhanced accessibility** features
- **Design token management**
- **Component variants** and utilities

## Installation

```bash
# In your app directory
pnpm add @xala/ds
```

## Setup

### 1. Import Styles (Once)
```typescript
// main.tsx - ONLY import styles here
import '@xala/ds/styles';
import { DesignsystemetProvider } from '@xala/ds';
import App from './app';

ReactDOM.createRoot(document.getElementById('root')).render(
  <DesignsystemetProvider theme="digdir" colorScheme="auto">
    <App />
  </DesignsystemetProvider>
);
```

### 2. Use Components
```typescript
// Any component file
import { Button, Card, Input } from '@xala/ds';

function MyComponent() {
  return (
    <Card>
      <Card.Content>
        <Input placeholder="Enter text" />
        <Button>Submit</Button>
      </Card.Content>
    </Card>
  );
}
```

## Core Features

### 1. Theme Provider
```typescript
interface DesignsystemetProviderProps {
  theme?: 'digdir' | 'altinn' | 'uutilsynet' | 'portal';
  colorScheme?: 'light' | 'dark' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

// Usage
<DesignsystemetProvider 
  theme="digdir" 
  colorScheme="auto" 
  size="md"
>
  <App />
</DesignsystemetProvider>
```

### 2. Design Tokens
```typescript
import { tokens } from '@xala/ds';

// Use tokens in styled components
const StyledDiv = styled.div`
  padding: ${tokens.spacing[4]};
  background-color: ${tokens.colors.surface};
  border-radius: ${tokens.borderRadius.md};
  box-shadow: ${tokens.shadows.sm};
`;

// Or use inline with CSS variables
<div style={{
  padding: 'var(--ds-spacing-4)',
  backgroundColor: 'var(--ds-color-surface)',
}}>
  Content
</div>
```

### 3. Component Variants
```typescript
// Button with variants
<Button variant="primary" size="md">
  Primary Button
</Button>

// Card with different styles
<Card variant="elevated">
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
  </Card.Header>
  <Card.Content>
    Card content
  </Card.Content>
</Card>
```

## Component Library

### Layout Components
```typescript
// Container for responsive layouts
<Container size="md" gutter="md">
  <Row>
    <Col span={12} md={8}>
      <Card>Content</Card>
    </Col>
    <Col span={12} md={4}>
      <Sidebar />
    </Col>
  </Row>
</Container>

// Stack for flexible layouts
<Stack direction="column" spacing="md" align="stretch">
  <Header />
  <Main />
  <Footer />
</Stack>
```

### Navigation Components
```typescript
// Header with navigation
<Header>
  <Header.Logo src="/logo.svg" alt="Xala Diglist" />
  <Header.Navigation>
    <Header.Link href="/listings">Listings</Header.Link>
    <Header.Link href="/bookings">Bookings</Header.Link>
    <Header.Link href="/profile">Profile</Header.Link>
  </Header.Navigation>
  <Header.Actions>
    <ThemeSwitcher />
    <UserMenu />
  </Header.Actions>
</Header>

// Breadcrumbs
<Breadcrumb>
  <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
  <Breadcrumb.Item href="/listings">Listings</Breadcrumb.Item>
  <Breadcrumb.Item active>Meeting Room A</Breadcrumb.Item>
</Breadcrumb>
```

### Form Components
```typescript
// Form with validation
<form onSubmit={handleSubmit}>
  <FormField>
    <Label htmlFor="title">Title</Label>
    <Input
      id="title"
      value={values.title}
      onChange={handleChange}
      error={errors.title}
      required
    />
    {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
  </FormField>
  
  <FormField>
    <Label htmlFor="description">Description</Label>
    <Textarea
      id="description"
      value={values.description}
      onChange={handleChange}
      rows={4}
    />
  </FormField>
  
  <FormField>
    <Label>Category</Label>
    <Select value={values.category} onValueChange={setCategory}>
      <Select.Trigger>
        <Select.Value placeholder="Select category" />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="meeting">Meeting Room</Select.Item>
        <Select.Item value="auditorium">Auditorium</Select.Item>
        <Select.Item value="sports">Sports Facility</Select.Item>
      </Select.Content>
    </Select>
  </FormField>
  
  <Button type="submit" disabled={!isValid}>
    Save
  </Button>
</form>
```

### Data Display Components
```typescript
// Data table
<DataTable
  data={listings}
  columns={[
    {
      key: 'title',
      label: 'Title',
      render: (value) => <strong>{value}</strong>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={value === 'available' ? 'success' : 'warning'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button size="sm" onClick={() => editListing(row.id)}>
          Edit
        </Button>
      ),
    },
  ]}
  pagination={{
    page,
    pageSize,
    total: totalCount,
    onPageChange: setPage,
  }}
/>

// List component
<List>
  {bookings.map(booking => (
    <List.Item key={booking.id}>
      <List.Item.Content>
        <List.Item.Title>{booking.listingTitle}</List.Item.Title>
        <List.Item.Description>
          {formatDate(booking.startTime)} - {formatDate(booking.endTime)}
        </List.Item.Description>
      </List.Item.Content>
      <List.Item.Action>
        <Button variant="ghost" size="sm">
          View
        </Button>
      </List.Item.Action>
    </List.Item>
  ))}
</List>
```

### Feedback Components
```typescript
// Alert messages
<Alert variant="info" icon>
  <Alert.Title>Information</Alert.Title>
  <Alert.Description>
    Your booking has been confirmed. Check your email for details.
  </Alert.Description>
</Alert>

<Alert variant="error">
  <Alert.Title>Error</Alert.Title>
  <Alert.Description>
    Failed to save changes. Please try again.
  </Alert.Description>
</Alert>

// Modal
<Modal open={isOpen} onOpenChange={setIsOpen}>
  <Modal.Content>
    <Modal.Header>
      <Modal.Title>Confirm Deletion</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      Are you sure you want to delete this listing? This action cannot be undone.
    </Modal.Body>
    <Modal.Footer>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        Delete
      </Button>
    </Modal.Footer>
  </Modal.Content>
</Modal>

// Toast notifications
<Toast>
  <Toast.Title>Success</Toast.Title>
  <Toast.Description>Changes saved successfully</Toast.Description>
</Toast>
```

## Advanced Features

### 1. Compound Components
```typescript
// Custom data grid
<DataGrid data={data} selection={selection} onSelectionChange={setSelection}>
  <DataGrid.Header>
    <DataGrid.Row>
      <DataGrid.Cell as="th">
        <Checkbox
          checked={selection.length === data.length}
          onCheckedChange={handleSelectAll}
        />
      </DataGrid.Cell>
      <DataGrid.Cell as="th">Name</DataGrid.Cell>
      <DataGrid.Cell as="th">Status</DataGrid.Cell>
    </DataGrid.Row>
  </DataGrid.Header>
  <DataGrid.Body>
    {data.map(item => (
      <DataGrid.Row key={item.id}>
        <DataGrid.Cell>
          <Checkbox
            checked={selection.includes(item.id)}
            onCheckedChange={(checked) => toggleSelection(item.id, checked)}
          />
        </DataGrid.Cell>
        <DataGrid.Cell>{item.name}</DataGrid.Cell>
        <DataGrid.Cell>
          <Badge variant={item.status}>{item.status}</Badge>
        </DataGrid.Cell>
      </DataGrid.Row>
    ))}
  </DataGrid.Body>
</DataGrid>
```

### 2. Custom Hooks
```typescript
// Use theme hook
const { theme, setTheme, colorScheme, setColorScheme } = useTheme();

// Use form hook with validation
const { 
  values, 
  errors, 
  touched, 
  handleChange, 
  handleSubmit, 
  isValid 
} = useForm({
  initialValues: { title: '', description: '' },
  validationSchema: listingSchema,
  onSubmit: (values) => saveListing(values),
});

// Use breakpoint hook
const isMobile = useBreakpoint('md', { lt: true });
const isTablet = useBreakpoint('md');
const isDesktop = useBreakpoint('lg', { gt: true });
```

### 3. Utility Functions
```typescript
// Class name utility
import { cn } from '@xala/ds';

const className = cn(
  'base-class',
  {
    'modifier-class': isActive,
    'another-modifier': hasError,
  },
  props.className
);

// Format utilities
import { formatDate, formatTime, formatCurrency } from '@xala/ds';

const formatted = {
  date: formatDate(new Date(), 'nb-NO'),
  time: formatTime(new Date()),
  currency: formatCurrency(1234.56, 'NOK'),
};

// Validation utilities
import { validateEmail, validatePhone, validateOrgNumber } from '@xala/ds';

const isValid = {
  email: validateEmail('test@example.com'),
  phone: validatePhone('+47 123 45 678'),
  orgNumber: validateOrgNumber('123456789'),
};
```

## Theming

### Available Themes
```typescript
// Digdir theme (default)
<DesignsystemetProvider theme="digdir">
  <App />
</DesignsystemetProvider>

// Altinn theme
<DesignsystemetProvider theme="altinn">
  <App />
</DesignsystemetProvider>

// Utsynet theme
<DesignsystemetProvider theme="uutilsynet">
  <App />
</DesignsystemetProvider>

// Portal theme
<DesignsystemetProvider theme="portal">
  <App />
</DesignsystemetProvider>
```

### Custom Theme
```typescript
// Create custom theme
const customTheme = createTheme({
  name: 'custom',
  extends: 'digdir',
  tokens: {
    colors: {
      primary: '#1e40af',
      secondary: '#64748b',
    },
    spacing: {
      sidebar: '250px',
    },
  },
});

// Use custom theme
<DesignsystemetProvider theme={customTheme}>
  <App />
</DesignsystemetProvider>
```

### Theme Switching
```typescript
// Theme switcher component
function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Select value={theme} onValueChange={setTheme}>
      <Select.Trigger>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="digdir">Digdir</Select.Item>
        <Select.Item value="altinn">Altinn</Select.Item>
        <Select.Item value="uutilsynet">Utsynet</Select.Item>
        <Select.Item value="portal">Portal</Select.Item>
      </Select.Content>
    </Select>
  );
}
```

## Accessibility

### ARIA Support
All components include proper ARIA attributes:
```typescript
// Accessible button
<Button 
  aria-label="Close dialog"
  aria-describedby="dialog-description"
  disabled={isLoading}
  aria-busy={isLoading}
>
  {isLoading ? 'Loading...' : 'Close'}
</Button>

// Accessible form
<FormField>
  <Label htmlFor="email">Email address</Label>
  <Input
    id="email"
    type="email"
    aria-describedby="email-help"
    aria-invalid={!!errors.email}
    aria-required
  />
  <div id="email-help">
    We'll never share your email with anyone else.
  </div>
  {errors.email && (
    <div role="alert" aria-live="polite">
      {errors.email}
    </div>
  )}
</FormField>
```

### Keyboard Navigation
```typescript
// Keyboard-friendly menu
<Menu>
  <Menu.Trigger>Menu</Menu.Trigger>
  <Menu.Content>
    <Menu.Item onClick={handleNew}>New</Menu.Item>
    <Menu.Item onClick={handleEdit}>Edit</Menu.Item>
    <Menu.Item onClick={handleDelete}>Delete</Menu.Item>
  </Menu.Content>
</Menu>

// Focus management
const { ref, focused } = useFocusManagement({
  onEscape: () => setIsOpen(false),
  onEnter: () => handleSubmit(),
});
```

## Performance

### Code Splitting
```typescript
// Lazy load components
const HeavyChart = lazy(() => import('@xala/ds/charts'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <HeavyChart data={data} />
</Suspense>
```

### Optimized Rendering
```typescript
// Memoized components
export const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  const processedData = useMemo(() => processData(data), [data]);
  
  return <Chart data={processedData} />;
});

// Virtualized list
<VirtualizedList
  height={400}
  itemCount={items.length}
  itemSize={50}
  renderItem={({ index, style }) => (
    <div style={style}>
      <ListItem item={items[index]} />
    </div>
  )}
/>
```

## Testing

### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@xala/ds';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('applies variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary');
  });
});
```

### Accessibility Testing
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
import { Card } from '@xala/ds';

expect.extend(toHaveNoViolations);

test('Card should be accessible', async () => {
  const { container } = render(
    <Card>
      <Card.Header>
        <Card.Title>Test Card</Card.Title>
      </Card.Header>
      <Card.Content>Test content</Card.Content>
    </Card>
  );
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Migration from Designsystemet

### Before
```typescript
// Direct import (not allowed)
import { Button } from '@digdir/designsystemet-react';

// Hardcoded styles
<div style={{ padding: '16px' }}>
  <Button>Click</Button>
</div>
```

### After
```typescript
// Use facade
import { Button } from '@xala/ds';

// Use tokens
<div style={{ padding: 'var(--ds-spacing-4)' }}>
  <Button>Click</Button>
</div>
```

## Best Practices

### 1. Component Usage
- Always import from `@xala/ds`
- Use semantic HTML elements
- Provide proper labels and descriptions
- Handle loading and error states

### 2. Styling
- Use design tokens, not hardcoded values
- Leverage component variants
- Follow the spacing system
- Maintain visual hierarchy

### 3. Accessibility
- Test with screen readers
- Ensure keyboard navigation
- Provide sufficient color contrast
- Include ARIA labels when needed

### 4. Performance
- Lazy load heavy components
- Use React.memo for expensive renders
- Optimize bundle size
- Use virtualization for long lists

## Troubleshooting

### Common Issues

#### Theme Not Applying
```typescript
// Ensure styles are imported once
import '@xala/ds/styles'; // In main.tsx only

// Check provider is wrapping app
<DesignsystemetProvider theme="digdir">
  <App />
</DesignsystemetProvider>
```

#### Component Not Found
```typescript
// Check import path
import { Button } from '@xala/ds'; // Correct
// NOT import { Button } from '@xala/ds/components/Button'; // Incorrect
```

#### CSS Variables Not Working
```typescript
// Ensure theme provider is used
// Check CSS custom properties format
// Use var(--ds-token-name) not ds-token-name
```

## Related Documentation

- [Design System Architecture](../architecture/04-design-system.md)
- [@xala/ds-themes](./03-design-themes.md)
- [Accessibility Guide](../guides/05-accessibility.md)
- [Component Storybook](https://storybook.diglist.no)
