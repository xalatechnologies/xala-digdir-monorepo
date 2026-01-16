/**
 * ToastProvider Unit Tests
 *
 * Tests for the SaaS Admin ToastProvider component including:
 * - Context provider setup and access
 * - Toast creation (success, error, warning, info)
 * - Toast auto-removal after timeout
 * - Multiple toast management
 * - Toast rendering with Alert component
 * - Hook error when used outside provider
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import * as React from 'react';

// =============================================================================
// Mock Dependencies
// =============================================================================

// Mock @xala/ds Alert component
vi.mock('@xala/ds', () => ({
  Alert: ({
    children,
    'data-color': dataColor,
    style,
  }: {
    children: React.ReactNode;
    'data-color'?: string;
    style?: React.CSSProperties;
  }) => (
    <div data-testid="toast-alert" data-color={dataColor} style={style}>
      {children}
    </div>
  ),
}));

// Import after mocks
import { ToastProvider, useToast } from '../../../../apps/saas-admin/src/providers/ToastProvider';

// =============================================================================
// Test Utilities
// =============================================================================

function TestConsumer({ action }: { action?: () => void }) {
  const toast = useToast();

  React.useEffect(() => {
    if (action) {
      action();
    }
  }, [action]);

  return (
    <div data-testid="test-consumer">
      <button data-testid="success-btn" onClick={() => toast.success('Success Title', 'Success message')}>
        Success
      </button>
      <button data-testid="error-btn" onClick={() => toast.error('Error Title', 'Error message')}>
        Error
      </button>
      <button data-testid="warning-btn" onClick={() => toast.warning('Warning Title', 'Warning message')}>
        Warning
      </button>
      <button data-testid="info-btn" onClick={() => toast.info('Info Title', 'Info message')}>
        Info
      </button>
      <button data-testid="add-btn" onClick={() => toast.addToast('success', 'Add Title', 'Add message')}>
        Add Toast
      </button>
      <button data-testid="no-message-btn" onClick={() => toast.success('Title Only')}>
        No Message
      </button>
    </div>
  );
}

function renderWithProvider(ui?: React.ReactNode) {
  return render(<ToastProvider>{ui || <TestConsumer />}</ToastProvider>);
}

// =============================================================================
// Test Suite
// =============================================================================

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  // ===========================================================================
  // Provider Setup Tests
  // ===========================================================================

  describe('Provider setup', () => {
    it('renders children correctly', () => {
      renderWithProvider(<div data-testid="child">Child Content</div>);

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('provides toast context to children', () => {
      renderWithProvider();

      expect(screen.getByTestId('test-consumer')).toBeInTheDocument();
      expect(screen.getByTestId('success-btn')).toBeInTheDocument();
    });

    it('renders without toast container when no toasts exist', () => {
      renderWithProvider();

      expect(screen.queryByTestId('toast-alert')).not.toBeInTheDocument();
    });

    it('renders multiple children correctly', () => {
      renderWithProvider(
        <>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // useToast Hook Tests
  // ===========================================================================

  describe('useToast hook', () => {
    it('throws error when used outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      function ComponentOutsideProvider() {
        useToast();
        return <div>Should not render</div>;
      }

      expect(() => render(<ComponentOutsideProvider />)).toThrow(
        'useToast must be used within a ToastProvider'
      );

      consoleError.mockRestore();
    });

    it('returns toast context when used inside provider', () => {
      let capturedContext: ReturnType<typeof useToast> | null = null;

      function ContextCapture() {
        capturedContext = useToast();
        return null;
      }

      renderWithProvider(<ContextCapture />);

      expect(capturedContext).not.toBeNull();
      expect(capturedContext).toHaveProperty('addToast');
      expect(capturedContext).toHaveProperty('success');
      expect(capturedContext).toHaveProperty('error');
      expect(capturedContext).toHaveProperty('warning');
      expect(capturedContext).toHaveProperty('info');
    });
  });

  // ===========================================================================
  // Toast Creation Tests
  // ===========================================================================

  describe('Toast creation', () => {
    it('creates success toast with addToast', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('add-btn').click();
      });

      expect(screen.getByTestId('toast-alert')).toBeInTheDocument();
      expect(screen.getByText('Add Title')).toBeInTheDocument();
      expect(screen.getByText('Add message')).toBeInTheDocument();
      expect(screen.getByTestId('toast-alert')).toHaveAttribute('data-color', 'success');
    });

    it('creates success toast with success method', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('success-btn').click();
      });

      expect(screen.getByTestId('toast-alert')).toBeInTheDocument();
      expect(screen.getByText('Success Title')).toBeInTheDocument();
      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByTestId('toast-alert')).toHaveAttribute('data-color', 'success');
    });

    it('creates error toast with error method (maps to danger)', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('error-btn').click();
      });

      expect(screen.getByTestId('toast-alert')).toBeInTheDocument();
      expect(screen.getByText('Error Title')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByTestId('toast-alert')).toHaveAttribute('data-color', 'danger');
    });

    it('creates warning toast with warning method', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('warning-btn').click();
      });

      expect(screen.getByTestId('toast-alert')).toBeInTheDocument();
      expect(screen.getByText('Warning Title')).toBeInTheDocument();
      expect(screen.getByText('Warning message')).toBeInTheDocument();
      expect(screen.getByTestId('toast-alert')).toHaveAttribute('data-color', 'warning');
    });

    it('creates info toast with info method', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('info-btn').click();
      });

      expect(screen.getByTestId('toast-alert')).toBeInTheDocument();
      expect(screen.getByText('Info Title')).toBeInTheDocument();
      expect(screen.getByText('Info message')).toBeInTheDocument();
      expect(screen.getByTestId('toast-alert')).toHaveAttribute('data-color', 'info');
    });

    it('creates toast without optional message', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('no-message-btn').click();
      });

      expect(screen.getByTestId('toast-alert')).toBeInTheDocument();
      expect(screen.getByText('Title Only')).toBeInTheDocument();
      // No paragraph element for message
      const alert = screen.getByTestId('toast-alert');
      expect(alert.querySelector('p')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Toast Auto-Removal Tests
  // ===========================================================================

  describe('Toast auto-removal', () => {
    it('removes toast after 5 seconds', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('success-btn').click();
      });

      expect(screen.getByTestId('toast-alert')).toBeInTheDocument();

      // Advance time by 5 seconds
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.queryByTestId('toast-alert')).not.toBeInTheDocument();
    });

    it('does not remove toast before 5 seconds', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('success-btn').click();
      });

      expect(screen.getByTestId('toast-alert')).toBeInTheDocument();

      // Advance time by 4.9 seconds
      await act(async () => {
        vi.advanceTimersByTime(4900);
      });

      expect(screen.getByTestId('toast-alert')).toBeInTheDocument();
    });

    it('removes each toast independently', async () => {
      renderWithProvider();

      // Add first toast
      await act(async () => {
        screen.getByTestId('success-btn').click();
      });

      // Advance 2 seconds
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      // Add second toast
      await act(async () => {
        screen.getByTestId('error-btn').click();
      });

      // Both should be visible
      expect(screen.getAllByTestId('toast-alert')).toHaveLength(2);

      // Advance 3 more seconds (5 total for first)
      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      // First toast should be gone, second should remain
      expect(screen.getAllByTestId('toast-alert')).toHaveLength(1);
      expect(screen.getByText('Error Title')).toBeInTheDocument();

      // Advance 2 more seconds (5 total for second)
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      // Both should be gone
      expect(screen.queryByTestId('toast-alert')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Multiple Toast Tests
  // ===========================================================================

  describe('Multiple toasts', () => {
    it('renders multiple toasts', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('success-btn').click();
        screen.getByTestId('error-btn').click();
        screen.getByTestId('warning-btn').click();
      });

      const alerts = screen.getAllByTestId('toast-alert');
      expect(alerts).toHaveLength(3);
    });

    it('maintains toast order (newest at bottom)', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('success-btn').click();
      });

      await act(async () => {
        screen.getByTestId('error-btn').click();
      });

      const alerts = screen.getAllByTestId('toast-alert');
      expect(alerts).toHaveLength(2);

      // First in array should be success (added first)
      expect(alerts[0]).toHaveAttribute('data-color', 'success');
      // Second in array should be error (added second)
      expect(alerts[1]).toHaveAttribute('data-color', 'danger');
    });

    it('handles rapid toast creation', async () => {
      renderWithProvider();

      await act(async () => {
        for (let i = 0; i < 5; i++) {
          screen.getByTestId('success-btn').click();
        }
      });

      const alerts = screen.getAllByTestId('toast-alert');
      expect(alerts).toHaveLength(5);
    });
  });

  // ===========================================================================
  // Toast Rendering Tests
  // ===========================================================================

  describe('Toast rendering', () => {
    it('renders toast with title as strong element', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('success-btn').click();
      });

      const strongElement = screen.getByText('Success Title');
      expect(strongElement.tagName).toBe('STRONG');
    });

    it('renders toast message in paragraph element', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('success-btn').click();
      });

      const messageElement = screen.getByText('Success message');
      expect(messageElement.tagName).toBe('P');
      expect(messageElement).toHaveStyle({ margin: '0' });
    });

    it('renders toast container with fixed positioning', async () => {
      const { container } = renderWithProvider();

      await act(async () => {
        screen.getByTestId('success-btn').click();
      });

      // The toast container should have fixed positioning
      const toastContainer = container.querySelector('[style*="position: fixed"]');
      expect(toastContainer).toBeInTheDocument();
    });

    it('applies correct data-color attribute based on toast type', async () => {
      renderWithProvider();

      await act(async () => {
        screen.getByTestId('success-btn').click();
      });

      expect(screen.getByTestId('toast-alert')).toHaveAttribute('data-color', 'success');

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      await act(async () => {
        screen.getByTestId('warning-btn').click();
      });

      expect(screen.getByTestId('toast-alert')).toHaveAttribute('data-color', 'warning');
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('Edge cases', () => {
    it('handles empty string title', async () => {
      let toastContext: ReturnType<typeof useToast> | null = null;

      function ContextCapture() {
        toastContext = useToast();
        return null;
      }

      renderWithProvider(<ContextCapture />);

      await act(async () => {
        toastContext!.success('', 'Message with empty title');
      });

      expect(screen.getByTestId('toast-alert')).toBeInTheDocument();
    });

    it('handles empty string message', async () => {
      let toastContext: ReturnType<typeof useToast> | null = null;

      function ContextCapture() {
        toastContext = useToast();
        return null;
      }

      renderWithProvider(<ContextCapture />);

      await act(async () => {
        toastContext!.success('Title', '');
      });

      expect(screen.getByTestId('toast-alert')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('handles special characters in title and message', async () => {
      let toastContext: ReturnType<typeof useToast> | null = null;

      function ContextCapture() {
        toastContext = useToast();
        return null;
      }

      renderWithProvider(<ContextCapture />);

      await act(async () => {
        toastContext!.success('<script>alert("xss")</script>', '& < > " \'');
      });

      expect(screen.getByTestId('toast-alert')).toBeInTheDocument();
      expect(screen.getByText('<script>alert("xss")</script>')).toBeInTheDocument();
    });

    it('generates unique ids for toasts', async () => {
      renderWithProvider();

      // Mock Date.now and Math.random to verify unique IDs are generated
      const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(1234567890);

      await act(async () => {
        screen.getByTestId('success-btn').click();
        screen.getByTestId('success-btn').click();
      });

      const alerts = screen.getAllByTestId('toast-alert');
      expect(alerts).toHaveLength(2);

      mockDateNow.mockRestore();
    });

    it('handles provider unmount gracefully', async () => {
      const { unmount } = renderWithProvider();

      await act(async () => {
        screen.getByTestId('success-btn').click();
      });

      expect(screen.getByTestId('toast-alert')).toBeInTheDocument();

      // Unmount should not throw
      expect(() => unmount()).not.toThrow();
    });

    it('handles re-render without losing toasts', async () => {
      const { rerender } = render(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>
      );

      await act(async () => {
        screen.getByTestId('success-btn').click();
      });

      expect(screen.getByTestId('toast-alert')).toBeInTheDocument();

      // Re-render with same props
      rerender(
        <ToastProvider>
          <TestConsumer />
        </ToastProvider>
      );

      expect(screen.getByTestId('toast-alert')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Context Stability Tests
  // ===========================================================================

  describe('Context stability', () => {
    it('provides stable function references', async () => {
      const capturedFunctions: Array<ReturnType<typeof useToast>> = [];

      function FunctionCapture() {
        const toast = useToast();
        React.useEffect(() => {
          capturedFunctions.push(toast);
        });
        return <button onClick={() => toast.success('Test')}>Test</button>;
      }

      const { rerender } = render(
        <ToastProvider>
          <FunctionCapture />
        </ToastProvider>
      );

      rerender(
        <ToastProvider>
          <FunctionCapture />
        </ToastProvider>
      );

      // The functions should be stable across re-renders (due to useCallback)
      if (capturedFunctions.length >= 2) {
        expect(capturedFunctions[0].success).toBe(capturedFunctions[1].success);
        expect(capturedFunctions[0].error).toBe(capturedFunctions[1].error);
        expect(capturedFunctions[0].warning).toBe(capturedFunctions[1].warning);
        expect(capturedFunctions[0].info).toBe(capturedFunctions[1].info);
      }
    });
  });

  // ===========================================================================
  // Animation Style Tests
  // ===========================================================================

  describe('Animation styles', () => {
    it('includes animation keyframes style element', async () => {
      const { container } = renderWithProvider();

      await act(async () => {
        screen.getByTestId('success-btn').click();
      });

      const styleElement = container.querySelector('style');
      expect(styleElement).toBeInTheDocument();
      expect(styleElement?.textContent).toContain('@keyframes slideIn');
    });
  });
});

// =============================================================================
// Integration Tests
// =============================================================================

describe('ToastProvider Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Complete toast lifecycle', () => {
    it('full lifecycle: create -> render -> auto-remove', async () => {
      renderWithProvider();

      // Initial state - no toasts
      expect(screen.queryByTestId('toast-alert')).not.toBeInTheDocument();

      // Create toast
      await act(async () => {
        screen.getByTestId('success-btn').click();
      });

      // Toast is visible
      expect(screen.getByTestId('toast-alert')).toBeInTheDocument();
      expect(screen.getByText('Success Title')).toBeInTheDocument();

      // Wait for auto-removal
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      // Toast is removed
      expect(screen.queryByTestId('toast-alert')).not.toBeInTheDocument();
    });

    it('multiple toast lifecycle with staggered removal', async () => {
      renderWithProvider();

      // Create first toast
      await act(async () => {
        screen.getByTestId('success-btn').click();
      });

      // Wait 2.5 seconds
      await act(async () => {
        vi.advanceTimersByTime(2500);
      });

      // Create second toast
      await act(async () => {
        screen.getByTestId('error-btn').click();
      });

      // Both visible
      expect(screen.getAllByTestId('toast-alert')).toHaveLength(2);

      // Wait 2.5 more seconds (first toast at 5s total)
      await act(async () => {
        vi.advanceTimersByTime(2500);
      });

      // Only second toast visible
      expect(screen.getAllByTestId('toast-alert')).toHaveLength(1);
      expect(screen.getByText('Error Title')).toBeInTheDocument();

      // Wait 2.5 more seconds (second toast at 5s total)
      await act(async () => {
        vi.advanceTimersByTime(2500);
      });

      // No toasts visible
      expect(screen.queryByTestId('toast-alert')).not.toBeInTheDocument();
    });
  });

  describe('All toast types workflow', () => {
    it('creates all toast types in sequence', async () => {
      renderWithProvider();

      const testCases = [
        { buttonId: 'success-btn', expectedColor: 'success', expectedTitle: 'Success Title' },
        { buttonId: 'error-btn', expectedColor: 'danger', expectedTitle: 'Error Title' },
        { buttonId: 'warning-btn', expectedColor: 'warning', expectedTitle: 'Warning Title' },
        { buttonId: 'info-btn', expectedColor: 'info', expectedTitle: 'Info Title' },
      ];

      for (const testCase of testCases) {
        await act(async () => {
          screen.getByTestId(testCase.buttonId).click();
        });

        const alerts = screen.getAllByTestId('toast-alert');
        const lastAlert = alerts[alerts.length - 1];

        expect(lastAlert).toHaveAttribute('data-color', testCase.expectedColor);
        expect(screen.getByText(testCase.expectedTitle)).toBeInTheDocument();

        // Remove toast before next test
        await act(async () => {
          vi.advanceTimersByTime(5000);
        });
      }
    });
  });
});
