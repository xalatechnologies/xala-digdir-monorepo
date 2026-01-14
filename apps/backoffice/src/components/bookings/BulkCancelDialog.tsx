/**
 * Bulk Cancel Dialog Component
 * Dialog for bulk cancellation of bookings with required reason field
 */

import { useState } from 'react';
import {
  Dialog,
  Button,
  Heading,
  Paragraph,
  Alert,
} from '@xala/ds';

interface BulkCancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  selectedCount: number;
}

export function BulkCancelDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
}: BulkCancelDialogProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // Validate reason field
    if (!reason.trim()) {
      setError('Begrunnelse er påkrevd');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Begrunnelse må være minst 10 tegn');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(reason.trim());
      // Reset form on success
      setReason('');
      onClose();
    } catch (err) {
      setError('Kunne ikke avbryte bookinger. Vennligst prøv igjen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <Dialog.Block>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Avbryt {selectedCount} booking{selectedCount !== 1 ? 'er' : ''}
        </Heading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {/* Warning Alert */}
          <Alert severity="warning">
            Du er i ferd med å avbryte {selectedCount} booking{selectedCount !== 1 ? 'er' : ''}. Denne handlingen kan ikke angres.
            Brukerne vil bli varslet om avbestillingen.
          </Alert>

          {/* Reason field */}
          <div>
            <label
              htmlFor="cancel-reason"
              style={{
                display: 'block',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                marginBottom: 'var(--ds-spacing-1)',
              }}
            >
              Begrunnelse *
            </label>
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                marginBottom: 'var(--ds-spacing-2)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              Forklar hvorfor bookingene avbrytes. Dette vil være synlig for brukerne.
            </Paragraph>
            <textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(null);
              }}
              placeholder="F.eks. Lokalet er stengt på grunn av vedlikehold..."
              rows={4}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: error
                  ? '1px solid var(--ds-color-danger-border-default)'
                  : '1px solid var(--ds-color-neutral-border-default)',
                fontSize: 'var(--ds-font-size-sm)',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
            {error && (
              <Paragraph
                data-size="sm"
                style={{
                  margin: 0,
                  marginTop: 'var(--ds-spacing-1)',
                  color: 'var(--ds-color-danger-text-default)',
                }}
              >
                {error}
              </Paragraph>
            )}
          </div>

          {/* Character count */}
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              color: 'var(--ds-color-neutral-text-subtle)',
              textAlign: 'right',
            }}
          >
            {reason.length} / 500 tegn
          </Paragraph>
        </div>
      </Dialog.Block>

      <Dialog.Block>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Avbryt
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? 'Avbryter...' : 'Bekreft avbestilling'}
          </Button>
        </div>
      </Dialog.Block>
    </Dialog>
  );
}
