/**
 * Feature Flags Management Page
 *
 * TenantAdmin page for managing module-based feature flags
 * Uses SDK's module system for enable/disable functionality
 */

import { useState, useEffect } from 'react';
import { useT } from '@xalatechnologies/platform/i18n';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Switch,
  Badge,
  Spinner,
  Alert,
} from '@xalatechnologies/platform/ui';
import { useModulesManager, useModuleCatalog, useEffectiveModules } from '@digilist/client-sdk/hooks';

const MOBILE_BREAKPOINT = 768;

// Category display names and descriptions
const categoryInfo: Record<string, { name: string; description: string }> = {
  core: { name: 'Kjernefunksjoner', description: t('common.nodvendige_systemfunksjoner_som_ikke') },
  booking: { name: 'Booking', description: t('common.funksjoner_relatert_til_booking') },
  communication: { name: 'Kommunikasjon', description: t('common.meldinger_varsler_og_notifikasjoner') },
  economy: { name: t('common.okonomi'), description: t('common.betalinger_fakturering_og_priser') },
  users: { name: 'Brukere', description: t('common.brukeradministrasjon_og_rbac') },
  content: { name: 'Innhold', description: t('common.anmeldelser_ratings_og_brukerinnhold') },
  advanced: { name: 'Avansert', description: t('common.avanserte_funksjoner_og_integrasjoner') },
};

