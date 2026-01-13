/**
 * Real-time Client Adapter
 *
 * Interface for WebSocket-based real-time updates.
 * Vendor-agnostic - can be implemented with any WebSocket provider.
 */

import type { RealtimeEvent, RealtimeEventType } from '../types';

// =============================================================================
// Adapter Interface
// =============================================================================

export type RealtimeEventHandler = (event: RealtimeEvent) => void;

export interface RealtimeClient {
  /**
   * Connect to the real-time service
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the real-time service
   */
  disconnect(): void;

  /**
   * Subscribe to a listing's updates
   */
  subscribe(listingId: string, handler: RealtimeEventHandler): () => void;

  /**
   * Check connection status
   */
  isConnected(): boolean;
}

// =============================================================================
// Mock Implementation (for development)
// =============================================================================

/**
 * Mock real-time client that simulates WebSocket behavior
 * Replace with actual WebSocket implementation in production
 */
class MockRealtimeClient implements RealtimeClient {
  private connected = false;
  private subscriptions = new Map<string, Set<RealtimeEventHandler>>();

  async connect(): Promise<void> {
    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.connected = true;
    
    if (import.meta.env.DEV) {
      console.log('[REALTIME] Connected (mock)');
    }
  }

  disconnect(): void {
    this.connected = false;
    this.subscriptions.clear();
    
    if (import.meta.env.DEV) {
      console.log('[REALTIME] Disconnected (mock)');
    }
  }

  subscribe(listingId: string, handler: RealtimeEventHandler): () => void {
    const topic = `listing:${listingId}`;
    
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
    }
    
    this.subscriptions.get(topic)!.add(handler);
    
    if (import.meta.env.DEV) {
      console.log('[REALTIME] Subscribed to', topic);
    }

    // Return unsubscribe function
    return () => {
      const handlers = this.subscriptions.get(topic);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.subscriptions.delete(topic);
        }
      }
      
      if (import.meta.env.DEV) {
        console.log('[REALTIME] Unsubscribed from', topic);
      }
    };
  }

  isConnected(): boolean {
    return this.connected;
  }

  // For testing: simulate receiving an event
  simulateEvent(listingId: string, type: RealtimeEventType, payload: unknown): void {
    const topic = `listing:${listingId}`;
    const handlers = this.subscriptions.get(topic);
    
    if (handlers) {
      const event: RealtimeEvent = {
        type,
        listingId,
        payload,
        timestamp: new Date().toISOString(),
      };
      
      handlers.forEach((handler) => handler(event));
    }
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let realtimeClientInstance: RealtimeClient | null = null;

export function getRealtimeClient(): RealtimeClient {
  if (!realtimeClientInstance) {
    realtimeClientInstance = new MockRealtimeClient();
  }
  return realtimeClientInstance;
}

export function setRealtimeClient(client: RealtimeClient): void {
  realtimeClientInstance = client;
}

// =============================================================================
// React Hook for Real-time Updates
// =============================================================================

import { useEffect, useCallback, useState } from 'react';

export interface UseRealtimeResult {
  isConnected: boolean;
  lastEvent: RealtimeEvent | null;
}

export function useRealtimeUpdates(
  listingId: string,
  onUpdate?: (event: RealtimeEvent) => void
): UseRealtimeResult {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);

  const handleEvent = useCallback(
    (event: RealtimeEvent) => {
      setLastEvent(event);
      onUpdate?.(event);
    },
    [onUpdate]
  );

  useEffect(() => {
    const client = getRealtimeClient();

    // Connect if not already connected
    if (!client.isConnected()) {
      client.connect().then(() => {
        setIsConnected(true);
      });
    } else {
      setIsConnected(true);
    }

    // Subscribe to listing updates
    const unsubscribe = client.subscribe(listingId, handleEvent);

    return () => {
      unsubscribe();
    };
  }, [listingId, handleEvent]);

  return { isConnected, lastEvent };
}
