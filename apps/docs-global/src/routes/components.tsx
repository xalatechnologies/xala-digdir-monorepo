/**
 * Components Page
 *
 * Design system component library documentation.
 * Platform-only - no @digilist/* imports.
 */

import { useState } from 'react';
import {
  Heading,
  Paragraph,
  Card,
  Button,
  Tag,
  Tabs,
  TabItem,
  Input,
  Checkbox,
  Radio,
  Badge,
  Avatar,
  Spinner,
} from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';

interface ComponentInfo {
  name: string;
  category: 'primitives' | 'composed' | 'blocks' | 'shells';
  description: string;
}

const COMPONENTS: ComponentInfo[] = [
  // Primitives
  { name: 'Button', category: 'primitives', description: 'Primary action element with variants' },
  { name: 'Input', category: 'primitives', description: 'Text input field with validation' },
  { name: 'Select', category: 'primitives', description: 'Dropdown selection' },
  { name: 'Checkbox', category: 'primitives', description: 'Boolean toggle input' },
  { name: 'Radio', category: 'primitives', description: 'Single selection from options' },
  { name: 'Card', category: 'primitives', description: 'Container for related content' },
  { name: 'Badge', category: 'primitives', description: 'Status indicator' },
  { name: 'Tag', category: 'primitives', description: 'Categorization label' },
  { name: 'Avatar', category: 'primitives', description: 'User profile image' },
  { name: 'Spinner', category: 'primitives', description: 'Loading indicator' },
  { name: 'Heading', category: 'primitives', description: 'Typography heading levels' },
  { name: 'Paragraph', category: 'primitives', description: 'Body text element' },

  // Composed
  { name: 'Tabs', category: 'composed', description: 'Tabbed navigation interface' },
  { name: 'Modal', category: 'composed', description: 'Dialog overlay' },
  { name: 'Drawer', category: 'composed', description: 'Slide-in panel' },
  { name: 'Accordion', category: 'composed', description: 'Expandable sections' },
  { name: 'Table', category: 'composed', description: 'Data grid display' },
  { name: 'Pagination', category: 'composed', description: 'Page navigation' },
  { name: 'BottomNavigation', category: 'composed', description: 'Mobile navigation bar' },
  { name: 'NavigationMenu', category: 'composed', description: 'Desktop navigation' },

  // Blocks
  { name: 'StatsGrid', category: 'blocks', description: 'KPI metrics display' },
  { name: 'KPICard', category: 'blocks', description: 'Single metric card' },
  { name: 'FilterBar', category: 'blocks', description: 'Search and filter controls' },
  { name: 'ErrorBoundary', category: 'blocks', description: 'Error handling wrapper' },

  // Shells
  { name: 'AppShell', category: 'shells', description: 'Complete application layout' },
  { name: 'DashboardContent', category: 'shells', description: 'Dashboard page wrapper' },
  { name: 'ContentLayout', category: 'shells', description: 'Content area layout' },
];

const CATEGORIES = ['primitives', 'composed', 'blocks', 'shells'] as const;

