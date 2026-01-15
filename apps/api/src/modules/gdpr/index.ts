/**
 * GDPR Module
 * Exports for GDPR consent management and data subject rights
 */

export { GdprRepository } from './gdpr.repository';
export { GdprService } from './gdpr.service';
export type {
  ConsentTypeDTO,
  UserConsentStatusDTO,
  GrantConsentDTO,
  ConsentSummaryDTO,
  DataSubjectRequestDTO,
} from './gdpr.service';
export { GdprController } from './gdpr.controller';
