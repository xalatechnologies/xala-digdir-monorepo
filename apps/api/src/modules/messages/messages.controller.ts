/**
 * Messages Controller
 * Manages conversations and messages between users and admins
 */
import { Controller, Get, Post, Put } from '../../core/decorators';
import { container } from '../../core/container';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, sql, count, desc, isNull } from 'drizzle-orm';
import { conversations, messages, users } from '../../database/schema/index';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

@Controller('/api/messages')
export class MessagesController {
  @Get('/conversations')
  async getConversations(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { userId, bookingId, status, page = 1, limit = 20 } = request.query as any;

    // Build query conditions
    const conditions = [];
    if (userId) conditions.push(eq(conversations.userId, userId));
    if (bookingId) conditions.push(eq(conversations.bookingId, bookingId));
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
      })
      .from(conversations)
      .leftJoin(users, eq(conversations.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(conversations.lastMessageAt))
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit));

    return {
      data: result,
    };
  }

  @Get('/conversations/:id')
  async getConversation(request: TenantRequest, reply: FastifyReply) {
    const db = container.resolve<any>('Database');
    const { id } = request.params as any;

    // Get conversation
    const conversationResult = await db
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

    if (!conversationResult.length) {
      reply.code(404);
      return { error: 'Conversation not found' };
    }

    // Get messages
    const messageResults = await db
      .select({
        id: messages.id,
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
      .orderBy(messages.createdAt);

    return {
      conversation: conversationResult[0],
      messages: messageResults.map((m: any) => ({
        ...m,
        senderName: m.senderName || (m.senderType === 'system' ? 'System' : 'Unknown'),
      })),
    };
  }

  @Post('/conversations')
  async createConversation(request: TenantRequest, reply: FastifyReply) {
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
        status: 'active',
      })
      .returning();

    // Add initial message if provided
    if (body.initialMessage) {
      await db
        .insert(messages)
        .values({
          conversationId: result[0].id,
          senderType: 'user',
          senderId: body.userId,
          content: body.initialMessage,
        });
      
      await db
        .update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, result[0].id));
    }

    reply.code(201);
    return { data: result[0] };
  }

  @Post('/conversations/:id/messages')
  async addMessage(request: TenantRequest, reply: FastifyReply) {
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

    reply.code(201);
    return { data: result[0] };
  }

  @Put('/conversations/:id/read')
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