export function ComponentsPage() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<string>('primitives');

  return (
    <div style={{ padding: 'var(--ds-spacing-6)', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: 'var(--ds-spacing-8)' }}>
        <Heading level={1} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.components.title') || 'Component Library'}
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('docs.components.description') ||
            'Browse the Xala Design System components. All components are based on Digdir Designsystemet and accessible via @xalatechnologies/platform/ui.'}
        </Paragraph>
      </header>

      {/* Import Instructions */}
      <Card
        style={{
          padding: 'var(--ds-spacing-4)',
          marginBottom: 'var(--ds-spacing-6)',
          backgroundColor: 'var(--ds-color-info-surface-default)',
        }}
      >
        <Heading level={4} style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {t('docs.components.howToImport') || 'How to Import'}
        </Heading>
        <pre style={{ margin: 0 }}>
          <code>{`// Import from @xalatechnologies/platform/ui (NEVER from @digdir/* directly)
import { Button, Card, Heading } from '@xalatechnologies/platform/ui';`}</code>
        </pre>
      </Card>

      {/* Live Examples */}
      <section style={{ marginBottom: 'var(--ds-spacing-8)' }}>
        <Heading level={2} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.components.liveExamples') || 'Live Examples'}
        </Heading>
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-4)', alignItems: 'center', marginBottom: 'var(--ds-spacing-6)' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="tertiary">Tertiary</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-4)', alignItems: 'center', marginBottom: 'var(--ds-spacing-6)' }}>
            <Badge color="info">Info</Badge>
            <Badge color="success">Success</Badge>
            <Badge color="warning">Warning</Badge>
            <Badge color="danger">Danger</Badge>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-4)', alignItems: 'center', marginBottom: 'var(--ds-spacing-6)' }}>
            <Tag color="info" size="sm">Info Tag</Tag>
            <Tag color="success" size="sm">Success Tag</Tag>
            <Tag color="warning" size="sm">Warning Tag</Tag>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-4)', alignItems: 'center', marginBottom: 'var(--ds-spacing-6)' }}>
            <Avatar name="John Doe" size="sm" />
            <Avatar name="Jane Smith" size="md" />
            <Avatar name="Bob Wilson" size="lg" />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-4)', alignItems: 'center', marginBottom: 'var(--ds-spacing-6)' }}>
            <Input placeholder="Text input" style={{ maxWidth: '200px' }} />
            <Checkbox label="Checkbox" />
            <Radio name="example" label="Radio" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
        </Card>
      </section>

      {/* Component Categories */}
      <section>
        <Heading level={2} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.components.allComponents') || 'All Components'}
        </Heading>

        <Tabs value={activeTab} onChange={setActiveTab}>
          {CATEGORIES.map((category) => {
            const categoryComponents = COMPONENTS.filter((c) => c.category === category);
            const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

            return (
              <TabItem key={category} value={category} label={`${categoryLabel} (${categoryComponents.length})`}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: 'var(--ds-spacing-4)',
                    padding: 'var(--ds-spacing-4) 0',
                  }}
                >
                  {categoryComponents.map((component) => (
                    <Card key={component.name} style={{ padding: 'var(--ds-spacing-4)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-2)' }}>
                        <code style={{ fontWeight: 600 }}>{component.name}</code>
                      </div>
                      <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {component.description}
                      </Paragraph>
                    </Card>
                  ))}
                </div>
              </TabItem>
            );
          })}
        </Tabs>
      </section>

      {/* Design Tokens */}
      <section style={{ marginTop: 'var(--ds-spacing-8)' }}>
        <Heading level={2} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.components.designTokens') || 'Design Tokens'}
        </Heading>
        <Paragraph style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.components.tokensDescription') ||
            'All components use design tokens from Designsystemet. Use CSS custom properties for consistent styling:'}
        </Paragraph>
        <pre>
          <code>{`/* Colors */
var(--ds-color-accent-text-default)
var(--ds-color-neutral-surface-default)
var(--ds-color-info-surface-default)
var(--ds-color-success-text-default)
var(--ds-color-warning-surface-default)
var(--ds-color-danger-text-default)

/* Spacing */
var(--ds-spacing-1)  /* 4px */
var(--ds-spacing-2)  /* 8px */
var(--ds-spacing-3)  /* 12px */
var(--ds-spacing-4)  /* 16px */
var(--ds-spacing-6)  /* 24px */
var(--ds-spacing-8)  /* 32px */

/* Border Radius */
var(--ds-border-radius-sm)
var(--ds-border-radius-md)
var(--ds-border-radius-lg)

/* Typography */
var(--ds-font-size-sm)
var(--ds-font-size-md)
var(--ds-font-size-lg)
var(--ds-font-weight-regular)
var(--ds-font-weight-medium)
var(--ds-font-weight-bold)`}</code>
        </pre>
      </section>
    </div>
  );
}

export default ComponentsPage;
