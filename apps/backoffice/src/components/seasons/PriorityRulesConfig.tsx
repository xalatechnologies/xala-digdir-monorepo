/**
 * Priority Rules Config Component
 * Configure season priority rules for youth/senior and local/regional priorities
 */

import { useState, useMemo, type ChangeEvent } from 'react';
import {
  Button,
  Table,
  Badge,
  Heading,
  Paragraph,
  Card,
  Spinner,
  Switch,
  Textfield,
  PlusIcon,
  EditIcon,
  TrashIcon,
  SettingsIcon,
} from '@xalatechnologies/platform/ui';
import { useT } from '@xala/i18n';

// Local icons (not exported from @xalatechnologies/platform/ui)
function ChevronUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// Temporary type definitions and placeholder hooks until implemented in SDK
type RuleType = 'youth_priority' | 'senior_priority' | 'local_priority' | 'regional_priority' | 'custom';

type RuleConditions = {
  organizationType?: string;
  ageGroup?: 'youth' | 'senior' | 'adult';
  locality?: 'local' | 'regional' | 'national';
};

interface PriorityRule {
  id: string;
  tenantId: string;
  seasonId: string;
  name: string;
  ruleType: RuleType;
  priority: number;
  conditions: RuleConditions;
  enabled: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface CreateRuleData {
  seasonId: string;
  name: string;
  ruleType: RuleType;
  priority: number;
  conditions: RuleConditions;
  enabled: boolean;
}

interface UpdateRuleData {
  id: string;
  name?: string;
  priority?: number;
  conditions?: RuleConditions;
  enabled?: boolean;
}

const usePriorityRules = (_seasonId: string) => ({ data: { data: [] as PriorityRule[] }, isLoading: false });
const useCreatePriorityRule = () => ({ mutateAsync: async (_data: CreateRuleData) => {}, isLoading: false });
const useUpdatePriorityRule = () => ({ mutateAsync: async (_data: UpdateRuleData) => {}, isLoading: false });
const useDeletePriorityRule = () => ({ mutateAsync: async (_id: string) => {}, isLoading: false });

interface PriorityRulesConfigProps {
  seasonId: string;
  canEdit: boolean; // Only allow editing before season is closed
}

const ruleTypeLabels: Record<RuleType, string> = {
  youth_priority: 'Ungdomsprioritet',
  senior_priority: 'Seniorprioritet',
  local_priority: 'Lokal prioritet',
  regional_priority: 'Regional prioritet',
  custom: 'Tilpasset regel',
};

const ruleTypeDescriptions: Record<RuleType, string> = {
  youth_priority: 'Gir prioritet til ungdomsorganisasjoner',
  senior_priority: 'Gir prioritet til seniororganisasjoner',
  local_priority: 'Gir prioritet til lokale organisasjoner',
  regional_priority: 'Gir prioritet til regionale organisasjoner',
  custom: 'Tilpasset prioriteringsregel',
};

const ruleTypeVariants: Record<RuleType, 'info' | 'success' | 'warning'> = {
  youth_priority: 'info',
  senior_priority: 'success',
  local_priority: 'info',
  regional_priority: 'success',
  custom: 'warning',
};

export function PriorityRulesConfig({ seasonId, canEdit }: PriorityRulesConfigProps) {
  const t = useT();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PriorityRule | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    ruleType: RuleType;
    priority: number;
    ageGroup?: 'youth' | 'senior' | 'adult';
    locality?: 'local' | 'regional' | 'national';
  }>({
    name: '',
    ruleType: 'youth_priority',
    priority: 100,
    ageGroup: 'youth',
    locality: undefined,
  });

  // Queries
  const { data: rulesData, isLoading } = usePriorityRules(seasonId);
  const rules = rulesData?.data ?? [];

  // Mutations
  const createMutation = useCreatePriorityRule();
  const updateMutation = useUpdatePriorityRule();
  const deleteMutation = useDeletePriorityRule();

