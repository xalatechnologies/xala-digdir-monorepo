/**
 * Domain Adapter Base
 * 
 * Base adapter infrastructure for wrapping domain services with
 * policy-aware behavior while maintaining backward compatibility.
 * 
 * @module domain/adapters/base
 * @since 1.0.0
 */

// Domain Group constants (mirrors @xala/contracts/modules)
// Defined locally to avoid cross-package build dependency
export const DomainGroup = {
  CORE: 'CORE',
  BOOKING_RENTALS: 'BOOKING_RENTALS',
  COMMUNICATION: 'COMMUNICATION',
  ECONOMY: 'ECONOMY',
  EXPERIENCE: 'EXPERIENCE',
  INTEGRATIONS: 'INTEGRATIONS',
  COMPLIANCE: 'COMPLIANCE',
} as const;

export type DomainGroupType = (typeof DomainGroup)[keyof typeof DomainGroup];

// =============================================================================
// ADAPTER CONFIGURATION
// =============================================================================

/**
 * Configuration for adapter behavior
 */
export interface AdapterConfig {
  /**
   * Use policy-driven logic when available
   * Default: false (during rollout)
   */
  usePolicyEngine: boolean;

  /**
   * Strict mode: fail if policy is missing
   * Default: false (always fallback to legacy)
   */
  strictPolicyMode: boolean;

  /**
   * Log level for adapter operations
   */
  logLevel: 'debug' | 'info' | 'warn' | 'error';

  /**
   * Dry-run: compute policy result but don't use it
   * Useful for comparing policy vs legacy outcomes
   */
  dryRun: boolean;

  /**
   * Emit metrics for policy vs legacy comparison
   */
  emitMetrics: boolean;
}

/**
 * Default adapter configuration (safe defaults)
 */
export const DEFAULT_ADAPTER_CONFIG: AdapterConfig = {
  usePolicyEngine: false,
  strictPolicyMode: false,
  logLevel: 'info',
  dryRun: true, // During rollout, compare but don't use
  emitMetrics: true,
};

// =============================================================================
// ADAPTER CONTEXT
// =============================================================================

/**
 * Context passed to adapter methods
 */
export interface AdapterContext {
  tenantId: string;
  userId?: string;
  organizationId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

/**
 * Result of adapter operation
 */
export interface AdapterResult<T> {
  /** The result data */
  data: T;
  /** Source of the result */
  source: 'policy' | 'legacy' | 'fallback';
  /** Execution time in ms */
  executionTimeMs: number;
  /** Policy that was applied (if any) */
  policyId?: string;
  /** Warnings during execution */
  warnings?: string[];
}

// =============================================================================
// BASE ADAPTER
// =============================================================================

/**
 * BaseDomainAdapter
 * Abstract base class for domain adapters
 */
export abstract class BaseDomainAdapter<TLegacyService> {
  protected config: AdapterConfig;
  protected legacyService: TLegacyService;
  protected domainGroup: DomainGroupType;
  protected logger: AdapterLogger;

  constructor(
    legacyService: TLegacyService,
    domainGroup: DomainGroupType,
    config: Partial<AdapterConfig> = {}
  ) {
    this.legacyService = legacyService;
    this.domainGroup = domainGroup;
    this.config = { ...DEFAULT_ADAPTER_CONFIG, ...config };
    this.logger = new AdapterLogger(this.constructor.name, this.config.logLevel);
  }

  /**
   * Check if the domain is enabled for this context
   */
  protected async isDomainEnabled(context: AdapterContext): Promise<boolean> {
    // In the current implementation, booking-rentals is always enabled
    // This will become dynamic when we fully integrate with the module service
    return true;
  }

