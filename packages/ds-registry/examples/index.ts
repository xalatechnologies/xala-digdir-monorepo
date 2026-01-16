/**
 * Example implementations for Designsystemet patterns and usage.
 *
 * This file exports all example components that demonstrate proper
 * usage of Designsystemet components and patterns.
 */

// Re-export all examples
export * from './provider-usage';
export * from './asChild-pattern';
export * from './theme-switching';

// Re-export composed component examples
export * from './composed';

// Re-export blocks component examples
export * from './blocks';

// Re-export shells component examples
export * from './shells';

/**
 * Example metadata for documentation generation
 */
export const exampleList = [
  {
    id: 'provider-usage',
    title: 'Provider Usage',
    description: 'Correct setup of DesignsystemetProvider and data attributes',
    file: 'provider-usage.tsx',
  },
  {
    id: 'asChild-pattern',
    title: 'asChild Pattern',
    description: 'Using asChild to render components as different elements',
    file: 'asChild-pattern.tsx',
  },
  {
    id: 'theme-switching',
    title: 'Theme Switching',
    description: 'Runtime theme switching with provider and programmatic control',
    file: 'theme-switching.tsx',
  },
  {
    id: 'composed',
    title: 'Composed Components',
    description: 'Higher-level components built from primitives (ContentLayout, ContentSection, PageHeader)',
    file: 'composed/',
  },
  {
    id: 'blocks',
    title: 'Blocks Components',
    description: 'Business-logic components for domain-specific UI patterns (ListingCard, BookingFormModal)',
    file: 'blocks/',
  },
  {
    id: 'shells',
    title: 'Shells Components',
    description: 'Application-level layout components (AppShell)',
    file: 'shells/',
  },
] as const;
