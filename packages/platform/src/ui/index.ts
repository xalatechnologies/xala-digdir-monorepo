/**
 * @xalatechnologies/platform/ui
 * 
 * Unified Design System for the Xala Platform.
 * Built on @digdir/designsystemet-react with custom extensions.
 * 
 * ## Import Examples
 * 
 * ```tsx
 * // All components from single import
 * import { Button, Card, AppShell } from '@xalatechnologies/platform/ui';
 * 
 * // Or use subpath imports for smaller bundles
 * import { Button, Card } from '@xalatechnologies/platform/ui/primitives';
 * import { PageHeader } from '@xalatechnologies/platform/ui/composed';
 * import { AppShell } from '@xalatechnologies/platform/ui/shells';
 * ```
 */

// =============================================================================
// Primitives - Base components (icons, container, grid, etc.)
// Also re-exports all @digdir/designsystemet-react components
// =============================================================================
export * from './primitives';

// =============================================================================
// Provider & Theme
// =============================================================================
export { DesignsystemetProvider } from './provider';
export type { DesignsystemetProviderProps, ColorScheme, DsSize, Typography } from './provider';
export { ThemeProvider, useTheme } from './ThemeProvider';
export type { ThemeProviderProps, ThemeContextValue } from './ThemeProvider';

// =============================================================================
// Composed Components (selective exports to avoid conflicts)
// =============================================================================
export {
  ContentLayout,
  FormSection,
  FormActions,
  GlobalSearch,
  LanguageSwitcher,
  HeaderSearch,
  UserMenu,
  ConfirmDialog,
  DataTable,
  FilterPanel,
  DialogProvider,
  useDialog,
} from './composed';

// =============================================================================
// Blocks - Business logic components
// =============================================================================
export * from './blocks';

// =============================================================================
// Shells - Application shells
// =============================================================================
export * from './shells';

// =============================================================================
// Pages - Full page layouts
// =============================================================================  
export * from './pages';

// =============================================================================
// Patterns - High-level platform-specific components
// =============================================================================
export * from './patterns';

// =============================================================================
// Themes - Theme utilities
// =============================================================================
export * from './themes';

// =============================================================================
// Utilities
// =============================================================================
export { cn } from './utils';
