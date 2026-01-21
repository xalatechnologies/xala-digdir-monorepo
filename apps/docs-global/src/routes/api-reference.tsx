/**
 * API Reference Page
 *
 * Documentation for all API endpoints.
 * Platform-only - no @digilist/* imports.
 */

import { Heading, Paragraph, Card, Tag, Tabs, TabItem } from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  category: string;
}

const API_ENDPOINTS: ApiEndpoint[] = [
  // Authentication
  { method: 'POST', path: '/api/auth/login', description: 'Authenticate user with credentials', category: 'auth' },
  { method: 'POST', path: '/api/auth/logout', description: 'End user session', category: 'auth' },
  { method: 'GET', path: '/api/auth/session', description: 'Get current session info', category: 'auth' },
  { method: 'POST', path: '/api/auth/refresh', description: 'Refresh access token', category: 'auth' },

  // Organizations
  { method: 'GET', path: '/api/organizations', description: 'List all organizations', category: 'organizations' },
  { method: 'GET', path: '/api/organizations/:id', description: 'Get organization by ID', category: 'organizations' },
  { method: 'POST', path: '/api/organizations', description: 'Create new organization', category: 'organizations' },
  { method: 'PATCH', path: '/api/organizations/:id', description: 'Update organization', category: 'organizations' },

  // Users
  { method: 'GET', path: '/api/users', description: 'List all users', category: 'users' },
  { method: 'GET', path: '/api/users/:id', description: 'Get user by ID', category: 'users' },
  { method: 'PATCH', path: '/api/users/:id', description: 'Update user profile', category: 'users' },

  // Audit
  { method: 'GET', path: '/api/audit', description: 'Query audit logs', category: 'audit' },
  { method: 'GET', path: '/api/audit/:id', description: 'Get audit log entry', category: 'audit' },
];

const METHOD_COLORS: Record<string, string> = {
  GET: 'info',
  POST: 'success',
  PUT: 'warning',
  PATCH: 'warning',
  DELETE: 'danger',
};

const CATEGORIES = ['auth', 'organizations', 'users', 'audit'];

export function ApiReferencePage() {
  const t = useT();

  return (
    <div style={{ padding: 'var(--ds-spacing-6)', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: 'var(--ds-spacing-8)' }}>
        <Heading level={1} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.apiReference.title') || 'API Reference'}
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('docs.apiReference.description') ||
            'Complete reference documentation for all API endpoints. All endpoints follow REST conventions and return JSON responses.'}
        </Paragraph>
      </header>

      {/* Base URL Info */}
      <Card
        style={{
          padding: 'var(--ds-spacing-4)',
          marginBottom: 'var(--ds-spacing-6)',
          backgroundColor: 'var(--ds-color-info-surface-default)',
        }}
      >
        <Heading level={4} style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {t('docs.apiReference.baseUrl') || 'Base URL'}
        </Heading>
        <code style={{ fontSize: '1.1em' }}>https://api.digilist.no</code>
      </Card>

      {/* Authentication Section */}
      <section style={{ marginBottom: 'var(--ds-spacing-8)' }}>
        <Heading level={2} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.apiReference.authentication') || 'Authentication'}
        </Heading>
        <Paragraph style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.apiReference.authDescription') ||
            'All authenticated endpoints require a valid session cookie. Obtain one by logging in via the /api/auth/login endpoint or through BankID/ID-porten OAuth flow.'}
        </Paragraph>
        <pre>
          <code>{`// Example: Include credentials in requests
fetch('https://api.digilist.no/api/users', {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
});`}</code>
        </pre>
      </section>

      {/* Endpoints by Category */}
      <Tabs>
        {CATEGORIES.map((category) => {
          const categoryEndpoints = API_ENDPOINTS.filter((e) => e.category === category);
          return (
            <TabItem key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--ds-spacing-3)',
                  padding: 'var(--ds-spacing-4) 0',
                }}
              >
                {categoryEndpoints.map((endpoint, index) => (
                  <Card
                    key={index}
                    style={{
                      padding: 'var(--ds-spacing-4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--ds-spacing-4)',
                    }}
                  >
                    <Tag
                      color={METHOD_COLORS[endpoint.method] as 'info' | 'success' | 'warning' | 'danger'}
                      size="sm"
                      style={{ minWidth: '60px', textAlign: 'center' }}
                    >
                      {endpoint.method}
                    </Tag>
                    <code style={{ fontWeight: 500 }}>{endpoint.path}</code>
                    <Paragraph
                      data-size="sm"
                      style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', flex: 1 }}
                    >
                      {endpoint.description}
                    </Paragraph>
                  </Card>
                ))}
              </div>
            </TabItem>
          );
        })}
      </Tabs>

      {/* Error Handling */}
      <section style={{ marginTop: 'var(--ds-spacing-8)' }}>
        <Heading level={2} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.apiReference.errorHandling') || 'Error Handling'}
        </Heading>
        <Paragraph style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.apiReference.errorDescription') ||
            'All errors follow RFC 7807 Problem Details format:'}
        </Paragraph>
        <pre>
          <code>{`{
  "type": "https://api.digilist.no/problems/not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "The requested resource could not be found.",
  "instance": "/api/users/123"
}`}</code>
        </pre>
      </section>
    </div>
  );
}

export default ApiReferencePage;
