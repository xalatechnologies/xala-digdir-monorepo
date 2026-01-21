/**
 * Architecture Page
 *
 * System architecture documentation.
 * Platform-only - no @digilist/* imports.
 */

import { Heading, Paragraph, Card, Tag } from '@xalatechnologies/platform/ui';
import { useT } from '@xala/i18n';

interface ArchLayer {
  name: string;
  description: string;
  packages: string[];
  color: string;
}

const ARCHITECTURE_LAYERS: ArchLayer[] = [
  {
    name: 'Frontend Applications',
    description: 'User-facing React applications built with Vite',
    packages: ['apps/web', 'apps/minside', 'apps/backoffice', 'apps/saas-admin', 'apps/monitoring', 'apps/docs-learning', 'apps/docs-global'],
    color: 'info',
  },
  {
    name: 'Domain SDK',
    description: 'Domain-specific client SDK with typed services and React Query hooks',
    packages: ['@digilist/client-sdk', '@digilist/database-schema'],
    color: 'success',
  },
  {
    name: 'Platform Packages',
    description: 'Domain-agnostic shared packages',
    packages: ['@xalatechnologies/platform/ui', '@xala/i18n', '@xala/auth', '@xala/runtime', '@xala/config', '@xala/sdk-core', '@xala/contracts'],
    color: 'warning',
  },
  {
    name: 'API Server',
    description: 'Fastify backend with PostgreSQL and Drizzle ORM',
    packages: ['apps/api'],
    color: 'accent',
  },
];

const DESIGN_PRINCIPLES = [
  {
    title: 'SDK-First',
    description: 'All data fetching goes through the SDK. No direct API calls in applications.',
  },
  {
    title: 'Contract-First',
    description: 'Zod schemas define the contract between frontend and backend.',
  },
  {
    title: 'Audit-First',
    description: 'All mutations are logged for compliance and debugging.',
  },
  {
    title: 'RBAC Enforcement',
    description: 'Role-based access control is enforced at API level, not UI level.',
  },
  {
    title: 'Multi-Tenancy',
    description: 'Complete data isolation between tenants at the database level.',
  },
  {
    title: 'Design Token Compliance',
    description: 'All UI uses Designsystemet tokens via @xalatechnologies/platform/ui facade.',
  },
];

export function ArchitecturePage() {
  const t = useT();

  return (
    <div style={{ padding: 'var(--ds-spacing-6)', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: 'var(--ds-spacing-8)' }}>
        <Heading level={1} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.architecture.title') || 'Architecture'}
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('docs.architecture.description') ||
            'Overview of the Xala Platform architecture, monorepo structure, and design decisions.'}
        </Paragraph>
      </header>

      {/* Monorepo Overview */}
      <section style={{ marginBottom: 'var(--ds-spacing-8)' }}>
        <Heading level={2} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.architecture.monorepo') || 'Monorepo Structure'}
        </Heading>
        <Paragraph style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.architecture.monorepoDescription') ||
            'The platform is organized as a Turborepo monorepo with pnpm workspaces:'}
        </Paragraph>
        <pre>
          <code>{`xala-digdir-monorepo/
├── apps/                    # Applications (7 total)
│   ├── web/                 # Public web app (:5173)
│   ├── minside/             # User portal (:5174)
│   ├── backoffice/          # Admin portal (:5175)
│   ├── saas-admin/          # SaaS admin (:5177)
│   ├── monitoring/          # System monitoring (:5178)
│   ├── docs-learning/       # Learning docs (:5179)
│   ├── docs-global/         # Global docs (:5180)
│   └── api/                 # Fastify API (:4000)
│
├── packages/                # Shared packages (14+)
│   ├── client-sdk/          # Domain SDK
│   ├── contracts/           # API contracts (Zod)
│   ├── sdk-core/            # SDK primitives
│   ├── database-schema/     # Drizzle ORM
│   ├── ds/                  # Design System
│   ├── i18n/                # Internationalization
│   ├── auth/                # Authentication
│   ├── runtime/             # Runtime providers
│   ├── config/              # Configuration
│   └── ...
│
├── infra/                   # Infrastructure
└── docs/                    # Documentation`}</code>
        </pre>
      </section>

      {/* Architecture Layers */}
      <section style={{ marginBottom: 'var(--ds-spacing-8)' }}>
        <Heading level={2} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.architecture.layers') || 'Architecture Layers'}
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {ARCHITECTURE_LAYERS.map((layer, index) => (
            <Card key={index} style={{ padding: 'var(--ds-spacing-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-2)' }}>
                <Tag color={layer.color as 'info' | 'success' | 'warning'} size="sm">
                  Layer {ARCHITECTURE_LAYERS.length - index}
                </Tag>
                <Heading level={4} style={{ margin: 0 }}>
                  {layer.name}
                </Heading>
              </div>
              <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                {layer.description}
              </Paragraph>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
                {layer.packages.map((pkg) => (
                  <code
                    key={pkg}
                    style={{
                      padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                      backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                      borderRadius: 'var(--ds-border-radius-sm)',
                      fontSize: '0.85em',
                    }}
                  >
                    {pkg}
                  </code>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Design Principles */}
      <section style={{ marginBottom: 'var(--ds-spacing-8)' }}>
        <Heading level={2} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.architecture.principles') || 'Design Principles'}
        </Heading>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--ds-spacing-4)',
          }}
        >
          {DESIGN_PRINCIPLES.map((principle, index) => (
            <Card key={index} style={{ padding: 'var(--ds-spacing-4)' }}>
              <Heading level={4} style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                {principle.title}
              </Heading>
              <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                {principle.description}
              </Paragraph>
            </Card>
          ))}
        </div>
      </section>

      {/* Data Flow */}
      <section style={{ marginBottom: 'var(--ds-spacing-8)' }}>
        <Heading level={2} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.architecture.dataFlow') || 'Data Flow'}
        </Heading>
        <pre>
          <code>{`┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (React)                                           │
│  - apps/web, apps/backoffice, apps/minside                  │
│  - Orchestration only, no business logic                    │
│  - Uses SDK hooks for data                                  │
├─────────────────────────────────────────────────────────────┤
│  SDK (@digilist/client-sdk)                                 │
│  - 30+ typed services                                       │
│  - React Query hooks                                        │
│  - WebSocket realtime client                                │
│  - RFC 7807 error handling                                  │
├─────────────────────────────────────────────────────────────┤
│  API (Fastify)                                              │
│  - Business logic                                           │
│  - Persistence (Drizzle/Postgres)                           │
│  - Audit logging                                            │
│  - Multi-tenant isolation                                   │
└─────────────────────────────────────────────────────────────┘`}</code>
        </pre>
      </section>

      {/* Import Rules */}
      <section>
        <Heading level={2} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {t('docs.architecture.importRules') || 'Import Rules'}
        </Heading>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <pre style={{ margin: 0 }}>
            <code>{`// ✅ CORRECT - Apps import from facades
import { Button } from '@xalatechnologies/platform/ui';
import { useListings } from '@digilist/client-sdk/hooks';
import { useT } from '@xala/i18n';

// ❌ WRONG - Direct imports forbidden
import { Button } from '@${'digdir'}/designsystemet-react';
import axios from 'axios';`}</code>
          </pre>
        </Card>
      </section>
    </div>
  );
}

export default ArchitecturePage;
