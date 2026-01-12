export * from '@digdir/designsystemet-react';
export * from './provider';

/** 
 * CSS Import Policy:
 * 
 * We intentionally do NOT export Digdir CSS from this module. Applications
 * must import '@xala/ds/styles' exactly once in their entry point to ensure
 * proper theme switching and prevent CSS duplication.
 * 
 * @example
 * ```typescript
 * // In your main.tsx or app entry point
 * import '@xala/ds/styles';
 * 
 * // Then import components from here
 * import { Button, Card } from '@xala/ds';
 * ```
 */
