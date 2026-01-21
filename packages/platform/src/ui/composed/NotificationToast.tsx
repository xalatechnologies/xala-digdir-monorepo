/**
 * NotificationToast Component
 *
 * Toast notifications with queue management and auto-dismiss.
 * SSR-safe with 'use client' directive.
 *
 * @module @xalatechnologies/platform/ui/composed/NotificationToast
 */

'use client';

import React, { useState, useCallback, useEffect, createContext, useContext, type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: { label: string; onClick: () => void };
}

export interface ToastOptions extends Omit<Toast, 'id'> {}

export interface ToastContextValue {
  toasts: Toast[];
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
  defaultDuration?: number;
}

export interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
}

// =============================================================================
// Icons
// =============================================================================

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// =============================================================================
// Styles
// =============================================================================

const typeStyles: Record<ToastType, { bg: string; border: string; icon: string; iconComponent: ReactNode }> = {
  success: {
    bg: 'var(--ds-color-success-surface-subtle)',
    border: 'var(--ds-color-success-border-default)',
    icon: 'var(--ds-color-success-text-default)',
    iconComponent: <CheckCircleIcon />,
  },
  error: {
    bg: 'var(--ds-color-danger-surface-subtle)',
    border: 'var(--ds-color-danger-border-default)',
    icon: 'var(--ds-color-danger-text-default)',
    iconComponent: <XCircleIcon />,
  },
  warning: {
    bg: 'var(--ds-color-warning-surface-subtle)',
    border: 'var(--ds-color-warning-border-default)',
    icon: 'var(--ds-color-warning-text-default)',
    iconComponent: <AlertTriangleIcon />,
  },
  info: {
    bg: 'var(--ds-color-info-surface-subtle)',
    border: 'var(--ds-color-info-border-default)',
    icon: 'var(--ds-color-info-text-default)',
    iconComponent: <InfoIcon />,
  },
};

const positionStyles: Record<ToastPosition, React.CSSProperties> = {
  'top-right': { top: 'var(--ds-spacing-4)', right: 'var(--ds-spacing-4)' },
  'top-left': { top: 'var(--ds-spacing-4)', left: 'var(--ds-spacing-4)' },
  'bottom-right': { bottom: 'var(--ds-spacing-4)', right: 'var(--ds-spacing-4)' },
  'bottom-left': { bottom: 'var(--ds-spacing-4)', left: 'var(--ds-spacing-4)' },
  'top-center': { top: 'var(--ds-spacing-4)', left: '50%', transform: 'translateX(-50%)' },
  'bottom-center': { bottom: 'var(--ds-spacing-4)', left: '50%', transform: 'translateX(-50%)' },
};

// =============================================================================
// Context
// =============================================================================

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// =============================================================================
// ToastItem Component
// =============================================================================

function ToastItem({ toast, onDismiss }: ToastItemProps): React.ReactElement {
  const styles = typeStyles[toast.type];
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onDismiss, 200);
      }, toast.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, onDismiss]);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(onDismiss, 200);
  }, [onDismiss]);

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--ds-spacing-3)',
        padding: 'var(--ds-spacing-4)',
        backgroundColor: styles.bg,
        borderWidth: 'var(--ds-border-width-default)',
        borderStyle: 'solid',
        borderColor: styles.border,
        borderRadius: 'var(--ds-border-radius-lg)',
        boxShadow: 'var(--ds-shadow-lg)',
        minWidth: 'var(--ds-sizing-70)',
        maxWidth: 'var(--ds-sizing-100)',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'translateX(100%)' : 'translateX(0)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}
    >
      <div style={{ color: styles.icon, flexShrink: 0 }}>{styles.iconComponent}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 'var(--ds-font-size-sm)',
            fontWeight: 'var(--ds-font-weight-semibold)',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          {toast.title}
        </p>
        {toast.message && (
          <p
            style={{
              margin: 'var(--ds-spacing-1) 0 0 0',
              fontSize: 'var(--ds-font-size-sm)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {toast.message}
          </p>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={toast.action.onClick}
            style={{
              marginTop: 'var(--ds-spacing-2)',
              padding: 0,
              fontSize: 'var(--ds-font-size-sm)',
              fontWeight: 'var(--ds-font-weight-medium)',
              color: styles.icon,
              backgroundColor: 'transparent',
              borderWidth: '0',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      {toast.dismissible !== false && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          style={{
            display: 'flex',
            padding: 'var(--ds-spacing-1)',
            backgroundColor: 'transparent',
            borderWidth: '0',
            borderRadius: 'var(--ds-border-radius-sm)',
            cursor: 'pointer',
            color: 'var(--ds-color-neutral-text-subtle)',
            flexShrink: 0,
          }}
        >
          <XIcon />
        </button>
      )}
    </div>
  );
}

// =============================================================================
// ToastProvider Component
// =============================================================================

export function ToastProvider({
  children,
  position = 'top-right',
  maxToasts = 5,
  defaultDuration = 5000,
}: ToastProviderProps): React.ReactElement {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (options: ToastOptions): string => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newToast: Toast = {
        ...options,
        id,
        duration: options.duration ?? defaultDuration,
      };
      setToasts((prev) => {
        const updated = [newToast, ...prev];
        return updated.slice(0, maxToasts);
      });
      return id;
    },
    [defaultDuration, maxToasts]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      {toasts.length > 0 && (
        <div
          style={{
            position: 'fixed',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-2)',
            ...positionStyles[position],
          }}
        >
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

// =============================================================================
// Helper functions
// =============================================================================

let globalAddToast: ((options: ToastOptions) => string) | null = null;

export function setGlobalToastHandler(handler: (options: ToastOptions) => string) {
  globalAddToast = handler;
}

export const toast = {
  success: (title: string, message?: string) => globalAddToast?.({ type: 'success', title, message }),
  error: (title: string, message?: string) => globalAddToast?.({ type: 'error', title, message }),
  warning: (title: string, message?: string) => globalAddToast?.({ type: 'warning', title, message }),
  info: (title: string, message?: string) => globalAddToast?.({ type: 'info', title, message }),
  custom: (options: ToastOptions) => globalAddToast?.(options),
};

export default { ToastProvider, useToast, toast };
