/**
 * Zod validators for Digilist Platform roadmap documents
 *
 * These schemas provide runtime validation of roadmap documents,
 * ensuring type safety and data integrity for roadmap operations.
 *
 * @example
 * ```typescript
 * import { RoadmapDoc, RoadmapPhase, RoadmapItem } from './roadmap.zod';
 *
 * // Validate a roadmap document
 * const result = RoadmapDoc.safeParse(data);
 * if (result.success) {
 *   console.log('Valid roadmap:', result.data);
 * } else {
 *   console.error('Validation errors:', result.error.issues);
 * }
 * ```
 */

import { z } from 'zod';

// =============================================================================
// Base Types
// =============================================================================

/**
 * Phase identifier pattern (e.g., P0, P1, P2)
 */
export const PhaseId = z.string().regex(/^P[0-9]+$/, {
  message: 'Phase ID must match pattern P followed by digits (e.g., P0, P1, P2)',
});

/**
 * Item identifier pattern combining phase ID with 2-digit number (e.g., P0-01, P1-02)
 */
export const ItemId = z.string().regex(/^P[0-9]+-[0-9]{2}$/, {
  message: 'Item ID must match pattern P<digits>-<2 digits> (e.g., P0-01, P1-02)',
});

/**
 * Current implementation status of a roadmap item
 */
export const RoadmapItemStatus = z.enum(['DONE', 'PARTIAL', 'MISSING', 'PLANNED']);

/**
 * Priority level for roadmap items
 */
export const RoadmapPriority = z.enum(['MUST_HAVE', 'SHOULD_HAVE', 'NICE_TO_HAVE']);

// =============================================================================
// Inferred Types
// =============================================================================

export type PhaseIdType = z.infer<typeof PhaseId>;
export type ItemIdType = z.infer<typeof ItemId>;
export type RoadmapItemStatusType = z.infer<typeof RoadmapItemStatus>;
export type RoadmapPriorityType = z.infer<typeof RoadmapPriority>;

// =============================================================================
// Roadmap Item Schema
// =============================================================================

/**
 * A single roadmap item representing a feature, task, or deliverable
 */
export const RoadmapItem = z
  .object({
    /** Unique item identifier (e.g., P0-01, P1-02) */
    id: ItemId,

    /** Human-readable title for the roadmap item */
    title: z.string().min(3, { message: 'Title must be at least 3 characters' }),

    /** Detailed description of the roadmap item */
    description: z.string().optional(),

    /** Current implementation status */
    status: RoadmapItemStatus,

    /** Priority level */
    priority: RoadmapPriority.optional(),

    /** Team or person responsible for this item */
    owner: z.string().optional(),

    /** Target completion date (ISO 8601 date format) */
    dueDate: z.string().date().optional(),

    /** SSA-L compliance clauses this item addresses */
    ssaLClauses: z.array(z.string()).optional(),

    /** Verification rule IDs for automated status checking */
    verificationRules: z.array(z.string()).optional(),

    /** List of item IDs this item depends on */
    dependencies: z.array(ItemId).optional(),

    /** Tags/labels for categorization */
    labels: z.array(z.string()).optional(),

    /** Additional notes or comments */
    notes: z.string().optional(),
  })
  .strict();

export type RoadmapItemType = z.infer<typeof RoadmapItem>;

// =============================================================================
// Roadmap Phase Schema
// =============================================================================

/**
 * A roadmap phase containing multiple items
 */
export const RoadmapPhase = z
  .object({
    /** Phase identifier (e.g., P0, P1, P2) */
    id: PhaseId,

    /** Human-readable name for the phase */
    name: z.string().min(1, { message: 'Phase name is required' }),

    /** Description of the phase goals and scope */
    description: z.string().optional(),

    /** Phase start date (ISO 8601 date format) */
    startDate: z.string().date().optional(),

    /** Phase end date (ISO 8601 date format) */
    endDate: z.string().date().optional(),

    /** List of roadmap items in this phase */
    items: z.array(RoadmapItem),
  })
  .strict();

export type RoadmapPhaseType = z.infer<typeof RoadmapPhase>;

// =============================================================================
// Roadmap Metadata Schema
// =============================================================================

/**
 * Additional metadata for the roadmap document
 */
export const RoadmapMetadata = z.object({
  /** Source system or origin of the roadmap */
  source: z.string().optional(),

  /** Export timestamp (ISO 8601 datetime format) */
  exportedAt: z.string().datetime().optional(),

  /** Version of the schema used */
  schemaVersion: z.string().optional(),
});

export type RoadmapMetadataType = z.infer<typeof RoadmapMetadata>;

// =============================================================================
// Roadmap Document Schema
// =============================================================================

/**
 * Complete roadmap document containing phases and items
 */
export const RoadmapDoc = z
  .object({
    /** Semantic version of the roadmap document (e.g., 1.0.0) */
    version: z.string().regex(/^[0-9]+\.[0-9]+\.[0-9]+$/, {
      message: 'Version must be semantic version format (e.g., 1.0.0)',
    }),

    /** Title of the roadmap */
    title: z.string().min(1, { message: 'Roadmap title is required' }),

    /** Overview description of the roadmap */
    description: z.string().optional(),

    /** Last modification timestamp (ISO 8601 datetime format) */
    lastUpdated: z.string().datetime().optional(),

    /** Organization or team owning this roadmap */
    owner: z.string().optional(),

    /** List of roadmap phases (at least one required) */
    phases: z.array(RoadmapPhase).min(1, { message: 'At least one phase is required' }),

    /** Additional metadata for the roadmap */
    metadata: RoadmapMetadata.optional(),
  })
  .strict();

export type RoadmapDocType = z.infer<typeof RoadmapDoc>;

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Validates a roadmap document and returns typed result
 *
 * @param data - Unknown data to validate
 * @returns SafeParseResult with typed data or error details
 */
export function validateRoadmap(data: unknown): z.SafeParseReturnType<unknown, RoadmapDocType> {
  return RoadmapDoc.safeParse(data);
}

/**
 * Validates a roadmap document and throws on error
 *
 * @param data - Unknown data to validate
 * @returns Validated and typed roadmap document
 * @throws ZodError if validation fails
 */
export function parseRoadmap(data: unknown): RoadmapDocType {
  return RoadmapDoc.parse(data);
}

/**
 * Validates a single roadmap item
 *
 * @param data - Unknown data to validate
 * @returns SafeParseResult with typed data or error details
 */
export function validateRoadmapItem(data: unknown): z.SafeParseReturnType<unknown, RoadmapItemType> {
  return RoadmapItem.safeParse(data);
}

/**
 * Validates a single roadmap phase
 *
 * @param data - Unknown data to validate
 * @returns SafeParseResult with typed data or error details
 */
export function validateRoadmapPhase(
  data: unknown
): z.SafeParseReturnType<unknown, RoadmapPhaseType> {
  return RoadmapPhase.safeParse(data);
}
