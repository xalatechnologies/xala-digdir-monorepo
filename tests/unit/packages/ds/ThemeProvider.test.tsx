import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { ThemeProvider, useTheme } from '../../../../packages/ds/src/ThemeProvider';

// Test component that uses the theme context
function ThemeConsumer(): React.ReactElement {
  const { colorScheme, isDark, toggleTheme, setColorScheme, resetToAuto } = useTheme();
  return (
    <div>
      <span data-testid="color-scheme">{colorScheme}</span>
      <span data-testid="is-dark">{isDark ? 'true' : 'false'}</span>
      <button type="button" data-testid="toggle" onClick={toggleTheme}>Toggle</button>
      <button type="button" data-testid="set-light" onClick={() => setColorScheme('light')}>Light</button>
      <button type="button" data-testid="set-dark" onClick={() => setColorScheme('dark')}>Dark</button>
      <button type="button" data-testid="reset" onClick={resetToAuto}>Reset</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  const originalMatchMedia = window.matchMedia;
  const storageKey = 'test-theme-preference';

  beforeEach(() => {
    localStorage.clear();
    // Mock matchMedia for system preference detection
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)' ? false : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('should render children', () => {
    render(
      <ThemeProvider storageKey={storageKey}>
        <div data-testid="child">Child content</div>
      </ThemeProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should default to auto color scheme', () => {
    render(
      <ThemeProvider storageKey={storageKey}>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('color-scheme')).toHaveTextContent('auto');
  });

  it('should restore saved light theme from localStorage', () => {
    localStorage.setItem(storageKey, 'light');
    render(
      <ThemeProvider storageKey={storageKey}>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('color-scheme')).toHaveTextContent('light');
  });

  it('should restore saved dark theme from localStorage', () => {
    localStorage.setItem(storageKey, 'dark');
    render(
      <ThemeProvider storageKey={storageKey}>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('color-scheme')).toHaveTextContent('dark');
  });

  it('should toggle theme from light to dark', async () => {
    const user = userEvent.setup();
    localStorage.setItem(storageKey, 'light');
    
    render(
      <ThemeProvider storageKey={storageKey}>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('color-scheme')).toHaveTextContent('light');
    await user.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('color-scheme')).toHaveTextContent('dark');
  });

  it('should toggle theme from dark to light', async () => {
    const user = userEvent.setup();
    localStorage.setItem(storageKey, 'dark');
    
    render(
      <ThemeProvider storageKey={storageKey}>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('color-scheme')).toHaveTextContent('dark');
    await user.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('color-scheme')).toHaveTextContent('light');
  });

  it('should set color scheme to light', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider storageKey={storageKey}>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await user.click(screen.getByTestId('set-light'));
    expect(screen.getByTestId('color-scheme')).toHaveTextContent('light');
    expect(localStorage.getItem(storageKey)).toBe('light');
  });

  it('should set color scheme to dark', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider storageKey={storageKey}>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await user.click(screen.getByTestId('set-dark'));
    expect(screen.getByTestId('color-scheme')).toHaveTextContent('dark');
    expect(localStorage.getItem(storageKey)).toBe('dark');
  });

  it('should reset to auto and clear localStorage', async () => {
    const user = userEvent.setup();
    localStorage.setItem(storageKey, 'dark');
    
    render(
      <ThemeProvider storageKey={storageKey}>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('color-scheme')).toHaveTextContent('dark');
    await user.click(screen.getByTestId('reset'));
    expect(screen.getByTestId('color-scheme')).toHaveTextContent('auto');
    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  it('should compute isDark correctly for light theme', () => {
    localStorage.setItem(storageKey, 'light');
    render(
      <ThemeProvider storageKey={storageKey}>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
  });

  it('should compute isDark correctly for dark theme', () => {
    localStorage.setItem(storageKey, 'dark');
    render(
      <ThemeProvider storageKey={storageKey}>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
  });

  it('should use system preference for auto mode when system prefers dark', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <ThemeProvider storageKey={storageKey}>
        <ThemeConsumer />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('color-scheme')).toHaveTextContent('auto');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
  });

  it('should use default storage key when not provided', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('color-scheme')).toHaveTextContent('auto');
  });
});
