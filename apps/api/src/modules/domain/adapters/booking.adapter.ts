/**
 * Booking Domain Adapter
 * 
 * Wraps the existing BookingService with policy-aware behavior.
 * Falls back to legacy logic when policies are unavailable.
 * 
 * @module domain/adapters/booking
 * @since 1.0.0
 */

import { BaseDomainAdapter, DomainGroup, type AdapterConfig, type AdapterContext, type AdapterResult } from './base.adapter';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Policy projection interface (mirrors policy.service.ts)
 */
export interface PolicyProjection {
  booking?: Record<string, unknown>;
  pricing?: Record<string, unknown>;
  approval?: Record<string, unknown>;
  availability?: Record<string, unknown>;
}

/**
 * Policy service interface
 */
export interface PolicyServiceInterface {
  getProjection(tenantId: string, rentalObjectId?: string): Promise<PolicyProjection | null>;
}

/**
 * Booking creation input (matches existing BookingService interface)
 */
export interface CreateBookingInput {
  rentalObjectId: string;
  startTime: Date | string;
  endTime: Date | string;
  purpose?: string;
  attendeesCount?: number;
  organizationId?: string;
  addons?: Array<{ addonId: string; quantity: number }>;
  notes?: string;
}

/**
 * Booking DTO (matches existing BookingService output)
 */
export interface BookingDTO {
  id: string;
  referenceNumber: string;
  rentalObjectId: string;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  currency: string;
  requiresApproval: boolean;
  createdAt: string;
}

/**
 * Minimal interface for legacy BookingService
 */
export interface LegacyBookingService {
  createBooking(input: CreateBookingInput, context: { tenantId: string; userId?: string }): Promise<BookingDTO>;
  getBookingById(id: string, context: { tenantId: string }): Promise<BookingDTO | null>;
  cancelBooking(id: string, reason: string, context: { tenantId: string; userId?: string }): Promise<BookingDTO>;
  requiresApproval(rentalObjectId: string, input: CreateBookingInput, context: { tenantId: string }): Promise<boolean>;
}

// =============================================================================
// ADAPTER
// =============================================================================

/**
 * BookingDomainAdapter
 * Wraps BookingService with policy-driven behavior
 */
export class BookingDomainAdapter extends BaseDomainAdapter<LegacyBookingService> {
  private policyService?: PolicyServiceInterface;

  constructor(
    legacyService: LegacyBookingService,
    config: Partial<AdapterConfig> = {},
    policyService?: PolicyServiceInterface
  ) {
    super(legacyService, DomainGroup.BOOKING_RENTALS, config);
    this.policyService = policyService;
  }

  /**
   * Create a booking with policy validation
   */
  async createBooking(
    input: CreateBookingInput,
    context: AdapterContext
  ): Promise<AdapterResult<BookingDTO>> {
    return this.executeWithFallback(
      'createBooking',
      context,
      // Policy executor
      async () => {
        const policy = await this.getBookingPolicy(context.tenantId, input.rentalObjectId);
        
        if (policy?.booking) {
          // Validate against policy rules
          this.validateBookingInput(input, policy.booking);
        }

        // Still use legacy service for actual creation
        return this.legacyService.createBooking(input, {
          tenantId: context.tenantId,
          userId: context.userId,
        });
      },
      // Legacy executor
      async () => {
        return this.legacyService.createBooking(input, {
          tenantId: context.tenantId,
          userId: context.userId,
        });
      }
    );
  }

