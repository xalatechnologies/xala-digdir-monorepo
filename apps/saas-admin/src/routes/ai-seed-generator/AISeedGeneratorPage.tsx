/**
 * AI Seed Generator Page
 * SaaS Admin page for generating demo data using AI
 * 
 * Provides form UI for selecting entity types, counts, and target tenants
 */

import { useState } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Select,
  Textfield,
  Spinner,
  Badge,
  Stack,
  SparklesIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@xala/ds';
import { useSaasTenants } from '@digilist/client-sdk/hooks';
import { useT } from '@xala/i18n';

// Entity types available for AI generation (keys for i18n, translated in component)
const ENTITY_TYPES = [
  { value: 'rental_objects', labelKey: 'common.leieobjekter', descriptionKey: 'common.lokaler_utstyr_anlegg', count: '5-50' },
  { value: 'users', labelKey: 'common.brukere', descriptionKey: 'common.sluttbrukere_og_admins', count: '10-100' },
  { value: 'organizations', labelKey: 'common.organisasjoner', descriptionKey: 'common.idrettslag_foreninger', count: '5-30' },
  { value: 'bookings', labelKey: 'common.bookinger', descriptionKey: 'common.reservasjoner_og_kalenderdata', count: '20-200' },
  { value: 'reviews', labelKey: 'common.anmeldelser', descriptionKey: 'common.ratings_og_tilbakemeldinger', count: '10-100' },
] as const;

// Preset configurations (keys for i18n, translated in component)
const PRESETS = [
  { nameKey: 'common.demo_kommune', entities: { rental_objects: 15, users: 25, organizations: 8, bookings: 50 } },
  { nameKey: 'common.lite_testmiljo', entities: { rental_objects: 5, users: 10, organizations: 3, bookings: 15 } },
  { nameKey: 'common.stort_produksjonsmiljo', entities: { rental_objects: 40, users: 100, organizations: 25, bookings: 200 } },
];

interface GenerationConfig {
  entityType: string;
  count: number;
  tenantId: string;
}

interface GenerationResult {
  success: boolean;
  message: string;
  entitiesCreated?: number;
  duration?: number;
}

