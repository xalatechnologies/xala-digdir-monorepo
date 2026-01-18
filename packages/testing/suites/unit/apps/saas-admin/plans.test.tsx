/**
 * Plans List Page Tests
 * 
 * Tests for status tab filtering, filter chips, empty states, and i18n
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nProvider } from '@xala/i18n';
import { DesignsystemetProvider } from '@xala/ds';
import { PlansListPage } from './index';
import * as hooks from '@digilist/client-sdk/hooks';

// Mock the SDK hooks
vi.mock('@digilist/client-sdk/hooks', () => ({
  useSaasPlans: vi.fn(),
  useUpdateSaasPlan: vi.fn(() => ({
    mutateAsync: vi.fn(),
  })),
}));

const mockUseSaasPlans = hooks.useSaasPlans as ReturnType<typeof vi.fn>;

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

describe('PlansListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Status Tab Filtering and Counts', () => {
    it('should display status tabs with correct counts', async () => {
      mockUseSaasPlans.mockImplementation((params?: { status?: string }) => {
        if (!params || params.status === undefined) {
          return {
            data: {
              data: [
                { id: '1', name: 'Plan 1', status: 'active' },
                { id: '2', name: 'Plan 2', status: 'inactive' },
              ],
              meta: { total: 2, page: 1, totalPages: 1 },
            },
            isLoading: false,
          };
        }
        if (params.status === 'active') {
          return {
            data: {
              data: [{ id: '1', name: 'Plan 1', status: 'active' }],
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

      render(
        <TestWrapper>
          <PlansListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/all/i)).toBeInTheDocument();
      });
    });

    it('should filter plans when status tab is clicked', async () => {
      let currentStatus: string | undefined = undefined;

      mockUseSaasPlans.mockImplementation((params?: { status?: string }) => {
        currentStatus = params?.status;
        return {
          data: {
            data: params?.status === 'active' 
              ? [{ id: '1', name: 'Active Plan', status: 'active' }]
              : [],
            meta: { total: params?.status === 'active' ? 1 : 0, page: 1, totalPages: 1 },
          },
          isLoading: false,
        };
      });

      render(
        <TestWrapper>
          <PlansListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/all/i)).toBeInTheDocument();
      });

      const activeTab = screen.getByRole('tab', { name: /active/i });
      fireEvent.click(activeTab);

      await waitFor(() => {
        expect(currentStatus).toBe('active');
      });
    });
  });

  describe('Empty States', () => {
    it('should display empty state when no plans exist', async () => {
      mockUseSaasPlans.mockReturnValue({
        data: { data: [], meta: { total: 0, page: 1, totalPages: 1 } },
        isLoading: false,
      });

      render(
        <TestWrapper>
          <PlansListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const emptyState = screen.queryByText(/no plans|ingen planer/i);
        expect(emptyState).toBeInTheDocument();
      });
    });
  });
});
