/**
 * ScopeSelector - Delegation Boundary UI
 *
 * Allows administrators to define the scope of access for a user.
 * Scopes can be none, specific resources, organization-based, category-based, or all.
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Spinner,
  Radio,
  Checkbox,
  Button,
  Textfield,
  Fieldset,
} from '@digdir/designsystemet-react';

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
  /** User ID for whom scope is being configured */
  userId: string;
  /** Current scope assignment */
  currentScope?: ScopeAssignment;
  /** Available rental objects to select from */
  availableObjects?: RentalObject[];
  /** Available organizations to select from */
  availableOrganizations?: Organization[];
  /** Available categories to select from */
  availableCategories?: Array<{ key: string; label: string }>;
  /** Callback when scope changes */
  onScopeChange: (scope: ScopeAssignment) => void | Promise<void>;
  /** Loading state */
  loading?: boolean;
  /** Read-only mode */
  readOnly?: boolean;
  /** Show preview of affected resources */
  showPreview?: boolean;
}

const scopeLabels: Record<ScopeType, string> = {
  none: 'No Access',
  specific: 'Specific Resources',
  organization: 'By Organization',
  category: 'By Category',
  all: 'Full Access',
};

const scopeDescriptions: Record<ScopeType, string> = {
  none: 'User has no access to any resources',
  specific: 'User can access only selected resources',
  organization: 'User can access resources belonging to selected organizations',
  category: 'User can access resources in selected categories',
  all: 'User has access to all resources',
};

/**
 * ScopeSelector - Configure access scope for a user
 *
 * @example
 * ```tsx
 * <ScopeSelector
 *   userId="user-123"
 *   currentScope={{ scopeType: 'specific', rentalObjectIds: ['obj-1'] }}
 *   availableObjects={[{ id: 'obj-1', name: 'Meeting Room A', type: 'room' }]}
 *   availableOrganizations={[{ id: 'org-1', name: 'Oslo Kommune', rentalObjectCount: 15 }]}
 *   availableCategories={[{ key: 'meeting-rooms', label: 'Meeting Rooms' }]}
 *   onScopeChange={(scope) => console.log('Scope changed:', scope)}
 * />
 * ```
 */
