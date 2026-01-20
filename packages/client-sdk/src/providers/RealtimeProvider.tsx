/**
 * Realtime Provider
 * Connects to WebSocket and provides realtime functionality to React tree
 */

import { createContext, useContext, type ReactNode } from 'react';
import {
  useRealtimeConnection,
  useRealtimeBookings,
  useRealtimeRentalObjects,
  useRealtimeMessages,
  useRealtimeNotifications,
} from '@/hooks';

export interface RealtimeContextValue {
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextValue>({ isConnected: false });

export interface RealtimeProviderProps {
  children: ReactNode;
  /** WebSocket URL - if not provided, realtime is disabled */
  wsUrl?: string;
  /** Tenant ID for multi-tenant filtering */
  tenantId?: string;
  /** Subscribe to booking events (default: true) */
  subscribeBookings?: boolean;
  /** Subscribe to rental object events (default: true) */
  subscribeRentalObjects?: boolean;
  /** Subscribe to message events (default: true) */
  subscribeMessages?: boolean;
  /** Subscribe to notification events (default: true) */
  subscribeNotifications?: boolean;
}

/**
 * RealtimeProvider - Wraps app to enable real-time updates
 * 
 * @example
 * ```tsx
 * <RealtimeProvider wsUrl="wss://api.digilist.no" tenantId="f47ac10b...">
 *   <App />
 * </RealtimeProvider>
 * ```
 */
export function RealtimeProvider({ 
  children, 
  wsUrl, 
  tenantId,
  subscribeBookings = true,
  subscribeRentalObjects = true,
  subscribeMessages = true,
  subscribeNotifications = true,
}: RealtimeProviderProps): React.ReactElement {
  // Build full WebSocket URL with tenant ID suffix
  // Expects wsUrl like "wss://api.digilist.no/ws/events" and appends /{tenantId}
  const fullWsUrl = wsUrl && tenantId 
    ? `${wsUrl}/${tenantId}` 
    : undefined;
  
  // Connect to WebSocket
  const isConnected = useRealtimeConnection(fullWsUrl ? {
    url: fullWsUrl,
    autoReconnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 3,
    ...(tenantId ? { tenantId } : {}),
  } : undefined);

  // Subscribe to domain events - auto-invalidates queries
  if (subscribeBookings) {
    useRealtimeBookings();
  }
  if (subscribeRentalObjects) {
    useRealtimeRentalObjects();
  }
  if (subscribeMessages) {
    useRealtimeMessages();
  }
  if (subscribeNotifications) {
    useRealtimeNotifications();
  }

  return (
    <RealtimeContext.Provider value={{ isConnected }}>
      {children}
    </RealtimeContext.Provider>
  );
}

/**
 * Hook to check realtime connection status
 */
export function useRealtimeStatus(): RealtimeContextValue {
  return useContext(RealtimeContext);
}
