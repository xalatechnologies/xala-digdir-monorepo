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
   */
  async getById(id: string): Promise<{ data: Conversation }> {
    return getClient().get<{ data: Conversation }>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new conversation
   */
  async create(data: CreateConversationDTO): Promise<{ data: Conversation }> {
    return getClient().post<{ data: Conversation }>(this.basePath, data);
  }

  /**
   * Get messages for a conversation
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
   */
  async sendMessage(conversationId: string, data: SendMessageDTO): Promise<{ data: Message }> {
    return getClient().post<{ data: Message }>(`${this.basePath}/${conversationId}/messages`, data);
  }

  /**
   * Mark conversation as read
   */
  async markAsRead(conversationId: string): Promise<{ data: Conversation }> {
    return getClient().put<{ data: Conversation }>(`${this.basePath}/${conversationId}/read`);
  }

  /**
   * Resolve/close a conversation
   */
  async resolve(conversationId: string): Promise<{ data: Conversation }> {
    return getClient().put<{ data: Conversation }>(`${this.basePath}/${conversationId}/resolve`);
  }

  /**
   * Reopen a closed conversation
   */
  async reopen(conversationId: string): Promise<{ data: Conversation }> {
    return getClient().put<{ data: Conversation }>(`${this.basePath}/${conversationId}/reopen`);
  }

  /**
   * Get unread conversation count
   */
  async getUnreadCount(): Promise<{ data: { count: number } }> {
    return getClient().get<{ data: { count: number } }>(`${this.basePath}/unread-count`);
  }
}

export const conversationService = new ConversationService();
