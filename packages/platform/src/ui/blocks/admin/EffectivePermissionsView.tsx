/**
 * EffectivePermissionsView - Computed Permissions Display
 *
 * Shows all effective permissions for a user, including where they come from
 * (direct assignment, role inheritance, organization membership, or scope).
 * Permissions can be grouped by category and show risk indicators.
 */
import React, { useMemo } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Spinner,
} from '@digdir/designsystemet-react';
import { Badge, type BadgeVariant } from '../../composed/Badge';
import { Collapsible } from '../../composed/Accordion';

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
  /** User ID whose permissions are being viewed */
  userId: string;
  /** List of effective permissions */
  permissions: EffectivePermission[];
  /** Show the source of each permission */
  showSource?: boolean;
  /** Group permissions by category */
  groupByCategory?: boolean;
  /** Show risk indicators for high-risk permissions */
  showRiskIndicators?: boolean;
  /** Expand all categories by default */
  expandAll?: boolean;
  /** Loading state */
  loading?: boolean;
}

const sourceBadgeVariants: Record<PermissionSource, BadgeVariant> = {
  direct: 'success',
  role: 'info',
  organization: 'warning',
  scope: 'default',
};

const sourceLabels: Record<PermissionSource, string> = {
  direct: 'Direct',
  role: 'Role',
  organization: 'Organization',
  scope: 'Scope',
};

const riskBadgeVariants: Record<string, BadgeVariant> = {
  low: 'default',
  medium: 'warning',
  high: 'danger',
};

const riskLabels: Record<string, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
};

/**
 * EffectivePermissionsView - Displays computed permissions for a user
 *
 * @example
 * ```tsx
 * <EffectivePermissionsView
 *   userId="user-123"
 *   permissions={[
 *     {
 *       id: 'perm-1',
 *       name: 'View Bookings',
 *       description: 'Can view all bookings',
 *       category: 'Bookings',
 *       source: 'role',
 *       sourceDetail: 'Admin',
 *       risk: 'low',
 *     },
 *   ]}
 *   showSource
 *   groupByCategory
 *   showRiskIndicators
 * />
 * ```
 */
export function EffectivePermissionsView({
  userId,
  permissions,
  showSource = true,
  groupByCategory = true,
  showRiskIndicators = true,
  expandAll = false,
  loading = false,
}: EffectivePermissionsViewProps) {
  // Group permissions by category
  const groupedPermissions = useMemo(() => {
    if (!groupByCategory) {
      return { 'All Permissions': permissions };
    }

    return permissions.reduce(
      (acc, perm) => {
        const category = perm.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(perm);
        return acc;
      },
      {} as Record<string, EffectivePermission[]>
    );
  }, [permissions, groupByCategory]);

  if (loading) {
    return (
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <Spinner data-size="sm" aria-label="Loading permissions" />
          <Paragraph>Loading permissions...</Paragraph>
        </div>
      </Card>
    );
  }

  if (permissions.length === 0) {
    return (
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <Heading data-size="sm">Effective Permissions</Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          No permissions assigned to this user.
        </Paragraph>
      </Card>
    );
  }

  const categories = Object.keys(groupedPermissions).sort();
  const totalCount = permissions.length;
  const highRiskCount = permissions.filter((p) => p.risk === 'high').length;

  return (
    <Card style={{ padding: 'var(--ds-spacing-4)' }}>
      <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <Heading data-size="sm">Effective Permissions</Heading>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-2)' }}>
          <Badge variant="default" size="sm">
            {totalCount} Total
          </Badge>
          {showRiskIndicators && highRiskCount > 0 && (
            <Badge variant="danger" size="sm">
              {highRiskCount} High Risk
            </Badge>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
        {categories.map((category) => {
          const categoryPermissions = groupedPermissions[category] || [];

          return (
            <Collapsible
              key={category}
              title={`${category} (${categoryPermissions.length})`}
              defaultOpen={expandAll}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--ds-spacing-3)',
                }}
              >
                {categoryPermissions.map((permission) => (
                  <div
                    key={permission.id}
                    style={{
                      padding: 'var(--ds-spacing-3)',
                      backgroundColor: 'var(--ds-color-neutral-surface-default)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      border: '1px solid var(--ds-color-neutral-border-subtle)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div>
                        <Heading data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                          {permission.name}
                        </Heading>
                        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {permission.description}
                        </Paragraph>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--ds-spacing-1)' }}>
                        {showSource && (
                          <Badge
                            variant={sourceBadgeVariants[permission.source]}
                            size="sm"
                          >
                            {sourceLabels[permission.source]}
                            {permission.sourceDetail && `: ${permission.sourceDetail}`}
                          </Badge>
                        )}
                        {showRiskIndicators && permission.risk && (
                          <Badge
                            variant={riskBadgeVariants[permission.risk]}
                            size="sm"
                          >
                            {riskLabels[permission.risk]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Collapsible>
          );
        })}
      </div>
    </Card>
  );
}
