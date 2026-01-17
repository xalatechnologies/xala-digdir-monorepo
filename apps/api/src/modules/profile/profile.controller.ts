/**
 * Profile Controller
 * User profile management endpoints
 * 
 * Endpoints:
 * - GET /api/profile - Get current user's profile
 * - PUT /api/profile - Update current user's profile
 * - GET /api/profile/preferences - Get user preferences
 * - PUT /api/profile/preferences - Update user preferences
 * 
 * NOTE: This controller uses the database-backed user repository
 * for persistent profile storage. User preferences are stored
 * in the metadata JSONB field of the users table.
 */

import { Controller, Get, Put } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { users } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { getUserId, TenantRequest } from '../../core/validation/tenant';
import { NotFoundError } from '../../core/errors/problem-details';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  organization?: string;
  role?: string;
  address?: {
    street?: string;
    postalCode?: string;
    city?: string;
  };
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

interface UserPreferences {
  language: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  theme: 'light' | 'dark' | 'system';
}

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'no',
  notifications: {
    email: true,
    sms: false,
    push: true,
  },
  theme: 'system',
};

@Controller('/api/profile')
export class ProfileController {
  /**
   * GET /api/profile
   * Get current user's profile from database
   */
  @Get()
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const db = (request.server as any).db;
    const userId = getUserId(request as TenantRequest);

    const results = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = results[0];

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Map database user to profile response
    const metadata = (user.metadata || {}) as Record<string, unknown>;
    const profile: UserProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: metadata.phone as string | undefined,
      avatar: metadata.avatar as string | undefined,
      organization: metadata.organization as string | undefined,
      role: user.role,
      address: metadata.address as UserProfile['address'],
      preferences: (metadata.preferences || DEFAULT_PREFERENCES) as UserPreferences,
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.lastLoginAt?.toISOString() || user.createdAt?.toISOString() || new Date().toISOString(),
    };

    return reply.send({ data: profile });
  }

  /**
   * PUT /api/profile
   * Update current user's profile in database
   */
  @Put()
  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const db = (request.server as any).db;
    const userId = getUserId(request as TenantRequest);
    const body = request.body as Partial<UserProfile>;

    // Fetch current user
    const results = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = results[0];

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Merge new data with existing metadata
    const currentMetadata = (user.metadata || {}) as Record<string, unknown>;
    const updatedMetadata = {
      ...currentMetadata,
      phone: body.phone ?? currentMetadata.phone,
      avatar: body.avatar ?? currentMetadata.avatar,
      organization: body.organization ?? currentMetadata.organization,
      address: body.address ?? currentMetadata.address,
      preferences: body.preferences ?? currentMetadata.preferences ?? DEFAULT_PREFERENCES,
    };

    // Update user in database
    const updateResult = await db
      .update(users)
      .set({
        name: body.name ?? user.name,
        metadata: updatedMetadata,
      })
      .where(eq(users.id, userId))
      .returning();

    const updatedUser = updateResult[0];

    // Map to profile response
    const updatedProfile: UserProfile = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      phone: updatedMetadata.phone as string | undefined,
      avatar: updatedMetadata.avatar as string | undefined,
      organization: updatedMetadata.organization as string | undefined,
      role: updatedUser.role,
      address: updatedMetadata.address as UserProfile['address'],
      preferences: updatedMetadata.preferences as UserPreferences,
      createdAt: updatedUser.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return reply.send({
      data: updatedProfile,
      message: 'Profile updated successfully',
    });
  }

  /**
   * GET /api/profile/preferences
   * Get user preferences from database
   */
  @Get('/preferences')
  async getPreferences(request: FastifyRequest, reply: FastifyReply) {
    const db = (request.server as any).db;
    const userId = getUserId(request as TenantRequest);

    const results = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = results[0];

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const metadata = (user.metadata || {}) as Record<string, unknown>;
    const preferences = (metadata.preferences || DEFAULT_PREFERENCES) as UserPreferences;

    return reply.send({ data: preferences });
  }

  /**
   * PUT /api/profile/preferences
   * Update user preferences in database
   */
  @Put('/preferences')
  async updatePreferences(request: FastifyRequest, reply: FastifyReply) {
    const db = (request.server as any).db;
    const userId = getUserId(request as TenantRequest);
    const body = request.body as Partial<UserPreferences>;

    // Fetch current user
    const results = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = results[0];

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Merge new preferences with existing
    const currentMetadata = (user.metadata || {}) as Record<string, unknown>;
    const currentPrefs = (currentMetadata.preferences || DEFAULT_PREFERENCES) as UserPreferences;
    
    const updatedPreferences: UserPreferences = {
      language: body.language ?? currentPrefs.language,
      notifications: {
        email: body.notifications?.email ?? currentPrefs.notifications.email,
        sms: body.notifications?.sms ?? currentPrefs.notifications.sms,
        push: body.notifications?.push ?? currentPrefs.notifications.push,
      },
      theme: body.theme ?? currentPrefs.theme,
    };

    const updatedMetadata = {
      ...currentMetadata,
      preferences: updatedPreferences,
    };

    // Update user in database
    await db
      .update(users)
      .set({ metadata: updatedMetadata })
      .where(eq(users.id, userId));

    return reply.send({
      data: updatedPreferences,
      message: 'Preferences updated successfully',
    });
  }
}

export default ProfileController;
