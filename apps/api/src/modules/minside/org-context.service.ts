/**
 * Org Context Service (GAP-010)
 * Business logic for organization context in MinSide
 * 
 * Reference: packages/client-sdk/src/types/advanced-contracts.ts
 */
import { Injectable, Inject } from '../../core/decorators';

interface SetOrgContextRequest {
  type: 'PRIVATE' | 'MEMBERSHIP_ORG';
  orgId?: string;
}

@Injectable()
export class OrgContextService {
  constructor(
    @Inject('Database') private readonly db: any,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Get user's organization context
   * Returns OrgContextDTO
   */
  async getOrgContext(userId: string): Promise<any> {
    // TODO: Load memberships from registries (Brønnøysundregistrene, Idrettsforbund, etc.)
    
    return {
      userId,
      memberships: [
        {
          orgId: 'org-1',
          orgNumber: '123456789',
          name: 'Sports Club A',
          type: 'IDRETT',
          role: 'MEMBER',
          verified: true,
          verifiedAt: '2026-01-10',
          verifiedBy: 'IDRETTSFORBUND',
          pricingGroup: 'ORG_MEMBER',
          discountPercent: 20,
        },
        {
          orgId: 'org-2',
          orgNumber: '987654321',
          name: 'Culture Association B',
          type: 'KULTUR',
          role: 'BOARD_MEMBER',
          verified: true,
          verifiedAt: '2026-01-05',
          verifiedBy: 'BRREG',
          pricingGroup: 'ORG_ADMIN',
          discountPercent: 30,
        },
      ],
      activeContext: {
        type: 'PRIVATE',
      },
    };
  }

  /**
   * Set active organization context
   * Returns OrgContextDTO
   */
  async setOrgContext(userId: string, request: SetOrgContextRequest): Promise<any> {
    // TODO: Validate orgId if provided, update session/cache
    
    this.adapters?.log?.info('Org context updated', { userId, type: request.type, orgId: request.orgId });
    
    const context = await this.getOrgContext(userId);
    
    return {
      ...context,
      activeContext: {
        type: request.type,
        orgId: request.orgId,
      },
    };
  }
}
