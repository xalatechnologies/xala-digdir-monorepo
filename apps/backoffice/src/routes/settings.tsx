/**
 * Settings Page - Complete Tenant Configuration
 * Manage tenant settings, integrations, and system configuration
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
import { GeneralTab } from '../features/settings/components/GeneralTab';
import { BookingTab } from '../features/settings/components/BookingTab';
import { NotificationsTab } from '../features/settings/components/NotificationsTab';
import { IntegrationsTab } from '../features/settings/components/IntegrationsTab';
import { BrandingTab } from '../features/settings/components/BrandingTab';
import { useIntegrationSettings } from '../features/settings/hooks/useIntegrationSettings';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const { isLoading: isLoadingUser } = useCurrentUser();
  const { integrations, toggleIntegration } = useIntegrationSettings();

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
            Konfigurer systemet og tredjepartsintegrasjoner
          </Paragraph>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="profile">Min profil</Tabs.Tab>
          <Tabs.Tab value="addresses">Adresser</Tabs.Tab>
          <Tabs.Tab value="general">Generelt</Tabs.Tab>
          <Tabs.Tab value="booking">Booking</Tabs.Tab>
          <Tabs.Tab value="notifications">Varsler</Tabs.Tab>
          <Tabs.Tab value="integrations">Integrasjoner</Tabs.Tab>
          <Tabs.Tab value="branding">Visuelle profil</Tabs.Tab>
        </Tabs.List>

        {/* Profile Tab */}
        <Tabs.Panel value="profile">
          <ProfileTab />
        </Tabs.Panel>

        {/* Addresses Tab */}
        <Tabs.Panel value="addresses">
          <AddressesTab />
        </Tabs.Panel>

        {/* General Tab */}
        <Tabs.Panel value="general">
          <GeneralTab />
        </Tabs.Panel>

        {/* Booking Tab */}
        <Tabs.Panel value="booking">
          <BookingTab />
        </Tabs.Panel>

        {/* Notifications Tab */}
        <Tabs.Panel value="notifications">
          <NotificationsTab />
        </Tabs.Panel>

        {/* Integrations Tab */}
        <Tabs.Panel value="integrations">
          <IntegrationsTab
            integrations={integrations}
            onToggle={toggleIntegration}
          />
        </Tabs.Panel>

        {/* Branding Tab */}
        <Tabs.Panel value="branding">
          <BrandingTab />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
