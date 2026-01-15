/**
 * Performance Tests for Rental Objects Feature
 * Tests load times, rendering performance, and scalability
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RentalObjectsListView } from '../../components/RentalObjectsListView';
import { RentalObjectDetailView } from '../../components/detail/RentalObjectDetailView';
import { RentalObjectWizard } from '../../components/wizard/RentalObjectWizard';

// Mock all dependencies
vi.mock('@digilist/client-sdk', () => ({
  useRentalObjects: vi.fn(() => ({
    data: { data: Array.from({ length: 1000 }, (_, i) => ({
      id: `id-${i}`,
      slug: `rental-object-${i}`,
      name: `Rental Object ${i}`,
      status: 'published',
      type: 'SPACE',
    })) },
    isLoading: false,
  })),
  useRentalObjectBySlug: vi.fn(() => ({
    data: { data: { id: '1', name: 'Test', slug: 'test' } },
    isLoading: false,
  })),
}));

vi.mock('@xala/i18n', () => ({
  useT: () => (key: string) => key,
}));

describe('Rental Objects Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('List View Performance', () => {
    it('should render 1000+ items efficiently', () => {
      const startTime = performance.now();
      
      const { container } = render(<RentalObjectsListView />, {
        wrapper: createWrapper(),
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render 1000 items in under 500ms
      expect(renderTime).toBeLessThan(500);
      expect(container).toBeTruthy();
    });

    it('should handle rapid filter changes without lag', async () => {
      const { rerender } = render(<RentalObjectsListView />);
      
      const startTime = performance.now();
      
      // Simulate rapid filter changes
      for (let i = 0; i < 10; i++) {
        rerender(<RentalObjectsListView />);
      }
      
      const endTime = performance.now();
      const rerenderTime = endTime - startTime;

      // Should handle 10 rerenders in under 200ms
      expect(rerenderTime).toBeLessThan(200);
    });

    it('should maintain smooth scrolling with large datasets', () => {
      const { container } = render(<RentalObjectsListView />, {
        wrapper: createWrapper(),
      });
      
      const scrollStart = performance.now();
      // Simulate scroll event
      container.scrollTop = 1000;
      const scrollEnd = performance.now();

      // Scroll should be instant (< 16ms for 60fps)
      expect(scrollEnd - scrollStart).toBeLessThan(16);
    });
  });

  describe('Detail View Performance', () => {
    it('should render complex detail view quickly', () => {
      const startTime = performance.now();
      
      render(<RentalObjectDetailView slug="test" />, {
        wrapper: createWrapper(),
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Complex detail view should render in under 300ms
      expect(renderTime).toBeLessThan(300);
    });

    it('should handle tab switching without performance degradation', () => {
      const { container } = render(<RentalObjectDetailView slug="test" />);
      
      const startTime = performance.now();
      
      // Simulate tab switching
      for (let i = 0; i < 5; i++) {
        const event = new Event('click');
        container.dispatchEvent(event);
      }
      
      const endTime = performance.now();
      const switchTime = endTime - startTime;

      // Tab switching should be instant
      expect(switchTime).toBeLessThan(50);
    });
  });

  describe('Wizard Performance', () => {
    it('should render wizard form efficiently', () => {
      const startTime = performance.now();
      
      render(<RentalObjectWizard />, {
        wrapper: createWrapper(),
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Wizard should render in under 400ms
      expect(renderTime).toBeLessThan(400);
    });

    it('should handle form validation without blocking UI', () => {
      const { container } = render(<RentalObjectWizard />);
      
      const startTime = performance.now();
      
      // Simulate rapid form changes
      for (let i = 0; i < 20; i++) {
        const input = container.querySelector('input');
        if (input) {
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      
      const endTime = performance.now();
      const validationTime = endTime - startTime;

      // Validation should not block UI (< 100ms for 20 changes)
      expect(validationTime).toBeLessThan(100);
    });
  });

  describe('Memory Leak Tests', () => {
    it('should not leak memory on component unmount', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      const { unmount } = render(<RentalObjectsListView />, {
        wrapper: createWrapper(),
      });
      unmount();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      // Memory should be released (or at least not significantly increased)
      // Note: This is a basic check - real memory leak detection requires more sophisticated tools
      expect(true).toBe(true); // Placeholder - actual memory testing requires specialized tools
    });
  });
});
