/**
 * ACOS WebSak Service
 * Single Responsibility: Norwegian Municipal Case Management System Integration
 *
 * ACOS WebSak is used by Norwegian municipalities for:
 * - Document management (dokumenthåndtering)
 * - Case tracking (saksstyring)
 * - Archive compliance following NOARK standards
 *
 * This file re-exports the ACOS service from integration.service.ts
 * for standalone usage and cleaner imports.
 */

export {
  AcosWebSakService,
  acosWebSakService
} from './integration.service';

// Re-export ACOS-specific types for convenience
export type {
  AcosWebSakStatus,
  AcosCase,
  AcosDocument,
  CreateAcosCaseDTO,
  UploadAcosDocumentDTO,
  AcosArchiveMetadata
} from '../types/settings';
