/**
 * Conversation Hooks
 * React Query hooks for messaging and conversations
 * With real-time support via polling and event subscriptions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
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
  unreadCount: () => [...conversationKeys.all, 'unread'] as const,
};

// =============================================================================
// Real-time Event System
// =============================================================================

type MessageEventHandler = (event: MessageEvent) => void;
type MessageEvent = {
  type: 'new_message' | 'message_read' | 'conversation_update';
  conversationId: string;
  data?: unknown;
};

class MessageEventEmitter {
  private handlers = new Set<MessageEventHandler>();

  subscribe(handler: MessageEventHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  emit(event: MessageEvent): void {
    this.handlers.forEach((handler) => handler(event));
  }
}

// Global event emitter for cross-component communication
export const messageEvents = new MessageEventEmitter();

// =============================================================================
// Core Hooks
// =============================================================================

/**
 * Get paginated conversations with real-time polling
 */
export function useConversations(params?: ConversationQueryParams) {
  return useQuery({
    queryKey: conversationKeys.list(params),
    queryFn: () => conversationService.getAll(params),
    refetchInterval: 30000, // Poll every 30 seconds
    refetchIntervalInBackground: false,
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
 * Get messages for a conversation with real-time polling
 */
export function useMessages(conversationId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: conversationKeys.messages(conversationId),
    queryFn: () => conversationService.getMessages(conversationId),
    enabled: !!conversationId && (options?.enabled ?? true),
    refetchInterval: 10000, // Poll every 10 seconds when viewing
    refetchIntervalInBackground: false,
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
 * Send message mutation with real-time event emission
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { conversationId: string; data?: SendMessageDTO; content?: string; attachments?: string[] }) => {
      const data: SendMessageDTO = input.data || { content: input.content || '', attachments: input.attachments };
      return conversationService.sendMessage(input.conversationId, data);
    },
    onSuccess: (_, { conversationId }) => {
      // Invalidate caches
      queryClient.invalidateQueries({ queryKey: conversationKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: conversationKeys.unreadCount() });
      
      // Emit real-time event for other components
      messageEvents.emit({
        type: 'new_message',
        conversationId,
      });
    },
  });
}

/**
 * Mark messages as read mutation
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
      queryClient.invalidateQueries({ queryKey: conversationKeys.unreadCount() });
      
      // Emit read event
      messageEvents.emit({
        type: 'message_read',
        conversationId,
      });
    },
  });
}

// =============================================================================
// Real-time Hooks
// =============================================================================

/**
 * Get total unread message count for notification bells
 */
export function useUnreadCount() {
  const { data } = useConversations();
  const conversations = data?.data ?? [];
  
  return conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
}

/**
 * Subscribe to real-time message events
 */
export function useMessageSubscription(
  conversationId: string | null,
  onNewMessage?: () => void
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = messageEvents.subscribe((event) => {
      if (event.conversationId === conversationId) {
        queryClient.invalidateQueries({ 
          queryKey: conversationKeys.messages(conversationId) 
        });
        onNewMessage?.();
      }
    });

    return unsubscribe;
  }, [conversationId, queryClient, onNewMessage]);
}

/**
 * Hook for real-time messages with auto-refresh
 */
export function useRealtimeMessages(conversationId: string, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();
  const lastMessageCountRef = useRef(0);

  const query = useQuery({
    queryKey: conversationKeys.messages(conversationId),
    queryFn: () => conversationService.getMessages(conversationId),
    enabled: !!conversationId && (options?.enabled ?? true),
    refetchInterval: 5000, // Poll every 5 seconds for active chat
    refetchIntervalInBackground: false,
  });

  // Detect new messages
  useEffect(() => {
    const messages = query.data?.data ?? [];
    if (messages.length > lastMessageCountRef.current && lastMessageCountRef.current > 0) {
      messageEvents.emit({
        type: 'new_message',
        conversationId,
        data: messages[messages.length - 1],
      });
    }
    lastMessageCountRef.current = messages.length;
  }, [query.data, conversationId]);

  // Subscribe to external events
  useEffect(() => {
    const unsubscribe = messageEvents.subscribe((event) => {
      if (event.conversationId === conversationId && event.type === 'new_message') {
        queryClient.invalidateQueries({ 
          queryKey: conversationKeys.messages(conversationId) 
        });
      }
    });
    return unsubscribe;
  }, [conversationId, queryClient]);

  return query;
}

/**
 * Hook for notification bell with real-time updates
 */
export function useNotifications() {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useConversations();
  
  const conversations = data?.data ?? [];
  const unreadCount = conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
  const hasUnread = unreadCount > 0;

  // Subscribe to message events for instant updates
  useEffect(() => {
    const unsubscribe = messageEvents.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    });
    return unsubscribe;
  }, [queryClient]);

  return {
    unreadCount,
    hasUnread,
    isLoading,
    refetch,
    conversations,
  };
}
