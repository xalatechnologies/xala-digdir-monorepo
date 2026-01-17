/**
 * ScopeSelector - Delegation Boundary UI
 *
 * Allows tenant admins to assign case handlers to specific:
 * - Rental objects (specific access)
 * - Organizations (organization-level access)
 * - Categories (category-level access)
 * - Global (full tenant access)
 *
 * Usage:
 * ```tsx
 * <ScopeSelector
 *   userId="user-123"
 *   currentScope={userScope}
 *   availableObjects={rentalObjects}
 *   onScopeChange={handleScopeChange}
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
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  Stack,
  Box,
  Alert,
  Search,
} from '../../primitives';
import {
  BuildingIcon,
  UsersIcon,
  TagIcon,
  GlobeIcon,
  CheckIcon,
} from '../../primitives';

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
  /**
   * User ID for scope assignment
   */
  userId: string;

  /**
   * Current scope assignment
   */
  currentScope?: ScopeAssignment;

  /**
   * Available rental objects
   */
  availableObjects?: RentalObject[];

  /**
   * Available organizations
   */
  availableOrganizations?: Organization[];

  /**
   * Available categories
   */
  availableCategories?: string[];

  /**
   * Callback when scope changes
   */
  onScopeChange: (scope: ScopeAssignment) => void;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Read-only mode
   */
  readOnly?: boolean;

  /**
   * Show visual preview of scope
   */
  showPreview?: boolean;
}

