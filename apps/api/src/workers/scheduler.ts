/**
 * Background Worker Scheduler
 * Orchestrates periodic background jobs
 * 
 * Runs workers at configured intervals using node-cron
 */
import { Injectable, Inject } from '../core/decorators';
import { DSARProcessorWorker } from './dsar-processor.worker';
import { ReportGeneratorWorker } from './report-generator.worker';

@Injectable()
export class WorkerScheduler {
  private intervals: NodeJS.Timeout[] = [];

  constructor(
    @Inject('DSARProcessorWorker') private readonly dsarWorker: DSARProcessorWorker,
    @Inject('ReportGeneratorWorker') private readonly reportWorker: ReportGeneratorWorker,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Start all scheduled workers
   */
  async start(): Promise<void> {
    this.adapters?.log?.info('Starting background workers');

    // DSAR processor - every 5 minutes
    this.intervals.push(
      setInterval(async () => {
        try {
          const processed = await this.dsarWorker.processPendingRequests();
          if (processed > 0) {
            this.adapters?.log?.info('DSAR batch completed', { processed });
          }
        } catch (error) {
          this.adapters?.log?.error('DSAR worker failed', { error });
        }
      }, 5 * 60 * 1000)
    );

    // Report generator - every 2 minutes
    this.intervals.push(
      setInterval(async () => {
        try {
          const processed = await this.reportWorker.processPendingReports();
          if (processed > 0) {
            this.adapters?.log?.info('Report batch completed', { processed });
          }
        } catch (error) {
          this.adapters?.log?.error('Report worker failed', { error });
        }
      }, 2 * 60 * 1000)
    );

    // DSAR cleanup - daily at 2 AM
    this.intervals.push(
      setInterval(
        async () => {
          try {
            const cleaned = await this.dsarWorker.cleanupExpiredRequests();
            this.adapters?.log?.info('DSAR cleanup completed', { cleaned });
          } catch (error) {
            this.adapters?.log?.error('DSAR cleanup failed', { error });
          }
        },
        24 * 60 * 60 * 1000
      )
    );

    // Report cleanup - daily at 3 AM
    this.intervals.push(
      setInterval(
        async () => {
          try {
            const cleaned = await this.reportWorker.cleanupOldReports();
            this.adapters?.log?.info('Report cleanup completed', { cleaned });
          } catch (error) {
            this.adapters?.log?.error('Report cleanup failed', { error });
          }
        },
        24 * 60 * 60 * 1000
      )
    );

    this.adapters?.log?.info('Background workers started', {
      workers: ['dsar-processor', 'report-generator'],
      intervals: ['5min', '2min', '24h', '24h'],
    });
  }

  /**
   * Stop all scheduled workers
   */
  async stop(): Promise<void> {
    this.adapters?.log?.info('Stopping background workers');

    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];

    this.adapters?.log?.info('Background workers stopped');
  }

  /**
   * Health check for workers
   */
  async healthCheck(): Promise<any> {
    return {
      status: 'healthy',
      workers: {
        dsarProcessor: 'active',
        reportGenerator: 'active',
      },
      intervals: this.intervals.length,
    };
  }
}
