# Design System Architecture

This document explains the architecture of our design system, its integration with Norwegian Designsystemet, and how it ensures consistency across all applications.

## Overview

The Xala design system (`@xala/ds`) serves as a facade over Norwegian Designsystemet (@digdir/designsystemet-react), providing:
- **Consistent component usage** across applications
- **Runtime theme switching** capabilities
- **Accessibility compliance** out of the box
- **Design token management** for consistency

## Architecture Principles

### 1. Facade Pattern
We don't import Designsystemet directly. Instead, we use a facade layer:
```typescript
// ❌ Never do this in apps
import { Button } from '@digdir/designsystemet-react';

// ✅ Always do this
import { Button } from '@xala/ds';
```

### 2. Theme Switching
Runtime theme switching without page reload:
```typescript
<DesignsystemetProvider 
  theme="digdir" 
  colorScheme="auto"
  size="md"
>
  <App />
</DesignsystemetProvider>
```

### 3. Design Tokens
All styling uses design tokens, no hardcoded values:
```typescript
// ❌ Never hardcode values
<div style={{ padding: '16px', color: '#005124' }}>

// ✅ Use design tokens
<div style={{ padding: 'var(--ds-spacing-4)', color: 'var(--ds-color-primary)' }}>
```

## Package Structure

```
packages/ds/
├── src/
│   ├── index.ts                 # Main exports
│   ├── styles.ts                # CSS import point
│   ├── components/              # Component exports
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Form/
│   │   └── index.ts
│   ├── themes/                  # Theme configuration
│   │   ├── digdir.ts
│   │   ├── altinn.ts
│   │   └── index.ts
│   ├── tokens/                  # Design tokens
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   └── index.ts
│   └── utils/                   # Utilities
│       ├── cn.ts               # Class name utility
│       └── index.ts
├── styles/                      # Generated CSS
│   ├── digdir.css
│   ├── altinn.css
│   └── themes.css
└── package.json
```

## Component Architecture

### Component Re-exports
```typescript
// packages/ds/src/components/Button/index.ts
export { Button as DsButton } from '@digdir/designsystemet-react';
export type { ButtonProps } from '@digdir/designsystemet-react';

// Add any wrapper functionality here
export const Button = DsButton;
```

### Component Enhancement
Sometimes we enhance components with additional functionality:
```typescript
// packages/ds/src/components/Card/index.ts
import { Card as DsCard } from '@digdir/designsystemet-react';
import type { CardProps } from '@digdir/designsystemet-react';

interface EnhancedCardProps extends CardProps {
  loading?: boolean;
}

export const Card = ({ loading, children, ...props }: EnhancedCardProps) => {
  if (loading) {
    return <CardSkeleton {...props} />;
  }
  
  return <DsCard {...props}>{children}</DsCard>;
};
```

### Compound Components
For complex components, we use compound pattern:
```typescript
// packages/ds/src/components/DataGrid/index.ts
export const DataGrid = ({ children, ...props }: DataGridProps) => (
  <table {...props}>{children}</table>
);

DataGrid.Header = ({ children }) => <thead>{children}</thead>;
DataGrid.Body = ({ children }) => <tbody>{children}</tbody>;
DataGrid.Row = ({ children }) => <tr>{children}</tr>;
DataGrid.Cell = ({ children }) => <td>{children}</td>;
```

## Theme System

### Theme Configuration
```typescript
// packages/ds/src/themes/digdir.ts
export const digdirTheme = {
  name: 'digdir',
  cssUrl: 'https://cdn.jsdelivr.net/npm/@digdir/designsystemet-css@1.9.0/dist/digdir.css',
  tokens: {
    colors: {
      primary: '#005124',
      secondary: '#6E8898',
      background: '#FFFFFF',
      surface: '#F5F5F5',
    },
    spacing: {
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      // ... more spacing
    },
    typography: {
      fontFamily: '"Source Sans Pro", sans-serif',
      fontSize: {
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
      },
    },
  },
};
```

