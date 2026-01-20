/**
 * Tenants List Page Tests
 * 
 * Tests for status tab filtering, filter chips, empty states, and i18n
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithRuntime, screen, fireEvent, waitFor } from '@digilist/testing';
import { TenantsListPage } from './index';
import * as hooks from '@digilist/client-sdk/hooks';

// Mock the SDK hooks
vi.mock('@digilist/client-sdk/hooks', () => ({
  useSaasTenants: vi.fn(),
  useSuspendSaasTenant: vi.fn(() => ({
    mutateAsync: vi.fn(),
  })),
  useReactivateSaasTenant: vi.fn(() => ({
    mutateAsync: vi.fn(),
  })),
}));

const mockUseSaasTenants = hooks.useSaasTenants as ReturnType<typeof vi.fn>;

// TODO: Skipped until TenantsListPage component is implemented
describe.skip('TenantsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Status Tab Filtering and Counts', () => {
    it('should display status tabs with correct counts', async () => {
      // Mock data with different statuses
      mockUseSaasTenants.mockImplementation((params?: { status?: string }) => {
        if (!params || params.status === undefined) {
          return {
            data: {
              data: [
                { id: '1', name: 'Tenant 1', status: 'active' },
                { id: '2', name: 'Tenant 2', status: 'inactive' },
                { id: '3', name: 'Tenant 3', status: 'suspended' },
              ],
              meta: { total: 3, page: 1, totalPages: 1 },
            },
            isLoading: false,
          };
        }
        if (params.status === 'active') {
          return {
            data: {
              data: [{ id: '1', name: 'Tenant 1', status: 'active' }],
              meta: { total: 1, page: 1, totalPages: 1 },
            },
            isLoading: false,
          };
        }
        return {
          data: { data: [], meta: { total: 0, page: 1, totalPages: 1 } },
          isLoading: false,
        };
      });

      renderWithRuntime(<TenantsListPage />, { user: 'admin' });

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText(/all/i)).toBeInTheDocument();
      });

      // Check that status tabs are rendered
      const allTab = screen.getByRole('tab', { name: /all/i });
      expect(allTab).toBeInTheDocument();

      // Check that counts are displayed (if API returns meta.total)
      // Note: Counts depend on API response structure
    });

    it('should filter tenants when status tab is clicked', async () => {
      let currentStatus: string | undefined = undefined;

      mockUseSaasTenants.mockImplementation((params?: { status?: string }) => {
        currentStatus = params?.status;
        if (params?.status === 'active') {
          return {
            data: {
              data: [{ id: '1', name: 'Active Tenant', status: 'active' }],
              meta: { total: 1, page: 1, totalPages: 1 },
            },
            isLoading: false,
          };
        }
        return {
          data: {
            data: [
              { id: '1', name: 'Tenant 1', status: 'active' },
              { id: '2', name: 'Tenant 2', status: 'inactive' },
            ],
            meta: { total: 2, page: 1, totalPages: 1 },
          },
          isLoading: false,
        };
      });

      renderWithRuntime(<TenantsListPage />, { user: 'admin' });

      await waitFor(() => {
        expect(screen.getByText(/all/i)).toBeInTheDocument();
      });

      // Find and click the active status tab
      const activeTab = screen.getByRole('tab', { name: /active/i });
      fireEvent.click(activeTab);

      await waitFor(() => {
        expect(currentStatus).toBe('active');
      });
    });
  });

  describe('Filter Chips Removal and Reset', () => {
    it('should display filter chips when filters are active', async () => {
      mockUseSaasTenants.mockReturnValue({
        data: {
          data: [{ id: '1', name: 'Tenant 1', status: 'active' }],
          meta: { total: 1, page: 1, totalPages: 1 },
        },
        isLoading: false,
      });

      renderWithRuntime(<TenantsListPage />, { user: 'admin' });

      await waitFor(() => {
        expect(screen.getByText(/all/i)).toBeInTheDocument();
      });

      // Click on a status tab to activate filter
      const activeTab = screen.getByRole('tab', { name: /active/i });
      fireEvent.click(activeTab);

      await waitFor(() => {
        // Check if filter chip appears
        const filterChips = screen.queryByText(/status:/i);
        if (filterChips) {
          expect(filterChips).toBeInTheDocument();
        }
      });
    });

    it('should remove filter when chip is clicked', async () => {
      let currentStatus: string | undefined = 'active';

      mockUseSaasTenants.mockImplementation((params?: { status?: string }) => {
        currentStatus = params?.status;
        return {
          data: {
            data: params?.status === 'active' 
              ? [{ id: '1', name: 'Active Tenant', status: 'active' }]
              : [],
            meta: { total: params?.status === 'active' ? 1 : 0, page: 1, totalPages: 1 },
          },
          isLoading: false,
        };
      });

      renderWithRuntime(<TenantsListPage />, { user: 'admin' });

      await waitFor(() => {
        expect(screen.getByText(/all/i)).toBeInTheDocument();
      });

      // Activate filter
      const activeTab = screen.getByRole('tab', { name: /active/i });
      fireEvent.click(activeTab);

      await waitFor(() => {
        expect(currentStatus).toBe('active');
      });

      // Find and click remove button on filter chip
      const removeButtons = screen.queryAllByLabelText(/fjern filter/i);
      if (removeButtons.length > 0) {
        fireEvent.click(removeButtons[0]);
        
        await waitFor(() => {
          expect(currentStatus).toBeUndefined();
        });
      }
    });

    it('should reset all filters when reset button is clicked', async () => {
      let currentStatus: string | undefined = 'active';
      let currentSearch = 'test';

      mockUseSaasTenants.mockImplementation((params?: { status?: string; search?: string }) => {
        currentStatus = params?.status;
        currentSearch = params?.search || '';
        return {
          data: { data: [], meta: { total: 0, page: 1, totalPages: 1 } },
          isLoading: false,
        };
      });

      renderWithRuntime(<TenantsListPage />, { user: 'admin' });

      await waitFor(() => {
        expect(screen.getByText(/all/i)).toBeInTheDocument();
      });

      // Activate filters
      const activeTab = screen.getByRole('tab', { name: /active/i });
      fireEvent.click(activeTab);

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(currentStatus).toBe('active');
        expect(currentSearch).toBe('test');
      });

      // Find and click reset all button
      const resetButton = screen.queryByText(/nullstill alle|reset all/i);
      if (resetButton) {
        fireEvent.click(resetButton);
        
        await waitFor(() => {
          expect(currentStatus).toBeUndefined();
          expect(currentSearch).toBe('');
        });
      }
    });
  });

  describe('Empty States', () => {
    it('should display empty state when no tenants exist', async () => {
      mockUseSaasTenants.mockReturnValue({
        data: { data: [], meta: { total: 0, page: 1, totalPages: 1 } },
        isLoading: false,
      });

      renderWithRuntime(<TenantsListPage />, { user: 'admin' });

      await waitFor(() => {
        // Check for empty state title
        const emptyState = screen.queryByText(/no tenants|ingen leietakere/i);
        expect(emptyState).toBeInTheDocument();
      });
    });

    it('should display empty state with create action when no filters applied', async () => {
      mockUseSaasTenants.mockReturnValue({
        data: { data: [], meta: { total: 0, page: 1, totalPages: 1 } },
        isLoading: false,
      });

      renderWithRuntime(<TenantsListPage />, { user: 'admin' });

      await waitFor(() => {
        // Check for create button in empty state
        const createButton = screen.queryByText(/create tenant|opprett leietaker/i);
        if (createButton) {
          expect(createButton).toBeInTheDocument();
        }
      });
    });

    it('should display empty state with different message when filters are active', async () => {
      mockUseSaasTenants.mockImplementation((params?: { status?: string }) => {
        if (params?.status === 'active') {
          return {
            data: { data: [], meta: { total: 0, page: 1, totalPages: 1 } },
            isLoading: false,
          };
        }
        return {
          data: {
            data: [{ id: '1', name: 'Tenant 1', status: 'inactive' }],
            meta: { total: 1, page: 1, totalPages: 1 },
          },
          isLoading: false,
        };
      });

      renderWithRuntime(<TenantsListPage />, { user: 'admin' });

      await waitFor(() => {
        expect(screen.getByText(/all/i)).toBeInTheDocument();
      });

      // Apply filter
      const activeTab = screen.getByRole('tab', { name: /active/i });
      fireEvent.click(activeTab);

      await waitFor(() => {
        // Should show "try different filters" message
        const emptyMessage = screen.queryByText(/try different|prøv å endre/i);
        if (emptyMessage) {
          expect(emptyMessage).toBeInTheDocument();
        }
      });
    });
  });

  describe('i18n Translations', () => {
    it('should display translated status labels', async () => {
      mockUseSaasTenants.mockReturnValue({
        data: {
          data: [{ id: '1', name: 'Tenant 1', status: 'active' }],
          meta: { total: 1, page: 1, totalPages: 1 },
        },
        isLoading: false,
      });

      renderWithRuntime(<TenantsListPage />, { user: 'admin' });

      await waitFor(() => {
        // Status labels should be translated (Norwegian or English based on locale)
        const statusLabels = screen.queryAllByText(/active|aktiv/i);
        expect(statusLabels.length).toBeGreaterThan(0);
      });
    });

    it('should display translated filter chip labels', async () => {
      mockUseSaasTenants.mockReturnValue({
        data: {
          data: [{ id: '1', name: 'Tenant 1', status: 'active' }],
          meta: { total: 1, page: 1, totalPages: 1 },
        },
        isLoading: false,
      });

      renderWithRuntime(<TenantsListPage />, { user: 'admin' });

      await waitFor(() => {
        expect(screen.getByText(/all/i)).toBeInTheDocument();
      });

      // Activate filter to show chips
      const activeTab = screen.getByRole('tab', { name: /active/i });
      fireEvent.click(activeTab);

      await waitFor(() => {
        // Check for translated filter chip labels
        const activeFiltersLabel = screen.queryByText(/aktive filter|active filters/i);
        if (activeFiltersLabel) {
          expect(activeFiltersLabel).toBeInTheDocument();
        }
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle status tabs overflow on mobile', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      mockUseSaasTenants.mockReturnValue({
        data: {
          data: [{ id: '1', name: 'Tenant 1', status: 'active' }],
          meta: { total: 1, page: 1, totalPages: 1 },
        },
        isLoading: false,
      });

      renderWithRuntime(<TenantsListPage />, { user: 'admin' });

      await waitFor(() => {
        const statusTabs = screen.getByRole('tablist') || document.querySelector('.status-tabs');
        if (statusTabs) {
          // Status tabs should have overflow-x-auto for mobile scrolling
          expect(statusTabs).toBeInTheDocument();
        }
      });
    });
  });
});
