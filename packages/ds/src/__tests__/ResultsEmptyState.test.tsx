/**
 * ResultsEmptyState Unit Tests
 *
 * Tests for the ResultsEmptyState component from @xala/ds
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultsEmptyState } from '../../blocks/ResultsEmptyState';

describe('ResultsEmptyState', () => {
  describe('Rendering', () => {
    it('renders no-results variant by default', () => {
      render(<ResultsEmptyState />);
      const state = screen.getByRole('status');
      expect(state).toHaveAttribute('data-variant', 'no-results');
    });

    it('renders default title for no-results', () => {
      render(<ResultsEmptyState variant="no-results" />);
      expect(screen.getByText('Ingen resultater')).toBeInTheDocument();
    });

    it('renders default title for no-data', () => {
      render(<ResultsEmptyState variant="no-data" />);
      expect(screen.getByText('Ingen data tilgjengelig')).toBeInTheDocument();
    });

    it('renders default title for error', () => {
      render(<ResultsEmptyState variant="error" />);
      expect(screen.getByText('Noe gikk galt')).toBeInTheDocument();
    });

    it('renders custom title', () => {
      render(<ResultsEmptyState title="Custom Title" />);
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('renders custom description', () => {
      render(<ResultsEmptyState description="Custom description text" />);
      expect(screen.getByText('Custom description text')).toBeInTheDocument();
    });

    it('renders action button', async () => {
      const onClick = vi.fn();
      render(
        <ResultsEmptyState
          action={<button onClick={onClick}>Clear Filters</button>}
        />
      );

      const button = screen.getByRole('button', { name: 'Clear Filters' });
      expect(button).toBeInTheDocument();

      await userEvent.click(button);
      expect(onClick).toHaveBeenCalled();
    });

    it('renders custom icon', () => {
      render(
        <ResultsEmptyState
          icon={<svg data-testid="custom-icon" />}
        />
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('renders with data-testid', () => {
      render(<ResultsEmptyState data-testid="empty-state" />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has status role for no-results', () => {
      render(<ResultsEmptyState variant="no-results" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has alert role for error variant', () => {
      render(<ResultsEmptyState variant="error" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('has aria-live polite for no-results', () => {
      render(<ResultsEmptyState variant="no-results" />);
      const state = screen.getByRole('status');
      expect(state).toHaveAttribute('aria-live', 'polite');
    });

    it('has aria-live assertive for error', () => {
      render(<ResultsEmptyState variant="error" />);
      const state = screen.getByRole('alert');
      expect(state).toHaveAttribute('aria-live', 'assertive');
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      render(<ResultsEmptyState className="custom-class" />);
      const state = screen.getByRole('status');
      expect(state).toHaveClass('custom-class');
    });
  });
});