### Theme Switching Implementation
```typescript
// packages/ds/src/Provider.tsx
import { createContext, useContext, useEffect } from 'react';

interface ThemeContextValue {
  theme: string;
  setTheme: (theme: string) => void;
  colorScheme: 'light' | 'dark' | 'auto';
  setColorScheme: (scheme: 'light' | 'dark' | 'auto') => void;
}

export const DesignsystemetProvider = ({ 
  children, 
  theme = 'digdir',
  colorScheme = 'auto'
}: ProviderProps) => {
  const [currentTheme, setCurrentTheme] = useState(theme);
  
  useEffect(() => {
    // Load theme CSS
    const themeConfig = themes[currentTheme];
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = themeConfig.cssUrl;
    document.head.appendChild(link);
    
    // Apply color scheme
    document.documentElement.setAttribute('data-color-scheme', colorScheme);
    
    return () => {
      document.head.removeChild(link);
    };
  }, [currentTheme, colorScheme]);
  
  return (
    <ThemeContext.Provider value={{ theme: currentTheme, setTheme: setCurrentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

## Design Tokens

### Token Categories
```typescript
// packages/ds/src/tokens/index.ts
export const tokens = {
  // Colors
  colors: {
    // Semantic colors
    primary: 'var(--ds-color-primary)',
    secondary: 'var(--ds-color-secondary)',
    success: 'var(--ds-color-success)',
    warning: 'var(--ds-color-warning)',
    danger: 'var(--ds-color-danger)',
    
    // Neutral colors
    white: 'var(--ds-color-white)',
    gray50: 'var(--ds-color-gray-50)',
    gray100: 'var(--ds-color-gray-100)',
    // ... more grays
  },
  
  // Spacing
  spacing: {
    0: '0',
    1: 'var(--ds-spacing-1)',
    2: 'var(--ds-spacing-2)',
    3: 'var(--ds-spacing-3)',
    4: 'var(--ds-spacing-4)',
    5: 'var(--ds-spacing-5)',
    6: 'var(--ds-spacing-6)',
    8: 'var(--ds-spacing-8)',
    10: 'var(--ds-spacing-10)',
    12: 'var(--ds-spacing-12)',
    16: 'var(--ds-spacing-16)',
    20: 'var(--ds-spacing-20)',
    24: 'var(--ds-spacing-24)',
  },
  
  // Typography
  typography: {
    fontFamily: 'var(--ds-font-family)',
    fontSize: {
      xs: 'var(--ds-font-size-xs)',
      sm: 'var(--ds-font-size-sm)',
      md: 'var(--ds-font-size-md)',
      lg: 'var(--ds-font-size-lg)',
      xl: 'var(--ds-font-size-xl)',
    },
    fontWeight: {
      normal: 'var(--ds-font-weight-normal)',
      medium: 'var(--ds-font-weight-medium)',
      semibold: 'var(--ds-font-weight-semibold)',
      bold: 'var(--ds-font-weight-bold)',
    },
    lineHeight: {
      tight: 'var(--ds-line-height-tight)',
      normal: 'var(--ds-line-height-normal)',
      relaxed: 'var(--ds-line-height-relaxed)',
    },
  },
  
  // Shadows
  shadows: {
    sm: 'var(--ds-shadow-sm)',
    md: 'var(--ds-shadow-md)',
    lg: 'var(--ds-shadow-lg)',
    xl: 'var(--ds-shadow-xl)',
  },
  
  // Border radius
  borderRadius: {
    none: 'var(--ds-radius-none)',
    sm: 'var(--ds-radius-sm)',
    md: 'var(--ds-radius-md)',
    lg: 'var(--ds-radius-lg)',
    full: 'var(--ds-radius-full)',
  },
};
```

### Token Usage
```typescript
// Using tokens in components
import { tokens } from '@xala/ds';

