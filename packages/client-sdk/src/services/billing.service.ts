/**
 * Billing Service
 * User billing summary and invoice operations (Minside portal)
 */
import { getClient } from '@/core/client-factory';
import type { PaginatedResponse, SingleResponse } from '@/types/enums';
import type { InvoiceLineItem } from '@/types/economy';

// =============================================================================
// Billing Types
// =============================================================================

export interface BillingSummary {
  totalPaid: number;
  totalOutstanding: number;
  totalPending: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  invoiceCount: number;
  overdueCount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  userId: string;
  organizationId?: string;
  bookingId?: string;
  bookingReference?: string;
  listingName?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'credited';
  dueDate: string;
  paidAt?: string;
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
  lineItems?: InvoiceLineItem[]; // Reusing existing type from economy.ts
}

export interface InvoiceQueryParams {
  status?: string;
  period?: string; // e.g., '12m', '6m', '3m'
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

// =============================================================================
// Billing Service
// =============================================================================

class BillingService {
  private basePath = '/api/me/billing';

  /**
   * Get billing summary for current user
   * @param params.period - Period to summarize (e.g., '12m', '6m', 'all')
   */
  async getSummary(params?: { period?: string }): Promise<SingleResponse<BillingSummary>> {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.set('period', params.period);
    
    const url = queryParams.toString()
      ? `${this.basePath}/summary?${queryParams.toString()}`
      : `${this.basePath}/summary`;
    
    return getClient().get<SingleResponse<BillingSummary>>(url);
  }

  /**
   * Get paginated list of invoices for current user
   */
  async listInvoices(params?: InvoiceQueryParams): Promise<PaginatedResponse<Invoice>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.set(key, String(value));
      });
    }
    
    const url = queryParams.toString()
      ? `/api/me/invoices?${queryParams.toString()}`
      : `/api/me/invoices`;
    
    return getClient().get<PaginatedResponse<Invoice>>(url);
  }

  /**
   * Get single invoice by ID
   */
  async getInvoice(id: string): Promise<SingleResponse<Invoice>> {
    return getClient().get<SingleResponse<Invoice>>(`/api/me/invoices/${id}`);
  }

  /**
   * Download invoice as PDF
   * Returns a Blob for client-side download
   */
  async downloadInvoice(id: string): Promise<Blob> {
    const response = await getClient().get<Blob>(`/api/me/invoices/${id}/download`, {
      responseType: 'blob'
    });
    return response;
  }

  /**
   * Get invoice download URL (alternative to blob download)
   */
  async getInvoiceDownloadUrl(id: string): Promise<{ url: string; expiresAt: string }> {
    return getClient().get<{ url: string; expiresAt: string }>(`/api/me/invoices/${id}/download-url`);
  }
}

// =============================================================================
// Organization Billing Service (org-scoped)
// =============================================================================

class OrgBillingService {
  private buildPath(orgId: string, path = '') {
    return `/api/orgs/${orgId}/billing${path}`;
  }

  /**
   * Get billing summary for organization
   */
  async getSummary(orgId: string, params?: { period?: string }): Promise<SingleResponse<BillingSummary>> {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.set('period', params.period);
    
    const url = queryParams.toString()
      ? `${this.buildPath(orgId, '/summary')}?${queryParams.toString()}`
      : this.buildPath(orgId, '/summary');
    
    return getClient().get<SingleResponse<BillingSummary>>(url);
  }

  /**
   * Get paginated list of invoices for organization
   */
  async listInvoices(orgId: string, params?: InvoiceQueryParams): Promise<PaginatedResponse<Invoice>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.set(key, String(value));
      });
    }
    
    const url = queryParams.toString()
      ? `/api/orgs/${orgId}/invoices?${queryParams.toString()}`
      : `/api/orgs/${orgId}/invoices`;
    
    return getClient().get<PaginatedResponse<Invoice>>(url);
  }

  /**
   * Get single invoice by ID for organization
   */
  async getInvoice(orgId: string, invoiceId: string): Promise<SingleResponse<Invoice>> {
    return getClient().get<SingleResponse<Invoice>>(`/api/orgs/${orgId}/invoices/${invoiceId}`);
  }

  /**
   * Download organization invoice as PDF
   */
  async downloadInvoice(orgId: string, invoiceId: string): Promise<Blob> {
    const response = await getClient().get<Blob>(`/api/orgs/${orgId}/invoices/${invoiceId}/download`, {
      responseType: 'blob'
    });
    return response;
  }
}

// Singleton instances
export const billingService = new BillingService();
export const orgBillingService = new OrgBillingService();
