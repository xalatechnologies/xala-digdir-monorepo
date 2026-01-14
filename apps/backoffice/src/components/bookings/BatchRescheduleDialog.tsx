/**
 * Batch Reschedule Dialog Component
 * Dialog for batch rescheduling of bookings using time offsets
 */

import { useState } from 'react';
import {
  Dialog,
  Button,
  Heading,
  Paragraph,
  Alert,
} from '@xala/ds';

interface BatchRescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (offsets: { offsetDays: number; offsetHours: number; offsetMinutes: number }) => Promise<void>;
  selectedCount: number;
}

export function BatchRescheduleDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
}: BatchRescheduleDialogProps) {
  const [offsetDays, setOffsetDays] = useState(0);
  const [offsetHours, setOffsetHours] = useState(0);
  const [offsetMinutes, setOffsetMinutes] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // Validate that at least one offset is non-zero
    if (offsetDays === 0 && offsetHours === 0 && offsetMinutes === 0) {
      setError('Du må angi minst én tidsforskyvning');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm({ offsetDays, offsetHours, offsetMinutes });
      // Reset form on success
      setOffsetDays(0);
      setOffsetHours(0);
      setOffsetMinutes(0);
      onClose();
    } catch (err) {
      setError('Kunne ikke flytte bookinger. Vennligst prøv igjen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setOffsetDays(0);
      setOffsetHours(0);
      setOffsetMinutes(0);
      setError(null);
      onClose();
    }
  };

  // Calculate total offset for preview
  const calculateTotalOffset = () => {
    const parts: string[] = [];

    if (offsetDays !== 0) {
      parts.push(`${Math.abs(offsetDays)} dag${Math.abs(offsetDays) !== 1 ? 'er' : ''}`);
    }
    if (offsetHours !== 0) {
      parts.push(`${Math.abs(offsetHours)} time${Math.abs(offsetHours) !== 1 ? 'r' : ''}`);
    }
    if (offsetMinutes !== 0) {
      parts.push(`${Math.abs(offsetMinutes)} minutt${Math.abs(offsetMinutes) !== 1 ? 'er' : ''}`);
    }

    if (parts.length === 0) return 'Ingen endring';

    const isNegative = offsetDays < 0 || offsetHours < 0 || offsetMinutes < 0;
    const direction = isNegative ? 'tidligere' : 'senere';

    return `${parts.join(', ')} ${direction}`;
  };

  const hasValidOffset = offsetDays !== 0 || offsetHours !== 0 || offsetMinutes !== 0;

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <Dialog.Block>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Flytt {selectedCount} booking{selectedCount !== 1 ? 'er' : ''}
        </Heading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {/* Warning Alert */}
          <Alert severity="info">
            Du er i ferd med å flytte {selectedCount} booking{selectedCount !== 1 ? 'er' : ''}.
            Alle valgte bookinger vil bli flyttet med samme tidsforskyvning.
            Brukerne vil bli varslet om endringen.
          </Alert>

          {/* Offset inputs */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                marginBottom: 'var(--ds-spacing-1)',
              }}
            >
              Tidsforskyvning
            </label>
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                marginBottom: 'var(--ds-spacing-3)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              Angi hvor mye bookingene skal flyttes fremover (positive tall) eller bakover (negative tall) i tid.
            </Paragraph>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
              {/* Days */}
              <div>
                <label
                  htmlFor="offset-days"
                  style={{
                    display: 'block',
                    fontSize: 'var(--ds-font-size-sm)',
                    marginBottom: 'var(--ds-spacing-1)',
                  }}
                >
                  Dager
                </label>
                <input
                  id="offset-days"
                  type="number"
                  value={offsetDays}
                  onChange={(e) => {
                    setOffsetDays(Number(e.target.value));
                    setError(null);
                  }}
                  disabled={isSubmitting}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    fontSize: 'var(--ds-font-size-sm)',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Hours */}
              <div>
                <label
                  htmlFor="offset-hours"
                  style={{
                    display: 'block',
                    fontSize: 'var(--ds-font-size-sm)',
                    marginBottom: 'var(--ds-spacing-1)',
                  }}
                >
                  Timer
                </label>
                <input
                  id="offset-hours"
                  type="number"
                  value={offsetHours}
                  onChange={(e) => {
                    setOffsetHours(Number(e.target.value));
                    setError(null);
                  }}
                  disabled={isSubmitting}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    fontSize: 'var(--ds-font-size-sm)',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Minutes */}
              <div>
                <label
                  htmlFor="offset-minutes"
                  style={{
                    display: 'block',
                    fontSize: 'var(--ds-font-size-sm)',
                    marginBottom: 'var(--ds-spacing-1)',
                  }}
                >
                  Minutter
                </label>
                <input
                  id="offset-minutes"
                  type="number"
                  value={offsetMinutes}
                  onChange={(e) => {
                    setOffsetMinutes(Number(e.target.value));
                    setError(null);
                  }}
                  disabled={isSubmitting}
                  placeholder="0"
                  step="15"
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    fontSize: 'var(--ds-font-size-sm)',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            {error && (
              <Paragraph
                data-size="sm"
                style={{
                  margin: 0,
                  marginTop: 'var(--ds-spacing-2)',
                  color: 'var(--ds-color-danger-text-default)',
                }}
              >
                {error}
              </Paragraph>
            )}
          </div>

          {/* Preview */}
          {hasValidOffset && (
            <div
              style={{
                padding: 'var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-neutral-background-subtle)',
              }}
            >
              <Paragraph
                data-size="sm"
                style={{
                  margin: 0,
                  fontWeight: 'var(--ds-font-weight-medium)',
                  marginBottom: 'var(--ds-spacing-1)',
                }}
              >
                Forhåndsvisning
              </Paragraph>
              <Paragraph
                data-size="sm"
                style={{
                  margin: 0,
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                Bookingene vil bli flyttet: {calculateTotalOffset()}
              </Paragraph>
            </div>
          )}
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
            disabled={isSubmitting || !hasValidOffset}
          >
            {isSubmitting ? 'Flytter...' : 'Bekreft flytting'}
          </Button>
        </div>
      </Dialog.Block>
    </Dialog>
  );
}
