/**
 * ListToolbar Unit Tests
 *
 * Tests for the ListToolbar component from @xala/ds
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListToolbar } from '../composed/ListToolbar';

describe('ListToolbar', () => {
  describe('Rendering', () => {
    it('renders with default testid', () => {
      render(<ListToolbar />);
      expect(screen.getByTestId('list-toolbar')).toBeInTheDocument();
    });

    it('renders with custom testid', () => {
      render(<ListToolbar data-testid="custom-toolbar" />);
      expect(screen.getByTestId('custom-toolbar')).toBeInTheDocument();
    });

    it('renders results count when provided', () => {
      render(<ListToolbar resultsCount={42} resultsLabel="items" />);
      expect(screen.getByTestId('list-toolbar-results-count')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('items')).toBeInTheDocument();
    });

    it('renders primary action slot', () => {
      render(
        <ListToolbar
          primaryAction={<button data-testid="primary-action">Create</button>}
        />
      );
      expect(screen.getByTestId('primary-action')).toBeInTheDocument();
    });
  });

  describe('Search', () => {
    it('renders search input when search config provided', () => {
      render(
        <ListToolbar
          search={{
            value: '',
            onChange: vi.fn(),
            placeholder: 'Search...',
          }}
        />
      );
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('calls onChange with debounced value', async () => {
      const onChange = vi.fn();
      render(
        <ListToolbar
          search={{
            value: '',
            onChange,
            placeholder: 'Search...',
            debounceMs: 100,
          }}
        />
      );

      const input = screen.getByPlaceholderText('Search...');
      await userEvent.type(input, 'test');

      // Wait for debounce
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('test');
      }, { timeout: 500 });
    });
  });

  describe('Filters', () => {
    const statusFilter = {
      id: 'status',
      label: 'Status',
      options: [
        { id: 'all', label: 'All', count: 10 },
        { id: 'confirmed', label: 'Confirmed', count: 5 },
        { id: 'pending', label: 'Pending', count: 3 },
      ],
    };

    it('renders filter buttons', () => {
      render(<ListToolbar filters={[statusFilter]} />);
      
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('shows filter counts when showFilterCounts is true', () => {
      render(<ListToolbar filters={[statusFilter]} showFilterCounts={true} />);
      
      expect(screen.getByText('(10)')).toBeInTheDocument();
      expect(screen.getByText('(5)')).toBeInTheDocument();
      expect(screen.getByText('(3)')).toBeInTheDocument();
    });

    it('calls onFilterChange when filter clicked', async () => {
      const onFilterChange = vi.fn();
      render(
        <ListToolbar
          filters={[statusFilter]}
          onFilterChange={onFilterChange}
        />
      );

      await userEvent.click(screen.getByText('Confirmed'));
      expect(onFilterChange).toHaveBeenCalledWith('status', 'confirmed');
    });

    it('highlights active filter', () => {
      render(
        <ListToolbar
          filters={[statusFilter]}
          activeFilters={{ status: 'confirmed' }}
        />
      );

      const confirmedButton = screen.getByTestId('list-toolbar-filter-status-confirmed');
      expect(confirmedButton).toHaveAttribute('data-color', 'accent');
    });

    it('toggles filter off when clicked again', async () => {
      const onFilterChange = vi.fn();
      render(
        <ListToolbar
          filters={[statusFilter]}
          activeFilters={{ status: 'confirmed' }}
          onFilterChange={onFilterChange}
        />
      );

      await userEvent.click(screen.getByText('Confirmed'));
      expect(onFilterChange).toHaveBeenCalledWith('status', undefined);
    });
  });

  describe('Sort', () => {
    const sortOptions = [
      { id: 'date-asc', label: 'Date (oldest)' },
      { id: 'date-desc', label: 'Date (newest)' },
    ];

    it('renders sort dropdown when options provided', () => {
      render(
        <ListToolbar
          sortOptions={sortOptions}
          sortValue="date-asc"
          onSortChange={vi.fn()}
        />
      );

      expect(screen.getByTestId('list-toolbar-sort')).toBeInTheDocument();
    });

    it('calls onSortChange when sort changed', async () => {
      const onSortChange = vi.fn();
      render(
        <ListToolbar
          sortOptions={sortOptions}
          sortValue="date-asc"
          onSortChange={onSortChange}
        />
      );

      const select = screen.getByTestId('list-toolbar-sort');
      fireEvent.change(select, { target: { value: 'date-desc' } });

      expect(onSortChange).toHaveBeenCalledWith('date-desc');
    });
  });

  describe('Variants', () => {
    it('renders default variant', () => {
      const { container } = render(<ListToolbar variant="default" />);
      expect(container.firstChild).toHaveStyle({ gap: 'var(--ds-spacing-4)' });
    });

    it('renders compact variant', () => {
      const { container } = render(<ListToolbar variant="compact" />);
      expect(container.firstChild).toHaveStyle({ gap: 'var(--ds-spacing-3)' });
    });
  });

  describe('Accessibility', () => {
    it('search input has accessible label', () => {
      render(
        <ListToolbar
          search={{
            value: '',
            onChange: vi.fn(),
            placeholder: 'Search bookings',
          }}
        />
      );

      expect(screen.getByRole('searchbox')).toHaveAccessibleName('Search bookings');
    });

    it('filter buttons are keyboard accessible', async () => {
      const onFilterChange = vi.fn();
      render(
        <ListToolbar
          filters={[{
            id: 'status',
            label: 'Status',
            options: [{ id: 'all', label: 'All' }],
          }]}
          onFilterChange={onFilterChange}
        />
      );

      const button = screen.getByText('All');
      button.focus();
      await userEvent.keyboard('{Enter}');

      expect(onFilterChange).toHaveBeenCalled();
    });

    it('filter buttons have minimum 44px touch target', () => {
      render(
        <ListToolbar
          filters={[{
            id: 'status',
            label: 'Status',
            options: [{ id: 'all', label: 'All' }],
          }]}
        />
      );

      const button = screen.getByText('All');
      expect(button).toHaveStyle({ minHeight: '44px' });
    });
  });
});
