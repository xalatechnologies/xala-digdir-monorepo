/**
 * RequireAuthModal Component
 *
 * Modal prompting users to log in before performing an action.
 */

import React from 'react';
import { Dialog, Heading, Paragraph, Button } from '@digdir/designsystemet-react';

export interface RequireAuthModalProps {
  open: boolean;
  onClose: () => void;
  onLogin?: () => void;
  title?: string;
  message?: string;
}

export function RequireAuthModal({
  open,
  onClose,
  onLogin,
  title = 'Innlogging kreves',
  message = 'Du må logge inn for å utføre denne handlingen.',
}: RequireAuthModalProps): React.ReactElement {
  return (
    <Dialog open={open} onClose={onClose}>
      <Dialog.Block>
        <Heading level={2} data-size="sm">{title}</Heading>
        <Paragraph>{message}</Paragraph>
      </Dialog.Block>
      <Dialog.Block>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>Avbryt</Button>
          <Button variant="primary" onClick={onLogin}>Logg inn</Button>
        </div>
      </Dialog.Block>
    </Dialog>
  );
}
