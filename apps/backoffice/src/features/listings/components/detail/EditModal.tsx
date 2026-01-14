/**
 * Edit Modal
 * Modal for editing listing details inline from the detail view
 * Follows patterns from wizard steps with SDK-first architecture
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  Button,
  Heading,
  Paragraph,
  Textfield,
  Textarea,
  Alert,
} from '@xala/ds';
import { useUpdateListing, type Listing } from '@digilist/client-sdk';

export interface EditModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** The listing to edit */
  listing: Listing;
  /** Callback on successful update */
  onSuccess?: () => void;
}

// Norwegian labels for listing types
const LISTING_TYPE_LABELS: Record<string, string> = {
  SPACE: 'Lokale',
  RESOURCE: 'Ressurs',
  SERVICE: 'Tjeneste',
  EVENT: 'Arrangement',
  VEHICLE: 'Kjøretøy',
  OTHER: 'Annet',
};

// Norwegian labels for visibility
const VISIBILITY_LABELS: Record<string, string> = {
  public: 'Offentlig',
  unlisted: 'Ulistet',
  private: 'Privat',
};

/**
 * EditModal Component
 *
 * @example
 * ```tsx
 * <EditModal
 *   isOpen={isEditOpen}
 *   onClose={() => setIsEditOpen(false)}
 *   listing={listing}
 *   onSuccess={() => refetch()}
 * />
 * ```
 */
export function EditModal({ isOpen, onClose, listing, onSuccess }: EditModalProps) {
  const updateMutation = useUpdateListing();

  // Form state
  const [formData, setFormData] = useState({
    name: listing.name || '',
    description: listing.description || '',
    capacity: listing.capacity || 0,
    visibility: listing.metadata?.visibility || 'public',
  });

  const [errors, setErrors] = useState<string[]>([]);

  // Reset form when listing changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: listing.name || '',
        description: listing.description || '',
        capacity: listing.capacity || 0,
        visibility: listing.metadata?.visibility || 'public',
      });
      setErrors([]);
    }
  }, [isOpen, listing]);

  // Form handlers
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }));
  };

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setFormData((prev) => ({ ...prev, capacity: isNaN(value) ? 0 : value }));
  };

  const handleVisibilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, visibility: e.target.value as 'public' | 'unlisted' | 'private' }));
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) {
      newErrors.push('Navn er påkrevd');
    }

    if (formData.name.length > 200) {
      newErrors.push('Navn kan ikke være lengre enn 200 tegn');
    }

    if (formData.capacity < 0) {
      newErrors.push('Kapasitet kan ikke være negativ');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Check if form has changes
  const hasChanges = useMemo(() => {
    return (
      formData.name !== (listing.name || '') ||
      formData.description !== (listing.description || '') ||
      formData.capacity !== (listing.capacity || 0) ||
      formData.visibility !== (listing.metadata?.visibility || 'public')
    );
  }, [formData, listing]);

  // Submit handler
  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      // Build update payload
      const updatePayload: Partial<Listing> = {
        name: formData.name,
        description: formData.description,
        capacity: formData.capacity,
        metadata: {
          ...listing.metadata,
          visibility: formData.visibility,
        },
      };

      await updateMutation.mutateAsync({
        id: listing.id,
        data: updatePayload,
      });

      // Success - call callback and close
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error is handled by SDK/react-query
      // RFC 7807 compliant error will be shown by the mutation
      console.error('Failed to update listing:', error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <Dialog.Block>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
          Rediger utleieobjekt
        </Heading>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginBottom: 'var(--ds-spacing-4)' }}
        >
          Oppdater grunnleggende informasjon om {listing.name}
        </Paragraph>

        {/* Error display */}
        {errors.length > 0 && (
          <Alert data-color="danger" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            <Heading level={3} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
              Vennligst korriger følgende feil:
            </Heading>
            <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)' }}>
              {errors.map((error, idx) => (
                <li key={idx} style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                  {error}
                </li>
              ))}
            </ul>
          </Alert>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {/* Listing Type - Read only */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                marginBottom: 'var(--ds-spacing-1)',
              }}
            >
              Type
            </label>
            <div
              style={{
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
                fontSize: 'var(--ds-font-size-sm)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {LISTING_TYPE_LABELS[listing.type] || listing.type}
            </div>
          </div>

          {/* Name */}
          <div>
            <Textfield
              label="Navn *"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="F.eks. Møterom 101"
              data-size="small"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description-field"
              style={{
                display: 'block',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                marginBottom: 'var(--ds-spacing-1)',
              }}
            >
              Beskrivelse
            </label>
            <Textarea
              id="description-field"
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Kort beskrivelse av utleieobjektet..."
              rows={4}
              style={{
                width: '100%',
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-default)',
                fontSize: 'var(--ds-font-size-sm)',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Capacity */}
          <div>
            <label
              htmlFor="capacity-field"
              style={{
                display: 'block',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                marginBottom: 'var(--ds-spacing-1)',
              }}
            >
              Kapasitet
            </label>
            <input
              id="capacity-field"
              type="number"
              value={formData.capacity}
              onChange={handleCapacityChange}
              min="0"
              step="1"
              style={{
                width: '100%',
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-default)',
                fontSize: 'var(--ds-font-size-sm)',
              }}
            />
          </div>

          {/* Visibility */}
          <div>
            <label
              htmlFor="visibility-field"
              style={{
                display: 'block',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                marginBottom: 'var(--ds-spacing-1)',
              }}
            >
              Synlighet
            </label>
            <select
              id="visibility-field"
              value={formData.visibility}
              onChange={handleVisibilityChange}
              style={{
                width: '100%',
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-default)',
                fontSize: 'var(--ds-font-size-sm)',
              }}
            >
              {Object.entries(VISIBILITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Dialog.Block>

      <Dialog.Block>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={updateMutation.isPending}>
            Avbryt
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={!hasChanges || updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Lagrer...' : 'Lagre endringer'}
          </Button>
        </div>
      </Dialog.Block>
    </Dialog>
  );
}
