import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Tabs,
  Textfield,
  Select,
  Switch,
} from '@xala/ds';
import { SettingsTabLayout, SettingsField, SettingsSection } from '../../src/blocks/settings/SettingsLayout';
import { ProfileTab } from '../../src/blocks/settings/ProfileTab';
import { PreferencesTab } from '../../src/blocks/settings/PreferencesTab';
import type { ProfileData } from '../../src/blocks/settings/ProfileTab';

/**
 * Settings components for user profile and preferences management.
 *
 * ## Components
 * - **SettingsTabLayout**: Container for settings tab content
 * - **SettingsField**: Individual field with label and description
 * - **SettingsSection**: Grouped section within a tab
 * - **ProfileTab**: User profile information management
 * - **PreferencesTab**: Language, display, and session preferences
 *
 * ## Features
 * - Form validation
 * - Avatar upload
 * - Language selection
 * - Logout functionality
 */
const meta: Meta<typeof SettingsTabLayout> = {
  title: 'Blocks/Settings',
  component: SettingsTabLayout,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Settings components for municipal user portals.

## Typical Use Cases
- User profile management
- Notification preferences
- Language selection
- Theme preferences
- Security settings
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SettingsTabLayout>;

// =============================================================================
// Sample Data
// =============================================================================

const sampleProfileData: ProfileData = {
  name: 'Ola Nordmann',
  email: 'ola.nordmann@example.no',
  phone: '+47 123 45 678',
  dateOfBirth: '1985-06-15',
  nationalId: '15068512345',
  invoiceAddress: {
    street: 'Karl Johans gate 1',
    postalCode: '0154',
    city: 'Oslo',
    country: 'Norge',
  },
  residenceAddress: {
    street: 'Storgata 10',
    postalCode: '0155',
    city: 'Oslo',
    country: 'Norge',
  },
};

// =============================================================================
// SettingsTabLayout Stories
// =============================================================================

/**
 * Basic settings tab layout
 */
export const TabLayoutDefault: Story = {
  render: () => (
    <div style={{ maxWidth: '700px' }}>
      <SettingsTabLayout
        title="Innstillinger"
        description="Administrer dine kontoinnstillinger og preferanser"
      >
        <SettingsField
          label="Visningsnavn"
          description="Dette navnet vises for andre brukere"
        >
          <Textfield placeholder="Ola Nordmann" />
        </SettingsField>

        <SettingsField
          label="E-postadresse"
          description="Din primære e-postadresse for varsler"
        >
          <Textfield type="email" placeholder="ola@example.no" />
        </SettingsField>
      </SettingsTabLayout>
    </div>
  ),
};

/**
 * Settings tab with sections
 */
export const TabLayoutWithSections: Story = {
  render: () => (
    <div style={{ maxWidth: '700px' }}>
      <SettingsTabLayout
        title="Varsler"
        description="Velg hvordan du vil motta varsler"
      >
        <SettingsField
          label="E-postvarsler"
          description="Motta varsler på e-post"
        >
          <Switch defaultChecked />
        </SettingsField>

        <SettingsSection title="Push-varsler">
          <SettingsField
            label="Nye bookinger"
            description="Varsle når noen booker en av dine ressurser"
          >
            <Switch defaultChecked />
          </SettingsField>

          <SettingsField
            label="Avbestillinger"
            description="Varsle ved avbestillinger"
          >
            <Switch defaultChecked />
          </SettingsField>

          <SettingsField
            label="Meldinger"
            description="Varsle når du mottar nye meldinger"
          >
            <Switch defaultChecked />
          </SettingsField>
        </SettingsSection>

        <SettingsSection title="SMS-varsler">
          <SettingsField
            label="Aktivér SMS"
            description="Motta viktige varsler på SMS"
          >
            <Switch />
          </SettingsField>
        </SettingsSection>
      </SettingsTabLayout>
    </div>
  ),
};

// =============================================================================
// ProfileTab Stories
// =============================================================================

/**
 * Profile tab with form fields
 */
export const ProfileTabDefault: Story = {
  render: () => {
    const [profileData, setProfileData] = useState<ProfileData>(sampleProfileData);
    const [isSaving, setIsSaving] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const handleProfileDataChange = (data: Partial<ProfileData>) => {
      setProfileData(prev => ({ ...prev, ...data }));
    };

    const handleSaveProfile = () => {
      setIsSaving(true);
      setTimeout(() => {
        setIsSaving(false);
        console.log('Profile saved:', profileData);
      }, 1500);
    };

    const handleAvatarChange = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    };

    return (
      <div style={{ maxWidth: '700px' }}>
        <ProfileTab
          currentUser={{ id: 'user-1' }}
          profileData={profileData}
          avatarPreview={avatarPreview}
          isSaving={isSaving}
          onProfileDataChange={handleProfileDataChange}
          onSaveProfile={handleSaveProfile}
          onAvatarChange={handleAvatarChange}
        />
      </div>
    );
  },
};

