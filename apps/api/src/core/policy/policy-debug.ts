/**
 * Policy Debug Middleware
 * 
 * Enhancement: X-Digilist-Policy-Debug header support
 * When enabled, returns full policy evaluation tree for:
 * - Support debugging
 * - Municipal audits
 * - Tender demos
 */

import type { FastifyRequest, FastifyReply} from 'fastify';

// ==============================================================================
// Policy Debug Types
// ==============================================================================

export interface PolicyEvaluationNode {
  policyId: string;
  policyName: string;
  evaluatedAt: string;
  inputs: Record<string, unknown>;
  decision: 'allow' | 'deny' | 'not_applicable';
  reasonKey: string;
  reasonMessage?: string;
  evaluationTimeMs: number;
  children?: PolicyEvaluationNode[];
}

export interface PolicyDebugPayload {
  requestId: string;
  userId: string | null;
  tenantId: string | null;
  roles: string[];
  resource: string;
  action: string;
  evaluatedAt: string;
  totalEvaluationTimeMs: number;
  finalDecision: 'allow' | 'deny';
  policyTree: PolicyEvaluationNode[];
}

// ==============================================================================
// Policy Debug Header
// ==============================================================================

export const POLICY_DEBUG_HEADER = 'x-digilist-policy-debug';

/**
 * Check if policy debug is enabled for this request
 */
export function isPolicyDebugEnabled(request: FastifyRequest): boolean {
  const debugHeader = request.headers[POLICY_DEBUG_HEADER];
  return debugHeader === 'true' || debugHeader === '1';
}

// ==============================================================================
// Policy Evaluation Tracker
// ==============================================================================

export class PolicyEvaluationTracker {
  private nodes: PolicyEvaluationNode[] = [];
  private startTime: number = Date.now();

  constructor(
    private resource: string,
    private action: string,
    private context: {
      userId: string | null;
      tenantId: string | null;
      roles: string[];
    }
  ) {}

  /**
   * Track a policy evaluation
   */
  track(
    policyId: string,
    policyName: string,
    inputs: Record<string, unknown>,
    decision: 'allow' | 'deny' | 'not_applicable',
    reasonKey: string,
    evaluationTimeMs: number,
    children?: PolicyEvaluationNode[]
  ): void {
    this.nodes.push({
      policyId,
      policyName,
      evaluatedAt: new Date().toISOString(),
      inputs,
      decision,
      reasonKey,
      evaluationTimeMs,
      children,
    });
  }

  /**
   * Get the final policy debug payload
   */
  getDebugPayload(finalDecision: 'allow' | 'deny', requestId: string): PolicyDebugPayload {
    return {
      requestId,
      userId: this.context.userId,
      tenantId: this.context.tenantId,
      roles: this.context.roles,
      resource: this.resource,
      action: this.action,
      evaluatedAt: new Date().toISOString(),
      totalEvaluationTimeMs: Date.now() - this.startTime,
      finalDecision,
      policyTree: this.nodes,
    };
  }
}

// ==============================================================================
// Mock Policy Evaluator (for demonstration)
// ==============================================================================

export function evaluateBookingPolicy(
  userId: string | null,
  listingId: string,
  action: string,
  tracker?: PolicyEvaluationTracker
): { allowed: boolean; reasonKey: string } {
  const startTime = Date.now();
  
  // Policy 1: Authentication check
  if (!userId) {
    const result = {
      allowed: false,
      reasonKey: 'auth.not_authenticated',
    };
    
    tracker?.track(
      'auth_check',
      'Authentication Check',
      { userId },
      'deny',
      result.reasonKey,
      Date.now() - startTime
    );
    
    return result;
  }
  
  tracker?.track(
    'auth_check',
    'Authentication Check',
    { userId },
    'allow',
    'auth.authenticated',
    Date.now() - startTime
  );

  // Policy 2: Listing availability (mock)
  const listingCheckStart = Date.now();
  const listingAvailable = true; // Mock
  
  tracker?.track(
    'listing_availability',
    'Listing Availability Check',
    { listingId, action },
    listingAvailable ? 'allow' : 'deny',
    listingAvailable ? 'listing.available' : 'listing.not_available',
    Date.now() - listingCheckStart
  );

  if (!listingAvailable) {
    return { allowed: false, reasonKey: 'listing.not_available' };
  }

  // Policy 3: Booking window check (mock)
  const windowCheckStart = Date.now();
  const withinWindow = true; // Mock
  
  tracker?.track(
    'booking_window',
    'Booking Window Check',
    { action },
    withinWindow ? 'allow' : 'deny',
    withinWindow ? 'window.open' : 'policy.booking_window_closed',
    Date.now() - windowCheckStart
  );

  if (!withinWindow) {
    return { allowed: false, reasonKey: 'policy.booking_window_closed' };
  }

  return { allowed: true, reasonKey: 'policy.all_checks_passed' };
}

// ==============================================================================
// Response Enhancer
// ==============================================================================

/**
 * Enhance response with policy debug info if enabled
 */
export function enhanceResponseWithPolicyDebug<T extends Record<string, unknown>>(
  response: T,
  request: FastifyRequest,
  tracker: PolicyEvaluationTracker | null,
  finalDecision: 'allow' | 'deny'
): T & { _policyDebug?: PolicyDebugPayload } {
  if (!isPolicyDebugEnabled(request) || !tracker) {
    return response;
  }

  const requestId = (request as any).id || `req_${Date.now()}`;
  
  return {
    ...response,
    _policyDebug: tracker.getDebugPayload(finalDecision, requestId),
  };
}

// ==============================================================================
// Fastify Hook (Optional Integration)
// ==============================================================================

/**
 * Create policy debug context for a request
 */
export function createPolicyContext(
  request: FastifyRequest,
  resource: string,
  action: string
): PolicyEvaluationTracker | null {
  if (!isPolicyDebugEnabled(request)) {
    return null;
  }

  const userId = (request as any).userId ?? null;
  const tenantId = (request as any).tenantId ?? null;
  const roles = (request as any).roles ?? [];

  return new PolicyEvaluationTracker(resource, action, {
    userId,
    tenantId,
    roles,
  });
}

/**
 * Example usage in controller:
 * 
 * ```typescript
 * @Get('/bookings/:id')
 * async getBooking(request: TenantRequest, reply: FastifyReply) {
 *   const tracker = createPolicyContext(request, 'booking', 'view');
 *   
 *   const { allowed, reasonKey } = evaluateBookingPolicy(
 *     request.userId,
 *     request.params.id,
 *     'view',
 *     tracker
 *   );
 *   
 *   if (!allowed) {
 *     reply.code(403);
 *     return enhanceResponseWithPolicyDebug(
 *       { error: 'Forbidden', reasonKey },
 *       request,
 *       tracker,
 *       'deny'
 *     );
 *   }
 *   
 *   const booking = await this.service.getById(request.params.id);
 *   return enhanceResponseWithPolicyDebug(
 *     { data: booking },
 *     request,
 *     tracker,
 *     'allow'
 *   );
 * }
 * ```
 */
