/**
 * Category Entitlements Tab Component
 * Manages which rental object categories are enabled for a tenant
 */

import { useState, useMemo } from 'react';
import { useT } from '@xala/i18n';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Spinner,
  Checkbox,
  SaveIcon,
} from '@xala/ds';
import { useSaasTenantCategories, useUpdateSaasTenantCategories } from '@digilist/client-sdk/hooks';
import type { CategoryEntitlement } from '@digilist/client-sdk/types';

// Well-known rental object categories from the platform
const RENTAL_OBJECT_CATEGORIES = [
  { key: 'LOKALER_OG_BANER', name: 'Lokaler og baner', description: 'Idrettshaller, gymsaler, møterom' },
  { key: 'UTSTYR', name: 'Utstyr', description: 'Sportsutstyr, lyd/lys, AV-utstyr' },
  { key: 'ARRANGEMENT', name: 'Arrangement', description: 'Festivaler, messer, konferanser' },
  { key: 'PARKERING', name: 'Parkering', description: 'Parkeringsplasser, garasjer' },
  { key: 'UTLEIE_BOLIG', name: 'Utleiebolig', description: 'Leiligheter, hytter, boliger' },
  { key: 'KJØRETØY', name: 'Kjøretøy', description: 'Biler, båter, sykler' },
  { key: 'KONTOR', name: 'Kontor', description: 'Kontorplasser, coworking' },
  { key: 'LAGER', name: 'Lager', description: 'Lagerlokaler, boder' },
] as const;

interface CategoryEntitlementsTabProps {
  tenantId: string;
}

export function CategoryEntitlementsTab({ tenantId }: CategoryEntitlementsTabProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  // Queries
  const { data: categoriesData, isLoading } = useSaasTenantCategories(tenantId);
  const t = useT();
  const categories = categoriesData?.data ?? [];

  // Mutations
  const updateMutation = useUpdateSaasTenantCategories();

  // Create a map of current entitlements
  const entitlementsMap = useMemo(() => {
    const map = new Map<string, CategoryEntitlement>();
    categories.forEach((cat) => {
      map.set(cat.categoryKey, cat);
    });
    return map;
  }, [categories]);

  // Initialize selected categories from current entitlements
  useMemo(() => {
    const enabled = new Set<string>();
    categories.forEach((cat) => {
      if (cat.enabled) {
        enabled.add(cat.categoryKey);
      }
    });
    setSelectedCategories(enabled);
  }, [categories]);

  const handleToggleCategory = (categoryKey: string) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey);
      } else {
        newSet.add(categoryKey);
      }
      return newSet;
    });
    setHasChanges(true);
  };

  const handleSelectAll = () => {
    setSelectedCategories(new Set(RENTAL_OBJECT_CATEGORIES.map((c) => c.key)));
    setHasChanges(true);
  };

  const handleDeselectAll = () => {
    setSelectedCategories(new Set());
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        tenantId,
        data: {
          categories: RENTAL_OBJECT_CATEGORIES.map((cat) => ({
            categoryKey: cat.key,
            enabled: selectedCategories.has(cat.key),
            reason: 'Updated by SaaS Admin',
          })),
        },
      });
      setHasChanges(false);
    } catch (error) {
      console.error(t('validation.failed_to_update_categories'), error);
    }
  };

  if (isLoading) {
    return (
      <Card style={{ padding: 'var(--ds-spacing-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
          <Spinner aria-label={t('common.laster_kategorier')} />
        </div>
      </Card>
    );
  }

  const enabledCount = selectedCategories.size;

  return (
    <Card style={{ padding: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-4)' }}>
        <div>
          <Heading level={3} size="sm" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
            Kategorier for leieobjekter
          </Heading>
          <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            Velg hvilke kategorier av leieobjekter denne tenanten kan opprette
          </Paragraph>
        </div>
        <Badge color={enabledCount > 0 ? 'success' : 'warning'}>
          {enabledCount} av {RENTAL_OBJECT_CATEGORIES.length} aktive
        </Badge>
      </div>

      {/* Bulk actions */}
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-4)' }}>
        <Button variant="tertiary" size="sm" onClick={handleSelectAll} type="button">
          Velg alle
        </Button>
        <Button variant="tertiary" size="sm" onClick={handleDeselectAll} type="button">
          Fjern alle
        </Button>
      </div>

      {/* Category grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--ds-spacing-3)' }}>
        {RENTAL_OBJECT_CATEGORIES.map((category) => {
          const isEnabled = selectedCategories.has(category.key);
          const entitlement = entitlementsMap.get(category.key);

          return (
            <div
              key={category.key}
              style={{
                padding: 'var(--ds-spacing-4)',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: isEnabled ? 'var(--ds-color-success-surface-default)' : 'var(--ds-color-neutral-surface-default)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => handleToggleCategory(category.key)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <Paragraph size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {category.name}
                  </Paragraph>
                  <Paragraph size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {category.description}
                  </Paragraph>
                  <code style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {category.key}
                  </code>
                </div>
                <Checkbox
                  checked={isEnabled}
                  onChange={() => handleToggleCategory(category.key)}
                  aria-label={`Aktiver ${category.name}`}
                />
              </div>
              {entitlement?.reason && (
                <Paragraph size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-info-text-default)' }}>
                  {entitlement.reason}
                </Paragraph>
              )}
            </div>
          );
        })}
      </div>

      {/* Save button */}
      {hasChanges && (
        <div style={{ marginTop: 'var(--ds-spacing-4)', display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Spinner size="sm" aria-label="Lagrer..." />
            ) : (
              <>
                <SaveIcon />
                Lagre endringer
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
}

export default CategoryEntitlementsTab;
