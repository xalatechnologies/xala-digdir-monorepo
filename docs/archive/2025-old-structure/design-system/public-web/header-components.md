# Public Web Header Components

> Design System Documentation
> Package: `@xala/ds`
> Last Updated: 2026-01-19

This document provides detailed documentation for the header components used in the public web application.

---

## Overview

The header system is composed of modular, reusable components that follow the composition pattern:

```tsx
<AppHeader
  logo={<HeaderLogo ... />}
  search={<GlobalSearch ... />}
  actions={
    <HeaderActions>
      <HeaderThemeToggle ... />
      <LanguageSwitcher ... />
      <UserMenu ... />
    </HeaderActions>
  }
/>
```

---

## Components

### AppHeader

The main header shell component.

#### Import

```tsx
import { AppHeader } from '@xala/ds';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `logo` | `ReactNode` | - | Logo element (HeaderLogo recommended) |
| `search` | `ReactNode` | - | Search element (GlobalSearch recommended) |
| `actions` | `ReactNode` | - | Actions container (HeaderActions recommended) |
| `sticky` | `boolean` | `true` | Sticky header positioning |
| `height` | `string` | `'72px'` | Header height |
| `variant` | `'surface' \| 'background' \| 'transparent'` | `'surface'` | Background variant |
| `showSkipLink` | `boolean` | `true` | Show accessibility skip link |
| `skipLinkTarget` | `string` | `'#main'` | Skip link target ID |
| `skipLinkText` | `string` | `'Hopp til hovedinnhold'` | Skip link label |

#### SSR/Hydration Notes

- ✅ **SSR-safe**: No client-only code in render
- ✅ Skip link uses focus/blur handlers (client-side enhancement)
- ✅ All children are passed as props (composition pattern)

#### Accessibility

- **Skip link**: First focusable element, visually hidden until focused
- **Semantic HTML**: Uses `<header>` element
- **Landmark**: Header serves as navigation landmark

#### Example

```tsx
<AppHeader
  sticky={true}
  logo={<HeaderLogo title="DigiList" href="/" />}
  search={<GlobalSearch placeholder="Søk..." />}
  actions={<HeaderActions>...</HeaderActions>}
  data-testid="main-header"
/>
```

---

### HeaderLogo

Logo component with optional text.

#### Import

```tsx
import { HeaderLogo } from '@xala/ds';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | Logo image source |
| `title` | `string` | - | Primary text |
| `subtitle` | `string` | - | Secondary text (tagline) |
| `height` | `string` | `'32px'` | Logo image height |
| `href` | `string` | - | Link destination (home) |
| `hideTextOnMobile` | `boolean` | `false` | Hide title/subtitle on mobile |

#### SSR/Hydration Notes

- ✅ **SSR-safe**: Pure render, no client state
- Uses CSS media query for mobile (no JS)

#### Accessibility

- Image has `alt=""` (decorative, text provides meaning)
- If `href` provided, renders as link with text content
- Text styling maintains contrast ratios

#### Example

```tsx
<HeaderLogo
  src="/logo.svg"
  title={t('app.name')}
  subtitle={t('brand.tagline')}
  href="/"
  hideTextOnMobile={true}
  data-testid="header-logo"
/>
```

---

### GlobalSearch

Search input with typeahead dropdown.

#### Import

```tsx
import { GlobalSearch } from '@xala/ds';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `'Søk'` | Input placeholder |
| `width` | `string` | `'100%'` | Container width |
| `value` | `string` | - | Controlled value |
| `defaultValue` | `string` | `''` | Initial value |
| `onSearch` | `(value: string) => void` | - | Submit callback |
| `onSearchChange` | `(value: string) => void` | - | Input change callback |
| `results` | `SearchResultItem[] \| SearchResultGroup[]` | `[]` | Search results |
| `onResultSelect` | `(result: SearchResultItem) => void` | - | Result selection callback |
| `isLoading` | `boolean` | `false` | Loading state |
| `noResultsText` | `string` | `'Ingen resultater'` | Empty state text |
| `showShortcut` | `boolean` | `false` | Show ⌘K shortcut hint |
| `enableGlobalShortcut` | `boolean` | `false` | Enable ⌘K/Ctrl+K global shortcut |

#### SSR/Hydration Notes

- ⚠️ **Client-enhanced**: Global shortcut uses `useEffect`
- ✅ Initial render is safe (shortcut is progressive enhancement)
- ✅ Dropdown only opens on client interaction

#### Accessibility

- **ARIA combobox pattern**: `role="combobox"`, `aria-expanded`, `aria-autocomplete`
- **Keyboard navigation**: ↑↓ to navigate, Enter to select, Escape to close
- **Screen reader**: Announces results count and selection
- **Focus management**: Maintains focus in input during navigation

#### Example

```tsx
const [searchResults, setSearchResults] = useState([]);

