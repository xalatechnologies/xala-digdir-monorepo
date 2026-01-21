/**
 * Designsystemet CSS import.
 * 
 * This is the ONLY place in the monorepo that imports Designsystemet CSS.
 * All other imports should go through the @xalatechnologies/platform/ui facade to ensure
 * consistent styling and prevent duplicate CSS loading.
 * 
 * @example
 * ```typescript
 * import '@xalatechnologies/platform/ui/styles'; // Do this once in your application's entry point
 * ```
 */
import '@digdir/designsystemet-css/dist/src/index.css';
import '@digdir/designsystemet-css/dist/theme/designsystemet.css';

/**
 * Theme Loading Strategy:
 * 
 * We do NOT import a theme here to allow tenant runtime switching via a <link> tag.
 * Theme CSS URLs are provided by @xalatechnologies/platform/ui/themes, which enables dynamic theme
 * changes without page reloads or CSS conflicts.
 */
export {}; // keep this as a module
