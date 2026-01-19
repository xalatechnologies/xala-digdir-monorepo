/**
 * Toast Component
 *
 * A reusable toast notification system with provider and hooks.
 * Supports multiple toast types, auto-dismiss, and stacking.
 *
 * Usage:
 * 1. Wrap app with <ToastProvider>
 * 2. Use const { toast } = useToast() to show notifications
 *
 * @module @xala/ds/composed/Toast
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

// =============================================================================
// Types
// =============================================================================

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';
export type ToastPosition = 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Toast extends ToastOptions {
  id: string;
  createdAt: number;
}

export interface ToastContextValue {
  toasts: Toast[];
  toast: (options: ToastOptions) => string;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
  defaultDuration?: number;
}

// =============================================================================
// Icons
// =============================================================================

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 12 15 16 10" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function getVariantIcon(variant: ToastVariant) {
  switch (variant) {
    case 'success':
      return <CheckCircleIcon />;
    case 'error':
      return <XCircleIcon />;
    case 'warning':
      return <AlertTriangleIcon />;
    default:
      return <InfoIcon />;
  }
}

function getVariantStyles(variant: ToastVariant) {
  switch (variant) {
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
}

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
// Toast Item Component
// =============================================================================

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const styles = getVariantStyles(toast.variant || 'info');

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    if (toast.duration !== 0) {
      timerRef.current = setTimeout(handleDismiss, toast.duration || 5000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.duration, handleDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--ds-spacing-3)',
        padding: 'var(--ds-spacing-4)',
        backgroundColor: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: 'var(--ds-border-radius-md)',
        boxShadow: 'var(--ds-shadow-md)',
        minWidth: '320px',
        maxWidth: '420px',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'translateX(100%)' : 'translateX(0)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}
    >
      <div style={{ color: styles.icon, flexShrink: 0, marginTop: '2px' }}>
        {getVariantIcon(toast.variant || 'info')}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 'var(--ds-font-weight-medium)', fontSize: 'var(--ds-font-size-sm)', marginBottom: toast.description ? 'var(--ds-spacing-1)' : 0 }}>
          {toast.title}
        </div>
        {toast.description && (
          <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', lineHeight: 1.5 }}>
            {toast.description}
          </div>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={toast.action.onClick}
            style={{
              marginTop: 'var(--ds-spacing-2)',
              padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
              fontSize: 'var(--ds-font-size-sm)',
              fontWeight: 'var(--ds-font-weight-medium)',
              color: styles.icon,
              background: 'transparent',
              border: 'none',
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
          aria-label="Dismiss notification"
          style={{
            flexShrink: 0,
            padding: 'var(--ds-spacing-1)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--ds-color-neutral-text-subtle)',
            borderRadius: 'var(--ds-border-radius-sm)',
          }}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}

// =============================================================================
// Toast Container
// =============================================================================

function getPositionStyles(position: ToastPosition): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--ds-spacing-3)',
    padding: 'var(--ds-spacing-4)',
    pointerEvents: 'none',
  };

  switch (position) {
    case 'top-right':
      return { ...base, top: 0, right: 0 };
    case 'top-left':
      return { ...base, top: 0, left: 0 };
    case 'top-center':
      return { ...base, top: 0, left: '50%', transform: 'translateX(-50%)' };
    case 'bottom-right':
      return { ...base, bottom: 0, right: 0 };
    case 'bottom-left':
      return { ...base, bottom: 0, left: 0 };
    case 'bottom-center':
      return { ...base, bottom: 0, left: '50%', transform: 'translateX(-50%)' };
    default:
      return { ...base, top: 0, right: 0 };
  }
}

// =============================================================================
// Toast Provider
// =============================================================================

let toastId = 0;

export function ToastProvider({
  children,
  position = 'top-right',
  maxToasts = 5,
  defaultDuration = 5000,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((options: ToastOptions): string => {
    const id = `toast-${++toastId}`;
    const newToast: Toast = {
      ...options,
      id,
      duration: options.duration ?? defaultDuration,
      createdAt: Date.now(),
    };

    setToasts((prev) => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    return id;
  }, [defaultDuration, maxToasts]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const toast = useCallback((options: ToastOptions) => addToast(options), [addToast]);
  const success = useCallback((title: string, description?: string) => addToast({ title, description, variant: 'success' }), [addToast]);
  const error = useCallback((title: string, description?: string) => addToast({ title, description, variant: 'error' }), [addToast]);
  const warning = useCallback((title: string, description?: string) => addToast({ title, description, variant: 'warning' }), [addToast]);
  const info = useCallback((title: string, description?: string) => addToast({ title, description, variant: 'info' }), [addToast]);

  const value: ToastContextValue = {
    toasts,
    toast,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof window !== 'undefined' &&
        createPortal(
          <div style={getPositionStyles(position)}>
            {toasts.map((t) => (
              <div key={t.id} style={{ pointerEvents: 'auto' }}>
                <ToastItem toast={t} onDismiss={dismiss} />
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export default ToastProvider;
