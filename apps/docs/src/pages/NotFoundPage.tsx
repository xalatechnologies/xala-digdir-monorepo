/**
 * NotFoundPage Component
 *
 * Displays a 404 error page for invalid routes.
 * Uses @xala/ds components exclusively per design system guardrails.
 */

import { Link } from 'react-router-dom';
import { Card, Heading, Paragraph, Button } from '@xala/ds';

export function NotFoundPage() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <Card
        style={{
          padding: 'var(--ds-spacing-8)',
          textAlign: 'center',
          maxWidth: '500px',
        }}
      >
        <Heading
          level={1}
          style={{
            fontSize: 'var(--ds-font-size-4xl)',
            marginBottom: 'var(--ds-spacing-4)',
          }}
        >
          404
        </Heading>
        <Heading
          level={2}
          style={{
            marginBottom: 'var(--ds-spacing-4)',
          }}
        >
          Page Not Found
        </Heading>
        <Paragraph
          style={{
            color: 'var(--ds-color-neutral-text-subtle)',
            marginBottom: 'var(--ds-spacing-6)',
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Check the URL or navigate back to the documentation home.
        </Paragraph>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Button type="button" variant="primary">
            Back to Documentation
          </Button>
        </Link>
      </Card>
    </div>
  );
}
