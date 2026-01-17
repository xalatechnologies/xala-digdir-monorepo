import cron from 'node-cron';
import nodemailer from 'nodemailer';
import { db } from '../../database/connection';
import { scheduledReports, reportSchedules } from '../../database/schema';
import { eq, and, lte } from 'drizzle-orm';

/**
 * Report Scheduling Service
 * 
 * Automated report generation and delivery
 * Features:
 * - Cron-based scheduling
 * - Email delivery
 * - PDF generation
 * - Multiple report types
 */

interface ScheduledReport {
  id: string;
  name: string;
  type: 'BOOKING_SUMMARY' | 'REVENUE' | 'OCCUPANCY' | 'USER_ACTIVITY' | 'CUSTOM';
  schedule: string; // Cron expression
  recipients: string[];
  format: 'PDF' | 'CSV' | 'EXCEL';
  filters?: any;
  tenantId: string;
  isActive: boolean;
}

interface ReportData {
  title: string;
  generatedAt: Date;
  data: any;
  summary?: {
    totalRecords: number;
    dateRange?: { start: Date; end: Date };
  };
}

export class ReportSchedulingService {
  private scheduledJobs = new Map<string, cron.ScheduledTask>();
  private emailTransporter: nodemailer.Transporter;

  constructor() {
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Initialize all active scheduled reports
   */
  async initialize() {
    console.log('📊 Initializing report scheduler...');

    const activeSchedules = await db
      .select()
      .from(reportSchedules)
      .where(eq(reportSchedules.isActive, true));

    for (const schedule of activeSchedules) {
      this.scheduleReport(schedule as any);
    }

    console.log(`✅ Initialized ${activeSchedules.length} scheduled reports`);
  }

  /**
   * Schedule a report
   */
  scheduleReport(report: ScheduledReport) {
    // Validate cron expression
    if (!cron.validate(report.schedule)) {
      console.error(`❌ Invalid cron expression: ${report.schedule}`);
      return;
    }

    // Cancel existing job if any
    if (this.scheduledJobs.has(report.id)) {
      this.scheduledJobs.get(report.id)?.stop();
    }

    // Schedule new job
    const task = cron.schedule(report.schedule, async () => {
      await this.generateAndSendReport(report);
    });

    this.scheduledJobs.set(report.id, task);
    console.log(`📅 Scheduled report: ${report.name} (${report.schedule})`);
  }

  /**
   * Unschedule a report
   */
  unscheduleReport(reportId: string) {
    const task = this.scheduledJobs.get(reportId);
    if (task) {
      task.stop();
      this.scheduledJobs.delete(reportId);
      console.log(`🛑 Unscheduled report: ${reportId}`);
    }
  }

  /**
   * Generate and send report
   */
  private async generateAndSendReport(report: ScheduledReport) {
    try {
      console.log(`📊 Generating report: ${report.name}`);

      // Generate report data
      const reportData = await this.generateReportData(report);

      // Generate file
      const file = await this.generateReportFile(reportData, report.format);

      // Send email
      await this.sendReportEmail(report, file);

      // Record execution
      await this.recordExecution(report.id, 'SUCCESS');

      console.log(`✅ Report sent: ${report.name}`);
    } catch (error) {
      console.error(`❌ Report generation failed: ${report.name}`, error);
      await this.recordExecution(report.id, 'FAILED', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Generate report data based on type
   */
  private async generateReportData(report: ScheduledReport): Promise<ReportData> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (report.type) {
      case 'BOOKING_SUMMARY':
        return this.generateBookingSummary(report.tenantId, startOfMonth, now);
      
      case 'REVENUE':
        return this.generateRevenueReport(report.tenantId, startOfMonth, now);
      
      case 'OCCUPANCY':
        return this.generateOccupancyReport(report.tenantId, startOfMonth, now);
      
      case 'USER_ACTIVITY':
        return this.generateUserActivityReport(report.tenantId, startOfMonth, now);
      
      default:
        throw new Error(`Unsupported report type: ${report.type}`);
    }
  }

  /**
   * Generate booking summary report
   */
  private async generateBookingSummary(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ReportData> {
    // TODO: Implement with actual booking queries
    const data = {
      totalBookings: 150,
      confirmedBookings: 120,
      pendingBookings: 20,
      cancelledBookings: 10,
      revenue: 45000,
      topRentalObjects: [],
    };

    return {
      title: 'Booking Summary Report',
      generatedAt: new Date(),
      data,
      summary: {
        totalRecords: data.totalBookings,
        dateRange: { start: startDate, end: endDate },
      },
    };
  }

  /**
   * Generate revenue report
   */
  private async generateRevenueReport(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ReportData> {
    // TODO: Implement with actual revenue queries
    const data = {
      totalRevenue: 45000,
      bookingRevenue: 40000,
      additionalServices: 5000,
      byCategory: [],
      byMonth: [],
    };

    return {
      title: 'Revenue Report',
      generatedAt: new Date(),
      data,
      summary: {
        totalRecords: 1,
        dateRange: { start: startDate, end: endDate },
      },
    };
  }

  /**
   * Generate occupancy report
   */
  private async generateOccupancyReport(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ReportData> {
    // TODO: Implement with actual occupancy calculations
    const data = {
      averageOccupancy: 75,
      peakOccupancy: 95,
      lowOccupancy: 45,
      byRentalObject: [],
      byDay: [],
    };

    return {
      title: 'Occupancy Report',
      generatedAt: new Date(),
      data,
      summary: {
        totalRecords: 1,
        dateRange: { start: startDate, end: endDate },
      },
    };
  }

  /**
   * Generate user activity report
   */
  private async generateUserActivityReport(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ReportData> {
    // TODO: Implement with actual activity queries
    const data = {
      totalUsers: 500,
      activeUsers: 350,
      newUsers: 45,
      topUsers: [],
      activityByType: [],
    };

    return {
      title: 'User Activity Report',
      generatedAt: new Date(),
      data,
      summary: {
        totalRecords: data.totalUsers,
        dateRange: { start: startDate, end: endDate },
      },
    };
  }

  /**
   * Generate report file (PDF/CSV/Excel)
   */
  private async generateReportFile(
    reportData: ReportData,
    format: 'PDF' | 'CSV' | 'EXCEL'
  ): Promise<Buffer> {
    // TODO: Implement actual file generation with libraries
    // For now, return simple JSON as CSV
    const content = JSON.stringify(reportData, null, 2);
    return Buffer.from(content);
  }

  /**
   * Send report via email
   */
  private async sendReportEmail(report: ScheduledReport, file: Buffer) {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'reports@digilist.no',
      to: report.recipients.join(', '),
      subject: `${report.name} - ${new Date().toLocaleDateString('nb-NO')}`,
      html: `
        <h2>${report.name}</h2>
        <p>Din planlagte rapport er klar.</p>
        <p><strong>Rapport type:</strong> ${report.type}</p>
        <p><strong>Format:</strong> ${report.format}</p>
        <p><strong>Generert:</strong> ${new Date().toLocaleString('nb-NO')}</p>
        <p>Se vedlegg for detaljer.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Dette er en automatisk generert rapport fra Digilist.
        </p>
      `,
      attachments: [
        {
          filename: `${report.name.replace(/\s+/g, '_')}_${Date.now()}.${format.toLowerCase()}`,
          content: file,
        },
      ],
    };

    await this.emailTransporter.sendMail(mailOptions);
  }

  /**
   * Record report execution
   */
  private async recordExecution(
    reportId: string,
    status: 'SUCCESS' | 'FAILED',
    error?: string
  ) {
    try {
      await db.insert(scheduledReports).values({
        reportScheduleId: reportId,
        status,
        error,
        generatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to record execution:', err);
    }
  }

  /**
   * Get execution history
   */
  async getExecutionHistory(reportId: string, limit = 10) {
    return db
      .select()
      .from(scheduledReports)
      .where(eq(scheduledReports.reportScheduleId, reportId))
      .limit(limit)
      .orderBy(scheduledReports.generatedAt);
  }

  /**
   * Test report generation (manual trigger)
   */
  async testReport(reportId: string) {
    const schedule = await db
      .select()
      .from(reportSchedules)
      .where(eq(reportSchedules.id, reportId))
      .limit(1);

    if (schedule.length === 0) {
      throw new Error('Report schedule not found');
    }

    await this.generateAndSendReport(schedule[0] as any);
  }
}

// Singleton instance
export const reportSchedulingService = new ReportSchedulingService();
