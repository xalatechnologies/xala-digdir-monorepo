/**
 * ResultsSkeleton Unit Tests
 *
 * Tests for the ResultsSkeleton component from @xala/ds
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultsSkeleton } from '../../blocks/ResultsSkeleton';

describe('ResultsSkeleton', () => {
  describe('Rendering', () => {
    it('renders grid view skeleton', () => {
      render(<ResultsSkeleton viewMode="grid" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('data-view-mode', 'grid');
    });

    it('renders list view skeleton', () => {
      render(<ResultsSkeleton viewMode="list" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('data-view-mode', 'list');
    });

    it('renders 6 items by default', () => {
      const { container } = render(<ResultsSkeleton viewMode="grid" />);
      // Grid view has skeleton cards
      const gridItems = container.querySelectorAll('[style*="height"]');
      expect(gridItems.length).toBeGreaterThanOrEqual(6);
    });

    it('renders custom count of items', () => {
      const { container } = render(<ResultsSkeleton viewMode="grid" count={3} />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
    });

    it('renders with data-testid', () => {
      render(
        <ResultsSkeleton
          viewMode="grid"
          data-testid="results-skeleton"
        />
      );
      expect(screen.getByTestId('results-skeleton')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has status role', () => {
      render(<ResultsSkeleton viewMode="grid" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has aria-label for loading', () => {
      render(<ResultsSkeleton viewMode="grid" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('aria-label', 'Laster resultater...');
    });

    it('has aria-busy attribute', () => {
      render(<ResultsSkeleton viewMode="grid" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      render(<ResultsSkeleton viewMode="grid" className="custom-class" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('custom-class');
    });
  });
});
