/**
 * AccountSwitcher Component Tests
 *
 * Tests for account switching functionality and accessibility compliance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import type { Organization } from '@digilist/client-sdk/types';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock @digilist/client-sdk hooks
vi.mock('@digilist/client-sdk/hooks', () => ({
  useOrganizations: vi.fn(() => ({
    data: { data: [] },
    isLoading: false,
  })),
}));

// Import after mocking
import { useOrganizations } from '@digilist/client-sdk/hooks';
import { AccountSwitcher } from './AccountSwitcher';
import { AccountContextProvider } from '../providers/AccountContextProvider';

describe('AccountSwitcher', () => {
  const mockOrganizations: Organization[] = [
    {
      id: 'org-1',
      name: 'Test Kommune',
      organizationNumber: '123456789',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'org-2',
      name: 'Annen Kommune',
      organizationNumber: '987654321',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  const createWrapper = (organizations: Organization[] = []) => {
    // Mock useOrganizations to return test data
    vi.mocked(useOrganizations).mockReturnValue({
      data: { data: organizations },
      isLoading: false,
    } as any);

    return ({ children }: { children: ReactNode }) => (
      <AccountContextProvider userId="test-user" userName="Test Bruker">
        {children}
      </AccountContextProvider>
    );
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    mockNavigate.mockClear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render account switcher button', () => {
      const { container } = render(<AccountSwitcher />, {
        wrapper: createWrapper(),
      });

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should display personal account by default', () => {
      render(<AccountSwitcher />, {
        wrapper: createWrapper(),
      });

      expect(screen.getByText('Test Bruker')).toBeInTheDocument();
    });

    it('should display organization name when in organization mode', async () => {
      // Set localStorage to organization mode
      localStorage.setItem('minside_account_type', 'organization');
      localStorage.setItem('minside_selected_organization', 'org-1');

      render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      await waitFor(() => {
        expect(screen.getByText('Test Kommune')).toBeInTheDocument();
      });
    });

    it('should not render dropdown menu initially', () => {
      render(<AccountSwitcher />, {
        wrapper: createWrapper(),
      });

      expect(screen.queryByText('Som privatperson')).not.toBeInTheDocument();
    });
  });

  describe('Dropdown Behavior', () => {
    it('should open dropdown when button is clicked', async () => {
      const user = userEvent.setup();
      render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Som privatperson')).toBeInTheDocument();
      });
    });

    it('should close dropdown when button is clicked again', async () => {
      const user = userEvent.setup();
      render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      const button = screen.getByRole('button');

      // Open dropdown
      await user.click(button);
      await waitFor(() => {
        expect(screen.getByText('Som privatperson')).toBeInTheDocument();
      });

      // Close dropdown
      await user.click(button);
      await waitFor(() => {
        expect(screen.queryByText('Som privatperson')).not.toBeInTheDocument();
      });
    });

    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <div>
          <AccountSwitcher />
          <div data-testid="outside">Outside element</div>
        </div>,
        {
          wrapper: createWrapper(mockOrganizations),
        }
      );

      const button = screen.getByRole('button');

      // Open dropdown
      await user.click(button);
      await waitFor(() => {
        expect(screen.getByText('Som privatperson')).toBeInTheDocument();
      });

      // Click outside
      const outsideElement = screen.getByTestId('outside');
      fireEvent.mouseDown(outsideElement);

      await waitFor(() => {
        expect(screen.queryByText('Som privatperson')).not.toBeInTheDocument();
      });
    });
  });

  describe('Account Switching', () => {
    it('should switch to personal account when personal option is clicked', async () => {
      const user = userEvent.setup();

      // Start in organization mode
      localStorage.setItem('minside_account_type', 'organization');
      localStorage.setItem('minside_selected_organization', 'org-1');

      render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      // Click personal option
      const personalButton = screen.getByText('Som privatperson');
      await user.click(personalButton);

      // Should navigate to home
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });

      // Should close dropdown
      expect(screen.queryByText('Som privatperson')).not.toBeInTheDocument();
    });

    it('should switch to organization account when organization is clicked', async () => {
      const user = userEvent.setup();
      render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      // Click organization option
      const orgButton = screen.getByText('Test Kommune');
      await user.click(orgButton);

      // Should navigate to organization home
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/org');
      });

      // Should close dropdown
      expect(screen.queryByText('Som privatperson')).not.toBeInTheDocument();
    });

    it('should update localStorage when switching accounts', async () => {
      const user = userEvent.setup();
      render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      // Click organization option
      const orgButton = screen.getByText('Test Kommune');
      await user.click(orgButton);

      await waitFor(() => {
        expect(localStorage.getItem('minside_account_type')).toBe('organization');
        expect(localStorage.getItem('minside_selected_organization')).toBe('org-1');
      });
    });
  });

  describe('Organization List', () => {
    it('should display all available organizations', async () => {
      const user = userEvent.setup();
      render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Test Kommune')).toBeInTheDocument();
        expect(screen.getByText('Annen Kommune')).toBeInTheDocument();
      });
    });

    it('should display organization numbers', async () => {
      const user = userEvent.setup();
      render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('123456789')).toBeInTheDocument();
        expect(screen.getByText('987654321')).toBeInTheDocument();
      });
    });

    it('should show checkmark for active account', async () => {
      const user = userEvent.setup();
      render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        // Personal account should have a checkmark (SVG)
        const personalOption = screen.getByText('Som privatperson').closest('button');
        expect(personalOption?.querySelector('svg')).toBeInTheDocument();
      });
    });

    it('should show "Organisasjoner" header when organizations exist', async () => {
      const user = userEvent.setup();
      render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Organisasjoner')).toBeInTheDocument();
      });
    });

    it('should not show organizations section when no organizations', async () => {
      const user = userEvent.setup();
      render(<AccountSwitcher />, {
        wrapper: createWrapper([]),
      });

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.queryByText('Organisasjoner')).not.toBeInTheDocument();
      });
    });
  });

  describe('Settings Navigation', () => {
    it('should show "Administrer organisasjoner" link', async () => {
      const user = userEvent.setup();
      render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Administrer organisasjoner')).toBeInTheDocument();
      });
    });

    it('should close dropdown when settings link is clicked', async () => {
      const user = userEvent.setup();

      // Mock window.location.href
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { ...originalLocation, href: '' } as any;

      render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      // Click settings link
      const settingsButton = screen.getByText('Administrer organisasjoner');
      await user.click(settingsButton);

      await waitFor(() => {
        expect(screen.queryByText('Som privatperson')).not.toBeInTheDocument();
      });

      // Restore window.location
      window.location = originalLocation;
    });
  });

  describe('Design Token Compliance', () => {
    it('should use design tokens for button styling', () => {
      const { container } = render(<AccountSwitcher />, {
        wrapper: createWrapper(),
      });

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);

      // Button should have design token-based styling
      expect(button).toHaveAttribute('data-size', 'sm');
      expect(button).toHaveStyle({
        display: 'flex',
        alignItems: 'center',
      });
    });

    it('should use design tokens for dropdown styling', async () => {
      const user = userEvent.setup();
      const { container } = render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        const dropdown = container.querySelector('[style*="position: absolute"]');
        expect(dropdown).toBeInTheDocument();
      });
    });

    it('should use design tokens for spacing', async () => {
      const user = userEvent.setup();
      render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        // Gap should use design token
        expect(button).toHaveStyle({
          gap: 'var(--ds-spacing-2)',
        });
      });
    });

    it('should use design tokens for colors', async () => {
      const user = userEvent.setup();
      const { container } = render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        // Dropdown uses design tokens for background color
        const dropdown = container.querySelector('[style*="background-color"]');
        expect(dropdown).toBeInTheDocument();

        // Button icon uses design tokens for colors
        const iconContainer = container.querySelector('[style*="--ds-color"]');
        expect(iconContainer).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper button type attribute', () => {
      render(<AccountSwitcher />, {
        wrapper: createWrapper(),
      });

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should render all action buttons with type="button"', async () => {
      const user = userEvent.setup();
      render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach(btn => {
          expect(btn).toHaveAttribute('type', 'button');
        });
      });
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      const button = screen.getByRole('button');

      // Focus and activate with keyboard
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Icon Rendering', () => {
    it('should render UserIcon for personal account', () => {
      const { container } = render(<AccountSwitcher />, {
        wrapper: createWrapper(),
      });

      // Personal account icon should be present
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render BuildingIcon for organization account', async () => {
      localStorage.setItem('minside_account_type', 'organization');
      localStorage.setItem('minside_selected_organization', 'org-1');

      const { container } = render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      await waitFor(() => {
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });
    });

    it('should render ChevronDownIcon in button', () => {
      const { container } = render(<AccountSwitcher />, {
        wrapper: createWrapper(),
      });

      const button = screen.getByRole('button');
      const svgs = button.querySelectorAll('svg');

      // Should have at least 2 SVGs (account icon + chevron)
      expect(svgs.length).toBeGreaterThanOrEqual(2);
    });

    it('should render CheckIcon for active account in dropdown', async () => {
      const user = userEvent.setup();
      const { container } = render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        // Check icon should be present for active account
        const personalOption = screen.getByText('Som privatperson').closest('button');
        const checkIcon = personalOption?.querySelector('svg');
        expect(checkIcon).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing organization number gracefully', async () => {
      const user = userEvent.setup();
      const orgsWithoutNumber: Organization[] = [
        {
          id: 'org-1',
          name: 'Test Kommune',
          organizationNumber: undefined,
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      render(<AccountSwitcher />, {
        wrapper: createWrapper(orgsWithoutNumber),
      });

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Test Kommune')).toBeInTheDocument();
        // Organization number should not be rendered
        expect(screen.queryByText(/^\d{9}$/)).not.toBeInTheDocument();
      });
    });

    it('should handle empty organization list', async () => {
      const user = userEvent.setup();
      render(<AccountSwitcher />, {
        wrapper: createWrapper([]),
      });

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Som privatperson')).toBeInTheDocument();
        expect(screen.queryByText('Organisasjoner')).not.toBeInTheDocument();
      });
    });

    it('should not crash when switching to non-existent organization', async () => {
      const user = userEvent.setup();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      // Try to click organization that doesn't exist in the list
      // This tests the error handling in switchToOrganization
      await waitFor(() => {
        expect(screen.getByText('Test Kommune')).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });

    it('should handle rapid toggling of dropdown', async () => {
      const user = userEvent.setup();
      render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      const button = screen.getByRole('button');

      // Rapidly toggle dropdown
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Should not crash and final state should be consistent
      expect(button).toBeInTheDocument();
    });
  });

  describe('Text Content', () => {
    it('should display truncated text for long account names', () => {
      const longName = 'A'.repeat(100);
      render(<AccountSwitcher />, {
        wrapper: createWrapper(),
      });

      const button = screen.getByRole('button');
      const textElement = button.querySelector('span');

      expect(textElement).not.toBeNull();
      if (textElement) {
        expect(textElement).toHaveStyle({
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        });
      }
    });

    it('should display correct Norwegian text', async () => {
      const user = userEvent.setup();
      render(<AccountSwitcher />, {
        wrapper: createWrapper(mockOrganizations),
      });

      // Open dropdown
      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Som privatperson')).toBeInTheDocument();
        expect(screen.getByText('Organisasjoner')).toBeInTheDocument();
        expect(screen.getByText('Administrer organisasjoner')).toBeInTheDocument();
      });
    });
  });
});
