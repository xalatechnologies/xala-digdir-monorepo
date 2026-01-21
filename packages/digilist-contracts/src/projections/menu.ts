/**
 * Menu System Contracts
 * DTOs for the database-driven Backoffice menu system
 *
 * Domain-specific contracts for the Digilist rental booking platform.
 * These types define the contract between:
 * - DK API (server) -> Client SDK -> Backoffice UI
 */

// =============================================================================
// Enums
// =============================================================================

export type MenuTemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type VisibilityScope = 'PLATFORM' | 'TENANT' | 'ORG';
export type FeatureFlagType = 'BOOLEAN' | 'PLAN_GATED' | 'DATE_GATED' | 'PERCENTAGE';
export type RoleScope = 'PLATFORM' | 'TENANT' | 'ORG';
export type SupportedLanguage = 'nb' | 'en';

// =============================================================================
// Menu Item DTO
// =============================================================================

export interface MenuItemDTO {
  key: string;
  label: string;
  description: string | null;
  route: string;
  iconKey: string | null;
  sortOrder: number;
  isSection: boolean;
  visibilityScope: VisibilityScope;
  children: MenuItemDTO[];
  metadata: Record<string, unknown> | null;
}

// =============================================================================
// Menu Category DTO
// =============================================================================

export interface MenuCategoryDTO {
  key: string;
  label: string;
  iconKey: string | null;
  sortOrder: number;
  isCollapsible: boolean;
  defaultExpanded: boolean;
  items: MenuItemDTO[];
}

// =============================================================================
// Menu Tree DTO (API Response)
// =============================================================================

export interface MenuTreeDTO {
  templateCode: string;
  templateVersion: number;
  language: SupportedLanguage;
  categories: MenuCategoryDTO[];
  resolvedAt: string;
}

// =============================================================================
// User Context DTO
// =============================================================================

export interface UserContextDTO {
  userId: string;
  tenantId: string;
  orgId: string | null;
  roles: string[];
  permissions: string[];
  language: SupportedLanguage;
}

// =============================================================================
// Feature Flag DTO
// =============================================================================

export interface FeatureFlagDTO {
  code: string;
  type: FeatureFlagType;
  enabled: boolean;
  value: unknown;
}

// =============================================================================
// Role DTO
// =============================================================================

export interface RoleDTO {
  code: string;
  scope: RoleScope;
  name: string;
  description: string | null;
}

// =============================================================================
// SaaS Admin DTOs
// =============================================================================

export interface MenuTemplateListItemDTO {
  id: string;
  code: string;
  version: number;
  status: MenuTemplateStatus;
  name: string;
  createdAt: string;
  publishedAt: string | null;
}

export interface MenuTemplateDetailDTO extends MenuTemplateListItemDTO {
  notes: string | null;
  categories: MenuCategoryDTO[];
  createdBy: string | null;
}

export interface CreateMenuTemplateDTO {
  code: string;
  name: string;
  notes?: string;
}

export interface UpdateMenuTemplateDTO {
  name?: string;
  notes?: string;
}

export interface TenantFeatureFlagOverrideDTO {
  tenantId: string;
  featureFlagCode: string;
  enabled: boolean;
  value?: unknown;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface TenantMenuAssignmentDTO {
  tenantId: string;
  templateId: string;
  effectiveFrom: string;
  notes?: string;
}

// =============================================================================
// API Responses
// =============================================================================

export interface BackofficeMenuResponse {
  data: MenuTreeDTO;
  meta: {
    cached: boolean;
    cacheKey: string | null;
  };
}

export interface UserContextResponse {
  data: UserContextDTO;
}

export interface FeatureFlagsResponse {
  data: FeatureFlagDTO[];
}

export interface RolesResponse {
  data: RoleDTO[];
}

export interface MenuTemplatesResponse {
  data: MenuTemplateListItemDTO[];
  meta: {
    total: number;
  };
}
