/**
 * ScheduledReportsManager Component
 * Manage scheduled reports: list, create, edit, delete, pause/resume
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Button,
  Paragraph,
  Heading,
  Spinner,
  Table,
  Dropdown,
  Drawer,
  Stack,
  Card,
  Badge,
  MoreVerticalIcon,
  PlusIcon,
  useDialog,
  FormField,
  Textfield,
  Select,
  Text,
} from '@xala/ds';
import {
  useScheduledReports,
  useCreateScheduledReport,
  useUpdateScheduledReport,
  useDeleteScheduledReport,
  usePauseScheduledReport,
  useResumeScheduledReport,
  useTriggerScheduledReport,
  type ScheduledReport,
  type CreateScheduledReportDTO,
  type UpdateScheduledReportDTO,
  type ReportType,
  type ExportFormat,
  type ScheduleConfig,
} from '@digilist/client-sdk';
import { ScheduleConfigForm } from './ScheduleConfigForm';
import { EmailRecipientsInput } from './EmailRecipientsInput';

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  usage: 'Bruksrapport',
  revenue: 'Inntektsrapport',
  booking: 'Bestillingsrapport',
  utilization: 'Utnyttelsesrapport',
  seasonal_allocation: 'Sesongallokering',
  custom: 'Tilpasset rapport',
};

const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  pdf: 'PDF',
  xlsx: 'Excel',
  csv: 'CSV',
  json: 'JSON',
};

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Daglig',
  weekly: 'Ukentlig',
  monthly: 'Månedlig',
  quarterly: 'Kvartalsvis',
};

export function ScheduledReportsManager() {
  const { confirm } = useDialog();

  // State
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledReport | null>(null);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Form state for create/edit
  const [formData, setFormData] = useState<Partial<CreateScheduledReportDTO>>({
    name: '',
    description: '',
    reportType: 'usage',
    exportFormat: 'pdf',
    schedule: {
      frequency: 'weekly',
      dayOfWeek: 1,
      time: '09:00',
      timezone: 'Europe/Oslo',
      enabled: true,
      recipients: [],
    },
    metrics: [],
    filters: [],
  });

  // Fetch scheduled reports
  const queryParams = useMemo(() => {
    if (filterActive === 'all') return undefined;
    return { isActive: filterActive === 'active' };
  }, [filterActive]);

  const { data: schedulesData, isLoading } = useScheduledReports(queryParams);
  const schedules = schedulesData?.data ?? [];

  // Mutations
  const createSchedule = useCreateScheduledReport();
  const updateSchedule = useUpdateScheduledReport();
  const deleteSchedule = useDeleteScheduledReport();
  const pauseSchedule = usePauseScheduledReport();
  const resumeSchedule = useResumeScheduledReport();
  const triggerSchedule = useTriggerScheduledReport();

  // Handlers
  const handleCreate = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      reportType: 'usage',
      exportFormat: 'pdf',
      schedule: {
        frequency: 'weekly',
        dayOfWeek: 1,
        time: '09:00',
        timezone: 'Europe/Oslo',
        enabled: true,
        recipients: [],
      },
      metrics: [],
      filters: [],
    });
    setEditingSchedule(null);
    setIsCreateDrawerOpen(true);
  }, []);

  const handleEdit = useCallback((schedule: ScheduledReport) => {
    setFormData({
      name: schedule.name,
      description: schedule.description,
      reportType: schedule.reportType,
      exportFormat: schedule.exportFormat,
      schedule: schedule.schedule,
      metrics: schedule.metrics,
      filters: schedule.filters,
      reportTemplateId: schedule.reportTemplateId,
    });
    setEditingSchedule(schedule);
    setIsCreateDrawerOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (schedule: ScheduledReport) => {
      const confirmed = await confirm({
        title: 'Slett planlagt rapport',
        description: `Er du sikker på at du vil slette "${schedule.name}"?`,
        confirmText: 'Slett',
        cancelText: 'Avbryt',
        variant: 'danger',
      });

      if (confirmed) {
        deleteSchedule.mutate(schedule.id, {
          onSuccess: () => {
            alert(`Planlagt rapport "${schedule.name}" ble slettet`);
          },
          onError: () => {
            alert('Kunne ikke slette planlagt rapport. Prøv igjen.');
          },
        });
      }
    },
    [confirm, deleteSchedule]
  );

  const handlePause = useCallback(
    (schedule: ScheduledReport) => {
      pauseSchedule.mutate(schedule.id, {
        onSuccess: () => {
          alert(`Planlagt rapport "${schedule.name}" ble satt på pause`);
        },
        onError: () => {
          alert('Kunne ikke pause planlagt rapport. Prøv igjen.');
        },
      });
    },
    [pauseSchedule]
  );

  const handleResume = useCallback(
    (schedule: ScheduledReport) => {
      resumeSchedule.mutate(schedule.id, {
        onSuccess: () => {
          alert(`Planlagt rapport "${schedule.name}" ble gjenopptatt`);
        },
        onError: () => {
          alert('Kunne ikke gjenoppta planlagt rapport. Prøv igjen.');
        },
      });
    },
    [resumeSchedule]
  );

  const handleTrigger = useCallback(
    async (schedule: ScheduledReport) => {
      const confirmed = await confirm({
        title: 'Kjør rapport nå',
        description: `Vil du generere og sende rapporten "${schedule.name}" nå?`,
        confirmText: 'Kjør nå',
        cancelText: 'Avbryt',
      });

      if (confirmed) {
        triggerSchedule.mutate(schedule.id, {
          onSuccess: () => {
            alert(`Rapport "${schedule.name}" ble startet. Du vil motta den på e-post når den er ferdig.`);
          },
          onError: () => {
            alert('Kunne ikke starte rapport. Prøv igjen.');
          },
        });
      }
    },
    [confirm, triggerSchedule]
  );

  const handleSave = useCallback(async () => {
    if (!formData.name || !formData.reportType || !formData.exportFormat) {
      alert('Vennligst fyll ut alle påkrevde felter (navn, rapporttype, eksportformat)');
      return;
    }

    if (!formData.schedule?.recipients || formData.schedule.recipients.length === 0) {
      alert('Legg til minst én e-postmottaker');
      return;
    }

    if (editingSchedule) {
      // Update existing schedule
      updateSchedule.mutate(
        {
          id: editingSchedule.id,
          data: formData as UpdateScheduledReportDTO,
        },
        {
          onSuccess: () => {
            alert(`Planlagt rapport "${formData.name}" ble oppdatert`);
            setIsCreateDrawerOpen(false);
            setEditingSchedule(null);
          },
          onError: () => {
            alert('Kunne ikke oppdatere planlagt rapport. Prøv igjen.');
          },
        }
      );
    } else {
      // Create new schedule
      createSchedule.mutate(formData as CreateScheduledReportDTO, {
        onSuccess: () => {
          alert(`Planlagt rapport "${formData.name}" ble opprettet`);
          setIsCreateDrawerOpen(false);
        },
        onError: () => {
          alert('Kunne ikke opprette planlagt rapport. Prøv igjen.');
        },
      });
    }
  }, [formData, editingSchedule, createSchedule, updateSchedule]);

  const handleCancel = useCallback(() => {
    setIsCreateDrawerOpen(false);
    setEditingSchedule(null);
  }, []);

  // Format date/time
  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-6)' }}>
        <Spinner aria-label="Laster planlagte rapporter..." />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--ds-spacing-4)',
        }}
      >
        <div>
          <Heading level={2} data-size="md">
            Planlagte rapporter
          </Heading>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            Administrer automatiske rapporter som sendes på e-post
          </Paragraph>
        </div>
        <Button onClick={handleCreate} variant="primary">
          <PlusIcon style={{ marginRight: 'var(--ds-spacing-2)' }} />
          Ny planlagt rapport
        </Button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-4)' }}>
        <Button
          variant={filterActive === 'all' ? 'primary' : 'secondary'}
          onClick={() => setFilterActive('all')}
        >
          Alle
        </Button>
        <Button
          variant={filterActive === 'active' ? 'primary' : 'secondary'}
          onClick={() => setFilterActive('active')}
        >
          Aktive
        </Button>
        <Button
          variant={filterActive === 'inactive' ? 'primary' : 'secondary'}
          onClick={() => setFilterActive('inactive')}
        >
          Inaktive
        </Button>
      </div>

      {/* Schedules Table */}
      {schedules.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-6)' }}>
            <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {filterActive === 'all'
                ? 'Ingen planlagte rapporter ennå. Opprett din første planlagte rapport.'
                : `Ingen ${filterActive === 'active' ? 'aktive' : 'inaktive'} planlagte rapporter.`}
            </Paragraph>
          </div>
        </Card>
      ) : (
        <Card>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Navn</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>Frekvens</Table.HeaderCell>
                <Table.HeaderCell>Format</Table.HeaderCell>
                <Table.HeaderCell>Neste kjøring</Table.HeaderCell>
                <Table.HeaderCell>Siste kjøring</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Handlinger</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {schedules.map((schedule) => (
                <Table.Row key={schedule.id}>
                  <Table.Cell>
                    <div>
                      <div style={{ fontWeight: 500 }}>{schedule.name}</div>
                      {schedule.description && (
                        <div
                          style={{
                            fontSize: '0.875rem',
                            color: 'var(--ds-color-neutral-text-subtle)',
                          }}
                        >
                          {schedule.description}
                        </div>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="neutral">{REPORT_TYPE_LABELS[schedule.reportType]}</Badge>
                  </Table.Cell>
                  <Table.Cell>{FREQUENCY_LABELS[schedule.schedule.frequency]}</Table.Cell>
                  <Table.Cell>
                    <Badge color="info">{EXPORT_FORMAT_LABELS[schedule.exportFormat]}</Badge>
                  </Table.Cell>
                  <Table.Cell>{formatDateTime(schedule.nextRunAt)}</Table.Cell>
                  <Table.Cell>
                    <div>
                      <div>{formatDateTime(schedule.lastRunAt)}</div>
                      {schedule.lastRunStatus && (
                        <Badge
                          color={
                            schedule.lastRunStatus === 'success'
                              ? 'success'
                              : schedule.lastRunStatus === 'failed'
                                ? 'danger'
                                : 'neutral'
                          }
                          style={{ fontSize: '0.75rem', marginTop: 'var(--ds-spacing-1)' }}
                        >
                          {schedule.lastRunStatus === 'success'
                            ? 'Vellykket'
                            : schedule.lastRunStatus === 'failed'
                              ? 'Feilet'
                              : 'Hoppet over'}
                        </Badge>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={schedule.isActive ? 'success' : 'neutral'}>
                      {schedule.isActive ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Dropdown>
                      <Dropdown.Trigger asChild>
                        <Button variant="tertiary" aria-label="Handlinger">
                          <MoreVerticalIcon />
                        </Button>
                      </Dropdown.Trigger>
                      <Dropdown.List>
                        <Dropdown.Item onClick={() => handleEdit(schedule)}>Rediger</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleTrigger(schedule)}>Kjør nå</Dropdown.Item>
                        {schedule.isActive ? (
                          <Dropdown.Item onClick={() => handlePause(schedule)}>Pause</Dropdown.Item>
                        ) : (
                          <Dropdown.Item onClick={() => handleResume(schedule)}>Gjenoppta</Dropdown.Item>
                        )}
                        <Dropdown.Item onClick={() => handleDelete(schedule)}>Slett</Dropdown.Item>
                      </Dropdown.List>
                    </Dropdown>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      )}

      {/* Create/Edit Drawer */}
      <Drawer
        isOpen={isCreateDrawerOpen}
        onClose={handleCancel}
        title={editingSchedule ? 'Rediger planlagt rapport' : 'Ny planlagt rapport'}
        position="right"
       
        footer={
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel} variant="secondary">
              Avbryt
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              disabled={createSchedule.isPending || updateSchedule.isPending}
            >
              {editingSchedule ? 'Oppdater' : 'Opprett'}
            </Button>
          </div>
        }
      >
        <Stack spacing="var(--ds-spacing-5)">
          {/* Basic Info */}
          <Card>
            <Stack spacing="var(--ds-spacing-4)">
              <Heading level={3} data-size="sm">
                Grunnleggende informasjon
              </Heading>

              <FormField label="Navn" description="Navnet på den planlagte rapporten">
                <Textfield
                  value={formData.name || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Månedlig bruksrapport"
                />
              </FormField>

              <FormField label="Beskrivelse (valgfritt)" description="Kort beskrivelse av rapporten">
                <Textfield
                  value={formData.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Månedlig oversikt over ressursbruk"
                />
              </FormField>

              <FormField label="Rapporttype" description="Velg type rapport">
                <Select
                  value={formData.reportType || 'usage'}
                  onChange={(e) => setFormData({ ...formData, reportType: e.target.value as ReportType })}
                >
                  <option value="usage">Bruksrapport</option>
                  <option value="revenue">Inntektsrapport</option>
                  <option value="booking">Bestillingsrapport</option>
                  <option value="utilization">Utnyttelsesrapport</option>
                  <option value="seasonal_allocation">Sesongallokering</option>
                  <option value="custom">Tilpasset rapport</option>
                </Select>
              </FormField>

              <FormField label="Eksportformat" description="Velg filformat for rapporten">
                <Select
                  value={formData.exportFormat || 'pdf'}
                  onChange={(e) => setFormData({ ...formData, exportFormat: e.target.value as ExportFormat })}
                >
                  <option value="pdf">PDF</option>
                  <option value="xlsx">Excel</option>
                  <option value="csv">CSV</option>
                </Select>
              </FormField>
            </Stack>
          </Card>

          {/* Schedule Configuration */}
          <ScheduleConfigForm
            value={formData.schedule || {}}
            onChange={(schedule) => setFormData({ ...formData, schedule: schedule as ScheduleConfig })}
          />

          {/* Email Recipients */}
          <EmailRecipientsInput
            value={formData.schedule?.recipients || []}
            onChange={(recipients) =>
              setFormData({
                ...formData,
                schedule: { ...(formData.schedule || {}), recipients } as ScheduleConfig,
              })
            }
          />
        </Stack>
      </Drawer>
    </div>
  );
}
