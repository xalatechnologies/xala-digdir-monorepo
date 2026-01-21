/**
 * @xalatechnologies/platform/ui/themes
 *
 * Theme configuration and utilities
 *
 * Available themes:
 * - digdir - Default Digdir theme
 * - altinn - Altinn theme
 * - uutilsynet - Utsynet theme
 * - portal - Portal theme
 *
 * @example
 * ```tsx
 * import { ThemeProvider, useTheme, themes } from '@xalatechnologies/platform/ui/themes';
 *
 * function App() {
 *   return (
 *     <ThemeProvider theme="digdir" colorScheme="auto">
 *       <MyApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */

// Theme types
export type ThemeName = 'digdir' | 'altinn' | 'uutilsynet' | 'portal';
export type ColorScheme = 'light' | 'dark' | 'auto';
export type Size = 'sm' | 'md' | 'lg';
export type Typography = 'primary' | 'secondary';

export interface ThemeConfig {
  theme: ThemeName;
  colorScheme: ColorScheme;
  size: Size;
  typography: Typography;
}

export interface ThemeContextValue extends ThemeConfig {
  setTheme: (theme: ThemeName) => void;
  setColorScheme: (colorScheme: ColorScheme) => void;
  setSize: (size: Size) => void;
  setTypography: (typography: Typography) => void;
}

// Theme definitions
export const themes: Record<ThemeName, { name: string; cssUrl: string }> = {
  digdir: {
    name: 'Digdir',
    cssUrl: 'https://cdn.jsdelivr.net/npm/@digdir/designsystemet-theme@1/digdir.css',
  },
  altinn: {
    name: 'Altinn',
    cssUrl: 'https://cdn.jsdelivr.net/npm/@digdir/designsystemet-theme@1/altinn.css',
  },
  uutilsynet: {
    name: 'UU-tilsynet',
    cssUrl: 'https://cdn.jsdelivr.net/npm/@digdir/designsystemet-theme@1/uutilsynet.css',
  },
  portal: {
    name: 'Portal',
    cssUrl: 'https://cdn.jsdelivr.net/npm/@digdir/designsystemet-theme@1/portal.css',
  },
};

// Default theme configuration
export const defaultThemeConfig: ThemeConfig = {
  theme: 'digdir',
  colorScheme: 'auto',
  size: 'md',
  typography: 'primary',
};

// TODO: Migrate ThemeProvider and useTheme hook from @xala/ds
// export { ThemeProvider } from './ThemeProvider';
// export { useTheme } from './useTheme';
