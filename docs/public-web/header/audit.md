# Public Web Header Audit

> Last Updated: 2026-01-19
> App: `apps/web`
> Package: `@xala/web`

This document audits the public-facing web app header implementation.

---

## Executive Summary

**Status:** ✅ **Well-implemented using DS components**

The web app header is **already composed from Design System components**. Only one app-local component exists (`UserMenu`) which should be promoted to DS.

---

## Current Implementation

### Header Composition (apps/web/src/App.tsx)

```tsx
<AppHeader
  sticky={true}
  logo={<HeaderLogo ... />}
  search={<GlobalSearch ... />}
  actions={
    <HeaderActions spacing="12px">
      <HeaderThemeToggle ... />
      <NotificationBell ... />
      {isAuthenticated ? <UserMenu ... /> : <HeaderLoginButton ... />}
    </HeaderActions>
  }
/>
```

### Component Sources

| Component | Source | Status |
|-----------|--------|--------|
| `AppHeader` | `@xala/ds` | ✅ DS |
| `HeaderLogo` | `@xala/ds` | ✅ DS |
| `HeaderActions` | `@xala/ds` | ✅ DS |
| `HeaderThemeToggle` | `@xala/ds` | ✅ DS |
| `HeaderLoginButton` | `@xala/ds` | ✅ DS |
| `GlobalSearch` | `@xala/ds` | ✅ DS |
| `NotificationBell` | `@xala/ds` | ✅ DS |
| `UserMenu` | `apps/web/src/components/UserMenu.tsx` | ⚠️ App-local |

---

## File Inventory

### Design System Components (packages/ds/src/)

| File | Components | Lines |
|------|-----------|-------|
| `composed/header.tsx` | `AppHeader` | 184 |
| `composed/header-parts.tsx` | `HeaderLogo`, `HeaderSearch`, `HeaderActions`, `HeaderActionButton`, `HeaderIconButton`, `HeaderThemeToggle`, `HeaderLanguageSwitch`, `HeaderLoginButton` | 1474 |
| `composed/LanguageSwitcher.tsx` | `LanguageSwitcher`, `ConnectedLanguageSwitcher` | 555 |
| `composed/GlobalSearch.tsx` | `GlobalSearch` | 396 |
| `blocks/NotificationBell.tsx` | `NotificationBell` | 171 |

### App-Local Components (apps/web/src/)

| File | Components | Lines | Notes |
|------|-----------|-------|-------|
| `components/UserMenu.tsx` | `UserMenu` | 194 | **Should move to DS** |

---

## State Providers

### Theme State

**Location:** `apps/web/src/App.tsx` (AppContent component)

```tsx
const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme-preference');
    if (stored === 'light' || stored === 'dark') return stored;
  }
  return 'auto';
});
```

**SSR Risk:** ⚠️ **MODERATE**
- Uses `localStorage` in initial state
- Has `typeof window !== 'undefined'` guard
- System scheme detection uses `window.matchMedia`
- **Could cause hydration mismatch** if server renders 'auto' but client has stored preference

**Recommendation:** Use cookie-based theme persistence for SSR safety.

---

### Language State

**Location:** `@xala/i18n` (I18nProvider)

```tsx
<I18nProvider initialLocale="nb">
  ...
</I18nProvider>
```

**SSR Risk:** ✅ **LOW**
- Locale is determined at provider level
- `initialLocale="nb"` is consistent between server and client

**Note:** Could be enhanced to read locale from cookie/URL for true SSR parity.

---

### Auth State

**Location:** `@xala/auth` (AuthProvider)

```tsx
<AuthProvider config={{
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.digilist.no',
}}>
  ...
</AuthProvider>
```

**SSR Risk:** ⚠️ **MODERATE**
- Auth state is client-only (cookies checked on mount)
- Server renders "logged out" state
- Client upgrades to "logged in" after session check

**Current Behavior:**
- Server: Renders `HeaderLoginButton`
- Client: Updates to `UserMenu` if authenticated

**This is acceptable** for client-rendered SPA. For true SSR, session should be read server-side.

---

## Duplicates Analysis

### UserMenu Component

**Location:** `apps/web/src/components/UserMenu.tsx`

This is the **only header-related app-local component**. It provides:
- User dropdown with avatar/name
- Link to MinSide portal
- Logout button

