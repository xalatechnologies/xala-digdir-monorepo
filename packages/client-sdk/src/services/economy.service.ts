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
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of invoice bases
   */
  async getInvoiceBases(params?: EconomyQueryParams): Promise<PaginatedResponse<InvoiceBasis>> {
    return this.client.get(this.buildPath('/invoice-bases'), {
      params: params as Record<string, string | number | boolean>,
    });
  }

  /**
   * Get single invoice basis by ID
   * @param id - Invoice basis ID
   * @returns Single invoice basis
   */
  async getInvoiceBasis(id: string): Promise<SingleResponse<InvoiceBasis>> {
    return this.client.get(this.buildPath(`/invoice-bases/${id}`));
  }

  /**
   * Create invoice basis manually
   * @param data - Invoice basis creation data
   * @returns Created invoice basis
   */
  async createInvoiceBasis(data: CreateInvoiceBasisDTO): Promise<SingleResponse<InvoiceBasis>> {
    return this.client.post(this.buildPath('/invoice-bases'), data);
  }

  /**
   * Generate invoice bases from bookings
   * @param data - Booking selection criteria for invoice generation
   * @returns Generation result with created invoice bases
   * @example
   * ```typescript
   * // Generate invoice bases for all completed bookings in a date range
   * const result = await economyService.generateFromBookings({
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31',
   *   status: 'completed'
   * });
   * console.log(`Generated ${result.data.count} invoice bases`);
   * ```
   */
  async generateFromBookings(data: GenerateInvoicesFromBookingsDTO): Promise<SingleResponse<GenerateInvoicesResponse>> {
    return this.client.post(this.buildPath('/invoice-bases/generate'), data);
  }

  /**
   * Update invoice basis
   * @param id - Invoice basis ID
   * @param data - Updated invoice basis data
   * @returns Updated invoice basis
   */
  async updateInvoiceBasis(id: string, data: UpdateInvoiceBasisDTO): Promise<SingleResponse<InvoiceBasis>> {
    return this.client.put(this.buildPath(`/invoice-bases/${id}`), data);
  }

  /**
   * Approve invoice basis
   * @param id - Invoice basis ID
   * @returns Approved invoice basis
   */
  async approveInvoiceBasis(id: string): Promise<SingleResponse<InvoiceBasis>> {
    return this.client.put(this.buildPath(`/invoice-bases/${id}/approve`));
  }

  /**
   * Finalize invoice basis to sales document
   * @param data - Finalization data with invoice basis IDs
   * @returns Created sales document
   * @example
   * ```typescript
   * // Finalize multiple invoice bases into a single sales document
   * const salesDoc = await economyService.finalizeInvoiceBasis({
   *   invoiceBasisIds: ['ib-123', 'ib-456', 'ib-789'],
   *   dueDate: '2024-02-15',
   *   notes: 'Monthly rental invoices'
   * });
   * console.log(`Invoice created: ${salesDoc.data.invoiceNumber}`);
   * ```
   */
  async finalizeInvoiceBasis(data: FinalizeInvoiceBasisDTO): Promise<SingleResponse<SalesDocument>> {
    return this.client.post(this.buildPath('/invoice-bases/finalize'), data);
  }

  /**
   * Delete invoice basis
   * @param id - Invoice basis ID
   * @returns Success response
   */
  async deleteInvoiceBasis(id: string): Promise<SuccessResponse> {
    return this.client.delete(this.buildPath(`/invoice-bases/${id}`));
  }

  // ==========================================================================
  // Sales Documents (Salgsbilag)
  // ==========================================================================

  /**
   * Get paginated sales documents
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of sales documents
   */
  async getSalesDocuments(params?: EconomyQueryParams): Promise<PaginatedResponse<SalesDocument>> {
    return this.client.get(this.buildPath('/sales-documents'), {
      params: params as Record<string, string | number | boolean>,
    });
  }

  /**
   * Get single sales document by ID
   * @param id - Sales document ID
   * @returns Single sales document
   */
  async getSalesDocument(id: string): Promise<SingleResponse<SalesDocument>> {
    return this.client.get(this.buildPath(`/sales-documents/${id}`));
  }

  /**
   * Send sales document to customer
   * @param data - Send request with sales document ID and delivery options
   * @returns Updated sales document
   */
  async sendSalesDocument(data: SendSalesDocumentDTO): Promise<SingleResponse<SalesDocument>> {
    return this.client.post(this.buildPath('/sales-documents/send'), data);
  }

  /**
   * Mark sales document as paid
   * @param data - Payment data with sales document ID and payment details
   * @returns Updated sales document
   */
  async markAsPaid(data: MarkAsPaidDTO): Promise<SingleResponse<SalesDocument>> {
    return this.client.put(this.buildPath(`/sales-documents/${data.salesDocumentId}/paid`), data);
  }

  /**
   * Download invoice PDF
   * @param id - Sales document ID
   * @returns PDF file as Blob
   */
  async downloadInvoicePdf(id: string): Promise<Blob> {
    return this.client.get(this.buildPath(`/sales-documents/${id}/pdf`), {
      responseType: 'blob',
    });
  }

  /**
   * Cancel sales document
   * @param id - Sales document ID
   * @param reason - Optional cancellation reason
   * @returns Cancelled sales document
   */
  async cancelSalesDocument(id: string, reason?: string): Promise<SingleResponse<SalesDocument>> {
    return this.client.put(this.buildPath(`/sales-documents/${id}/cancel`), { reason });
  }

  // ==========================================================================
  // Credit Notes (Kreditnota)
  // ==========================================================================

  /**
   * Get paginated credit notes
   * @param params - Query parameters for filtering and pagination
   * @returns Paginated list of credit notes
   */
  async getCreditNotes(params?: EconomyQueryParams): Promise<PaginatedResponse<CreditNote>> {
    return this.client.get(this.buildPath('/credit-notes'), {
      params: params as Record<string, string | number | boolean>,
    });
  }

  /**
   * Get single credit note by ID
   * @param id - Credit note ID
   * @returns Single credit note
   */
  async getCreditNote(id: string): Promise<SingleResponse<CreditNote>> {
    return this.client.get(this.buildPath(`/credit-notes/${id}`));
  }

  /**
   * Create credit note
   * @param data - Credit note creation data
   * @returns Created credit note
   * @example
   * ```typescript
   * // Create a credit note for a cancelled booking
   * const creditNote = await economyService.createCreditNote({
   *   salesDocumentId: 'sd-123',
   *   amount: 1500.00,
   *   reason: 'Booking cancelled by customer',
   *   lineItems: [
   *     { description: 'Refund for booking #456', amount: 1500.00 }
   *   ]
   * });
   * console.log(`Credit note created: ${creditNote.data.creditNoteNumber}`);
   * ```
   */
  async createCreditNote(data: CreateCreditNoteDTO): Promise<SingleResponse<CreditNote>> {
    return this.client.post(this.buildPath('/credit-notes'), data);
  }

  /**
   * Approve credit note
   * @param id - Credit note ID
   * @returns Approved credit note
   */
  async approveCreditNote(id: string): Promise<SingleResponse<CreditNote>> {
    return this.client.put(this.buildPath(`/credit-notes/${id}/approve`));
  }

  /**
   * Process credit note
   * @param id - Credit note ID
   * @returns Processed credit note
   */
  async processCreditNote(id: string): Promise<SingleResponse<CreditNote>> {
    return this.client.put(this.buildPath(`/credit-notes/${id}/process`));
  }

  /**
   * Download credit note PDF
   * @param id - Credit note ID
   * @returns PDF file as Blob
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
   * @param data - Sync request with sales document IDs
   * @returns Sync result with status
   * @example
   * ```typescript
   * // Sync approved sales documents to Visma accounting system
   * const result = await economyService.syncToVisma({
   *   salesDocumentIds: ['sd-123', 'sd-456']
   * });
   * console.log(`Synced ${result.data.successCount} of ${result.data.totalCount} documents`);
   * result.data.errors.forEach(err => console.error(`Failed: ${err.message}`));
   * ```
   */
  async syncToVisma(data: SyncToVismaDTO): Promise<SingleResponse<SyncToVismaResponse>> {
    return this.client.post(this.buildPath('/visma/sync'), data);
  }

  /**
   * Check Visma sync status for a sales document
   * @param salesDocumentId - Sales document ID
   * @returns Visma sync status
   */
  async checkVismaStatus(salesDocumentId: string): Promise<SingleResponse<VismaStatusResponse>> {
    return this.client.get(this.buildPath(`/visma/status/${salesDocumentId}`));
  }

  // ==========================================================================
  // Export
  // ==========================================================================

  /**
   * Export economy data in specified format
   * @param params - Export parameters including format, date range, and filters
   * @returns Exported file as Blob
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
   * @param params - Optional date range for statistics
   * @param params.startDate - Start date for statistics period
   * @param params.endDate - End date for statistics period
   * @returns Economy statistics and summary
   * @example
   * ```typescript
   * // Get economy statistics for Q1 2024
   * const stats = await economyService.getStatistics({
   *   startDate: '2024-01-01',
   *   endDate: '2024-03-31'
   * });
   * console.log(`Total revenue: ${stats.data.totalRevenue}`);
   * console.log(`Outstanding invoices: ${stats.data.outstandingCount}`);
   * console.log(`Payment rate: ${stats.data.paymentRate}%`);
   * ```
   */
  async getStatistics(params?: { startDate?: string; endDate?: string }): Promise<SingleResponse<EconomyStatistics>> {
    return this.client.get(this.buildPath('/statistics'), {
      params: params as Record<string, string>,
    });
  }
}

// Create singleton instance
export const economyService = new EconomyService();
