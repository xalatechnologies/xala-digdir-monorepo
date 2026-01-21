/**
 * Navigation Service
 * API client for navigation endpoints
 */

import type { NavigationResponse } from '@/types/navigation';
import { NavigationApiResponseSchema } from '@/types/navigation';
import { getClient } from '@/core/client-factory';

export interface BackofficeMenuResponse {
  templateCode: string;
  templateVersion: number;
  language: string;
  categories: Array<{
    id: string;
    code: string;
    label: string;
    icon?: string;
    items: Array<{
      id: string;
      code: string;
      label: string;
      href: string;
      icon?: string;
    }>;
  }>;
  resolvedAt: string;
}

// UserContextResponse is defined in @digilist/contracts/projections
import type { UserContextResponse } from '@digilist/contracts/projections';
export type { UserContextResponse };

export class NavigationService {
  /**
   * Get admin navigation menu
   * Returns server-generated menu structure based on user's role and permissions
   */
  async getAdminNavigation(): Promise<NavigationResponse> {
    const client = getClient();
    const response = await client.get('/api/me/navigation');
    const validated = NavigationApiResponseSchema.parse(response);
    return validated.data;
  }

  /**
   * Get backoffice menu for current user
   * Returns resolved menu tree based on roles, permissions, and feature flags
   */
  async getBackofficeMenu(lang: 'nb' | 'en' = 'nb'): Promise<BackofficeMenuResponse> {
    const client = getClient();
    const response = await client.get(`/dk/backoffice/menu?lang=${lang}`) as { data: BackofficeMenuResponse };
    return response.data;
  }

  /**
   * Get user context (tenant, roles, permissions)
   */
  async getUserContext(): Promise<UserContextResponse> {
    const client = getClient();
    const response = await client.get('/dk/me/context') as { data: UserContextResponse };
    return response.data;
  }
}