**Recommendation:** Create a reusable `UserMenu` component in DS with props:
```tsx
interface UserMenuProps {
  user: { name: string; avatarUrl?: string };
  items?: MenuItem[];  // Custom menu items
  onLogout: () => void;
  data-testid?: string;
}
```

---

## Accessibility Audit

### Keyboard Navigation

| Element | Tab Order | Enter Action | Escape | Status |
|---------|-----------|--------------|--------|--------|
| Logo | 1 (skip link first) | Navigate home | - | ✅ |
| Search | 2 | Open dropdown | Close | ✅ |
| Theme Toggle | 3 | Toggle | - | ✅ |
| Notification Bell | 4 | Open center | - | ✅ |
| User Menu | 5 | Open dropdown | Close | ⚠️ Needs focus trap |

### ARIA Compliance

| Component | aria-label | aria-expanded | aria-haspopup | Status |
|-----------|------------|---------------|---------------|--------|
| `HeaderThemeToggle` | ✅ "Bytt til lyst/mørkt tema" | - | - | ✅ |
| `GlobalSearch` | ✅ Via placeholder | - | - | ✅ |
| `UserMenu` | ✅ "User menu" | ✅ | ✅ | ✅ |
| `HeaderLoginButton` | ✅ | - | - | ✅ |

### Skip Link

**Status:** ✅ Implemented in `AppHeader`

```tsx
showSkipLink={true}
skipLinkTarget="#main"
skipLinkText="Hopp til hovedinnhold"
```

---

## SSR/Hydration Issues

### Issue 1: Theme Mismatch

**Risk Level:** ⚠️ MODERATE

**Problem:**
```tsx
const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    ...
  }
  return 'auto';
});
```

**Symptoms:**
- Flash of wrong theme on first paint
- Potential React hydration warnings

**Solution:**
1. Store theme preference in a cookie
2. Read cookie server-side (or use a `data-theme` attribute on HTML)
3. Use a "mounted" guard for client-only theming

**Current Mitigation:**
- Global CSS transition smooths the theme change
- Not a breaking issue for SPA mode

---

### Issue 2: Auth State Upgrade

**Risk Level:** ✅ LOW (acceptable pattern)

**Behavior:**
- Server/initial render: `<HeaderLoginButton />`
- After auth check: Upgrades to `<UserMenu />` if authenticated

**This is acceptable** because:
1. Auth check is fast (cookie-based)
2. UI difference is minimal
3. No layout shift (both components occupy same space)

---

## Responsive Behavior

### Desktop (>= 600px)
- Full logo with text
- Search bar visible
- All action buttons visible

### Mobile (< 600px)
- Logo icon only (text hidden)
- Search hidden in header (via CSS class `.header-search-desktop`)
- Actions remain visible but with reduced spacing

**CSS Implementation:**
```css
@media (max-width: 599px) {
  .header-search-desktop { display: none !important; }
  .mobile-search-wrapper { display: block !important; }
}
```

**Issue:** Mobile search is hidden but there's no obvious way to access it.

**Recommendation:** Add a search icon button in mobile that toggles search visibility.

---

## Missing Features

### 1. Language Switcher
**Status:** Not currently in header
**DS Component:** `LanguageSwitcher` exists
**Recommendation:** Add to header actions

### 2. Mobile Search Button
**Status:** Search hidden on mobile with no alternative
**Recommendation:** Add search icon button that expands search

---

## Test IDs Coverage

| Element | data-testid | Status |
|---------|-------------|--------|
| Header | - | ❌ Missing |
| Logo | - | ❌ Missing |
| Search Input | - | ❌ Missing |
| Theme Toggle | - | ❌ Missing |
| Notification Bell | - | ❌ Missing |
| Login Button | - | ❌ Missing |
| User Menu | - | ❌ Missing |

**Recommendation:** Add `data-testid` to all interactive header elements.

---

## Action Items

### P0 - Critical
- [ ] Add `data-testid` attributes to all header elements

### P1 - High Priority
- [ ] Move `UserMenu` to DS as reusable component
- [ ] Add `LanguageSwitcher` to header
- [ ] Add mobile search toggle button

### P2 - Medium Priority
- [ ] Implement cookie-based theme persistence
- [ ] Add focus trap to UserMenu dropdown

### P3 - Low Priority
- [ ] Consider server-side session reading for true SSR
