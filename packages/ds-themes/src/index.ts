/**
 * Theme registry for runtime tenant branding switching.
 * 
 * This module provides theme URLs that allow applications to swap themes
 * by changing a single <link> tag. This approach respects Designsystemet's
 * requirement that theme CSS should only be loaded once per application.
 * 
 * @example
 * ```typescript
 * import { THEMES, DEFAULT_THEME } from '@xala/ds-themes';
 * 
 * // Load the default theme
 * const themeUrl = THEMES[DEFAULT_THEME];
 * ```
 */
// Official Digdir themes
const digdirThemeUrl = '/node_modules/@digdir/designsystemet-theme/brand/digdir.css';
const altinnThemeUrl = '/node_modules/@digdir/designsystemet-theme/brand/altinn.css';
const uutilsynetThemeUrl = '/node_modules/@digdir/designsystemet-theme/brand/uutilsynet.css';
const portalThemeUrl = '/node_modules/@digdir/designsystemet-theme/brand/portal.css';

// Custom DIGILIST theme (extends digdir with brand colors)
const digilistThemeUrl = '/node_modules/@xala/ds-themes/themes/digilist.css';

export type ThemeId = 'digdir' | 'altinn' | 'uutilsynet' | 'portal' | 'digilist';

export const THEMES: Record<ThemeId, string> = {
  digdir: digdirThemeUrl,
  altinn: altinnThemeUrl,
  uutilsynet: uutilsynetThemeUrl,
  portal: portalThemeUrl,
  digilist: digilistThemeUrl,
};

// DIGILIST is now the default theme
export const DEFAULT_THEME: ThemeId = 'digilist';
