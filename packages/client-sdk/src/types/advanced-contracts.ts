/**
 * Advanced Feature Contracts (Contract-First DTOs)
 * 
 * GAP-008: Help system with TOC
 * GAP-009: Global search in Backoffice
 * GAP-010: Org context in MinSide
 * GAP-013: GDPR tools
 * GAP-014: Reports & exports
 * GAP-015: Season rentals
 * 
 * Reference: Governance Audit Phase 3 - Canonical DTO Contract List
 * Created: 2026-01-17
 */

// =============================================================================
// Help System with TOC (GAP-008)
// =============================================================================

/**
 * Help TOC DTO - Table of contents for help system
 * API endpoint: GET /api/help/toc
 */
export interface HelpTOCDTO {
  sections: Array<{
    id: string;
    title: { nb: string; en: string };
    icon?: string;
    order: number;
    articles: Array<{
      id: string;
      slug: string;
      title: { nb: string; en: string };
      summary: { nb: string; en: string };
      tags: string[];
      featured: boolean;
      lastUpdated: string;
    }>;
  }>;
  quickLinks: Array<{
    label: { nb: string; en: string };
    url: string;
    icon?: string;
  }>;
  searchEnabled: boolean;
}

/**
 * Help Article DTO
 * API endpoint: GET /api/help/articles/:slug
 */
export interface HelpArticleDTO {
  id: string;
  slug: string;
  title: { nb: string; en: string };
  content: { nb: string; en: string };
  sectionId: string;
  tags: string[];
  relatedArticles: Array<{
    id: string;
    slug: string;
    title: { nb: string; en: string };
  }>;
  lastUpdated: string;
  readTime: number; // minutes
}

// =============================================================================
// Global Search (GAP-009)
// =============================================================================

/**
 * Search Results DTO - Global search with RBAC filtering
 * API endpoint: POST /api/search/global
 */
export interface SearchResultsDTO {
  query: string;
  totalResults: number;
  executionTimeMs: number;
  
  /**
   * Results grouped by type
   * UI renders these as categorized lists
   */
  results: {
    rental_objects: Array<{
      id: string;
      type: 'rental_object';
      title: string;
      description?: string;
      category: string;
      status: string;
      thumbnailUrl?: string;
      matchScore: number;
      matchedFields: string[]; // e.g., ['title', 'description']
    }>;
    
    bookings: Array<{
      id: string;
      type: 'booking';
      title: string;
      rentalObjectName: string;
      userName: string;
      startDate: string;
      status: string;
      matchScore: number;
      matchedFields: string[];
    }>;
    
    organizations: Array<{
      id: string;
      type: 'organization';
      name: string;
      orgNumber?: string;
      type_label: string;
      matchScore: number;
      matchedFields: string[];
    }>;
    
    users: Array<{
      id: string;
      type: 'user';
      name: string;
      email: string;
      roles: string[];
      matchScore: number;
      matchedFields: string[];
    }>;
  };
  
  /**
   * Available filters based on results
   */
  filters: {
    types: Array<{ value: string; count: number }>;
    statuses: Array<{ value: string; count: number }>;
    dateRanges: Array<{ label: string; value: string }>;
  };
}

/**
 * Search Request
 */
export interface SearchRequest {
  query: string;
  types?: Array<'rental_object' | 'booking' | 'organization' | 'user'>;
  filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  limit?: number;
}

// =============================================================================
// Org Context in MinSide (GAP-010)
// =============================================================================

/**
 * Org Context DTO - User's organization memberships for MinSide
 * API endpoint: GET /api/minside/org-context
 */
export interface OrgContextDTO {
  userId: string;
  
  /**
   * User's memberships (from registries)
   * These are NOT back-office orgs
   */
  memberships: Array<{
    orgId: string;
    orgNumber: string;
    name: string;
    type: 'IDRETT' | 'KULTUR' | 'FRIVILLIG' | 'ANNET';
    role: string; // User's role in this org
    verified: boolean;
    verifiedAt?: string;
    verifiedBy?: 'BRREG' | 'IDRETTSFORBUND' | 'MANUAL';
    
    /**
     * Pricing benefits for this org
     */
    pricingGroup?: string; // e.g., 'ORG_MEMBER', 'ORG_ADMIN'
    discountPercent?: number;
  }>;
  
  /**
   * Active context selection
   * User can book as private or on behalf of org
   */
  activeContext: {
    type: 'PRIVATE' | 'MEMBERSHIP_ORG';
    orgId?: string;
  };
}

/**
 * Set Org Context Request
 */
export interface SetOrgContextRequest {
  type: 'PRIVATE' | 'MEMBERSHIP_ORG';
  orgId?: string;
}

// =============================================================================
// GDPR Tools (GAP-013)
// =============================================================================

/**
 * DSAR (Data Subject Access Request) DTO
 * API endpoint: POST /api/gdpr/dsar
 */
export interface DSARRequestDTO {
  requestId: string;
  userId: string;
  email: string;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'EXPIRED';
  requestedAt: string;
  processedAt?: string;
  expiresAt?: string;
  
  /**
   * Data categories included
   */
  categories: Array<{
    category: string;
    label: { nb: string; en: string };
    recordCount: number;
    included: boolean;
  }>;
  
  /**
   * Download link (when ready)
   */
  downloadUrl?: string;
  downloadExpiresAt?: string;
}

/**
 * Create DSAR Request
 */
export interface CreateDSARRequest {
  email: string;
  categories?: string[]; // If omitted, all categories
  reason?: string;
}

