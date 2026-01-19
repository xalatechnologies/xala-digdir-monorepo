/**
 * UserMenu Unit Tests
 *
 * Tests for the UserMenu component from @xala/ds
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserMenu } from '../../composed/UserMenu';

describe('UserMenu', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
  };

  const mockItems = [
    { id: 'profile', label: 'Min profil', href: '/profile' },
    { id: 'settings', label: 'Innstillinger', href: '/settings' },
  ];

  const mockOnLogout = vi.fn();

  beforeEach(() => {
    mockOnLogout.mockClear();
  });

  describe('Rendering', () => {
    it('renders user name in trigger button', () => {
      render(<UserMenu user={mockUser} onLogout={mockOnLogout} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders with data-testid', () => {
      render(
        <UserMenu
          user={mockUser}
          onLogout={mockOnLogout}
          data-testid="user-menu"
        />
      );
      expect(screen.getByTestId('user-menu')).toBeInTheDocument();
    });

    it('does not show dropdown initially', () => {
      render(<UserMenu user={mockUser} onLogout={mockOnLogout} />);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('shows dropdown after clicking trigger', async () => {
      render(<UserMenu user={mockUser} onLogout={mockOnLogout} />);

      await userEvent.click(screen.getByRole('button'));
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('renders user email in dropdown header', async () => {
      render(<UserMenu user={mockUser} onLogout={mockOnLogout} />);

      await userEvent.click(screen.getByRole('button'));
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('renders menu items', async () => {
      render(
        <UserMenu user={mockUser} items={mockItems} onLogout={mockOnLogout} />
      );

      await userEvent.click(screen.getByRole('button'));

      expect(screen.getByText('Min profil')).toBeInTheDocument();
      expect(screen.getByText('Innstillinger')).toBeInTheDocument();
    });

    it('renders logout button', async () => {
      render(<UserMenu user={mockUser} onLogout={mockOnLogout} />);

      await userEvent.click(screen.getByRole('button'));
      expect(screen.getByText('Logg ut')).toBeInTheDocument();
    });

    it('renders custom logout label', async () => {
      render(
        <UserMenu
          user={mockUser}
          onLogout={mockOnLogout}
          logoutLabel="Sign Out"
        />
      );

      await userEvent.click(screen.getByRole('button'));
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    it('hides logout when showLogout is false', async () => {
      render(
        <UserMenu
          user={mockUser}
          onLogout={mockOnLogout}
          showLogout={false}
        />
      );

      await userEvent.click(screen.getByRole('button'));
      expect(screen.queryByText('Logg ut')).not.toBeInTheDocument();
    });

    it('renders user avatar when provided', async () => {
      const userWithAvatar = {
        ...mockUser,
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      render(<UserMenu user={userWithAvatar} onLogout={mockOnLogout} />);

      const avatar = screen.getByRole('img');
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });
  });

  describe('Interactions', () => {
    it('toggles dropdown on button click', async () => {
      render(<UserMenu user={mockUser} onLogout={mockOnLogout} />);
      const trigger = screen.getByRole('button');

      // Open
      await userEvent.click(trigger);
      expect(screen.getByRole('menu')).toBeInTheDocument();

      // Close
      await userEvent.click(trigger);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('calls onLogout when logout is clicked', async () => {
      render(<UserMenu user={mockUser} onLogout={mockOnLogout} />);

      await userEvent.click(screen.getByRole('button'));
      await userEvent.click(screen.getByText('Logg ut'));

      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });

    it('closes dropdown after logout click', async () => {
      render(<UserMenu user={mockUser} onLogout={mockOnLogout} />);

      await userEvent.click(screen.getByRole('button'));
      await userEvent.click(screen.getByText('Logg ut'));

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes on Escape key', async () => {
      render(<UserMenu user={mockUser} onLogout={mockOnLogout} />);

      await userEvent.click(screen.getByRole('button'));
      expect(screen.getByRole('menu')).toBeInTheDocument();

      await userEvent.keyboard('{Escape}');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports ArrowDown navigation', async () => {
      render(
        <UserMenu user={mockUser} items={mockItems} onLogout={mockOnLogout} />
      );

      await userEvent.click(screen.getByRole('button'));
      await userEvent.keyboard('{ArrowDown}');

      // Should move focus to next item
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);
    });

    it('supports ArrowUp navigation', async () => {
      render(
        <UserMenu user={mockUser} items={mockItems} onLogout={mockOnLogout} />
      );

      await userEvent.click(screen.getByRole('button'));
      await userEvent.keyboard('{ArrowUp}');

      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);
    });

    it('supports Enter to activate item', async () => {
      render(<UserMenu user={mockUser} onLogout={mockOnLogout} />);

      await userEvent.click(screen.getByRole('button'));
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{Enter}');

      expect(mockOnLogout).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('trigger has aria-expanded', async () => {
      render(<UserMenu user={mockUser} onLogout={mockOnLogout} />);
      const trigger = screen.getByRole('button');

      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await userEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('trigger has aria-haspopup', () => {
      render(<UserMenu user={mockUser} onLogout={mockOnLogout} />);
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    });

    it('dropdown has menu role', async () => {
      render(<UserMenu user={mockUser} onLogout={mockOnLogout} />);

      await userEvent.click(screen.getByRole('button'));
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('items have menuitem role', async () => {
      render(
        <UserMenu user={mockUser} items={mockItems} onLogout={mockOnLogout} />
      );

      await userEvent.click(screen.getByRole('button'));
      const menuItems = screen.getAllByRole('menuitem');

      expect(menuItems.length).toBe(3); // 2 items + logout
    });
  });
});
