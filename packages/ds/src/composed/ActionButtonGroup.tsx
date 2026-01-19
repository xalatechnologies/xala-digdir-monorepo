/**
 * ActionButtonGroup Component
 *
 * Consistent action buttons for tables and lists.
 * Provides standardized view, edit, delete actions with proper styling.
 *
 * @module @xala/ds/composed/ActionButtonGroup
 */

import React from 'react';

// =============================================================================
// Types
// =============================================================================

export type ActionType = 'view' | 'edit' | 'delete' | 'duplicate' | 'archive' | 'restore' | 'download' | 'share';

export interface Action {
  type: ActionType;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  tooltip?: string;
  hidden?: boolean;
}

export interface ActionButtonGroupProps {
  actions: Action[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'text' | 'icon-text';
  alignment?: 'left' | 'center' | 'right';
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function ViewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function DuplicateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function RestoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
      <circle cx="12" cy="12" r="10" opacity="0.25" />
      <path d="M12 2a10 10 0 0110 10" />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

// =============================================================================
// Action Config
// =============================================================================

interface ActionConfig {
  icon: React.ReactNode;
  label: string;
  color: string;
  hoverColor: string;
  bgHover: string;
}

const actionConfigs: Record<ActionType, ActionConfig> = {
  view: {
    icon: <ViewIcon />,
    label: 'Se',
    color: 'var(--ds-color-info-text-default)',
    hoverColor: 'var(--ds-color-info-text-default)',
    bgHover: 'var(--ds-color-info-surface-default)',
  },
  edit: {
    icon: <EditIcon />,
    label: 'Rediger',
    color: 'var(--ds-color-warning-text-default)',
    hoverColor: 'var(--ds-color-warning-text-default)',
    bgHover: 'var(--ds-color-warning-surface-default)',
  },
  delete: {
    icon: <DeleteIcon />,
    label: 'Slett',
    color: 'var(--ds-color-danger-text-default)',
    hoverColor: 'var(--ds-color-danger-text-default)',
    bgHover: 'var(--ds-color-danger-surface-default)',
  },
  duplicate: {
    icon: <DuplicateIcon />,
    label: 'Dupliser',
    color: 'var(--ds-color-neutral-text-default)',
    hoverColor: 'var(--ds-color-accent-text-default)',
    bgHover: 'var(--ds-color-accent-surface-default)',
  },
  archive: {
    icon: <ArchiveIcon />,
    label: 'Arkiver',
    color: 'var(--ds-color-neutral-text-default)',
    hoverColor: 'var(--ds-color-neutral-text-default)',
    bgHover: 'var(--ds-color-neutral-surface-hover)',
  },
  restore: {
    icon: <RestoreIcon />,
    label: 'Gjenopprett',
    color: 'var(--ds-color-success-text-default)',
    hoverColor: 'var(--ds-color-success-text-default)',
    bgHover: 'var(--ds-color-success-surface-default)',
  },
  download: {
    icon: <DownloadIcon />,
    label: 'Last ned',
    color: 'var(--ds-color-neutral-text-default)',
    hoverColor: 'var(--ds-color-accent-text-default)',
    bgHover: 'var(--ds-color-accent-surface-default)',
  },
  share: {
    icon: <ShareIcon />,
    label: 'Del',
    color: 'var(--ds-color-neutral-text-default)',
    hoverColor: 'var(--ds-color-accent-text-default)',
    bgHover: 'var(--ds-color-accent-surface-default)',
  },
};

// =============================================================================
// Size Styles
// =============================================================================

const sizeStyles = {
  sm: { padding: 'var(--ds-spacing-1)', fontSize: 'var(--ds-font-size-xs)', gap: 'var(--ds-spacing-1)' },
  md: { padding: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)', gap: 'var(--ds-spacing-2)' },
  lg: { padding: 'var(--ds-spacing-3)', fontSize: 'var(--ds-font-size-md)', gap: 'var(--ds-spacing-2)' },
};

// =============================================================================
// ActionButton Component
// =============================================================================

interface ActionButtonProps {
  action: Action;
  size: 'sm' | 'md' | 'lg';
  variant: 'icon' | 'text' | 'icon-text';
}

function ActionButton({ action, size, variant }: ActionButtonProps): React.ReactElement | null {
  const [isHovered, setIsHovered] = React.useState(false);
  const config = actionConfigs[action.type];
  const sizeStyle = sizeStyles[size];

  if (action.hidden) return null;

  const showIcon = variant === 'icon' || variant === 'icon-text';
  const showText = variant === 'text' || variant === 'icon-text';

  return (
    <button
      type="button"
      onClick={action.onClick}
      disabled={action.disabled || action.loading}
      title={action.tooltip || config.label}
      aria-label={config.label}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sizeStyle.gap,
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize,
        fontWeight: 'var(--ds-font-weight-medium)',
        color: isHovered ? config.hoverColor : config.color,
        backgroundColor: isHovered ? config.bgHover : 'transparent',
        border: 'none',
        borderRadius: 'var(--ds-border-radius-sm)',
        cursor: action.disabled || action.loading ? 'not-allowed' : 'pointer',
        opacity: action.disabled ? 0.5 : 1,
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {action.loading ? <LoadingSpinner /> : showIcon && config.icon}
      {showText && <span>{config.label}</span>}
    </button>
  );
}

// =============================================================================
// ActionButtonGroup Component
// =============================================================================

export function ActionButtonGroup({
  actions,
  size = 'sm',
  variant = 'icon',
  alignment = 'right',
  className,
  style,
}: ActionButtonGroupProps): React.ReactElement {
  const visibleActions = actions.filter((a) => !a.hidden);

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-1)',
        justifyContent: alignment === 'left' ? 'flex-start' : alignment === 'center' ? 'center' : 'flex-end',
        ...style,
      }}
    >
      {visibleActions.map((action, index) => (
        <ActionButton key={`${action.type}-${index}`} action={action} size={size} variant={variant} />
      ))}
    </div>
  );
}

// =============================================================================
// Convenience Components
// =============================================================================

export interface TableActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showDuplicate?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function TableActions({
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  showView = true,
  showEdit = true,
  showDelete = true,
  showDuplicate = false,
  disabled = false,
  size = 'sm',
}: TableActionsProps): React.ReactElement {
  const actions: Action[] = [
    { type: 'view', onClick: onView || (() => {}), hidden: !showView || !onView, disabled },
    { type: 'edit', onClick: onEdit || (() => {}), hidden: !showEdit || !onEdit, disabled },
    { type: 'duplicate', onClick: onDuplicate || (() => {}), hidden: !showDuplicate || !onDuplicate, disabled },
    { type: 'delete', onClick: onDelete || (() => {}), hidden: !showDelete || !onDelete, disabled },
  ];

  return <ActionButtonGroup actions={actions} size={size} variant="icon" alignment="right" />;
}

export default ActionButtonGroup;
