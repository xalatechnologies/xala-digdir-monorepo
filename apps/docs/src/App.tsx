import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DesignsystemetProvider, DialogProvider, ErrorBoundary, Heading, Paragraph, Card } from '@xala/ds';
import { I18nProvider } from '@xala/i18n';

import type { ColorScheme } from '@xala/ds';
import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { DocsLayout } from './layouts/DocsLayout';
import { Checklist } from './components/docs/Checklist';
import { CodeBlock } from './components/docs/CodeBlock';

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
  const exampleCode = `import { useListings } from '@digilist/client-sdk/hooks';

function MyComponent() {
  const { data, isLoading } = useListings();

  if (isLoading) return <Loading />;

  return (
    <ul>
      {data.map(listing => (
        <li key={listing.id}>{listing.title}</li>
      ))}
    </ul>
  );
}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <Card style={{ padding: 'var(--ds-spacing-6)' }}>
        <Heading level={1} data-size="xl">
          Xala/Digilist Platform Documentation
        </Heading>
        <Paragraph style={{ marginTop: 'var(--ds-spacing-4)' }}>
          Welcome to the documentation site for the Xala/Digilist Platform -
          a Norwegian municipal booking and resource management system.
        </Paragraph>
        <Paragraph style={{ marginTop: 'var(--ds-spacing-3)' }}>
          This documentation covers roles, permissions, user journeys, integrations,
          seeding processes, and platform features.
        </Paragraph>
      </Card>

      {/* Checklist Component Demo */}
      <Card style={{ padding: 'var(--ds-spacing-6)' }}>
        <Heading level={2} data-size="lg">
          Getting Started Checklist
        </Heading>
        <Checklist
          items={[
            { text: 'Read the platform overview', checked: true },
            { text: 'Understand the role system', checked: true },
            { text: 'Review API documentation', checked: true },
            { text: 'Set up local development environment', checked: false },
            { text: 'Run the test suite', checked: false },
          ]}
        />
      </Card>

      {/* CodeBlock Component Demo */}
      <Card style={{ padding: 'var(--ds-spacing-6)' }}>
        <Heading level={2} data-size="lg">
          Code Example
        </Heading>
        <Paragraph style={{ marginTop: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-4)' }}>
          Here&apos;s an example of using the SDK to fetch listings:
        </Paragraph>
        <CodeBlock
          code={exampleCode}
          language="tsx"
          title="ListingExample.tsx"
          showLineNumbers
          highlightLines={[4, 5]}
        />
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
                {/* All routes wrapped in DocsLayout */}
                <Route element={<DocsLayout />}>
                  {/* Main documentation routes */}
                  <Route path="/" element={<DocsHomePage />} />

                  {/* Role documentation routes */}
                  <Route path="/roles" element={<DocsHomePage />} />
                  <Route path="/roles/*" element={<DocsHomePage />} />

                  {/* Journey documentation routes */}
                  <Route path="/journeys" element={<DocsHomePage />} />
                  <Route path="/journeys/*" element={<DocsHomePage />} />

                  {/* Seeding documentation routes */}
                  <Route path="/seeding" element={<DocsHomePage />} />
                  <Route path="/seeding/*" element={<DocsHomePage />} />

                  {/* Integration documentation routes */}
                  <Route path="/integrations" element={<DocsHomePage />} />
                  <Route path="/integrations/*" element={<DocsHomePage />} />

                  {/* Platform documentation routes */}
                  <Route path="/platform" element={<DocsHomePage />} />
                  <Route path="/platform/*" element={<DocsHomePage />} />

                  {/* Catch-all redirect to home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </DialogProvider>
      </DesignsystemetProvider>
    </I18nProvider>
  );
}
