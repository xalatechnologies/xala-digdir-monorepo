/**
 * RoleMatrix Component
 *
 * A permission matrix table component for documentation pages
 * that displays roles as columns and permissions as rows.
 *
 * Uses design tokens from @xala/ds for consistent styling.
 * Supports mobile responsive design with horizontal scrolling.
 */

import React, { forwardRef } from 'react';
import { Heading } from '@xala/ds';

export interface RoleDefinition {
  /**
   * Unique identifier for the role
   */
  id: string;

  /**
   * Display name for the role
   */
  name: string;

  /**
   * Optional description shown in tooltip/header
   */
  description?: string;
}

export interface PermissionRow {
  /**
   * The permission or action name
   */
  permission: string;

  /**
   * Optional category/group for the permission
   */
  category?: string;

  /**
   * Optional description for the permission
   */
  description?: string;

  /**
   * Map of role id to permission value
   * Values can be: true (allowed), false (denied), 'partial' (conditional)
   */
  roles: Record<string, boolean | 'partial' | undefined>;
}

export interface RoleMatrixProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Array of role definitions (columns)
   */
  roles: RoleDefinition[];

  /**
   * Array of permission rows
   */
  permissions: PermissionRow[];

  /**
   * Optional title shown above the matrix
   */
  title?: string;

  /**
   * Whether to group permissions by category
   * @default true
   */
  groupByCategory?: boolean;

  /**
   * Size variant for the table
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether to show a legend below the table
   * @default true
   */
  showLegend?: boolean;

  /**
   * Custom labels for the legend
   */
  legendLabels?: {
    allowed?: string;
    denied?: string;
    partial?: string;
  };
}

/**
 * Get permission icon SVG based on value
 */
const getPermissionIcon = (
  value: boolean | 'partial' | undefined
): React.ReactNode => {
  const iconStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
  };

  if (value === true) {
    // Checkmark - allowed
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          ...iconStyle,
          color: 'var(--ds-color-success-base-default)',
        }}
        aria-hidden="true"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    );
  }

  if (value === false) {
    // X mark - denied
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          ...iconStyle,
          color: 'var(--ds-color-danger-base-default)',
        }}
        aria-hidden="true"
      >
        <path d="M18 6L6 18" />
        <path d="M6 6l12 12" />
      </svg>
    );
  }

  if (value === 'partial') {
    // Dash/minus - partial/conditional
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          ...iconStyle,
          color: 'var(--ds-color-warning-base-default)',
        }}
        aria-hidden="true"
      >
        <path d="M5 12h14" />
      </svg>
    );
  }

  // Empty/undefined - no value
  return (
    <span
      style={{
        ...iconStyle,
        display: 'inline-block',
        color: 'var(--ds-color-neutral-text-subtle)',
      }}
      aria-hidden="true"
    >
      –
    </span>
  );
};

/**
 * Get accessible label for permission value
 */
const getPermissionLabel = (
  value: boolean | 'partial' | undefined,
  labels?: RoleMatrixProps['legendLabels']
): string => {
  if (value === true) return labels?.allowed || 'Allowed';
  if (value === false) return labels?.denied || 'Denied';
  if (value === 'partial') return labels?.partial || 'Conditional';
  return 'Not applicable';
};

/**
 * Get size-specific styles
 */
const getSizeStyles = (size: 'sm' | 'md' | 'lg') => {
  const sizes = {
    sm: {
      cellPadding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
      fontSize: 'var(--ds-font-size-sm)',
      headerFontSize: 'var(--ds-font-size-sm)',
    },
    md: {
      cellPadding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
      fontSize: 'var(--ds-font-size-md)',
      headerFontSize: 'var(--ds-font-size-md)',
    },
    lg: {
      cellPadding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
      fontSize: 'var(--ds-font-size-lg)',
      headerFontSize: 'var(--ds-font-size-lg)',
    },
  };

  return sizes[size];
};

/**
 * Group permissions by category
 */
const groupPermissions = (permissions: PermissionRow[]): Map<string, PermissionRow[]> => {
  const groups = new Map<string, PermissionRow[]>();

  permissions.forEach((permission) => {
    const category = permission.category || 'General';
    const existing = groups.get(category) || [];
    groups.set(category, [...existing, permission]);
  });

  return groups;
};