/**
 * Consent Management DTO
 * API endpoint: GET /api/gdpr/consents
 */
export interface ConsentDTO {
  userId: string;
  consents: Array<{
    consentType: string;
    label: { nb: string; en: string };
    description: { nb: string; en: string };
    required: boolean;
    granted: boolean;
    grantedAt?: string;
    revokedAt?: string;
    version: string;
  }>;
}

/**
 * Update Consent Request
 */
export interface UpdateConsentRequest {
  consentType: string;
  granted: boolean;
}

// =============================================================================
// Reports & Exports (GAP-014)
// =============================================================================

/**
 * Report DTO - Report generation with export options
 * API endpoint: POST /api/reports/generate
 */
export interface ReportDTO {
  reportId: string;
  type: 'BOOKINGS' | 'REVENUE' | 'USAGE' | 'AUDIT';
  status: 'QUEUED' | 'GENERATING' | 'READY' | 'FAILED';
  
  /**
   * Report parameters
   */
  parameters: {
    dateFrom: string;
    dateTo: string;
    rentalObjectIds?: string[];
    organizationIds?: string[];
    groupBy?: 'DAY' | 'WEEK' | 'MONTH';
  };
  
  /**
   * Export format
   */
  format: 'PDF' | 'XLSX' | 'CSV' | 'JSON';
  
  /**
   * Generation metadata
   */
  requestedBy: string;
  requestedAt: string;
  generatedAt?: string;
  
  /**
   * Download link (when ready)
   */
  downloadUrl?: string;
  downloadExpiresAt?: string;
  fileSize?: number;
  
  /**
   * Error details (if failed)
   */
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Generate Report Request
 */
export interface GenerateReportRequest {
  type: 'BOOKINGS' | 'REVENUE' | 'USAGE' | 'AUDIT';
  format: 'PDF' | 'XLSX' | 'CSV' | 'JSON';
  parameters: {
    dateFrom: string;
    dateTo: string;
    rentalObjectIds?: string[];
    organizationIds?: string[];
    groupBy?: 'DAY' | 'WEEK' | 'MONTH';
  };
}

/**
 * Report Templates DTO
 * API endpoint: GET /api/reports/templates
 */
export interface ReportTemplateDTO {
  templates: Array<{
    id: string;
    type: 'BOOKINGS' | 'REVENUE' | 'USAGE' | 'AUDIT';
    name: { nb: string; en: string };
    description: { nb: string; en: string };
    defaultFormat: 'PDF' | 'XLSX' | 'CSV' | 'JSON';
    availableFormats: Array<'PDF' | 'XLSX' | 'CSV' | 'JSON'>;
    requiredParameters: string[];
    optionalParameters: string[];
    estimatedGenerationTime: string; // e.g., "30 seconds"
  }>;
}

// =============================================================================
// Season Rentals (GAP-015)
// =============================================================================

/**
 * Season DTO - Season rental configuration
 * API endpoint: GET /api/seasons/:id
 */
export interface SeasonDTO {
  id: string;
  rentalObjectId: string;
  name: { nb: string; en: string };
  description: { nb: string; en: string };
  
  /**
   * Season period
   */
  startDate: string;
  endDate: string;
  
  /**
   * Allocation settings
   */
  totalSlots: number;
  slotsAvailable: number;
  slotDuration: {
    frequency: 'WEEKLY' | 'MONTHLY';
    daysOfWeek?: number[];
    startTime: string;
    endTime: string;
  };
  
  /**
   * Application period
   */
  applicationOpenDate: string;
  applicationCloseDate: string;
  applicationsCount: number;
  
  /**
   * Pricing
   */
  priceCents: number;
  currency: string;
  paymentSchedule: 'UPFRONT' | 'MONTHLY' | 'QUARTERLY';
  
  /**
   * Status
   */
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'ALLOCATED' | 'ACTIVE' | 'COMPLETED';
  
  /**
   * Eligibility rules
   */
  eligibility: {
    requiresOrgMembership: boolean;
    allowedOrgTypes?: string[];
    ageRestriction?: { min?: number; max?: number };
    residencyRequired?: boolean;
  };
}

/**
 * Season Application DTO
 * API endpoint: POST /api/seasons/:seasonId/apply
 */
export interface SeasonApplicationDTO {
  id: string;
  seasonId: string;
  userId: string;
  orgId?: string;
  
  /**
   * Application details
   */
  preferredSlots: Array<{
    dayOfWeek: number;
    startTime: string;
    rank: number; // 1 = most preferred
  }>;
  
  /**
   * Application status
   */
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED';
  allocatedSlot?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  };
  
  /**
   * Metadata
   */
  appliedAt: string;
  processedAt?: string;
  rejectionReason?: string;
}

/**
 * Apply for Season Request
 */
export interface ApplyForSeasonRequest {
  orgId?: string;
  preferredSlots: Array<{
    dayOfWeek: number;
    startTime: string;
    rank: number;
  }>;
  notes?: string;
}

/**
 * Season Allocation Summary DTO
 * API endpoint: GET /api/seasons/:seasonId/allocations
 */
export interface SeasonAllocationDTO {
  seasonId: string;
  
  /**
   * Allocation statistics
   */
  stats: {
    totalSlots: number;
    allocatedSlots: number;
    pendingApplications: number;
    waitlistedApplications: number;
  };
  
  /**
   * Allocated slots with details
   */
  allocations: Array<{
    slotId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    userId: string;
    userName: string;
    orgId?: string;
    orgName?: string;
    allocatedAt: string;
  }>;
}
