/**
 * Audit Log Page
 * Admin view for viewing system audit trail with filters and details
 */

/* eslint-disable digdir/require-interactive-labels -- Complex filter form with native date inputs */

import { useState, useMemo, useCallback } from 'react';
import {
  Button,
  Paragraph,
  Heading,
  Spinner,
  Table,
  HeaderSearch,
  Drawer,
  DrawerSection,
  Stack,
  Badge,
  Label,
  FilterIcon,
  CloseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@xala/ds';

import {
  useAuditLog,
  useUsers,
  useRentalObjects,
} from '@digilist/client-sdk';
import type { AuditLogEntry, AuditQueryParams } from '@digilist/client-sdk';
import { useLocale, useT } from '@xala/i18n';

// Helper to format date
function formatDate(timestamp: string, locale: string): string {
  return new Date(timestamp).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Helper to format time
function formatTime(timestamp: string, locale: string): string {
  return new Date(timestamp).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Resource type option IDs
const RESOURCE_OPTION_IDS = ['all', 'listing', 'booking', 'user', 'organization', 'allocation', 'settings'] as const;

// Action type option IDs
const ACTION_OPTION_IDS = ['all', 'create', 'read', 'update', 'delete'] as const;

// Helper to get action badge color
function getActionColor(action: string): 'success' | 'info' | 'warning' | 'danger' | 'neutral' {
  switch (action) {
    case 'create':
      return 'success';
    case 'read':
      return 'info';
    case 'update':
      return 'warning';
    case 'delete':
      return 'danger';
    default:
      return 'neutral';
  }
}

// Translation key maps for actions and resources
const ACTION_TRANSLATION_KEYS: Record<string, string> = {
  all: 'audit.actions.all',
  create: 'audit.actions.create',
  read: 'audit.actions.read',
  update: 'audit.actions.update',
  delete: 'audit.actions.delete',
};

const RESOURCE_TRANSLATION_KEYS: Record<string, string> = {
  all: 'audit.resources.all',
  listing: 'audit.resources.listing',
  booking: 'audit.resources.booking',
  user: 'audit.resources.user',
  organization: 'audit.resources.organization',
  allocation: 'audit.resources.allocation',
  settings: 'audit.resources.settings',
};

const RESOURCE_SINGULAR_KEYS: Record<string, string> = {
  listing: 'audit.resource.listing',
  booking: 'audit.resource.booking',
  user: 'audit.resource.user',
  organization: 'audit.resource.organization',
  allocation: 'audit.resource.allocation',
  settings: 'audit.resource.settings',
};

export function AuditPage() {
  const t = useT();
  const { locale } = useLocale();
  const formatLocale = locale === 'en' ? 'en-US' : 'nb-NO';

  // Build translated options
  const resourceOptions = useMemo(() =>
    RESOURCE_OPTION_IDS.map(id => ({
      id,
      label: t(RESOURCE_TRANSLATION_KEYS[id] || id)
    })), [t]);

  const actionOptions = useMemo(() =>
    ACTION_OPTION_IDS.map(id => ({
      id,
      label: t(ACTION_TRANSLATION_KEYS[id] || id)
    })), [t]);

  // Helper to get translated action label
  const getActionLabel = useCallback((action: string): string => {
    const key = ACTION_TRANSLATION_KEYS[action];
    return key ? t(key) : action;
  }, [t]);

  // Helper to get translated resource label (singular)
  const getResourceLabel = useCallback((resource: string): string => {
    const key = RESOURCE_SINGULAR_KEYS[resource];
    return key ? t(key) : resource;
  }, [t]);

  // State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<AuditLogEntry | null>(null);
  const [page, setPage] = useState(1);

  // Filter state
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Build query params
  const queryParams: AuditQueryParams = useMemo(() => {
    const params: AuditQueryParams = {
      page,
      limit: 25,
    };
    if (resourceFilter !== 'all') params.resource = resourceFilter;
    if (actionFilter !== 'all') params.action = actionFilter;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return params;
  }, [page, resourceFilter, actionFilter, startDate, endDate]);

  // Data fetching
  const { data: auditData, isLoading, error } = useAuditLog(queryParams);
  const { data: usersData } = useUsers({ limit: 100 });
  const { data: listingsData } = useRentalObjects({ limit: 100 });

  // Create lookup maps
  const userNameMap = useMemo(() => {
    const map = new Map<string, string>();
    usersData?.data?.forEach((user: { id: string; name?: string; email?: string }) => {
      map.set(user.id, user.name || user.email || t('audit.unknownUser'));
    });
    return map;
  }, [usersData, t]);

  const listingNameMap = useMemo(() => {
    const map = new Map<string, string>();
    listingsData?.data?.forEach((listing: { id: string; name: string }) => {
      map.set(listing.id, listing.name);
    });
    return map;
  }, [listingsData]);

  // Filter events by search
  const events = useMemo(() => {
    if (!auditData?.data) return [];
    if (!searchQuery) return auditData.data;

    const query = searchQuery.toLowerCase();
    return auditData.data.filter((event: AuditLogEntry) => {
      const userName = userNameMap.get(event.userId || '') || '';
      const resourceName = event.resource || '';
      return (
        userName.toLowerCase().includes(query) ||
        resourceName.toLowerCase().includes(query) ||
        event.resourceId?.toLowerCase().includes(query)
      );
    });
  }, [auditData, searchQuery, userNameMap]);

  // Pagination
  const totalPages = auditData?.meta?.totalPages || 1;
  const totalCount = auditData?.meta?.total || events.length;

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value || '');
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setResourceFilter('all');
    setActionFilter('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  }, []);

  const hasActiveFilters = resourceFilter !== 'all' || actionFilter !== 'all' || startDate || endDate;

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return {
      date: formatDate(timestamp, formatLocale),
      time: formatTime(timestamp, formatLocale),
    };
  };

  // Get display value for resource
  const getResourceDisplay = (event: AuditLogEntry): string => {
    if (event.resource === 'listing' && event.resourceId) {
      return listingNameMap.get(event.resourceId) || event.resourceId.slice(0, 8);
    }
    return event.resourceId?.slice(0, 8) || '-';
  };

  return (
    <>
      {/* Filter Drawer */}
      <Drawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        position="right"

        title={t('audit.filterEvents')}
      >
        <DrawerSection title={t('audit.resourceType')}>
          <Stack spacing="var(--ds-spacing-2)">
            {resourceOptions.map((option) => (
              <Label
                key={option.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                  cursor: 'pointer',
                  padding: 'var(--ds-spacing-2)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  backgroundColor:
                    resourceFilter === option.id
                      ? 'var(--ds-color-accent-surface-default)'
                      : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="resource"
                  value={option.id}
                  checked={resourceFilter === option.id}
                  onChange={(e) => setResourceFilter(e.target.value)}
                  style={{ accentColor: 'var(--ds-color-accent-base-default)' }}
                />
                <span>{option.label}</span>
              </Label>
            ))}
          </Stack>
        </DrawerSection>

        <DrawerSection title={t('audit.actionType')}>
          <Stack spacing="var(--ds-spacing-2)">
            {actionOptions.map((option) => (
              <Label
                key={option.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                  cursor: 'pointer',
                  padding: 'var(--ds-spacing-2)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  backgroundColor:
                    actionFilter === option.id
                      ? 'var(--ds-color-accent-surface-default)'
                      : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="action"
                  value={option.id}
                  checked={actionFilter === option.id}
                  onChange={(e) => setActionFilter(e.target.value)}
                  style={{ accentColor: 'var(--ds-color-accent-base-default)' }}
                />
                <span>{option.label}</span>
              </Label>
            ))}
          </Stack>
        </DrawerSection>

        <DrawerSection title={t('audit.timePeriod')}>
          <Stack spacing="var(--ds-spacing-2)">
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-1)' }}>
                {t('audit.fromDate')}
              </Paragraph>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--ds-spacing-2)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                }}
              />
            </div>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-1)' }}>
                {t('audit.toDate')}
              </Paragraph>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--ds-spacing-2)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                }}
              />
            </div>
          </Stack>
        </DrawerSection>

        {hasActiveFilters && (
          <div style={{ padding: 'var(--ds-spacing-4)' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClearFilters}
              style={{ width: '100%' }}
            >
              {t('audit.resetFilters')}
            </Button>
          </div>
        )}
      </Drawer>

      {/* Event Detail Drawer */}
      <Drawer
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        position="right"

        title={t('audit.eventDetails')}
      >
        {selectedEvent && (
          <>
            <DrawerSection title={t("ui.overview")}>
              <Stack spacing="var(--ds-spacing-3)">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('audit.table.action')}
                  </Paragraph>
                  <Badge data-color={getActionColor(selectedEvent.action)}>
                    {getActionLabel(selectedEvent.action)}
                  </Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('audit.table.resource')}
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {getResourceLabel(selectedEvent.resource)}
                  </Paragraph>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('audit.resourceId')}
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, fontFamily: 'var(--ds-font-family-monospace)' }}>
                    {selectedEvent.resourceId || '-'}
                  </Paragraph>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('audit.timestamp')}
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0 }}>
                    {formatTimestamp(selectedEvent.timestamp).date} {formatTimestamp(selectedEvent.timestamp).time}
                  </Paragraph>
                </div>
              </Stack>
            </DrawerSection>

            <DrawerSection title={t('audit.performedBy')}>
              <Stack spacing="var(--ds-spacing-2)">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('audit.table.user')}
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0 }}>
                    {userNameMap.get(selectedEvent.userId || '') || t('audit.systemUser')}
                  </Paragraph>
                </div>
                {selectedEvent.userId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {t('audit.userId')}
                    </Paragraph>
                    <Paragraph data-size="sm" style={{ margin: 0, fontFamily: 'var(--ds-font-family-monospace)' }}>
                      {selectedEvent.userId.slice(0, 8)}...
                    </Paragraph>
                  </div>
                )}
                {selectedEvent.ipAddress && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {t('audit.ipAddress')}
                    </Paragraph>
                    <Paragraph data-size="sm" style={{ margin: 0, fontFamily: 'var(--ds-font-family-monospace)' }}>
                      {selectedEvent.ipAddress}
                    </Paragraph>
                  </div>
                )}
              </Stack>
            </DrawerSection>

            {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
              <DrawerSection title={t('audit.metadata')}>
                <div
                  style={{
                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    padding: 'var(--ds-spacing-3)',
                    overflow: 'auto',
                    maxHeight: '300px',
                  }}
                >
                  <pre
                    style={{
                      margin: 0,
                      fontSize: 'var(--ds-font-size-xs)',
                      fontFamily: 'var(--ds-font-family-monospace)',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              </DrawerSection>
            )}

            <DrawerSection title={t('audit.system')}>
              <Stack spacing="var(--ds-spacing-2)">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('audit.eventId')}
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, fontFamily: 'var(--ds-font-family-monospace)' }}>
                    {selectedEvent.id.slice(0, 8)}...
                  </Paragraph>
                </div>
                {selectedEvent.tenantId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {t('audit.tenantId')}
                    </Paragraph>
                    <Paragraph data-size="sm" style={{ margin: 0, fontFamily: 'var(--ds-font-family-monospace)' }}>
                      {selectedEvent.tenantId.slice(0, 8)}...
                    </Paragraph>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('audit.severity')}
                  </Paragraph>
                  <Badge data-color={selectedEvent.severity === 'error' || selectedEvent.severity === 'critical' ? 'danger' : 'neutral'}>
                    {selectedEvent.severity}
                  </Badge>
                </div>
                {selectedEvent.userAgent && (
                  <div>
                    <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {t('audit.userAgent')}
                    </Paragraph>
                    <Paragraph data-size="xs" style={{ margin: 0, fontFamily: 'var(--ds-font-family-monospace)', wordBreak: 'break-all' }}>
                      {selectedEvent.userAgent}
                    </Paragraph>
                  </div>
                )}
              </Stack>
            </DrawerSection>
          </>
        )}
      </Drawer>

      {/* Main Content */}
      <div style={{ padding: 'var(--ds-spacing-6)' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--ds-spacing-6)',
          }}
        >
          <div>
            <Heading level={1} data-size="lg" style={{ margin: 0 }}>
              {t('audit.page.title')}
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('audit.page.description')}
            </Paragraph>
          </div>
        </div>

        {/* Toolbar */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-3)',
            marginBottom: 'var(--ds-spacing-4)',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: 1, minWidth: '200px', maxWidth: '400px' }}>
            <HeaderSearch
              placeholder={t('audit.searchPlaceholder')}
              value={searchValue}
              onSearchChange={handleSearchChange}
              onSearch={handleSearch}
            />
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsFilterOpen(true)}
            style={{ position: 'relative' }}
          >
            <FilterIcon />
            {t('audit.filterButton')}
            {hasActiveFilters && (
              <span
                style={{
                  position: 'absolute',
                  top: 'calc(-1 * var(--ds-spacing-1))',
                  right: 'calc(-1 * var(--ds-spacing-1))',
                  width: '8px',
                  height: '8px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: 'var(--ds-color-accent-base-default)',
                }}
              />
            )}
          </Button>

          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('audit.eventsCount', { count: totalCount })}
          </Paragraph>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div
            style={{
              display: 'flex',
              gap: 'var(--ds-spacing-2)',
              marginBottom: 'var(--ds-spacing-4)',
              flexWrap: 'wrap',
            }}
          >
            {resourceFilter !== 'all' && (
              <Badge data-color="neutral">
                {resourceOptions.find((o) => o.id === resourceFilter)?.label}
                <Button
                  type="button"
                  variant="tertiary"
                  onClick={() => setResourceFilter('all')}
                  aria-label={t('audit.aria.removeResourceFilter')}
                  style={{
                    marginLeft: 'var(--ds-spacing-1)',
                    padding: 0,
                  }}
                >
                  <CloseIcon style={{ width: '12px', height: '12px' }} />
                </Button>
              </Badge>
            )}
            {actionFilter !== 'all' && (
              <Badge data-color="neutral">
                {actionOptions.find((o) => o.id === actionFilter)?.label}
                <Button
                  type="button"
                  variant="tertiary"
                  onClick={() => setActionFilter('all')}
                  aria-label={t('audit.aria.removeActionFilter')}
                  style={{
                    marginLeft: 'var(--ds-spacing-1)',
                    padding: 0,
                  }}
                >
                  <CloseIcon style={{ width: '12px', height: '12px' }} />
                </Button>
              </Badge>
            )}
            {(startDate || endDate) && (
              <Badge data-color="neutral">
                {startDate || '...'} - {endDate || '...'}
                <Button
                  type="button"
                  variant="tertiary"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  aria-label={t('audit.aria.removeDateFilter')}
                  style={{
                    marginLeft: 'var(--ds-spacing-1)',
                    padding: 0,
                  }}
                >
                  <CloseIcon style={{ width: '12px', height: '12px' }} />
                </Button>
              </Badge>
            )}
          </div>
        )}

        {/* Content */}
        <div
          style={{
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            borderRadius: 'var(--ds-border-radius-lg)',
            border: '1px solid var(--ds-color-neutral-border-subtle)',
            overflow: 'hidden',
          }}
        >
          {isLoading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 'var(--ds-spacing-10)',
              }}
            >
              <Spinner aria-label={t("state.loading")} />
            </div>
          ) : error ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--ds-spacing-10)',
              }}
            >
              <Paragraph style={{ color: 'var(--ds-color-danger-text-default)' }}>
                {t('state.loading')}
              </Paragraph>
            </div>
          ) : events.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--ds-spacing-10)',
              }}
            >
              <Paragraph data-size="lg" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
                {t('audit.noEvents')}
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                {hasActiveFilters
                  ? t('audit.adjustFilters')
                  : t('audit.noEventsDesc')}
              </Paragraph>
            </div>
          ) : (
            <>
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.HeaderCell>{t('audit.table.timestamp')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('audit.table.action')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('audit.table.resource')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('audit.table.resourceId')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('audit.table.user')}</Table.HeaderCell>
                    <Table.HeaderCell style={{ width: 'var(--ds-spacing-12)' }}></Table.HeaderCell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {events.map((event: AuditLogEntry) => {
                    const { date, time } = formatTimestamp(event.timestamp);
                    return (
                      <Table.Row
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Table.Cell>
                          <div>
                            <Paragraph data-size="sm" style={{ margin: 0 }}>
                              {date}
                            </Paragraph>
                            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                              {time}
                            </Paragraph>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge data-color={getActionColor(event.action)}>
                            {getActionLabel(event.action)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Paragraph data-size="sm" style={{ margin: 0 }}>
                            {getResourceLabel(event.resource)}
                          </Paragraph>
                        </Table.Cell>
                        <Table.Cell>
                          <Paragraph data-size="sm" style={{ margin: 0, fontFamily: 'var(--ds-font-family-monospace)' }}>
                            {getResourceDisplay(event)}
                          </Paragraph>
                        </Table.Cell>
                        <Table.Cell>
                          <Paragraph data-size="sm" style={{ margin: 0 }}>
                            {userNameMap.get(event.userId || '') || t('audit.systemUser')}
                          </Paragraph>
                        </Table.Cell>
                        <Table.Cell>
                          <Button
                            type="button"
                            variant="tertiary"
                            data-size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event);
                            }}
                            aria-label={t('audit.viewDetails')}
                          >
                            &rarr;
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-3)',
                    padding: 'var(--ds-spacing-4)',
                    borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
                  }}
                >
                  <Button
                    type="button"
                    variant="tertiary"
                    data-size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeftIcon />{t("ui.previous")}</Button>
                  <Paragraph data-size="sm" style={{ margin: 0 }}>
                    {t('audit.pageOf', { page, total: totalPages })}
                  </Paragraph>
                  <Button
                    type="button"
                    variant="tertiary"
                    data-size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    {t('audit.next')}
                    <ChevronRightIcon />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
