/**
 * FilterChip Unit Tests
 *
 * Tests for the FilterChip component from @xala/ds
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterChip } from '../../primitives/FilterChip';

describe('FilterChip', () => {
  describe('Rendering', () => {
    it('renders with label', () => {
      render(<FilterChip label="Oslo" onRemove={vi.fn()} />);
      expect(screen.getByText('Oslo')).toBeInTheDocument();
    });

    it('renders with data-testid', () => {
      render(
        <FilterChip
          label="Test"
          onRemove={vi.fn()}
          data-testid="filter-chip-test"
        />
      );
      expect(screen.getByTestId('filter-chip-test')).toBeInTheDocument();
    });

    it('renders default variant', () => {
      render(<FilterChip label="Default" onRemove={vi.fn()} />);
      const chip = screen.getByRole('button');
      expect(chip).toHaveAttribute('data-variant', 'default');
    });

    it('renders accent variant', () => {
      render(<FilterChip label="Accent" onRemove={vi.fn()} variant="accent" />);
      const chip = screen.getByRole('button');
      expect(chip).toHaveAttribute('data-variant', 'accent');
    });

    it('renders small size', () => {
      render(<FilterChip label="Small" onRemove={vi.fn()} size="sm" />);
      const chip = screen.getByRole('button');
      expect(chip).toHaveAttribute('data-size', 'sm');
    });

    it('renders medium size by default', () => {
      render(<FilterChip label="Medium" onRemove={vi.fn()} />);
      const chip = screen.getByRole('button');
      expect(chip).toHaveAttribute('data-size', 'md');
    });
  });

  describe('Interactions', () => {
    it('calls onRemove when clicked', async () => {
      const onRemove = vi.fn();
      render(<FilterChip label="Clickable" onRemove={onRemove} />);

      await userEvent.click(screen.getByRole('button'));
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('calls onRemove when Enter is pressed', async () => {
      const onRemove = vi.fn();
      render(<FilterChip label="Enter" onRemove={onRemove} />);

      const chip = screen.getByRole('button');
      chip.focus();
      await userEvent.keyboard('{Enter}');

      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('calls onRemove when Backspace is pressed', async () => {
      const onRemove = vi.fn();
      render(<FilterChip label="Backspace" onRemove={onRemove} />);

      const chip = screen.getByRole('button');
      chip.focus();
      await userEvent.keyboard('{Backspace}');

      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('calls onRemove when Delete is pressed', async () => {
      const onRemove = vi.fn();
      render(<FilterChip label="Delete" onRemove={onRemove} />);

      const chip = screen.getByRole('button');
      chip.focus();
      await userEvent.keyboard('{Delete}');

      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('does not call onRemove when disabled', async () => {
      const onRemove = vi.fn();
      render(<FilterChip label="Disabled" onRemove={onRemove} disabled />);

      await userEvent.click(screen.getByRole('button'));
      expect(onRemove).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has accessible name with label', () => {
      render(<FilterChip label="Oslo" onRemove={vi.fn()} />);
      const chip = screen.getByRole('button');
      expect(chip).toHaveAccessibleName('Fjern filter: Oslo');
    });

    it('is focusable', () => {
      render(<FilterChip label="Focusable" onRemove={vi.fn()} />);
      const chip = screen.getByRole('button');

      chip.focus();
      expect(chip).toHaveFocus();
    });

    it('has button role', () => {
      render(<FilterChip label="Button" onRemove={vi.fn()} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('is disabled when disabled prop is true', () => {
      render(<FilterChip label="Disabled" onRemove={vi.fn()} disabled />);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });
});
