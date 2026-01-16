/**
 * ErrorBoundary Component Tests
 *
 * Tests for error boundary functionality and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';

// Mock Sentry
vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
}));

// Mock @xala/ds ErrorScreen component
vi.mock('@xala/ds', () => ({
  ErrorScreen: ({
    title,
    description,
    showRetryButton,
    retryButtonText,
    onRetry,
  }: {
    title: string;
    description: string;
    showRetryButton: boolean;
    retryButtonText: string;
    onRetry: () => void;
  }) => (
    <div data-testid="error-screen">
      <h1>{title}</h1>
      <p>{description}</p>
      {showRetryButton && (
        <button type="button" onClick={onRetry}>
          {retryButtonText}
        </button>
      )}
    </div>
  ),
}));

// Import after mocking
import { ErrorBoundary } from './ErrorBoundary';
import * as Sentry from '@sentry/react';

// Test component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Child component</div>;
};

describe('ErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Mock console.error to prevent error output in tests
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(Sentry.captureException).mockClear();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Normal Rendering', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
      expect(screen.queryByTestId('error-screen')).not.toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <ErrorBoundary>
          <div>First child</div>
          <div>Second child</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
    });

    it('should render nested components', () => {
      const NestedComponent = () => <div>Nested content</div>;

      render(
        <ErrorBoundary>
          <NestedComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Nested content')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should catch errors from child components', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('error-screen')).toBeInTheDocument();
      expect(screen.queryByText('Child component')).not.toBeInTheDocument();
    });

    it('should display default error screen when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Noe gikk galt')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should show retry button with correct text', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: 'Last siden på nytt' });
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveAttribute('type', 'button');
    });

    it('should display error message in description', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should show fallback message when error has no message', () => {
      const ThrowErrorWithoutMessage = () => {
        throw new Error();
      };

      render(
        <ErrorBoundary>
          <ThrowErrorWithoutMessage />
        </ErrorBoundary>
      );

      expect(screen.getByText('En uventet feil har oppstått. Vennligst prøv igjen.')).toBeInTheDocument();
    });

    it('should call console.error when error is caught', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error caught by ErrorBoundary:',
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryByTestId('error-screen')).not.toBeInTheDocument();
    });

    it('should not render default error screen when custom fallback is provided', () => {
      const customFallback = <div>Custom fallback</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Noe gikk galt')).not.toBeInTheDocument();
      expect(screen.queryByTestId('error-screen')).not.toBeInTheDocument();
    });
  });

  describe('Sentry Integration', () => {
    it('should report error to Sentry', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(vi.mocked(Sentry.captureException)).toHaveBeenCalledTimes(1);
    });

    it('should report error with component stack context', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(vi.mocked(Sentry.captureException)).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          contexts: {
            react: {
              componentStack: expect.any(String),
            },
          },
        })
      );
    });

    it('should report correct error instance to Sentry', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const sentryCall = vi.mocked(Sentry.captureException).mock.calls[0];
      const error = sentryCall[0];

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error message');
    });
  });

  describe('Retry Functionality', () => {
    let reloadMock: () => void;
    let originalLocation: Location;

    beforeEach(() => {
      // Save original location
      originalLocation = window.location;

      // Mock window.location.reload
      reloadMock = vi.fn();

      // Delete and redefine location with reload mock
      delete (window as any).location;
      window.location = { ...originalLocation, reload: reloadMock } as Location;
    });

    afterEach(() => {
      // Restore original location
      window.location = originalLocation;
      vi.clearAllMocks();
    });

    it('should reload page when retry button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: 'Last siden på nytt' });
      await user.click(retryButton);

      expect(reloadMock).toHaveBeenCalledTimes(1);
    });

    it('should reset error state before reloading', async () => {
      const user = userEvent.setup();

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: 'Last siden på nytt' });
      await user.click(retryButton);

      // Window.location.reload should be called
      expect(reloadMock).toHaveBeenCalled();
    });
  });

  describe('Component Lifecycle', () => {
    it('should use getDerivedStateFromError to update state', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Error screen should be rendered, indicating state was updated
      expect(screen.getByTestId('error-screen')).toBeInTheDocument();
    });

    it('should call componentDidCatch with error and errorInfo', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Console.error should be called with error and errorInfo
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error caught by ErrorBoundary:',
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );

      // Sentry should be called with proper context
      expect(vi.mocked(Sentry.captureException)).toHaveBeenCalled();
    });

    it('should maintain error state after re-render', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('error-screen')).toBeInTheDocument();

      // Re-render with same props
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Error screen should still be displayed
      expect(screen.getByTestId('error-screen')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle errors with special characters in message', () => {
      const ThrowSpecialError = () => {
        throw new Error('Error with <special> & "characters"');
      };

      render(
        <ErrorBoundary>
          <ThrowSpecialError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error with <special> & "characters"')).toBeInTheDocument();
    });

    it('should handle errors with very long messages', () => {
      const longMessage = 'A'.repeat(500);
      const ThrowLongError = () => {
        throw new Error(longMessage);
      };

      render(
        <ErrorBoundary>
          <ThrowLongError />
        </ErrorBoundary>
      );

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle errors with multiline messages', () => {
      const ThrowMultilineError = () => {
        throw new Error('Line 1\nLine 2\nLine 3');
      };

      render(
        <ErrorBoundary>
          <ThrowMultilineError />
        </ErrorBoundary>
      );

      // Use getByText with a matcher function for multiline content
      expect(screen.getByText((content, element) => {
        return element?.tagName === 'P' && content.includes('Line 1');
      })).toBeInTheDocument();
    });

    it('should not catch errors when children update without error', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Child component')).toBeInTheDocument();

      // Update children without error
      rerender(
        <ErrorBoundary>
          <div>Updated content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Updated content')).toBeInTheDocument();
      expect(screen.queryByTestId('error-screen')).not.toBeInTheDocument();
    });

    it('should handle null children', () => {
      render(<ErrorBoundary>{null}</ErrorBoundary>);

      expect(screen.queryByTestId('error-screen')).not.toBeInTheDocument();
    });

    it('should handle undefined children', () => {
      render(<ErrorBoundary>{undefined}</ErrorBoundary>);

      expect(screen.queryByTestId('error-screen')).not.toBeInTheDocument();
    });

    it('should handle empty fragment children', () => {
      render(
        <ErrorBoundary>
          <></>
        </ErrorBoundary>
      );

      expect(screen.queryByTestId('error-screen')).not.toBeInTheDocument();
    });
  });

  describe('Design Token Compliance', () => {
    it('should pass through ErrorScreen component for styling', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // ErrorScreen component should be rendered (mocked in this test)
      const errorScreen = screen.getByTestId('error-screen');
      expect(errorScreen).toBeInTheDocument();
    });

    it('should render retry button with proper attributes', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: 'Last siden på nytt' });
      expect(retryButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Accessibility', () => {
    it('should render button with proper type attribute', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const button = screen.getByRole('button', { name: 'Last siden på nytt' });
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should have proper heading hierarchy in error screen', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const heading = screen.getByText('Noe gikk galt');
      expect(heading.tagName).toBe('H1');
    });

    it('should have descriptive error message for screen readers', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const description = screen.getByText('Test error message');
      expect(description).toBeInTheDocument();
    });
  });

  describe('Norwegian Text', () => {
    it('should display correct Norwegian error title', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Noe gikk galt')).toBeInTheDocument();
    });

    it('should display correct Norwegian retry button text', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: 'Last siden på nytt' })).toBeInTheDocument();
    });

    it('should display correct Norwegian fallback message', () => {
      const ThrowErrorWithoutMessage = () => {
        throw new Error();
      };

      render(
        <ErrorBoundary>
          <ThrowErrorWithoutMessage />
        </ErrorBoundary>
      );

      expect(screen.getByText('En uventet feil har oppstått. Vennligst prøv igjen.')).toBeInTheDocument();
    });
  });
});
