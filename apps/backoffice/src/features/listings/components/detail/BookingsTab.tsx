/**
 * Bookings Tab Component
 * Displays bookings filtered by listing ID with table view
 * Part of ListingDetailView - shows all bookings for the current listing
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Table,
  Paragraph,
  Spinner,
  BookingStatusBadge,
  PaymentStatusBadge,
  Text,
  Button,
  Drawer,
  DrawerSection,
  DrawerItem,
  Stack,
  CheckIcon,
  CloseIcon,
  useDialog,
} from '@xala/ds';

import {
  useBookings,
  useConfirmBooking,
  useCancelBooking,
  type Booking,
  type BookingStatus,
  formatDate,
  formatTime,
  formatCurrency,
} from '@digilist/client-sdk';

interface BookingsTabProps {
  listingId: string;
}

// Inline Copy Icon component
const CopyIcon = ({ size = 14, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

// Status tabs for filtering bookings
const STATUS_TABS = [
  { id: 'pending', label: 'Ventende', icon: '⏳', color: 'warning' },
  { id: 'confirmed', label: 'Bekreftet', icon: '✓', color: 'success' },
  { id: 'completed', label: 'Fullført', icon: '✓', color: 'info' },
  { id: 'cancelled', label: 'Kansellert', icon: '✕', color: 'danger' },
  { id: 'all', label: 'Alle', icon: '📋', color: 'neutral' },
] as const;

// Helper to calculate duration
function calculateDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return hours % 1 === 0 ? `${hours} t` : `${hours.toFixed(1)} t`;
}

export function BookingsTab({ listingId }: BookingsTabProps) {
  // State for active tab - default to 'all'
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Build query params based on active tab and listing ID
  const bookingParams = useMemo(() => {
    const params: { listingId: string; status?: BookingStatus } = { listingId };
    if (activeTab !== 'all') {
      params.status = activeTab as BookingStatus;
    }
    return params;
  }, [activeTab, listingId]);

  // Fetch bookings filtered by listing ID and status
  const { data: bookingsData, isLoading } = useBookings(bookingParams);

  // Fetch counts for all status tabs (filtered by listing ID)
  const { data: pendingData } = useBookings({ listingId, status: 'pending' });
  const { data: confirmedData } = useBookings({ listingId, status: 'confirmed' });
  const { data: completedData } = useBookings({ listingId, status: 'completed' });
  const { data: cancelledData } = useBookings({ listingId, status: 'cancelled' });
  const { data: allData } = useBookings({ listingId });

  // Tab counts
  const tabCounts: Record<string, number> = {
    pending: pendingData?.meta?.total ?? pendingData?.data?.length ?? 0,
    confirmed: confirmedData?.meta?.total ?? confirmedData?.data?.length ?? 0,
    completed: completedData?.meta?.total ?? completedData?.data?.length ?? 0,
    cancelled: cancelledData?.meta?.total ?? cancelledData?.data?.length ?? 0,
    all: allData?.meta?.total ?? allData?.data?.length ?? 0,
  };

  const bookings = useMemo(() => {
    return bookingsData?.data ?? [];
  }, [bookingsData]);

  const totalCount = bookingsData?.meta?.total || bookings.length;

  // Action hooks
  const confirmBooking = useConfirmBooking();
  const cancelBooking = useCancelBooking();
  const { confirm } = useDialog();

  // Handlers
  const handleRowClick = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
  }, []);

  const handleCopyId = useCallback(async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      // Silently fail - clipboard may not be available
    }
  }, []);

  const handleConfirm = useCallback(async (booking: Booking) => {
    const confirmed = await confirm({
      title: 'Bekreft booking',
      message: `Er du sikker på at du vil bekrefte booking ${booking.id.slice(0, 8)}?`,
      confirmText: 'Bekreft',
      cancelText: 'Avbryt',
    });

    if (confirmed) {
      try {
        await confirmBooking.mutateAsync(booking.id);
        setSelectedBooking(null);
      } catch (error) {
        // Error handling is done by the SDK
      }
    }
  }, [confirm, confirmBooking]);

  const handleCancel = useCallback(async (booking: Booking) => {
    const confirmed = await confirm({
      title: 'Kanseller booking',
      message: `Er du sikker på at du vil kansellere booking ${booking.id.slice(0, 8)}? Dette kan ikke angres.`,
      confirmText: 'Kanseller',
      cancelText: 'Avbryt',
    });

    if (confirmed) {
      try {
        await cancelBooking.mutateAsync(booking.id);
        setSelectedBooking(null);
      } catch (error) {
        // Error handling is done by the SDK
      }
    }
  }, [confirm, cancelBooking]);

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'var(--ds-spacing-10)',
          minHeight: '300px',
        }}
      >
        <Spinner aria-label="Laster bookinger..." />
      </div>
    );
  }

  return (
    <div>
      {/* Status Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--ds-spacing-2)',
          marginBottom: 'var(--ds-spacing-6)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          paddingBottom: 'var(--ds-spacing-1)',
        }}
      >
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tabCounts[tab.id] || 0;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                border: 'none',
                borderRadius: 'var(--ds-radius-md)',
                backgroundColor: isActive
                  ? 'var(--ds-color-neutral-surface-subtle)'
                  : 'transparent',
                color: isActive
                  ? 'var(--ds-color-neutral-text-default)'
                  : 'var(--ds-color-neutral-text-subtle)',
                cursor: 'pointer',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '20px',
                  height: '20px',
                  padding: '0 var(--ds-spacing-1)',
                  borderRadius: 'var(--ds-radius-full)',
                  backgroundColor: isActive
                    ? 'var(--ds-color-neutral-surface-default)'
                    : 'var(--ds-color-neutral-surface-subtle)',
                  fontSize: 'var(--ds-font-size-xs)',
                  fontWeight: 600,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {bookings.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--ds-spacing-10)',
          }}
        >
          <Text
            data-size="lg"
            style={{
              color: 'var(--ds-color-neutral-text-subtle)',
              marginBottom: 'var(--ds-spacing-2)',
            }}
          >
            Ingen bookinger funnet
          </Text>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
          >
            {activeTab === 'all'
              ? 'Det er ingen bookinger for dette utleieobjektet ennå.'
              : `Det er ingen ${STATUS_TABS.find((t) => t.id === activeTab)?.label.toLowerCase()} bookinger for dette utleieobjektet.`}
          </Paragraph>
        </div>
      ) : (
        <>
          {/* Header with count */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--ds-spacing-4)',
            }}
          >
            <Paragraph
              data-size="sm"
              style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}
            >
              Viser {bookings.length} av {totalCount} bookinger
            </Paragraph>
          </div>

      {/* Bookings Table */}
      <Table size="sm" style={{ width: '100%' }}>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Booking ID</Table.HeaderCell>
            <Table.HeaderCell>Bruker</Table.HeaderCell>
            <Table.HeaderCell>Dato & Tid</Table.HeaderCell>
            <Table.HeaderCell>Varighet</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Betaling</Table.HeaderCell>
            <Table.HeaderCell style={{ textAlign: 'right' }}>Pris</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {bookings.map((booking: Booking) => {
            const duration = calculateDuration(booking.startTime, booking.endTime);
            const startDate = formatDate(booking.startTime);
            const startTime = formatTime(booking.startTime);
            const endTime = formatTime(booking.endTime);

            return (
              <Table.Row
                key={booking.id}
                style={{
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onClick={() => handleRowClick(booking)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-subtle)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Table.Cell>
                  <Text
                    data-size="sm"
                    style={{
                      fontFamily: 'monospace',
                      color: 'var(--ds-color-neutral-text-subtle)',
                    }}
                  >
                    {booking.id.slice(0, 8)}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <div>
                    <Text data-size="sm" style={{ fontWeight: 500 }}>
                      {booking.userName || 'Ukjent bruker'}
                    </Text>
                    {booking.organizationName && (
                      <Text
                        data-size="xs"
                        style={{
                          display: 'block',
                          color: 'var(--ds-color-neutral-text-subtle)',
                        }}
                      >
                        {booking.organizationName}
                      </Text>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div>
                    <Text data-size="sm" style={{ fontWeight: 500 }}>
                      {startDate}
                    </Text>
                    <Text
                      data-size="xs"
                      style={{
                        display: 'block',
                        color: 'var(--ds-color-neutral-text-subtle)',
                      }}
                    >
                      {startTime} - {endTime}
                    </Text>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Text data-size="sm">{duration}</Text>
                </Table.Cell>
                <Table.Cell>
                  <BookingStatusBadge status={booking.status} />
                </Table.Cell>
                <Table.Cell>
                  {booking.paymentStatus && (
                    <PaymentStatusBadge status={booking.paymentStatus} />
                  )}
                </Table.Cell>
                <Table.Cell style={{ textAlign: 'right' }}>
                  <Text data-size="sm" style={{ fontWeight: 500 }}>
                    {formatCurrency(parseFloat(booking.totalPrice), booking.currency)}
                  </Text>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
        </>
      )}

      {/* Booking Detail Drawer */}
      {selectedBooking && (
        <Drawer
          open={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title="Booking detaljer"
        >
          {/* Header with Booking ID and Copy */}
          <DrawerSection>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <Text
                data-size="sm"
                style={{
                  fontFamily: 'monospace',
                  color: 'var(--ds-color-neutral-text-subtle)',
                  flex: 1,
                }}
              >
                {selectedBooking.id}
              </Text>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyId(selectedBooking.id)}
                style={{ minWidth: 'auto', padding: 'var(--ds-spacing-2)' }}
              >
                {copiedId === selectedBooking.id ? (
                  <CheckIcon size={14} style={{ color: 'var(--ds-color-success-text-default)' }} />
                ) : (
                  <CopyIcon size={14} />
                )}
              </Button>
            </div>
          </DrawerSection>

          {/* Status Section */}
          <DrawerSection title="Status">
            <Stack direction="horizontal" gap={2}>
              <BookingStatusBadge status={selectedBooking.status} />
              {selectedBooking.paymentStatus && (
                <PaymentStatusBadge status={selectedBooking.paymentStatus} />
              )}
            </Stack>
          </DrawerSection>

          {/* Booking Details */}
          <DrawerSection title="Booking informasjon">
            <DrawerItem label="Dato">
              <Text data-size="sm">{formatDate(selectedBooking.startTime)}</Text>
            </DrawerItem>
            <DrawerItem label="Tidspunkt">
              <Text data-size="sm">
                {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
              </Text>
            </DrawerItem>
            <DrawerItem label="Varighet">
              <Text data-size="sm">
                {calculateDuration(selectedBooking.startTime, selectedBooking.endTime)}
              </Text>
            </DrawerItem>
          </DrawerSection>

          {/* User Information */}
          <DrawerSection title="Bruker">
            <DrawerItem label="Navn">
              <Text data-size="sm">{selectedBooking.userName || 'Ukjent bruker'}</Text>
            </DrawerItem>
            {selectedBooking.organizationName && (
              <DrawerItem label="Organisasjon">
                <Text data-size="sm">{selectedBooking.organizationName}</Text>
              </DrawerItem>
            )}
          </DrawerSection>

          {/* Payment Information */}
          <DrawerSection title="Betaling">
            <DrawerItem label="Totalpris">
              <Text data-size="sm" style={{ fontWeight: 600 }}>
                {formatCurrency(parseFloat(selectedBooking.totalPrice), selectedBooking.currency)}
              </Text>
            </DrawerItem>
          </DrawerSection>

          {/* Action Buttons */}
          {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
            <DrawerSection>
              <Stack direction="vertical" gap={2}>
                {selectedBooking.status === 'pending' && (
                  <Button
                    variant="primary"
                    onClick={() => handleConfirm(selectedBooking)}
                    disabled={confirmBooking.isPending}
                    style={{ width: '100%' }}
                  >
                    <CheckIcon size={16} />
                    {confirmBooking.isPending ? 'Bekrefter...' : 'Bekreft booking'}
                  </Button>
                )}
                {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                  <Button
                    variant="danger"
                    onClick={() => handleCancel(selectedBooking)}
                    disabled={cancelBooking.isPending}
                    style={{ width: '100%' }}
                  >
                    <CloseIcon size={16} />
                    {cancelBooking.isPending ? 'Kansellerer...' : 'Kanseller booking'}
                  </Button>
                )}
              </Stack>
            </DrawerSection>
          )}
        </Drawer>
      )}
    </div>
  );
}
