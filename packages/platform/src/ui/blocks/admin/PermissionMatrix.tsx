/**
 * PermissionMatrix - Role Permissions Grid
 * Simplified stub implementation for Phase 2
 * Will be enhanced in Phase 3 when actively used
 */
import React from 'react';
import { Card } from '../../primitives';
import { Heading, Paragraph, Alert } from '@digdir/designsystemet-react';

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
  roles: Role[];
  permissions: Permission[];
  onPermissionToggle?: (roleId: string, permissionId: string, enabled: boolean) => void;
  readOnly?: boolean;
  showRiskIndicators?: boolean;
  groupByCategory?: boolean;
}

export function PermissionMatrix(props: PermissionMatrixProps) {
  return (
    <Card style={{ padding: 'var(--ds-spacing-4)' }}>
      <Heading data-size="sm">Permission Matrix</Heading>
      <Paragraph>Role permissions grid - To be implemented in Phase 3</Paragraph>
      <Alert data-color="info">
        This component will be fully implemented when tenant admin features are activated in Phase 3.
      </Alert>
    </Card>
  );
}
