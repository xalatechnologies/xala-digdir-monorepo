/**
 * Profile Controller
 * User profile management endpoints
 * 
 * Endpoints:
 * - GET /api/profile - Get current user's profile
 * - PUT /api/profile - Update current user's profile
 * - GET /api/profile/preferences - Get user preferences
 * - PUT /api/profile/preferences - Update user preferences
 */

import { Controller, Get, Put } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';

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
  preferences?: {
    language: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    theme: 'light' | 'dark' | 'system';
  };
  createdAt: string;
  updatedAt: string;
}

// Mock profile data
const mockProfiles: Map<string, UserProfile> = new Map([
  ['demo-user', {
    id: 'demo-user',
    email: 'bruker@skien.kommune.no',
    name: 'Demo Bruker',
    phone: '+47 123 45 678',
    organization: 'Skien Kommune',
    role: 'admin',
    address: {
      street: 'Rådhusveien 1',
      postalCode: '3724',
      city: 'Skien',
    },
    preferences: {
      language: 'no',
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      theme: 'system',
    },
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: new Date().toISOString(),
  }],
]);

@Controller('/api/profile')
export class ProfileController {
  /**
   * GET /api/profile
   * Get current user's profile
   */
  @Get()
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).userId || request.headers['x-user-id'] || 'demo-user';
    
    let profile = mockProfiles.get(userId as string);
    
    if (!profile) {
      // Create default profile for new users
      profile = {
        id: userId as string,
        email: `user-${userId}@example.com`,
        name: 'New User',
        preferences: {
          language: 'no',
          notifications: { email: true, sms: false, push: true },
          theme: 'system',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockProfiles.set(userId as string, profile);
    }
    
    return reply.send({ data: profile });
  }

  /**
   * PUT /api/profile
   * Update current user's profile
   */
  @Put()
  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).userId || request.headers['x-user-id'] || 'demo-user';
    const body = request.body as Partial<UserProfile>;
    
    let profile = mockProfiles.get(userId as string);
    
    if (!profile) {
      profile = {
        id: userId as string,
        email: body.email || `user-${userId}@example.com`,
        name: body.name || 'New User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    
    // Update profile fields
    const updatedProfile: UserProfile = {
      ...profile,
      ...body,
      id: profile.id, // Don't allow ID change
      updatedAt: new Date().toISOString(),
    };
    
    mockProfiles.set(userId as string, updatedProfile);
    
    return reply.send({
      data: updatedProfile,
      message: 'Profile updated successfully',
    });
  }

  /**
   * GET /api/profile/preferences
   * Get user preferences
   */
  @Get('/preferences')
  async getPreferences(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).userId || request.headers['x-user-id'] || 'demo-user';
    const profile = mockProfiles.get(userId as string);
    
    const preferences = profile?.preferences || {
      language: 'no',
      notifications: { email: true, sms: false, push: true },
      theme: 'system',
    };
    
    return reply.send({ data: preferences });
  }

  /**
   * PUT /api/profile/preferences
   * Update user preferences
   */
  @Put('/preferences')
  async updatePreferences(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).userId || request.headers['x-user-id'] || 'demo-user';
    const body = request.body as UserProfile['preferences'];
    
    let profile = mockProfiles.get(userId as string);
    
    if (!profile) {
      profile = {
        id: userId as string,
        email: `user-${userId}@example.com`,
        name: 'New User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    
    profile.preferences = {
      ...profile.preferences,
      ...body,
    } as UserProfile['preferences'];
    profile.updatedAt = new Date().toISOString();
    
    mockProfiles.set(userId as string, profile);
    
    return reply.send({
      data: profile.preferences,
      message: 'Preferences updated successfully',
    });
  }
}

export default ProfileController;