  // Sort rules by priority (highest first)
  const sortedRules = useMemo(() => {
    return [...rules].sort((a, b) => b.priority - a.priority);
  }, [rules]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: rules.length,
      enabled: rules.filter(r => r.enabled).length,
      disabled: rules.filter(r => !r.enabled).length,
      youthPriority: rules.filter(r => r.ruleType === 'youth_priority').length,
      seniorPriority: rules.filter(r => r.ruleType === 'senior_priority').length,
      localPriority: rules.filter(r => r.ruleType === 'local_priority').length,
      regionalPriority: rules.filter(r => r.ruleType === 'regional_priority').length,
    };
  }, [rules]);

  // Handlers
  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      ruleType: 'youth_priority',
      priority: 100,
      ageGroup: 'youth',
      locality: undefined,
    });
    setEditingRule(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (rule: PriorityRule) => {
    setFormData({
      name: rule.name,
      ruleType: rule.ruleType,
      priority: rule.priority,
      ageGroup: rule.conditions.ageGroup,
      locality: rule.conditions.locality,
    });
    setEditingRule(rule);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingRule(null);
  };

  const handleSubmit = async () => {
    const conditions: RuleConditions = {};
    if (formData.ageGroup) {
      conditions.ageGroup = formData.ageGroup;
    }
    if (formData.locality) {
      conditions.locality = formData.locality;
    }

    if (editingRule) {
      await updateMutation.mutateAsync({
        id: editingRule.id,
        name: formData.name,
        priority: formData.priority,
        conditions,
      });
    } else {
      await createMutation.mutateAsync({
        seasonId,
        name: formData.name,
        ruleType: formData.ruleType,
        priority: formData.priority,
        conditions,
        enabled: true,
      });
    }

    handleCloseModal();
  };

  const handleToggleEnabled = async (rule: PriorityRule) => {
    await updateMutation.mutateAsync({
      id: rule.id,
      enabled: !rule.enabled,
    });
  };

  const handleDelete = async (ruleId: string) => {
    if (confirm(t('common.er_du_sikker_paa'))) {
      await deleteMutation.mutateAsync(ruleId);
    }
  };

  const handleChangePriority = async (rule: PriorityRule, direction: 'up' | 'down') => {
    const newPriority = direction === 'up' ? rule.priority + 10 : rule.priority - 10;
    await updateMutation.mutateAsync({
      id: rule.id,
      priority: Math.max(0, newPriority),
    });
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label={t('seasons.ariaLabel.lasterPrioriteringsregler')} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      {/* Header with stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            Prioriteringsregler
          </Heading>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            Konfigurer regler for hvordan søknader skal prioriteres
          </Paragraph>
        </div>
        {canEdit && (
          <Button variant="primary" data-size="sm" onClick={handleOpenCreateModal} type="button">
            <PlusIcon />
            Ny regel
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--ds-spacing-3)' }}>
        <Card style={{ padding: 'var(--ds-spacing-3)' }}>
          <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Totalt regler
          </div>
          <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-semibold)' }}>
            {stats.total}
          </div>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-3)' }}>
          <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Aktive
          </div>
          <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-success-text-default)' }}>
            {stats.enabled}
          </div>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-3)' }}>
          <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>{t('seasons.text.ungdom')}</div>
          <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-semibold)' }}>
            {stats.youthPriority}
          </div>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-3)' }}>
          <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>{t('seasons.text.senior')}</div>
          <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-semibold)' }}>
            {stats.seniorPriority}
          </div>
        </Card>
      </div>

      {/* Rules Table */}
      {rules.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
          <SettingsIcon style={{ fontSize: 'var(--ds-font-size-heading-lg)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }} />
          <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            Ingen prioriteringsregler
          </Heading>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-4)' }}>
            Legg til regler for å prioritere søknader basert på ungdom/senior eller lokal/regional
          </Paragraph>
          {canEdit && (
            <Button variant="primary" data-size="sm" onClick={handleOpenCreateModal} type="button">
              <PlusIcon />
              Opprett første regel
            </Button>
          )}
        </div>
      ) : (
        <Card style={{ padding: 0 }}>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>{t('seasons.text.regel')}</Table.HeaderCell>
                <Table.HeaderCell>{t('seasons.text.type')}</Table.HeaderCell>
                <Table.HeaderCell>{t('seasons.text.prioritet')}</Table.HeaderCell>
                <Table.HeaderCell>{t('seasons.text.betingelser')}</Table.HeaderCell>
                <Table.HeaderCell>{t('seasons.text.status')}</Table.HeaderCell>
                {/* Table column width requires specific pixel value for consistent layout */}
                {canEdit && <Table.HeaderCell style={{ width: '100px' }}>{t('seasons.text.handlinger')}</Table.HeaderCell>}
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {sortedRules.map((rule) => (
                <Table.Row
                  key={rule.id}
                  style={{
                    opacity: rule.enabled ? 1 : 0.6,
                  }}
                >
                  <Table.Cell>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {rule.name}
                    </div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {ruleTypeDescriptions[rule.ruleType]}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={ruleTypeVariants[rule.ruleType]} size="sm">
                      {ruleTypeLabels[rule.ruleType]}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                      <span style={{ fontSize: 'var(--ds-font-size-lg)', fontWeight: 'var(--ds-font-weight-semibold)' }}>
                        {rule.priority}
                      </span>
                      {canEdit && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-1)' }}>
                          {/* eslint-disable-next-line digdir/prefer-ds-components -- Icon-only micro button, DS Button has no xs size */}
                          <button
                            type="button"
                            onClick={() => handleChangePriority(rule, 'up')}
                            aria-label={t('common.ok_prioritet')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}
                          >
                            <ChevronUpIcon />
                          </button>
                          {/* eslint-disable-next-line digdir/prefer-ds-components -- Icon-only micro button, DS Button has no xs size */}
                          <button
                            type="button"
                            onClick={() => handleChangePriority(rule, 'down')}
                            aria-label={t('common.senk_prioritet')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}
                          >
                            <ChevronDownIcon />
                          </button>
                        </div>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-1)' }}>
                      {rule.conditions.ageGroup && (
                        <Badge color="info" size="sm">
                          {rule.conditions.ageGroup === 'youth' ? 'Ungdom' : rule.conditions.ageGroup === 'senior' ? 'Senior' : 'Voksen'}
                        </Badge>
                      )}
                      {rule.conditions.locality && (
                        <Badge color="success" size="sm">
                          {rule.conditions.locality === 'local' ? 'Lokal' : rule.conditions.locality === 'regional' ? 'Regional' : 'Nasjonal'}
                        </Badge>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {canEdit ? (
                      <Switch
                        checked={rule.enabled}
                        onChange={() => handleToggleEnabled(rule)}
                        aria-label={`${rule.enabled ? 'Deaktiver' : 'Aktiver'} ${rule.name}`}
                      />
                    ) : (
                      <Badge color={rule.enabled ? 'success' : 'neutral'} size="sm">
                        {rule.enabled ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    )}
                  </Table.Cell>
                  {canEdit && (
                    <Table.Cell>
                      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                        <Button variant="tertiary" data-size="sm" type="button" aria-label={t("action.edit")} onClick={() => handleOpenEditModal(rule)}>
                          <EditIcon />
                        </Button>
                        <Button variant="tertiary" data-size="sm" type="button" aria-label={t("action.delete")} onClick={() => handleDelete(rule.id)} style={{ color: 'var(--ds-color-danger-text-default)' }}>
                          <TrashIcon />
                        </Button>
                      </div>
                    </Table.Cell>
                  )}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'var(--ds-color-neutral-background-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={handleCloseModal}
        >
          <Card
            style={{
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: 'var(--ds-spacing-6)',
            }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
              <Heading level={2} data-size="sm">
                {editingRule ? t('common.rediger_prioriteringsregel') : 'Ny prioriteringsregel'}
              </Heading>
              {/* eslint-disable-next-line digdir/prefer-ds-components -- Close icon button for dialog */}
              <button
                type="button"
                onClick={handleCloseModal}
                aria-label={t("action.close")}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--ds-spacing-1)', display: 'flex' }}
              >
                <XIcon />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
              <Textfield
                label="Navn"
                value={formData.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                placeholder="f.eks. Ungdomsprioritet 2024"
              />

              {!editingRule && (
                <div>
                  {/* eslint-disable-next-line digdir/prefer-ds-components -- Native select for form */}
                  <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                    Regeltype
                  </label>
                  {/* eslint-disable-next-line digdir/prefer-ds-components -- Native select for form */}
                  <select
                    value={formData.ruleType}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                      const ruleType = e.target.value as RuleType;
                      setFormData({
                        ...formData,
                        ruleType,
                        ageGroup: ruleType.includes('youth') ? 'youth' : ruleType.includes('senior') ? 'senior' : undefined,
                        locality: ruleType.includes('local') ? 'local' : ruleType.includes('regional') ? 'regional' : undefined,
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: 'var(--ds-spacing-3)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      border: '1px solid var(--ds-color-neutral-border-default)',
                      fontSize: 'var(--ds-font-size-md)',
                    }}
                  >
                    <option value="youth_priority">{t('seasons.text.ungdomsprioritet')}</option>
                    <option value="senior_priority">{t('seasons.text.seniorprioritet')}</option>
                    <option value="local_priority">{t('common.lokal_prioritet')}</option>
                    <option value="regional_priority">{t('common.regional_prioritet')}</option>
                    <option value="custom">{t('common.tilpasset_regel')}</option>
                  </select>
                </div>
              )}

              <Textfield
                label="Prioritetsverdi"
                type="number"
                value={String(formData.priority)}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                description={t('common.hoyere_verdi_gir_hoyere')}
              />

              {(formData.ruleType === 'youth_priority' || formData.ruleType === 'senior_priority') && (
                <div>
                  {/* eslint-disable-next-line digdir/prefer-ds-components -- Native select for form */}
                  <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                    Aldersgruppe
                  </label>
                  {/* eslint-disable-next-line digdir/prefer-ds-components -- Native select for form */}
                  <select
                    value={formData.ageGroup || ''}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, ageGroup: e.target.value as 'youth' | 'senior' | 'adult' })}
                    style={{
                      width: '100%',
                      padding: 'var(--ds-spacing-3)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      border: '1px solid var(--ds-color-neutral-border-default)',
                      fontSize: 'var(--ds-font-size-md)',
                    }}
                  >
                    <option value="">{t('common.velg_aldersgruppe')}</option>
                    <option value="youth">{t('seasons.text.ungdom')}</option>
                    <option value="senior">{t('seasons.text.senior')}</option>
                    <option value="adult">{t('seasons.text.voksen')}</option>
                  </select>
                </div>
              )}

              {(formData.ruleType === 'local_priority' || formData.ruleType === 'regional_priority') && (
                <div>
                  {/* eslint-disable-next-line digdir/prefer-ds-components -- Native select for form */}
                  <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                    Lokalitet
                  </label>
                  {/* eslint-disable-next-line digdir/prefer-ds-components -- Native select for form */}
                  <select
                    value={formData.locality || ''}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, locality: e.target.value as 'local' | 'regional' | 'national' })}
                    style={{
                      width: '100%',
                      padding: 'var(--ds-spacing-3)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      border: '1px solid var(--ds-color-neutral-border-default)',
                      fontSize: 'var(--ds-font-size-md)',
                    }}
                  >
                    <option value="">{t('common.velg_lokalitet')}</option>
                    <option value="local">{t('seasons.text.lokal')}</option>
                    <option value="regional">{t('seasons.text.regional')}</option>
                    <option value="national">{t('seasons.text.nasjonal')}</option>
                  </select>
                </div>
              )}

              <div style={{ padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-info-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                <Paragraph data-size="sm">
                  <strong>Beskrivelse:</strong> {ruleTypeDescriptions[formData.ruleType]}
                </Paragraph>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--ds-spacing-3)', marginTop: 'var(--ds-spacing-6)' }}>
              <Button variant="secondary" onClick={handleCloseModal} type="button">{t("action.cancel")}</Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!formData.name || formData.priority < 0}
                type="button"
              >
                {editingRule ? t('common.lagre_endringer') : 'Opprett regel'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