export function AISeedGeneratorPage() {
  const t = useT();

  // Form state
  const [config, setConfig] = useState<GenerationConfig>({
    entityType: 'rental_objects',
    count: 10,
    tenantId: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [generationLog, setGenerationLog] = useState<string[]>([]);

  // Queries
  const { data: tenantsData, isLoading: loadingTenants } = useSaasTenants({ status: 'active', limit: 100 });
  const tenants = tenantsData?.data ?? [];

  const handlePresetSelect = (presetName: string) => {
    const preset = PRESETS.find((p) => p.nameKey === presetName);
    if (preset) {
      const firstEntity = Object.entries(preset.entities)[0];
      if (firstEntity) {
        setConfig((prev) => ({
          ...prev,
          entityType: firstEntity[0],
          count: firstEntity[1],
        }));
      }
    }
  };

  const handleGenerate = async () => {
    if (!config.tenantId) {
      setResult({ success: false, message: 'Velg en tenant først' });
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setGenerationLog([]);

    try {
      const startTime = Date.now();
      setGenerationLog((prev) => [...prev, `Starter generering av ${config.count} ${config.entityType}...`]);

      // Call the API endpoint
      const response = await fetch('/api/admin/ai-seed-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: config.entityType,
          count: config.count,
          tenantId: config.tenantId,
        }),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (response.ok) {
        setGenerationLog((prev) => [...prev, `Generering fullført på ${(duration / 1000).toFixed(1)}s`]);
        setResult({
          success: true,
          message: `Genererte ${data.count ?? config.count} ${t(ENTITY_TYPES.find((e) => e.value === config.entityType)?.labelKey ?? config.entityType)}`,
          entitiesCreated: data.count ?? config.count,
          duration,
        });
      } else {
        setGenerationLog((prev) => [...prev, `Feil: ${data.message ?? 'Ukjent feil'}`]);
        setResult({
          success: false,
          message: data.message ?? 'Generering feilet',
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ukjent feil';
      setGenerationLog((prev) => [...prev, `Feil: ${message}`]);
      setResult({ success: false, message });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedEntityInfo = ENTITY_TYPES.find((e) => e.value === config.entityType);
  const selectedTenant = tenants.find((t) => t.id === config.tenantId);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--ds-spacing-8)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-2)' }}>
        <SparklesIcon style={{ color: 'var(--ds-color-accent-text-default)', width: 32, height: 32 }} />
        <Heading level={1} size="lg">
          {t('saasAdmin.aiSeed.title', { defaultValue: 'AI Seed Generator' })}
        </Heading>
      </div>
      <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-6)' }}>
        {t('saasAdmin.aiSeed.description', { defaultValue: 'Generer realistiske demo-data for tenanter ved hjelp av AI' })}
      </Paragraph>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 'var(--ds-spacing-4)' }}>
        {/* Configuration Form */}
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <Heading level={2} size="sm" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            Konfigurasjon
          </Heading>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            {/* Tenant Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                Velg tenant *
              </label>
              {loadingTenants ? (
                <Spinner aria-label={t('common.laster_tenanter')} />
              ) : (
                <Select
                  value={config.tenantId}
                  onChange={(e) => setConfig((prev) => ({ ...prev, tenantId: e.target.value }))}
                >
                  <option value="">{t('common.velg_tenant')}</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name} ({tenant.slug})
                    </option>
                  ))}
                </Select>
              )}
            </div>

            {/* Entity Type */}
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                Entitetstype
              </label>
              <Select
                value={config.entityType}
                onChange={(e) => setConfig((prev) => ({ ...prev, entityType: e.target.value }))}
              >
                {ENTITY_TYPES.map((entity) => (
                  <option key={entity.value} value={entity.value}>
                    {t(entity.labelKey)}
                  </option>
                ))}
              </Select>
              {selectedEntityInfo && (
                <Paragraph size="xs" style={{ marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {t(selectedEntityInfo.descriptionKey)} • Anbefalt: {selectedEntityInfo.count}
                </Paragraph>
              )}
            </div>

            {/* Count */}
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-1)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                Antall
              </label>
              <Textfield
                type="number"
                min={1}
                max={200}
                value={config.count.toString()}
                onChange={(e) => setConfig((prev) => ({ ...prev, count: parseInt(e.target.value, 10) || 1 }))}
              />
            </div>

            {/* Presets */}
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                Forhåndsinnstillinger
              </label>
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
                {PRESETS.map((preset) => (
                  <Button
                    key={preset.nameKey}
                    variant="tertiary"
                    size="sm"
                    onClick={() => handlePresetSelect(preset.nameKey)}
                    type="button"
                  >
                    {t(preset.nameKey)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div style={{ marginTop: 'var(--ds-spacing-4)' }}>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !config.tenantId}
                style={{ width: '100%' }}
              >
                {isGenerating ? (
                  <>
                    <Spinner size="sm" aria-label="Genererer..." />
                    Genererer...
                  </>
                ) : (
                  <>
                    <PlayIcon />
                    Generer {config.count} {selectedEntityInfo ? t(selectedEntityInfo.labelKey) : 'entiteter'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Preview & Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {/* Preview Card */}
          <Card style={{ padding: 'var(--ds-spacing-4)' }}>
            <Heading level={3} size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
              Forhåndsvisning
            </Heading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Tenant:</span>
                <strong>{selectedTenant?.name ?? '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{t('common.type')}</span>
                <strong>{selectedEntityInfo ? t(selectedEntityInfo.labelKey) : '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Antall:</span>
                <strong>{config.count}</strong>
              </div>
            </div>
          </Card>

          {/* Result Card */}
          {result && (
            <Card
              style={{
                padding: 'var(--ds-spacing-4)',
                backgroundColor: result.success ? 'var(--ds-color-success-surface-default)' : 'var(--ds-color-danger-surface-default)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-2)' }}>
                {result.success ? (
                  <CheckCircleIcon style={{ color: 'var(--ds-color-success-text-default)' }} />
                ) : (
                  <XCircleIcon style={{ color: 'var(--ds-color-danger-text-default)' }} />
                )}
                <Heading level={3} size="xs">
                  {result.success ? t('common.fullfort') : 'Feilet'}
                </Heading>
              </div>
              <Paragraph size="sm">{result.message}</Paragraph>
              {result.duration && (
                <Paragraph size="xs" style={{ marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Tid: {(result.duration / 1000).toFixed(1)}s
                </Paragraph>
              )}
            </Card>
          )}

          {/* Generation Log */}
          {generationLog.length > 0 && (
            <Card style={{ padding: 'var(--ds-spacing-4)' }}>
              <Heading level={3} size="xs" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                Logg
              </Heading>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 'var(--ds-font-size-xs)',
                  backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                  padding: 'var(--ds-spacing-3)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                {generationLog.map((log, i) => (
                  <div key={i} style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                    {log}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* API Docs */}
      <Card style={{ marginTop: 'var(--ds-spacing-6)', padding: 'var(--ds-spacing-4)' }}>
        <Heading level={3} size="xs" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          API-tilgang
        </Heading>
        <Paragraph size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          Du kan også bruke API-et direkte:
        </Paragraph>
        <pre
          style={{
            padding: 'var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-md)',
            overflow: 'auto',
            fontSize: 'var(--ds-font-size-xs)',
          }}
        >
          {`POST /api/admin/ai-seed-generator
Content-Type: application/json

{
  "entityType": "${config.entityType}",
  "count": ${config.count},
  "tenantId": "${config.tenantId || '<tenant-id>'}"
}`}
        </pre>
      </Card>
    </div>
  );
}

export default AISeedGeneratorPage;
