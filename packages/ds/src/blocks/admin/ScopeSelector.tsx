/**
 * ScopeSelector - Delegation Boundary UI
 * Simplified stub implementation for Phase 2
 * Will be enhanced in Phase 3 when actively used
 */
import React from 'react';
import { Card, Heading, Paragraph, Alert } from '@digdir/designsystemet-react';

export type ScopeType = 'none' | 'specific' | 'organization' | 'category' | 'all';

export interface RentalObject {
  id: string;
  name: string;
  type: string;
  category?: string;
}

export interface Organization {
  id: string;
  name: string;
  rentalObjectCount?: number;
}

export interface ScopeAssignment {
  scopeType: ScopeType;
  rentalObjectIds?: string[];
  organizationIds?: string[];
  categoryKeys?: string[];
}

export interface ScopeSelectorProps {
  userId: string;
  currentScope?: ScopeAssignment;
  availableObjects?: RentalObject[];
  availableOrganizations?: Organization[];
  availableCategories?: Array<{ key: string; label: string }>;
  onScopeChange: (scope: ScopeAssignment) => void | Promise<void>;
  loading?: boolean;
  readOnly?: boolean;
  showPreview?: boolean;
}

export function ScopeSelector(props: ScopeSelectorProps) {
  return (
    <Card style={{ padding: 'var(--ds-spacing-4)' }}>
      <Heading size="sm">Scope Selector</Heading>
      <Paragraph>Scope delegation UI - To be implemented in Phase 3</Paragraph>
      <Alert variant="info">
        This component will be fully implemented when tenant admin features are activated in Phase 3.
      </Alert>
    </Card>
  );
}