/**
 * Profile tab with avatar
 */
export const ProfileTabWithAvatar: Story = {
  render: () => {
    const [profileData, setProfileData] = useState<ProfileData>(sampleProfileData);

    return (
      <div style={{ maxWidth: '700px' }}>
        <ProfileTab
          currentUser={{ id: 'user-1', avatar: 'https://i.pravatar.cc/150?u=ola' }}
          profileData={profileData}
          avatarPreview="https://i.pravatar.cc/150?u=ola"
          onProfileDataChange={(data) => setProfileData(prev => ({ ...prev, ...data }))}
          onSaveProfile={() => console.log('Save')}
          onAvatarChange={(file) => console.log('Avatar changed:', file.name)}
        />
      </div>
    );
  },
};

// =============================================================================
// PreferencesTab Stories
// =============================================================================

/**
 * Preferences tab with language selection
 */
export const PreferencesTabDefault: Story = {
  render: () => {
    const [locale, setLocale] = useState<'nb' | 'nn' | 'en'>('nb');

    return (
      <div style={{ maxWidth: '700px' }}>
        <PreferencesTab
          locale={locale}
          onLocaleChange={setLocale}
          onLogout={() => console.log('Logout clicked')}
        />
      </div>
    );
  },
};

/**
 * Preferences with English selected
 */
export const PreferencesTabEnglish: Story = {
  render: () => (
    <div style={{ maxWidth: '700px' }}>
      <PreferencesTab
        locale="en"
        onLocaleChange={(locale) => console.log('Locale changed:', locale)}
        onLogout={() => console.log('Logout')}
      />
    </div>
  ),
};

// =============================================================================
// Complete Settings Page
// =============================================================================

/**
 * Complete settings page with tabs
 */
