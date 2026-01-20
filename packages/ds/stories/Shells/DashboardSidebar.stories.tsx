import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { DashboardSidebar, type SidebarSection } from '@xala/ds';
import { HomeIcon, CalendarIcon, SettingsIcon, UserIcon, BellIcon, InboxIcon, ChartIcon, BuildingIcon } from '@xala/ds';

/**
 * DashboardSidebar provides navigation for dashboard applications.
 *
 * ## Features
 * - Collapsible navigation sections
 * - Active state highlighting
 * - User info footer
 * - Mobile-responsive drawer mode
 * - Badge support for notifications
 *
 * ## Accessibility
 * - Semantic nav structure
 * - Keyboard navigable
 * - Active states announced
 */
const meta: Meta<typeof DashboardSidebar> = {
  title: 'Shells/DashboardSidebar',
  component: DashboardSidebar,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <div style={{ height: '600px', display: 'flex' }}>
          <Story />
          <div style={{ flex: 1, padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-background-default)' }}>
            <p>Main content area</p>
          </div>
        </div>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
DashboardSidebar is a navigation sidebar component for dashboard applications.

## Features
- Logo and title header section
- Grouped navigation items with icons
- Active state with accent highlight
- Badge support for counts/notifications
- User info footer section
- Mobile drawer mode for responsive design

## When to Use
- Dashboard applications
- Admin panels
- User portals (MinSide)
- Any app needing persistent navigation

## data-testid
- Sidebar: \`data-testid="dashboard-sidebar"\`
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DashboardSidebar>;

// Sample logo
const SampleLogo = () => (
  <div style={{
    width: '40px',
    height: '40px',
    borderRadius: 'var(--ds-border-radius-md)',
    backgroundColor: 'var(--ds-color-accent-base-default)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
  }}>
    D
  </div>
);

// Sample navigation sections
const defaultSections: SidebarSection[] = [
  {
    title: 'Oversikt',
    items: [
      {
        name: 'Hjem',
        description: 'Din startside',
        href: '/',
        icon: <HomeIcon size={24} />,
      },
      {
        name: 'Mine bookinger',
        description: 'Se og administrer bookinger',
        href: '/bookings',
        icon: <CalendarIcon size={24} />,
        badge: 3,
      },
      {
        name: 'Meldinger',
        description: 'Samtaler og varsler',
        href: '/messages',
        icon: <InboxIcon size={24} />,
        badge: 5,
        badgeColor: 'danger',
      },
    ],
  },
  {
    title: 'Administrasjon',
    items: [
      {
        name: 'Rapporter',
        description: 'Statistikk og analyser',
        href: '/reports',
        icon: <ChartIcon size={24} />,
      },
      {
        name: 'Organisasjoner',
        description: 'Administrer organisasjoner',
        href: '/organizations',
        icon: <BuildingIcon size={24} />,
      },
    ],
  },
  {
    title: 'Innstillinger',
    items: [
      {
        name: 'Profil',
        description: 'Din profil og konto',
        href: '/profile',
        icon: <UserIcon size={24} />,
      },
      {
        name: 'Varsler',
        description: 'Varslingsinnstillinger',
        href: '/notifications',
        icon: <BellIcon size={24} />,
      },
      {
        name: 'Innstillinger',
        description: 'Systeminnstillinger',
        href: '/settings',
        icon: <SettingsIcon size={24} />,
      },
    ],
  },
];

const sampleUser = {
  name: 'Ola Nordmann',
  email: 'ola.nordmann@example.com',
};

/**
 * Default sidebar with all sections
 */
export const Default: Story = {
  args: {
    logo: <SampleLogo />,
    title: 'Digilist',
    subtitle: 'Min Side',
    sections: defaultSections,
    user: sampleUser,
  },
};

/**
 * Sidebar without user info
 */
export const WithoutUser: Story = {
  args: {
    logo: <SampleLogo />,
    title: 'Digilist',
    subtitle: 'Admin',
    sections: defaultSections,
  },
};

/**
 * Sidebar without subtitle
 */
export const WithoutSubtitle: Story = {
  args: {
    logo: <SampleLogo />,
    title: 'Digilist',
    sections: defaultSections,
    user: sampleUser,
  },
};

/**
 * Minimal sidebar (no sections titles)
 */
export const MinimalSections: Story = {
  args: {
    logo: <SampleLogo />,
    title: 'App',
    sections: [
      {
        items: [
          { name: 'Dashboard', description: 'Overview', href: '/', icon: <HomeIcon size={24} /> },
          { name: 'Calendar', description: 'Bookings', href: '/calendar', icon: <CalendarIcon size={24} /> },
          { name: 'Settings', description: 'Preferences', href: '/settings', icon: <SettingsIcon size={24} /> },
        ],
      },
    ],
    user: sampleUser,
  },
};

/**
 * Narrower width
 */
export const NarrowWidth: Story = {
  args: {
    logo: <SampleLogo />,
    title: 'Digilist',
    sections: defaultSections,
    user: sampleUser,
    width: 300,
  },
};

/**
 * Wider width
 */
export const WideWidth: Story = {
  args: {
    logo: <SampleLogo />,
    title: 'Digilist',
    sections: defaultSections,
    user: sampleUser,
    width: 500,
  },
};

/**
 * With many badges
 */
export const WithBadges: Story = {
  args: {
    logo: <SampleLogo />,
    title: 'Digilist',
    subtitle: 'Notifications Demo',
    sections: [
      {
        title: 'Navigation',
        items: [
          { name: 'Inbox', description: 'New messages', href: '/inbox', icon: <InboxIcon size={24} />, badge: 12 },
          { name: 'Tasks', description: 'Pending tasks', href: '/tasks', icon: <CalendarIcon size={24} />, badge: 5 },
          { name: 'Alerts', description: 'System alerts', href: '/alerts', icon: <BellIcon size={24} />, badge: 99 },
        ],
      },
    ],
    user: sampleUser,
  },
};

/**
 * Backoffice admin layout
 */
export const BackofficeLayout: Story = {
  args: {
    logo: <SampleLogo />,
    title: 'Backoffice',
    subtitle: 'Administrator',
    sections: [
      {
        title: 'Dashboard',
        items: [
          { name: 'Oversikt', description: 'Hovedoversikt', href: '/', icon: <HomeIcon size={24} /> },
          { name: 'Rapporter', description: 'Statistikk', href: '/reports', icon: <ChartIcon size={24} /> },
        ],
      },
      {
        title: 'Booking',
        items: [
          { name: 'Alle bookinger', description: 'Se alle bookinger', href: '/bookings', icon: <CalendarIcon size={24} />, badge: 15 },
          { name: 'Ventende', description: 'Godkjenning påkrevd', href: '/pending', icon: <InboxIcon size={24} />, badge: 3 },
        ],
      },
      {
        title: 'Brukere',
        items: [
          { name: 'Brukeradministrasjon', description: 'Administrer brukere', href: '/users', icon: <UserIcon size={24} /> },
          { name: 'Organisasjoner', description: 'Administrer org', href: '/orgs', icon: <BuildingIcon size={24} /> },
        ],
      },
    ],
    user: {
      name: 'Admin User',
      email: 'admin@kommune.no',
    },
  },
};
