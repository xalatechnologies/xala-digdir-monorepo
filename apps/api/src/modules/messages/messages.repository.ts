/**
 * Messages Repository
 * 
 * Data access layer for conversations and messages.
 * Encapsulates all database operations for messaging.
 * Controllers should use this instead of direct schema imports.
 */

import { container } from '../../core/container';
import { eq, and, desc, isNull, sql, type SQL } from 'drizzle-orm';
import { conversations, messages, users } from '../../database/schema/index';

// =============================================================================
// Types
// =============================================================================

export interface ConversationRecord {
  id: string;
  tenantId: string;
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  bookingId: string | null;
  subject: string | null;
  status: string;
  unreadCount: number;
  lastMessageAt: Date | null;
  createdAt: Date;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  senderType: string;
  senderId: string | null;
  senderName?: string | null;
  content: string;
  attachments: unknown[] | null;
  readAt: Date | null;
  createdAt: Date;
}

export interface CreateConversationInput {
  tenantId: string;
  userId: string;
  bookingId?: string;
  subject?: string;
  initialMessage?: string;
}

export interface CreateMessageInput {
  conversationId: string;
  senderType: 'user' | 'admin' | 'system';
  senderId?: string;
  content: string;
  attachments?: unknown[];
}

export interface ConversationQueryParams {
  userId?: string;
  bookingId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// =============================================================================
// Repository Class
// =============================================================================

export class MessagesRepository {
  private getDb() {
    return container.resolve<any>('Database');
  }

  /**
   * Find all conversations with optional filtering
   */
  async findConversations(params: ConversationQueryParams = {}): Promise<ConversationRecord[]> {
    const db = this.getDb();
    const { userId, bookingId, status, page = 1, limit = 20 } = params;

    const conditions: SQL[] = [];
    if (userId) conditions.push(eq(conversations.userId, userId));
    if (bookingId) conditions.push(eq(conversations.bookingId, bookingId));
    if (status) conditions.push(eq(conversations.status, status));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select({
        id: conversations.id,
        tenantId: conversations.tenantId,
        userId: conversations.userId,
        userName: users.displayName,
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
      .where(whereClause)
      .orderBy(desc(conversations.lastMessageAt))
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit));

    return result;
  }

  /**
   * Find conversation by ID with messages
   */
  async findConversationById(id: string): Promise<{
    conversation: ConversationRecord | null;
    messages: MessageRecord[];
  }> {
    const db = this.getDb();

    const conversationResult = await db
      .select({
        id: conversations.id,
        tenantId: conversations.tenantId,
        userId: conversations.userId,
        userName: users.displayName,
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
      return { conversation: null, messages: [] };
    }

    const messageResults = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderType: messages.senderType,
        senderId: messages.senderId,
        senderName: users.displayName,
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
      messages: messageResults,
    };
  }

  /**
   * Create a new conversation
   */
  async createConversation(input: CreateConversationInput): Promise<ConversationRecord> {
    const db = this.getDb();

    const result = await db
      .insert(conversations)
      .values({
        tenantId: input.tenantId,
        userId: input.userId,
        bookingId: input.bookingId || null,
        subject: input.subject || null,
        status: 'active',
      })
      .returning();

    const conversation = result[0];

    // Add initial message if provided
    if (input.initialMessage) {
      await db
        .insert(messages)
        .values({
          conversationId: conversation.id,
          senderType: 'user',
          senderId: input.userId,
          content: input.initialMessage,
        });

      await db
        .update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, conversation.id));
    }

    return {
      ...conversation,
      userName: null,
      userEmail: null,
    };
  }

  /**
   * Add message to conversation
   */
  async addMessage(input: CreateMessageInput): Promise<MessageRecord> {
    const db = this.getDb();

    const result = await db
      .insert(messages)
      .values({
        conversationId: input.conversationId,
        senderType: input.senderType,
        senderId: input.senderId || null,
        content: input.content,
        attachments: input.attachments || [],
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
      .where(eq(conversations.id, input.conversationId));

    return {
      ...result[0],
      senderName: null,
    };
  }

  /**
   * Mark conversation as read
   */
  async markAsRead(conversationId: string): Promise<void> {
    const db = this.getDb();

    await db
      .update(messages)
      .set({ readAt: new Date() })
      .where(and(eq(messages.conversationId, conversationId), isNull(messages.readAt)));

    await db
      .update(conversations)
      .set({ unreadCount: 0 })
      .where(eq(conversations.id, conversationId));
  }

  /**
   * Update conversation status
   */
  async updateConversationStatus(id: string, status: string): Promise<ConversationRecord | null> {
    const db = this.getDb();

    const result = await db
      .update(conversations)
      .set({ status, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();

    return result[0] || null;
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let repositoryInstance: MessagesRepository | null = null;

export function getMessagesRepository(): MessagesRepository {
  if (!repositoryInstance) {
    repositoryInstance = new MessagesRepository();
  }
  return repositoryInstance;
}
