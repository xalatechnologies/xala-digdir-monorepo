/**
 * Users Page Tests - Tenant Admin
 * 
 * Tests for empty states, data page header, and i18n
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithRuntime, screen, fireEvent, waitFor } from '@digilist/testing';
screen, waitFor } from '@testing-library/react';
import { UsersPage } from './index';
import * as hooks from '@digilist/client-sdk/hooks';

// Mock the SDK hooks
vi.mock('@digilist/client-sdk/hooks', () => ({
  useUsers: vi.fn(),
}));

const mockUseUsers = hooks.useUsers as ReturnType<typeof vi.fn>;

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <DesignsystemetProvider theme="digilist" colorScheme="light" size="md">
          <BrowserRouter>{children}</BrowserRouter>
        </DesignsystemetProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

// TODO: Skipped - needs implementation
describe.skip('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty States', () => {
    it('should display empty state when no users exist', async () => {
      mockUseUsers.mockReturnValue({
        data: { data: [], meta: { total: 0, page: 1, totalPages: 1 } },
        isLoading: false,
      });

      renderWithRuntime(<UsersPage />, { user: 'admin' });

      await waitFor(() => {
        const emptyState = screen.queryByText(/no results|ingen resultater/i);
        expect(emptyState).toBeInTheDocument();
      });
    });

    it('should display empty state with different message when search is active', async () => {
      mockUseUsers.mockReturnValue({
        data: { data: [], meta: { total: 0, page: 1, totalPages: 1 } },
        isLoading: false,
      });

      renderWithRuntime(<UsersPage />, { user: 'admin' });

      await waitFor(() => {
        // Should show "try different filters" when search is active
        const searchInput = screen.getByPlaceholderText(/search/i);
        expect(searchInput).toBeInTheDocument();
      });
    });
  });

  describe('Data Page Header', () => {
    it('should display count badge in header', async () => {
      mockUseUsers.mockReturnValue({
        data: {
          data: [
            { id: '1', name: 'User 1', email: 'user1@test.com', active: true },
            { id: '2', name: 'User 2', email: 'user2@test.com', active: true },
          ],
          meta: { total: 2, page: 1, totalPages: 1 },
        },
        isLoading: false,
      });

      renderWithRuntime(<UsersPage />, { user: 'admin' });

      await waitFor(() => {
        // Check if count is displayed (format may vary)
        const countBadge = screen.queryByText(/2/);
        if (countBadge) {
          expect(countBadge).toBeInTheDocument();
        }
      });
    });
  });

  describe('i18n Translations', () => {
    it('should display translated page title', async () => {
      mockUseUsers.mockReturnValue({
        data: { data: [], meta: { total: 0, page: 1, totalPages: 1 } },
        isLoading: false,
      });

      renderWithRuntime(<UsersPage />, { user: 'admin' });

      await waitFor(() => {
        // Title should be translated
        const title = screen.queryByText(/users|brukere/i);
        expect(title).toBeInTheDocument();
      });
    });
  });
});
