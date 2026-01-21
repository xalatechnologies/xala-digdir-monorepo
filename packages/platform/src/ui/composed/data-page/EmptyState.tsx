/**
 * EmptyState Component
 * 
 * Generic empty state component consolidating DrawerEmptyState, TabEmptyState, and inline patterns
 * Used when there's no data to display
 */

import React from 'react';
import { Paragraph, Button } from '@digdir/designsystemet-react';
import { cn } from '../../utils';

export type EmptyStateVariant = 'default' | 'success' | 'warning' | 'info';

export interface EmptyStateProps {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Title text (must be translated by caller) */
  title: string;
  /** Description text (must be translated by caller) */
  description?: string;
  /** Primary action button config */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'tertiary';
  };
  /** Secondary action button config */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'tertiary';
  };
  /** Visual variant */
  variant?: EmptyStateVariant;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show border */
  bordered?: boolean;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

const variantStyles: Record<EmptyStateVariant, { iconColor: string; titleColor: string }> = {
  default: {
    iconColor: 'var(--ds-color-neutral-text-subtle)',
    titleColor: 'var(--ds-color-neutral-text-default)',
  },
  success: {
    iconColor: 'var(--ds-color-success-text-default)',
    titleColor: 'var(--ds-color-success-text-default)',
  },
  warning: {
    iconColor: 'var(--ds-color-warning-text-default)',
    titleColor: 'var(--ds-color-warning-text-default)',
  },
  info: {
    iconColor: 'var(--ds-color-info-text-default)',
    titleColor: 'var(--ds-color-info-text-default)',
  },
};

const sizeStyles = {
  sm: {
    padding: 'var(--ds-spacing-6)',
    iconMargin: 'var(--ds-spacing-3)',
    titleSize: 'var(--ds-font-size-sm)',
    descriptionSize: 'var(--ds-font-size-xs)',
  },
  md: {
    padding: 'var(--ds-spacing-8)',
    iconMargin: 'var(--ds-spacing-4)',
    titleSize: 'var(--ds-font-size-md)',
    descriptionSize: 'var(--ds-font-size-sm)',
  },
  lg: {
    padding: 'var(--ds-spacing-12)',
    iconMargin: 'var(--ds-spacing-6)',
    titleSize: 'var(--ds-font-size-lg)',
    descriptionSize: 'var(--ds-font-size-md)',
  },
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  size = 'md',
  bordered = false,
  className,
  style,
}: EmptyStateProps): React.ReactElement {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <div
      className={cn('empty-state', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: sizeStyle.padding,
        textAlign: 'center',
        border: bordered ? '1px solid var(--ds-color-neutral-border-default)' : 'none',
        borderRadius: bordered ? 'var(--ds-border-radius-md)' : '0',
        backgroundColor: bordered ? 'var(--ds-color-neutral-surface-default)' : 'transparent',
        ...style,
      }}
    >
      {icon && (
        <div
          style={{
            color: variantStyle.iconColor,
            marginBottom: sizeStyle.iconMargin,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      )}
      
      <Paragraph
        style={{
          fontSize: sizeStyle.titleSize,
          fontWeight: 'var(--ds-font-weight-semibold)',
          color: variantStyle.titleColor,
          marginBottom: description ? 'var(--ds-spacing-2)' : action || secondaryAction ? 'var(--ds-spacing-4)' : '0',
          marginTop: 0,
        }}
      >
        {title}
      </Paragraph>
      
      {description && (
        <Paragraph
          style={{
            margin: '0 0 var(--ds-spacing-4) 0',
            fontSize: sizeStyle.descriptionSize,
            color: 'var(--ds-color-neutral-text-subtle)',
            maxWidth: '500px',
          }}
        >
          {description}
        </Paragraph>
      )}
      
      {(action || secondaryAction) && (
        <div
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-3)',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {action && (
            <Button
              type="button"
              variant={action.variant || 'primary'}
              onClick={action.onClick}
              data-size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              type="button"
              variant={secondaryAction.variant || 'secondary'}
              onClick={secondaryAction.onClick}
              data-size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