export function ScopeSelector({
  userId,
  currentScope,
  availableObjects = [],
  availableOrganizations = [],
  availableCategories = [],
  onScopeChange,
  loading = false,
  readOnly = false,
  showPreview = true,
}: ScopeSelectorProps) {
  const [scopeType, setScopeType] = useState<ScopeType>(
    currentScope?.scopeType || 'none'
  );
  const [selectedObjects, setSelectedObjects] = useState<string[]>(
    currentScope?.rentalObjectIds || []
  );
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>(
    currentScope?.organizationIds || []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentScope?.categoryKeys || []
  );
  const [searchQuery, setSearchQuery] = useState('');

  const handleScopeTypeChange = (newType: ScopeType) => {
    setScopeType(newType);

    // Build scope assignment
    const scope: ScopeAssignment = {
      scopeType: newType,
    };

    if (newType === 'specific') {
      scope.rentalObjectIds = selectedObjects;
    } else if (newType === 'organization') {
      scope.organizationIds = selectedOrganizations;
    } else if (newType === 'category') {
      scope.categoryKeys = selectedCategories;
    }

    onScopeChange(scope);
  };

  const handleObjectSelection = (objectIds: string[]) => {
    setSelectedObjects(objectIds);
    onScopeChange({
      scopeType: 'specific',
      rentalObjectIds: objectIds,
    });
  };

  const handleOrganizationSelection = (orgIds: string[]) => {
    setSelectedOrganizations(orgIds);
    onScopeChange({
      scopeType: 'organization',
      organizationIds: orgIds,
    });
  };

  const handleCategorySelection = (categories: string[]) => {
    setSelectedCategories(categories);
    onScopeChange({
      scopeType: 'category',
      categoryKeys: categories,
    });
  };

  // Filter items based on search
  const filteredObjects = availableObjects.filter((obj) =>
    obj.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card
      style={{
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
      }}
    >
      <Stack gap={4}>
        <div>
          <Heading size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            Scope Delegation
          </Heading>
          <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            Define which rental objects this user can access and manage
          </Paragraph>
        </div>

        {/* Scope Type Selection */}
        <RadioGroup
          value={scopeType}
          onChange={(value) => handleScopeTypeChange(value as ScopeType)}
          disabled={readOnly || loading}
        >
          <Stack gap={3}>
            {/* No Access */}
            <Box
              style={{
                padding: 'var(--ds-spacing-4)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: `2px solid ${
                  scopeType === 'none'
                    ? 'var(--ds-color-accent-border-default)'
                    : 'var(--ds-color-neutral-border-subtle)'
                }`,
                backgroundColor:
                  scopeType === 'none'
                    ? 'var(--ds-color-accent-surface-subtle)'
                    : 'transparent',
                cursor: readOnly ? 'not-allowed' : 'pointer',
              }}
            >
              <Radio value="none" label={
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-semibold)' }}>
                      No Access
                    </div>
                    <Paragraph size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      User cannot access any rental objects
                    </Paragraph>
                  </div>
                </div>
              } />
            </Box>

            {/* Specific Objects */}
            <Box
              style={{
                padding: 'var(--ds-spacing-4)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: `2px solid ${
                  scopeType === 'specific'
                    ? 'var(--ds-color-accent-border-default)'
                    : 'var(--ds-color-neutral-border-subtle)'
                }`,
                backgroundColor:
                  scopeType === 'specific'
                    ? 'var(--ds-color-accent-surface-subtle)'
                    : 'transparent',
              }}
            >
              <Radio value="specific" label={
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                  <BuildingIcon style={{ color: 'var(--ds-color-accent-base-default)' }} />
                  <div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-semibold)' }}>
                      Specific Objects
                    </div>
                    <Paragraph size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Select individual rental objects
                    </Paragraph>
                  </div>
                </div>
              } />

              {scopeType === 'specific' && (
                <div style={{ marginTop: 'var(--ds-spacing-4)', marginLeft: 'var(--ds-spacing-10)' }}>
                  <Search
                    placeholder="Search rental objects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ marginBottom: 'var(--ds-spacing-3)' }}
                  />
                  <CheckboxGroup
                    value={selectedObjects}
                    onChange={handleObjectSelection}
                    disabled={readOnly || loading}
                  >
                    <Stack gap={2}>
                      {filteredObjects.map((obj) => (
                        <Checkbox
                          key={obj.id}
                          value={obj.id}
                          label={
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                              <span>{obj.name}</span>
                              <Badge size="sm" color="neutral">{obj.type}</Badge>
                            </div>
                          }
                        />
                      ))}
                    </Stack>
                  </CheckboxGroup>
                  {selectedObjects.length > 0 && (
                    <Alert variant="info" size="sm" style={{ marginTop: 'var(--ds-spacing-3)' }}>
                      {selectedObjects.length} object{selectedObjects.length !== 1 ? 's' : ''} selected
                    </Alert>
                  )}
                </div>
              )}
            </Box>

            {/* Organization Level */}
            <Box
              style={{
                padding: 'var(--ds-spacing-4)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: `2px solid ${
                  scopeType === 'organization'
                    ? 'var(--ds-color-accent-border-default)'
                    : 'var(--ds-color-neutral-border-subtle)'
                }`,
                backgroundColor:
                  scopeType === 'organization'
                    ? 'var(--ds-color-accent-surface-subtle)'
                    : 'transparent',
              }}
            >
              <Radio value="organization" label={
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                  <UsersIcon style={{ color: 'var(--ds-color-accent-base-default)' }} />
                  <div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-semibold)' }}>
                      Organization Level
                    </div>
                    <Paragraph size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Access all objects within selected organizations
                    </Paragraph>
                  </div>
                </div>
              } />

              {scopeType === 'organization' && (
                <div style={{ marginTop: 'var(--ds-spacing-4)', marginLeft: 'var(--ds-spacing-10)' }}>
                  <CheckboxGroup
                    value={selectedOrganizations}
                    onChange={handleOrganizationSelection}
                    disabled={readOnly || loading}
                  >
                    <Stack gap={2}>
                      {availableOrganizations.map((org) => (
                        <Checkbox
                          key={org.id}
                          value={org.id}
                          label={
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                              <span>{org.name}</span>
                              {org.rentalObjectCount && (
                                <Badge size="sm" color="neutral">
                                  {org.rentalObjectCount} objects
                                </Badge>
                              )}
                            </div>
                          }
                        />
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </div>
              )}
            </Box>

            {/* Category Level */}
            <Box
              style={{
                padding: 'var(--ds-spacing-4)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: `2px solid ${
                  scopeType === 'category'
                    ? 'var(--ds-color-accent-border-default)'
                    : 'var(--ds-color-neutral-border-subtle)'
                }`,
                backgroundColor:
                  scopeType === 'category'
                    ? 'var(--ds-color-accent-surface-subtle)'
                    : 'transparent',
              }}
            >
              <Radio value="category" label={
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                  <TagIcon style={{ color: 'var(--ds-color-accent-base-default)' }} />
                  <div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-semibold)' }}>
                      Category Level
                    </div>
                    <Paragraph size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Access all objects in specific categories
                    </Paragraph>
                  </div>
                </div>
              } />

              {scopeType === 'category' && (
                <div style={{ marginTop: 'var(--ds-spacing-4)', marginLeft: 'var(--ds-spacing-10)' }}>
                  <CheckboxGroup
                    value={selectedCategories}
                    onChange={handleCategorySelection}
                    disabled={readOnly || loading}
                  >
                    <Stack gap={2}>
                      {availableCategories.map((category) => (
                        <Checkbox
                          key={category}
                          value={category}
                          label={category.charAt(0).toUpperCase() + category.slice(1)}
                        />
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </div>
              )}
            </Box>

            {/* Global Access */}
            <Box
              style={{
                padding: 'var(--ds-spacing-4)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: `2px solid ${
                  scopeType === 'all'
                    ? 'var(--ds-color-accent-border-default)'
                    : 'var(--ds-color-neutral-border-subtle)'
                }`,
                backgroundColor:
                  scopeType === 'all'
                    ? 'var(--ds-color-accent-surface-subtle)'
                    : 'transparent',
              }}
            >
              <Radio value="all" label={
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                  <GlobeIcon style={{ color: 'var(--ds-color-success-base-default)' }} />
                  <div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-semibold)' }}>
                      Global Access
                    </div>
                    <Paragraph size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Full access to all rental objects in the tenant
                    </Paragraph>
                  </div>
                </div>
              } />
            </Box>
          </Stack>
        </RadioGroup>

        {/* Preview */}
        {showPreview && scopeType !== 'none' && (
          <Alert variant="success">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <CheckIcon />
              <div>
                <strong>Scope Active:</strong>{' '}
                {scopeType === 'all' && 'User has full access to all rental objects'}
                {scopeType === 'specific' && `Access to ${selectedObjects.length} specific object(s)`}
                {scopeType === 'organization' && `Access via ${selectedOrganizations.length} organization(s)`}
                {scopeType === 'category' && `Access to ${selectedCategories.length} category(ies)`}
              </div>
            </div>
          </Alert>
        )}
      </Stack>
    </Card>
  );
}
