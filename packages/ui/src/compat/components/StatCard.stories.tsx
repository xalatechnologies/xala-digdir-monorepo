import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatCard } from './StatCard';
import { CalendarIcon, UsersIcon, CheckCircleIcon, BarChartIcon } from '../icons';

const meta = {
  title: 'Compat/Status/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Statistics/KPI display card for dashboards and overview pages.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'success', 'warning', 'danger', 'neutral'],
    },
    trend: {
      control: 'object',
    },
    onClick: { action: 'clicked' },
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Totalt antall bookinger',
    value: '1,234',
    description: 'Denne måneden',
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Aktive bookinger',
    value: 42,
    description: 'I dag',
    icon: <CalendarIcon size={24} />,
  },
};

export const WithTrendUp: Story = {
  args: {
    title: 'Nye brukere',
    value: '156',
    description: 'Siste 30 dager',
    icon: <UsersIcon size={24} />,
    trend: { value: 12, direction: 'up' },
  },
};

export const WithTrendDown: Story = {
  args: {
    title: 'Kanselleringer',
    value: '23',
    description: 'Siste uke',
    trend: { value: 8, direction: 'down' },
  },
};

export const Clickable: Story = {
  args: {
    title: 'Venter på godkjenning',
    value: '7',
    description: 'Klikk for detaljer',
    icon: <CheckCircleIcon size={24} />,
    onClick: () => alert('Clicked!'),
  },
};

export const Dashboard: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 200px)', gap: '16px' }}>
      <StatCard
        title="Totalt bookinger"
        value="1,234"
        description="Denne måneden"
        icon={<CalendarIcon size={24} />}
        trend={{ value: 12, direction: 'up' }}
      />
      <StatCard
        title="Aktive brukere"
        value="856"
        description="I dag"
        icon={<UsersIcon size={24} />}
        trend={{ value: 5, direction: 'up' }}
      />
      <StatCard
        title="Fullførte"
        value="432"
        description="Denne uken"
        icon={<CheckCircleIcon size={24} />}
      />
      <StatCard
        title="Inntekt"
        value="kr 125,430"
        description="Denne måneden"
        icon={<BarChartIcon size={24} />}
        trend={{ value: 18, direction: 'up' }}
      />
    </div>
  ),
};
