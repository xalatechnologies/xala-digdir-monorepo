/**
 * Conversations & Messages Hooks
 * React Query hooks for messaging endpoints
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConversations,
  getConversation,
  getMessages,
  createConversation,
  sendMessage,
  resolveConversation,
  markMessagesRead,
} from '../services/api';
import type {
  Conversation,
  Message,
  ConversationQueryParams,
  MessageQueryParams,
  CreateConversationDTO,
  CreateMessageDTO,
  PaginatedResponse,
  SingleResponse,
} from '../types/api';

// =============================================================================
// Query Keys
// =============================================================================

export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (params?: ConversationQueryParams) => [...conversationKeys.lists(), params] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
  messages: (conversationId: string) => [...conversationKeys.all, conversationId, 'messages'] as const,
  messageList: (params: MessageQueryParams) => [...conversationKeys.messages(params.conversationId), params] as const,
};

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Fetch all conversations with optional filtering
 */
export function useConversations(params?: ConversationQueryParams) {
  return useQuery<PaginatedResponse<Conversation>>({
    queryKey: conversationKeys.list(params),
    queryFn: () => getConversations(params),
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for new messages
  });
}

/**
 * Fetch a single conversation by ID
 */
export function useConversation(id: string, enabled = true) {
  return useQuery<SingleResponse<Conversation>>({
    queryKey: conversationKeys.detail(id),
    queryFn: () => getConversation(id),
    enabled: enabled && !!id,
  });
}

/**
 * Fetch messages for a conversation
 */
export function useMessages(params: MessageQueryParams, enabled = true) {
  return useQuery<PaginatedResponse<Message>>({
    queryKey: conversationKeys.messageList(params),
    queryFn: () => getMessages(params),
    enabled: enabled && !!params.conversationId,
    refetchInterval: 1000 * 10, // Refetch every 10 seconds for real-time feel
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
    mutationFn: (data: CreateConversationDTO) => createConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}

/**
 * Send a message in a conversation
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMessageDTO) => sendMessage(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.messages(data.conversationId) });
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}

/**
 * Mark a conversation as resolved
 */
export function useResolveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resolveConversation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(id) });
    },
  });
}

/**
 * Mark messages in a conversation as read
 */
export function useMarkMessagesRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => markMessagesRead(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(conversationId) });
    },
  });
}
