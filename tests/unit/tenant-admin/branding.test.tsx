/**
 * BrandingSettingsPage Component Unit Tests
 *
 * Tests for the branding settings page of the tenant admin app.
 * Covers: loading state, color presets, form fields, preview updates.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { type ReactNode, type ChangeEvent } from 'react';

// =============================================================================
// Mocks - Must be defined before imports that use them
// =============================================================================

// Mock auth state
let mockAuthState = {
  isTenantAdmin: true,
  isTechAdmin: false,
};

vi.mock('@xala/auth', () => ({
  useAuth: () => mockAuthState,
}));

// Mock i18n - return the key with defaultValue fallback for testing
vi.mock('@xala/i18n', () => ({
  useT: () => (key: string, options?: { defaultValue?: string }) => {
    return options?.defaultValue || key;
  },
}));

// Mock @xala/ds components
vi.mock('@xala/ds', () => ({
  Card: ({ children, style }: { children: ReactNode; style?: React.CSSProperties }) =>
    React.createElement('div', { 'data-testid': 'card', style }, children),
  Heading: ({
    children,
    level,
    'data-size': dataSize,
    style,
  }: {
    children: ReactNode;
    level: number;
    'data-size'?: string;
    style?: React.CSSProperties;
  }) =>
    React.createElement(
      `h${level}`,
      { 'data-testid': `heading-${level}`, 'data-size': dataSize, style },
      children
    ),
  Paragraph: ({
    children,
    'data-size': dataSize,
    style,
  }: {
    children: ReactNode;
    'data-size'?: string;
    style?: React.CSSProperties;
  }) => React.createElement('p', { 'data-testid': 'paragraph', 'data-size': dataSize, style }, children),
  Button: ({
    children,
    onClick,
    variant,
    'data-color': dataColor,
    'data-size': dataSize,
    type,
    style,
    disabled,
  }: {
    children: ReactNode;
    onClick?: () => void;
    variant?: string;
    'data-color'?: string;
    'data-size'?: string;
    type?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
  }) =>
    React.createElement(
      'button',
      {
        'data-testid': `button-${variant || 'default'}`,
        onClick,
        'data-color': dataColor,
        'data-size': dataSize,
        type,
        style,
        disabled,
      },
      children
    ),
  Input: ({
    value,
    onChange,
    style,
    placeholder,
  }: {
    value?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    style?: React.CSSProperties;
    placeholder?: string;
  }) =>
    React.createElement('input', {
      'data-testid': 'input',
      value,
      onChange,
      style,
      placeholder,
      type: 'text',
    }),
  Alert: ({
    children,
    'data-color': dataColor,
  }: {
    children: ReactNode;
    'data-color'?: string;
  }) =>
    React.createElement('div', { 'data-testid': 'alert', 'data-color': dataColor, role: 'alert' }, children),
  Spinner: ({ 'aria-label': ariaLabel, 'data-size': dataSize }: { 'aria-label': string; 'data-size'?: string }) =>
    React.createElement('div', { 'data-testid': 'spinner', 'aria-label': ariaLabel, 'data-size': dataSize, role: 'status' }, 'Loading...'),
  InfoIcon: () => React.createElement('span', { 'data-testid': 'info-icon' }, 'Info'),
}));

// Import component after mocks
import { BrandingSettingsPage } from '../../../apps/tenant-admin/src/routes/settings/branding';

// =============================================================================
// Test Helpers
// =============================================================================

type AuthState = typeof mockAuthState;

const setMockAuthState = (state: Partial<AuthState>) => {
  mockAuthState = {
    ...mockAuthState,
    ...state,
  };
};

// Reset state helper
const resetMockState = () => {
  mockAuthState = {
    isTenantAdmin: true,
    isTechAdmin: false,
  };
};

// =============================================================================
// Tests
// =============================================================================

describe('BrandingSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMockState();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ===========================================================================
  // Loading State Tests
  // ===========================================================================

  describe('Loading State', () => {
    it('displays spinner while loading branding data', async () => {
      render(<BrandingSettingsPage />);

      // Initially shows spinner
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('spinner has correct aria-label for accessibility', async () => {
      render(<BrandingSettingsPage />);

      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveAttribute('aria-label', 'Loading...');
    });

    it('hides spinner after data loads', async () => {
      render(<BrandingSettingsPage />);

      // Wait for loading to complete (500ms timeout in component)
      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    it('shows content after loading completes', async () => {
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('Branding & Design')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Access Control Tests
  // ===========================================================================

  describe('Access Control', () => {
    it('shows access denied alert for users without admin roles', async () => {
      setMockAuthState({ isTenantAdmin: false, isTechAdmin: false });
      render(<BrandingSettingsPage />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('data-color', 'warning');
      expect(screen.getByText('You do not have permission to modify branding settings.')).toBeInTheDocument();
    });

    it('allows access for tenant admins', async () => {
      setMockAuthState({ isTenantAdmin: true, isTechAdmin: false });
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByText('Branding & Design')).toBeInTheDocument();
    });

    it('allows access for tech admins', async () => {
      setMockAuthState({ isTenantAdmin: false, isTechAdmin: true });
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByText('Branding & Design')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Color Presets Tests
  // ===========================================================================

  describe('Color Presets', () => {
    it('displays color scheme section', async () => {
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('Color Scheme')).toBeInTheDocument();
    });

    it('displays quick select label', async () => {
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('Quick Select')).toBeInTheDocument();
    });

    it('renders all color presets (blue, green, purple, orange)', async () => {
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('blue')).toBeInTheDocument();
      expect(screen.getByText('green')).toBeInTheDocument();
      expect(screen.getByText('purple')).toBeInTheDocument();
      expect(screen.getByText('orange')).toBeInTheDocument();
    });

    it('applies preset colors when clicking a preset', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<BrandingSettingsPage />);

      // Wait for loading
      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      // Find and click the green preset
      const greenPreset = screen.getByText('green').closest('button');
      expect(greenPreset).not.toBeNull();

      if (greenPreset) {
        await user.click(greenPreset);
      }

      // Verify primary color input shows green preset value (#16a34a)
      const inputs = screen.getAllByTestId('input');
      const primaryColorInput = inputs.find((input) => (input as HTMLInputElement).value === '#16a34a');
      expect(primaryColorInput).toBeDefined();
    });

    it('highlights the selected preset', async () => {
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      // Blue is the default selected preset - check that the button exists and has border style
      const bluePreset = screen.getByText('blue').closest('button');
      expect(bluePreset).toBeInTheDocument();
      // Verify the style attribute contains 2px solid (selected state)
      // CSS custom properties are not computed in jsdom, so we check for the structure
      expect(bluePreset?.style.border).toMatch(/2px solid/);
    });
  });

  // ===========================================================================
  // Form Fields Tests
  // ===========================================================================

  describe('Form Fields', () => {
    it('displays primary color label and inputs', async () => {
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('Primary Color')).toBeInTheDocument();
    });

    it('displays accent color label and inputs', async () => {
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('Accent Color')).toBeInTheDocument();
    });

    it('displays logo section with upload areas', async () => {
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('Logo')).toBeInTheDocument();
      expect(screen.getByText('Main Logo')).toBeInTheDocument();
      expect(screen.getByText('Favicon')).toBeInTheDocument();
      expect(screen.getAllByText('Click to upload').length).toBe(2);
    });

    it('displays text content section', async () => {
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('Text Content')).toBeInTheDocument();
    });

    it('displays header text field with default value', async () => {
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('Header Text')).toBeInTheDocument();
      const inputs = screen.getAllByTestId('input');
      const headerInput = inputs.find((input) => (input as HTMLInputElement).value === 'Booking av lokaler');
      expect(headerInput).toBeDefined();
    });

    it('displays footer text field with default value', async () => {
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('Footer Text')).toBeInTheDocument();
      const inputs = screen.getAllByTestId('input');
      const footerInput = inputs.find((input) => (input as HTMLInputElement).value === '© 2026 Kommune');
      expect(footerInput).toBeDefined();
    });

    it('updates header text when user types', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<BrandingSettingsPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      const inputs = screen.getAllByTestId('input');
      const headerInput = inputs.find(
        (input) => (input as HTMLInputElement).value === 'Booking av lokaler'
      ) as HTMLInputElement;

      expect(headerInput).toBeDefined();
      if (headerInput) {
        await user.clear(headerInput);
        await user.type(headerInput, 'New Header');
        expect(headerInput.value).toBe('New Header');
      }
    });

    it('updates footer text when user types', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<BrandingSettingsPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      const inputs = screen.getAllByTestId('input');
      const footerInput = inputs.find(
        (input) => (input as HTMLInputElement).value === '© 2026 Kommune'
      ) as HTMLInputElement;

      expect(footerInput).toBeDefined();
      if (footerInput) {
        await user.clear(footerInput);
        await user.type(footerInput, '© 2026 My Org');
        expect(footerInput.value).toBe('© 2026 My Org');
      }
    });

    it('updates primary color via text input', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<BrandingSettingsPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      const inputs = screen.getAllByTestId('input');
      const primaryInput = inputs.find((input) => (input as HTMLInputElement).value === '#2563eb') as HTMLInputElement;

      expect(primaryInput).toBeDefined();
      if (primaryInput) {
        await user.clear(primaryInput);
        await user.type(primaryInput, '#ff0000');
        expect(primaryInput.value).toBe('#ff0000');
      }
    });
  });

  // ===========================================================================
  // Preview Updates Tests
  // ===========================================================================

  describe('Preview Updates', () => {
    it('displays preview section', async () => {
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('displays header text in preview', async () => {
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      // Default header text appears in preview
      expect(screen.getAllByText('Booking av lokaler').length).toBeGreaterThanOrEqual(1);
    });

    it('displays footer text in preview', async () => {
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      // Default footer text appears in preview
      expect(screen.getAllByText('© 2026 Kommune').length).toBeGreaterThanOrEqual(1);
    });

    it('displays example button in preview', async () => {
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('Example Button')).toBeInTheDocument();
    });

    it('preview updates header text when form input changes', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<BrandingSettingsPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      const inputs = screen.getAllByTestId('input');
      const headerInput = inputs.find(
        (input) => (input as HTMLInputElement).value === 'Booking av lokaler'
      ) as HTMLInputElement;

      if (headerInput) {
        await user.clear(headerInput);
        await user.type(headerInput, 'Updated Header');

        // Check the preview shows the updated text (header appears in both form and preview)
        await waitFor(() => {
          const updatedHeaders = screen.getAllByText('Updated Header');
          expect(updatedHeaders.length).toBeGreaterThanOrEqual(1);
        });
      }
    });

    it('preview updates footer text when form input changes', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<BrandingSettingsPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      const inputs = screen.getAllByTestId('input');
      const footerInput = inputs.find(
        (input) => (input as HTMLInputElement).value === '© 2026 Kommune'
      ) as HTMLInputElement;

      if (footerInput) {
        await user.clear(footerInput);
        await user.type(footerInput, '© 2026 New Footer');

        await waitFor(() => {
          const updatedFooters = screen.getAllByText('© 2026 New Footer');
          expect(updatedFooters.length).toBeGreaterThanOrEqual(1);
        });
      }
    });
  });

  // ===========================================================================
  // Save Button Tests
  // ===========================================================================

  describe('Save Button', () => {
    it('displays save changes button', async () => {
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('shows saving state when save is clicked', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<BrandingSettingsPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      // Button shows saving state
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('disables save button while saving', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<BrandingSettingsPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      const saveButton = screen.getByTestId('button-primary');
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();
    });

    it('re-enables save button after save completes', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<BrandingSettingsPage />);

      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      const saveButton = screen.getByTestId('button-primary');
      await user.click(saveButton);

      // Wait for save to complete (1000ms timeout)
      await waitFor(
        () => {
          expect(saveButton).not.toBeDisabled();
        },
        { timeout: 2000 }
      );

      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Page Header Tests
  // ===========================================================================

  describe('Page Header', () => {
    it('displays page title', async () => {
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('Branding & Design')).toBeInTheDocument();
    });

    it('displays page description', async () => {
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('Customize the look and feel of your platform')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // File Upload Areas Tests
  // ===========================================================================

  describe('File Upload Areas', () => {
    it('displays logo format hints', async () => {
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('PNG, SVG (max 2MB)')).toBeInTheDocument();
    });

    it('displays favicon format hints', async () => {
      render(<BrandingSettingsPage />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('ICO, PNG 32x32')).toBeInTheDocument();
    });
  });
});
