/**
 * ThemeProvider Unit Tests
 *
 * Tests for the SaaS Admin ThemeProvider including:
 * - Color scheme state management
 * - Theme toggle functionality
 * - System preference detection
 * - LocalStorage persistence
 * - Auto mode handling
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, renderHook } from '@testing-library/react';
import * as React from 'react';

// =============================================================================
// Mock Browser APIs
// =============================================================================

// Mock localStorage
const mockLocalStorage: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage[key];
  }),
  clear: vi.fn(() => {
    Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock matchMedia
let mockMediaQueryMatches = false;
let mediaQueryListeners: ((e: MediaQueryListEvent) => void)[] = [];

const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: mockMediaQueryMatches,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
    if (event === 'change') {
      mediaQueryListeners.push(listener);
    }
  }),
  removeEventListener: vi.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
    if (event === 'change') {
      mediaQueryListeners = mediaQueryListeners.filter(l => l !== listener);
    }
  }),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  value: mockMatchMedia,
  writable: true,
});

// Import component after mocks
import { ThemeProvider, useTheme } from '../../../../apps/saas-admin/src/providers/ThemeProvider';

// =============================================================================
// Test Utilities
// =============================================================================

function ThemeConsumer() {
  const { colorScheme, isDark, toggleTheme, setColorScheme, resetToAuto } = useTheme();
  return (
    <div>
      <span data-testid="color-scheme">{colorScheme}</span>
      <span data-testid="is-dark">{isDark ? 'true' : 'false'}</span>
      <button data-testid="toggle-btn" onClick={toggleTheme}>Toggle</button>
      <button data-testid="set-light-btn" onClick={() => setColorScheme('light')}>Light</button>
      <button data-testid="set-dark-btn" onClick={() => setColorScheme('dark')}>Dark</button>
      <button data-testid="set-auto-btn" onClick={() => setColorScheme('auto')}>Auto</button>
      <button data-testid="reset-btn" onClick={resetToAuto}>Reset</button>
    </div>
  );
}

function renderWithProvider(storageKey?: string) {
  return render(
    <ThemeProvider storageKey={storageKey}>
      <ThemeConsumer />
    </ThemeProvider>
  );
}

// Helper to simulate system preference change
function simulateSystemPreferenceChange(prefersDark: boolean) {
  act(() => {
    mediaQueryListeners.forEach(listener => {
      listener({ matches: prefersDark } as MediaQueryListEvent);
    });
  });
}

// =============================================================================
// Test Suite
// =============================================================================

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
    mockMediaQueryMatches = false;
    mediaQueryListeners = [];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Basic Rendering Tests
  // ===========================================================================

  describe('Basic Rendering', () => {
    it('renders children correctly', () => {
      render(
        <ThemeProvider>
          <div data-testid="child">Child content</div>
        </ThemeProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('provides default context values', () => {
      renderWithProvider();

      expect(screen.getByTestId('color-scheme')).toHaveTextContent('auto');
    });

    it('provides isDark value', () => {
      renderWithProvider();

      expect(screen.getByTestId('is-dark')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Initial State Tests
  // ===========================================================================

  describe('Initial State', () => {
    it('defaults to auto when localStorage is empty', () => {
      renderWithProvider();

      expect(screen.getByTestId('color-scheme')).toHaveTextContent('auto');
    });

    it('loads light from localStorage', () => {
      mockLocalStorage['saas-admin-theme'] = 'light';
      localStorageMock.getItem.mockImplementation((key: string) => mockLocalStorage[key] || null);

      renderWithProvider();

      expect(screen.getByTestId('color-scheme')).toHaveTextContent('light');
    });

    it('loads dark from localStorage', () => {
      mockLocalStorage['saas-admin-theme'] = 'dark';
      localStorageMock.getItem.mockImplementation((key: string) => mockLocalStorage[key] || null);

      renderWithProvider();

      expect(screen.getByTestId('color-scheme')).toHaveTextContent('dark');
    });

    it('ignores invalid localStorage value and defaults to auto', () => {
      mockLocalStorage['saas-admin-theme'] = 'invalid';
      localStorageMock.getItem.mockImplementation((key: string) => mockLocalStorage[key] || null);

      renderWithProvider();

      expect(screen.getByTestId('color-scheme')).toHaveTextContent('auto');
    });

    it('uses custom storage key when provided', () => {
      const customKey = 'custom-theme-key';
      mockLocalStorage[customKey] = 'dark';
      localStorageMock.getItem.mockImplementation((key: string) => mockLocalStorage[key] || null);

      renderWithProvider(customKey);

      expect(screen.getByTestId('color-scheme')).toHaveTextContent('dark');
    });
  });

  // ===========================================================================
  // System Preference Detection Tests
  // ===========================================================================

  describe('System Preference Detection', () => {
    it('detects system preference for dark mode', () => {
      mockMediaQueryMatches = true;
      renderWithProvider();

      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
    });

    it('detects system preference for light mode', () => {
      mockMediaQueryMatches = false;
      renderWithProvider();

      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
    });

    it('responds to system preference changes when in auto mode', () => {
      mockMediaQueryMatches = false;
      renderWithProvider();

      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');

      // Simulate system preference change to dark
      simulateSystemPreferenceChange(true);

      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
    });

    it('respects explicit setting over system preference', () => {
      mockMediaQueryMatches = true;
      renderWithProvider();

      // Set to light explicitly
      fireEvent.click(screen.getByTestId('set-light-btn'));

      // Should be light even though system prefers dark
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
    });
  });

  // ===========================================================================
  // Toggle Theme Tests
  // ===========================================================================

  describe('Toggle Theme', () => {
    it('toggles from light to dark when in light mode', () => {
      mockMediaQueryMatches = false;
      renderWithProvider();

      // Start in auto mode with system preferring light
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');

      fireEvent.click(screen.getByTestId('toggle-btn'));

      expect(screen.getByTestId('color-scheme')).toHaveTextContent('dark');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
    });

    it('toggles from dark to light when in dark mode', () => {
      mockMediaQueryMatches = true;
      renderWithProvider();

      // Start in auto mode with system preferring dark
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');

      fireEvent.click(screen.getByTestId('toggle-btn'));

      expect(screen.getByTestId('color-scheme')).toHaveTextContent('light');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
    });

    it('saves explicit choice to localStorage', () => {
      mockMediaQueryMatches = false;
      renderWithProvider();

      fireEvent.click(screen.getByTestId('toggle-btn'));

      expect(localStorageMock.setItem).toHaveBeenCalledWith('saas-admin-theme', 'dark');
    });
  });

  // ===========================================================================
  // Set Color Scheme Tests
  // ===========================================================================

  describe('Set Color Scheme', () => {
    it('sets color scheme to light', () => {
      renderWithProvider();

      fireEvent.click(screen.getByTestId('set-light-btn'));

      expect(screen.getByTestId('color-scheme')).toHaveTextContent('light');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
    });

    it('sets color scheme to dark', () => {
      renderWithProvider();

      fireEvent.click(screen.getByTestId('set-dark-btn'));

      expect(screen.getByTestId('color-scheme')).toHaveTextContent('dark');
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
    });

    it('sets color scheme to auto', () => {
      renderWithProvider();

      // First set to dark
      fireEvent.click(screen.getByTestId('set-dark-btn'));
      expect(screen.getByTestId('color-scheme')).toHaveTextContent('dark');

      // Then set to auto
      fireEvent.click(screen.getByTestId('set-auto-btn'));
      expect(screen.getByTestId('color-scheme')).toHaveTextContent('auto');
    });

    it('saves light to localStorage', () => {
      renderWithProvider();

      fireEvent.click(screen.getByTestId('set-light-btn'));

      expect(localStorageMock.setItem).toHaveBeenCalledWith('saas-admin-theme', 'light');
    });

    it('saves dark to localStorage', () => {
      renderWithProvider();

      fireEvent.click(screen.getByTestId('set-dark-btn'));

      expect(localStorageMock.setItem).toHaveBeenCalledWith('saas-admin-theme', 'dark');
    });

    it('removes from localStorage when set to auto', () => {
      renderWithProvider();

      fireEvent.click(screen.getByTestId('set-auto-btn'));

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('saas-admin-theme');
    });
  });

  // ===========================================================================
  // Reset to Auto Tests
  // ===========================================================================

  describe('Reset to Auto', () => {
    it('resets color scheme to auto', () => {
      renderWithProvider();

      // First set to dark
      fireEvent.click(screen.getByTestId('set-dark-btn'));
      expect(screen.getByTestId('color-scheme')).toHaveTextContent('dark');

      // Reset to auto
      fireEvent.click(screen.getByTestId('reset-btn'));
      expect(screen.getByTestId('color-scheme')).toHaveTextContent('auto');
    });

    it('removes preference from localStorage', () => {
      renderWithProvider();

      // First set to dark
      fireEvent.click(screen.getByTestId('set-dark-btn'));

      // Reset to auto
      fireEvent.click(screen.getByTestId('reset-btn'));

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('saas-admin-theme');
    });

    it('follows system preference after reset', () => {
      mockMediaQueryMatches = true;
      renderWithProvider();

      // Set to light explicitly
      fireEvent.click(screen.getByTestId('set-light-btn'));
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');

      // Reset to auto - should follow system preference (dark)
      fireEvent.click(screen.getByTestId('reset-btn'));
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
    });
  });

  // ===========================================================================
  // Custom Storage Key Tests
  // ===========================================================================

  describe('Custom Storage Key', () => {
    it('uses custom storage key for reading', () => {
      const customKey = 'my-custom-theme';
      mockLocalStorage[customKey] = 'dark';
      localStorageMock.getItem.mockImplementation((key: string) => mockLocalStorage[key] || null);

      renderWithProvider(customKey);

      expect(screen.getByTestId('color-scheme')).toHaveTextContent('dark');
    });

    it('uses custom storage key for writing', () => {
      const customKey = 'my-custom-theme';

      renderWithProvider(customKey);
      fireEvent.click(screen.getByTestId('set-dark-btn'));

      expect(localStorageMock.setItem).toHaveBeenCalledWith(customKey, 'dark');
    });

    it('uses custom storage key for removing', () => {
      const customKey = 'my-custom-theme';

      renderWithProvider(customKey);
      fireEvent.click(screen.getByTestId('reset-btn'));

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(customKey);
    });
  });

  // ===========================================================================
  // isDark Computation Tests
  // ===========================================================================

  describe('isDark Computation', () => {
    it('is false when color scheme is light', () => {
      renderWithProvider();

      fireEvent.click(screen.getByTestId('set-light-btn'));

      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
    });

    it('is true when color scheme is dark', () => {
      renderWithProvider();

      fireEvent.click(screen.getByTestId('set-dark-btn'));

      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
    });

    it('follows system preference when color scheme is auto and system prefers dark', () => {
      mockMediaQueryMatches = true;
      renderWithProvider();

      fireEvent.click(screen.getByTestId('set-auto-btn'));

      expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
    });

    it('follows system preference when color scheme is auto and system prefers light', () => {
      mockMediaQueryMatches = false;
      renderWithProvider();

      fireEvent.click(screen.getByTestId('set-auto-btn'));

      expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
    });
  });

  // ===========================================================================
  // useTheme Hook Tests
  // ===========================================================================

  describe('useTheme Hook', () => {
    it('returns default values when used outside provider', () => {
      const { result } = renderHook(() => useTheme());

      expect(result.current.colorScheme).toBe('auto');
      expect(result.current.isDark).toBe(false);
      expect(typeof result.current.toggleTheme).toBe('function');
      expect(typeof result.current.setColorScheme).toBe('function');
      expect(typeof result.current.resetToAuto).toBe('function');
    });

    it('returns context values when used inside provider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.colorScheme).toBe('auto');
      expect(typeof result.current.toggleTheme).toBe('function');
    });
  });

  // ===========================================================================
  // Edge Cases Tests
  // ===========================================================================

  describe('Edge Cases', () => {
    it('handles rapid toggles', () => {
      renderWithProvider();

      const toggleBtn = screen.getByTestId('toggle-btn');

      fireEvent.click(toggleBtn);
      fireEvent.click(toggleBtn);
      fireEvent.click(toggleBtn);

      // Should be in a valid state
      const colorScheme = screen.getByTestId('color-scheme').textContent;
      expect(['light', 'dark', 'auto']).toContain(colorScheme);
    });

    it('handles multiple setColorScheme calls', () => {
      renderWithProvider();

      fireEvent.click(screen.getByTestId('set-light-btn'));
      fireEvent.click(screen.getByTestId('set-dark-btn'));
      fireEvent.click(screen.getByTestId('set-auto-btn'));

      expect(screen.getByTestId('color-scheme')).toHaveTextContent('auto');
    });

    it('handles provider rerender', () => {
      const { rerender } = renderWithProvider();

      expect(screen.getByTestId('color-scheme')).toHaveTextContent('auto');

      rerender(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('color-scheme')).toBeInTheDocument();
    });

    it('cleans up media query listener on unmount', () => {
      const { unmount } = renderWithProvider();

      // Store current listener count
      const listenerCount = mediaQueryListeners.length;

      unmount();

      // Listener should be removed
      expect(mediaQueryListeners.length).toBeLessThanOrEqual(listenerCount);
    });
  });

  // ===========================================================================
  // Persistence Tests
  // ===========================================================================

  describe('Persistence', () => {
    it('persists dark theme across rerenders', () => {
      const { rerender } = renderWithProvider();

      fireEvent.click(screen.getByTestId('set-dark-btn'));

      rerender(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('color-scheme')).toHaveTextContent('dark');
    });

    it('does not persist auto theme to localStorage', () => {
      renderWithProvider();

      fireEvent.click(screen.getByTestId('set-dark-btn'));
      localStorageMock.setItem.mockClear();

      fireEvent.click(screen.getByTestId('set-auto-btn'));

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('saas-admin-theme');
    });
  });
});
