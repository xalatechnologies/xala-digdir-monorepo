import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DesignsystemetProvider, DialogProvider, ErrorBoundary, Heading, Paragraph, Card } from '@xala/ds';
import { I18nProvider } from '@xala/i18n';

import type { ColorScheme } from '@xala/ds';
import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';

// =============================================================================
// Theme Context (simplified version for docs app)
// =============================================================================

interface ThemeContextValue {
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colorScheme: 'auto',
  toggleTheme: () => {},
  setColorScheme: () => {},
  isDark: false,
});

interface ThemeProviderProps {
  children: ReactNode;
  storageKey?: string;
}

function ThemeProvider({ children, storageKey = 'docs-theme-preference' }: ThemeProviderProps) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    }
    return 'auto';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mediaQuery) return;

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    if (scheme === 'auto') {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, scheme);
    }
  };

  const isDark = colorScheme === 'auto' ? systemPrefersDark : colorScheme === 'dark';

  const toggleTheme = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleTheme, setColorScheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// =============================================================================
// Placeholder Home Page (will be replaced with DocsLayout in Phase 3)
// =============================================================================

function DocsHomePage() {
  return (
    <div style={{ padding: 'var(--ds-spacing-8)' }}>
      <Card asChild>
        <article style={{ padding: 'var(--ds-spacing-6)' }}>
          <Heading level={1} size="xlarge">
            Xala/Digilist Platform Documentation
          </Heading>
          <Paragraph>
            Welcome to the documentation site for the Xala/Digilist Platform -
            a Norwegian municipal booking and resource management system.
          </Paragraph>
          <Paragraph>
            This documentation covers roles, permissions, user journeys, integrations,
            seeding processes, and platform features.
          </Paragraph>
        </article>
      </Card>
    </div>
  );
}

// =============================================================================
// App Component
// =============================================================================

export function App() {
  return (
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}

function AppWithTheme() {
  const { colorScheme } = useTheme();

  return (
    <I18nProvider>
      <DesignsystemetProvider theme="digilist" colorScheme={colorScheme} size="md">
        <DialogProvider>
          <ErrorBoundary>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <Routes>
                {/* Main documentation routes */}
                <Route path="/" element={<DocsHomePage />} />

                {/* Role documentation routes (to be implemented in Phase 3) */}
                <Route path="/roles/*" element={<DocsHomePage />} />

                {/* Journey documentation routes */}
                <Route path="/journeys/*" element={<DocsHomePage />} />

                {/* Seeding documentation routes */}
                <Route path="/seeding/*" element={<DocsHomePage />} />

                {/* Integration documentation routes */}
                <Route path="/integrations/*" element={<DocsHomePage />} />

                {/* Platform documentation routes */}
                <Route path="/platform/*" element={<DocsHomePage />} />

                {/* Catch-all redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </DialogProvider>
      </DesignsystemetProvider>
    </I18nProvider>
  );
}
