/**
 * Brreg Service
 * Norwegian organization registry integration
 */

import { BaseService } from './base.service';
import type { SingleResponse, PaginatedResponse } from '../types/enums';

// =============================================================================
// Types
// =============================================================================

export interface BrregOrganization {
  orgNumber: string;
  name: string;
  type: string;
  typeCode: string;
  address: {
    land: string;
    landkode: string;
    postnummer: string;
    poststed: string;
    adresse: string[];
    kommune: string;
    kommunenummer: string;
  };
  industry?: string;
}

export interface BrregOrgDetails extends BrregOrganization {
  registeredDate: string;
  vatRegistered: boolean;
  employees: number;
  website?: string;
}

export interface BrregRole {
  type: string;
  title: string;
  person: {
    name: string;
    birthDate?: string;
  };
}

export interface BrregValidation {
  orgNumber: string;
  isValidFormat: boolean;
  exists: boolean;
  name: string | null;
  canBeUsedForMembership: boolean;
}

export interface MembershipOrganization {
  id: string;
  tenantId: string;
  type: 'membership';
  name: string;
  orgNumber: string;
  orgType: string;
  address: {
    street?: string;
    postalCode: string;
    city: string;
    municipality: string;
    municipalityNumber: string;
  };
  industry?: string;
  website?: string;
  verified: boolean;
  verifiedAt: string;
  verificationSource: 'brreg';
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Service
// =============================================================================

export class BrregService extends BaseService {
  constructor() {
    super('/api/brreg');
  }

  /**
   * Search organizations in Brreg
   */
  async search(query: string, options?: { type?: string; limit?: number }): Promise<PaginatedResponse<BrregOrganization>> {
    const params = new URLSearchParams();
    params.set('q', query);
    if (options?.type) params.set('type', options.type);
    if (options?.limit) params.set('limit', String(options.limit));
    return this.client.get(this.buildPath(`/search?${params.toString()}`));
  }

  /**
   * Get organization details by org number
   */
  async getOrganization(orgNumber: string): Promise<SingleResponse<BrregOrgDetails>> {
    return this.client.get(this.buildPath(`/org/${orgNumber}`));
  }

  /**
   * Get organization roles/persons
   */
  async getOrganizationRoles(orgNumber: string): Promise<SingleResponse<{ orgNumber: string; roles: BrregRole[] }>> {
    return this.client.get(this.buildPath(`/org/${orgNumber}/roles`));
  }

  /**
   * Validate org number
   */
  async validate(orgNumber: string): Promise<SingleResponse<BrregValidation>> {
    return this.client.get(this.buildPath(`/validate/${orgNumber}`));
  }

  /**
   * Create membership organization from Brreg data
   */
  async createFromBrreg(orgNumber: string): Promise<SingleResponse<MembershipOrganization>> {
    return this.client.post('/api/organizations/from-brreg', { orgNumber });
  }
}

// Singleton instance
export const brregService = new BrregService();
