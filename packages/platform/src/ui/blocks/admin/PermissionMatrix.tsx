/**
 * PermissionMatrix - Role Permissions Grid
 *
 * Interactive grid showing which permissions are assigned to which roles.
 * Supports grouping by category, risk indicators, and permission toggling.
 */
import React, { useMemo, useState, useCallback } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Table,
  Checkbox,
  Textfield,
} from '@digdir/designsystemet-react';
import { Badge } from '../../composed/Badge';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  risk?: 'low' | 'medium' | 'high';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  color?: string;
  permissions: string[];
}

export interface PermissionMatrixProps {
  /** List of roles */
  roles: Role[];
  /** List of permissions */
  permissions: Permission[];
  /** Callback when a permission is toggled for a role */
  onPermissionToggle?: (roleId: string, permissionId: string, enabled: boolean) => void;
  /** Read-only mode (no toggling) */
  readOnly?: boolean;
  /** Show risk indicators for permissions */
  showRiskIndicators?: boolean;
  /** Group permissions by category */
  groupByCategory?: boolean;
}

const riskIcons: Record<string, string> = {
  low: '●',
  medium: '◐',
  high: '◉',
};

/**
 * PermissionMatrix - Interactive permission-role grid
 *
 * @example
 * ```tsx
 * <PermissionMatrix
 *   roles={[
 *     { id: 'admin', name: 'Administrator', description: 'Full access', permissions: ['perm-1', 'perm-2'] },
 *     { id: 'user', name: 'User', description: 'Basic access', permissions: ['perm-1'] },
 *   ]}
 *   permissions={[
 *     { id: 'perm-1', name: 'View', description: 'View resources', category: 'Resources', risk: 'low' },
 *     { id: 'perm-2', name: 'Edit', description: 'Edit resources', category: 'Resources', risk: 'medium' },
 *   ]}
 *   onPermissionToggle={(roleId, permId, enabled) => console.log(roleId, permId, enabled)}
 *   showRiskIndicators
 *   groupByCategory
 * />
 * ```
 */
