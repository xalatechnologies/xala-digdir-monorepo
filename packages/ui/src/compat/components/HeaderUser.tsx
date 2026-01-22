/**
 * HeaderUser Component
 *
 * User avatar and dropdown menu in the header.
 */

import React, { useState } from 'react';
import { Button, Avatar, Popover } from '@digdir/designsystemet-react';
import { ChevronDownIcon } from '../icons';

export interface HeaderUserProps {
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
  menuItems?: React.ReactNode;
  onLogout?: () => void;
}

export function HeaderUser({
  userName,
  userEmail,
  avatarUrl,
  menuItems,
  onLogout,
}: HeaderUserProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  const initials = userName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Popover open={open} onClose={() => setOpen(false)}>
      <Popover.Trigger asChild>
        <Button
          variant="tertiary"
          data-size="sm"
          onClick={() => setOpen(!open)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.5rem',
          }}
        >
          <Avatar aria-label={userName || 'User'} initials={initials}>
            {avatarUrl && <img src={avatarUrl} alt={userName || 'User avatar'} />}
          </Avatar>
          {userName && <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</span>}
          <ChevronDownIcon />
        </Button>
      </Popover.Trigger>
      <div style={{ minWidth: '200px' }}>
        {userName && (
          <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>
            <div style={{ fontWeight: 500 }}>{userName}</div>
            {userEmail && <div style={{ fontSize: '0.875rem', color: 'var(--ds-color-neutral-text-subtle)' }}>{userEmail}</div>}
          </div>
        )}
        {menuItems}
        {onLogout && (
          <div style={{ padding: '0.5rem', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
            <Button variant="tertiary" data-size="sm" onClick={onLogout} style={{ width: '100%', justifyContent: 'flex-start' }}>
              Logg ut
            </Button>
          </div>
        )}
      </div>
    </Popover>
  );
}
