/**
 * Conversation Hooks
 * React Query hooks for messaging and conversations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from '../services/conversation.service';
import type { ConversationQueryParams, CreateConversationDTO, SendMessageDTO } from '../types';

// Query keys
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (params?: ConversationQueryParams) => [...conversationKeys.lists(), params] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
  messages: (id: string) => [...conversationKeys.detail(id), 'messages'] as const,
};

/**
 * Get paginated conversations
 */
export function useConversations(params?: ConversationQueryParams) {
  return useQuery({
    queryKey: conversationKeys.list(params),
    queryFn: () => conversationService.getAll(params),
  });
}

/**
 * Get single conversation
 */
export function useConversation(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: conversationKeys.detail(id),
    queryFn: () => conversationService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Get messages for a conversation
 */
export function useMessages(conversationId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: conversationKeys.messages(conversationId),
    queryFn: () => conversationService.getMessages(conversationId),
    enabled: !!conversationId && (options?.enabled ?? true),
  });
}

/**
 * Create conversation mutation
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversationDTO) => conversationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}

/**
 * Send message mutation
 * Accepts { conversationId, data: SendMessageDTO } or { conversationId, content, attachments? }
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { conversationId: string; data?: SendMessageDTO; content?: string; attachments?: string[] }) => {
      const data: SendMessageDTO = input.data || { content: input.content || '', attachments: input.attachments };
      return conversationService.sendMessage(input.conversationId, data);
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}

/**
 * Mark messages as read mutation
 * Accepts either a string ID or { conversationId: string }
 */
export function useMarkMessagesRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: string | { conversationId: string }) => {
      const conversationId = typeof input === 'string' ? input : input.conversationId;
      return conversationService.markAsRead(conversationId);
    },
    onSuccess: (_, input) => {
      const conversationId = typeof input === 'string' ? input : input.conversationId;
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(conversationId) });
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}
