/**
 * Domain Policy Engine
 * 
 * Centralized policy evaluation engine for domain modules.
 * Responsible for applying policy rules to domain operations.
 * 
 * @module domain/policy-engine
 * @since 1.0.0
 */

import type { PolicyServiceInterface, PolicyProjection } from './adapters/booking.adapter';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Policy evaluation result
 */
export interface PolicyEvaluationResult {
  /** Whether the operation is allowed */
  allowed: boolean;
  /** Reason if not allowed */
  reason?: string;
  /** Warnings that don't block the operation */
  warnings: string[];
  /** Applied rules */
  appliedRules: string[];
  /** Policy version used */
  policyVersion?: string;
}

/**
 * Policy evaluation context
 */
export interface PolicyEvaluationContext {
  tenantId: string;
  userId?: string;
  organizationId?: string;
  rentalObjectId?: string;
  operationType: 'booking' | 'pricing' | 'approval' | 'availability';
}

/**
 * Feature flag for gradual policy rollout
 */
export interface PolicyRolloutConfig {
  /** Policy type */
  policyType: string;
  /** Percentage of requests to use policy engine (0-100) */
  rolloutPercentage: number;
  /** Tenant IDs to always include in rollout */
  includeTenants: string[];
  /** Tenant IDs to always exclude from rollout */
  excludeTenants: string[];
}

// =============================================================================
// POLICY ENGINE
// =============================================================================

/**
 * DomainPolicyEngine
 * Evaluates domain policies and provides gradual rollout support
 */
export class DomainPolicyEngine {
  private policyService: PolicyServiceInterface;
  private rolloutConfigs: Map<string, PolicyRolloutConfig> = new Map();
  private logger: PolicyEngineLogger;

  constructor(policyService: PolicyServiceInterface) {
    this.policyService = policyService;
    this.logger = new PolicyEngineLogger();
    this.initDefaultRolloutConfigs();
  }

  /**
   * Initialize default rollout configurations
   * All policies start at 0% rollout (disabled)
   */
  private initDefaultRolloutConfigs(): void {
    const defaultConfig: Omit<PolicyRolloutConfig, 'policyType'> = {
      rolloutPercentage: 0,
      includeTenants: [],
      excludeTenants: [],
    };

    this.rolloutConfigs.set('booking', { policyType: 'booking', ...defaultConfig });
    this.rolloutConfigs.set('pricing', { policyType: 'pricing', ...defaultConfig });
    this.rolloutConfigs.set('approval', { policyType: 'approval', ...defaultConfig });
    this.rolloutConfigs.set('availability', { policyType: 'availability', ...defaultConfig });
  }

  /**
   * Check if policy should be used for this request
   */
  shouldUsePolicy(policyType: string, tenantId: string): boolean {
    const config = this.rolloutConfigs.get(policyType);
    if (!config) return false;

    // Always exclude certain tenants
    if (config.excludeTenants.includes(tenantId)) {
      return false;
    }

    // Always include certain tenants
    if (config.includeTenants.includes(tenantId)) {
      return true;
    }

    // Rollout percentage (deterministic based on tenant ID hash)
    if (config.rolloutPercentage === 0) return false;
    if (config.rolloutPercentage === 100) return true;

    const hash = this.hashTenantId(tenantId);
    return (hash % 100) < config.rolloutPercentage;
  }

  /**
   * Update rollout configuration
   */
  updateRolloutConfig(policyType: string, config: Partial<PolicyRolloutConfig>): void {
    const existing = this.rolloutConfigs.get(policyType) || {
      policyType,
      rolloutPercentage: 0,
      includeTenants: [],
      excludeTenants: [],
    };
    
    this.rolloutConfigs.set(policyType, { ...existing, ...config });
    this.logger.info(`Updated rollout config for ${policyType}`, config);
  }

  /**
   * Get current rollout configuration
   */
  getRolloutConfig(policyType: string): PolicyRolloutConfig | undefined {
    return this.rolloutConfigs.get(policyType);
  }

  /**
   * Get all rollout configurations
   */
  getAllRolloutConfigs(): PolicyRolloutConfig[] {
    return Array.from(this.rolloutConfigs.values());
  }

