# Theming

The DS supports light, dark, and auto (system preference) themes using Digdir Designsystemet theming model.

## Theme Provider

Wrap your application with `ThemeProvider`:

```tsx
import { ThemeProvider } from '@xala/ds';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

## Theme Switching

Use the `useTheme` hook to access and control theme:

```tsx
import { useTheme } from '@xala/ds';

function ThemeToggle() {
  const { colorScheme, isDark, toggleTheme, setColorScheme } = useTheme();

  return (
    <div>
      <p>Current: {colorScheme}</p>
      <p>Is Dark: {isDark ? 'Yes' : 'No'}</p>
      
      <button onClick={toggleTheme}>
        Toggle Theme
      </button>
      
      <button onClick={() => setColorScheme('light')}>Light</button>
      <button onClick={() => setColorScheme('dark')}>Dark</button>
      <button onClick={() => setColorScheme('auto')}>Auto</button>
    </div>
  );
}
```

## Theme Context API

```typescript
interface ThemeContextValue {
  colorScheme: 'light' | 'dark' | 'auto';
  isDark: boolean;
  toggleTheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
  resetToAuto: () => void;
}
```

## Persistence

Theme preference is persisted to localStorage:

- Key: `theme-preference`
- Values: `'light'`, `'dark'`, or removed (auto)

```tsx
// Custom storage key
<ThemeProvider storageKey="my-app-theme">
  <App />
</ThemeProvider>
```

## CSS Integration

Apply `data-color-scheme` to root element:

```tsx
<div data-color-scheme={colorScheme}>
  <App />
</div>
```

## Token Behavior

Tokens automatically adapt to theme:

```css
/* Light theme */
--ds-color-neutral-background-default: #ffffff;
--ds-color-neutral-text-default: #1e1e1e;

/* Dark theme */
--ds-color-neutral-background-default: #1e1e1e;
--ds-color-neutral-text-default: #ffffff;
```

## Storybook Theme Switching

In Storybook, use the toolbar to switch themes. The preview decorator applies the selected theme to all stories.

## Building Custom Themes

For custom brand themes:

1. Use Digdir Theme Builder: https://designsystemet.no/en/fundamentals/themebuilder/
2. Export theme tokens
3. Add to `packages/ds-themes`
4. Register in ThemeProvider

## Migration Notes

If migrating from custom theming:

1. Replace custom CSS variables with DS tokens
2. Use `useTheme` hook instead of custom context
3. Remove direct DOM class manipulation
4. Use `data-color-scheme` attribute

## Best Practices

### Do

- Use `useTheme` for theme access
- Let tokens handle color changes
- Test in both light and dark modes
- Use semantic color tokens

### Don't

- Hardcode colors
- Use `prefers-color-scheme` directly
- Override token values inline
- Forget to test theme switching
