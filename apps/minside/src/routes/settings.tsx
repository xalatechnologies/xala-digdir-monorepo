/**
 * Settings Page - User Profile Management
 * Comprehensive tabbed settings for end users
 */

import { useState } from 'react';
import {
  Heading,
  Paragraph,
  Spinner,
  Tabs,
} from '@xala/ds';
import { useCurrentUser } from '@digilist/client-sdk';

// Tab Components
import { ProfileTab } from '../features/settings/components/ProfileTab';
import { AddressesTab } from '../features/settings/components/AddressesTab';
import { PrivacyTab } from '../features/settings/components/PrivacyTab';
import { NotificationsTab } from '../features/settings/components/NotificationsTab';
import { PreferencesTab } from '../features/settings/components/PreferencesTab';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const { isLoading: isLoadingUser } = useCurrentUser();

  if (isLoadingUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label="Laster..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={2} data-size="md">
            Innstillinger
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
          >
            Administrer din konto og preferanser
          </Paragraph>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="profile">Min profil</Tabs.Tab>
          <Tabs.Tab value="addresses">Adresser</Tabs.Tab>
          <Tabs.Tab value="privacy">Personvern</Tabs.Tab>
          <Tabs.Tab value="notifications">Varsler</Tabs.Tab>
          <Tabs.Tab value="preferences">Preferanser</Tabs.Tab>
        </Tabs.List>

        {/* Profile Tab */}
        <Tabs.Panel value="profile">
          <ProfileTab />
        </Tabs.Panel>

        {/* Addresses Tab */}
        <Tabs.Panel value="addresses">
          <AddressesTab />
        </Tabs.Panel>

        {/* Privacy Tab */}
        <Tabs.Panel value="privacy">
          <PrivacyTab />
        </Tabs.Panel>

        {/* Notifications Tab */}
        <Tabs.Panel value="notifications">
          <NotificationsTab />
        </Tabs.Panel>

        {/* Preferences Tab */}
        <Tabs.Panel value="preferences">
          <PreferencesTab />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
