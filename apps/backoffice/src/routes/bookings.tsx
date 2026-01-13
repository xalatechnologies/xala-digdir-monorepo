/**
 * Bookings Page
 * Admin view for managing all bookings with search, filters, and actions
 * Styled consistently with ListingsListView
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Button,
  Paragraph,
  Heading,
  Spinner,
  Table,
  Checkbox,
  Dropdown,
  HeaderSearch,
  Drawer,
  DrawerSection,
  DrawerItem,
  Stack,
  Text,
  BookingStatusBadge,
  PaymentStatusBadge,
  CheckIcon,
  CloseIcon,
  MoreVerticalIcon,
  FilterIcon,
} from '@xala/ds';

import {
  useBookings,
  useConfirmBooking,
  useCancelBooking,
  useListings,
  type BookingStatus,
  type Booking,
  formatDate,
  formatTime,
} from '@digilist/client-sdk';
import { useT, useLocale } from '@xala/i18n';

// Inline Copy Icon component
const CopyIcon = ({ size = 14, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

// Status filter options
const STATUS_OPTIONS = [
  { id: 'all', label: 'Alle statuser' },
  { id: 'pending', label: 'Venter på godkjenning' },
  { id: 'confirmed', label: 'Bekreftet' },
  { id: 'completed', label: 'Fullført' },
  { id: 'cancelled', label: 'Kansellert' },
];

// Payment status filter options
const PAYMENT_OPTIONS = [
  { id: 'all', label: 'Alle betalinger' },
  { id: 'paid', label: 'Betalt' },
  { id: 'unpaid', label: 'Ikke betalt' },
  { id: 'refunded', label: 'Refundert' },
];

// Sort options
const SORT_OPTIONS = [
  { id: 'date-desc', label: 'Nyeste først', field: 'startTime', order: 'desc' },
  { id: 'date-asc', label: 'Eldste først', field: 'startTime', order: 'asc' },
  { id: 'price-desc', label: 'Høyeste pris', field: 'totalPrice', order: 'desc' },
  { id: 'price-asc', label: 'Laveste pris', field: 'totalPrice', order: 'asc' },
];

// Helper to calculate duration
function calculateDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return hours % 1 === 0 ? `${hours} t` : `${hours.toFixed(1)} t`;
}


export function BookingsPage() {
  const t = useT();
  const { locale } = useLocale();
  const formatLocale = locale === 'en' ? 'en-US' : 'nb-NO';

  // State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter state
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('date-desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Active filter count
  const activeFilterCount = [
    selectedStatus !== 'all',
    selectedPayment !== 'all',
    dateFrom,
    dateTo,
  ].filter(Boolean).length;

  // Fetch listings to create name lookup map
  const { data: listingsData } = useListings({ limit: 100 });
  const listingNameMap = useMemo(() => {
    const map = new Map<string, string>();
    listingsData?.data?.forEach(listing => {
      map.set(listing.id, listing.name);
    });
    return map;
  }, [listingsData]);

  // Build query params
  const bookingParams = useMemo(() => {
    const params: { status?: BookingStatus; from?: string; to?: string } = {};
    if (selectedStatus !== 'all') params.status = selectedStatus as BookingStatus;
    if (dateFrom) params.from = dateFrom;
    if (dateTo) params.to = dateTo;
    return Object.keys(params).length > 0 ? params : undefined;
  }, [selectedStatus, dateFrom, dateTo]);

  // Fetch bookings
  const { data: bookingsData, isLoading } = useBookings(bookingParams);

  // Filter bookings client-side by search query
  const bookings = useMemo(() => {
    const data = bookingsData?.data ?? [];
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((booking: Booking) => {
      const listingName = booking.listingName || listingNameMap.get(booking.listingId) || '';
      const userName = booking.userName || '';
      const orgName = booking.organizationName || '';
      const bookingId = booking.id.toLowerCase();

      return (
        listingName.toLowerCase().includes(query) ||
        userName.toLowerCase().includes(query) ||
        orgName.toLowerCase().includes(query) ||
        bookingId.includes(query)
      );
    });
  }, [bookingsData, searchQuery, listingNameMap]);

  // Fetch counts for stats
  const { data: pendingData } = useBookings({ status: 'pending' });
  const { data: confirmedData } = useBookings({ status: 'confirmed' });

  const confirmBooking = useConfirmBooking();
  const cancelBooking = useCancelBooking();

  const totalCount = bookingsData?.meta?.total || bookings.length;
  const pendingCount = pendingData?.meta?.total ?? 0;
  const confirmedCount = confirmedData?.meta?.total ?? 0;

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value || '');
  }, []);

  const handleConfirm = async (id: string) => {
    await confirmBooking.mutateAsync(id);
  };

  const handleCancel = async (id: string) => {
    if (window.confirm(t('bookings.confirmCancel'))) {
      await cancelBooking.mutateAsync(id);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedIds(bookings.map((b) => b.id));
    } else {
      setSelectedIds([]);
    }
  }, [bookings]);

  const handleSelectOne = useCallback((id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  }, []);

  // Apply filters
  const applyFilters = useCallback(() => {
    setIsFilterOpen(false);
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSelectedStatus('all');
    setSelectedPayment('all');
    setSelectedSort('date-desc');
    setDateFrom('');
    setDateTo('');
  }, []);

  // Get display values for a booking
  const getBookingDisplayValues = (booking: Booking) => {
    const listingName = booking.listingName || listingNameMap.get(booking.listingId) || booking.listingId;
    const userName = booking.userName || booking.userId;
    const orgName = booking.organizationName || booking.organizationId;
    const duration = calculateDuration(booking.startTime, booking.endTime);

    const bookingRef = (() => {
      const id = booking.id || '';
      if (id.includes('-')) {
        const firstSegment = id.split('-')[0];
        if (firstSegment && firstSegment !== '00000000') {
          return firstSegment.toUpperCase();
        }
        const nonZeroSegment = id.split('-').find(s => s && !/^0+$/.test(s));
        if (nonZeroSegment) return nonZeroSegment.toUpperCase();
      }
      const last8 = id.slice(-8);
      return last8 && last8 !== '00000000' ? last8.toUpperCase() : id.slice(0, 8).toUpperCase();
    })();

    return { listingName, userName, orgName, duration, bookingRef };
  };

  const allSelected = bookings.length > 0 && selectedIds.length === bookings.length;

  return (
    <>
      {/* Right Filter Drawer */}
      <Drawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter og sortering"
        icon={<FilterIcon size={20} />}
        position="right"
        size="sm"
        footer={
          <Stack spacing="var(--ds-spacing-3)">
            <Text
              size="sm"
              color="var(--ds-color-neutral-text-subtle)"
              style={{ textAlign: 'center' }}
            >
              Viser {totalCount} bookinger
            </Text>
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
              <Button
                type="button"
                variant="secondary"
                style={{ flex: 1 }}
                onClick={() => {
                  resetFilters();
                  setIsFilterOpen(false);
                }}
              >
                Nullstill
              </Button>
              <Button
                type="button"
                variant="primary"
                style={{ flex: 1 }}
                onClick={applyFilters}
              >
                Bruk filter
              </Button>
            </div>
          </Stack>
        }
      >
        {/* Status Section */}
        <DrawerSection title="Status" collapsible>
          <Stack spacing="var(--ds-spacing-1)">
            {STATUS_OPTIONS.map((status) => (
              <DrawerItem
                key={status.id}
                left={
                  <input
                    type="radio"
                    name="status"
                    checked={selectedStatus === status.id}
                    onChange={() => setSelectedStatus(status.id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--ds-color-accent-base-default)',
                    }}
                  />
                }
                onClick={() => setSelectedStatus(status.id)}
                selected={selectedStatus === status.id}
              >
                <Text size="sm" color="var(--ds-color-neutral-text-default)">
                  {status.label}
                </Text>
              </DrawerItem>
            ))}
          </Stack>
        </DrawerSection>

        {/* Payment Section */}
        <DrawerSection title="Betaling" collapsible defaultCollapsed>
          <Stack spacing="var(--ds-spacing-1)">
            {PAYMENT_OPTIONS.map((payment) => (
              <DrawerItem
                key={payment.id}
                left={
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPayment === payment.id}
                    onChange={() => setSelectedPayment(payment.id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--ds-color-accent-base-default)',
                    }}
                  />
                }
                onClick={() => setSelectedPayment(payment.id)}
                selected={selectedPayment === payment.id}
              >
                <Text size="sm" color="var(--ds-color-neutral-text-default)">
                  {payment.label}
                </Text>
              </DrawerItem>
            ))}
          </Stack>
        </DrawerSection>

        {/* Date Range Section */}
        <DrawerSection title="Datoperiode" collapsible defaultCollapsed>
          <Stack spacing="var(--ds-spacing-3)">
            <div>
              <Text size="xs" color="var(--ds-color-neutral-text-subtle)" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                Fra dato
              </Text>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--ds-spacing-2)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  fontSize: 'var(--ds-font-size-sm)',
                }}
              />
            </div>
            <div>
              <Text size="xs" color="var(--ds-color-neutral-text-subtle)" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                Til dato
              </Text>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--ds-spacing-2)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  fontSize: 'var(--ds-font-size-sm)',
                }}
              />
            </div>
          </Stack>
        </DrawerSection>

        {/* Sort Section */}
        <DrawerSection title="Sortering" collapsible defaultCollapsed>
          <Stack spacing="var(--ds-spacing-1)">
            {SORT_OPTIONS.map((sort) => (
              <DrawerItem
                key={sort.id}
                left={
                  <input
                    type="radio"
                    name="sort"
                    checked={selectedSort === sort.id}
                    onChange={() => setSelectedSort(sort.id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--ds-color-accent-base-default)',
                    }}
                  />
                }
                onClick={() => setSelectedSort(sort.id)}
                selected={selectedSort === sort.id}
              >
                <Text size="sm" color="var(--ds-color-neutral-text-default)">
                  {sort.label}
                </Text>
              </DrawerItem>
            ))}
          </Stack>
        </DrawerSection>
      </Drawer>

      {/* Detail Drawer */}
      <Drawer
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Bookingdetaljer"
        position="right"
        size="md"
        footer={
          selectedBooking && (
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                {selectedBooking.status === 'pending' && (
                  <>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => {
                        handleConfirm(selectedBooking.id);
                        setSelectedBooking(null);
                      }}
                      disabled={confirmBooking.isPending}
                    >
                      <CheckIcon /> Godkjenn
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleCancel(selectedBooking.id)}
                      disabled={cancelBooking.isPending}
                    >
                      <CloseIcon /> Avvis
                    </Button>
                  </>
                )}
                {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'pending' && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleCancel(selectedBooking.id)}
                    disabled={cancelBooking.isPending}
                  >
                    Kanseller booking
                  </Button>
                )}
              </div>
              <Button
                type="button"
                variant="tertiary"
                onClick={() => setSelectedBooking(null)}
              >
                Lukk
              </Button>
            </div>
          )
        }
      >
        {selectedBooking && (() => {
          const { listingName, userName, orgName, duration, bookingRef } = getBookingDisplayValues(selectedBooking);
          return (
            <Stack spacing="var(--ds-spacing-5)">
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Heading level={3} data-size="md" style={{ margin: 0 }}>
                    {listingName}
                  </Heading>
                  <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    #{bookingRef}
                  </Paragraph>
                </div>
                <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                  <BookingStatusBadge status={selectedBooking.status} />
                  <PaymentStatusBadge status={selectedBooking.paymentStatus || 'unpaid'} />
                </div>
              </div>

              {/* Time */}
              <div style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-surface-default)', borderRadius: 'var(--ds-border-radius-md)' }}>
                <Text size="xs" color="var(--ds-color-neutral-text-subtle)">Tidspunkt</Text>
                <Heading level={4} data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
                  {formatDate(selectedBooking.startTime)}
                </Heading>
                <Paragraph data-size="md" style={{ margin: 0 }}>
                  {formatTime(selectedBooking.startTime)} – {formatTime(selectedBooking.endTime)}
                  <span style={{ color: 'var(--ds-color-neutral-text-subtle)', marginLeft: 'var(--ds-spacing-2)' }}>
                    ({duration})
                  </span>
                </Paragraph>
              </div>

              {/* Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
                <div>
                  <Text size="xs" color="var(--ds-color-neutral-text-subtle)">Bruker</Text>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {userName || t('common.unknown')}
                  </Paragraph>
                </div>
                {orgName && (
                  <div>
                    <Text size="xs" color="var(--ds-color-neutral-text-subtle)">Organisasjon</Text>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {orgName}
                    </Paragraph>
                  </div>
                )}
                <div>
                  <Text size="xs" color="var(--ds-color-neutral-text-subtle)">Pris</Text>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {(Number(selectedBooking.totalPrice) || 0).toLocaleString(formatLocale)} {selectedBooking.currency || 'NOK'}
                  </Paragraph>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div>
                  <Text size="xs" color="var(--ds-color-neutral-text-subtle)">Notater</Text>
                  <div style={{ padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-default)', borderRadius: 'var(--ds-border-radius-sm)', marginTop: 'var(--ds-spacing-1)' }}>
                    <Paragraph data-size="sm" style={{ margin: 0 }}>
                      {selectedBooking.notes}
                    </Paragraph>
                  </div>
                </div>
              )}

              {/* Full ID */}
              <div style={{ borderTop: '1px solid var(--ds-color-neutral-border-subtle)', paddingTop: 'var(--ds-spacing-4)' }}>
                <Text size="xs" color="var(--ds-color-neutral-text-subtle)">Booking ID</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-1)' }}>
                  <code style={{
                    fontFamily: 'monospace',
                    fontSize: 'var(--ds-font-size-xs)',
                    background: 'var(--ds-color-neutral-surface-default)',
                    padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                    borderRadius: 'var(--ds-border-radius-sm)'
                  }}>
                    {selectedBooking.id}
                  </code>
                  <Button
                    type="button"
                    variant="tertiary"
                    data-size="sm"
                    onClick={() => handleCopyId(selectedBooking.id)}
                    aria-label="Kopier ID"
                  >
                    <CopyIcon style={{ width: '14px', height: '14px' }} />
                  </Button>
                </div>
              </div>
            </Stack>
          );
        })()}
      </Drawer>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)', height: '100%' }}>
        {/* Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Heading level={1} data-size="md" style={{ margin: 0 }}>
            Bookinger
            {totalCount > 0 && (
              <span style={{
                color: 'var(--ds-color-neutral-text-subtle)',
                fontWeight: 'var(--ds-font-weight-regular)',
                marginLeft: 'var(--ds-spacing-2)',
              }}>
                ({totalCount})
              </span>
            )}
          </Heading>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)' }}>
            <div style={{ textAlign: 'center' }}>
              <Text size="xs" color="var(--ds-color-neutral-text-subtle)">Ventende</Text>
              <Text size="md" color="var(--ds-color-warning-text-default)" style={{ fontWeight: 'var(--ds-font-weight-semibold)' }}>
                {pendingCount}
              </Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Text size="xs" color="var(--ds-color-neutral-text-subtle)">Bekreftet</Text>
              <Text size="md" color="var(--ds-color-success-text-default)" style={{ fontWeight: 'var(--ds-font-weight-semibold)' }}>
                {confirmedCount}
              </Text>
            </div>
          </div>
        </div>

        {/* Toolbar Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
          <HeaderSearch
            placeholder="Søk etter lokale, bruker, booking-ID..."
            value={searchValue}
            onSearchChange={handleSearchChange}
            onSearch={handleSearch}
            width="350px"
          />

          <div style={{ flex: 1 }} />

          {/* Filter button */}
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsFilterOpen(true)}
            style={{ position: 'relative' }}
          >
            <FilterIcon />
            Filtre
            {activeFilterCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                minWidth: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--ds-font-size-xs)',
                fontWeight: 'var(--ds-font-weight-semibold)',
                backgroundColor: 'var(--ds-color-accent-base-default)',
                color: 'var(--ds-color-accent-contrast-default)',
                borderRadius: 'var(--ds-border-radius-full)',
                padding: '0 var(--ds-spacing-1)',
              }}>
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-3)',
            padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-accent-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
          }}>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              {selectedIds.length} valgt
            </Paragraph>
            <Button type="button" variant="secondary" data-size="sm" onClick={() => setSelectedIds([])}>
              Fjern valg
            </Button>
          </div>
        )}

        {/* Table */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {isLoading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 'var(--ds-spacing-10)',
            }}>
              <Spinner aria-label="Laster..." />
            </div>
          ) : bookings.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--ds-spacing-10)',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: '1px solid var(--ds-color-neutral-border-subtle)',
            }}>
              <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                Ingen bookinger funnet
              </Paragraph>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                Prøv å endre søkekriteriene
              </Paragraph>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: '1px solid var(--ds-color-neutral-border-subtle)',
              overflow: 'hidden',
            }}>
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.HeaderCell style={{ width: '48px' }}>
                      <Checkbox
                        aria-label="Velg alle"
                        checked={allSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </Table.HeaderCell>
                    <Table.HeaderCell style={{ width: '110px' }}>Booking</Table.HeaderCell>
                    <Table.HeaderCell>Ressurs</Table.HeaderCell>
                    <Table.HeaderCell>Bruker</Table.HeaderCell>
                    <Table.HeaderCell>Tidspunkt</Table.HeaderCell>
                    <Table.HeaderCell style={{ width: '100px' }}>Status</Table.HeaderCell>
                    <Table.HeaderCell style={{ width: '100px' }}>Betaling</Table.HeaderCell>
                    <Table.HeaderCell style={{ width: '100px', textAlign: 'right' }}>Pris</Table.HeaderCell>
                    <Table.HeaderCell style={{ width: '60px' }} />
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {bookings.map((booking) => {
                    const { listingName, userName, orgName, duration, bookingRef } = getBookingDisplayValues(booking);
                    const isCopied = copiedId === booking.id;

                    return (
                      <Table.Row
                        key={booking.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <Table.Cell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            aria-label={`Velg booking ${bookingRef}`}
                            checked={selectedIds.includes(booking.id)}
                            onChange={(e) => handleSelectOne(booking.id, e.target.checked)}
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
                            <span style={{
                              fontFamily: 'monospace',
                              fontSize: 'var(--ds-font-size-sm)',
                              color: 'var(--ds-color-accent-text-default)'
                            }}>
                              #{bookingRef}
                            </span>
                            <Button
                              type="button"
                              variant="tertiary"
                              data-size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyId(booking.id);
                              }}
                              aria-label="Kopier ID"
                              style={{ padding: '2px' }}
                            >
                              <CopyIcon style={{
                                width: '12px',
                                height: '12px',
                                color: isCopied ? 'var(--ds-color-success-text-default)' : undefined
                              }} />
                            </Button>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                            {listingName}
                          </Paragraph>
                        </Table.Cell>
                        <Table.Cell>
                          <div>
                            <Paragraph data-size="sm" style={{
                              margin: 0,
                              fontWeight: userName && !String(userName).includes('-') ? 'var(--ds-font-weight-medium)' : 'normal',
                              color: userName && String(userName).includes('-') ? 'var(--ds-color-neutral-text-subtle)' : 'inherit',
                              fontFamily: userName && String(userName).includes('-') ? 'monospace' : 'inherit',
                              fontSize: userName && String(userName).includes('-') ? 'var(--ds-font-size-xs)' : 'inherit',
                            }}>
                              {userName || t('common.unknown')}
                            </Paragraph>
                            {orgName && (
                              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                                {orgName}
                              </Paragraph>
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div>
                            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                              {formatDate(booking.startTime)}
                            </Paragraph>
                            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                              {formatTime(booking.startTime)} – {formatTime(booking.endTime)} ({duration})
                            </Paragraph>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <BookingStatusBadge status={booking.status} />
                        </Table.Cell>
                        <Table.Cell>
                          <PaymentStatusBadge status={booking.paymentStatus || 'unpaid'} />
                        </Table.Cell>
                        <Table.Cell style={{ textAlign: 'right' }}>
                          <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                            {(Number(booking.totalPrice) || 0).toLocaleString(formatLocale)} kr
                          </Paragraph>
                        </Table.Cell>
                        <Table.Cell onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 'var(--ds-spacing-1)' }}>
                            {booking.status === 'pending' && (
                              <>
                                <Button
                                  type="button"
                                  variant="primary"
                                  data-size="sm"
                                  onClick={() => handleConfirm(booking.id)}
                                  disabled={confirmBooking.isPending}
                                  aria-label="Godkjenn"
                                  style={{ padding: 'var(--ds-spacing-1)' }}
                                >
                                  <CheckIcon style={{ width: '14px', height: '14px' }} />
                                </Button>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  data-size="sm"
                                  onClick={() => handleCancel(booking.id)}
                                  disabled={cancelBooking.isPending}
                                  aria-label="Avvis"
                                  style={{ padding: 'var(--ds-spacing-1)' }}
                                >
                                  <CloseIcon style={{ width: '14px', height: '14px' }} />
                                </Button>
                              </>
                            )}
                            <Dropdown.TriggerContext>
                              <Dropdown.Trigger asChild>
                                <Button
                                  type="button"
                                  variant="tertiary"
                                  data-size="sm"
                                  aria-label="Flere valg"
                                  style={{ padding: 'var(--ds-spacing-1)' }}
                                >
                                  <MoreVerticalIcon style={{ width: '14px', height: '14px' }} />
                                </Button>
                              </Dropdown.Trigger>
                              <Dropdown placement="bottom-end">
                                <Dropdown.List>
                                  <Dropdown.Item>
                                    <Dropdown.Button onClick={() => setSelectedBooking(booking)}>
                                      Se detaljer
                                    </Dropdown.Button>
                                  </Dropdown.Item>
                                  {booking.status !== 'cancelled' && (
                                    <Dropdown.Item>
                                      <Dropdown.Button onClick={() => handleCancel(booking.id)}>
                                        Kanseller
                                      </Dropdown.Button>
                                    </Dropdown.Item>
                                  )}
                                </Dropdown.List>
                              </Dropdown>
                            </Dropdown.TriggerContext>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
