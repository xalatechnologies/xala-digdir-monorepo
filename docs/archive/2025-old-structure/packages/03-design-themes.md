# @xala/ds-themes - Theme Management

@xala/ds-themes provides runtime theme switching capabilities for the Xala Diglist Platform, managing multiple Norwegian public sector themes dynamically.

## Overview

The theme system enables:
- **Runtime theme switching** without page reload
- **Multiple official themes** (Digdir, Altinn, Utsynet, Portal)
- **Custom theme creation** and extension
- **CSS variable management** for design tokens
- **Theme persistence** across sessions

## Installation

```bash
# Theme package is included with @xala/ds
# No separate installation needed
```

## Available Themes

### Official Themes
1. **Digdir** - Default Digdir theme (green primary)
2. **Altinn** - Altinn theme (blue primary)
3. **Utsynet** - Utsynet theme (purple primary)
4. **Portal** - Generic portal theme (neutral)

### Theme Characteristics
```typescript
interface Theme {
  name: string;
  displayName: string;
  cssUrl: string;
  tokens: {
    colors: {
      primary: string;
      secondary: string;
      success: string;
      warning: string;
      danger: string;
      background: string;
      surface: string;
      text: string;
    };
    spacing: Record<string, string>;
    typography: {
      fontFamily: string;
      fontSize: Record<string, string>;
      fontWeight: Record<string, string>;
    };
    shadows: Record<string, string>;
    borderRadius: Record<string, string>;
  };
}
```

## Usage

### Basic Theme Switching
```typescript
import { useTheme } from '@xala/ds';

function ThemeSwitcher() {
  const { theme, setTheme, colorScheme, setColorScheme } = useTheme();
  
  return (
    <div>
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
      
      <ToggleGroup
        type="single"
        value={colorScheme}
        onValueChange={(value: 'light' | 'dark' | 'auto') => 
          setColorScheme(value)
        }
      >
        <ToggleGroupItem value="light">Light</ToggleGroupItem>
        <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
        <ToggleGroupItem value="auto">Auto</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
```

### Theme Provider Configuration
```typescript
// app.tsx
import { DesignsystemetProvider } from '@xala/ds';

export function App() {
  return (
    <DesignsystemetProvider 
      theme="digdir" 
      colorScheme="auto"
      size="md"
      persistTheme={true} // Save to localStorage
    >
      <Router>
        <Routes>
          {/* Routes */}
        </Routes>
      </Router>
    </DesignsystemetProvider>
  );
}
```

## Theme System Architecture

### CSS Loading Strategy
```typescript
// packages/ds-themes/src/theme-loader.ts
export class ThemeLoader {
  private loadedThemes = new Map<string, HTMLLinkElement>();
  
  async loadTheme(themeName: string): Promise<void> {
    // Check if already loaded
    if (this.loadedThemes.has(themeName)) {
      return;
    }
    
    const theme = themes[themeName];
    if (!theme) {
      throw new Error(`Theme ${themeName} not found`);
    }
    
    // Create and append link element
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = theme.cssUrl;
    link.dataset.theme = themeName;
    
    // Wait for CSS to load
    await new Promise((resolve, reject) => {
      link.onload = resolve;
      link.onerror = reject;
    });
    
    document.head.appendChild(link);
    this.loadedThemes.set(themeName, link);
  }
  
  unloadTheme(themeName: string): void {
    const link = this.loadedThemes.get(themeName);
    if (link) {
      document.head.removeChild(link);
      this.loadedThemes.delete(themeName);
    }
  }
  
  switchTheme(fromTheme: string, toTheme: string): void {
    // Load new theme first
    this.loadTheme(toTheme).then(() => {
      // Apply theme
      document.documentElement.setAttribute('data-theme', toTheme);
      
      // Unload old theme after a delay
      setTimeout(() => {
        this.unloadTheme(fromTheme);
      }, 1000);
    });
  }
}
```

