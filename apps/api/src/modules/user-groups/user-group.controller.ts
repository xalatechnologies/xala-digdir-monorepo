/**
 * User Groups Controller
 * GET /me/user-group - Get current user's group
 */

import { Controller, Get } from '../../core/decorators';
import { mockDb } from '../../adapters/db.adapter';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Controller('/me')
export class UserGroupController {
  /**
   * GET /me/user-group
   * Returns the current user's effective user_group_id
   * 
   * In production: resolved from auth token
   * In dev mode: can override via query/header
   */
  @Get('/user-group')
  async getUserGroup(request: FastifyRequest, reply: FastifyReply) {
    // Check for dev mode override (only in non-production)
    const isDev = process.env.NODE_ENV !== 'production';
    const query = request.query as { userGroupId?: string; userGroupCode?: string };
    const headers = request.headers as { 'x-user-group-id'?: string; 'x-user-group-code'?: string };
    
    let userGroupId: string | null = null;
    let userGroup: any = null;
    
    // Dev mode: allow override via query or header
    if (isDev) {
      if (query.userGroupId || headers['x-user-group-id']) {
        userGroupId = query.userGroupId || headers['x-user-group-id'] || null;
      } else if (query.userGroupCode || headers['x-user-group-code']) {
        const code = query.userGroupCode || headers['x-user-group-code'];
        userGroup = await mockDb.query('SELECT * FROM user_groups WHERE code = $1', [code]);
        userGroupId = userGroup?.id || null;
      }
    }
    
    // In production: would get from auth context
    // const userId = request.user?.id;
    // userGroupId = await this.userService.getUserGroupId(userId);
    
    // If we have an ID but no group object, fetch it
    if (userGroupId && !userGroup) {
      userGroup = await mockDb.query('SELECT * FROM user_groups WHERE id = $1', [userGroupId]);
    }
    
    return reply.send({
      data: {
        userGroupId,
        userGroup: userGroup ? {
          id: userGroup.id,
          code: userGroup.code,
          name: userGroup.name,
          description: userGroup.description,
        } : null,
      },
    });
  }
}

export default UserGroupController;
