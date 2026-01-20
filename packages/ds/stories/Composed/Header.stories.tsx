import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  DashboardHeader,
  DashboardPageHeader,
  HeaderLogo,
  HeaderSearch,
  HeaderActions,
  HeaderThemeToggle,
  HeaderLoginButton,
  HeaderIconButton,
  Button,
  Badge,
  Breadcrumb,
  Card,
  Paragraph,
} from '@xala/ds';
import {
  HomeIcon,
  CalendarIcon,
  SettingsIcon,
  BellIcon,
  SearchIcon,
  FilterIcon,
  PlusIcon,
  ChartIcon,
  UserIcon,
  BuildingIcon,
} from '@xala/ds';
import type { SearchResultGroup } from '../../src/composed/header-parts';

/**
 * Header components provide navigation and actions for dashboard applications.
 *
 * ## Components
 * - **DashboardHeader**: Main sticky header with search, notifications, user menu
 * - **DashboardPageHeader**: Page-level header with breadcrumbs, title, tabs
 * - **HeaderLogo**: Logo with optional title and subtitle
 * - **HeaderSearch**: Global search with dropdown results
 * - **HeaderThemeToggle**: Dark/light mode toggle
 * - **HeaderLoginButton**: Authentication button
 *
 * ## Accessibility
 * - Keyboard navigation
 * - ARIA labels and roles
 * - Focus management
 * - Screen reader support
 */