  /**
   * Get booking by ID
   */
  async getBookingById(
    id: string,
    context: AdapterContext
  ): Promise<AdapterResult<BookingDTO | null>> {
    return this.executeWithFallback(
      'getBookingById',
      context,
      async () => this.legacyService.getBookingById(id, { tenantId: context.tenantId }),
      async () => this.legacyService.getBookingById(id, { tenantId: context.tenantId })
    );
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(
    id: string,
    reason: string,
    context: AdapterContext
  ): Promise<AdapterResult<BookingDTO>> {
    return this.executeWithFallback(
      'cancelBooking',
      context,
      async () => {
        // Policy could add cancellation rules here
        return this.legacyService.cancelBooking(id, reason, {
          tenantId: context.tenantId,
          userId: context.userId,
        });
      },
      async () => {
        return this.legacyService.cancelBooking(id, reason, {
          tenantId: context.tenantId,
          userId: context.userId,
        });
      }
    );
  }

  /**
   * Check if booking requires approval (policy-driven)
   */
  async requiresApproval(
    rentalObjectId: string,
    input: CreateBookingInput,
    context: AdapterContext
  ): Promise<AdapterResult<boolean>> {
    return this.executeWithFallback(
      'requiresApproval',
      context,
      async () => {
        const policy = await this.getBookingPolicy(context.tenantId, rentalObjectId);
        
        if (policy?.approval) {
          // Check policy-driven approval rules
          return this.evaluateApprovalPolicy(input, policy.approval);
        }

        // Fallback to legacy
        return this.legacyService.requiresApproval(rentalObjectId, input, {
          tenantId: context.tenantId,
        });
      },
      async () => {
        return this.legacyService.requiresApproval(rentalObjectId, input, {
          tenantId: context.tenantId,
        });
      }
    );
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  /**
   * Get booking policy for rental object
   */
  private async getBookingPolicy(
    tenantId: string,
    rentalObjectId?: string
  ): Promise<PolicyProjection | null> {
    if (!this.policyService) {
      return null;
    }

    try {
      return await this.policyService.getProjection(tenantId, rentalObjectId);
    } catch (error) {
      this.logger.warn('Failed to get booking policy', { error });
      return null;
    }
  }

  /**
   * Validate booking input against policy rules
   */
  private validateBookingInput(
    input: CreateBookingInput,
    policyRules: Record<string, unknown>
  ): void {
    const slotRules = policyRules.slotRules as {
      minDurationMinutes?: number;
      maxDurationMinutes?: number;
      allowOvernight?: boolean;
    } | undefined;

    if (!slotRules) return;

    const start = new Date(input.startTime);
    const end = new Date(input.endTime);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    if (slotRules.minDurationMinutes && durationMinutes < slotRules.minDurationMinutes) {
      throw new BookingPolicyViolationError(
        'minDuration',
        `Booking duration must be at least ${slotRules.minDurationMinutes} minutes`
      );
    }

    if (slotRules.maxDurationMinutes && durationMinutes > slotRules.maxDurationMinutes) {
      throw new BookingPolicyViolationError(
        'maxDuration',
        `Booking duration cannot exceed ${slotRules.maxDurationMinutes} minutes`
      );
    }

    if (!slotRules.allowOvernight && start.toDateString() !== end.toDateString()) {
      throw new BookingPolicyViolationError(
        'overnight',
        'Overnight bookings are not allowed'
      );
    }
  }

  /**
   * Evaluate approval policy
   */
  private evaluateApprovalPolicy(
    input: CreateBookingInput,
    approvalPolicy: Record<string, unknown>
  ): boolean {
    const autoApproveRules = approvalPolicy.autoApprove as {
      maxDurationMinutes?: number;
      maxAttendeess?: number;
      requiresOrgMembership?: boolean;
    } | undefined;

    if (!autoApproveRules) {
      return true; // Default to requiring approval if no auto-approve rules
    }

    const start = new Date(input.startTime);
    const end = new Date(input.endTime);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    // Check auto-approve conditions
    if (autoApproveRules.maxDurationMinutes && durationMinutes > autoApproveRules.maxDurationMinutes) {
      return true; // Requires approval
    }

    if (autoApproveRules.maxAttendeess && (input.attendeesCount ?? 0) > autoApproveRules.maxAttendeess) {
      return true; // Requires approval
    }

    if (autoApproveRules.requiresOrgMembership && !input.organizationId) {
      return true; // Requires approval for non-org bookings
    }

    return false; // Auto-approve
  }
}

// =============================================================================
// ERRORS
// =============================================================================

/**
 * Error thrown when booking violates policy rules
 */
export class BookingPolicyViolationError extends Error {
  public readonly type = 'BOOKING_POLICY_VIOLATION';
  public readonly rule: string;

  constructor(rule: string, message: string) {
    super(message);
    this.name = 'BookingPolicyViolationError';
    this.rule = rule;
  }
}
