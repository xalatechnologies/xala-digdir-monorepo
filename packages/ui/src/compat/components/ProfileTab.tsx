/**
 * ProfileTab - User profile settings tab
 */

import React from 'react';
import { Card, Heading, Paragraph, Textfield, Button } from '@digdir/designsystemet-react';

export interface ProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface ProfileTabProps {
  data?: ProfileData;
  onSave?: (data: ProfileData) => void;
  isLoading?: boolean;
  t?: (key: string) => string;
  className?: string;
}

export function ProfileTab({
  data,
  onSave,
  isLoading,
  t = (key) => key,
  className,
}: ProfileTabProps) {
  const [formData, setFormData] = React.useState<ProfileData>(data || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(formData);
  };

  return (
    <div className={className}>
      <Card>
        <Card.Block>
          <Heading level={3} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            {t('settings.profile.title')}
          </Heading>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
              <Textfield
                label={t('settings.profile.firstName')}
                value={formData.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              <Textfield
                label={t('settings.profile.lastName')}
                value={formData.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
              <Textfield
                label={t('settings.profile.email')}
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Textfield
                label={t('settings.profile.phone')}
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Button type="submit" disabled={isLoading}>
                {t('common.save')}
              </Button>
            </div>
          </form>
        </Card.Block>
      </Card>
    </div>
  );
}
