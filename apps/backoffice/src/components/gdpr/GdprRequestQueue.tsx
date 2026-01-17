/**
 * GDPR Request Queue Component
 * Admin view for managing GDPR data subject rights requests
 * Displays pending requests with 30-day GDPR timeline tracking
 */

/* eslint-disable digdir/prefer-ds-components -- Complex filter form */

import { useState, useMemo, useCallback } from 'react';
import {
  Button,
  Paragraph,
  Spinner,
  Table,
  HeaderSearch,
  Text,
  Badge,
  MoreVerticalIcon,
  FilterIcon,
  Dropdown,
} from '@xala/ds';

import {
  usePendingGdprRequests,
  useUsers,
  type GdprRequest,
  type GdprRequestStatus,
  formatDate,
} from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

// Helper to calculate days remaining until 30-day GDPR deadline
function calculateDaysRemaining(requestedAt: string): number {
  const requested = new Date(requestedAt);
  const deadline = new Date(requested);
  deadline.setDate(deadline.getDate() + 30);

  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

// Helper to get urgency color based on days remaining
function getUrgencyColor(daysRemaining: number): string {
  if (daysRemaining <= 3) return 'var(--ds-color-danger-base)';
  if (daysRemaining <= 7) return 'var(--ds-color-warning-base)';
  return 'var(--ds-color-neutral-text-default)';
}

// Helper to get status badge color
function getStatusColor(status: GdprRequestStatus): 'success' | 'warning' | 'info' | 'danger' {
  const colorMap: Record<GdprRequestStatus, 'success' | 'warning' | 'info' | 'danger'> = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    rejected: 'danger',
  };
  return colorMap[status];
}

// Helper to get status label
function getStatusLabel(status: GdprRequestStatus): string {
  const labelMap: Record<GdprRequestStatus, string> = {
    pending: t("status.pending"),
    processing: 'Behandles',
    completed: t("status.completed"),
    rejected: 'Avslått',
  };
  return labelMap[status];
}

// Helper to get request type label
function getRequestTypeLabel(type: 'export' | 'deletion'): string {
  const labelMap = {
    export: 'Dataeksport',
    deletion: 'Sletting',
  };
  return labelMap[type];
}

