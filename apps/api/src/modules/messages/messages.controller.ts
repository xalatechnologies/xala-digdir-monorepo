/**
 * Messages Controller
 * Manages conversations and messages between users and admins
 * 
 * Uses repository pattern for clean separation:
 * - Repository handles data access (no direct schema imports)
 */
import { Controller, Get, Post, Put } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { getMessagesRepository } from './messages.repository';

interface TenantRequest extends FastifyRequest {
  tenantId?: string | null;
  userId?: string | null;
}

@Controller('/api/messages')
export class MessagesController {
  private readonly repository = getMessagesRepository();

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
