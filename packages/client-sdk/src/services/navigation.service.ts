/**
 * Navigation Service
 * API client for navigation endpoints
 */

import type { NavigationResponse } from '../types/navigation';
import { NavigationApiResponseSchema } from '../types/navigation';
import { getClient } from '../core/client-factory';

export class NavigationService {
  /**
   * Get admin navigation menu
   * Returns server-generated menu structure based on user's role and permissions
   * 
   * @returns Navigation response with menu items and user context
   */
  async getAdminNavigation(): Promise<NavigationResponse> {
    const client = getClient();
    const response = await client.get('/api/me/navigation');
    
    // Validate response schema
    const validated = NavigationApiResponseSchema.parse(response);
    
    return validated.data;
  }
}
