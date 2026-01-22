/**
 * PreferencesTab - User preferences settings tab
 */

import React from 'react';
import { Card, Heading, Paragraph, Select } from '@digdir/designsystemet-react';

export interface PreferencesData {
  language?: string;
  theme?: 'light' | 'dark' | 'auto';
  timezone?: string;
}

export interface PreferencesTabProps {
  preferences?: PreferencesData;
  onSave?: (preferences: PreferencesData) => void;
  isLoading?: boolean;
  t?: (key: string) => string;
  availableLanguages?: { code: string; name: string }[];
  className?: string;
}

export function PreferencesTab({
  preferences = {},
  onSave,
  isLoading,
  t = (key) => key,
  availableLanguages = [
    { code: 'nb', name: 'Norsk (Bokmål)' },
    { code: 'en', name: 'English' },
  ],
  className,
}: PreferencesTabProps) {
  const [formData, setFormData] = React.useState<PreferencesData>(preferences);

  const handleChange = (key: keyof PreferencesData, value: string) => {
    const newPreferences = { ...formData, [key]: value };
    setFormData(newPreferences);
    onSave?.(newPreferences);
  };

  return (
    <div className={className}>
      <Card>
        <Card.Block>
          <Heading level={3} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            {t('settings.preferences.title')}
          </Heading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <div>
              <Select
                label={t('settings.preferences.language')}
                value={formData.language || 'nb'}
                onChange={(e) => handleChange('language', e.target.value)}
                disabled={isLoading}
              >
                {availableLanguages.map((lang) => (
                  <Select.Option key={lang.code} value={lang.code}>
                    {lang.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div>
              <Select
                label={t('settings.preferences.theme')}
                value={formData.theme || 'auto'}
                onChange={(e) => handleChange('theme', e.target.value as PreferencesData['theme'])}
                disabled={isLoading}
              >
                <Select.Option value="auto">{t('settings.preferences.themeAuto')}</Select.Option>
                <Select.Option value="light">{t('settings.preferences.themeLight')}</Select.Option>
                <Select.Option value="dark">{t('settings.preferences.themeDark')}</Select.Option>
              </Select>
            </div>
          </div>
        </Card.Block>
      </Card>
    </div>
  );
}
