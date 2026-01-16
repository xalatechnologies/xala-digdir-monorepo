/**
 * Composed component examples
 *
 * This file exports all example implementations for composed components.
 * Composed components are higher-level components built from primitives,
 * providing common UI patterns and layouts.
 */

// Re-export all composed component examples
export * from './content-layout';
export * from './content-section';
export * from './page-header';

/**
 * Example metadata for documentation generation
 */
export const composedExampleList = [
  {
    name: 'ContentLayout',
    file: 'content-layout.tsx',
    description: 'High-level layout component for page content with grid integration',
    examples: [
      'BasicContentLayout',
      'CustomDimensionsLayout',
      'FluidContentLayout',
      'LayoutWithHeaderOffset',
      'GridContentLayout',
      'CompletePageLayout',
      'ResponsiveGridLayout'
    ]
  },
  {
    name: 'ContentSection',
    file: 'content-section.tsx',
    description: 'Section component for grouping related content with titles and semantic structure',
    examples: [
      'BasicContentSection',
      'ContentSectionWithSubtitle',
      'CustomHeadingLevel',
      'HorizontalContentSection',
      'CustomSpacing',
      'WithoutFieldset',
      'MultipleContentSections',
      'NestedContentSection'
    ]
  },
  {
    name: 'PageHeader',
    file: 'page-header.tsx',
    description: 'Consistent page header with title, subtitle, breadcrumb, and action buttons',
    examples: [
      'BasicPageHeader',
      'PageHeaderWithSubtitle',
      'PageHeaderWithActions',
      'PageHeaderWithBreadcrumb',
      'BorderedPageHeader',
      'CustomHeadingLevel',
      'CompletePageHeader',
      'PageHeaderInLayout',
      'PageHeaderWithActionGroups'
    ]
  }
] as const;
