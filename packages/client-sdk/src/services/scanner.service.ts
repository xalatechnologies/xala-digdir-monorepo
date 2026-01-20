/**
 * Scanner Service
 * Handles code quality and compliance scanners
 * Used by saas-admin Monitoring page
 */

import { BaseService } from './base.service';
import type { SingleResponse } from '@/types';

// ============================================================================
// Types
// ============================================================================

export type ScannerType = 'i18n' | 'design-system' | 'wcag';

export interface ScannerResult {
  success: boolean;
  timestamp: string;
  scanner: ScannerType;
  summary: {
    total: number;
    errors: number;
    warnings: number;
  };
  details?: {
    files?: number;
    rules?: number;
    fixable?: number;
    issues?: Array<{
      file: string;
      line?: number;
      column?: number;
      rule: string;
      message: string;
      severity: 'error' | 'warning' | 'info';
    }>;
  };
}

export interface ScannerStatus {
  lastRun?: string;
  isRunning: boolean;
  lastResult?: ScannerResult;
}

// ============================================================================
// Service
// ============================================================================

class ScannerService extends BaseService {
  constructor() {
    super('/api/scanners');
  }

  /**
   * Run a scanner
   */
  async run(scanner: ScannerType): Promise<SingleResponse<ScannerResult>> {
    return this.client.post<SingleResponse<ScannerResult>>(this.buildPath(`/${scanner}`), {});
  }

  /**
   * Run i18n scanner
   */
  async runI18n(): Promise<SingleResponse<ScannerResult>> {
    return this.run('i18n');
  }

  /**
   * Run design system scanner
   */
  async runDesignSystem(): Promise<SingleResponse<ScannerResult>> {
    return this.run('design-system');
  }

  /**
   * Run WCAG accessibility scanner
   */
  async runWcag(): Promise<SingleResponse<ScannerResult>> {
    return this.run('wcag');
  }

  /**
   * Get scanner status
   */
  async getStatus(scanner: ScannerType): Promise<SingleResponse<ScannerStatus>> {
    return this.client.get<SingleResponse<ScannerStatus>>(this.buildPath(`/${scanner}/status`));
  }

  /**
   * Get last result for a scanner
   */
  async getLastResult(scanner: ScannerType): Promise<SingleResponse<ScannerResult>> {
    return this.client.get<SingleResponse<ScannerResult>>(this.buildPath(`/${scanner}/last-result`));
  }

  /**
   * Get all scanner statuses
   */
  async getAllStatuses(): Promise<SingleResponse<Record<ScannerType, ScannerStatus>>> {
    return this.client.get<SingleResponse<Record<ScannerType, ScannerStatus>>>(this.buildPath('/status'));
  }
}

export const scannerService = new ScannerService();
