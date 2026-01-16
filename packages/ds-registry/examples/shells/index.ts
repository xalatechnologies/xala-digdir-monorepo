/**
 * Shells component examples
 *
 * This file exports all example implementations for shells components.
 * Shells components are application-level layout components that provide
 * the overall structure for your application (header, footer, main content).
 */

// Re-export all shells component examples
export * from './app-shell';

/**
 * Example metadata for documentation generation
 */
export const shellsExampleList = [
  {
    name: 'AppShell',
    file: 'app-shell.tsx',
    description: 'Complete application shell with header, footer, and content areas',
    examples: [
      'BasicAppShell',
      'AppShellWithHeader',
      'AppShellWithFooter',
      'CompleteAppShell',
      'FluidAppShell',
      'CustomMaxWidthAppShell',
      'CustomBackgroundAppShell',
      'DashboardAppShell'
    ]
  }
] as const;
