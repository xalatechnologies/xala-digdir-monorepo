/**
 * React provider for managing Designsystemet theme and styling.
 * 
 * This provider handles runtime theme switching by managing a single <link>
 * element in the document head. It also sets data attributes for color scheme,
 * size, and typography preferences.
 * 
 * @example
 * ```tsx
 * import { DesignsystemetProvider } from '@xala/ds';
 *
 * function App() {
 *   return (
 *     <DesignsystemetProvider theme="digdir" colorScheme="auto" size="auto">
 *       <YourApp />
 *     </DesignsystemetProvider>
 *   );
 * }
 * ```
 */
import React from 'react';
import { DEFAULT_THEME, THEMES, type ThemeId } from '@xala/ds-themes';

/**
 * Available color scheme options for the design system.
 */
export type ColorScheme = 'light' | 'dark' | 'auto';

/**
 * Available size modes for component scaling.
 * 'auto' enables viewport-based responsive switching.
 */
export type DsSize = 'sm' | 'md' | 'lg' | 'auto';

/**
 * Available typography presets.
 */
export type Typography = 'primary' | 'secondary';

/**
 * Props for the DesignsystemetProvider component.
 */
export type DesignsystemetProviderProps = {
  /** Child components to be wrapped */
  children: React.ReactNode;
  /** Theme identifier for tenant branding */
  theme?: ThemeId;
  /** Color scheme preference */
  colorScheme?: ColorScheme;
  /** Component size mode */
  size?: DsSize;
  /** Typography preset */
  typography?: Typography;
  /**
   * Element type to render as the wrapper. Defaults to 'div'.
   * Use 'html' or 'body' to set attributes directly on document elements.
   */
  rootAs?: keyof JSX.IntrinsicElements;
};

const THEME_LINK_ID = 'xala-ds-theme';

/**
 * Ensures a theme CSS link element exists in the document head.
 * 
 * This function creates or updates a <link> element with the theme CSS.
 * It reuses the existing link to prevent flickering when switching themes.
 * 
 * @param href - URL of the theme CSS file
 */
function ensureThemeLink(href: string): void {
  const head = document.head;
  let link = document.getElementById(THEME_LINK_ID) as HTMLLinkElement | null;

  if (!link) {
    link = document.createElement('link');
    link.id = THEME_LINK_ID;
    link.rel = 'stylesheet';
    head.appendChild(link);
  }

  if (link.href !== href) {
    link.href = href;
  }
}

/**
 * React provider component for Designsystemet theming.
 * 
 * Manages theme loading through a dynamic <link> element and applies
 * data attributes for styling variations. Theme changes are applied
 * instantly without page reload.
 * 
 * @param props - Provider configuration props
 * @returns JSX element with theme context
 */
export function DesignsystemetProvider({
  children,
  theme = DEFAULT_THEME,
  colorScheme = 'auto',
  size = 'md',
  typography = 'primary',
  rootAs: Root = 'div',
}: DesignsystemetProviderProps) {
  React.useEffect(() => {
    const href = THEMES[theme];
    ensureThemeLink(href);
    
    // Also set attributes on html element for CSS targeting
    document.documentElement.setAttribute('data-color-scheme', colorScheme);
    document.documentElement.setAttribute('data-size', size);
    document.documentElement.setAttribute('data-typography', typography);
  }, [theme, colorScheme, size, typography]);

  return (
    <Root
      data-color-scheme={colorScheme}
      data-size={size}
      data-typography={typography}
    >
      {children}
    </Root>
  );
}
