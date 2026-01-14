/**
 * Theme Provider
 * Manages light/dark theme with system preference detection
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type ColorScheme = 'light' | 'dark';

interface ThemeContextValue {
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colorScheme: 'light',
  toggleTheme: () => {},
  setColorScheme: () => {},
  isDark: false,
});

interface ThemeProviderProps {
  children: ReactNode;
  /** Storage key for persisting theme preference */
  storageKey?: string;
}

/**
 * ThemeProvider - Provides theme context with system preference detection
 * 
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <DesignsystemetProvider colorScheme={colorScheme}>
 *     <App />
 *   </DesignsystemetProvider>
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children, storageKey = 'theme-preference' }: ThemeProviderProps) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      // Fall back to system preference
      if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mediaQuery) return;

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no stored preference
      if (!localStorage.getItem(storageKey)) {
        setColorSchemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [storageKey]);

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    localStorage.setItem(storageKey, scheme);
  };

  const toggleTheme = () => {
    setColorScheme(colorScheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ 
      colorScheme, 
      toggleTheme, 
      setColorScheme,
      isDark: colorScheme === 'dark' 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 */
export function useTheme() {
  return useContext(ThemeContext);
}
