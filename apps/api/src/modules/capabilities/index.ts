/**
 * Capabilities Module
 *
 * Provides app-specific capability endpoints that serve as the
 * single source of truth for RBAC in the frontend.
 */

export { CapabilitiesController } from './capabilities.controller';
export {
  WEB_CAPABILITIES,
  MINSIDE_CAPABILITIES,
  BACKOFFICE_CAPABILITIES,
} from './capabilities.controller';
export type { CapabilitiesResponse } from './capabilities.controller';