// Inline Copy Icon component
const CopyIcon = ({ size = 14, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

// Sort options
const SORT_OPTIONS = [
  { id: 'urgency-asc', label: 'Mest haster først', field: 'daysRemaining', order: 'asc' },
  { id: 'urgency-desc', label: 'Minst haster først', field: 'daysRemaining', order: 'desc' },
  { id: 'date-desc', label: 'Nyeste først', field: 'requestedAt', order: 'desc' },
  { id: 'date-asc', label: 'Eldste først', field: 'requestedAt', order: 'asc' },
];

interface GdprRequestQueueProps {
  onRequestClick?: (request: GdprRequest) => void;
}

export function GdprRequestQueue({ onRequestClick }: GdprRequestQueueProps) {
  const t = useT();
  // State
  const [searchValue, setSearchValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState<string>('urgency-asc');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch pending GDPR requests
  const { data: requestsData, isLoading } = usePendingGdprRequests();

  // Fetch users to create name lookup map
  const { data: usersData } = useUsers({ limit: 100 });
  const userNameMap = useMemo(() => {
    const map = new Map<string, { name: string; email?: string }>();
    usersData?.data?.forEach((user: { id: string; name?: string; email?: string }) => {
      const entry: { name: string; email?: string } = { name: user.name || 'Ukjent' };
      if (user.email) {
        entry.email = user.email;
      }
      map.set(user.id, entry);
    });
    return map;
  }, [usersData]);

  // Process requests: add days remaining and filter by search
  const processedRequests = useMemo(() => {
    const data = requestsData?.data ?? [];

    // Add days remaining to each request
    const withDaysRemaining = data.map((request: GdprRequest) => ({
      ...request,
      daysRemaining: calculateDaysRemaining(request.requestedAt),
    }));

    // Filter by search query
    if (!searchQuery.trim()) return withDaysRemaining;

    const query = searchQuery.toLowerCase();
    return withDaysRemaining.filter((request) => {
      const userFromMap = userNameMap.get(request.userId);
      const userName = userFromMap?.name || request.userId;
      const userEmail = userFromMap?.email || '';
      const requestType = getRequestTypeLabel(request.requestType).toLowerCase();
      const requestId = request.id.toLowerCase();

      return (
        userName.toLowerCase().includes(query) ||
        userEmail.toLowerCase().includes(query) ||
        requestType.includes(query) ||
        requestId.includes(query)
      );
    });
  }, [requestsData, searchQuery, userNameMap]);

  // Sort requests
  const sortedRequests = useMemo(() => {
    const sortOption = SORT_OPTIONS.find((opt) => opt.id === selectedSort);
    if (!sortOption) return processedRequests;

    const sorted = [...processedRequests].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      if (sortOption.field === 'daysRemaining') {
        aVal = a.daysRemaining;
        bVal = b.daysRemaining;
      } else if (sortOption.field === 'requestedAt') {
        aVal = new Date(a.requestedAt).getTime();
        bVal = new Date(b.requestedAt).getTime();
      } else {
        return 0;
      }

      if (sortOption.order === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return sorted;
  }, [processedRequests, selectedSort]);

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    setSearchQuery(searchValue);
  }, [searchValue]);

  const handleCopyId = useCallback((id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleRowClick = useCallback((request: GdprRequest & { daysRemaining: number }) => {
    if (onRequestClick) {
      onRequestClick(request);
    }
  }, [onRequestClick]);

  // Get display values for a request
  const getRequestDisplayValues = useCallback((request: GdprRequest & { daysRemaining: number }) => {
    const userFromMap = userNameMap.get(request.userId);
    const userName = userFromMap?.name || request.userId;
    const userEmail = userFromMap?.email;
    const requestType = getRequestTypeLabel(request.requestType);
    const requestedDate = formatDate(request.requestedAt);
    const { daysRemaining } = request;

    return { userName, userEmail, requestType, requestedDate, daysRemaining };
  }, [userNameMap]);

  const totalCount = requestsData?.meta?.total || sortedRequests.length;

  if (isLoading) {
    return (
      <div
        style={{
          padding: 'var(--ds-spacing-10)',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        <Spinner aria-label="Laster forespørsler..." />
        <Text style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Laster forespørsler...
        </Text>
      </div>
    );
  }

  if (!sortedRequests || sortedRequests.length === 0) {
    return (
      <div
        style={{
          padding: 'var(--ds-spacing-10)',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {searchQuery ? 'Ingen forespørsler funnet' : 'Ingen ventende forespørsler'}
        </Paragraph>
        {searchQuery && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSearchValue('');
              setSearchQuery('');
            }}
          >
            Tilbakestill søk
          </Button>
        )}
      </div>
    );
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
      {/* Search and Sort Bar */}
      <div
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-neutral-background-subtle)',
          borderRadius: 'var(--ds-border-radius-md)',
          display: 'flex',
          gap: 'var(--ds-spacing-3)',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1 }}>
          <HeaderSearch
            value={searchValue}
            onSearchChange={handleSearchChange}
            onSearch={handleSearchSubmit}
            placeholder="Søk etter bruker, type eller ID..."
          />
        </div>

        <Dropdown
          trigger={
            <Button type="button" variant="secondary" data-size="sm">
              <FilterIcon size={16} style={{ marginRight: 'var(--ds-spacing-2)' }} />
              Sorter
            </Button>
          }
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedSort(option.id)}
              style={{
                padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                border: 'none',
                background: selectedSort === option.id ? 'var(--ds-color-neutral-background-subtle)' : 'transparent',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                fontWeight: selectedSort === option.id ? 'var(--ds-font-weight-medium)' : 'normal',
              }} type="button"
            >
              {option.label}
            </button>
          ))}
        </Dropdown>
      </div>

      {/* Results Count */}
      <Text style={{ color: 'var(--ds-color-neutral-text-subtle)', fontSize: 'var(--ds-font-size-sm)' }}>
        Viser {sortedRequests.length} av {totalCount} forespørsler
      </Text>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Bruker</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Forespurt</Table.HeaderCell>
              <Table.HeaderCell>Dager igjen</Table.HeaderCell>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell style={{ width: '60px' }}></Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {sortedRequests.map((request) => {
              const { userName, userEmail, requestType, requestedDate, daysRemaining } = getRequestDisplayValues(request);
              const urgencyColor = getUrgencyColor(daysRemaining);
              const isCopied = copiedId === request.id;

              return (
                <Table.Row
                  key={request.id}
                  style={{
                    cursor: onRequestClick ? 'pointer' : 'default',
                  }}
                  onClick={() => handleRowClick(request)}
                >
                  <Table.Cell>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-1)' }}>
                      <Text
                        style={{
                          fontWeight: userName && !String(userName).includes('-') ? 'var(--ds-font-weight-medium)' : 'normal',
                          color: userName && String(userName).includes('-') ? 'var(--ds-color-neutral-text-subtle)' : 'inherit',
                          fontFamily: userName && String(userName).includes('-') ? 'monospace' : 'inherit',
                          fontSize: userName && String(userName).includes('-') ? 'var(--ds-font-size-xs)' : 'inherit',
                        }}
                      >
                        {userName || 'Ukjent'}
                      </Text>
                      {userEmail && (
                        <Text style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {userEmail}
                        </Text>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Text>{requestType}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge data-color={getStatusColor(request.status)} data-size="sm">
                      {getStatusLabel(request.status)}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                      {requestedDate}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text
                      style={{
                        color: urgencyColor,
                        fontWeight: daysRemaining <= 7 ? 'var(--ds-font-weight-bold)' : 'normal',
                      }}
                    >
                      {daysRemaining} dager
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyId(request.id);
                      }}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--ds-spacing-2)',
                        padding: 'var(--ds-spacing-2)',
                        color: isCopied ? 'var(--ds-color-success-text-default)' : 'var(--ds-color-neutral-text-subtle)',
                        fontSize: 'var(--ds-font-size-xs)',
                        fontFamily: 'monospace',
                      }}
                      title="Kopier ID" type="button"
                    >
                      {request.id.slice(0, 8)}...
                      <CopyIcon size={12} />
                    </button>
                  </Table.Cell>
                  <Table.Cell>
                    <Dropdown
                      trigger={
                        <button
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            padding: 'var(--ds-spacing-2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          aria-label="Handlinger" type="button"
                        >
                          <MoreVerticalIcon size={16} />
                        </button>
                      }
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(request);
                        }}
                        style={{
                          padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                        }} type="button"
                      >
                        Vis detaljer
                      </button>
                    </Dropdown>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
