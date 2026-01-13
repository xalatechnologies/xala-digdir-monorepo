/**
 * RulesTab Component
 *
 * Displays listing rules and regulations in structured sections.
 */

import * as React from 'react';
import { Heading, Paragraph, Details } from '@digdir/designsystemet-react';
import type { Rule, ListingType } from '../types';
import { createPresenter } from '../presenters/listingTypePresenter';

// =============================================================================
// Icons
// =============================================================================

function AlertIcon(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function ShieldIcon(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CleaningIcon(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
      <path d="M13 13l6 6" />
    </svg>
  );
}

function CalendarIcon(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

const categoryIcons: Record<string, React.ComponentType> = {
  general: AlertIcon,
  cancellation: CalendarIcon,
  safety: ShieldIcon,
  cleaning: CleaningIcon,
  noise: AlertIcon,
  other: AlertIcon,
};

// =============================================================================
// Props
// =============================================================================

export interface RulesTabProps {
  rules: Rule[];
  listingType: ListingType;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function RulesTab({
  rules,
  listingType,
  className,
}: RulesTabProps): React.ReactElement {
  const presenter = React.useMemo(() => createPresenter(listingType), [listingType]);

  if (rules.length === 0) {
    return (
      <div
        className={className}
        style={{
          textAlign: 'center',
          padding: 'var(--ds-spacing-8)',
          color: 'var(--ds-color-neutral-text-subtle)',
        }}
      >
        <AlertIcon />
        <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-4)', fontStyle: 'italic' }}>
          {presenter.getEmptyState('rules')}
        </Paragraph>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-4)',
      }}
    >
      <Heading level={2} data-size="sm" style={{ margin: 0 }}>
        Regler og retningslinjer
      </Heading>

      <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
        Les gjennom følgende regler og retningslinjer før du booker.
      </Paragraph>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
        {rules.map((rule: Rule) => {
          const IconComponent = categoryIcons[rule.category || 'other'] || AlertIcon;

          return (
            <Details key={rule.id}>
              <Details.Summary>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                  <IconComponent />
                  {rule.title}
                </span>
              </Details.Summary>
              <Details.Content>
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    lineHeight: 'var(--ds-font-line-height-default)',
                  }}
                >
                  {rule.content}
                </Paragraph>
              </Details.Content>
            </Details>
          );
        })}
      </div>
    </div>
  );
}

export default RulesTab;