  /**
   * Evaluate booking policy
   */
  async evaluateBookingPolicy(
    context: PolicyEvaluationContext,
    input: Record<string, unknown>
  ): Promise<PolicyEvaluationResult> {
    const usePolicy = this.shouldUsePolicy('booking', context.tenantId);
    
    if (!usePolicy) {
      return this.createSkippedResult('Policy rollout not active');
    }

    try {
      const projection = await this.policyService.getProjection(
        context.tenantId,
        context.rentalObjectId
      );

      if (!projection?.booking) {
        return this.createSkippedResult('No booking policy found');
      }

      // Evaluate policy rules
      return this.evaluateBookingRules(projection.booking, input);
    } catch (error) {
      this.logger.error('Failed to evaluate booking policy', { error });
      return this.createSkippedResult('Policy evaluation failed');
    }
  }

  /**
   * Evaluate pricing policy
   */
  async evaluatePricingPolicy(
    context: PolicyEvaluationContext,
    input: Record<string, unknown>
  ): Promise<PolicyEvaluationResult> {
    const usePolicy = this.shouldUsePolicy('pricing', context.tenantId);
    
    if (!usePolicy) {
      return this.createSkippedResult('Policy rollout not active');
    }

    try {
      const projection = await this.policyService.getProjection(
        context.tenantId,
        context.rentalObjectId
      );

      if (!projection?.pricing) {
        return this.createSkippedResult('No pricing policy found');
      }

      return this.evaluatePricingRules(projection.pricing, input);
    } catch (error) {
      this.logger.error('Failed to evaluate pricing policy', { error });
      return this.createSkippedResult('Policy evaluation failed');
    }
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  private evaluateBookingRules(
    policy: Record<string, unknown>,
    input: Record<string, unknown>
  ): PolicyEvaluationResult {
    const warnings: string[] = [];
    const appliedRules: string[] = [];

    // Extract slot rules
    const slotRules = (policy.slotRules || {}) as Record<string, unknown>;
    
    if (slotRules.minDurationMinutes && input.durationMinutes) {
      const min = slotRules.minDurationMinutes as number;
      const duration = input.durationMinutes as number;
      
      appliedRules.push('minDuration');
      
      if (duration < min) {
        return {
          allowed: false,
          reason: `Booking duration must be at least ${min} minutes`,
          warnings,
          appliedRules,
        };
      }
    }

    return {
      allowed: true,
      warnings,
      appliedRules,
    };
  }

  private evaluatePricingRules(
    policy: Record<string, unknown>,
    input: Record<string, unknown>
  ): PolicyEvaluationResult {
    const warnings: string[] = [];
    const appliedRules: string[] = [];

    // Pricing policies don't typically block operations, just adjust prices
    appliedRules.push('basePricing');

    return {
      allowed: true,
      warnings,
      appliedRules,
    };
  }

  private createSkippedResult(reason: string): PolicyEvaluationResult {
    return {
      allowed: true,
      warnings: [reason],
      appliedRules: [],
    };
  }

  private hashTenantId(tenantId: string): number {
    let hash = 0;
    for (let i = 0; i < tenantId.length; i++) {
      const char = tenantId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// =============================================================================
// LOGGER
// =============================================================================

class PolicyEngineLogger {
  info(message: string, meta?: Record<string, unknown>): void {
    console.info(`[PolicyEngine] ${message}`, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(`[PolicyEngine] ${message}`, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    console.error(`[PolicyEngine] ${message}`, meta);
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let policyEngine: DomainPolicyEngine | null = null;

/**
 * Get the policy engine instance
 */
export function getDomainPolicyEngine(policyService?: PolicyServiceInterface): DomainPolicyEngine {
  if (!policyEngine && policyService) {
    policyEngine = new DomainPolicyEngine(policyService);
  }
  if (!policyEngine) {
    throw new Error('Policy engine not initialized. Call with policyService first.');
  }
  return policyEngine;
}

/**
 * Reset the policy engine (for testing)
 */
export function resetDomainPolicyEngine(): void {
  policyEngine = null;
}
