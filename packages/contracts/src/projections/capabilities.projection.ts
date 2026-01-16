/**
 * Capabilities Projection
 *
 * UI-ready projection for capabilities response.
 */
import { z } from 'zod';
import {
  UIHintsSchema,
  FeatureFlagsSchema,
} from '../schemas/capabilities.schema';

// =============================================================================
// Capabilities Projection
// =============================================================================

/**
 * The projection returned by /me/capabilities endpoints
 */
export const CapabilitiesProjectionSchema = z.object({
  /** Effective role for this app context */
  role: z.string(),
  
  /** List of granted capabilities */
  capabilities: z.array(z.string()),
  
  /** Tenant-specific feature flags */
  featureFlags: FeatureFlagsSchema,
  
  /** UI hints for rendering (computed server-side) */
  uiHints: UIHintsSchema.optional(),
  
  /** Organization scopes (for multi-org users) */
  organizationScopes: z.array(z.string()).optional(),
});

export type CapabilitiesProjection = z.infer<typeof CapabilitiesProjectionSchema>;
