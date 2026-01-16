/**
 * Conversation Service
 * Messaging and conversation management
 */
import { getClient } from '../core/client-factory';

export interface Conversation {
  id: string;
  tenantId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  bookingId?: string;
  subject?: string;
  status: 'active' | 'resolved' | 'archived';
  unreadCount: number;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: 'user' | 'admin' | 'system';
  senderId?: string;
  senderName: string;
  sender?: string;
  content: string;
  readAt?: string;
  attachments?: string[];
  createdAt: string;
}

export interface ConversationQueryParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateConversationDTO {
  userId: string;
  bookingId?: string;
  subject?: string;
}

export interface SendMessageDTO {
  content: string;
  senderType?: 'user' | 'admin';
  senderId?: string;
  attachments?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class ConversationService {
  private basePath = '/api/conversations';

  /**
   * Get all conversations with optional filtering
   * @param params - Query parameters for filtering conversations
   * @param params.status - Filter by conversation status ('active', 'resolved', 'archived')
   * @param params.page - Page number for pagination (default: 1)
   * @param params.limit - Number of items per page (default: 10)
   * @returns Promise<PaginatedResponse<Conversation>> - Paginated list of conversations
   * @example
   * ```ts
   * const conversations = await conversationService.getAll({ status: 'active', page: 1, limit: 20 });
   * console.log(conversations.data); // Array of conversations
   * console.log(conversations.meta.total); // Total count
   * ```
   */
  async getAll(params: ConversationQueryParams = {}): Promise<PaginatedResponse<Conversation>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });
    
    const url = queryParams.toString() 
      ? `${this.basePath}?${queryParams.toString()}`
      : this.basePath;
    
    return getClient().get<PaginatedResponse<Conversation>>(url);
  }

  /**
   * Get single conversation by ID
   * @param id - Conversation ID
   * @returns Promise<{ data: Conversation }> - Single conversation data
   * @example
   * ```ts
   * const conversation = await conversationService.getById('conv-123');
   * console.log(conversation.data.subject);
   * ```
   */
  async getById(id: string): Promise<{ data: Conversation }> {
    return getClient().get<{ data: Conversation }>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new conversation
   * @param data - Conversation creation data
   * @param data.userId - User ID to create conversation for
   * @param data.bookingId - Optional booking ID to associate with conversation
   * @param data.subject - Optional conversation subject/title
   * @returns Promise<{ data: Conversation }> - Newly created conversation
   * @example
   * ```ts
   * const conversation = await conversationService.create({
   *   userId: 'user-123',
   *   bookingId: 'booking-456',
   *   subject: 'Question about booking'
   * });
   * ```
   */
  async create(data: CreateConversationDTO): Promise<{ data: Conversation }> {
    return getClient().post<{ data: Conversation }>(this.basePath, data);
  }

  /**
   * Get messages for a conversation
   * @param conversationId - Conversation ID to fetch messages from
   * @param params - Pagination parameters
   * @param params.page - Page number for pagination (default: 1)
   * @param params.limit - Number of messages per page (default: 50)
   * @returns Promise<PaginatedResponse<Message>> - Paginated list of messages
   * @example
   * ```ts
   * const messages = await conversationService.getMessages('conv-123', { page: 1, limit: 50 });
   * messages.data.forEach(msg => console.log(msg.content));
   * ```
   */
  async getMessages(conversationId: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Message>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', String(params.page));
    if (params.limit) queryParams.set('limit', String(params.limit));
    
    const url = queryParams.toString() 
      ? `${this.basePath}/${conversationId}/messages?${queryParams.toString()}`
      : `${this.basePath}/${conversationId}/messages`;
    
    return getClient().get<PaginatedResponse<Message>>(url);
  }

  /**
   * Send a message in a conversation
   * @param conversationId - Conversation ID to send message to
   * @param data - Message data
   * @param data.content - Message content/text
   * @param data.senderType - Type of sender ('user' or 'admin', default: 'user')
   * @param data.senderId - Optional sender ID
   * @param data.attachments - Optional array of attachment URLs
   * @returns Promise<{ data: Message }> - Newly created message
   * @example
   * ```ts
   * const message = await conversationService.sendMessage('conv-123', {
   *   content: 'Thank you for your help!',
   *   senderType: 'user',
   *   attachments: ['https://example.com/file.pdf']
   * });
   * ```
   */
  async sendMessage(conversationId: string, data: SendMessageDTO): Promise<{ data: Message }> {
    return getClient().post<{ data: Message }>(`${this.basePath}/${conversationId}/messages`, data);
  }

  /**
   * Mark conversation as read
   * Clears the unread count and marks all messages as read
   * @param conversationId - Conversation ID to mark as read
   * @returns Promise<{ data: Conversation }> - Updated conversation with unreadCount set to 0
   * @example
   * ```ts
   * await conversationService.markAsRead('conv-123');
   * ```
   */
  async markAsRead(conversationId: string): Promise<{ data: Conversation }> {
    return getClient().put<{ data: Conversation }>(`${this.basePath}/${conversationId}/read`);
  }

  /**
   * Resolve/close a conversation
   * Sets conversation status to 'resolved'
   * @param conversationId - Conversation ID to resolve
   * @returns Promise<{ data: Conversation }> - Updated conversation with status 'resolved'
   * @example
   * ```ts
   * await conversationService.resolve('conv-123');
   * ```
   */
  async resolve(conversationId: string): Promise<{ data: Conversation }> {
    return getClient().put<{ data: Conversation }>(`${this.basePath}/${conversationId}/resolve`);
  }

  /**
   * Reopen a closed conversation
   * Changes conversation status from 'resolved' back to 'active'
   * @param conversationId - Conversation ID to reopen
   * @returns Promise<{ data: Conversation }> - Updated conversation with status 'active'
   * @example
   * ```ts
   * await conversationService.reopen('conv-123');
   * ```
   */
  async reopen(conversationId: string): Promise<{ data: Conversation }> {
    return getClient().put<{ data: Conversation }>(`${this.basePath}/${conversationId}/reopen`);
  }

  /**
   * Assign a conversation to a user/admin
   * Routes the conversation to a specific admin or team member
   * @param conversationId - Conversation ID to assign
   * @param assigneeId - User/Admin ID to assign conversation to
   * @returns Promise<{ data: Conversation }> - Updated conversation with assignee information
   * @example
   * ```ts
   * await conversationService.assign('conv-123', 'admin-456');
   * ```
   */
  async assign(conversationId: string, assigneeId: string): Promise<{ data: Conversation }> {
    return getClient().put<{ data: Conversation }>(`${this.basePath}/${conversationId}/assign`, { assigneeId });
  }

  /**
   * Get unread conversation count
   * Returns the total number of conversations with unread messages for the current user
   * @returns Promise<{ data: { count: number } }> - Object containing unread count
   * @example
   * ```ts
   * const { data } = await conversationService.getUnreadCount();
   * console.log(`You have ${data.count} unread conversations`);
   * ```
   */
  async getUnreadCount(): Promise<{ data: { count: number } }> {
    return getClient().get<{ data: { count: number } }>(`${this.basePath}/unread-count`);
  }
}

export const conversationService = new ConversationService();