  /**
   * Execute with fallback strategy
   */
  protected async executeWithFallback<T>(
    operationName: string,
    context: AdapterContext,
    policyExecutor: () => Promise<T>,
    legacyExecutor: () => Promise<T>
  ): Promise<AdapterResult<T>> {
    const startTime = Date.now();
    const warnings: string[] = [];

    // Check if domain is enabled
    const isDomainActive = await this.isDomainEnabled(context);
    if (!isDomainActive) {
      throw new DomainDisabledError(this.domainGroup, context.tenantId);
    }

    // If policy engine is disabled, go straight to legacy
    if (!this.config.usePolicyEngine) {
      const data = await legacyExecutor();
      return {
        data,
        source: 'legacy',
        executionTimeMs: Date.now() - startTime,
      };
    }

    // Try policy-driven execution
    let policyResult: T | null = null;
    let policyError: Error | null = null;

    try {
      policyResult = await policyExecutor();
    } catch (error) {
      policyError = error as Error;
      this.logger.warn(`Policy execution failed for ${operationName}`, { error: policyError.message });
      warnings.push(`Policy execution failed: ${policyError.message}`);
    }

    // If dry-run mode, still execute legacy and compare
    if (this.config.dryRun) {
      const legacyResult = await legacyExecutor();
      
      if (policyResult !== null && this.config.emitMetrics) {
        // Compare results (for metrics)
        this.emitComparisonMetric(operationName, policyResult, legacyResult);
      }

      return {
        data: legacyResult,
        source: 'legacy',
        executionTimeMs: Date.now() - startTime,
        warnings,
      };
    }

    // If policy succeeded, use it
    if (policyResult !== null) {
      return {
        data: policyResult,
        source: 'policy',
        executionTimeMs: Date.now() - startTime,
      };
    }

    // Fallback to legacy
    if (!this.config.strictPolicyMode) {
      const data = await legacyExecutor();
      return {
        data,
        source: 'fallback',
        executionTimeMs: Date.now() - startTime,
        warnings,
      };
    }

    // Strict mode: throw the policy error
    throw policyError || new Error(`Policy execution failed for ${operationName}`);
  }

  /**
   * Emit metric for policy vs legacy comparison
   */
  protected emitComparisonMetric<T>(operationName: string, policyResult: T, legacyResult: T): void {
    // In a real implementation, this would send to metrics system
    const areEqual = JSON.stringify(policyResult) === JSON.stringify(legacyResult);
    this.logger.debug(`Comparison for ${operationName}`, {
      areEqual,
      policyResult: typeof policyResult,
      legacyResult: typeof legacyResult,
    });
  }

  /**
   * Get the underlying legacy service
   */
  public getLegacyService(): TLegacyService {
    return this.legacyService;
  }

  /**
   * Update adapter configuration
   */
  public updateConfig(config: Partial<AdapterConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger = new AdapterLogger(this.constructor.name, this.config.logLevel);
  }
}

// =============================================================================
// ADAPTER LOGGER
// =============================================================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Simple adapter logger with level filtering
 */
export class AdapterLogger {
  private name: string;
  private level: LogLevel;

  constructor(name: string, level: LogLevel = 'info') {
    this.name = name;
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog('debug')) {
      console.debug(`[${this.name}] ${message}`, meta);
    }
  }

  info(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      console.info(`[${this.name}] ${message}`, meta);
    }
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog('warn')) {
      console.warn(`[${this.name}] ${message}`, meta);
    }
  }

  error(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog('error')) {
      console.error(`[${this.name}] ${message}`, meta);
    }
  }
}

// =============================================================================
// ERRORS
// =============================================================================

/**
 * Error thrown when a domain is disabled
 */
export class DomainDisabledError extends Error {
  public readonly type = 'DOMAIN_DISABLED';
  public readonly domainGroup: DomainGroupType;
  public readonly tenantId: string;

  constructor(domainGroup: DomainGroupType, tenantId: string) {
    super(`Domain '${domainGroup}' is not enabled for tenant '${tenantId}'`);
    this.name = 'DomainDisabledError';
    this.domainGroup = domainGroup;
    this.tenantId = tenantId;
  }
}

/**
 * Error thrown when policy execution fails in strict mode
 */
export class PolicyExecutionError extends Error {
  public readonly type = 'POLICY_EXECUTION_FAILED';
  public readonly policyType: string;
  public readonly originalError?: Error;

  constructor(policyType: string, originalError?: Error) {
    super(`Policy execution failed for '${policyType}': ${originalError?.message || 'Unknown error'}`);
    this.name = 'PolicyExecutionError';
    this.policyType = policyType;
    this.originalError = originalError;
  }
}
