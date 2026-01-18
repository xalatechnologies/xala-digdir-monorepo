/**
 * Scanner API Routes
 * Endpoints for running code quality scanners (i18n, Design System, WCAG)
 */

import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

interface ScannerResult {
  success: boolean;
  scanner: string;
  timestamp: string;
  duration: number;
  summary: {
    total: number;
    errors: number;
    warnings: number;
  };
  details?: string;
  error?: string;
}

const scannerRoutes: FastifyPluginAsync = async (fastify) => {
  const rootDir = path.resolve(process.cwd());

  /**
   * Run i18n Scanner
   * POST /api/scanners/i18n
   */
  fastify.post('/api/scanners/i18n', async (_request: FastifyRequest, _reply: FastifyReply): Promise<ScannerResult> => {
    const startTime = Date.now();
    
    try {
      const { stdout, stderr } = await execAsync(
        'node scripts/scan-i18n-comprehensive.js --all 2>&1 | tail -50',
        { cwd: rootDir, timeout: 60000 }
      );
      
      const output = stdout + stderr;
      
      // Parse results from output
      const errorsMatch = output.match(/Total Issues: (\d+)/);
      const warningsMatch = output.match(/Warnings: (\d+)/);
      const totalKeysMatch = output.match(/Loaded (\d+) translation keys/);
      
      const errors = errorsMatch ? parseInt(errorsMatch[1], 10) : 0;
      const warnings = warningsMatch ? parseInt(warningsMatch[1], 10) : 0;
      const totalKeys = totalKeysMatch ? parseInt(totalKeysMatch[1], 10) : 0;
      
      return {
        success: errors === 0,
        scanner: 'i18n',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        summary: {
          total: totalKeys,
          errors,
          warnings,
        },
        details: output.slice(-2000), // Last 2000 chars
      };
    } catch (error) {
      return {
        success: false,
        scanner: 'i18n',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        summary: { total: 0, errors: 1, warnings: 0 },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * Run Design System Scanner
   * POST /api/scanners/design-system
   */
  fastify.post('/api/scanners/design-system', async (_request: FastifyRequest, _reply: FastifyReply): Promise<ScannerResult> => {
    const startTime = Date.now();
    
    try {
      const { stdout, stderr } = await execAsync(
        'node packages/eslint-config/scanner.js --tokens 2>&1 | tail -50',
        { cwd: rootDir, timeout: 120000 }
      );
      
      const output = stdout + stderr;
      
      // Parse violations from output
      const violationsMatch = output.match(/(\d+) problems?/);
      const errorsMatch = output.match(/(\d+) errors?/);
      const warningsMatch = output.match(/(\d+) warnings?/);
      
      const violations = violationsMatch ? parseInt(violationsMatch[1], 10) : 0;
      const errors = errorsMatch ? parseInt(errorsMatch[1], 10) : violations;
      const warnings = warningsMatch ? parseInt(warningsMatch[1], 10) : 0;
      
      return {
        success: errors === 0,
        scanner: 'design-system',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        summary: {
          total: 0,
          errors,
          warnings,
        },
        details: output.slice(-2000),
      };
    } catch (error) {
      return {
        success: false,
        scanner: 'design-system',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        summary: { total: 0, errors: 1, warnings: 0 },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * Run WCAG/Compliance Scanner
   * POST /api/scanners/wcag
   */
  fastify.post('/api/scanners/wcag', async (_request: FastifyRequest, _reply: FastifyReply): Promise<ScannerResult> => {
    const startTime = Date.now();
    
    try {
      const { stdout, stderr } = await execAsync(
        'node packages/eslint-config/scanner.js --a11y 2>&1 | tail -50',
        { cwd: rootDir, timeout: 120000 }
      );
      
      const output = stdout + stderr;
      
      // Parse accessibility issues from output
      const errorsMatch = output.match(/(\d+) errors?/);
      const warningsMatch = output.match(/(\d+) warnings?/);
      
      const errors = errorsMatch ? parseInt(errorsMatch[1], 10) : 0;
      const warnings = warningsMatch ? parseInt(warningsMatch[1], 10) : 0;
      
      return {
        success: errors === 0,
        scanner: 'wcag',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        summary: {
          total: 0,
          errors,
          warnings,
        },
        details: output.slice(-2000),
      };
    } catch (error) {
      return {
        success: false,
        scanner: 'wcag',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        summary: { total: 0, errors: 1, warnings: 0 },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * Get scanner status
   * GET /api/scanners/status
   */
  fastify.get('/api/scanners/status', async () => {
    return {
      i18n: { lastRun: new Date().toISOString(), status: 'idle' },
      designSystem: { lastRun: new Date().toISOString(), status: 'idle' },
      wcag: { lastRun: new Date().toISOString(), status: 'idle' },
    };
  });
};

export default scannerRoutes;
