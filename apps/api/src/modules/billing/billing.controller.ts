/**
 * Billing Controller
 * User and organization billing management endpoints
 * 
 * Endpoints:
 * - GET /api/me/billing/summary - Get current user's billing summary
 * - GET /api/me/invoices - List user's invoices
 * - GET /api/me/invoices/:id - Get single invoice
 * - GET /api/me/invoices/:id/download - Download invoice PDF
 * - GET /api/me/invoices/:id/download-url - Get temporary download URL
 * - GET /api/orgs/:orgId/billing/summary - Get org billing summary
 * - GET /api/orgs/:orgId/invoices - List org invoices
 * - GET /api/orgs/:orgId/invoices/:id - Get single org invoice
 * - GET /api/orgs/:orgId/invoices/:id/download - Download org invoice PDF
 */

import { Controller, Get } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';

// Types
interface BillingSummary {
  totalPaid: number;
  totalOutstanding: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
}

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  vatRate: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId?: string;
  organizationId?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidAt?: string;
  issuedAt: string;
  createdAt: string;
  lineItems: InvoiceLineItem[];
}

// Mock data
const mockUserInvoices: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2026-0001',
    bookingId: 'booking-123',
    amount: 1500,
    currency: 'NOK',
    status: 'paid',
    dueDate: '2026-01-15',
    paidAt: '2026-01-10',
    issuedAt: '2026-01-01',
    createdAt: '2026-01-01T10:00:00Z',
    lineItems: [
      { description: 'Idrettshall - 2 timer', quantity: 2, unitPrice: 750, amount: 1500, vatRate: 0 },
    ],
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-2026-0012',
    bookingId: 'booking-456',
    amount: 2250,
    currency: 'NOK',
    status: 'sent',
    dueDate: '2026-02-01',
    issuedAt: '2026-01-14',
    createdAt: '2026-01-14T09:00:00Z',
    lineItems: [
      { description: 'Fotballbane - 3 timer', quantity: 3, unitPrice: 750, amount: 2250, vatRate: 0 },
    ],
  },
];

const mockOrgInvoices: Invoice[] = [
  {
    id: 'org-inv-001',
    invoiceNumber: 'ORG-2026-0001',
    organizationId: 'org-123',
    amount: 12500,
    currency: 'NOK',
    status: 'paid',
    dueDate: '2026-01-15',
    paidAt: '2026-01-12',
    issuedAt: '2026-01-01',
    createdAt: '2026-01-01T10:00:00Z',
    lineItems: [
      { description: 'Sesongavgift - Vår 2026', quantity: 1, unitPrice: 10000, amount: 10000, vatRate: 0 },
      { description: 'Administrasjonsgebyr', quantity: 1, unitPrice: 2500, amount: 2500, vatRate: 0 },
    ],
  },
];

@Controller('/api/me/billing')
export class UserBillingController {
  /**
   * GET /api/me/billing/summary
   * Get current user's billing summary
   */
  @Get('/summary')
  async getSummary(request: FastifyRequest<{ Querystring: { period?: string } }>, reply: FastifyReply) {
    const period = request.query.period || 'current-year';
    
    const summary: BillingSummary = {
      totalPaid: mockUserInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
      totalOutstanding: mockUserInvoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0),
      currency: 'NOK',
      periodStart: '2026-01-01',
      periodEnd: '2026-12-31',
    };

    return reply.send({ data: summary });
  }
}

