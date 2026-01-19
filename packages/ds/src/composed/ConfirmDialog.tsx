/**
 * ConfirmDialog & ActionDialog Components
 *
 * Modal dialogs for confirmations, destructive actions, and form submissions.
 * SSR-safe with 'use client' directive.
 *
 * @module @xala/ds/composed/ConfirmDialog
 */

'use client';

import React, { useEffect, useRef, useCallback, type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export type DialogVariant = 'default' | 'danger' | 'warning' | 'success';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
  isLoading?: boolean;
  children?: ReactNode;
}

export interface ActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// =============================================================================
// Icons
// =============================================================================

function AlertTriangleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// =============================================================================
// Variant Styles
// =============================================================================

const variantStyles: Record<DialogVariant, { iconBg: string; iconColor: string; buttonBg: string }> = {
  default: {
    iconBg: 'var(--ds-color-accent-surface-subtle)',
    iconColor: 'var(--ds-color-accent-text-default)',
    buttonBg: 'var(--ds-color-accent-base-default)',
  },
  danger: {
    iconBg: 'var(--ds-color-danger-surface-subtle)',
    iconColor: 'var(--ds-color-danger-text-default)',
    buttonBg: 'var(--ds-color-danger-base-default)',
  },
  warning: {
    iconBg: 'var(--ds-color-warning-surface-subtle)',
    iconColor: 'var(--ds-color-warning-text-default)',
    buttonBg: 'var(--ds-color-warning-base-default)',
  },
  success: {
    iconBg: 'var(--ds-color-success-surface-subtle)',
    iconColor: 'var(--ds-color-success-text-default)',
    buttonBg: 'var(--ds-color-success-base-default)',
  },
};

const sizeStyles: Record<string, string> = {
  sm: 'var(--ds-sizing-80)',
  md: 'var(--ds-sizing-100)',
  lg: 'var(--ds-sizing-125)',
  xl: 'var(--ds-sizing-150)',
};

// =============================================================================
// ConfirmDialog Component
// =============================================================================

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
  children,
}: ConfirmDialogProps): React.ReactElement | null {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const styles = variantStyles[variant];

  useEffect(() => {
    if (isOpen) {
      confirmButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !isLoading) {
        onClose();
      }
    },
    [isLoading, onClose]
  );

  const handleConfirm = useCallback(async () => {
    await onConfirm();
  }, [onConfirm]);

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        padding: 'var(--ds-spacing-4)',
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        style={{
          width: '100%',
          maxWidth: 'var(--ds-sizing-100)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderRadius: 'var(--ds-border-radius-xl)',
          boxShadow: 'var(--ds-shadow-xl)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: 'var(--ds-spacing-6)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-4)' }}>
            {variant !== 'default' && (
              <div
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'var(--ds-sizing-12)',
                  height: 'var(--ds-sizing-12)',
                  backgroundColor: styles.iconBg,
                  borderRadius: 'var(--ds-border-radius-full)',
                  color: styles.iconColor,
                }}
              >
                <AlertTriangleIcon />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h2
                id="dialog-title"
                style={{
                  margin: 0,
                  fontSize: 'var(--ds-font-size-lg)',
                  fontWeight: 'var(--ds-font-weight-semibold)',
                  color: 'var(--ds-color-neutral-text-default)',
                }}
              >
                {title}
              </h2>
              {description && (
                <p
                  id="dialog-description"
                  style={{
                    margin: 'var(--ds-spacing-2) 0 0 0',
                    fontSize: 'var(--ds-font-size-sm)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                    lineHeight: 1.5,
                  }}
                >
                  {description}
                </p>
              )}
              {children && <div style={{ marginTop: 'var(--ds-spacing-4)' }}>{children}</div>}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--ds-spacing-3)',
            padding: 'var(--ds-spacing-4) var(--ds-spacing-6)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderTopWidth: 'var(--ds-border-width-default)',
            borderTopStyle: 'solid',
            borderTopColor: 'var(--ds-color-neutral-border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
              fontSize: 'var(--ds-font-size-sm)',
              fontWeight: 'var(--ds-font-weight-medium)',
              color: 'var(--ds-color-neutral-text-default)',
              backgroundColor: 'var(--ds-color-neutral-background-default)',
              borderWidth: 'var(--ds-border-width-default)',
              borderStyle: 'solid',
              borderColor: 'var(--ds-color-neutral-border-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
              fontSize: 'var(--ds-font-size-sm)',
              fontWeight: 'var(--ds-font-weight-medium)',
              color: 'white',
              backgroundColor: styles.buttonBg,
              borderWidth: '0',
              borderRadius: 'var(--ds-border-radius-md)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading && <SpinnerIcon />}
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// =============================================================================
// ActionDialog Component
// =============================================================================

export function ActionDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ActionDialogProps): React.ReactElement | null {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        padding: 'var(--ds-spacing-4)',
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-dialog-title"
        style={{
          width: '100%',
          maxWidth: sizeStyles[size],
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderRadius: 'var(--ds-border-radius-xl)',
          boxShadow: 'var(--ds-shadow-xl)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--ds-spacing-4) var(--ds-spacing-6)',
            borderBottomWidth: 'var(--ds-border-width-default)',
            borderBottomStyle: 'solid',
            borderBottomColor: 'var(--ds-color-neutral-border-subtle)',
          }}
        >
          <div>
            <h2
              id="action-dialog-title"
              style={{
                margin: 0,
                fontSize: 'var(--ds-font-size-lg)',
                fontWeight: 'var(--ds-font-weight-semibold)',
                color: 'var(--ds-color-neutral-text-default)',
              }}
            >
              {title}
            </h2>
            {description && (
              <p
                style={{
                  margin: 'var(--ds-spacing-1) 0 0 0',
                  fontSize: 'var(--ds-font-size-sm)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--ds-spacing-1)',
              backgroundColor: 'transparent',
              borderWidth: '0',
              borderRadius: 'var(--ds-border-radius-sm)',
              cursor: 'pointer',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            <XIcon />
          </button>
        </div>

        <div
          style={{
            flex: 1,
            padding: 'var(--ds-spacing-6)',
            overflowY: 'auto',
          }}
        >
          {children}
        </div>

        {footer && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--ds-spacing-3)',
              padding: 'var(--ds-spacing-4) var(--ds-spacing-6)',
              backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
              borderTopWidth: 'var(--ds-border-width-default)',
              borderTopStyle: 'solid',
              borderTopColor: 'var(--ds-color-neutral-border-subtle)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// useConfirmDialog Hook
// =============================================================================

export interface UseConfirmDialogOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
}

export function useConfirmDialog() {
  const [state, setState] = React.useState<{
    isOpen: boolean;
    options: UseConfirmDialogOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: { title: '' },
    resolve: null,
  });

  const confirm = useCallback((options: UseConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ isOpen: true, options, resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [state.resolve]);

  const handleClose = useCallback(() => {
    state.resolve?.(false);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [state.resolve]);

  const DialogComponent = (
    <ConfirmDialog
      isOpen={state.isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      {...state.options}
    />
  );

  return { confirm, DialogComponent };
}

export default { ConfirmDialog, ActionDialog, useConfirmDialog };
