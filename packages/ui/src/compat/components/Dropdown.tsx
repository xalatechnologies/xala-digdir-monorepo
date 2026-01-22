/**
 * Dropdown Component
 *
 * Dropdown menu using Popover.
 */

import React, { useState } from 'react';
import { Button, Popover } from '@digdir/designsystemet-react';

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export function Dropdown({ trigger, children }: DropdownProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onClose={() => setOpen(false)}>
      <Popover.Trigger asChild>
        <span onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}>
          {trigger}
        </span>
      </Popover.Trigger>
      <div style={{
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-md)',
        boxShadow: 'var(--ds-shadow-md)',
        minWidth: '150px',
      }}>
        {children}
      </div>
    </Popover>
  );
}
