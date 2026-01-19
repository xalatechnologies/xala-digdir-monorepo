# Public Web Header Component Map

> Last Updated: 2026-01-19

Visual map of header component hierarchy and data flow.

---

## Component Hierarchy

```
App.tsx
└── I18nProvider
    └── BrowserRouter
        └── AuthProvider
            └── AppContent
                └── DesignsystemetProvider (theme, colorScheme)
                    └── DialogProvider
                        └── ErrorBoundary
                            └── RealtimeProvider
                                └── MainLayoutWithContext (theme context)
                                    └── MainLayout
                                        └── AppHeader (DS)
                                            ├── HeaderLogo (DS)
                                            │   ├── Logo Image
                                            │   ├── Title Text
                                            │   └── Subtitle Text
                                            ├── GlobalSearch (DS)
                                            │   ├── Search Input
                                            │   └── Results Dropdown
                                            └── HeaderActions (DS)
                                                ├── HeaderThemeToggle (DS)
                                                ├── NotificationBell (DS) [auth only]
                                                └── UserMenu (app-local) OR HeaderLoginButton (DS)
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Provider Layer                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────────────────┐   │
│  │ I18nProvider │   │ AuthProvider │   │ DesignsystemetProvider     │   │
│  │              │   │              │   │                            │   │
│  │ • locale     │   │ • user       │   │ • theme                    │   │
│  │ • t()        │   │ • isAuth     │   │ • colorScheme              │   │
│  │              │   │ • logout()   │   │ • size                     │   │
│  └──────┬───────┘   └──────┬───────┘   └──────────────┬─────────────┘   │
│         │                  │                          │                  │
└─────────┼──────────────────┼──────────────────────────┼──────────────────┘
          │                  │                          │
          ▼                  ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         MainLayout Component                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   const t = useT();                    // From I18nProvider              │
│   const { isAuthenticated, user, logout } = useAuth();                   │
│   const { setColorScheme, effectiveScheme } = useThemeContext();         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            AppHeader                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────┐                                               │
│   │     HeaderLogo      │  Props:                                       │
│   │   ┌─────────────┐   │  • src="/logo.svg"                           │
│   │   │   [LOGO]    │   │  • title={t('app.name')}                     │
│   │   │   DigiList  │   │  • subtitle={t('brand.tagline')}             │
│   │   │   Tagline   │   │  • href="/"                                  │
│   │   └─────────────┘   │  • hideTextOnMobile={true}                   │
│   └─────────────────────┘                                               │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                        GlobalSearch                              │   │
│   │   ┌──────────────────────────────────────────────────────────┐  │   │
│   │   │ 🔍  Søk...                                           ⌘K  │  │   │
│   │   └──────────────────────────────────────────────────────────┘  │   │
│   │   Props: placeholder={t('action.search')}                        │   │
│   │          showShortcut={true}                                     │   │
│   │          enableGlobalShortcut={true}                             │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                       HeaderActions                              │   │
│   │                                                                  │   │
│   │   ┌───────────┐   ┌───────────┐   ┌──────────────────────────┐  │   │
│   │   │ ThemeTgl  │   │ NotifBell │   │  UserMenu / LoginBtn     │  │   │
│   │   │    🌙     │   │   🔔 (3)  │   │   👤 User Name ▾         │  │   │
│   │   └───────────┘   └───────────┘   └──────────────────────────┘  │   │
│   │                                                                  │   │
│   │   ThemeToggle:           NotificationBell:    UserMenu:          │   │
│   │   • isDark={effective}   • count={unread}     • userName         │   │
│   │   • onToggle={...}       • onClick={...}      • onLogout         │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Import Map

```tsx
// From Design System (@xala/ds)
import {
  AppHeader,           // Main header shell
  HeaderLogo,          // Logo with text
  HeaderActions,       // Actions container
  HeaderThemeToggle,   // Dark/light toggle
  HeaderLoginButton,   // Login CTA button
  NotificationBell,    // Notification icon
  GlobalSearch,        // Search with dropdown
  DialogProvider,      // Dialog context
  ErrorBoundary,       // Error handling
} from '@xala/ds';

// From Theme Package
import { DEFAULT_THEME, type ThemeId } from '@xala/ds-themes';
import { DesignsystemetProvider } from '@xala/ds';

// From i18n Package
import { I18nProvider, useT } from '@xala/i18n';

// From Auth Package
import { useAuth, AuthProvider } from '@xala/auth';

// From SDK
import { useNotificationUnreadCount } from '@digilist/client-sdk';

// App-Local (should be moved to DS)
import { UserMenu } from './components';
```

---

## State Dependencies

| Component | Required Hooks | Provider |
|-----------|---------------|----------|
| `HeaderLogo` | `useT()` | `I18nProvider` |
| `GlobalSearch` | `useT()` | `I18nProvider` |
| `HeaderThemeToggle` | `useThemeContext()` | Custom (via Outlet) |
| `NotificationBell` | `useNotificationUnreadCount()` | SDK/QueryClient |
| `UserMenu` | `useAuth()`, `useT()` | `AuthProvider`, `I18nProvider` |
| `HeaderLoginButton` | - | - |

---

## Responsive Breakpoints

```
Desktop (>= 600px)              Mobile (< 600px)
┌────────────────────────────┐  ┌────────────────────────────┐
│ [LOGO] DigiList   [SEARCH] │  │ [LOGO]        [🌙][🔔][👤] │
│ Tagline      [🌙][🔔][👤]  │  │                            │
└────────────────────────────┘  └────────────────────────────┘

CSS Classes:
• .header-search-desktop → hidden on mobile
• .header-logo-text → hidden on mobile
```

---

## Event Flow

### Theme Toggle
```
User clicks 🌙
    ↓
handleThemeToggle()
    ↓
setColorScheme('light' | 'dark')
    ↓
localStorage.setItem('theme-preference', scheme)
    ↓
DesignsystemetProvider re-renders
    ↓
CSS variables update
```

### Login Flow
```
User clicks "Logg inn"
    ↓
handleLogin()
    ↓
navigate('/login')
    ↓
LoginPage renders
    ↓
User authenticates
    ↓
Redirect to / with tokens
    ↓
useOAuthCallback() processes
    ↓
isAuthenticated → true
    ↓
Header re-renders with UserMenu
```

### User Menu Actions
```
User clicks UserMenu
    ↓
Dropdown opens (isOpen=true)
    ↓
User clicks "Min Side"                User clicks "Logg ut"
    ↓                                     ↓
Navigate to minside URL               handleLogoutClick()
                                          ↓
                                      onLogout() → logout()
                                          ↓
                                      Cookies cleared
                                          ↓
                                      Redirect to /
```

---

## File Locations Summary

```
packages/ds/src/
├── composed/
│   ├── header.tsx              # AppHeader
│   ├── header-parts.tsx        # HeaderLogo, HeaderSearch, HeaderActions, etc.
│   ├── GlobalSearch.tsx        # GlobalSearch
│   └── LanguageSwitcher.tsx    # LanguageSwitcher
└── blocks/
    └── NotificationBell.tsx    # NotificationBell

apps/web/src/
├── App.tsx                     # Main app with header composition
├── components/
│   └── UserMenu.tsx            # ⚠️ App-local (move to DS)
└── providers/
    └── ...                     # Realtime, a11y monitoring
```
