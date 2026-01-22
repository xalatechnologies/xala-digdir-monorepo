/**
 * Report Scheduling Service
 *
 * Automated report generation and delivery
 * Features:
 * - Cron-based scheduling
 * - Email delivery
 * - PDF generation
 * - Multiple report types
 *
 * TODO: Install dependencies when implementing:
 * - pnpm add node-cron nodemailer
 * - pnpm add -D @types/node-cron @types/nodemailer
 * TODO: Define reportSchedules and scheduledReports tables in @digilist/database-schema
 */

// Stub types for node-cron until installed
interface ScheduledTask {
  stop(): void;
}
interface CronModule {
  validate(expression: string): boolean;
  schedule(expression: string, fn: () => void | Promise<void>): ScheduledTask;
}

// Stub types for nodemailer until installed
interface Transporter {
  sendMail(options: {
    from: string;
    to: string;
    subject: string;
    html: string;
    attachments?: Array<{ filename: string; content: Buffer }>;
  }): Promise<void>;
}

interface ScheduledReport {
  id: string;
  name: string;
  type: 'BOOKING_SUMMARY' | 'REVENUE' | 'OCCUPANCY' | 'USER_ACTIVITY' | 'CUSTOM';
  schedule: string; // Cron expression
  recipients: string[];
  format: 'PDF' | 'CSV' | 'EXCEL';
  filters?: unknown;
  tenantId: string;
  isActive: boolean;
}

interface ReportData {
  title: string;
  generatedAt: Date;
  data: unknown;
  summary?: {
    totalRecords: number;
    dateRange?: { start: Date; end: Date };
  };
}

export class ReportSchedulingService {
  private scheduledJobs = new Map<string, ScheduledTask>();
  private emailTransporter: Transporter | null = null;
  private cron: CronModule | null = null;

  constructor() {
    // Try to load optional dependencies
    this.loadDependencies();
  }

  private async loadDependencies(): Promise<void> {
    try {
      // Dynamic imports for optional dependencies using require to avoid TS module resolution errors
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nodeCron = await Promise.resolve().then(() => {
        try { return require('node-cron'); } catch { return null; }
      });
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nodemailer = await Promise.resolve().then(() => {
        try { return require('nodemailer'); } catch { return null; }
      });

      if (nodeCron) {
        this.cron = nodeCron.default || nodeCron;
      }

      if (nodemailer) {
        const createTransport = (nodemailer.default || nodemailer).createTransport;
        this.emailTransporter = createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });
      }
    } catch {
      console.warn('Report scheduling dependencies not available');
    }
  }

  /**
   * Initialize all active scheduled reports
   * TODO: Implement when reportSchedules table is defined in @digilist/database-schema
   */
  async initialize(): Promise<void> {
    console.log('📊 Initializing report scheduler...');

    if (!this.cron) {
      console.warn('⚠️ node-cron not available, report scheduling disabled');
      return;
    }

    // Stub implementation - no database table yet
    const activeSchedules: ScheduledReport[] = [];

    for (const schedule of activeSchedules) {
      this.scheduleReport(schedule);
    }

    console.log(`✅ Initialized ${activeSchedules.length} scheduled reports`);
  }

  /**
   * Schedule a report
   */
  scheduleReport(report: ScheduledReport): void {
    if (!this.cron) {
      console.error('❌ node-cron not available');
      return;
    }

    // Validate cron expression
    if (!this.cron.validate(report.schedule)) {
      console.error(`❌ Invalid cron expression: ${report.schedule}`);
      return;
    }

    // Cancel existing job if any
    if (this.scheduledJobs.has(report.id)) {
      this.scheduledJobs.get(report.id)?.stop();
    }

    // Schedule new job
    const task = this.cron.schedule(report.schedule, async () => {
      await this.generateAndSendReport(report);
    });

    this.scheduledJobs.set(report.id, task);
    console.log(`📅 Scheduled report: ${report.name} (${report.schedule})`);
  }

  /**
   * Unschedule a report
   */
  unscheduleReport(reportId: string): void {
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
  private async generateAndSendReport(report: ScheduledReport): Promise<void> {
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
    _tenantId: string,
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
    _tenantId: string,
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
    _tenantId: string,
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
    _tenantId: string,
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
    _format: 'PDF' | 'CSV' | 'EXCEL'
  ): Promise<Buffer> {
    // TODO: Implement actual file generation with libraries
    // For now, return simple JSON as CSV
    const content = JSON.stringify(reportData, null, 2);
    return Buffer.from(content);
  }

  /**
   * Send report via email
   */
  private async sendReportEmail(report: ScheduledReport, file: Buffer): Promise<void> {
    if (!this.emailTransporter) {
      console.warn('⚠️ Email transporter not available, skipping email');
      return;
    }

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
          filename: `${report.name.replace(/\s+/g, '_')}_${Date.now()}.${report.format.toLowerCase()}`,
          content: file,
        },
      ],
    };

    await this.emailTransporter.sendMail(mailOptions);
  }

  /**
   * Record report execution
   * TODO: Implement when scheduledReports table is defined in @digilist/database-schema
   */
  private async recordExecution(
    reportId: string,
    status: 'SUCCESS' | 'FAILED',
    error?: string
  ): Promise<void> {
    // Stub implementation - just log
    console.log(`📝 Recording execution: ${reportId} - ${status}${error ? ` (${error})` : ''}`);
  }

  /**
   * Get execution history
   * TODO: Implement when scheduledReports table is defined in @digilist/database-schema
   */
  async getExecutionHistory(_reportId: string, _limit = 10): Promise<unknown[]> {
    // Stub implementation - return empty array
    return [];
  }

  /**
   * Test report generation (manual trigger)
   * TODO: Implement when reportSchedules table is defined in @digilist/database-schema
   */
  async testReport(_reportId: string): Promise<void> {
    throw new Error('Report schedules not yet implemented - table not defined in schema');
  }
}

// Singleton instance
export const reportSchedulingService = new ReportSchedulingService();
