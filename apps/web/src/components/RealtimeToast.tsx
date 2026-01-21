/**
 * Realtime Toast
 *
 * Shows toast notifications for realtime events.
 * Automatically subscribes to booking and notification events.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Paragraph, CheckCircleIcon, InfoIcon, XCircleIcon, CloseIcon, AlertTriangleIcon } from '@xalatechnologies/platform/ui';
import { useRealtimeBooking, useRealtimeNotification, useRealtimeStatus, useRealtimeSlotAvailability } from '../providers';
import type { RealtimeEvent } from '@digilist/client-sdk';
import { useT } from '@xalatechnologies/platform/i18n';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: Date;
}

export function RealtimeToast(): React.ReactElement {
  const t = useT();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { isConnected, status } = useRealtimeStatus();

  // Auto-dismiss toasts after 5 seconds
  useEffect(() => {
    if (toasts.length === 0) return;

    const timer = setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 5000);

    return () => clearTimeout(timer);
  }, [toasts]);

  // Add toast
  const addToast = useCallback((toast: Omit<Toast, 'id' | 'timestamp'>) => {
    const newToast: Toast = {
      ...toast,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setToasts(prev => [...prev.slice(-4), newToast]); // Keep max 5 toasts
  }, []);

  // Remove toast
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Handle booking events
  const handleBookingEvent = useCallback((event: RealtimeEvent) => {
    const data = event.data as { action?: string; listingName?: string; userName?: string } | undefined;

    switch (data?.action) {
      case 'created':
        addToast({
          type: 'success',
          title: t('ny.booking'),
          message: data.listingName ? `Booking opprettet for ${data.listingName}` : 'En ny booking ble opprettet',
        });
        break;
      case 'confirmed':
        addToast({
          type: 'success',
          title: t('booking.bekreftet'),
          message: data.listingName ? `Booking for ${data.listingName} er bekreftet` : t('booking.bekreftet'),
        });
        break;
      case 'cancelled':
        addToast({
          type: 'warning',
          title: t('booking.kansellert'),
          message: data.listingName ? `Booking for ${data.listingName} er kansellert` : t('booking.kansellert'),
        });
        break;
      case 'updated':
        addToast({
          type: 'info',
          title: t('booking.oppdatert'),
          message: data.listingName ? `Booking for ${data.listingName} er oppdatert` : t('booking.oppdatert'),
        });
        break;
      default:
        addToast({
          type: 'info',
          title: t('bookinghendelse'),
          message: event.message || 'En booking-hendelse har skjedd',
        });
    }
  }, [addToast]);

  // Handle notification events
  const handleNotificationEvent = useCallback((event: RealtimeEvent) => {
    const data = event.data as { title?: string; body?: string; type?: string } | undefined;
    const message = data?.body ?? event.message;

    addToast({
      type: (data?.type as Toast['type']) || 'info',
      title: data?.title || 'Varsel',
      ...(message && { message }),
    });
  }, [addToast]);

  // Handle slot unavailability events
  const handleSlotUnavailable = useCallback((event: RealtimeEvent) => {
    const data = event.data as {
      action?: string;
      listingName?: string;
      startTime?: string;
      endTime?: string;
      date?: string;
    } | undefined;

    // Format time and date for better user experience
    const formatTime = (time?: string) => {
      if (!time) return '';
      return time.substring(0, 5); // HH:MM format
    };

    const formatDate = (dateStr?: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      if (targetDate.getTime() === today.getTime()) {
        return 'i dag';
      }

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      if (targetDate.getTime() === tomorrow.getTime()) {
        return 'i morgen';
      }

      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
      return date.toLocaleDateString('nb-NO', options);
    };

    const timeSlot =
      data?.startTime && data?.endTime
        ? `${formatTime(data.startTime)}-${formatTime(data.endTime)}`
        : '';
    const dateInfo = formatDate(data?.date);
    const listingName = data?.listingName || 'et lokale';

    let message = `${listingName}`;
    if (dateInfo && timeSlot) {
      message += ` (${dateInfo}, ${timeSlot})`;
    } else if (timeSlot) {
      message += ` (${timeSlot})`;
    }

    addToast({
      type: 'warning',
      title: t('status.available'),
      message: message,
    });
  }, [addToast]);

  // Subscribe to realtime events
  useRealtimeBooking(handleBookingEvent);
  useRealtimeNotification(handleNotificationEvent);
  useRealtimeSlotAvailability(undefined, handleSlotUnavailable);

  // Show connection status toast on disconnect
  useEffect(() => {
    if (status === 'error') {
      addToast({
        type: 'error',
        title: t('tilkobling.tapt'),
        message: t('common.sanntidsoppdateringer_er_utilgjengelig'),
      });
    }
  }, [status, addToast]);

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon size={20} />;
      case 'error':
        return <XCircleIcon size={20} />;
      case 'warning':
        return <AlertTriangleIcon size={20} />;
      default:
        return <InfoIcon size={20} />;
    }
  };

  const getColors = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'var(--ds-color-success-surface-default)',
          border: 'var(--ds-color-success-border-default)',
          icon: 'var(--ds-color-success-base-default)',
        };
      case 'error':
        return {
          bg: 'var(--ds-color-danger-surface-default)',
          border: 'var(--ds-color-danger-border-default)',
          icon: 'var(--ds-color-danger-base-default)',
        };
      case 'warning':
        return {
          bg: 'var(--ds-color-warning-surface-default)',
          border: 'var(--ds-color-warning-border-default)',
          icon: 'var(--ds-color-warning-base-default)',
        };
      default:
        return {
          bg: 'var(--ds-color-info-surface-default)',
          border: 'var(--ds-color-info-border-default)',
          icon: 'var(--ds-color-info-base-default)',
        };
    }
  };

  if (toasts.length === 0) return <></>;

  return (
    <div
      role="region"
      aria-label={t('varsler')}
      aria-live="polite"
      aria-atomic="false"
      style={{
        position: 'fixed',
        bottom: 'var(--ds-spacing-6)',
        right: 'var(--ds-spacing-6)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-3)',
        maxWidth: '380px',
        width: '100%',
      }}
    >
      {toasts.map((toast) => {
        const colors = getColors(toast.type);
        return (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
            style={{
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: 'var(--ds-border-radius-md)',
              padding: 'var(--ds-spacing-4)',
              boxShadow: 'var(--ds-shadow-md)',
              display: 'flex',
              gap: 'var(--ds-spacing-3)',
              alignItems: 'flex-start',
              animation: 'slideIn 0.3s ease-out',
            }}
          >
            <div style={{ color: colors.icon, flexShrink: 0, marginTop: '2px' }}>
              {getIcon(toast.type)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Paragraph
                data-size="sm"
                style={{
                  fontWeight: 'var(--ds-font-weight-medium)',
                  margin: 0,
                  color: 'var(--ds-color-neutral-text-default)',
                }}
              >
                {toast.title}
              </Paragraph>
              {toast.message && (
                <Paragraph
                  data-size="xs"
                  style={{
                    margin: 0,
                    marginTop: 'var(--ds-spacing-1)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {toast.message}
                </Paragraph>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: 'var(--ds-spacing-1)',
                cursor: 'pointer',
                color: 'var(--ds-color-neutral-text-subtle)',
                flexShrink: 0,
              }}
              aria-label={t('lukk.varsel')}
            >
              <CloseIcon size={16} />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default RealtimeToast;
