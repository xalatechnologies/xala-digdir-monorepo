/**
 * AddressesTab - User addresses settings tab
 */

import React from 'react';
import { Card, Heading, Paragraph, Textfield, Button } from '@digdir/designsystemet-react';

export interface AddressData {
  id?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface AddressesTabProps {
  addresses?: AddressData[];
  onSave?: (address: AddressData) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  t?: (key: string) => string;
  className?: string;
}

export function AddressesTab({
  addresses = [],
  onSave,
  onDelete,
  isLoading,
  t = (key) => key,
  className,
}: AddressesTabProps) {
  const [editingAddress, setEditingAddress] = React.useState<AddressData | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddress) {
      onSave?.(editingAddress);
      setEditingAddress(null);
    }
  };

  return (
    <div className={className}>
      <Card>
        <Card.Block>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
            <Heading level={3} size="sm">
              {t('settings.addresses.title')}
            </Heading>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditingAddress({})}
            >
              {t('settings.addresses.add')}
            </Button>
          </div>

          {editingAddress && (
            <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--ds-spacing-6)', padding: 'var(--ds-spacing-4)', border: '1px solid var(--ds-color-neutral-border-default)', borderRadius: 'var(--ds-border-radius-md)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                <Textfield
                  label={t('settings.addresses.street')}
                  value={editingAddress.street || ''}
                  onChange={(e) => setEditingAddress({ ...editingAddress, street: e.target.value })}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
                  <Textfield
                    label={t('settings.addresses.postalCode')}
                    value={editingAddress.postalCode || ''}
                    onChange={(e) => setEditingAddress({ ...editingAddress, postalCode: e.target.value })}
                  />
                  <Textfield
                    label={t('settings.addresses.city')}
                    value={editingAddress.city || ''}
                    onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                  <Button type="submit" disabled={isLoading}>{t('common.save')}</Button>
                  <Button type="button" variant="secondary" onClick={() => setEditingAddress(null)}>{t('common.cancel')}</Button>
                </div>
              </div>
            </form>
          )}

          {addresses.length === 0 ? (
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('settings.addresses.empty')}
            </Paragraph>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
              {addresses.map((address, index) => (
                <div
                  key={address.id || index}
                  style={{
                    padding: 'var(--ds-spacing-3)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <Paragraph>{address.street}</Paragraph>
                    <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {address.postalCode} {address.city}
                    </Paragraph>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                    <Button
                      variant="tertiary"
                      size="sm"
                      onClick={() => setEditingAddress(address)}
                    >
                      {t('common.edit')}
                    </Button>
                    {address.id && onDelete && (
                      <Button
                        variant="tertiary"
                        size="sm"
                        onClick={() => onDelete(address.id!)}
                      >
                        {t('common.delete')}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Block>
      </Card>
    </div>
  );
}
