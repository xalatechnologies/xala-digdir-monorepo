/**
 * Priority Rules Config Component
 * Configure season priority rules for youth/senior and local/regional priorities
 */

import { useState, useMemo } from 'react';
import {
  Button,
  Table,
  Badge,
  Heading,
  Paragraph,
  Card,
  Spinner,
  Switch,
  Dropdown,
  Modal,
  TextField,
  Select,
  PlusIcon,
  MoreVerticalIcon,
  EditIcon,
  TrashIcon,
  SettingsIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@xala/ds';
import {
  // TODO: Implement priority rules hooks
  // usePriorityRules,
  // useCreatePriorityRule,
  // useUpdatePriorityRule,
  // useDeletePriorityRule,
  // type PriorityRule,
  // type RuleType,
} from '@digilist/client-sdk';

// Temporary type definitions and placeholder hooks until implemented in SDK
type RuleType = 'youth_priority' | 'senior_priority' | 'local_priority' | 'regional_priority' | 'custom';

type RuleConditions = {
  organizationType?: string;
  ageGroup?: 'youth' | 'senior' | 'adult';
  locality?: 'local' | 'regional' | 'national';
};

type PriorityRule = {
  id: string;
  tenantId: string;
  seasonId: string;
  name: string;
  ruleType: RuleType;
  priority: number;
  conditions: RuleConditions;
  enabled: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
};

const usePriorityRules = (_seasonId: string) => ({ data: { data: [] as PriorityRule[] }, isLoading: false });
const useCreatePriorityRule = () => ({ mutateAsync: async (_data: any) => {}, isLoading: false });
const useUpdatePriorityRule = () => ({ mutateAsync: async (_data: any) => {}, isLoading: false });
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
    if (confirm('Er du sikker på at du vil slette denne prioriteringsregelen?')) {
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
        <Spinner data-size="lg" aria-label="Laster prioriteringsregler..." />
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
          <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Ungdom
          </div>
          <div style={{ fontSize: 'var(--ds-font-size-2xl)', fontWeight: 'var(--ds-font-weight-semibold)' }}>
            {stats.youthPriority}
          </div>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-3)' }}>
          <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Senior
          </div>
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
                <Table.HeaderCell>Regel</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>Prioritet</Table.HeaderCell>
                <Table.HeaderCell>Betingelser</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                {/* Table column width requires specific pixel value for consistent layout */}
                {canEdit && <Table.HeaderCell style={{ width: '100px' }}>Handlinger</Table.HeaderCell>}
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
                          <Button
                            variant="tertiary"
                            data-size="xs"
                            onClick={() => handleChangePriority(rule, 'up')}
                            type="button"
                            aria-label="Øk prioritet"
                          >
                            <ChevronUpIcon />
                          </Button>
                          <Button
                            variant="tertiary"
                            data-size="xs"
                            onClick={() => handleChangePriority(rule, 'down')}
                            type="button"
                            aria-label="Senk prioritet"
                          >
                            <ChevronDownIcon />
                          </Button>
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
                        size="sm"
                      />
                    ) : (
                      <Badge color={rule.enabled ? 'success' : 'neutral'} size="sm">
                        {rule.enabled ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    )}
                  </Table.Cell>
                  {canEdit && (
                    <Table.Cell>
                      <Dropdown>
                        <Dropdown.Trigger asChild>
                          <Button variant="tertiary" data-size="sm" type="button" aria-label="Flere handlinger">
                            <MoreVerticalIcon />
                          </Button>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                          <Dropdown.Item onClick={() => handleOpenEditModal(rule)}>
                            <EditIcon />
                            Rediger
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleDelete(rule.id)} style={{ color: 'var(--ds-color-danger-text-default)' }}>
                            <TrashIcon />
                            Slett
                          </Dropdown.Item>
                        </Dropdown.Content>
                      </Dropdown>
                    </Table.Cell>
                  )}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal open={isCreateModalOpen} onClose={handleCloseModal}>
        <Modal.Header>
          <Heading level={2} data-size="sm">
            {editingRule ? 'Rediger prioriteringsregel' : 'Ny prioriteringsregel'}
          </Heading>
        </Modal.Header>
        <Modal.Body>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <TextField
              label="Navn"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="F.eks. 'Ungdomsprioritet 2024'"
              required
            />

            {!editingRule && (
              <Select
                label="Regeltype"
                value={formData.ruleType}
                onChange={(e) => {
                  const ruleType = e.target.value as RuleType;
                  setFormData({
                    ...formData,
                    ruleType,
                    ageGroup: ruleType.includes('youth') ? 'youth' : ruleType.includes('senior') ? 'senior' : undefined,
                    locality: ruleType.includes('local') ? 'local' : ruleType.includes('regional') ? 'regional' : undefined,
                  });
                }}
                required
              >
                <option value="youth_priority">Ungdomsprioritet</option>
                <option value="senior_priority">Seniorprioritet</option>
                <option value="local_priority">Lokal prioritet</option>
                <option value="regional_priority">Regional prioritet</option>
                <option value="custom">Tilpasset regel</option>
              </Select>
            )}

            <TextField
              label="Prioritetsverdi"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
              description="Høyere verdi gir høyere prioritet"
              min={0}
              required
            />

            {(formData.ruleType === 'youth_priority' || formData.ruleType === 'senior_priority') && (
              <Select
                label="Aldersgruppe"
                value={formData.ageGroup || ''}
                onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value as 'youth' | 'senior' | 'adult' })}
                required
              >
                <option value="">Velg aldersgruppe</option>
                <option value="youth">Ungdom</option>
                <option value="senior">Senior</option>
                <option value="adult">Voksen</option>
              </Select>
            )}

            {(formData.ruleType === 'local_priority' || formData.ruleType === 'regional_priority') && (
              <Select
                label="Lokalitet"
                value={formData.locality || ''}
                onChange={(e) => setFormData({ ...formData, locality: e.target.value as 'local' | 'regional' | 'national' })}
                required
              >
                <option value="">Velg lokalitet</option>
                <option value="local">Lokal</option>
                <option value="regional">Regional</option>
                <option value="national">Nasjonal</option>
              </Select>
            )}

            <div style={{ padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-info-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
              <Paragraph data-size="sm">
                <strong>Beskrivelse:</strong> {ruleTypeDescriptions[formData.ruleType]}
              </Paragraph>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} type="button">
            Avbryt
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!formData.name || formData.priority < 0}
            type="button"
          >
            {editingRule ? 'Lagre endringer' : 'Opprett regel'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