export const RoleMatrix = forwardRef<HTMLDivElement, RoleMatrixProps>(
  (
    {
      roles,
      permissions,
      title,
      groupByCategory = true,
      size = 'md',
      showLegend = true,
      legendLabels,
      style,
      ...props
    },
    ref
  ) => {
    const sizeStyles = getSizeStyles(size);
    const groupedPermissions = groupByCategory
      ? groupPermissions(permissions)
      : new Map([['', permissions]]);

    const containerStyle: React.CSSProperties = {
      marginBlock: 'var(--ds-spacing-6)',
      ...style,
    };

    const titleStyle: React.CSSProperties = {
      marginBottom: 'var(--ds-spacing-4)',
    };

    const scrollContainerStyle: React.CSSProperties = {
      overflowX: 'auto',
      borderRadius: 'var(--ds-border-radius-md)',
      border: '1px solid var(--ds-color-neutral-border-subtle)',
    };

    const tableStyle: React.CSSProperties = {
      width: '100%',
      minWidth: '600px',
      borderCollapse: 'collapse',
      fontSize: sizeStyles.fontSize,
    };

    const headerCellStyle: React.CSSProperties = {
      padding: sizeStyles.cellPadding,
      backgroundColor: 'var(--ds-color-neutral-surface-hover)',
      borderBottom: '2px solid var(--ds-color-neutral-border-default)',
      fontWeight: 'var(--ds-font-weight-semibold)',
      fontSize: sizeStyles.headerFontSize,
      color: 'var(--ds-color-neutral-text-default)',
      textAlign: 'center',
      whiteSpace: 'nowrap',
    };

    const permissionHeaderStyle: React.CSSProperties = {
      ...headerCellStyle,
      textAlign: 'left',
      minWidth: '200px',
    };

    const categoryRowStyle: React.CSSProperties = {
      backgroundColor: 'var(--ds-color-neutral-surface-default)',
    };

    const categoryCellStyle: React.CSSProperties = {
      padding: sizeStyles.cellPadding,
      fontWeight: 'var(--ds-font-weight-medium)',
      fontSize: sizeStyles.fontSize,
      color: 'var(--ds-color-neutral-text-default)',
      borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
      backgroundColor: 'var(--ds-color-neutral-surface-hover)',
    };

    const rowStyle = (isEven: boolean): React.CSSProperties => ({
      backgroundColor: isEven
        ? 'var(--ds-color-neutral-surface-default)'
        : 'var(--ds-color-neutral-surface-subtle)',
    });

    const cellStyle: React.CSSProperties = {
      padding: sizeStyles.cellPadding,
      borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
      color: 'var(--ds-color-neutral-text-default)',
    };

    const permissionCellStyle: React.CSSProperties = {
      ...cellStyle,
      textAlign: 'left',
    };

    const valueCellStyle: React.CSSProperties = {
      ...cellStyle,
      textAlign: 'center',
      verticalAlign: 'middle',
    };

    const legendStyle: React.CSSProperties = {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--ds-spacing-4)',
      marginTop: 'var(--ds-spacing-4)',
      fontSize: 'var(--ds-font-size-sm)',
      color: 'var(--ds-color-neutral-text-subtle)',
    };

    const legendItemStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--ds-spacing-2)',
    };

    const descriptionStyle: React.CSSProperties = {
      fontSize: 'var(--ds-font-size-sm)',
      color: 'var(--ds-color-neutral-text-subtle)',
      marginTop: 'var(--ds-spacing-1)',
    };

    // Flatten permissions for row indexing
    let rowIndex = 0;

    return (
      <div ref={ref} style={containerStyle} {...props}>
        {title && (
          <Heading level={3} style={titleStyle}>
            {title}
          </Heading>
        )}

        <div
          style={scrollContainerStyle}
          role="region"
          aria-label={title || 'Role permission matrix'}
          tabIndex={0}
        >
          <table style={tableStyle}>
            <thead>
              <tr>
                <th scope="col" style={permissionHeaderStyle}>
                  Permission
                </th>
                {roles.map((role) => (
                  <th
                    key={role.id}
                    scope="col"
                    style={headerCellStyle}
                    title={role.description}
                  >
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from(groupedPermissions.entries()).map(
                ([category, categoryPermissions]) => (
                  <React.Fragment key={category}>
                    {/* Category header row (only if groupByCategory and category exists) */}
                    {groupByCategory && category && (
                      <tr style={categoryRowStyle}>
                        <td
                          colSpan={roles.length + 1}
                          style={categoryCellStyle}
                        >
                          {category}
                        </td>
                      </tr>
                    )}

                    {/* Permission rows */}
                    {categoryPermissions.map((permission) => {
                      const currentIndex = rowIndex++;
                      const isEven = currentIndex % 2 === 0;

                      return (
                        <tr key={permission.permission} style={rowStyle(isEven)}>
                          <td style={permissionCellStyle}>
                            <div>{permission.permission}</div>
                            {permission.description && (
                              <div style={descriptionStyle}>
                                {permission.description}
                              </div>
                            )}
                          </td>
                          {roles.map((role) => {
                            const value = permission.roles[role.id];
                            return (
                              <td
                                key={role.id}
                                style={valueCellStyle}
                                aria-label={`${permission.permission} for ${role.name}: ${getPermissionLabel(value, legendLabels)}`}
                              >
                                {getPermissionIcon(value)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        {showLegend && (
          <div style={legendStyle} aria-label="Legend">
            <div style={legendItemStyle}>
              {getPermissionIcon(true)}
              <span>{legendLabels?.allowed || 'Allowed'}</span>
            </div>
            <div style={legendItemStyle}>
              {getPermissionIcon(false)}
              <span>{legendLabels?.denied || 'Denied'}</span>
            </div>
            <div style={legendItemStyle}>
              {getPermissionIcon('partial')}
              <span>{legendLabels?.partial || 'Conditional'}</span>
            </div>
          </div>
        )}

        <style>{`
          /* Responsive table styles */
          @media (max-width: 768px) {
            table {
              font-size: var(--ds-font-size-sm);
            }
          }

          /* Focus indicator for scroll container */
          div[role="region"]:focus {
            outline: 3px solid var(--ds-color-focus-outer);
            outline-offset: 2px;
          }

          div[role="region"]:focus-visible {
            outline: 3px solid var(--ds-color-focus-outer);
            outline-offset: 2px;
          }

          /* Hover effect for rows */
          tbody tr:hover {
            background-color: var(--ds-color-neutral-surface-hover) !important;
          }

          /* Respect reduced motion */
          @media (prefers-reduced-motion: reduce) {
            tbody tr {
              transition: none !important;
            }
          }

          /* High contrast mode */
          @media (prefers-contrast: high) {
            div[role="region"]:focus {
              outline-width: 4px;
            }
          }
        `}</style>
      </div>
    );
  }
);

RoleMatrix.displayName = 'RoleMatrix';
