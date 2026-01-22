/**
 * Report Generator Worker
 * Background worker for generating reports and exports
 * 
 * Supports multiple formats: PDF, XLSX, CSV, JSON
 * Reference: GAP-014 Reports & Exports
 */
import { Injectable, Inject } from '../core/decorators';
import { eq, and, gte, lte } from 'drizzle-orm';
import { reports, bookings, rentalObjects, organizations } from '../database/schema/index';

interface ReportParameters {
  dateFrom: string;
  dateTo: string;
  rentalObjectIds?: string[];
  organizationIds?: string[];
  groupBy?: 'DAY' | 'WEEK' | 'MONTH';
}

@Injectable()
export class ReportGeneratorWorker {
  constructor(
    @Inject('Database') private readonly db: any,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Process pending report generation requests
   * Should be run periodically (e.g., every 2 minutes)
   */
  async processPendingReports(): Promise<number> {
    const pendingReports = await this.db
      .select()
      .from(reports)
      .where(eq(reports.status, 'QUEUED'))
      .limit(5); // Process 5 at a time

    this.adapters?.log?.info('Processing reports', { count: pendingReports.length });

    for (const report of pendingReports) {
      await this.processReport(report);
    }

    return pendingReports.length;
  }

  /**
   * Process individual report
   */
  private async processReport(report: any): Promise<void> {
    try {
      // Update status to generating
      await this.db
        .update(reports)
        .set({ status: 'GENERATING' })
        .where(eq(reports.id, report.id));

      this.adapters?.log?.info('Generating report', {
        reportId: report.id,
        type: report.type,
        format: report.format,
      });

      // Generate report data based on type
      let reportData: any;
      switch (report.type) {
        case 'BOOKINGS':
          reportData = await this.generateBookingsReport(report.parameters);
          break;
        case 'REVENUE':
          reportData = await this.generateRevenueReport(report.parameters);
          break;
        case 'USAGE':
          reportData = await this.generateUsageReport(report.parameters);
          break;
        case 'AUDIT':
          reportData = await this.generateAuditReport(report.parameters);
          break;
        default:
          throw new Error(`Unknown report type: ${report.type}`);
      }

      // Format report based on requested format
      const formattedReport = await this.formatReport(reportData, report.format);
      const fileName = `report-${report.id}-${Date.now()}.${report.format.toLowerCase()}`;

      // Store report file (TODO: Upload to object storage)
      const downloadUrl = `/api/reports/${report.id}/download`;

      // Update report to ready
      await this.db
        .update(reports)
        .set({
          status: 'READY',
          completedAt: new Date(),
          metadata: {
            ...report.metadata,
            fileName,
            downloadUrl,
            fileSize: Buffer.byteLength(JSON.stringify(formattedReport), 'utf8'),
            recordCount: reportData.length,
          },
        })
        .where(eq(reports.id, report.id));

      this.adapters?.log?.info('Report generation completed', {
        reportId: report.id,
        recordCount: reportData.length,
      });
    } catch (error) {
      this.adapters?.log?.error('Report generation failed', {
        reportId: report.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Update report to failed
      await this.db
        .update(reports)
        .set({
          status: 'FAILED',
          metadata: {
            ...report.metadata,
            error: error instanceof Error ? error.message : 'Generation failed',
          },
        })
        .where(eq(reports.id, report.id));
    }
  }

  /**
   * Generate bookings report
   */
  private async generateBookingsReport(params: ReportParameters): Promise<any[]> {
    const conditions = [
      gte(bookings.startTime, new Date(params.dateFrom)),
      lte(bookings.endTime, new Date(params.dateTo)),
    ];

    if (params.rentalObjectIds && params.rentalObjectIds.length > 0) {
      // Filter by rental objects (requires custom query)
    }

    const bookingsData = await this.db
      .select()
      .from(bookings)
      .where(and(...conditions));

    return bookingsData.map((booking: any) => ({
      bookingId: booking.id,
      rentalObjectId: booking.rentalObjectId,
      userId: booking.userId,
      startDate: booking.startDate?.toISOString().split('T')[0],
      endDate: booking.endDate?.toISOString().split('T')[0],
      status: booking.status,
      totalCents: booking.totalCents,
      createdAt: booking.createdAt?.toISOString(),
    }));
  }

  /**
   * Generate revenue report
   */
  private async generateRevenueReport(params: ReportParameters): Promise<any[]> {
    const bookingsData = await this.generateBookingsReport(params);

    // Group by date based on groupBy parameter
    const grouped = this.groupByDate(bookingsData, params.groupBy || 'DAY');

    return Object.entries(grouped).map(([date, records]: [string, any[]]) => ({
      date,
      bookingCount: records.length,
      totalRevenueCents: records.reduce((sum, r) => sum + (r.totalCents || 0), 0),
      avgBookingCents: Math.round(
        records.reduce((sum, r) => sum + (r.totalCents || 0), 0) / records.length
      ),
    }));
  }

  /**
   * Generate usage report (rental object utilization)
   */
  private async generateUsageReport(params: ReportParameters): Promise<any[]> {
    const rentalObjectsData = await this.db
      .select()
      .from(rentalObjects);

    const bookingsData = await this.generateBookingsReport(params);

    return rentalObjectsData.map((obj: any) => {
      const objBookings = bookingsData.filter((b: any) => b.rentalObjectId === obj.id);
      const totalHours = objBookings.reduce((sum, b: any) => {
        const start = new Date(b.startDate);
        const end = new Date(b.endDate);
        return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0);

      return {
        rentalObjectId: obj.id,
        rentalObjectName: obj.name,
        bookingCount: objBookings.length,
        totalHours: Math.round(totalHours * 10) / 10,
        utilizationPercent: 0, // TODO: Calculate based on available hours
      };
    });
  }

  /**
   * Generate audit report
   */
  private async generateAuditReport(params: ReportParameters): Promise<any[]> {
    // TODO: Query audit log table
    return [];
  }

  /**
   * Group data by date period
   */
  private groupByDate(data: any[], groupBy: 'DAY' | 'WEEK' | 'MONTH'): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};

    data.forEach((record) => {
      const date = new Date(record.startDate);
      let key: string;

      switch (groupBy) {
        case 'DAY':
          key = date.toISOString().split('T')[0];
          break;
        case 'WEEK':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'MONTH':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(record);
    });

    return grouped;
  }

  /**
   * Format report data based on output format
   */
  private async formatReport(data: any[], format: 'PDF' | 'XLSX' | 'CSV' | 'JSON'): Promise<any> {
    switch (format) {
      case 'JSON':
        return data;
      case 'CSV':
        return this.formatAsCSV(data);
      case 'XLSX':
        // TODO: Implement XLSX formatting
        return data;
      case 'PDF':
        // TODO: Implement PDF formatting
        return data;
      default:
        return data;
    }
  }

  /**
   * Format data as CSV
   */
  private formatAsCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map((record) =>
      headers.map((h) => JSON.stringify(record[h] || '')).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Cleanup old reports
   * Should be run daily
   */
  async cleanupOldReports(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldReports = await this.db
      .select()
      .from(reports)
      .where(
        and(
          eq(reports.status, 'READY'),
          // completedAt is before 30 days ago
        )
      );

    let cleaned = 0;
    for (const report of oldReports) {
      if (new Date(report.completedAt) < thirtyDaysAgo) {
        // Delete report file (TODO: Remove from object storage)
        await this.db
          .delete(reports)
          .where(eq(reports.id, report.id));

        cleaned++;
        this.adapters?.log?.info('Old report cleaned up', { reportId: report.id });
      }
    }

    return cleaned;
  }
}
