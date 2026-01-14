/**
 * Economy Service
 * Single Responsibility: Handle all economy, invoice, and billing operations
 */

import { BaseService } from './base.service';
import type {
  InvoiceBasis,
  SalesDocument,
  CreditNote,
  CreateInvoiceBasisDTO,
  UpdateInvoiceBasisDTO,
  GenerateInvoicesFromBookingsDTO,
  GenerateInvoicesResponse,
  FinalizeInvoiceBasisDTO,
  SendSalesDocumentDTO,
  MarkAsPaidDTO,
  CreateCreditNoteDTO,
  SyncToVismaDTO,
  SyncToVismaResponse,
  VismaStatusResponse,
  EconomyQueryParams,
  EconomyExportParams,
  EconomyStatistics,
} from '../types/economy';
import type { PaginatedResponse, SingleResponse, SuccessResponse } from '../types/enums';

/**
 * Economy Service
 * Handles invoice basis, sales documents, credit notes, and exports
 */
export class EconomyService extends BaseService {
  constructor() {
    super('/api/economy');
  }

  // ==========================================================================
  // Invoice Basis (Fakturagrunnlag)
  // ==========================================================================

  /**
   * Get paginated invoice bases
   */
  async getInvoiceBases(params?: EconomyQueryParams): Promise<PaginatedResponse<InvoiceBasis>> {
    return this.client.get(this.buildPath('/invoice-bases'), {
      params: params as Record<string, string | number | boolean>,
    });
  }

  /**
   * Get single invoice basis by ID
   */
  async getInvoiceBasis(id: string): Promise<SingleResponse<InvoiceBasis>> {
    return this.client.get(this.buildPath(`/invoice-bases/${id}`));
  }

  /**
   * Create invoice basis manually
   */
  async createInvoiceBasis(data: CreateInvoiceBasisDTO): Promise<SingleResponse<InvoiceBasis>> {
    return this.client.post(this.buildPath('/invoice-bases'), data);
  }

  /**
   * Generate invoice bases from bookings
   */
  async generateFromBookings(data: GenerateInvoicesFromBookingsDTO): Promise<SingleResponse<GenerateInvoicesResponse>> {
    return this.client.post(this.buildPath('/invoice-bases/generate'), data);
  }

  /**
   * Update invoice basis
   */
  async updateInvoiceBasis(id: string, data: UpdateInvoiceBasisDTO): Promise<SingleResponse<InvoiceBasis>> {
    return this.client.put(this.buildPath(`/invoice-bases/${id}`), data);
  }

  /**
   * Approve invoice basis
   */
  async approveInvoiceBasis(id: string): Promise<SingleResponse<InvoiceBasis>> {
    return this.client.put(this.buildPath(`/invoice-bases/${id}/approve`));
  }

  /**
   * Finalize invoice basis to sales document
   */
  async finalizeInvoiceBasis(data: FinalizeInvoiceBasisDTO): Promise<SingleResponse<SalesDocument>> {
    return this.client.post(this.buildPath('/invoice-bases/finalize'), data);
  }

  /**
   * Delete invoice basis
   */
  async deleteInvoiceBasis(id: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/invoice-bases/${id}`));
  }

  // ==========================================================================
  // Sales Documents (Salgsbilag)
  // ==========================================================================

  /**
   * Get paginated sales documents
   */
  async getSalesDocuments(params?: EconomyQueryParams): Promise<PaginatedResponse<SalesDocument>> {
    return this.client.get(this.buildPath('/sales-documents'), {
      params: params as Record<string, string | number | boolean>,
    });
  }

  /**
   * Get single sales document by ID
   */
  async getSalesDocument(id: string): Promise<SingleResponse<SalesDocument>> {
    return this.client.get(this.buildPath(`/sales-documents/${id}`));
  }

  /**
   * Send sales document to customer
   */
  async sendSalesDocument(data: SendSalesDocumentDTO): Promise<SingleResponse<SalesDocument>> {
    return this.client.post(this.buildPath('/sales-documents/send'), data);
  }

  /**
   * Mark sales document as paid
   */
  async markAsPaid(data: MarkAsPaidDTO): Promise<SingleResponse<SalesDocument>> {
    return this.client.put(this.buildPath(`/sales-documents/${data.salesDocumentId}/paid`), data);
  }

  /**
   * Download invoice PDF
   */
  async downloadInvoicePdf(id: string): Promise<Blob> {
    return this.client.get(this.buildPath(`/sales-documents/${id}/pdf`), {
      responseType: 'blob',
    });
  }

  /**
   * Cancel sales document
   */
  async cancelSalesDocument(id: string, reason?: string): Promise<SingleResponse<SalesDocument>> {
    return this.client.put(this.buildPath(`/sales-documents/${id}/cancel`), { reason });
  }

  // ==========================================================================
  // Credit Notes (Kreditnota)
  // ==========================================================================

  /**
   * Get paginated credit notes
   */
  async getCreditNotes(params?: EconomyQueryParams): Promise<PaginatedResponse<CreditNote>> {
    return this.client.get(this.buildPath('/credit-notes'), {
      params: params as Record<string, string | number | boolean>,
    });
  }

  /**
   * Get single credit note by ID
   */
  async getCreditNote(id: string): Promise<SingleResponse<CreditNote>> {
    return this.client.get(this.buildPath(`/credit-notes/${id}`));
  }

  /**
   * Create credit note
   */
  async createCreditNote(data: CreateCreditNoteDTO): Promise<SingleResponse<CreditNote>> {
    return this.client.post(this.buildPath('/credit-notes'), data);
  }

  /**
   * Approve credit note
   */
  async approveCreditNote(id: string): Promise<SingleResponse<CreditNote>> {
    return this.client.put(this.buildPath(`/credit-notes/${id}/approve`));
  }

  /**
   * Process credit note
   */
  async processCreditNote(id: string): Promise<SingleResponse<CreditNote>> {
    return this.client.put(this.buildPath(`/credit-notes/${id}/process`));
  }

  /**
   * Download credit note PDF
   */
  async downloadCreditNotePdf(id: string): Promise<Blob> {
    return this.client.get(this.buildPath(`/credit-notes/${id}/pdf`), {
      responseType: 'blob',
    });
  }

  // ==========================================================================
  // Visma Integration
  // ==========================================================================

  /**
   * Sync sales documents to Visma ERP
   */
  async syncToVisma(data: SyncToVismaDTO): Promise<SingleResponse<SyncToVismaResponse>> {
    return this.client.post(this.buildPath('/visma/sync'), data);
  }

  /**
   * Check Visma sync status for a sales document
   */
  async checkVismaStatus(salesDocumentId: string): Promise<SingleResponse<VismaStatusResponse>> {
    return this.client.get(this.buildPath(`/visma/status/${salesDocumentId}`));
  }

  // ==========================================================================
  // Export
  // ==========================================================================

  /**
   * Export economy data in specified format
   */
  async export(params: EconomyExportParams): Promise<Blob> {
    return this.client.post(this.buildPath('/export'), params, {
      responseType: 'blob',
    });
  }

  // ==========================================================================
  // Statistics
  // ==========================================================================

  /**
   * Get economy statistics and summary
   */
  async getStatistics(params?: { startDate?: string; endDate?: string }): Promise<SingleResponse<EconomyStatistics>> {
    return this.client.get(this.buildPath('/statistics'), {
      params: params as Record<string, string>,
    });
  }
}

// Create singleton instance
export const economyService = new EconomyService();
