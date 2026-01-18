/**
 * Toast Provider
 * Global toast/notification system for the SaaS admin app
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Alert, Paragraph } from '@xala/ds';
import styles from './ToastProvider.module.css';

type ToastType = 'success' | 'info' | 'warning' | 'danger';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  addToast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps): React.ReactElement {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const toast: Toast = message ? { id, type, title, message } : { id, type, title };

      setToasts((prev) => [...prev, toast]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => {
      addToast('success', title, message);
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      addToast('danger', title, message);
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      addToast('warning', title, message);
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      addToast('info', title, message);
    },
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, success, error, warning, info }}>
      {children}

      {/* Toast container - fixed at top right */}
      {toasts.length > 0 && (
        <div className={styles.toastContainer}>
          {toasts.map((toast) => (
            <Alert
              key={toast.id}
              color={toast.type}
              className={styles.toast}
            >
              <strong>{toast.title}</strong>
              {toast.message && <Paragraph size="sm" className={styles.toastMessage}>{toast.message}</Paragraph>}
            </Alert>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