export function PermissionMatrix({
  roles,
  permissions,
  onPermissionToggle,
  readOnly = false,
  showRiskIndicators = true,
  groupByCategory = true,
}: PermissionMatrixProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(permissions.map((p) => p.category))
  );

  // Filter permissions based on search
  const filteredPermissions = useMemo(() => {
    if (!searchQuery) return permissions;
    const query = searchQuery.toLowerCase();
    return permissions.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }, [permissions, searchQuery]);

  // Group permissions by category
  const groupedPermissions = useMemo(() => {
    if (!groupByCategory) {
      return { 'All Permissions': filteredPermissions };
    }

    return filteredPermissions.reduce(
      (acc, perm) => {
        const category = perm.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(perm);
        return acc;
      },
      {} as Record<string, Permission[]>
    );
  }, [filteredPermissions, groupByCategory]);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const handleToggle = useCallback(
    (roleId: string, permissionId: string, currentState: boolean) => {
      if (!readOnly && onPermissionToggle) {
        onPermissionToggle(roleId, permissionId, !currentState);
      }
    },
    [readOnly, onPermissionToggle]
  );

  if (roles.length === 0 || permissions.length === 0) {
    return (
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <Heading data-size="sm">Permission Matrix</Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {roles.length === 0
            ? 'No roles defined.'
            : 'No permissions defined.'}
        </Paragraph>
      </Card>
    );
  }

  const categories = Object.keys(groupedPermissions).sort();

  return (
    <Card style={{ padding: 'var(--ds-spacing-4)' }}>
      <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <Heading data-size="sm">Permission Matrix</Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-2)' }}>
          {roles.length} roles × {permissions.length} permissions
        </Paragraph>
        <Textfield
          aria-label="Search permissions"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search permissions..."
          style={{ maxWidth: '300px' }}
        />
      </div>

      {/* Legend */}
      {showRiskIndicators && (
        <div
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-3)',
            marginBottom: 'var(--ds-spacing-3)',
            padding: 'var(--ds-spacing-2)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
          }}
        >
          <Paragraph data-size="sm" style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
            Risk Level:
          </Paragraph>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
            <span style={{ color: 'var(--ds-color-neutral-text-default)' }}>{riskIcons.low}</span>
            <Paragraph data-size="sm">Low</Paragraph>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
            <span style={{ color: 'var(--ds-color-warning-text-default)' }}>{riskIcons.medium}</span>
            <Paragraph data-size="sm">Medium</Paragraph>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
            <span style={{ color: 'var(--ds-color-danger-text-default)' }}>{riskIcons.high}</span>
            <Paragraph data-size="sm">High</Paragraph>
          </span>
        </div>
      )}

      {/* Matrix Table */}
      <div style={{ overflowX: 'auto' }}>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell style={{ minWidth: '200px' }}>Permission</Table.HeaderCell>
              {roles.map((role) => (
                <Table.HeaderCell
                  key={role.id}
                  style={{ textAlign: 'center', minWidth: '100px' }}
                  title={role.description}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
                    <span>{role.name}</span>
                    {role.color && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: role.color,
                        }}
                      />
                    )}
                  </div>
                </Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {categories.map((category) => {
              const categoryPermissions = groupedPermissions[category] || [];
              const isExpanded = expandedCategories.has(category);

              return (
                <React.Fragment key={category}>
                  {/* Category Header Row */}
                  {groupByCategory && (
                    <Table.Row>
                      <Table.Cell
                        colSpan={roles.length + 1}
                        style={{
                          backgroundColor: 'var(--ds-color-neutral-surface-default)',
                          fontWeight: 'var(--ds-font-weight-medium)',
                          cursor: 'pointer',
                        }}
                        onClick={() => toggleCategory(category)}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                          <span>{isExpanded ? '▼' : '▶'}</span>
                          {category}
                          <Badge variant="default" size="sm">
                            {categoryPermissions.length}
                          </Badge>
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  )}

                  {/* Permission Rows */}
                  {isExpanded &&
                    categoryPermissions.map((permission) => (
                      <Table.Row key={permission.id}>
                        <Table.Cell>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                            {showRiskIndicators && permission.risk && (
                              <span
                                style={{
                                  color:
                                    permission.risk === 'high'
                                      ? 'var(--ds-color-danger-text-default)'
                                      : permission.risk === 'medium'
                                        ? 'var(--ds-color-warning-text-default)'
                                        : 'var(--ds-color-neutral-text-default)',
                                }}
                                title={`${permission.risk} risk`}
                              >
                                {riskIcons[permission.risk]}
                              </span>
                            )}
                            <div>
                              <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                                {permission.name}
                              </div>
                              <div
                                style={{
                                  fontSize: 'var(--ds-font-size-sm)',
                                  color: 'var(--ds-color-neutral-text-subtle)',
                                }}
                              >
                                {permission.description}
                              </div>
                            </div>
                          </div>
                        </Table.Cell>
                        {roles.map((role) => {
                          const hasPermission = role.permissions.includes(permission.id);
                          return (
                            <Table.Cell
                              key={`${role.id}-${permission.id}`}
                              style={{ textAlign: 'center' }}
                            >
                              <Checkbox
                                value={permission.id}
                                checked={hasPermission}
                                onChange={() => handleToggle(role.id, permission.id, hasPermission)}
                                disabled={readOnly}
                                aria-label={`${permission.name} for ${role.name}`}
                              />
                            </Table.Cell>
                          );
                        })}
                      </Table.Row>
                    ))}
                </React.Fragment>
              );
            })}
          </Table.Body>
        </Table>
      </div>

      {/* Summary */}
      <div
        style={{
          marginTop: 'var(--ds-spacing-3)',
          padding: 'var(--ds-spacing-3)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-3)' }}>
          {roles.map((role) => (
            <div key={role.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
              {role.color && (
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: role.color,
                  }}
                />
              )}
              <Paragraph data-size="sm">
                <strong>{role.name}:</strong> {role.permissions.length} permissions
              </Paragraph>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