const StyledComponent = styled.div`
  padding: ${tokens.spacing[4]};
  background-color: ${tokens.colors.surface};
  border-radius: ${tokens.borderRadius.md};
  box-shadow: ${tokens.shadows.sm};
`;
```

## CSS Architecture

### Single Import Point
```typescript
// packages/ds/src/styles.ts
// This is the ONLY place where CSS is imported

// Import base styles
import '@digdir/designsystemet-css/dist/index.css';

// Import theme-specific CSS dynamically
export const loadTheme = (theme: string) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://cdn.jsdelivr.net/npm/@digdir/designsystemet-css@latest/dist/${theme}.css`;
  document.head.appendChild(link);
};
```

### CSS Custom Properties
```css
/* Generated CSS variables */
:root {
  /* Colors */
  --ds-color-primary: #005124;
  --ds-color-secondary: #6E8898;
  
  /* Spacing */
  --ds-spacing-1: 0.25rem;
  --ds-spacing-2: 0.5rem;
  --ds-spacing-3: 0.75rem;
  --ds-spacing-4: 1rem;
  
  /* Typography */
  --ds-font-family: "Source Sans Pro", sans-serif;
  --ds-font-size-md: 1rem;
  
  /* Effects */
  --ds-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --ds-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

## Component Library

### Available Components
```typescript
// packages/ds/src/index.ts
// Layout
export { Container, Grid, Stack } from './components/Layout';

// Navigation
export { Header, Navigation, Breadcrumb } from './components/Navigation';

// Forms
export { 
  Button, 
  Input, 
  Select, 
  Checkbox, 
  RadioGroup, 
  Textarea 
} from './components/Form';

// Data Display
export { 
  Card, 
  Table, 
  List, 
  Badge, 
  Avatar, 
  Progress 
} from './components/DataDisplay';

// Feedback
export { 
  Alert, 
  Toast, 
  Modal, 
  Drawer, 
  LoadingSpinner 
} from './components/Feedback';

// Typography
export { 
  Heading, 
  Text, 
  Link, 
  Caption 
} from './components/Typography';
```

### Component Variants
```typescript
// Using class-variance-authority for variants
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  // Base classes
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-secondary text-white hover:bg-secondary/90',
        outline: 'border border-primary text-primary hover:bg-primary hover:text-white',
        ghost: 'text-primary hover:bg-primary/10',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export const Button = ({ variant, size, className, ...props }) => (
  <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
);
```

## Accessibility Architecture

### ARIA Implementation
```typescript
// packages/ds/src/components/Button/Button.tsx
export const Button = ({ 
  children, 
  disabled, 
  loading, 
  'aria-label': ariaLabel, 
  ...props 
}: ButtonProps) => {
  return (
    <button
      disabled={disabled || loading}
      aria-label={loading ? 'Loading' : ariaLabel}
      aria-busy={loading}
      {...props}
    >
      {loading && <LoadingSpinner aria-hidden="true" />}
      {children}
    </button>
  );
};
```

### Keyboard Navigation
```typescript
// packages/ds/src/components/Menu/Menu.tsx
export const Menu = ({ children }: MenuProps) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusNextItem();
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusPreviousItem();
        break;
      case 'Escape':
        closeMenu();
        break;
    }
  };
  
  return (
    <div role="menu" onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
};
```

## Integration with Applications

### App Setup
```typescript
// apps/web/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { DesignsystemetProvider } from '@xala/ds';
import { styles } from '@xala/ds/styles';
import App from './app';

// Import styles ONCE
import styles;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DesignsystemetProvider theme="digdir" colorScheme="auto">
      <App />
    </DesignsystemetProvider>
  </React.StrictMode>
);
```

### Usage in Components
```typescript
// apps/web/src/components/ListingCard.tsx
import { Card, Button, Badge, Avatar } from '@xala/ds';
import { tokens } from '@xala/ds';

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Card css={{ padding: tokens.spacing[4] }}>
      <Card.Header>
        <Avatar src={listing.owner.avatar} />
        <div>
          <Card.Title>{listing.title}</Card.Title>
          <Card.Subtitle>{listing.organization.name}</Card.Subtitle>
        </div>
        {listing.status === 'available' && (
          <Badge variant="success">Available</Badge>
        )}
      </Card.Header>
      
      <Card.Content>
        <Text>{listing.description}</Text>
      </Card.Content>
      
      <Card.Actions>
        <Button variant="primary">Book Now</Button>
        <Button variant="outline">View Details</Button>
      </Card.Actions>
    </Card>
  );
}
```

## Customization

### Extending Components
```typescript
// apps/backoffice/src/components/DataTable.tsx
import { Table } from '@xala/ds';

interface DataTableProps extends TableProps {
  onSort?: (column: string) => void;
}

export const DataTable = ({ onSort, ...props }: DataTableProps) => {
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.Cell onClick={() => onSort?.('name')}>
            Name <SortIcon />
          </Table.Cell>
          {/* ... more headers */}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {/* ... rows */}
      </Table.Body>
    </Table>
  );
};
```

### Custom Themes
```typescript
// apps/backoffice/src/themes/backoffice.ts
import { createTheme } from '@xala/ds';

export const backofficeTheme = createTheme({
  name: 'backoffice',
  extends: 'digdir',
  tokens: {
    colors: {
      primary: '#1e40af', // Override primary color
      sidebar: '#f8fafc', // Add custom color
    },
    spacing: {
      sidebar: '250px', // Add custom spacing
    },
  },
});
```

## Performance Optimization

### Tree Shaking
```typescript
// packages/ds/src/index.ts
// Enable tree shaking with named exports
export { Button } from './components/Button';
export { Card } from './components/Card';
// Don't use default exports for better tree shaking
```

### Code Splitting
```typescript
// Lazy load heavy components
const HeavyChart = lazy(() => import('@xala/ds/charts'));

// Use in app
<Suspense fallback={<LoadingSpinner />}>
  <HeavyChart data={data} />
</Suspense>
```

### CSS Optimization
```css
/* Critical CSS inlined */
.critical-button {
  /* Essential button styles */
}

/* Non-critical CSS loaded async */
@import url('non-critical-styles.css');
```

## Testing Architecture

### Component Testing
```typescript
// packages/ds/src/components/Button/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with correct label', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });
  
  it('applies variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary');
  });
  
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Accessibility Testing
```typescript
// packages/ds/src/components/Button/__tests__/Button.a11y.test.tsx
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../Button';

expect.extend(toHaveNoViolations);

test('Button should be accessible', async () => {
  const { container } = render(<Button>Accessible button</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Documentation

### Storybook Integration
```typescript
// packages/ds/src/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};
```

## Best Practices

### 1. Component Design
- Single responsibility principle
- Composable over inheritable
- Accessible by default
- Performant out of the box

### 2. API Design
- Consistent prop naming
- Logical default values
- Forward refs when needed
- Proper TypeScript types

### 3. Styling
- Use design tokens
- Avoid inline styles
- Support CSS-in-JS
- Enable customization

### 4. Performance
- Lazy load heavy components
- Optimize bundle size
- Use React.memo wisely
- Minimize re-renders

## Future Roadmap

### Planned Features
1. **Component library expansion** - More specialized components
2. **Theme builder** - Visual theme creation tool
3. **Design tokens API** - Dynamic token management
4. **Component analytics** - Usage tracking
5. **AI assistance** - Component suggestions

### Technical Improvements
1. **CSS-in-JS migration** - Better performance
2. **Micro-frontends support** - Independent versioning
3. **Web components** - Framework agnostic
4. **Design system as code** - Automated sync with Figma

## Related Documentation

- [Architecture Overview](./01-overview.md)
- [Package Documentation](../packages/README.md)
- [Web App Documentation](../apps/01-web.md)
- [Accessibility Guide](../guides/05-accessibility.md)
