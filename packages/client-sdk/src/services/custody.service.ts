/**
 * Custody Service
 * Handles resource-scoped delegation grants and subgrants.
 */
import { BaseService } from './base.service';
import type { 
  CustodyGrant, 
  CreateCustodyGrantDTO, 
  BulkAssignCustodyGrantDTO,
  CreateCustodySubgrantDTO,
  CustodySubgrant
} from '@xala/contracts';

export type { CustodyGrant, CustodySubgrant };

export class CustodyService extends BaseService {
  constructor() {
    super('/api/custody');
  }

  /**
   * List grants for a rental object
   */
  public async listGrants(rentalObjectId: string): Promise<CustodyGrant[]> {
    const response = await this.get<{ data: CustodyGrant[] }>(`/rental-objects/${rentalObjectId}`);
    return response.data;
  }

  /**
   * List objects an organization has custody for
   */
  public async listOrgCustody(orgId: string): Promise<CustodyGrant[]> {
    const response = await this.get<{ data: CustodyGrant[] }>(`/orgs/${orgId}/rental-objects`);
    return response.data;
  }

  /**
   * Create a new grant
   */
  public async createGrant(rentalObjectId: string, data: CreateCustodyGrantDTO): Promise<CustodyGrant> {
    const response = await this.post<{ data: CustodyGrant }>(`/rental-objects/${rentalObjectId}/grants`, data);
    return response.data;
  }

  /**
   * Revoke a grant
   */
  public async revokeGrant(grantId: string): Promise<CustodyGrant> {
    const response = await this.delete<{ data: CustodyGrant }>(`/grants/${grantId}`);
    return response.data;
  }

  /**
   * Bulk assign grants
   */
  public async bulkAssign(data: BulkAssignCustodyGrantDTO): Promise<any> {
    const response = await this.post<{ data: any }>('/grants/bulk', data);
    return response.data;
  }

  /**
   * Create a subgrant
   */
  public async createSubgrant(parentGrantId: string, data: CreateCustodySubgrantDTO): Promise<CustodySubgrant> {
    const response = await this.post<{ data: CustodySubgrant }>(`/grants/${parentGrantId}/subgrants`, data);
    return response.data;
  }
}

export const custodyService = new CustodyService();