<GlobalSearch
  placeholder={t('action.search')}
  showShortcut={true}
  enableGlobalShortcut={true}
  results={searchResults}
  onSearchChange={(value) => fetchResults(value)}
  onResultSelect={(result) => navigate(result.href)}
  data-testid="global-search"
/>
```

---

### HeaderThemeToggle

Dark/light mode toggle button.

#### Import

```tsx
import { HeaderThemeToggle } from '@xala/ds';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isDark` | `boolean` | `false` | Current dark mode state |
| `onToggle` | `() => void` | - | Toggle callback |

#### SSR/Hydration Notes

- ⚠️ **Hydration risk**: Theme state must be consistent server/client
- **Recommendation**: Use cookie-based theme OR render null on server

**Safe pattern:**
```tsx
// Client-only rendering
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
return <HeaderThemeToggle isDark={effectiveScheme === 'dark'} onToggle={handleToggle} />;
```

#### Accessibility

- **aria-label**: Dynamic based on current state ("Bytt til lyst/mørkt tema")
- **title**: Same as aria-label for tooltip
- **Icon transition**: Smooth rotation animation (respects reduced motion)

#### Example

```tsx
<HeaderThemeToggle
  isDark={effectiveScheme === 'dark'}
  onToggle={() => setColorScheme(effectiveScheme === 'dark' ? 'light' : 'dark')}
  data-testid="theme-toggle"
/>
```

---

### LanguageSwitcher

Language/locale toggle component.

#### Import

```tsx
import { LanguageSwitcher, ConnectedLanguageSwitcher } from '@xala/ds';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `locale` | `'nb' \| 'en'` | - | Current locale (controlled) |
| `onLocaleChange` | `(locale) => void` | - | Change callback |
| `variant` | `'toggle' \| 'dropdown' \| 'segmented'` | `'toggle'` | Display variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size |
| `labels` | `LocaleLabels` | `{ nb: 'NO', en: 'EN' }` | Display labels |
| `showFullNames` | `boolean` | `false` | Show "Norsk", "English" |
| `disabled` | `boolean` | `false` | Disabled state |
| `ariaLabel` | `string` | `'Bytt språk'` | Accessible label |

#### Variants

**Toggle** (default):
```
[ NO ]  ← Click to switch
```

**Segmented**:
```
[ NO ] [ EN ]  ← Radio group
```

**Dropdown**:
```
[ NO ▾ ]  ← Opens menu
  ├ NO
  └ EN
```

#### SSR/Hydration Notes

- ✅ **SSR-safe**: Locale must be consistent (use I18nProvider)
- ✅ No client-only code in render path

#### Accessibility

- **Toggle**: `aria-label` describes current state and action
- **Segmented**: `role="radiogroup"` with `aria-checked`
- **Dropdown**: `aria-haspopup="listbox"`, `aria-expanded`
- All variants support keyboard navigation

#### Example

```tsx
// Standalone (controlled)
<LanguageSwitcher
  locale={currentLocale}
  onLocaleChange={setLocale}
  variant="toggle"
  data-testid="language-switch"
/>

// Connected to i18n
<ConnectedLanguageSwitcher
  useLocale={useLocale}
  variant="toggle"
  data-testid="language-switch"
/>
```

---

### UserMenu

User dropdown menu (authenticated state).

> **Note:** Currently app-local. Should be moved to DS.

#### Import

```tsx
// Current (app-local)
import { UserMenu } from '@/components/UserMenu';

// Future (after DS migration)
import { UserMenu } from '@xala/ds';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `userName` | `string` | - | User display name |
| `avatarUrl` | `string` | - | User avatar URL |
| `onLogout` | `() => void` | - | Logout callback |

#### Recommended DS Interface

```tsx
interface UserMenuProps {
  user: {
    name: string;
    email?: string;
    avatarUrl?: string;
  };
  items?: MenuItem[];  // Custom menu items
  onLogout: () => void;
  logoutLabel?: string;
  ariaLabel?: string;
  'data-testid'?: string;
}

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  danger?: boolean;
}
```

#### SSR/Hydration Notes

- ⚠️ **Auth state**: Server doesn't know auth state
- **Current pattern**: Render `HeaderLoginButton` on server, upgrade to `UserMenu` client-side
- This is acceptable for SPA mode

#### Accessibility

- **Button**: `aria-expanded`, `aria-haspopup="menu"`
- **Dropdown**: `role="menu"` with `role="menuitem"` children
- **Keyboard**: Tab/Shift+Tab navigates, Enter activates, Escape closes
- **Focus trap**: Focus should stay within menu when open

#### Example

```tsx
{isAuthenticated && user ? (
  <UserMenu
    userName={user.name}
    avatarUrl={user.avatarUrl}
    onLogout={handleLogout}
    data-testid="user-menu"
  />
) : (
  <HeaderLoginButton
    isLoggedIn={false}
    onLogin={handleLogin}
    data-testid="login-button"
  />
)}
```

---

### HeaderLoginButton

Login CTA button.

#### Import

```tsx
import { HeaderLoginButton } from '@xala/ds';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isLoggedIn` | `boolean` | - | Auth state |
| `userName` | `string` | - | User name (logged in) |
| `avatarUrl` | `string` | - | Avatar URL (logged in) |
| `onLogin` | `() => void` | - | Login callback |
| `onLogout` | `() => void` | - | Logout callback |
| `loginText` | `string` | `'Logg inn'` | Login button text |
| `logoutText` | `string` | `'Logg ut'` | Logout button text |
| `color` | `'success' \| 'accent' \| 'neutral'` | `'accent'` | Button color |

#### SSR/Hydration Notes

- ✅ **SSR-safe**: Pure render based on props
- Use `isLoggedIn={false}` for SSR default, upgrade client-side

#### Accessibility

- **aria-label**: Describes action ("Logg inn" or "Logget inn som X. Logg ut.")
- Uses Digdir Button component (inherits a11y)

#### Example

```tsx
<HeaderLoginButton
  isLoggedIn={false}
  onLogin={() => navigate('/login')}
  color="accent"
  data-testid="header-login-btn"
