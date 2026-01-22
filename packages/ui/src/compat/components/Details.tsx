/**
 * Details Component
 *
 * Expandable details section.
 */

import React, { useState } from 'react';

export interface DetailsProps {
  summary: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
}

export function Details({ summary, children, open: initialOpen = false }: DetailsProps): React.ReactElement {
  const [open, setOpen] = useState(initialOpen);

  return (
    <details
      open={open}
      style={{
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-md)',
        overflow: 'hidden',
      }}
    >
      <summary
        onClick={(e) => {
          e.preventDefault();
          setOpen(!open);
        }}
        style={{
          padding: '1rem',
          cursor: 'pointer',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          fontWeight: 500,
        }}
      >
        {summary}
      </summary>
      <div style={{ padding: '1rem', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
        {children}
      </div>
    </details>
  );
}
