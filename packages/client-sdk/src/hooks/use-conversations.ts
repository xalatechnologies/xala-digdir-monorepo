/**
 * Conversation Hooks
 * React Query hooks for messaging/conversation functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  conversationService, 
  type Conversation, 
  type Message,
  type CreateConversationDTO,
  type SendMessageDTO,
} from '../services/conversation.service';

// =============================================================================
// Query Keys
// =============================================================================

export const conversationKeys = {
  all: ['conversations'] as const,
  list: (params?: Record<string, unknown>) => [...conversationKeys.all, 'list', params] as const,
  detail: (id: string) => [...conversationKeys.all, 'detail', id] as const,
  messages: (conversationId: string) => [...conversationKeys.all, 'messages', conversationId] as const,
  unreadCount: () => [...conversationKeys.all, 'unread-count'] as const,
};

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Fetch all conversations for the current user
 */
export function useConversations(params?: { status?: string; limit?: number }) {
  return useQuery({
    queryKey: conversationKeys.list(params),
    queryFn: () => conversationService.getAll(params),
    staleTime: 60 * 1000, // 1 minute - conversations are active communication
    refetchInterval: 30000, // Poll every 30 seconds
    refetchIntervalInBackground: false,
  });
}

/**
 * Fetch a single conversation by ID
 */
export function useConversation(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: conversationKeys.detail(id),
    queryFn: () => conversationService.getById(id),
    staleTime: 60 * 1000, // 1 minute - single conversation
    enabled: !!id && (options?.enabled ?? true),
  });
}

/**
 * Fetch messages for a conversation
 */
export function useMessages(conversationId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: conversationKeys.messages(conversationId),
    queryFn: () => conversationService.getMessages(conversationId),
    staleTime: 30 * 1000, // 30 seconds - messages need to be fresh
    enabled: !!conversationId && (options?.enabled ?? true),
    refetchInterval: 10000, // Poll every 10 seconds when viewing
    refetchIntervalInBackground: false,
  });
}

/**
 * Get unread message count
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: conversationKeys.unreadCount(),
    queryFn: () => conversationService.getUnreadCount(),
    staleTime: 30 * 1000, // 30 seconds - unread count is important for UX
    refetchInterval: 60000, // Poll every minute
    refetchIntervalInBackground: true,
  });
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Create a new conversation
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversationDTO) => conversationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}

/**
 * Send a message to a conversation
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, content, senderType }: { conversationId: string; content: string; senderType?: 'user' | 'admin' }) =>
      conversationService.sendMessage(conversationId, { content, senderType }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: conversationKeys.messages(variables.conversationId) 
      });
      queryClient.invalidateQueries({ queryKey: conversationKeys.list() });
    },
  });
}

/**
 * Mark messages as read
 */
export function useMarkMessagesRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => conversationService.markAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ 
        queryKey: conversationKeys.messages(conversationId) 
      });
      queryClient.invalidateQueries({ queryKey: conversationKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: conversationKeys.list() });
    },
  });
}

/**
 * Resolve/close a conversation
 */
export function useResolveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => conversationService.resolve(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}

/**
 * Reopen a closed conversation
 */
export function useReopenConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => conversationService.reopen(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}

/**
 * Assign a conversation to a user/admin
 */
export function useAssignConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, assigneeId }: { conversationId: string; assigneeId: string }) => 
      conversationService.assign(conversationId, assigneeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}

// Re-export types for convenience
export type { Conversation, Message, CreateConversationDTO, SendMessageDTO };

