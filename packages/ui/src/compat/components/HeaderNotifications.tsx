/**
 * HeaderNotifications Component
 *
 * Notification bell with badge for unread count.
 */

import React from 'react';
import { Button, Badge } from '@digdir/designsystemet-react';
import { BellIcon } from '../icons';

export interface HeaderNotificationsProps {
  unreadCount?: number;
  onClick?: () => void;
  'aria-label'?: string;
}

export function HeaderNotifications({
  unreadCount = 0,
  onClick,
  'aria-label': ariaLabel = 'Varsler',
}: HeaderNotificationsProps): React.ReactElement {
  return (
    <div style={{ position: 'relative' }}>
      <Button
        variant="tertiary"
        data-size="sm"
        onClick={onClick}
        aria-label={ariaLabel}
        style={{ padding: '0.5rem' }}
      >
        <BellIcon />
      </Button>
      {unreadCount > 0 && (
        <Badge
          count={unreadCount}
          data-size="sm"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            transform: 'translate(25%, -25%)',
          }}
        />
      )}
    </div>
  );
}
