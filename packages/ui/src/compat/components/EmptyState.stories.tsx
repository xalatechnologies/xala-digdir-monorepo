import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState';
import { CalendarIcon, SearchIcon, BookOpenIcon, BellIcon } from '../icons';

const meta = {
  title: 'Compat/Feedback/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Empty state display component for when there is no data to show.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Ingen bookinger funnet',
    description: 'Du har ingen bookinger ennå.',
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Ingen bookinger funnet',
    description: 'Du har ingen bookinger ennå. Opprett din første booking for å komme i gang.',
    icon: <CalendarIcon size={48} />,
  },
};

export const WithAction: Story = {
  args: {
    title: 'Ingen bookinger funnet',
    description: 'Du har ingen bookinger ennå.',
    icon: <CalendarIcon size={48} />,
    action: {
      label: 'Opprett booking',
      onClick: () => alert('Create booking'),
    },
  },
};

export const WithBothActions: Story = {
  args: {
    title: 'Ingen resultater',
    description: 'Ingen resultater matcher søket ditt. Prøv et annet søk eller fjern filtrene.',
    icon: <SearchIcon size={48} />,
    action: {
      label: 'Fjern filtre',
      onClick: () => alert('Clear filters'),
    },
    secondaryAction: {
      label: 'Hjelp',
      onClick: () => alert('Show help'),
    },
  },
};

export const NoMessages: Story = {
  args: {
    title: 'Ingen meldinger',
    description: 'Du har ingen meldinger i innboksen din.',
    icon: <BookOpenIcon size={48} />,
    action: {
      label: 'Send melding',
      onClick: () => alert('Send message'),
    },
  },
};

export const NoNotifications: Story = {
  args: {
    title: 'Ingen varsler',
    description: 'Du har ingen nye varsler. Varsler vises her når det skjer noe nytt.',
    icon: <BellIcon size={48} />,
  },
};
