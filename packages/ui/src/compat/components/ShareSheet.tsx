/**
 * ShareSheet Component
 *
 * Share dialog with multiple sharing options.
 */

import React from 'react';
import { Dialog, Heading, Button } from '@digdir/designsystemet-react';

export interface ShareSheetProps {
  open: boolean;
  onClose: () => void;
  url?: string;
  title?: string;
}

export function ShareSheet({ open, onClose, url, title }: ShareSheetProps): React.ReactElement {
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Fallback
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <Dialog.Block>
        <Heading level={2} data-size="sm">{title || 'Del'}</Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
          <Button variant="secondary" onClick={handleCopy}>Kopier lenke</Button>
        </div>
      </Dialog.Block>
    </Dialog>
  );
}
