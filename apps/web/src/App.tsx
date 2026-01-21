/**
 * web App Component
 *
 * With RuntimeProvider, this is now a thin routing layer.
 * All providers (auth, i18n, theme, SDK) are in RuntimeProvider.
 */
import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Outlet, useOutletContext } from 'react-router-dom';
import {
  AppHeader,
  HeaderLogo,
  HeaderActions,
  HeaderThemeToggle,
  HeaderLoginButton,
  NotificationBell,
  GlobalSearch,
  ProtectedRoute,
  ConsentPopup,
} from '@xalatechnologies/platform/ui';
import { useT } from '@xala/i18n';
import { useNotificationUnreadCount } from '@digilist/client-sdk';
import { useAuth, useOAuthCallback } from '@xala/auth';
import { useTheme } from '@xalatechnologies/platform/ui';

// Pages
import { RentalObjectsPage } from './pages/RentalObjectsPage';
import { RentalObjectDetailPage } from './pages/RentalObjectDetailPage';
import { PaymentCallbackPage } from './pages/PaymentCallbackPage';
import { LoginPage } from './pages/login';
import { PrivacySettingsPage } from './pages/PrivacySettingsPage';

// App-specific components
import { RealtimeProvider } from './providers';
import { RealtimeToast, UserMenu } from './components';

// Theme context type for outlet
type ColorScheme = 'auto' | 'light' | 'dark';
interface ThemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  effectiveScheme: 'light' | 'dark';
}

function useThemeContext() {
  return useOutletContext<ThemeContextType>();
}

/**
 * Main Layout with header
 */
function MainLayout() {
  const t = useT();
  const navigate = useNavigate();
  const { setColorScheme, effectiveScheme } = useThemeContext();
  const { isAuthenticated, user, logout } = useAuth();

  // Get real unread notification count (only for logged in users)
  const { data: unreadData } = useNotificationUnreadCount();
  const unreadCount = unreadData?.data?.count ?? 0;

  const handleThemeToggle = () => {
    setColorScheme(effectiveScheme === 'dark' ? 'light' : 'dark');
  };

  const handleLogin = () => navigate('/login');
  const handleLogout = () => logout();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--ds-color-neutral-background-default)',
      margin: 0,
      padding: 0
    }}>
      <style>{`
        @media (max-width: 599px) {
          .header-search-desktop { display: none !important; }
          .mobile-search-wrapper { display: block !important; }
          header .ds-container {
            padding-left: var(--ds-spacing-4) !important;
            padding-right: var(--ds-spacing-4) !important;
          }
          .main-content-layout {
            padding-left: var(--ds-spacing-4) !important;
            padding-right: var(--ds-spacing-4) !important;
          }
          .listing-toolbar .ds-toggle-group { display: none !important; }
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
            title={t('app.name')}
            subtitle={t('brand.tagline')}
            href="/"
            height="40px"
            hideTextOnMobile={true}
          />
        }
        search={
          <div className="header-search-desktop">
            <GlobalSearch
              placeholder={t('action.search')}
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
                onClick={() => {}}
                aria-label={unreadCount > 0 ? t('notifications.bellWithUnread', { count: unreadCount }) : t('notifications.bell')}
              />
            )}
            {isAuthenticated && user ? (
              <UserMenu userName={user.name} onLogout={handleLogout} />
            ) : (
              <HeaderLoginButton isLoggedIn={false} onLogin={handleLogin} color="accent" />
            )}
          </HeaderActions>
        }
      />
      <Outlet />
    </div>
  );
}

/**
 * Theme context wrapper for layout
 */
function MainLayoutWithContext({ colorScheme, setColorScheme, effectiveScheme }: ThemeContextType) {
  return <Outlet context={{ colorScheme, setColorScheme, effectiveScheme }} />;
}

const THEME_STORAGE_KEY = 'theme-preference';

/**
 * App Routes with OAuth handling
 */
function AppRoutes() {
  useOAuthCallback();

  const [colorScheme, setColorSchemeState] = React.useState<ColorScheme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
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

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemScheme(mediaQuery.matches ? 'dark' : 'light');
    const handler = (e: MediaQueryListEvent) => setSystemScheme(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const effectiveScheme = colorScheme === 'auto' ? systemScheme : colorScheme;

  return (
    <RealtimeProvider autoConnect={true} enableInDev={true}>
      <RealtimeToast />
      <ConsentPopup />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<MainLayoutWithContext colorScheme={colorScheme} setColorScheme={setColorScheme} effectiveScheme={effectiveScheme} />}>
          <Route element={<MainLayout />}>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<RentalObjectsPage />} />
            <Route path="/rental-objects" element={<RentalObjectsPage />} />
            <Route path="/rental-object/:id" element={<RentalObjectDetailPage />} />
            <Route path="/listing/:id" element={<RentalObjectDetailPage />} />
            
            {/* PROTECTED ROUTES */}
            <Route path="/payment/callback" element={<ProtectedRoute><PaymentCallbackPage /></ProtectedRoute>} />
            <Route path="/privacy" element={<ProtectedRoute><PrivacySettingsPage /></ProtectedRoute>} />
          </Route>
        </Route>
      </Routes>
    </RealtimeProvider>
  );
}

/**
 * Web App - Public Booking Site
 * Now thin: BrowserRouter + Routes only
 */
export function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
