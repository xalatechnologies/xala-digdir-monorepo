/**
 * @xalatechnologies/platform/ui
 *
 * UI component layer providing a facade over @digdir/designsystemet-react
 * with additional composed components, business blocks, and application shells.
 *
 * Component Hierarchy:
 * 1. Primitives - Re-exported Designsystemet components
 * 2. Composed - Custom mid-level components built from primitives
 * 3. Shells - Application-level layouts
 * 4. Blocks - Business domain components
 * 5. Themes - Theme configuration and utilities
 *
 * @example
 * ```tsx
 * import { Button, Card, Grid, AppShell } from '@xalatechnologies/platform/ui';
 *
 * function MyApp() {
 *   return (
 *     <AppShell>
 *       <Grid columns={3}>
 *         <Card>
 *           <Button>Click me</Button>
 *         </Card>
 *       </Grid>
 *     </AppShell>
 *   );
 * }
 * ```
 */

// Re-export all UI sub-modules
export * from './primitives';
export * from './composed';
export * from './shells';
export * from './blocks';
export * from './patterns';
export * from './themes';
