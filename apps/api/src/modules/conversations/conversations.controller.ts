/**
 * Conversations Controller
 * Full conversation and message management at /api/conversations
 */
import { Controller, Get, Post, Put } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, sql, count, desc, isNull } from 'drizzle-orm';
import { conversations, messages, users } from '../../database/schema/index';
import { getAuditService } from '../../core/audit/audit.service';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

@Controller('/api/conversations')
export class ConversationsController {
  /**
   * GET /api/conversations/unread-count
   * Get unread conversation count
   */
  @Get('/unread-count')
  async getUnreadCount(request: TenantRequest, reply: FastifyReply) {
    try {
      const db = container.resolve<any>('Database');
      if (!db) {
        // Mock response when database not available
        return { data: { count: 2, lastCheckedAt: new Date().toISOString() } };
      }
      
      const result = await db
        .select({ totalUnread: sql`COALESCE(SUM(unread_count), 0)` })
        .from(conversations);
      
      return {
        data: {
          count: Number(result[0]?.totalUnread || 0),
          lastCheckedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      // Return mock data on error to prevent 500
      return { data: { count: 0, lastCheckedAt: new Date().toISOString() } };
    }
  }
  
  @Get()
  async findAll(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { status, page = 1, limit = 20 } = request.query as any;

    const conditions = [];
    if (status) conditions.push(eq(conversations.status, status));

    const result = await db
      .select({
        id: conversations.id,
        tenantId: conversations.tenantId,
        userId: conversations.userId,
        userName: users.name,
        userEmail: users.email,
        bookingId: conversations.bookingId,
        subject: conversations.subject,
        status: conversations.status,
        unreadCount: conversations.unreadCount,
        lastMessageAt: conversations.lastMessageAt,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
      })
      .from(conversations)
      .leftJoin(users, eq(conversations.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(conversations.lastMessageAt))
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit));

    const countResult = await db
      .select({ count: count() })
      .from(conversations)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      data: result.map((c: any) => ({
        ...c,
        participants: [
          { id: c.userId, name: c.userName, email: c.userEmail },
        ],
        lastMessage: c.lastMessageAt ? { createdAt: c.lastMessageAt } : null,
      })),
      meta: {
        total: Number(countResult[0]?.count || 0),
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(Number(countResult[0]?.count || 0) / Number(limit)),
      },
    };
  }

  @Get('/:id')
  async findOne(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    const result = await db
      .select({
        id: conversations.id,
        tenantId: conversations.tenantId,
        userId: conversations.userId,
        userName: users.name,
        userEmail: users.email,
        bookingId: conversations.bookingId,
        subject: conversations.subject,
        status: conversations.status,
        unreadCount: conversations.unreadCount,
        lastMessageAt: conversations.lastMessageAt,
        createdAt: conversations.createdAt,
      })
      .from(conversations)
      .leftJoin(users, eq(conversations.userId, users.id))
      .where(eq(conversations.id, id));

    if (!result.length) {
      reply.code(404);
      return { error: 'Conversation not found' };
    }

    return { data: result[0] };
  }

  @Get('/:id/messages')
  async getMessages(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;
    const { page = 1, limit = 50 } = request.query as any;

    const result = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderType: messages.senderType,
        senderId: messages.senderId,
        senderName: users.name,
        content: messages.content,
        attachments: messages.attachments,
        readAt: messages.readAt,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, id))
      .orderBy(messages.createdAt)
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit));

    const countResult = await db
      .select({ count: count() })
      .from(messages)
      .where(eq(messages.conversationId, id));

    return {
      data: result.map((m: any) => ({
        ...m,
        senderName: m.senderName || (m.senderType === 'system' ? 'System' : 'Unknown'),
      })),
      meta: {
        total: Number(countResult[0]?.count || 0),
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(Number(countResult[0]?.count || 0) / Number(limit)),
      },
    };
  }

  @Post()
  async create(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const body = request.body as any;

    const result = await db
      .insert(conversations)
      .values({
        tenantId,
        userId: body.userId,
        bookingId: body.bookingId || null,
        subject: body.subject || null,
        status: 'open',
      })
      .returning();

    getAuditService().log({
      tenantId,
      userId: body.userId,
      action: 'create',
      resource: 'conversation',
      resourceId: result[0].id,
      metadata: { subject: body.subject, bookingId: body.bookingId },
    });

    reply.code(201);
    return { data: result[0] };
  }

  @Post('/:id/messages')
  async sendMessage(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;
    const body = request.body as any;

    const result = await db
      .insert(messages)
      .values({
        conversationId: id,
        senderType: body.senderType || 'admin',
        senderId: body.senderId || null,
        content: body.content,
        attachments: body.attachments || [],
      })
      .returning();

    // Update conversation
    await db
      .update(conversations)
      .set({
        lastMessageAt: new Date(),
        unreadCount: sql`unread_count + 1`,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, id));

    getAuditService().log({
      tenantId: request.tenantId || undefined,
      userId: body.senderId,
      action: 'send',
      resource: 'message',
      resourceId: result[0].id,
      metadata: { conversationId: id, senderType: body.senderType },
    });

    reply.code(201);
    return { data: result[0] };
  }

  @Put('/:id/resolve')
  async resolve(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    const result = await db
      .update(conversations)
      .set({ status: 'resolved', updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();

    if (!result.length) {
      reply.code(404);
      return { error: 'Conversation not found' };
    }

    return { data: result[0] };
  }

  @Put('/:id/read')
  async markAsRead(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    await db
      .update(messages)
      .set({ readAt: new Date() })
      .where(and(eq(messages.conversationId, id), isNull(messages.readAt)));

    await db
      .update(conversations)
      .set({ unreadCount: 0 })
      .where(eq(conversations.id, id));

    return { success: true };
  }
}