export function TenantFeaturesPage() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['core', 'booking']));

  // Use SDK hooks for module management
  const { catalog: _catalog, effective: _effective, isLoading, error, toggleModule, isToggling } = useModulesManager();
  const t = useT();
  const { data: catalogData } = useModuleCatalog();
  const { data: effectiveData, refetch } = useEffectiveModules();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleToggleModule = (moduleKey: string, currentEnabled: boolean) => {
    toggleModule(
      { key: moduleKey, update: { enabled: !currentEnabled } },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  // Get module enabled state from effective data
  const getModuleState = (key: string): boolean => {
    const module = effectiveData?.data?.modules?.find(m => m.key === key);
    return module?.enabled ?? false;
  };

  // Group catalog modules by category
  const modulesByCategory = catalogData?.data?.modules?.reduce((acc, module) => {
    const category = module.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(module);
    return acc;
  }, {} as Record<string, typeof catalogData.data.modules>) ?? {};

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spinner data-size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert data-color="danger">
        <Heading level={3} data-size="xs">{t('backoffice.text.feilVedLastingAvModuler')}</Heading>
        <Paragraph data-size="sm">
          {error instanceof Error ? error.message : 'En ukjent feil oppstod'}
        </Paragraph>
      </Alert>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: 'var(--ds-spacing-4)',
      }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            Funksjoner og moduler
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            Aktiver eller deaktiver funksjoner for hele plattformen
          </Paragraph>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
          <Badge data-color="info" data-size="md">
            {effectiveData?.data?.modules?.filter(m => m.enabled).length ?? 0} aktive
          </Badge>
          <Badge data-color="neutral" data-size="md">
            {catalogData?.data?.modules?.length ?? 0} totalt
          </Badge>
        </div>
      </div>

      {/* Capabilities Summary */}
      <Card style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-accent-surface-default)' }}>
        <Heading level={2} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
          Aktive kapabiliteter
        </Heading>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
          {Object.entries(effectiveData?.data?.capabilities ?? {})
            .filter(([_, enabled]) => enabled)
            .map(([cap]) => (
              <Badge key={cap} data-color="success" data-size="sm">
                {cap}
              </Badge>
            ))}
          {Object.keys(effectiveData?.data?.capabilities ?? {}).length === 0 && (
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              Ingen kapabiliteter aktive
            </Paragraph>
          )}
        </div>
      </Card>

      {/* Module Categories */}
      {Object.entries(modulesByCategory).map(([category, modules]) => {
        const categoryMeta = categoryInfo[category] ?? { name: category, description: '' };
        const isExpanded = expandedCategories.has(category);
        const enabledCount = modules.filter(m => getModuleState(m.key)).length;

        return (
          <Card key={category} style={{ padding: 0, overflow: 'hidden' }}>
            {/* Category Header */}
            <Button
              type="button"
              variant="tertiary"
              onClick={() => toggleCategory(category)}
              style={{
                width: '100%',
                padding: 'var(--ds-spacing-5)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                border: 'none',
                cursor: 'pointer',
                borderBottom: isExpanded ? '1px solid var(--ds-color-neutral-border-subtle)' : 'none',
                borderRadius: 0,
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <Heading level={2} data-size="sm" style={{ margin: 0 }}>
                  {categoryMeta.name}
                </Heading>
                <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {categoryMeta.description}
                </Paragraph>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                <Badge data-color={enabledCount > 0 ? 'success' : 'neutral'} data-size="sm">
                  {enabledCount}/{modules.length}
                </Badge>
                <span style={{
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  fontSize: 'var(--ds-font-size-lg)',
                }}>
                  ▼
                </span>
              </div>
            </Button>

            {/* Category Modules */}
            {isExpanded && (
              <div style={{ padding: 'var(--ds-spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                {modules.map((module) => {
                  const isEnabled = getModuleState(module.key);
                  const hasDependencies = module.dependencies && module.dependencies.length > 0;
                  const dependenciesMet = !hasDependencies ||
                    module.dependencies.every(dep => getModuleState(dep));

                  return (
                    <div
                      key={module.key}
                      style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        gap: 'var(--ds-spacing-3)',
                        padding: 'var(--ds-spacing-4)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        backgroundColor: isEnabled
                          ? 'var(--ds-color-success-surface-default)'
                          : 'var(--ds-color-neutral-surface-hover)',
                        opacity: module.isCore ? 0.8 : 1,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-1)' }}>
                          <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                            {module.name?.no ?? module.key}
                          </Paragraph>
                          {module.isCore && (
                            <Badge data-color="info" data-size="xs">{t('backoffice.text.kjerne')}</Badge>
                          )}
                          {!dependenciesMet && (
                            <Badge data-color="warning" data-size="xs">{t('backoffice.text.manglerAvhengigheter')}</Badge>
                          )}
                        </div>
                        <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {module.description?.no ?? ''}
                        </Paragraph>

                        {/* Dependencies */}
                        {hasDependencies && (
                          <div style={{ marginTop: 'var(--ds-spacing-2)' }}>
                            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                              Avhenger av:{' '}
                              {module.dependencies.map((dep, i) => (
                                <span key={dep}>
                                  <Badge
                                    data-color={getModuleState(dep) ? 'success' : 'danger'}
                                    data-size="xs"
                                  >
                                    {dep}
                                  </Badge>
                                  {i < module.dependencies.length - 1 && ', '}
                                </span>
                              ))}
                            </Paragraph>
                          </div>
                        )}

                        {/* Capabilities granted */}
                        {module.capabilities && module.capabilities.length > 0 && (
                          <div style={{ marginTop: 'var(--ds-spacing-2)', display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-1)' }}>
                            {module.capabilities.map(cap => (
                              <Badge key={cap} data-color="neutral" data-size="xs">
                                +{cap}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                        {module.isCore ? (
                          <Badge data-color="info" data-size="sm">{t('backoffice.text.alltidAktiv')}</Badge>
                        ) : (
                          <Switch
                            checked={isEnabled}
                            onChange={() => handleToggleModule(module.key, isEnabled)}
                            disabled={isToggling || (!isEnabled && !dependenciesMet)}
                            aria-label={`Toggle ${module.name?.no ?? module.key}`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}

      {/* Empty state */}
      {Object.keys(modulesByCategory).length === 0 && (
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            Ingen moduler tilgjengelig. Kontakt systemadministrator.
          </Paragraph>
        </Card>
      )}

      {/* Info Card */}
      <Card style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-info-surface-default)' }}>
        <Heading level={3} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
          Om funksjonsmoduler
        </Heading>
        <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
          Funksjonsmoduler lar deg aktivere eller deaktivere deler av systemet. Noen moduler er
          avhengige av andre - disse må aktiveres først. Kjernemodulene kan ikke deaktiveres
          da de er nødvendige for at systemet skal fungere.
        </Paragraph>
      </Card>
    </div>
  );
}

export default TenantFeaturesPage;