### Token Management
```typescript
// packages/ds-themes/src/token-manager.ts
export class TokenManager {
  applyTokens(tokens: ThemeTokens): void {
    const root = document.documentElement;
    
    // Apply color tokens
    Object.entries(tokens.colors).forEach(([key, value]) => {
      root.style.setProperty(`--ds-color-${key}`, value);
    });
    
    // Apply spacing tokens
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--ds-spacing-${key}`, value);
    });
    
    // Apply typography tokens
    Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
      root.style.setProperty(`--ds-font-family-${key}`, value);
    });
    
    // Apply other token categories...
  }
  
  getToken(tokenPath: string): string | null {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--ds-${tokenPath}`)
      .trim();
  }
  
  setToken(tokenPath: string, value: string): void {
    document.documentElement
      .style.setProperty(`--ds-${tokenPath}`, value);
  }
}
```

## Custom Themes

### Creating a Custom Theme
```typescript
// packages/ds-themes/src/themes/custom.ts
export const customTheme: Theme = {
  name: 'custom',
  displayName: 'Custom Organization',
  cssUrl: 'https://cdn.example.com/themes/custom.css',
  extends: 'digdir', // Extend base theme
  tokens: {
    colors: {
      primary: '#1e40af',      // Custom primary
      secondary: '#64748b',    // Custom secondary
      success: '#059669',      // Custom success
      warning: '#d97706',      // Custom warning
      danger: '#dc2626',       // Custom danger
      background: '#ffffff',   // Inherit from base
      surface: '#f8fafc',      // Custom surface
      text: '#1e293b',         // Custom text
    },
    spacing: {
      // Inherit all spacing from base theme
      ...digdirTheme.tokens.spacing,
      sidebar: '250px',        // Custom spacing
    },
    typography: {
      fontFamily: '"Inter", sans-serif', // Custom font
      fontSize: {
        // Inherit font sizes
        ...digdirTheme.tokens.typography.fontSize,
        'hero': '3rem',        // Custom font size
      },
    },
    shadows: {
      // Inherit shadows
      ...digdirTheme.tokens.shadows,
      'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1)', // Custom shadow
    },
    borderRadius: {
      // Inherit border radius
      ...digdirTheme.tokens.borderRadius,
      'card': '12px',         // Custom radius
    },
  },
};
```

### Registering Custom Theme
```typescript
// packages/ds-themes/src/index.ts
import { registerTheme } from './theme-registry';
import { customTheme } from './themes/custom';

// Register the theme
registerTheme(customTheme);

// Now it's available in the theme switcher
<DesignsystemetProvider theme="custom">
  <App />
</DesignsystemetProvider>
```

### Dynamic Theme Creation
```typescript
// Create theme at runtime
const dynamicTheme = createTheme({
  name: 'dynamic',
  displayName: 'Dynamic Theme',
  tokens: {
    colors: {
      primary: userPreferences.primaryColor,
      secondary: userPreferences.secondaryColor,
    },
  },
});

// Apply immediately
setTheme('dynamic');
```

## Theme Persistence

### Local Storage Integration
```typescript
// packages/ds-themes/src/persistence.ts
export const ThemePersistence = {
  save(theme: string, colorScheme: string): void {
    localStorage.setItem('ds-theme', theme);
    localStorage.setItem('ds-color-scheme', colorScheme);
  },
  
  load(): { theme: string; colorScheme: string } | null {
    const theme = localStorage.getItem('ds-theme');
    const colorScheme = localStorage.getItem('ds-color-scheme');
    
    if (theme && colorScheme) {
      return { theme, colorScheme };
    }
    
    return null;
  },
  
  clear(): void {
    localStorage.removeItem('ds-theme');
    localStorage.removeItem('ds-color-scheme');
  },
};
```

### System Preference Detection
```typescript
// packages/ds-themes/src/system-preference.ts
export function getSystemColorScheme(): 'light' | 'dark' {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function watchSystemColorScheme(
  callback: (scheme: 'light' | 'dark') => void
): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };
  
  mediaQuery.addEventListener('change', handleChange);
  
  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}
```

## Advanced Features

### Theme Transitions
```typescript
// Smooth theme transitions
const themeTransition = {
  duration: '300ms',
  easing: 'ease-in-out',
};

// Apply transition
document.documentElement.style.setProperty(
  '--theme-transition',
  `background-color ${themeTransition.duration} ${themeTransition.easing},
   color ${themeTransition.duration} ${themeTransition.easing},
   border-color ${themeTransition.duration} ${themeTransition.easing}`
);
```

### Component Theme Overrides
```typescript
// Override specific component styles
const componentOverrides = {
  Button: {
    primary: {
      backgroundColor: 'var(--ds-custom-button-primary)',
      '&:hover': {
        backgroundColor: 'var(--ds-custom-button-primary-hover)',
      },
    },
  },
  Card: {
    elevated: {
      boxShadow: 'var(--ds-custom-card-shadow)',
    },
  },
};

// Apply overrides
applyComponentOverrides(componentOverrides);
```

### Theme Variants
```typescript
// Create theme variants
const themeVariants = {
  digdir: {
    light: { ...digdirTheme },
    dark: { ...digdirDarkTheme },
  },
  altinn: {
    light: { ...altinnTheme },
    dark: { ...altinnDarkTheme },
  },
};

// Use variant
<DesignsystemetProvider 
  theme="digdir" 
  variant="dark"
>
  <App />
</DesignsystemetProvider>
```

## Performance Optimization

### Lazy Loading Themes
```typescript
// Load theme only when needed
const themeLoader = {
  async preloadTheme(themeName: string): Promise<void> {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = themes[themeName].cssUrl;
    document.head.appendChild(link);
  },
  
  async loadThemeOnDemand(themeName: string): Promise<void> {
    if (!isThemeLoaded(themeName)) {
      await loadTheme(themeName);
    }
  },
};
```

### CSS Optimization
```css
/* Critical CSS inlined */
:root {
  --ds-color-primary: #005124;
  --ds-color-background: #ffffff;
}

/* Non-critical CSS loaded async */
@import url('https://cdn.jsdelivr.net/npm/@digdir/designsystemet-css@latest/dist/non-critical.css');
```

## Testing

### Theme Testing Utilities
```typescript
// tests/utils/theme-test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { DesignsystemetProvider } from '@xala/ds';

export function renderWithTheme(
  ui: ReactElement,
  options: RenderOptions & { theme?: string } = {}
) {
  const { theme = 'digdir', ...renderOptions } = options;
  
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <DesignsystemetProvider theme={theme}>
      {children}
    </DesignsystemetProvider>
  );
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Test theme switching
test('renders with different themes', () => {
  const { rerender } = renderWithTheme(<Component />, { theme: 'digdir' });
  expect(screen.getByTestId('primary-button')).toHaveClass('bg-digdir-primary');
  
  rerender(<Component />, { theme: 'altinn' });
  expect(screen.getByTestId('primary-button')).toHaveClass('bg-altinn-primary');
});
```

### Visual Regression Testing
```typescript
// tests/visual/theme-visual.test.ts
import { test, expect } from '@playwright/test';

const themes = ['digdir', 'altinn', 'uutilsynet', 'portal'];

themes.forEach(theme => {
  test(`homepage visual regression for ${theme} theme`, async ({ page }) => {
    await page.goto(`/?theme=${theme}`);
    await page.waitForLoadState('networkidle');
    
    // Wait for theme to apply
    await page.waitForFunction(
      (themeName) => 
        document.documentElement.getAttribute('data-theme') === themeName,
      theme
    );
    
    // Take screenshot
    await expect(page).toHaveScreenshot(`homepage-${theme}.png`);
  });
});
```

## Best Practices

### 1. Theme Design
- Follow WCAG contrast requirements
- Maintain consistent visual hierarchy
- Test with real content
- Consider color blindness

### 2. Performance
- Lazy load non-critical themes
- Use CSS transitions for smooth changes
- Minimize theme file size
- Cache theme assets

### 3. Accessibility
- Respect system preferences
- Provide high contrast options
- Test with screen readers
- Ensure keyboard navigation

### 4. Maintenance
- Document custom tokens
- Version theme changes
- Test across browsers
- Monitor theme usage

## Migration Guide

### From Inline Styles
```typescript
// Before
<div style={{ backgroundColor: '#005124' }}>

// After
<div style={{ backgroundColor: 'var(--ds-color-primary)' }}>
```

### From Hardcoded Values
```typescript
// Before
const spacing = { small: 8, medium: 16, large: 24 };

// After
import { tokens } from '@xala/ds';
const spacing = tokens.spacing;
```

## Troubleshooting

### Common Issues

#### Theme Not Applying
```typescript
// Ensure CSS is loaded
await loadTheme(themeName);

// Check data attribute
console.log(document.documentElement.getAttribute('data-theme'));

// Verify CSS variables
console.log(getComputedStyle(document.documentElement)
  .getPropertyValue('--ds-color-primary'));
```

#### Flicker on Theme Switch
```typescript
// Add transition to root
document.documentElement.style.setProperty(
  '--theme-transition',
  'background-color 0.3s ease'
);

// Preload next theme
preloadTheme(nextThemeName);
```

#### Custom Tokens Not Working
```typescript
// Check token name format
// Correct: --ds-custom-token
// Wrong: --custom-token

// Apply to correct element
// For global: document.documentElement
// For component: componentElement
```

## Related Documentation

- [Design System Architecture](../architecture/04-design-system.md)
- [@xala/ds](./02-design-system.md)
- [CSS Custom Properties Guide](../guides/07-css-variables.md)
- [Accessibility Guide](../guides/05-accessibility.md)
