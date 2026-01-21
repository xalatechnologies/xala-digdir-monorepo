/**
 * HelpSection Component
 *
 * A section wrapper for help content that ties into the TOC.
 * Automatically creates anchor targets for smooth scrolling.
 */
import * as React from 'react';
import { Heading, Paragraph, Card } from '@xalatechnologies/platform/ui';
import { useAuth } from '@xalatechnologies/platform/auth';
import { useT } from '@xalatechnologies/platform/i18n';

// =============================================================================
// Types
// =============================================================================

export interface HelpSectionProps {
  /** Section ID for anchor linking */
  id: string;
  /** Section title */
  title: string;
  /** Optional description */
  description?: string;
  /** Roles that can see this section. Empty = all roles */
  roles?: string[];
  /** Use card wrapper */
  card?: boolean;
  /** Child content */
  children: React.ReactNode;
}

// =============================================================================
// Component
// =============================================================================

export function HelpSection({
  id,
  title,
  description,
  roles = [],
  card = false,
  children,
}: HelpSectionProps): React.ReactElement | null {
  const t = useT();
  const { data: session } = useAuth();
  const userRole = session?.user?.role ?? 'org_member';

  // Check role-based visibility
  if (roles.length > 0 && !roles.includes(userRole)) {
    return null;
  }

  const content = (
    <>
      <Heading
        level={2}
        data-size="sm"
        id={id}
        style={{
          marginBottom: 'var(--ds-spacing-2)',
          scrollMarginTop: 'var(--ds-spacing-6)',
        }}
      >
        {title}
      </Heading>
      {description && (
        <Paragraph
          data-size="sm"
          style={{
            color: 'var(--ds-color-neutral-text-subtle)',
            marginBottom: 'var(--ds-spacing-4)',
          }}
        >
          {description}
        </Paragraph>
      )}
      {children}
    </>
  );

  if (card) {
    return (
      <Card style={{ padding: 'var(--ds-spacing-6)', marginBottom: 'var(--ds-spacing-6)' }}>
        {content}
      </Card>
    );
  }

  return <section style={{ marginBottom: 'var(--ds-spacing-8)' }}>{content}</section>;
}

// =============================================================================
// Sub-components
// =============================================================================

export interface HelpStepListProps {
  steps: string[];
}

export function HelpStepList({ steps }: HelpStepListProps): React.ReactElement {
  return (
    <ol
      style={{
        paddingLeft: 'var(--ds-spacing-6)',
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-3)',
      }}
    >
      {steps.map((step, index) => (
        <li
          key={index}
          style={{
            color: 'var(--ds-color-neutral-text-default)',
            fontSize: 'var(--ds-font-size-sm)',
          }}
        >
          {step}
        </li>
      ))}
    </ol>
  );
}

export interface HelpFAQItemProps {
  question: string;
  answer: string;
  /** Roles that can see this FAQ. Empty = all roles */
  roles?: string[];
}

export function HelpFAQItem({ question, answer, roles = [] }: HelpFAQItemProps): React.ReactElement | null {
  const { data: session } = useAuth();
  const userRole = session?.user?.role ?? 'org_member';

  // Check role-based visibility
  if (roles.length > 0 && !roles.includes(userRole)) {
    return null;
  }

  return (
    <details
      style={{
        borderRadius: 'var(--ds-border-radius-md)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        overflow: 'hidden',
      }}
    >
      <summary
        style={{
          padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
          cursor: 'pointer',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          fontWeight: 'var(--ds-font-weight-medium)',
          fontSize: 'var(--ds-font-size-sm)',
          listStyle: 'none',
        }}
      >
        {question}
      </summary>
      <div
        style={{
          padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <Paragraph data-size="sm" style={{ margin: 0 }}>
          {answer}
        </Paragraph>
      </div>
    </details>
  );
}

export interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps): React.ReactElement {
  const roleLabels: Record<string, { label: string; color: string }> = {
    admin: { label: 'Admin', color: 'var(--ds-color-danger-base-default)' },
    tenant_admin: { label: t('common.leietaker_admin'), color: 'var(--ds-color-warning-base-default)' },
    org_admin: { label: 'Org Admin', color: 'var(--ds-color-info-base-default)' },
    org_member: { label: 'Medlem', color: 'var(--ds-color-success-base-default)' },
  };

  const config = roleLabels[role] ?? { label: role, color: 'var(--ds-color-neutral-base-default)' };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
        borderRadius: 'var(--ds-border-radius-sm)',
        backgroundColor: config.color,
        color: 'white',
        fontSize: 'var(--ds-font-size-xs)',
        fontWeight: 'var(--ds-font-weight-medium)',
      }}
    >
      {config.label}
    </span>
  );
}

export default HelpSection;