export const CompleteSettingsPage: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [profileData, setProfileData] = useState<ProfileData>(sampleProfileData);
    const [locale, setLocale] = useState<'nb' | 'nn' | 'en'>('nb');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveProfile = () => {
      setIsSaving(true);
      setTimeout(() => {
        setIsSaving(false);
        console.log('Profile saved');
      }, 1500);
    };

    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--ds-spacing-6)' }}>
          <Heading level={1} data-size="lg" style={{ margin: '0 0 var(--ds-spacing-2) 0' }}>
            Innstillinger
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            Administrer din konto og preferanser
          </Paragraph>
        </div>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="profile">Profil</Tabs.Tab>
            <Tabs.Tab value="preferences">Preferanser</Tabs.Tab>
            <Tabs.Tab value="notifications">Varsler</Tabs.Tab>
            <Tabs.Tab value="security">Sikkerhet</Tabs.Tab>
          </Tabs.List>

          <div style={{ marginTop: 'var(--ds-spacing-6)' }}>
            {activeTab === 'profile' && (
              <ProfileTab
                currentUser={{ id: 'user-1' }}
                profileData={profileData}
                avatarPreview={avatarPreview}
                isSaving={isSaving}
                onProfileDataChange={(data) => setProfileData(prev => ({ ...prev, ...data }))}
                onSaveProfile={handleSaveProfile}
                onAvatarChange={(file) => {
                  const reader = new FileReader();
                  reader.onload = (e) => setAvatarPreview(e.target?.result as string);
                  reader.readAsDataURL(file);
                }}
              />
            )}

            {activeTab === 'preferences' && (
              <PreferencesTab
                locale={locale}
                onLocaleChange={setLocale}
                onLogout={() => console.log('Logout')}
              />
            )}

            {activeTab === 'notifications' && (
              <SettingsTabLayout
                title="Varsler"
                description="Velg hvordan du vil motta varsler"
              >
                <SettingsField
                  label="E-postvarsler"
                  description="Motta varsler på e-post"
                >
                  <Switch defaultChecked />
                </SettingsField>

                <SettingsField
                  label="Push-varsler"
                  description="Motta varsler i nettleseren"
                >
                  <Switch defaultChecked />
                </SettingsField>

                <SettingsField
                  label="SMS-varsler"
                  description="Motta viktige varsler på SMS"
                >
                  <Switch />
                </SettingsField>

                <SettingsSection title="Varseltyper">
                  <SettingsField
                    label="Nye bookinger"
                    description="Varsle når noen booker en av dine ressurser"
                  >
                    <Switch defaultChecked />
                  </SettingsField>

                  <SettingsField
                    label="Avbestillinger"
                    description="Varsle ved avbestillinger"
                  >
                    <Switch defaultChecked />
                  </SettingsField>

                  <SettingsField
                    label="Meldinger"
                    description="Varsle når du mottar nye meldinger"
                  >
                    <Switch defaultChecked />
                  </SettingsField>
                </SettingsSection>
              </SettingsTabLayout>
            )}

            {activeTab === 'security' && (
              <SettingsTabLayout
                title="Sikkerhet"
                description="Administrer sikkerhetsinnstillinger for din konto"
              >
                <SettingsField
                  label="To-faktor autentisering"
                  description="Øk sikkerheten med ekstra verifisering"
                >
                  <Switch />
                </SettingsField>

                <SettingsSection title="Aktive økter">
                  <Card style={{ padding: 'var(--ds-spacing-4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                          Chrome på macOS
                        </Paragraph>
                        <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                          Nåværende økt • Oslo, Norge
                        </Paragraph>
                      </div>
                      <span style={{
                        padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                        backgroundColor: 'var(--ds-color-success-surface-default)',
                        color: 'var(--ds-color-success-text-default)',
                        borderRadius: 'var(--ds-border-radius-sm)',
                        fontSize: 'var(--ds-font-size-xs)',
                        fontWeight: 500,
                      }}>
                        Aktiv
                      </span>
                    </div>
                  </Card>
                </SettingsSection>

                <SettingsSection title="Sikkerhetslogg">
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Ingen nylige sikkerhetshendelser
                  </Paragraph>
                </SettingsSection>
              </SettingsTabLayout>
            )}
          </div>
        </Tabs>
      </div>
    );
  },
};

// =============================================================================
// Individual Field Examples
// =============================================================================

/**
 * Settings field examples
 */
export const FieldExamples: Story = {
  render: () => (
    <div style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={3} data-size="sm" style={{ margin: '0 0 var(--ds-spacing-4) 0' }}>
          Felt-eksempler
        </Heading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          <SettingsField
            label="Tekstfelt"
            description="Standard tekstfelt for input"
          >
            <Textfield placeholder="Skriv her..." />
          </SettingsField>

          <SettingsField
            label="Valgliste"
            description="Velg fra forhåndsdefinerte alternativer"
          >
            <Select>
              <option value="">Velg...</option>
              <option value="1">Alternativ 1</option>
              <option value="2">Alternativ 2</option>
              <option value="3">Alternativ 3</option>
            </Select>
          </SettingsField>

          <SettingsField
            label="Bryter"
            description="Slå av eller på en funksjon"
          >
            <Switch />
          </SettingsField>
        </div>
      </Card>
    </div>
  ),
};
