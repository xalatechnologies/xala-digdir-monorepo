/**
 * EffectivePermissionsView - Computed Permissions Display
 *
 * Shows a user's effective permissions after computing:
 * - Role-based permissions
 * - Organization permissions
 * - Scope-based access
 * - Direct permission grants
 *
 * Usage:
 * ```tsx
 * <EffectivePermissionsView
 *   userId="user-123"
 *   permissions={effectivePermissions}
 *   showSource={true}
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
  Stack,
  Box,
  Alert,
  Accordion,
  Chip,
} from '../../primitives';
import {
  ShieldIcon,
  CheckIcon,
  InfoIcon,
  UserIcon,
  BuildingIcon,
  LockIcon,
} from '../../primitives';

export type PermissionSource = 'role' | 'organization' | 'scope' | 'direct';

export interface EffectivePermission {
  id: string;
  name: string;
  description: string;
  category: string;
  source: PermissionSource;
  sourceDetail?: string;
  inherited?: boolean;
  risk?: 'low' | 'medium' | 'high';
}

export interface EffectivePermissionsViewProps {
  /**
   * User ID
   */
  userId: string;

  /**
   * User's effective permissions
   */
  permissions: EffectivePermission[];

  /**
   * Show permission source
   */
  showSource?: boolean;

  /**
   * Group by category
   */
  groupByCategory?: boolean;

  /**
   * Show risk indicators
   */
  showRiskIndicators?: boolean;

  /**
   * Expand all categories by default
   */
  expandAll?: boolean;

  /**
   * Loading state
   */
  loading?: boolean;
}

export function EffectivePermissionsView({
  userId,
  permissions,
  showSource = true,
  groupByCategory = true,
  showRiskIndicators = true,
  expandAll = false,
  loading = false,
}: EffectivePermissionsViewProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    expandAll ? new Set(Array.from(new Set(permissions.map((p) => p.category)))) : new Set()
  );

  // Group permissions by category
  const groupedPermissions = groupByCategory
    ? permissions.reduce((acc, perm) => {
        if (!acc[perm.category]) {
          acc[perm.category] = [];
        }
        acc[perm.category].push(perm);
        return acc;
      }, {} as Record<string, EffectivePermission[]>)
    : { All: permissions };

  // Get source icon and color
  const getSourceDisplay = (source: PermissionSource) => {
    switch (source) {
      case 'role':
        return {
          icon: <UserIcon />,
          label: 'Role',
          color: 'var(--ds-color-accent-base-default)',
        };
      case 'organization':
        return {
          icon: <BuildingIcon />,
          label: 'Organization',
          color: 'var(--ds-color-info-base-default)',
        };
      case 'scope':
        return {
          icon: <LockIcon />,
          label: 'Scope',
          color: 'var(--ds-color-warning-base-default)',
        };
      case 'direct':
        return {
          icon: <ShieldIcon />,
          label: 'Direct',
          color: 'var(--ds-color-success-base-default)',
        };
    }
  };

  // Get risk badge color
  const getRiskBadgeColor = (risk?: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'neutral';
    }
  };

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Count permissions by source
  const sourceStats = permissions.reduce((acc, perm) => {
    acc[perm.source] = (acc[perm.source] || 0) + 1;
    return acc;
  }, {} as Record<PermissionSource, number>);

  if (loading) {
    return (
      <Card>
        <Stack gap={3}>
          <Heading size="sm">Loading permissions...</Heading>
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paragraph>Computing effective permissions...</Paragraph>
          </div>
        </Stack>
      </Card>
    );
  }

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
              Effective Permissions
            </Heading>
          </div>
          <Paragraph size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Computed permissions from all sources
          </Paragraph>
        </div>

        {/* Summary Stats */}
        <Box
          style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-accent-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-accent-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-6)', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                Total Permissions
              </div>
              <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-bold)' }}>
                {permissions.length}
              </div>
            </div>
            {showSource &&
              Object.entries(sourceStats).map(([source, count]) => {
                const display = getSourceDisplay(source as PermissionSource);
                return (
                  <div key={source}>
                    <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      From {display.label}
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--ds-font-size-2xl)',
                        fontWeight: 'var(--ds-font-weight-bold)',
                        color: display.color,
                      }}
                    >
                      {count}
                    </div>
                  </div>
                );
              })}
          </div>
        </Box>

        {/* Permissions by Category */}
        {permissions.length === 0 ? (
          <Alert variant="warning">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <InfoIcon />
              <span>No permissions assigned to this user</span>
            </div>
          </Alert>
        ) : (
          <Accordion>
            {Object.entries(groupedPermissions).map(([category, perms]) => (
              <Accordion.Item key={category} value={category}>
                <Accordion.Trigger>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                      <Heading size="xs" style={{ margin: 0 }}>
                        {category}
                      </Heading>
                      <Badge size="sm" color="neutral">
                        {perms.length}
                      </Badge>
                    </div>
                  </div>
                </Accordion.Trigger>
                <Accordion.Content>
                  <Stack gap={2}>
                    {perms.map((permission) => {
                      const sourceDisplay = getSourceDisplay(permission.source);
                      return (
                        <Box
                          key={permission.id}
                          style={{
                            padding: 'var(--ds-spacing-3)',
                            borderRadius: 'var(--ds-border-radius-md)',
                            border: '1px solid var(--ds-color-neutral-border-subtle)',
                            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: 'var(--ds-spacing-3)',
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 'var(--ds-spacing-2)',
                                  marginBottom: 'var(--ds-spacing-2)',
                                }}
                              >
                                <CheckIcon
                                  style={{
                                    color: 'var(--ds-color-success-base-default)',
                                    flexShrink: 0,
                                  }}
                                />
                                <span style={{ fontWeight: 'var(--ds-font-weight-semibold)' }}>
                                  {permission.name}
                                </span>
                                {permission.inherited && (
                                  <Badge size="sm" color="info">
                                    Inherited
                                  </Badge>
                                )}
                                {showRiskIndicators && permission.risk && (
                                  <Badge size="sm" color={getRiskBadgeColor(permission.risk)}>
                                    {permission.risk} risk
                                  </Badge>
                                )}
                              </div>
                              <Paragraph
                                size="sm"
                                style={{
                                  margin: 0,
                                  color: 'var(--ds-color-neutral-text-subtle)',
                                }}
                              >
                                {permission.description}
                              </Paragraph>
                              {showSource && (
                                <div
                                  style={{
                                    marginTop: 'var(--ds-spacing-2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--ds-spacing-2)',
                                  }}
                                >
                                  <Chip
                                    size="sm"
                                    style={{
                                      backgroundColor: sourceDisplay.color,
                                      color: 'white',
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--ds-spacing-1)',
                                      }}
                                    >
                                      {sourceDisplay.icon}
                                      <span>{sourceDisplay.label}</span>
                                    </div>
                                  </Chip>
                                  {permission.sourceDetail && (
                                    <Paragraph
                                      size="xs"
                                      style={{
                                        margin: 0,
                                        color: 'var(--ds-color-neutral-text-subtle)',
                                      }}
                                    >
                                      {permission.sourceDetail}
                                    </Paragraph>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </Box>
                      );
                    })}
                  </Stack>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion>
        )}

        {/* Info Alert */}
        <Alert variant="info" size="sm">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-2)' }}>
            <InfoIcon style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Note:</strong> Effective permissions are computed in real-time from role assignments,
              organization memberships, scope delegations, and direct grants. Changes to any of these
              sources will automatically update the user's access.
            </div>
          </div>
        </Alert>
      </Stack>
    </Card>
  );
}