const meta: Meta<typeof DashboardHeader> = {
  title: 'Composed/Header',
  component: DashboardHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Header components for dashboard and application layouts.

## DashboardHeader
Main application header with:
- Search bar (⌘K shortcut)
- Notifications
- Theme toggle
- User menu

## DashboardPageHeader
Page-level header with:
- Breadcrumb navigation
- Title with badge
- Action buttons
- Tab navigation

## data-testid
- DashboardHeader: \`data-testid="dashboard-header"\`
- DashboardPageHeader: \`data-testid="dashboard-page-header"\`
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DashboardHeader>;

// Sample user data
const sampleUser = {
  name: 'Ola Nordmann',
  email: 'ola.nordmann@kommune.no',
};

// Sample search results
const sampleSearchResults: SearchResultGroup[] = [
  {
    id: 'pages',
    label: 'Sider',
    items: [
      { id: '1', label: 'Dashboard', description: 'Hovedoversikt', icon: <HomeIcon size={18} />, href: '/' },
      { id: '2', label: 'Bookinger', description: 'Se alle bookinger', icon: <CalendarIcon size={18} />, href: '/bookings' },
      { id: '3', label: 'Innstillinger', description: 'Systeminnstillinger', icon: <SettingsIcon size={18} />, href: '/settings' },
    ],
  },
  {
    id: 'actions',
    label: 'Handlinger',
    items: [
      { id: '4', label: 'Ny booking', description: 'Opprett ny booking', icon: <PlusIcon size={18} />, shortcut: 'N' },
      { id: '5', label: 'Søk bruker', description: 'Finn bruker i systemet', icon: <SearchIcon size={18} />, shortcut: 'U' },
    ],
  },
];

// Sample breadcrumb items
const sampleBreadcrumbItems = [
  { label: 'Hjem', href: '/' },
  { label: 'Bookinger', href: '/bookings' },
  { label: 'Detaljer' },
];

const SampleBreadcrumb = () => (
  <Breadcrumb items={sampleBreadcrumbItems} />
);

/**
 * Default DashboardHeader with all features
 */
export const Default: Story = {
  render: () => {
    const [isDark, setIsDark] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    return (
      <div style={{ minHeight: '400px', backgroundColor: 'var(--ds-color-neutral-background-default)' }}>
        <DashboardHeader
          logo={<HeaderLogo title="Digilist" subtitle="Admin" />}
          leftSlot={<HeaderLogo title="Digilist" subtitle="Backoffice" />}
          user={sampleUser}
          searchPlaceholder="Søk i Digilist..."
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchResults={searchValue.length > 0 ? sampleSearchResults : []}
          onSearchResultSelect={(result) => console.log('Selected:', result)}
          showThemeToggle
          isDark={isDark}
          onThemeToggle={() => setIsDark(!isDark)}
          showNotifications
          notificationCount={5}
          onNotificationClick={() => console.log('Notifications clicked')}
          onLogout={() => console.log('Logout')}
          onSettingsClick={() => console.log('Settings')}
          onProfileClick={() => console.log('Profile')}
        />
        <div style={{ padding: 'var(--ds-spacing-6)' }}>
          <Paragraph>Main content area</Paragraph>
        </div>
      </div>
    );
  },
};

/**
 * Header without user (logged out state)
 */
export const LoggedOut: Story = {
  render: () => (
    <DashboardHeader
      logo={<HeaderLogo title="Digilist" />}
      searchPlaceholder="Søk..."
      onSearchChange={(value) => console.log('Search:', value)}
      showThemeToggle
      showNotifications={false}
      actions={
        <HeaderLoginButton
          loginText="Logg inn"
          onLogin={() => console.log('Login clicked')}
        />
      }
    />
  ),
};

/**
 * Header with custom actions
 */
export const WithCustomActions: Story = {
  render: () => (
    <DashboardHeader
      logo={<HeaderLogo title="Digilist" subtitle="Admin" />}
      user={sampleUser}
      searchPlaceholder="Søk..."
      onSearchChange={(value) => console.log('Search:', value)}
      showThemeToggle
      showNotifications
      notificationCount={3}
      onNotificationClick={() => {}}
      actions={
        <HeaderActions>
          <Button variant="secondary" data-size="sm">
            <PlusIcon size={16} />
            Ny booking
          </Button>
        </HeaderActions>
      }
    />
  ),
};

/**
 * Minimal header (no search, no notifications)
 */
export const Minimal: Story = {
  render: () => (
    <DashboardHeader
      logo={<HeaderLogo title="Digilist" />}
      user={sampleUser}
      showThemeToggle={false}
      showNotifications={false}
      onLogout={() => console.log('Logout')}
    />
  ),
};

/**
 * DashboardPageHeader with all features
 */
export const PageHeader: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
      <div style={{ padding: 'var(--ds-spacing-6)', backgroundColor: 'var(--ds-color-neutral-background-default)' }}>
        <DashboardPageHeader
          breadcrumb={<SampleBreadcrumb />}
          title="Booking #12345"
          subtitle="Idrettshall A - Mandag 15. januar 2026"
          badge={<Badge data-color="success">Bekreftet</Badge>}
          meta={[
            { icon: <CalendarIcon size={16} />, label: '15. jan 2026, 10:00-12:00' },
            { icon: <UserIcon size={16} />, label: 'Ola Nordmann' },
            { icon: <BuildingIcon size={16} />, label: 'Oslo Kommune' },
          ]}
          lastUpdated="Oppdatert 5 min siden"
          secondaryAction={
            <Button variant="secondary">
              Avbryt booking
            </Button>
          }
          primaryAction={
            <Button variant="primary">
              Rediger
            </Button>
          }
          tabs={[
            { id: 'overview', label: 'Oversikt' },
            { id: 'details', label: 'Detaljer' },
            { id: 'history', label: 'Historikk', count: 12 },
            { id: 'messages', label: 'Meldinger', count: 3 },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph>Content for tab: {activeTab}</Paragraph>
        </Card>
      </div>
    );
  },
};

/**
 * PageHeader with pill tabs
 */
export const PageHeaderPillTabs: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('all');

    return (
      <div style={{ padding: 'var(--ds-spacing-6)', backgroundColor: 'var(--ds-color-neutral-background-default)' }}>
        <DashboardPageHeader
          title="Bookinger"
          subtitle="Administrer alle bookinger i systemet"
          primaryAction={
            <Button variant="primary">
              <PlusIcon size={16} />
              Ny booking
            </Button>
          }
          tabs={[
            { id: 'all', label: 'Alle', count: 156 },
            { id: 'pending', label: 'Ventende', count: 12 },
            { id: 'confirmed', label: 'Bekreftet', count: 98 },
            { id: 'cancelled', label: 'Kansellert', count: 46 },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabVariant="pill"
        />
      </div>
    );
  },
};

/**
 * PageHeader minimal (just title)
 */
export const PageHeaderMinimal: Story = {
  render: () => (
    <div style={{ padding: 'var(--ds-spacing-6)', backgroundColor: 'var(--ds-color-neutral-background-default)' }}>
      <DashboardPageHeader
        title="Innstillinger"
      />
    </div>
  ),
};

/**
 * HeaderLogo variations
 */
export const LogoVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)', padding: 'var(--ds-spacing-6)' }}>
      <div>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Title only
        </Paragraph>
        <HeaderLogo title="Digilist" />
      </div>
      <div>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Title with subtitle
        </Paragraph>
        <HeaderLogo title="Digilist" subtitle="Backoffice" />
      </div>
      <div>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          With logo image
        </Paragraph>
        <HeaderLogo
          src="https://designsystemet.no/img/logos/digdir-mark.svg"
          title="Digilist"
          subtitle="Min Side"
        />
      </div>
      <div>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          As link
        </Paragraph>
        <HeaderLogo title="Digilist" subtitle="Portal" href="/" />
      </div>
    </div>
  ),
};

/**
 * HeaderSearch standalone
 */
export const SearchStandalone: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('');

    return (
      <div style={{ padding: 'var(--ds-spacing-6)', maxWidth: '600px' }}>
        <HeaderSearch
          placeholder="Søk etter bookinger, brukere, eller utleieobjekter..."
          value={searchValue}
          onSearchChange={setSearchValue}
          results={searchValue.length > 0 ? sampleSearchResults : []}
          onResultSelect={(result) => alert(`Selected: ${result.label}`)}
          showShortcut
          enableGlobalShortcut
          noResultsText="Ingen resultater funnet"
        />
        <Paragraph data-size="sm" style={{ marginTop: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Try typing "book" or press ⌘K
        </Paragraph>
      </div>
    );
  },
};

/**
 * HeaderSearch with loading state
 */
export const SearchLoading: Story = {
  render: () => (
    <div style={{ padding: 'var(--ds-spacing-6)', maxWidth: '600px' }}>
      <HeaderSearch
        placeholder="Søk..."
        value="booking"
        onSearchChange={() => {}}
        isLoading={true}
      />
    </div>
  ),
};

/**
 * HeaderSearch with no results
 */
export const SearchNoResults: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('xyzabc123');

    return (
      <div style={{ padding: 'var(--ds-spacing-6)', maxWidth: '600px' }}>
        <HeaderSearch
          placeholder="Søk..."
          value={searchValue}
          onSearchChange={setSearchValue}
          results={[]}
          noResultsText="Ingen resultater funnet"
        />
      </div>
    );
  },
};

/**
 * Theme toggle
 */
export const ThemeToggle: Story = {
  render: () => {
    const [isDark, setIsDark] = useState(false);

    return (
      <div style={{
        padding: 'var(--ds-spacing-6)',
        backgroundColor: isDark ? '#1a1a2e' : 'var(--ds-color-neutral-background-default)',
        transition: 'background-color 0.3s ease',
      }}>
        <HeaderThemeToggle
          isDark={isDark}
          onToggle={() => setIsDark(!isDark)}
        />
        <Paragraph style={{ marginTop: 'var(--ds-spacing-4)', color: isDark ? '#fff' : 'inherit' }}>
          Current theme: {isDark ? 'Dark' : 'Light'}
        </Paragraph>
      </div>
    );
  },
};

/**
 * Login button states
 */
export const LoginButtonStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)', padding: 'var(--ds-spacing-6)' }}>
      <div>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Logged out
        </Paragraph>
        <HeaderLoginButton
          loginText="Logg inn"
          onLogin={() => alert('Login clicked')}
        />
      </div>
      <div>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Logged in
        </Paragraph>
        <HeaderLoginButton
          isLoggedIn
          userName="Ola Nordmann"
          logoutText="Logg ut"
          onLogout={() => alert('Logout clicked')}
        />
      </div>
      <div>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Logged in with avatar
        </Paragraph>
        <HeaderLoginButton
          isLoggedIn
          userName="Kari Hansen"
          avatarUrl="https://i.pravatar.cc/100"
          onLogout={() => alert('Logout clicked')}
        />
      </div>
    </div>
  ),
};

/**
 * Icon buttons with badges
 */
export const IconButtons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', padding: 'var(--ds-spacing-6)' }}>
      <HeaderIconButton
        icon={<BellIcon size={22} />}
        aria-label="Varsler"
      />
      <HeaderIconButton
        icon={<BellIcon size={22} />}
        badge={3}
        aria-label="Varsler (3 nye)"
      />
      <HeaderIconButton
        icon={<BellIcon size={22} />}
        badge={99}
        aria-label="Varsler (99 nye)"
      />
      <HeaderIconButton
        icon={<BellIcon size={22} />}
        badge={150}
        maxBadge={99}
        aria-label="Varsler (mange nye)"
      />
      <HeaderIconButton
        icon={<SettingsIcon size={22} />}
        badge={5}
        badgeColor="accent"
        aria-label="Innstillinger"
      />
    </div>
  ),
};

/**
 * Complete header with page header
 */
export const CompleteExample: Story = {
  render: () => {
    const [isDark, setIsDark] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    return (
      <div style={{
        minHeight: '600px',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
      }}>
        <DashboardHeader
          logo={<HeaderLogo title="Digilist" subtitle="Admin" />}
          leftSlot={<HeaderLogo title="Digilist" subtitle="Backoffice" />}
          user={sampleUser}
          searchPlaceholder="Søk i Digilist..."
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchResults={searchValue.length > 0 ? sampleSearchResults : []}
          onSearchResultSelect={(result) => console.log('Selected:', result)}
          showThemeToggle
          isDark={isDark}
          onThemeToggle={() => setIsDark(!isDark)}
          showNotifications
          notificationCount={5}
          onNotificationClick={() => console.log('Notifications')}
          onLogout={() => console.log('Logout')}
          onSettingsClick={() => console.log('Settings')}
          onProfileClick={() => console.log('Profile')}
        />
        <div style={{ padding: 'var(--ds-spacing-6)' }}>
          <DashboardPageHeader
            breadcrumb={<SampleBreadcrumb />}
            title="Idrettshall A"
            subtitle="Hovedhallen med plass til 500 tilskuere"
            badge={<Badge data-color="success">Aktiv</Badge>}
            meta={[
              { icon: <BuildingIcon size={16} />, label: 'Oslo Kommune' },
              { icon: <ChartIcon size={16} />, label: '156 bookinger denne måneden' },
            ]}
            primaryAction={
              <Button variant="primary">
                <PlusIcon size={16} />
                Ny booking
              </Button>
            }
            secondaryAction={
              <Button variant="secondary">
                <SettingsIcon size={16} />
                Rediger
              </Button>
            }
            tabs={[
              { id: 'overview', label: 'Oversikt' },
              { id: 'calendar', label: 'Kalender' },
              { id: 'bookings', label: 'Bookinger', count: 156 },
              { id: 'settings', label: 'Innstillinger' },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          <Card style={{ padding: 'var(--ds-spacing-6)' }}>
            <Paragraph>
              Content for "{activeTab}" tab
            </Paragraph>
          </Card>
        </div>
      </div>
    );
  },
};
