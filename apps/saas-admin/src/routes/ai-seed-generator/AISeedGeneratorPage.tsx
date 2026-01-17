/**
 * AI Seed Generator Page - Placeholder
 *
 * This feature is temporarily disabled pending proper Tabs component implementation.
 * The AI seed generator functionality is still available via API.
 */

import { Heading, Paragraph, Card, Alert } from '@xala/ds';
import { useT } from '@xala/i18n';

export function AISeedGeneratorPage() {
  const t = useT();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--ds-spacing-8)' }}>
      <Card style={{ padding: 'var(--ds-spacing-6)' }}>
        <Heading level={1} data-size="lg" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('saasAdmin.aiSeed.title')}
        </Heading>

        <Alert severity="info" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            Feature Under Development
          </Heading>
          <Paragraph>
            The AI Seed Generator UI is currently being refactored to use the latest design system components.
            In the meantime, you can use the API directly to generate seed data.
          </Paragraph>
        </Alert>

        <div style={{ marginTop: 'var(--ds-spacing-6)' }}>
          <Heading level={2} data-size="md" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
            API Usage
          </Heading>
          <Paragraph style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            Use the following API endpoint to generate seed data:
          </Paragraph>
          <pre
            style={{
              padding: 'var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
              borderRadius: 'var(--ds-border-radius-md)',
              overflow: 'auto',
              fontSize: 'var(--ds-font-size-sm)',
            }}
          >
            {`POST /api/admin/ai-seed-generator
{
  "entityType": "rental_objects",
  "count": 10,
  "tenantId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}`}
          </pre>
        </div>
      </Card>
    </div>
  );
}
