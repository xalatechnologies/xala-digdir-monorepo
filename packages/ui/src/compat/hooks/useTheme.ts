/**
 * useTheme Hook
 *
 * Hook for managing theme state (color scheme, size, etc.)
 */

import { useState, useEffect, useCallback } from 'react';

export type ColorScheme = 'light' | 'dark' | 'auto';
export type Size = 'sm' | 'md' | 'lg';

export interface ThemeState {
  colorScheme: ColorScheme;
  resolvedColorScheme: 'light' | 'dark';
  size: Size;
}

export interface UseThemeReturn extends ThemeState {
  setColorScheme: (scheme: ColorScheme) => void;
  setSize: (size: Size) => void;
  toggleColorScheme: () => void;
}

const STORAGE_KEY = 'digilist-theme';

function getSystemColorScheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Partial<ThemeState> | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function storeTheme(theme: Partial<ThemeState>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  } catch {
    // Ignore storage errors
  }
}

export function useTheme(): UseThemeReturn {
  const stored = getStoredTheme();

  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(
    stored?.colorScheme || 'auto'
  );
  const [size, setSizeState] = useState<Size>(stored?.size || 'md');
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(getSystemColorScheme);

  // Listen for system color scheme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemScheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const resolved = colorScheme === 'auto' ? systemScheme : colorScheme;
    document.documentElement.setAttribute('data-color-scheme', resolved);
    document.documentElement.setAttribute('data-size', size);
  }, [colorScheme, systemScheme, size]);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    storeTheme({ colorScheme: scheme, size });
  }, [size]);

  const setSize = useCallback((newSize: Size) => {
    setSizeState(newSize);
    storeTheme({ colorScheme, size: newSize });
  }, [colorScheme]);

  const toggleColorScheme = useCallback(() => {
    const resolved = colorScheme === 'auto' ? systemScheme : colorScheme;
    const next = resolved === 'light' ? 'dark' : 'light';
    setColorScheme(next);
  }, [colorScheme, systemScheme, setColorScheme]);

  const resolvedColorScheme = colorScheme === 'auto' ? systemScheme : colorScheme;

  return {
    colorScheme,
    resolvedColorScheme,
    size,
    setColorScheme,
    setSize,
    toggleColorScheme,
  };
}