@Controller('/api/me/invoices')
export class UserInvoicesController {
  /**
   * GET /api/me/invoices
   * List user's invoices
   */
  @Get()
  async listInvoices(
    request: FastifyRequest<{ Querystring: { page?: string; limit?: string; status?: string } }>,
    reply: FastifyReply
  ) {
    const page = parseInt(request.query.page || '1', 10);
    const limit = parseInt(request.query.limit || '20', 10);
    const status = request.query.status;

    let filtered = mockUserInvoices;
    if (status) {
      filtered = mockUserInvoices.filter(i => i.status === status);
    }

    return reply.send({
      data: filtered,
      meta: {
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  }

  /**
   * GET /api/me/invoices/:id
   * Get single invoice
   */
  @Get('/:id')
  async getInvoice(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const invoice = mockUserInvoices.find(i => i.id === request.params.id);
    
    if (!invoice) {
      return reply.code(404).send({
        type: 'https://api.digilist.no/problems/not-found',
        title: 'Invoice Not Found',
        status: 404,
        detail: `Invoice with ID ${request.params.id} not found`,
      });
    }

    return reply.send({ data: invoice });
  }

  /**
   * GET /api/me/invoices/:id/download
   * Download invoice PDF
   */
  @Get('/:id/download')
  async downloadInvoice(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const invoice = mockUserInvoices.find(i => i.id === request.params.id);
    
    if (!invoice) {
      return reply.code(404).send({
        type: 'https://api.digilist.no/problems/not-found',
        title: 'Invoice Not Found',
        status: 404,
      });
    }

    // In production: Generate and return PDF
    // For now: Return mock PDF placeholder
    const pdfContent = Buffer.from(`Mock PDF for invoice ${invoice.invoiceNumber}`);
    
    return reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`)
      .send(pdfContent);
  }

  /**
   * GET /api/me/invoices/:id/download-url
   * Get temporary signed URL for invoice download
   */
  @Get('/:id/download-url')
  async getDownloadUrl(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const invoice = mockUserInvoices.find(i => i.id === request.params.id);
    
    if (!invoice) {
      return reply.code(404).send({
        type: 'https://api.digilist.no/problems/not-found',
        title: 'Invoice Not Found',
        status: 404,
      });
    }

    // In production: Generate signed URL from storage service
    return reply.send({
      data: {
        url: `https://storage.digilist.no/invoices/${invoice.id}/download?token=mock-token`,
        expiresAt: new Date(Date.now() + 300000).toISOString(), // 5 minutes
      },
    });
  }
}

@Controller('/api/orgs/:orgId/billing')
export class OrgBillingController {
  /**
   * GET /api/orgs/:orgId/billing/summary
   * Get organization billing summary
   */
  @Get('/summary')
  async getSummary(
    request: FastifyRequest<{ Params: { orgId: string }; Querystring: { period?: string } }>,
    reply: FastifyReply
  ) {
    const { orgId } = request.params;
    
    const summary: BillingSummary = {
      totalPaid: mockOrgInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
      totalOutstanding: mockOrgInvoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0),
      currency: 'NOK',
      periodStart: '2026-01-01',
      periodEnd: '2026-12-31',
    };

    return reply.send({ data: summary });
  }
}

@Controller('/api/orgs/:orgId/invoices')
export class OrgInvoicesController {
  /**
   * GET /api/orgs/:orgId/invoices
   * List organization invoices
   */
  @Get()
  async listInvoices(
    request: FastifyRequest<{ Params: { orgId: string }; Querystring: { page?: string; limit?: string; status?: string } }>,
    reply: FastifyReply
  ) {
    const page = parseInt(request.query.page || '1', 10);
    const limit = parseInt(request.query.limit || '20', 10);

    return reply.send({
      data: mockOrgInvoices,
      meta: {
        total: mockOrgInvoices.length,
        page,
        limit,
        totalPages: Math.ceil(mockOrgInvoices.length / limit),
      },
    });
  }

  /**
   * GET /api/orgs/:orgId/invoices/:id
   * Get single organization invoice
   */
  @Get('/:id')
  async getInvoice(
    request: FastifyRequest<{ Params: { orgId: string; id: string } }>,
    reply: FastifyReply
  ) {
    const invoice = mockOrgInvoices.find(i => i.id === request.params.id);
    
    if (!invoice) {
      return reply.code(404).send({
        type: 'https://api.digilist.no/problems/not-found',
        title: 'Invoice Not Found',
        status: 404,
      });
    }

    return reply.send({ data: invoice });
  }

  /**
   * GET /api/orgs/:orgId/invoices/:id/download
   * Download organization invoice PDF
   */
  @Get('/:id/download')
  async downloadInvoice(
    request: FastifyRequest<{ Params: { orgId: string; id: string } }>,
    reply: FastifyReply
  ) {
    const invoice = mockOrgInvoices.find(i => i.id === request.params.id);
    
    if (!invoice) {
      return reply.code(404).send({
        type: 'https://api.digilist.no/problems/not-found',
        title: 'Invoice Not Found',
        status: 404,
      });
    }

    const pdfContent = Buffer.from(`Mock PDF for org invoice ${invoice.invoiceNumber}`);
    
    return reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`)
      .send(pdfContent);
  }
}

export default [UserBillingController, UserInvoicesController, OrgBillingController, OrgInvoicesController];
