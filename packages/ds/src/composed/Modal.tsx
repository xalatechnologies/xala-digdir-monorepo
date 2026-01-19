/**
 * Modal Component
 *
 * A generic, reusable modal component with customizable sizes,
 * header, footer, and content areas.
 *
 * @module @xala/ds/composed/Modal
 */

import React, { useEffect, useRef, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

// =============================================================================
// Types
// =============================================================================

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// =============================================================================
// Constants
// =============================================================================

const sizeMap: Record<ModalSize, string> = {
  sm: '400px',
  md: '560px',
  lg: '720px',
  xl: '920px',
  full: '95vw',
};

// =============================================================================
// Icons
// =============================================================================

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// =============================================================================
// Modal Component
// =============================================================================

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: ModalProps): React.ReactElement | null {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      dialogRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      previousFocusRef.current?.focus();
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--ds-spacing-4)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)',
      }}
      onClick={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        tabIndex={-1}
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: sizeMap[size],
          maxHeight: '90vh',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
          boxShadow: 'var(--ds-shadow-xl)',
          outline: 'none',
          overflow: 'hidden',
          ...style,
        }}
      >
        {(title || showCloseButton) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
              borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
            }}
          >
            {title && (
              <h2
                style={{
                  margin: 0,
                  fontSize: 'var(--ds-font-size-lg)',
                  fontWeight: 'var(--ds-font-weight-semibold)',
                  color: 'var(--ds-color-neutral-text-default)',
                }}
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  marginLeft: 'auto',
                  padding: 'var(--ds-spacing-2)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--ds-color-neutral-text-subtle)',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}

        <div
          style={{
            flex: 1,
            padding: 'var(--ds-spacing-5)',
            overflowY: 'auto',
          }}
        >
          {children}
        </div>

        {footer && (
          <div
            style={{
              padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
              borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
              backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
}

// =============================================================================
// Modal Header, Body, Footer (optional sub-components)
// =============================================================================

export interface ModalHeaderProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function ModalHeader({ children, className, style }: ModalHeaderProps) {
  return (
    <div
      className={className}
      style={{
        marginBottom: 'var(--ds-spacing-4)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export interface ModalBodyProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function ModalBody({ children, className, style }: ModalBodyProps) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

export interface ModalFooterProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  align?: 'left' | 'center' | 'right' | 'between';
}

export function ModalFooter({ children, className, style, align = 'right' }: ModalFooterProps) {
  const justifyContent = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
    between: 'space-between',
  }[align];

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent,
        gap: 'var(--ds-spacing-3)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default Modal;