export function ScopeSelector({
  userId,
  currentScope = { scopeType: 'none' },
  availableObjects = [],
  availableOrganizations = [],
  availableCategories = [],
  onScopeChange,
  loading = false,
  readOnly = false,
  showPreview = true,
}: ScopeSelectorProps) {
  const [scope, setScope] = useState<ScopeAssignment>(currentScope);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredObjects = useMemo(() => {
    if (!searchQuery) return availableObjects;
    const query = searchQuery.toLowerCase();
    return availableObjects.filter(
      (obj) =>
        obj.name.toLowerCase().includes(query) ||
        obj.type.toLowerCase().includes(query) ||
        obj.category?.toLowerCase().includes(query)
    );
  }, [availableObjects, searchQuery]);

  const handleScopeTypeChange = useCallback((newType: ScopeType) => {
    setScope((prev) => ({
      ...prev,
      scopeType: newType,
      // Clear selections when changing type
      rentalObjectIds: newType === 'specific' ? prev.rentalObjectIds || [] : undefined,
      organizationIds: newType === 'organization' ? prev.organizationIds || [] : undefined,
      categoryKeys: newType === 'category' ? prev.categoryKeys || [] : undefined,
    }));
  }, []);

  const handleObjectToggle = useCallback((objectId: string, checked: boolean) => {
    setScope((prev) => {
      const ids = prev.rentalObjectIds || [];
      return {
        ...prev,
        rentalObjectIds: checked ? [...ids, objectId] : ids.filter((id) => id !== objectId),
      };
    });
  }, []);

  const handleOrganizationToggle = useCallback((orgId: string, checked: boolean) => {
    setScope((prev) => {
      const ids = prev.organizationIds || [];
      return {
        ...prev,
        organizationIds: checked ? [...ids, orgId] : ids.filter((id) => id !== orgId),
      };
    });
  }, []);

  const handleCategoryToggle = useCallback((categoryKey: string, checked: boolean) => {
    setScope((prev) => {
      const keys = prev.categoryKeys || [];
      return {
        ...prev,
        categoryKeys: checked ? [...keys, categoryKey] : keys.filter((k) => k !== categoryKey),
      };
    });
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onScopeChange(scope);
    } finally {
      setIsSaving(false);
    }
  }, [scope, onScopeChange]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(scope) !== JSON.stringify(currentScope);
  }, [scope, currentScope]);

  // Calculate affected resource count for preview
  const affectedCount = useMemo(() => {
    switch (scope.scopeType) {
      case 'none':
        return 0;
      case 'all':
        return availableObjects.length;
      case 'specific':
        return scope.rentalObjectIds?.length || 0;
      case 'organization':
        return availableObjects.filter((obj) =>
          scope.organizationIds?.some((orgId) => {
            const org = availableOrganizations.find((o) => o.id === orgId);
            return org !== undefined;
          })
        ).length;
      case 'category':
        return availableObjects.filter((obj) =>
          scope.categoryKeys?.includes(obj.category || '')
        ).length;
      default:
        return 0;
    }
  }, [scope, availableObjects, availableOrganizations]);

  if (loading) {
    return (
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <Spinner data-size="sm" aria-label="Loading scope configuration" />
          <Paragraph>Loading scope configuration...</Paragraph>
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ padding: 'var(--ds-spacing-4)' }}>
      <Heading data-size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        Access Scope
      </Heading>

      {/* Scope Type Selection */}
      <Fieldset style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <Fieldset.Legend>Scope Type</Fieldset.Legend>
        <Fieldset.Description>Select the level of access for this user</Fieldset.Description>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
          {(Object.keys(scopeLabels) as ScopeType[]).map((type) => (
            <Radio
              key={type}
              name="scope-type"
              value={type}
              checked={scope.scopeType === type}
              onChange={() => handleScopeTypeChange(type)}
              disabled={readOnly}
              label={scopeLabels[type]}
              description={scopeDescriptions[type]}
            />
          ))}
        </div>
      </Fieldset>

      {/* Specific Resources Selection */}
      {scope.scopeType === 'specific' && availableObjects.length > 0 && (
        <Fieldset style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          <Fieldset.Legend>Select Resources</Fieldset.Legend>
          <div style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            <Textfield
              aria-label="Search resources"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
            />
          </div>
          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid var(--ds-color-neutral-border-subtle)',
              borderRadius: 'var(--ds-border-radius-md)',
              padding: 'var(--ds-spacing-2)',
            }}
          >
            {filteredObjects.map((obj) => (
              <Checkbox
                key={obj.id}
                value={obj.id}
                checked={scope.rentalObjectIds?.includes(obj.id) || false}
                onChange={(e) => handleObjectToggle(obj.id, e.target.checked)}
                disabled={readOnly}
                label={`${obj.name} (${obj.type})`}
                style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)' }}
              />
            ))}
          </div>
        </Fieldset>
      )}

      {/* Organization Selection */}
      {scope.scopeType === 'organization' && availableOrganizations.length > 0 && (
        <Fieldset style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          <Fieldset.Legend>Select Organizations</Fieldset.Legend>
          <div
            style={{
              border: '1px solid var(--ds-color-neutral-border-subtle)',
              borderRadius: 'var(--ds-border-radius-md)',
              padding: 'var(--ds-spacing-2)',
            }}
          >
            {availableOrganizations.map((org) => (
              <Checkbox
                key={org.id}
                value={org.id}
                checked={scope.organizationIds?.includes(org.id) || false}
                onChange={(e) => handleOrganizationToggle(org.id, e.target.checked)}
                disabled={readOnly}
                label={
                  org.rentalObjectCount !== undefined
                    ? `${org.name} (${org.rentalObjectCount} resources)`
                    : org.name
                }
                style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)' }}
              />
            ))}
          </div>
        </Fieldset>
      )}

      {/* Category Selection */}
      {scope.scopeType === 'category' && availableCategories.length > 0 && (
        <Fieldset style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          <Fieldset.Legend>Select Categories</Fieldset.Legend>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
            {availableCategories.map((cat) => (
              <Checkbox
                key={cat.key}
                value={cat.key}
                checked={scope.categoryKeys?.includes(cat.key) || false}
                onChange={(e) => handleCategoryToggle(cat.key, e.target.checked)}
                disabled={readOnly}
                label={cat.label}
              />
            ))}
          </div>
        </Fieldset>
      )}

      {/* Preview */}
      {showPreview && (
        <div
          style={{
            padding: 'var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            marginBottom: 'var(--ds-spacing-4)',
          }}
        >
          <Paragraph data-size="sm">
            <strong>Preview:</strong> {affectedCount} resource(s) affected
          </Paragraph>
        </div>
      )}

      {/* Actions */}
      {!readOnly && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--ds-spacing-2)' }}>
          <Button
            variant="secondary"
            onClick={() => setScope(currentScope)}
            disabled={!hasChanges || isSaving}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </Card>
  );
}
