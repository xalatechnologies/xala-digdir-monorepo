import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Outlet, useOutletContext } from 'react-router-dom';
import {
  AppHeader,
  HeaderLogo,
  HeaderActions,
  HeaderThemeToggle,
  HeaderLoginButton,
  NotificationBell,
  DialogProvider,
  ErrorBoundary,
} from '@xala/ds';
import { DesignsystemetProvider } from '@xala/ds';
import { DEFAULT_THEME, type ThemeId } from '@xala/ds-themes';
import { I18nProvider, useT } from '@xala/i18n';
import { useNotificationUnreadCount } from '@digilist/client-sdk';
import { RentalObjectsPage } from './pages/RentalObjectsPage';
import { RentalObjectDetailPage } from './pages/RentalObjectDetailPage';
import { PaymentCallbackPage } from './pages/PaymentCallbackPage';
import { LoginPage } from './pages/login';
import { PrivacySettingsPage } from './pages/PrivacySettingsPage';
import { RealtimeProvider } from './providers';
import { RealtimeToast, UserMenu } from './components';
import { GlobalSearch, ProtectedRoute, ConsentPopup } from '@xala/ds';
import { useAuth, useOAuthCallback, AuthProvider } from '@xala/auth';

// Theme context type
type ColorScheme = 'auto' | 'light' | 'dark';
interface ThemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  effectiveScheme: 'light' | 'dark';
}

// Hook to use theme context from outlet
function useThemeContext() {
  return useOutletContext<ThemeContextType>();
}

// Layout with header for main pages
function MainLayout() {
  const t = useT();
  const navigate = useNavigate();
  const { setColorScheme, effectiveScheme } = useThemeContext();
  const { isAuthenticated, user, logout } = useAuth();

  // Get real unread notification count (only for logged in users)
  const { data: unreadData } = useNotificationUnreadCount();
  const unreadCount = unreadData?.data?.count ?? 0;

  // Toggle between light and dark (skip auto for manual toggle)
  const handleThemeToggle = () => {
    setColorScheme(effectiveScheme === 'dark' ? 'light' : 'dark');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--ds-color-neutral-background-default)',
      margin: 0,
      padding: 0
    }}>
      {/* CSS for header and mobile-specific styles */}
      <style>{`
        @media (max-width: 599px) {
          .header-search-desktop { display: none !important; }
          .mobile-search-wrapper { display: block !important; }

          /* Mobile padding for header */
          header .ds-container {
            padding-left: var(--ds-spacing-4) !important;
            padding-right: var(--ds-spacing-4) !important;
          }

          /* Mobile padding for main content */
          .main-content-layout {
            padding-left: var(--ds-spacing-4) !important;
            padding-right: var(--ds-spacing-4) !important;
          }

          /* Ensure all child elements respect the container padding */
          .main-content-layout > main {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }

          /* Hide view toggle on mobile - only show grid view */
          .listing-toolbar .ds-toggle-group {
            display: none !important;
          }
        }
        @media (min-width: 600px) {
          .mobile-search-wrapper { display: none !important; }
        }
      `}</style>

      <AppHeader
        sticky={true}
        logo={
          <HeaderLogo
            src="/logo.svg"
            title={t('brand.name')}
            subtitle={t('brand.tagline')}
            href="/"
            height="40px"
            hideTextOnMobile={true}
          />
        }
        search={
          <div className="header-search-desktop">
            <GlobalSearch
              placeholder={t('common.search')}
              showShortcut={true}
              enableGlobalShortcut={true}
            />
          </div>
        }
        actions={
          <HeaderActions spacing="12px">
            <HeaderThemeToggle
              isDark={effectiveScheme === 'dark'}
              onToggle={handleThemeToggle}
            />
            {isAuthenticated && (
              <NotificationBell
                count={unreadCount}
                onClick={() => {
                  // TODO: Open notification center modal
                }}
                aria-label={`Varsler${unreadCount > 0 ? ` (${unreadCount} uleste)` : ''}`}
              />
            )}
            {isAuthenticated && user ? (
              <UserMenu
                userName={user.name}
                onLogout={handleLogout}
              />
            ) : (
              <HeaderLoginButton
                isLoggedIn={false}
                onLogin={handleLogin}
                color="accent"
              />
            )}
          </HeaderActions>
        }
      />

      <Outlet />
    </div>
  );
}

// Wrapper to provide theme context to MainLayout
function MainLayoutWithContext({ colorScheme, setColorScheme, effectiveScheme }: ThemeContextType) {
  return <Outlet context={{ colorScheme, setColorScheme, effectiveScheme }} />;
}

const THEME_STORAGE_KEY = 'theme-preference';

// App content with theme provider
function AppContent() {
  // Handle OAuth/BankID redirects automatically
  useOAuthCallback();

  const [theme] = React.useState<ThemeId>(DEFAULT_THEME);
  const [colorScheme, setColorSchemeState] = React.useState<ColorScheme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    }
    return 'auto';
  });
  const [systemScheme, setSystemScheme] = React.useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const setColorScheme = React.useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    if (scheme === 'auto') {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, scheme);
    }
  }, []);

  // Detect system color scheme
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemScheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) => {
      setSystemScheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Compute effective scheme
  const effectiveScheme = colorScheme === 'auto' ? systemScheme : colorScheme;

  return (
    <DesignsystemetProvider theme={theme} colorScheme={colorScheme} size="auto">
      <DialogProvider>
        <ErrorBoundary>
          <RealtimeProvider autoConnect={true} enableInDev={true}>
            <RealtimeToast />
            <ConsentPopup />
            <style>{`
              *, *::before, *::after {
                transition: background-color 0.3s ease, border-color 0.3s ease, color 0.2s ease;
              }
            `}</style>
            <Routes>
              {/* Login page - no header */}
              <Route path="/login" element={<LoginPage />} />

              {/* Main pages with header - wrapped to provide theme context */}
              <Route element={<MainLayoutWithContext colorScheme={colorScheme} setColorScheme={setColorScheme} effectiveScheme={effectiveScheme} />}>
                <Route element={<MainLayout />}>
                  {/* PUBLIC ROUTES - No authentication required */}
                  <Route path="/" element={<RentalObjectsPage />} />
                  <Route path="/rental-objects" element={<RentalObjectsPage />} />
                  <Route path="/rental-object/:id" element={<RentalObjectDetailPage />} />
                  {/* Backward compatibility - redirect old /listing/:id to /rental-object/:id */}
                  <Route path="/listing/:id" element={<RentalObjectDetailPage />} />

                  {/* PROTECTED ROUTES - Authentication required */}
                  <Route path="/payment/callback" element={<ProtectedRoute><PaymentCallbackPage /></ProtectedRoute>} />
                  <Route path="/privacy" element={<ProtectedRoute><PrivacySettingsPage /></ProtectedRoute>} />
                </Route>
              </Route>
            </Routes>
          </RealtimeProvider>
        </ErrorBoundary>
      </DialogProvider>
    </DesignsystemetProvider>
  );
}

export function App() {
  return (
    <I18nProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider config={{
          apiUrl: import.meta.env.VITE_API_URL || 'https://api.digilist.no',
        }}>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </I18nProvider>
  );
}

export default App;
