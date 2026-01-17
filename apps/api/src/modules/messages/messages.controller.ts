/**
 * Messages Controller
 * Manages conversations and messages between users and admins
 * 
 * Scope Enforcement:
 * - org_member users can only access conversations for their assigned rental objects
 * - Conversations are linked to bookings, which are linked to rental objects
 */
import { Controller, Get, Post, Put } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { getMessagesRepository } from './messages.repository';
import { ForbiddenError } from '../../core/errors/problem-details';
import { container } from '../../core/container';
import { eq, and } from 'drizzle-orm';
import { users, caseHandlerScopes, bookings, conversations } from '../../database/schema/index';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

@Controller('/api/messages')
export class MessagesController {
  private readonly repository = getMessagesRepository();

  /**
   * Check if user has scope access to a conversation
   * org_member must have scope for the booking's rental object
   */
  private async checkConversationScope(userId: string | null, conversationId: string): Promise<void> {
    if (!userId) return;

    const db = container.resolve<any>('Database');

    // Get user role
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Admin/super_admin bypass
    if (!user || ['admin', 'super_admin'].includes(user.role)) return;

    // For org_member/saksbehandler, check scope via booking
    if (['org_member', 'saksbehandler'].includes(user.role)) {
      const [conv] = await db
        .select({ bookingId: conversations.bookingId })
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);

      if (!conv?.bookingId) return; // No booking linked, allow access

      const [booking] = await db
        .select({ rentalObjectId: bookings.rentalObjectId })
        .from(bookings)
        .where(eq(bookings.id, conv.bookingId))
        .limit(1);

      if (!booking) return;

      // Check for 'all' scope
      const [allScope] = await db
        .select({ id: caseHandlerScopes.id })
        .from(caseHandlerScopes)
        .where(
          and(
            eq(caseHandlerScopes.userId, userId),
            eq(caseHandlerScopes.scopeType, 'all'),
            eq(caseHandlerScopes.status, 'active')
          )
        )
        .limit(1);

      if (allScope) return;

      // Check for specific scope
      const [specificScope] = await db
        .select({ id: caseHandlerScopes.id })
        .from(caseHandlerScopes)
        .where(
          and(
            eq(caseHandlerScopes.userId, userId),
            eq(caseHandlerScopes.scopeType, 'specific'),
            eq(caseHandlerScopes.rentalObjectId, booking.rentalObjectId),
            eq(caseHandlerScopes.status, 'active')
          )
        )
        .limit(1);

      if (!specificScope) {
        throw new ForbiddenError('You do not have access to this conversation');
      }
    }
  }

  @Get('/conversations')
  async getConversations(request: TenantRequest, reply: FastifyReply) {
    const { userId, bookingId, status, page = 1, limit = 20 } = request.query as any;

    const conversations = await this.repository.findConversations({
      userId,
      bookingId,
      status,
      page: Number(page),
      limit: Number(limit),
    });

    return { data: conversations };
  }

  @Get('/conversations/:id')
  async getConversation(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as any;

    // Check org_member scope before accessing conversation
    await this.checkConversationScope(request.userId ?? null, id);

    const result = await this.repository.findConversationById(id);

    if (!result.conversation) {
      reply.code(404);
      return {
        type: 'https://api.digilist.no/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Conversation not found',
      };
    }

    return {
      conversation: result.conversation,
      messages: result.messages.map(m => ({
        ...m,
        senderName: m.senderName || (m.senderType === 'system' ? 'System' : 'Unknown'),
      })),
    };
  }

  @Post('/conversations')
  async createConversation(request: TenantRequest, reply: FastifyReply) {
    const tenantId = request.tenantId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const body = request.body as any;

    const conversation = await this.repository.createConversation({
      tenantId,
      userId: body.userId,
      bookingId: body.bookingId,
      subject: body.subject,
      initialMessage: body.initialMessage,
    });

    reply.code(201);
    return { data: conversation };
  }

  @Post('/conversations/:id/messages')
  async addMessage(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as any;
    const body = request.body as any;

    const message = await this.repository.addMessage({
      conversationId: id,
      senderType: body.senderType || 'admin',
      senderId: body.senderId,
      content: body.content,
      attachments: body.attachments,
    });

    reply.code(201);
    return { data: message };
  }

  @Put('/conversations/:id/read')
  async markAsRead(request: TenantRequest, reply: FastifyReply) {
    const { id } = request.params as any;

    await this.repository.markAsRead(id);

    return { success: true };
  }
}
