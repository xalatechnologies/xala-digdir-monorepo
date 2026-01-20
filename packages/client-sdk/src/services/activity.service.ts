/**
 * Activity Service
 * Handles public activities (classes, events, trainings, etc.)
 * Used by web ActivityCalendar page
 */

import { BaseService } from './base.service';
import type { PaginatedResponse, SingleResponse } from '@/types';

// ============================================================================
// Types
// ============================================================================

export type ActivityCategory = 'CLASS' | 'EVENT' | 'TRAINING' | 'WORKSHOP' | 'MATCH' | 'PERFORMANCE';

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  startTime: string;
  endTime: string;
  rentalObjectId: string;
  rentalObjectName: string;
  maxParticipants?: number;
  currentParticipants: number;
  instructorName?: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
  registrationFee: number;
  imageUrl?: string;
  tags?: string[];
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'IN_PROGRESS';
  createdAt: string;
  updatedAt: string;
}

export interface ActivityQueryParams {
  date?: string;
  category?: ActivityCategory;
  rentalObjectId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  hasAvailability?: boolean;
  page?: number;
  limit?: number;
}

export interface ActivityRegistration {
  id: string;
  activityId: string;
  userId: string;
  userName: string;
  registeredAt: string;
  status: 'CONFIRMED' | 'WAITLIST' | 'CANCELLED';
}

export interface RegisterForActivityDTO {
  activityId: string;
  userId?: string;
  guestName?: string;
  guestEmail?: string;
}

// ============================================================================
// Service
// ============================================================================

class ActivityService extends BaseService {
  constructor() {
    super('/api/activities');
  }

  /**
   * Get activities with optional filters
   */
  async getAll(params?: ActivityQueryParams): Promise<PaginatedResponse<Activity>> {
    const queryParams = params
      ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ).toString()}`
      : '';
    return this.client.get<PaginatedResponse<Activity>>(this.buildPath(queryParams));
  }

  /**
   * Get single activity by ID
   */
  async getById(id: string): Promise<SingleResponse<Activity>> {
    return this.client.get<SingleResponse<Activity>>(this.buildPath(`/${id}`));
  }

  /**
   * Get activities by category
   */
  async getByCategory(category: ActivityCategory, params?: Omit<ActivityQueryParams, 'category'>): Promise<PaginatedResponse<Activity>> {
    return this.getAll({ ...params, category });
  }

  /**
   * Get activities by date
   */
  async getByDate(date: string | Date, params?: Omit<ActivityQueryParams, 'date'>): Promise<PaginatedResponse<Activity>> {
    const dateStr = typeof date === 'string' ? date : date.toISOString();
    return this.getAll({ ...params, date: dateStr });
  }

  /**
   * Get activities for a specific rental object
   */
  async getByRentalObject(rentalObjectId: string, params?: Omit<ActivityQueryParams, 'rentalObjectId'>): Promise<PaginatedResponse<Activity>> {
    return this.getAll({ ...params, rentalObjectId });
  }

  /**
   * Register for an activity
   */
  async register(data: RegisterForActivityDTO): Promise<SingleResponse<ActivityRegistration>> {
    return this.client.post<SingleResponse<ActivityRegistration>>(this.buildPath(`/${data.activityId}/register`), data);
  }

  /**
   * Cancel registration
   */
  async cancelRegistration(activityId: string, registrationId: string): Promise<void> {
    await this.client.delete(this.buildPath(`/${activityId}/registrations/${registrationId}`));
  }

  /**
   * Get registrations for an activity
   */
  async getRegistrations(activityId: string): Promise<PaginatedResponse<ActivityRegistration>> {
    return this.client.get<PaginatedResponse<ActivityRegistration>>(this.buildPath(`/${activityId}/registrations`));
  }

  /**
   * Search activities
   */
  async search(query: string, params?: Omit<ActivityQueryParams, 'search'>): Promise<PaginatedResponse<Activity>> {
    return this.getAll({ ...params, search: query });
  }

  /**
   * Get upcoming activities
   */
  async getUpcoming(limit = 10): Promise<PaginatedResponse<Activity>> {
    return this.getAll({
      date: new Date().toISOString(),
      limit,
      hasAvailability: true,
    });
  }

  /**
   * Get available categories
   */
  async getCategories(): Promise<SingleResponse<ActivityCategory[]>> {
    return this.client.get<SingleResponse<ActivityCategory[]>>(this.buildPath('/categories'));
  }
}

export const activityService = new ActivityService();
