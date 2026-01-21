import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table } from '@xalatechnologies/platform/ui';

const meta: Meta = {
  title: 'Components/Table',
  parameters: {
    docs: {
      description: {
        component: `
Native Table component for displaying tabular data.

## When to Use
- Display structured data
- Data comparison
- Simple data grids

## Accessibility
- Uses semantic table elements
- Caption for table description
- Proper header associations
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Table>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Location</Table.HeaderCell>
          <Table.HeaderCell>Capacity</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Tennis Court A</Table.Cell>
          <Table.Cell>Building 1</Table.Cell>
          <Table.Cell>4</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Football Field</Table.Cell>
          <Table.Cell>Outdoor</Table.Cell>
          <Table.Cell>22</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Swimming Pool</Table.Cell>
          <Table.Cell>Building 2</Table.Cell>
          <Table.Cell>30</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  ),
};

export const WithCaption: Story = {
  render: () => (
    <Table>
      <caption>Available Resources</caption>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Resource</Table.HeaderCell>
          <Table.HeaderCell>Price/hour</Table.HeaderCell>
          <Table.HeaderCell>Available</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Tennis Court</Table.Cell>
          <Table.Cell>200 kr</Table.Cell>
          <Table.Cell>Yes</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Basketball Court</Table.Cell>
          <Table.Cell>300 kr</Table.Cell>
          <Table.Cell>No</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  ),
};

export const Zebra: Story = {
  render: () => (
    <Table zebra>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Date</Table.HeaderCell>
          <Table.HeaderCell>Booking</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Row>
          <Table.Cell>2024-01-15</Table.Cell>
          <Table.Cell>Tennis Court A</Table.Cell>
          <Table.Cell>Confirmed</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>2024-01-16</Table.Cell>
          <Table.Cell>Swimming Pool</Table.Cell>
          <Table.Cell>Pending</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>2024-01-17</Table.Cell>
          <Table.Cell>Football Field</Table.Cell>
          <Table.Cell>Confirmed</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>2024-01-18</Table.Cell>
          <Table.Cell>Gym</Table.Cell>
          <Table.Cell>Cancelled</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-8)' }}>
      <Table data-size="sm">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Small</Table.HeaderCell>
            <Table.HeaderCell>Table</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Data 1</Table.Cell>
            <Table.Cell>Data 2</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <Table data-size="md">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Medium</Table.HeaderCell>
            <Table.HeaderCell>Table</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Data 1</Table.Cell>
            <Table.Cell>Data 2</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <Table data-size="lg">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Large</Table.HeaderCell>
            <Table.HeaderCell>Table</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Data 1</Table.Cell>
            <Table.Cell>Data 2</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </div>
  ),
};
