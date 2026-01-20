import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pagination } from '@digdir/designsystemet-react';
import { usePagination } from '@digdir/designsystemet-react';

const meta: Meta = {
  title: 'Components/Pagination',
  parameters: {
    docs: {
      description: {
        component: `
Pagination for navigating through pages of content.

## When to Use
- Large data sets split across pages
- Search results
- Tables with many rows

## Accessibility
- Keyboard: Arrow keys navigate, Enter selects
- Current page announced to screen readers
- Clear indication of current position
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: function Render() {
    const pagination = usePagination({ currentPage: 1, totalPages: 10 });
    return <Pagination {...pagination} aria-label="Pagination" />;
  },
};

export const ManyPages: Story = {
  render: function Render() {
    const pagination = usePagination({ currentPage: 5, totalPages: 50 });
    return <Pagination {...pagination} aria-label="Pagination with many pages" />;
  },
};

export const FewPages: Story = {
  render: function Render() {
    const pagination = usePagination({ currentPage: 1, totalPages: 3 });
    return <Pagination {...pagination} aria-label="Pagination with few pages" />;
  },
};

export const MiddlePage: Story = {
  render: function Render() {
    const pagination = usePagination({ currentPage: 5, totalPages: 10 });
    return <Pagination {...pagination} aria-label="Middle page pagination" />;
  },
};

export const Sizes: Story = {
  render: function Render() {
    const pagination1 = usePagination({ currentPage: 1, totalPages: 5 });
    const pagination2 = usePagination({ currentPage: 1, totalPages: 5 });
    const pagination3 = usePagination({ currentPage: 1, totalPages: 5 });
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
        <div>
          <p style={{ marginBottom: 'var(--ds-spacing-2)' }}>Small</p>
          <Pagination {...pagination1} data-size="sm" aria-label="Small pagination" />
        </div>
        <div>
          <p style={{ marginBottom: 'var(--ds-spacing-2)' }}>Medium</p>
          <Pagination {...pagination2} data-size="md" aria-label="Medium pagination" />
        </div>
        <div>
          <p style={{ marginBottom: 'var(--ds-spacing-2)' }}>Large</p>
          <Pagination {...pagination3} data-size="lg" aria-label="Large pagination" />
        </div>
      </div>
    );
  },
};
