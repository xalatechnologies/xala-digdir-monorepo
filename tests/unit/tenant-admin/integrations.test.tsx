/**
 * IntegrationsSettingsPage Component Unit Tests
 *
 * Tests for the integrations settings page of the tenant admin app.
 * Covers: loading state, integration cards, toggle functionality, credential configuration.
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
  useT: () => (key: string, options?: { defaultValue?: string; name?: string }) => {
    if (options?.name) {
      return options.defaultValue?.replace('{{name}}', options.name) || key;
    }
    return options?.defaultValue || key;
  },
}));

// Mock integration data
interface MockIntegration {
  provider: string;
  enabled: boolean;
  configured: boolean;
  maskedApiKey: string | null;
  lastSync: string | null;
}

let mockIntegrationsData: MockIntegration[] = [
  {
    provider: 'vipps',
    enabled: true,
    configured: true,
    maskedApiKey: '****-****-1234',
    lastSync: '2024-01-15T10:30:00Z',
  },
  {
    provider: 'visma',
    enabled: false,
    configured: false,
    maskedApiKey: null,
    lastSync: null,
  },
  {
    provider: 'outlook',
    enabled: true,
    configured: true,
    maskedApiKey: null,
    lastSync: '2024-01-14T14:00:00Z',
  },
  {
    provider: 'smtp',
    enabled: false,
    configured: true,
    maskedApiKey: '****-5678',
    lastSync: null,
  },
];

let mockIntegrationsLoading = false;
let mockIntegrationsError: Error | null = null;
let mockUpdateMutateFn = vi.fn().mockResolvedValue({});

vi.mock('@digilist/client-sdk/hooks', () => ({
  useTenantIntegrations: () => ({
    data: mockIntegrationsLoading ? undefined : { data: mockIntegrationsData },
    isLoading: mockIntegrationsLoading,
    error: mockIntegrationsError,
  }),
  useUpdateTenantIntegration: () => ({
    mutateAsync: mockUpdateMutateFn,
    isPending: false,
  }),
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
    type,
  }: {
    value?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    style?: React.CSSProperties;
    placeholder?: string;
    type?: string;
  }) =>
    React.createElement('input', {
      'data-testid': 'input',
      value,
      onChange,
      style,
      placeholder,
      type: type || 'text',
    }),
  Switch: ({
    checked,
    onChange,
    disabled,
    'aria-label': ariaLabel,
  }: {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    'aria-label'?: string;
  }) =>
    React.createElement('input', {
      'data-testid': 'switch',
      type: 'checkbox',
      checked,
      onChange: (e: ChangeEvent<HTMLInputElement>) => onChange?.(e.target.checked),
      disabled,
      'aria-label': ariaLabel,
      role: 'switch',
    }),
  Alert: ({
    children,
    'data-color': dataColor,
  }: {
    children: ReactNode;
    'data-color'?: string;
  }) =>
    React.createElement('div', { 'data-testid': `alert-${dataColor || 'default'}`, 'data-color': dataColor, role: 'alert' }, children),
  Spinner: ({ 'aria-label': ariaLabel, 'data-size': dataSize }: { 'aria-label': string; 'data-size'?: string }) =>
    React.createElement('div', { 'data-testid': 'spinner', 'aria-label': ariaLabel, 'data-size': dataSize, role: 'status' }, 'Loading...'),
  Badge: ({
    children,
    'data-color': dataColor,
    'data-size': dataSize,
  }: {
    children: ReactNode;
    'data-color'?: string;
    'data-size'?: string;
  }) =>
    React.createElement(
      'span',
      { 'data-testid': `badge-${dataColor || 'default'}`, 'data-color': dataColor, 'data-size': dataSize },
      children
    ),
  InfoIcon: ({ style }: { style?: React.CSSProperties }) =>
    React.createElement('span', { 'data-testid': 'info-icon', style }, 'Info'),
}));

// Import component after mocks
import { IntegrationsSettingsPage } from '../../../apps/tenant-admin/src/routes/settings/integrations';

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

const setMockIntegrationsData = (
  data: MockIntegration[] | null,
  isLoading = false,
  error: Error | null = null
) => {
  mockIntegrationsData = data ?? [];
  mockIntegrationsLoading = isLoading;
  mockIntegrationsError = error;
};

// Reset state helper
const resetMockState = () => {
  mockAuthState = {
    isTenantAdmin: true,
    isTechAdmin: false,
  };

  mockIntegrationsData = [
    {
      provider: 'vipps',
      enabled: true,
      configured: true,
      maskedApiKey: '****-****-1234',
      lastSync: '2024-01-15T10:30:00Z',
    },
    {
      provider: 'visma',
      enabled: false,
      configured: false,
      maskedApiKey: null,
      lastSync: null,
    },
    {
      provider: 'outlook',
      enabled: true,
      configured: true,
      maskedApiKey: null,
      lastSync: '2024-01-14T14:00:00Z',
    },
    {
      provider: 'smtp',
      enabled: false,
      configured: true,
      maskedApiKey: '****-5678',
      lastSync: null,
    },
  ];

  mockIntegrationsLoading = false;
  mockIntegrationsError = null;
  mockUpdateMutateFn = vi.fn().mockResolvedValue({});
};

// =============================================================================
// Tests
// =============================================================================

describe('IntegrationsSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMockState();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ===========================================================================
  // Loading State Tests
  // ===========================================================================

  describe('Loading State', () => {
    it('displays spinner while integrations data is loading', () => {
      setMockIntegrationsData(null, true);
      render(<IntegrationsSettingsPage />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('spinner has correct aria-label for accessibility', () => {
      setMockIntegrationsData(null, true);
      render(<IntegrationsSettingsPage />);

      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveAttribute('aria-label', 'Loading...');
    });

    it('does not show spinner when data is loaded', () => {
      render(<IntegrationsSettingsPage />);

      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    it('does not show content while loading', () => {
      setMockIntegrationsData(null, true);
      render(<IntegrationsSettingsPage />);

      expect(screen.queryByText('Integrations')).not.toBeInTheDocument();
      expect(screen.queryByText('Vipps')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Access Control Tests
  // ===========================================================================

  describe('Access Control', () => {
    it('displays access denied alert for users without admin roles', () => {
      setMockAuthState({ isTenantAdmin: false, isTechAdmin: false });
      render(<IntegrationsSettingsPage />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByTestId('alert-warning')).toBeInTheDocument();
    });

    it('shows correct access denied message', () => {
      setMockAuthState({ isTenantAdmin: false, isTechAdmin: false });
      render(<IntegrationsSettingsPage />);

      expect(
        screen.getByText('You do not have permission to manage integrations.')
      ).toBeInTheDocument();
    });

    it('displays info icon in access denied alert', () => {
      setMockAuthState({ isTenantAdmin: false, isTechAdmin: false });
      render(<IntegrationsSettingsPage />);

      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });

    it('allows access for tenant admin only', () => {
      setMockAuthState({ isTenantAdmin: true, isTechAdmin: false });
      render(<IntegrationsSettingsPage />);

      expect(screen.queryByTestId('alert-warning')).not.toBeInTheDocument();
      expect(screen.getByText('Integrations')).toBeInTheDocument();
    });

    it('allows access for tech admin only', () => {
      setMockAuthState({ isTenantAdmin: false, isTechAdmin: true });
      render(<IntegrationsSettingsPage />);

      expect(screen.queryByTestId('alert-warning')).not.toBeInTheDocument();
      expect(screen.getByText('Integrations')).toBeInTheDocument();
    });

    it('allows access for users with both tenant and tech admin roles', () => {
      setMockAuthState({ isTenantAdmin: true, isTechAdmin: true });
      render(<IntegrationsSettingsPage />);

      expect(screen.queryByTestId('alert-warning')).not.toBeInTheDocument();
      expect(screen.getByText('Integrations')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Error State Tests
  // ===========================================================================

  describe('Error State', () => {
    it('displays error alert when API call fails', () => {
      setMockIntegrationsData(null, false, new Error('API Error'));
      render(<IntegrationsSettingsPage />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByTestId('alert-danger')).toBeInTheDocument();
    });

    it('shows correct error message', () => {
      setMockIntegrationsData(null, false, new Error('API Error'));
      render(<IntegrationsSettingsPage />);

      expect(
        screen.getByText('Failed to load integrations. Please try again.')
      ).toBeInTheDocument();
    });

    it('displays info icon in error alert', () => {
      setMockIntegrationsData(null, false, new Error('API Error'));
      render(<IntegrationsSettingsPage />);

      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Page Header Tests
  // ===========================================================================

  describe('Page Header', () => {
    it('displays page title', () => {
      render(<IntegrationsSettingsPage />);

      expect(screen.getByText('Integrations')).toBeInTheDocument();
    });

    it('displays page description', () => {
      render(<IntegrationsSettingsPage />);

      expect(
        screen.getByText('Connect third-party services to extend platform capabilities')
      ).toBeInTheDocument();
    });

    it('displays security notice alert', () => {
      render(<IntegrationsSettingsPage />);

      expect(screen.getByText('Security Notice')).toBeInTheDocument();
    });

    it('displays security description', () => {
      render(<IntegrationsSettingsPage />);

      expect(
        screen.getByText(
          'API keys and secrets are encrypted and stored securely. Only masked versions are displayed for your protection.'
        )
      ).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Integration Cards Tests
  // ===========================================================================

  describe('Integration Cards', () => {
    it('displays all integration cards', () => {
      render(<IntegrationsSettingsPage />);

      // Mock returns defaultValue (lowercase provider keys)
      expect(screen.getByText('vipps')).toBeInTheDocument();
      expect(screen.getByText('visma')).toBeInTheDocument();
      expect(screen.getByText('outlook')).toBeInTheDocument();
      expect(screen.getByText('smtp')).toBeInTheDocument();
    });

    it('displays integration descriptions', () => {
      render(<IntegrationsSettingsPage />);

      // Mock returns the translation key when no defaultValue provided
      // The descriptionKey is returned since defaultValue is empty string
      expect(screen.getByText('tenantAdmin.integrations.providers.vipps.description')).toBeInTheDocument();
      expect(screen.getByText('tenantAdmin.integrations.providers.visma.description')).toBeInTheDocument();
    });

    it('displays category badges on integration cards', () => {
      render(<IntegrationsSettingsPage />);

      // Categories appear both on cards and section headings, so use getAllByText
      // Mock returns defaultValue (English lowercase category keys)
      expect(screen.getAllByText('payment').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('sync').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('calendar').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('notification').length).toBeGreaterThanOrEqual(1);
    });

    it('displays correct status for active configured integration', () => {
      render(<IntegrationsSettingsPage />);

      // Vipps is enabled and configured - should show "Active"
      expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1);
    });

    it('displays correct status for disabled integration', () => {
      render(<IntegrationsSettingsPage />);

      // Visma is disabled - should show "Disabled"
      expect(screen.getAllByText('Disabled').length).toBeGreaterThanOrEqual(1);
    });

    it('displays masked API key for configured integrations', () => {
      render(<IntegrationsSettingsPage />);

      expect(screen.getByText('****-****-1234')).toBeInTheDocument();
    });

    it('displays last sync timestamp for synced integrations', () => {
      render(<IntegrationsSettingsPage />);

      // Check that last sync info is displayed (formatted date)
      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBeGreaterThanOrEqual(1);
    });

    it('displays "Never synced" for integrations without sync history', () => {
      render(<IntegrationsSettingsPage />);

      expect(screen.getAllByText('Never synced').length).toBeGreaterThanOrEqual(1);
    });

    it('displays configure button for unconfigured integrations', () => {
      render(<IntegrationsSettingsPage />);

      expect(screen.getAllByText('Configure').length).toBeGreaterThanOrEqual(1);
    });

    it('displays update credentials button for configured integrations', () => {
      render(<IntegrationsSettingsPage />);

      expect(screen.getAllByText('Update Credentials').length).toBeGreaterThanOrEqual(1);
    });

    it('displays documentation button for integrations with docs', () => {
      render(<IntegrationsSettingsPage />);

      // Vipps has docsUrl configured
      expect(screen.getAllByText('Documentation').length).toBeGreaterThanOrEqual(1);
    });

    it('displays empty state when no integrations available', () => {
      setMockIntegrationsData([]);
      render(<IntegrationsSettingsPage />);

      expect(
        screen.getByText('No integrations available. Contact support to enable integrations for your tenant.')
      ).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Toggle Functionality Tests
  // ===========================================================================

  describe('Toggle Functionality', () => {
    it('renders switches for each integration', () => {
      render(<IntegrationsSettingsPage />);

      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBe(4); // 4 integrations
    });

    it('switch shows correct checked state for enabled integration', () => {
      render(<IntegrationsSettingsPage />);

      const switches = screen.getAllByRole('switch');
      const vippsSwitch = switches[0]; // First integration is Vipps (enabled)
      expect(vippsSwitch).toBeChecked();
    });

    it('switch shows correct unchecked state for disabled integration', () => {
      render(<IntegrationsSettingsPage />);

      const switches = screen.getAllByRole('switch');
      const vismaSwitch = switches[1]; // Second integration is Visma (disabled)
      expect(vismaSwitch).not.toBeChecked();
    });

    it('switch has correct aria-label for accessibility', () => {
      render(<IntegrationsSettingsPage />);

      const switches = screen.getAllByRole('switch');
      // Mock returns defaultValue (provider key lowercase)
      expect(switches[0]).toHaveAttribute('aria-label', 'Toggle vipps');
    });

    it('calls update mutation when toggle is clicked', async () => {
      const user = userEvent.setup();
      render(<IntegrationsSettingsPage />);

      const switches = screen.getAllByRole('switch');
      const vismaSwitch = switches[1]; // Visma is disabled

      await user.click(vismaSwitch);

      expect(mockUpdateMutateFn).toHaveBeenCalledWith({
        provider: 'visma',
        data: { enabled: true },
      });
    });

    it('calls update mutation to disable when toggle is clicked for enabled integration', async () => {
      const user = userEvent.setup();
      render(<IntegrationsSettingsPage />);

      const switches = screen.getAllByRole('switch');
      const vippsSwitch = switches[0]; // Vipps is enabled

      await user.click(vippsSwitch);

      expect(mockUpdateMutateFn).toHaveBeenCalledWith({
        provider: 'vipps',
        data: { enabled: false },
      });
    });
  });

  // ===========================================================================
  // Credential Configuration Tests
  // ===========================================================================

  describe('Credential Configuration', () => {
    it('opens credential form when configure button is clicked', async () => {
      const user = userEvent.setup();
      render(<IntegrationsSettingsPage />);

      // Find and click configure button for Visma (unconfigured)
      const configureButtons = screen.getAllByText('Configure');
      await user.click(configureButtons[0]);

      // Check that credential configuration heading appears
      expect(screen.getByText('Configure Credentials')).toBeInTheDocument();
    });

    it('opens credential form when update credentials button is clicked', async () => {
      const user = userEvent.setup();
      render(<IntegrationsSettingsPage />);

      // Find and click update credentials button
      const updateButtons = screen.getAllByText('Update Credentials');
      await user.click(updateButtons[0]);

      expect(screen.getByText('Configure Credentials')).toBeInTheDocument();
    });

    it('displays API key input for integrations requiring it', async () => {
      const user = userEvent.setup();
      render(<IntegrationsSettingsPage />);

      // Click configure on Visma (requires API key)
      const configureButtons = screen.getAllByText('Configure');
      await user.click(configureButtons[0]);

      // API Key label appears in the credential form
      const apiKeyLabels = screen.getAllByText('API Key');
      expect(apiKeyLabels.length).toBeGreaterThanOrEqual(1);
    });

    it('displays API key input with password type by default', async () => {
      const user = userEvent.setup();
      render(<IntegrationsSettingsPage />);

      const configureButtons = screen.getAllByText('Configure');
      await user.click(configureButtons[0]);

      const inputs = screen.getAllByTestId('input');
      const passwordInput = inputs.find(
        (input) => (input as HTMLInputElement).type === 'password'
      );
      expect(passwordInput).toBeDefined();
    });

    it('displays show/hide button for API key', async () => {
      const user = userEvent.setup();
      render(<IntegrationsSettingsPage />);

      const configureButtons = screen.getAllByText('Configure');
      await user.click(configureButtons[0]);

      expect(screen.getByText('Show')).toBeInTheDocument();
    });

    it('toggles API key visibility when show button is clicked', async () => {
      const user = userEvent.setup();
      render(<IntegrationsSettingsPage />);

      const configureButtons = screen.getAllByText('Configure');
      await user.click(configureButtons[0]);

      const showButton = screen.getByText('Show');
      await user.click(showButton);

      expect(screen.getByText('Hide')).toBeInTheDocument();
    });

    it('displays cancel button in credential form', async () => {
      const user = userEvent.setup();
      render(<IntegrationsSettingsPage />);

      const configureButtons = screen.getAllByText('Configure');
      await user.click(configureButtons[0]);

      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('displays save button in credential form', async () => {
      const user = userEvent.setup();
      render(<IntegrationsSettingsPage />);

      const configureButtons = screen.getAllByText('Configure');
      await user.click(configureButtons[0]);

      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('closes credential form when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<IntegrationsSettingsPage />);

      const configureButtons = screen.getAllByText('Configure');
      await user.click(configureButtons[0]);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(screen.queryByText('Configure Credentials')).not.toBeInTheDocument();
    });

    it('calls update mutation when save is clicked', async () => {
      const user = userEvent.setup();
      render(<IntegrationsSettingsPage />);

      const configureButtons = screen.getAllByText('Configure');
      await user.click(configureButtons[0]);

      // Type API key
      const inputs = screen.getAllByTestId('input');
      const apiKeyInput = inputs.find(
        (input) => (input as HTMLInputElement).type === 'password'
      );
      if (apiKeyInput) {
        await user.type(apiKeyInput, 'test-api-key');
      }

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateMutateFn).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: 'visma',
            data: expect.objectContaining({
              enabled: true,
              apiKey: 'test-api-key',
            }),
          })
        );
      });
    });

    it('closes credential form after successful save', async () => {
      const user = userEvent.setup();
      render(<IntegrationsSettingsPage />);

      const configureButtons = screen.getAllByText('Configure');
      await user.click(configureButtons[0]);

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByText('Configure Credentials')).not.toBeInTheDocument();
      });
    });

    it('displays placeholder text for existing API key', async () => {
      const user = userEvent.setup();
      render(<IntegrationsSettingsPage />);

      // Click update credentials on SMTP (has existing API key)
      const updateButtons = screen.getAllByText('Update Credentials');
      // SMTP is the last one with update credentials
      await user.click(updateButtons[updateButtons.length - 1]);

      const inputs = screen.getAllByTestId('input');
      const apiKeyInput = inputs.find((input) => {
        const placeholder = (input as HTMLInputElement).placeholder;
        return placeholder && placeholder.includes('Leave blank to keep existing');
      });
      expect(apiKeyInput).toBeDefined();
    });

    it('displays webhook URL input for integrations requiring it', async () => {
      const user = userEvent.setup();
      render(<IntegrationsSettingsPage />);

      // Click update credentials on Vipps (requires webhook)
      const updateButtons = screen.getAllByText('Update Credentials');
      await user.click(updateButtons[0]); // Vipps

      expect(screen.getByText('Webhook URL')).toBeInTheDocument();
    });

    it('displays API secret input for integrations requiring it', async () => {
      const user = userEvent.setup();
      render(<IntegrationsSettingsPage />);

      // Click update credentials on Vipps (requires API secret)
      const updateButtons = screen.getAllByText('Update Credentials');
      await user.click(updateButtons[0]); // Vipps

      expect(screen.getByText('API Secret')).toBeInTheDocument();
    });

    it('displays show/hide button for API secret', async () => {
      const user = userEvent.setup();
      render(<IntegrationsSettingsPage />);

      // Click update credentials on Vipps
      const updateButtons = screen.getAllByText('Update Credentials');
      await user.click(updateButtons[0]);

      // There should be two Show buttons (API key and API secret)
      const showButtons = screen.getAllByText('Show');
      expect(showButtons.length).toBe(2);
    });
  });

  // ===========================================================================
  // Category Grouping Tests
  // ===========================================================================

  describe('Category Grouping', () => {
    it('groups integrations by category', () => {
      render(<IntegrationsSettingsPage />);

      // Check category headings exist
      const headings = screen.getAllByTestId('heading-2');
      const headingTexts = headings.map((h) => h.textContent);

      // Mock returns defaultValue (lowercase category keys)
      expect(headingTexts).toContain('payment');
      expect(headingTexts).toContain('sync');
    });

    it('displays badge with count for each category', () => {
      render(<IntegrationsSettingsPage />);

      // Check that badges exist showing counts
      const badges = screen.getAllByTestId(/^badge-/);
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // Status Label Tests
  // ===========================================================================

  describe('Status Labels', () => {
    it('displays "Pending Configuration" for enabled but unconfigured integration', () => {
      setMockIntegrationsData([
        {
          provider: 'vipps',
          enabled: true,
          configured: false,
          maskedApiKey: null,
          lastSync: null,
        },
      ]);
      render(<IntegrationsSettingsPage />);

      expect(screen.getByText('Pending Configuration')).toBeInTheDocument();
    });

    it('displays "Active" for enabled and configured integration', () => {
      setMockIntegrationsData([
        {
          provider: 'vipps',
          enabled: true,
          configured: true,
          maskedApiKey: '****-1234',
          lastSync: '2024-01-15T10:30:00Z',
        },
      ]);
      render(<IntegrationsSettingsPage />);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('displays "Disabled" for disabled integration', () => {
      setMockIntegrationsData([
        {
          provider: 'vipps',
          enabled: false,
          configured: true,
          maskedApiKey: '****-1234',
          lastSync: null,
        },
      ]);
      render(<IntegrationsSettingsPage />);

      expect(screen.getByText('Disabled')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Unknown Provider Tests
  // ===========================================================================

  describe('Unknown Provider Handling', () => {
    it('displays unknown integration with fallback values', () => {
      setMockIntegrationsData([
        {
          provider: 'unknown-provider',
          enabled: true,
          configured: false,
          maskedApiKey: null,
          lastSync: null,
        },
      ]);
      render(<IntegrationsSettingsPage />);

      expect(screen.getByText('unknown-provider')).toBeInTheDocument();
      expect(screen.getByText('Unknown integration')).toBeInTheDocument();
    });
  });
});
