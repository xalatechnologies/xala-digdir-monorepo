/**
 * Theme registry for runtime tenant branding switching.
 *
 * This module provides theme URLs that allow applications to swap themes
 * by loading CSS files. Themes can be a single file or an array of files
 * (base + extensions). This approach respects Designsystemet's requirement
 * that theme CSS should only be loaded once per application.
 *
 * @example
 * ```typescript
 * import { THEMES, DEFAULT_THEME, getThemeUrls } from '@xala/ds-themes';
 *
 * // Get theme URLs (always returns array)
 * const urls = getThemeUrls(DEFAULT_THEME);
 * ```
 */

// Official Digdir themes from npm package
const OFFICIAL_THEMES = {
  digdir: '/node_modules/@digdir/designsystemet-theme/brand/digdir.css',
  altinn: '/node_modules/@digdir/designsystemet-theme/brand/altinn.css',
  uutilsynet: '/node_modules/@digdir/designsystemet-theme/brand/uutilsynet.css',
  portal: '/node_modules/@digdir/designsystemet-theme/brand/portal.css',
};

// Custom DIGILIST theme: CLI-generated base + app extensions
const DIGILIST_THEME = [
  '/node_modules/@xala/ds-themes/generated/digilist.css',      // CLI-generated base
  '/node_modules/@xala/ds-themes/themes/digilist-extensions.css', // App-specific tokens
];

export type ThemeId = 'digdir' | 'altinn' | 'uutilsynet' | 'portal' | 'digilist';

/**
 * Theme CSS files. Can be single file (string) or multiple files (array).
 * Multiple files are loaded in order: base theme first, then extensions.
 */
export const THEMES: Record<ThemeId, string | string[]> = {
  digdir: OFFICIAL_THEMES.digdir,
  altinn: OFFICIAL_THEMES.altinn,
  uutilsynet: OFFICIAL_THEMES.uutilsynet,
  portal: OFFICIAL_THEMES.portal,
  digilist: DIGILIST_THEME,
};

/**
 * Get theme URLs as an array (for consistent handling).
 */
export function getThemeUrls(themeId: ThemeId): string[] {
  const theme = THEMES[themeId];
  return Array.isArray(theme) ? theme : [theme];
}

// DIGILIST is the default theme
export const DEFAULT_THEME: ThemeId = 'digilist';
