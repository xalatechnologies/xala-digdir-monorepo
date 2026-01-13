/**
 * Conversation Service
 * Handles messaging and conversation operations
 */

import { BaseService } from './base.service';
import type {
  PaginatedResponse,
  Conversation,
  Message,
  CreateConversationDTO,
  SendMessageDTO,
  ConversationQueryParams
} from '../types';

class ConversationService extends BaseService {
  async getAll(params?: ConversationQueryParams): Promise<PaginatedResponse<Conversation>> {
    return this.client.get(this.buildPath(), { params: params as Record<string, string | number | boolean | undefined> });
  }

  async getById(id: string): Promise<{ data: Conversation }> {
    return this.client.get(this.buildPath(`/${id}`));
  }

  async create(data: CreateConversationDTO): Promise<{ data: Conversation }> {
    return this.client.post(this.buildPath(), data);
  }

  async getMessages(conversationId: string): Promise<{ data: Message[] }> {
    return this.client.get(this.buildPath(`/${conversationId}/messages`));
  }

  async sendMessage(conversationId: string, data: SendMessageDTO): Promise<{ data: Message }> {
    return this.client.post(this.buildPath(`/${conversationId}/messages`), data);
  }

  async markAsRead(conversationId: string): Promise<void> {
    return this.client.put(this.buildPath(`/${conversationId}/read`), {});
  }
}

export const conversationService = new ConversationService('/api/conversations');
