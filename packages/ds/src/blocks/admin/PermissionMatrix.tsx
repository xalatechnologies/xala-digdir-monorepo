/**
 * PermissionMatrix - Role Permissions Grid
 *
 * Displays a visual matrix of roles and their permissions.
 * Allows tenant admins to understand capability distribution across roles.
 *
 * Usage:
 * ```tsx
 * <PermissionMatrix
 *   roles={roles}
 *   permissions={permissions}
 *   onPermissionToggle={handleToggle}
 * />
 * ```
 */
import React, { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Table,
  Checkbox,
  Stack,
  Box,
  Search,
  Tooltip,
} from '../../primitives';
import {
  ShieldIcon,
  CheckIcon,
  CloseIcon,
  InfoIcon,
} from '../../primitives';

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
  /**
   * Available roles
   */
  roles: Role[];

  /**
   * Available permissions
   */
  permissions: Permission[];

  /**
   * Callback when permission is toggled for a role
   */
  onPermissionToggle?: (roleId: string, permissionId: string, enabled: boolean) => void;

  /**
   * Read-only mode
   */
  readOnly?: boolean;

  /**
   * Show permission descriptions
   */
  showDescriptions?: boolean;

  /**
   * Group permissions by category
   */
  groupByCategory?: boolean;

  /**
   * Highlight risky permissions
   */
  highlightRisks?: boolean;
}

export function PermissionMatrix({
  roles,
  permissions,
  onPermissionToggle,
  readOnly = false,
  showDescriptions = true,
  groupByCategory = true,
  highlightRisks = true,
}: PermissionMatrixProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');

  // Filter permissions
  const filteredPermissions = permissions.filter((perm) => {
    const matchesSearch =
      searchQuery === '' ||
      perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perm.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || perm.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Group permissions by category
  const groupedPermissions = groupByCategory
    ? filteredPermissions.reduce((acc, perm) => {
        if (!acc[perm.category]) {
          acc[perm.category] = [];
        }
        acc[perm.category].push(perm);
        return acc;
      }, {} as Record<string, Permission[]>)
    : { All: filteredPermissions };

  // Get unique categories
  const categories = Array.from(new Set(permissions.map((p) => p.category)));

  // Check if role has permission
  const hasPermission = (role: Role, permissionId: string): boolean => {
    return role.permissions.includes(permissionId);
  };

  // Handle permission toggle
  const handleToggle = (roleId: string, permissionId: string, currentState: boolean) => {
    if (!readOnly && onPermissionToggle) {
      onPermissionToggle(roleId, permissionId, !currentState);
    }
  };

  // Risk color mapping
  const getRiskColor = (risk?: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'high':
        return 'var(--ds-color-danger-base-default)';
      case 'medium':
        return 'var(--ds-color-warning-base-default)';
      case 'low':
        return 'var(--ds-color-success-base-default)';
      default:
        return 'var(--ds-color-neutral-text-subtle)';
    }
  };

  return (
    <Card
      style={{
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
      }}
    >
      <Stack gap={4}>
        {/* Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <ShieldIcon style={{ color: 'var(--ds-color-accent-base-default)' }} />
            <Heading size="sm" style={{ margin: 0 }}>
              Permission Matrix
            </Heading>
          </div>
          <Paragraph size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            View and manage permissions across all roles
          </Paragraph>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap' }}>
          <Search
            placeholder="Search permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, minWidth: '240px' }}
          />
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
            <Button
              variant={selectedCategory === 'all' ? 'primary' : 'tertiary'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'primary' : 'tertiary'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Legend */}
        {highlightRisks && (
          <Box
            style={{
              padding: 'var(--ds-spacing-3)',
              backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
              borderRadius: 'var(--ds-border-radius-md)',
              display: 'flex',
              gap: 'var(--ds-spacing-4)',
              fontSize: 'var(--ds-font-size-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: getRiskColor('high'),
                }}
              />
              <span>High Risk</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: getRiskColor('medium'),
                }}
              />
              <span>Medium Risk</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: getRiskColor('low'),
                }}
              />
              <span>Low Risk</span>
            </div>
          </Box>
        )}

        {/* Matrix Table */}
        <div style={{ overflowX: 'auto' }}>
          {Object.entries(groupedPermissions).map(([category, perms]) => (
            <div key={category} style={{ marginBottom: 'var(--ds-spacing-6)' }}>
              {groupByCategory && (
                <Heading size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                  {category}
                </Heading>
              )}
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.HeaderCell style={{ width: '30%' }}>Permission</Table.HeaderCell>
                    {roles.map((role) => (
                      <Table.HeaderCell key={role.id} style={{ textAlign: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'var(--ds-font-weight-semibold)' }}>
                            {role.name}
                          </div>
                          {showDescriptions && (
                            <div
                              style={{
                                fontSize: 'var(--ds-font-size-xs)',
                                color: 'var(--ds-color-neutral-text-subtle)',
                                fontWeight: 'var(--ds-font-weight-regular)',
                              }}
                            >
                              {role.description}
                            </div>
                          )}
                        </div>
                      </Table.HeaderCell>
                    ))}
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {perms.map((permission) => (
                    <Table.Row key={permission.id}>
                      <Table.Cell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                          {highlightRisks && permission.risk && (
                            <div
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: 'var(--ds-border-radius-full)',
                                backgroundColor: getRiskColor(permission.risk),
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <div>
                            <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                              {permission.name}
                            </div>
                            {showDescriptions && (
                              <div
                                style={{
                                  fontSize: 'var(--ds-font-size-sm)',
                                  color: 'var(--ds-color-neutral-text-subtle)',
                                  marginTop: '2px',
                                }}
                              >
                                {permission.description}
                              </div>
                            )}
                          </div>
                          <Tooltip content={permission.description}>
                            <InfoIcon
                              style={{
                                color: 'var(--ds-color-neutral-text-subtle)',
                                cursor: 'help',
                              }}
                            />
                          </Tooltip>
                        </div>
                      </Table.Cell>
                      {roles.map((role) => {
                        const isEnabled = hasPermission(role, permission.id);
                        return (
                          <Table.Cell key={role.id} style={{ textAlign: 'center' }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              {readOnly ? (
                                isEnabled ? (
                                  <CheckIcon
                                    style={{
                                      color: 'var(--ds-color-success-base-default)',
                                    }}
                                  />
                                ) : (
                                  <CloseIcon
                                    style={{
                                      color: 'var(--ds-color-neutral-text-subtle)',
                                      opacity: 0.3,
                                    }}
                                  />
                                )
                              ) : (
                                <Checkbox
                                  checked={isEnabled}
                                  onChange={() =>
                                    handleToggle(role.id, permission.id, isEnabled)
                                  }
                                  disabled={readOnly}
                                />
                              )}
                            </div>
                          </Table.Cell>
                        );
                      })}
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          ))}
        </div>

        {/* Stats */}
        <Box
          style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-md)',
            display: 'flex',
            gap: 'var(--ds-spacing-6)',
            flexWrap: 'wrap',
          }}
        >
          {roles.map((role) => (
            <div key={role.id}>
              <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                {role.name}
              </div>
              <div style={{ fontSize: 'var(--ds-font-size-lg)', fontWeight: 'var(--ds-font-weight-semibold)' }}>
                {role.permissions.length} permissions
              </div>
            </div>
          ))}
        </Box>
      </Stack>
    </Card>
  );
}
