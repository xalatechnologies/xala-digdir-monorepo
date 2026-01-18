import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { RealtimeProvider, useRealtimeStatus } from '@xala/api/../packages/client-sdk/src/providers/RealtimeProvider';

// Mock the SDK hooks
vi.mock('../../../../packages/client-sdk/src/hooks', () => ({
  useRealtimeConnection: vi.fn(() => false),
  useRealtimeBookings: vi.fn(),
  useRealtimeRentalObjects: vi.fn(),
  useRealtimeMessages: vi.fn(),
  useRealtimeNotifications: vi.fn(),
}));

// Import mocked hooks
import {
  useRealtimeConnection,
  useRealtimeBookings,
  useRealtimeRentalObjects,
  useRealtimeMessages,
  useRealtimeNotifications,
} from '@xala/api/../packages/client-sdk/src/hooks';

// Test component that displays connection status
function StatusConsumer(): React.ReactElement {
  const { isConnected } = useRealtimeStatus();
  return (
    <div>
      <span data-testid="connection-status">{isConnected ? 'connected' : 'disconnected'}</span>
    </div>
  );
}

describe('RealtimeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children', () => {
    render(
      <RealtimeProvider>
        <div data-testid="child">Child content</div>
      </RealtimeProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should provide disconnected status by default', () => {
    render(
      <RealtimeProvider>
        <StatusConsumer />
      </RealtimeProvider>
    );
    expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected');
  });

  it('should provide connected status when connection is established', () => {
    vi.mocked(useRealtimeConnection).mockReturnValue(true);
    
    render(
      <RealtimeProvider wsUrl="wss://api.example.com" tenantId="test-tenant">
        <StatusConsumer />
      </RealtimeProvider>
    );
    expect(screen.getByTestId('connection-status')).toHaveTextContent('connected');
  });

  it('should build WebSocket URL with tenant ID', () => {
    render(
      <RealtimeProvider wsUrl="wss://api.example.com/ws" tenantId="test-tenant-123">
        <StatusConsumer />
      </RealtimeProvider>
    );

    expect(useRealtimeConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'wss://api.example.com/ws/test-tenant-123',
        tenantId: 'test-tenant-123',
      })
    );
  });

  it('should not connect when wsUrl is not provided', () => {
    render(
      <RealtimeProvider tenantId="test-tenant">
        <StatusConsumer />
      </RealtimeProvider>
    );

    expect(useRealtimeConnection).toHaveBeenCalledWith(undefined);
  });

  it('should not connect when tenantId is not provided', () => {
    render(
      <RealtimeProvider wsUrl="wss://api.example.com">
        <StatusConsumer />
      </RealtimeProvider>
    );

    expect(useRealtimeConnection).toHaveBeenCalledWith(undefined);
  });

  it('should subscribe to all event types by default', () => {
    render(
      <RealtimeProvider wsUrl="wss://api.example.com" tenantId="test-tenant">
        <StatusConsumer />
      </RealtimeProvider>
    );

    expect(useRealtimeBookings).toHaveBeenCalled();
    expect(useRealtimeRentalObjects).toHaveBeenCalled();
    expect(useRealtimeMessages).toHaveBeenCalled();
    expect(useRealtimeNotifications).toHaveBeenCalled();
  });

  it('should not subscribe to bookings when subscribeBookings is false', () => {
    render(
      <RealtimeProvider 
        wsUrl="wss://api.example.com" 
        tenantId="test-tenant"
        subscribeBookings={false}
      >
        <StatusConsumer />
      </RealtimeProvider>
    );

    expect(useRealtimeBookings).not.toHaveBeenCalled();
    expect(useRealtimeRentalObjects).toHaveBeenCalled();
  });

  it('should not subscribe to rental objects when subscribeRentalObjects is false', () => {
    render(
      <RealtimeProvider 
        wsUrl="wss://api.example.com" 
        tenantId="test-tenant"
        subscribeRentalObjects={false}
      >
        <StatusConsumer />
      </RealtimeProvider>
    );

    expect(useRealtimeRentalObjects).not.toHaveBeenCalled();
    expect(useRealtimeBookings).toHaveBeenCalled();
  });

  it('should not subscribe to messages when subscribeMessages is false', () => {
    render(
      <RealtimeProvider 
        wsUrl="wss://api.example.com" 
        tenantId="test-tenant"
        subscribeMessages={false}
      >
        <StatusConsumer />
      </RealtimeProvider>
    );

    expect(useRealtimeMessages).not.toHaveBeenCalled();
  });

  it('should not subscribe to notifications when subscribeNotifications is false', () => {
    render(
      <RealtimeProvider 
        wsUrl="wss://api.example.com" 
        tenantId="test-tenant"
        subscribeNotifications={false}
      >
        <StatusConsumer />
      </RealtimeProvider>
    );

    expect(useRealtimeNotifications).not.toHaveBeenCalled();
  });

  it('should configure connection with auto-reconnect settings', () => {
    render(
      <RealtimeProvider wsUrl="wss://api.example.com" tenantId="test-tenant">
        <StatusConsumer />
      </RealtimeProvider>
    );

    expect(useRealtimeConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        autoReconnect: true,
        reconnectInterval: 5000,
        maxReconnectAttempts: 3,
      })
    );
  });
});
