/**
 * EffectivePermissionsView - Computed Permissions Display
 * Simplified stub implementation for Phase 2
 * Will be enhanced in Phase 3 when actively used
 */
import React from 'react';
import { Card } from '../../primitives';
import { Heading, Paragraph, Alert } from '@digdir/designsystemet-react';

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
  userId: string;
  permissions: EffectivePermission[];
  showSource?: boolean;
  groupByCategory?: boolean;
  showRiskIndicators?: boolean;
  expandAll?: boolean;
  loading?: boolean;
}

export function EffectivePermissionsView(props: EffectivePermissionsViewProps) {
  return (
    <Card style={{ padding: 'var(--ds-spacing-4)' }}>
      <Heading data-size="sm">Effective Permissions</Heading>
      <Paragraph>Computed permissions display - To be implemented in Phase 3</Paragraph>
      <Alert data-color="info">
        This component will be fully implemented when tenant admin features are activated in Phase 3.
      </Alert>
    </Card>
  );
}