/>
```

---

### HeaderActions

Container for header action buttons.

#### Import

```tsx
import { HeaderActions } from '@xala/ds';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `spacing` | `string` | `'var(--ds-spacing-3)'` | Gap between children |
| `children` | `ReactNode` | - | Action buttons |

#### Example

```tsx
<HeaderActions spacing="12px">
  <HeaderThemeToggle ... />
  <LanguageSwitcher ... />
  <UserMenu ... />
</HeaderActions>
```

---

## Composition Patterns

### Full Header (Desktop)

```tsx
<AppHeader
  sticky={true}
  logo={
    <HeaderLogo
      src="/logo.svg"
      title={t('app.name')}
      subtitle={t('brand.tagline')}
      href="/"
      hideTextOnMobile={true}
    />
  }
  search={
    <GlobalSearch
      placeholder={t('action.search')}
      showShortcut={true}
      enableGlobalShortcut={true}
    />
  }
  actions={
    <HeaderActions>
      <HeaderThemeToggle
        isDark={effectiveScheme === 'dark'}
        onToggle={handleThemeToggle}
      />
      <LanguageSwitcher
        locale={locale}
        onLocaleChange={setLocale}
        variant="toggle"
      />
      {isAuthenticated ? (
        <UserMenu userName={user.name} onLogout={handleLogout} />
      ) : (
        <HeaderLoginButton onLogin={handleLogin} color="accent" />
      )}
    </HeaderActions>
  }
/>
```

### Minimal Header (Unauthenticated)

```tsx
<AppHeader
  logo={<HeaderLogo title="DigiList" href="/" />}
  actions={
    <HeaderActions>
      <HeaderThemeToggle isDark={isDark} onToggle={toggle} />
      <HeaderLoginButton onLogin={handleLogin} />
    </HeaderActions>
  }
/>
```

---

## WCAG/UU Compliance

### Keyboard Interactions

| Component | Tab | Enter/Space | Escape | Arrow Keys |
|-----------|-----|-------------|--------|------------|
| Logo | Focus | Navigate home | - | - |
| Search | Focus | Submit/Select | Clear/Close | Navigate results |
| Theme Toggle | Focus | Toggle | - | - |
| Language Switcher | Focus | Toggle/Open | Close | Select option |
| User Menu | Focus | Open menu | Close menu | Navigate items |
| Login Button | Focus | Navigate login | - | - |

### Color Contrast

All components use design tokens that meet WCAG AA:
- Text on surface: 4.5:1 minimum
- Interactive elements: 3:1 minimum
- Focus indicators: 3:1 minimum

### Focus Management

- Skip link is first focusable element
- Focus order: Logo → Search → Actions (L to R)
- Dropdowns trap focus when open
- Escape returns focus to trigger

### Screen Reader Support

- Semantic HTML elements (`<header>`, `<nav>`)
- ARIA labels on all interactive elements
- Live regions for state changes
- Result count announcements in search

---

## Test IDs Reference

```tsx
// Recommended data-testid values
<AppHeader data-testid="main-header">
  <HeaderLogo data-testid="header-logo" />
  <GlobalSearch data-testid="global-search" />
  <HeaderActions>
    <HeaderThemeToggle data-testid="theme-toggle" />
    <LanguageSwitcher data-testid="language-switch" />
    <NotificationBell data-testid="notification-bell" />
    <UserMenu data-testid="user-menu" />
    <HeaderLoginButton data-testid="login-button" />
  </HeaderActions>
</AppHeader>
```
