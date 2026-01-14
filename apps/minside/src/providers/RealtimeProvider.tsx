/**
 * Realtime Provider
 * Connects to WebSocket and provides realtime functionality to React tree
 */

import { createContext, useContext, type ReactNode } from 'react';
import { 
  useRealtimeConnection,
  useRealtimeBookings,
  useRealtimeListings,
  useRealtimeMessages,
} from '@digilist/client-sdk';

interface RealtimeContextValue {
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextValue>({ isConnected: false });

interface RealtimeProviderProps {
  children: ReactNode;
  /** WebSocket URL - if not provided, realtime is disabled */
  wsUrl?: string;
  /** Tenant ID for multi-tenant filtering */
  tenantId?: string;
}

/**
 * RealtimeProvider - Wraps app to enable real-time updates
 * 
 * @example
 * ```tsx
 * <RealtimeProvider wsUrl="wss://api.digilist.no/ws/events">
 *   <App />
 * </RealtimeProvider>
 * ```
 */
export function RealtimeProvider({ children, wsUrl, tenantId }: RealtimeProviderProps) {
  // Connect to WebSocket
  const isConnected = useRealtimeConnection(wsUrl ? {
    url: wsUrl,
    autoReconnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    ...(tenantId ? { tenantId } : {}),
  } : undefined);

  // Subscribe to domain events - auto-invalidates queries
  useRealtimeBookings();
  useRealtimeListings();
  useRealtimeMessages();

  return (
    <RealtimeContext.Provider value={{ isConnected }}>
      {children}
    </RealtimeContext.Provider>
  );
}

/**
 * Hook to check realtime connection status
 */
export function useRealtimeStatus() {
  return useContext(RealtimeContext);
}
