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
  useDialog,
} from '@xala/ds';

import {
  useBookings,
  useConfirmBooking,
  useCancelBooking,
  useListings,
  useUsers,
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

// Status tabs for main navigation
const STATUS_TABS = [
  { id: 'pending', label: 'Ventende', icon: '⏳', color: 'warning' },
  { id: 'confirmed', label: 'Bekreftet', icon: '✓', color: 'success' },
  { id: 'completed', label: 'Fullført', icon: '✓', color: 'info' },
  { id: 'cancelled', label: 'Kansellert', icon: '✕', color: 'danger' },
  { id: 'all', label: 'Alle', icon: '📋', color: 'neutral' },
] as const;

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

  // Filter state - default to 'pending' to show actionable items first
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('date-desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Active filter count (excludes tab selection)
  const activeFilterCount = [
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

  // Build query params based on active tab
  const bookingParams = useMemo(() => {
    const params: { status?: BookingStatus; from?: string; to?: string } = {};
    if (activeTab !== 'all') params.status = activeTab as BookingStatus;
    if (dateFrom) params.from = dateFrom;
    if (dateTo) params.to = dateTo;
    return Object.keys(params).length > 0 ? params : undefined;
  }, [activeTab, dateFrom, dateTo]);

  // Fetch users to create name lookup map
  const { data: usersData } = useUsers({ limit: 100 });
  const userNameMap = useMemo(() => {
    const map = new Map<string, { name: string; email?: string }>();
    usersData?.data?.forEach((user: { id: string; name?: string; email?: string }) => {
      map.set(user.id, { name: user.name || 'Ukjent', email: user.email });
    });
    return map;
  }, [usersData]);

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

  // Fetch counts for all status tabs
  const { data: pendingData } = useBookings({ status: 'pending' });
  const { data: confirmedData } = useBookings({ status: 'confirmed' });
  const { data: completedData } = useBookings({ status: 'completed' });
  const { data: cancelledData } = useBookings({ status: 'cancelled' });
  const { data: allData } = useBookings();

  const confirmBooking = useConfirmBooking();
  const cancelBooking = useCancelBooking();
  const { confirm } = useDialog();

  // Tab counts
  const tabCounts: Record<string, number> = {
    pending: pendingData?.meta?.total ?? pendingData?.data?.length ?? 0,
    confirmed: confirmedData?.meta?.total ?? confirmedData?.data?.length ?? 0,
    completed: completedData?.meta?.total ?? completedData?.data?.length ?? 0,
    cancelled: cancelledData?.meta?.total ?? cancelledData?.data?.length ?? 0,
    all: allData?.meta?.total ?? allData?.data?.length ?? 0,
  };

  const totalCount = bookingsData?.meta?.total || bookings.length;

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
    const confirmed = await confirm({
      title: t('bookings.cancelBooking'),
      description: t('bookings.confirmCancel'),
      confirmText: t('bookings.cancel'),
      cancelText: t('common.abort'),
      variant: 'danger',
    });
    if (confirmed) {
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
    setSelectedPayment('all');
    setSelectedSort('date-desc');
    setDateFrom('');
    setDateTo('');
  }, []);

  // Get display values for a booking (with user/listing name resolution)
  const getBookingDisplayValues = (booking: Booking) => {
    const listingName = booking.listingName || listingNameMap.get(booking.listingId) || booking.listingId;

    // Resolve user name from map if not present in booking
    const userFromMap = userNameMap.get(booking.userId);
    const userName = booking.userName || userFromMap?.name || booking.userId;
    const userEmail = booking.userEmail || userFromMap?.email;

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

    return { listingName, userName, userEmail, orgName, duration, bookingRef };
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
        {/* Payment Section */}
        <DrawerSection title="Betaling" collapsible>
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
        size="xl"
        style={{ padding: '0 var(--ds-spacing-6)' }}
        footer={
          selectedBooking && (
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                {selectedBooking.status === 'pending' && (
                  <>
                    <Button
                      type="button"
                      variant="tertiary"
                      onClick={() => {
                        handleConfirm(selectedBooking.id);
                        setSelectedBooking(null);
                      }}
                      disabled={confirmBooking.isPending}
                      style={{ color: 'var(--ds-color-success-text-default)' }}
                    >
                      <CheckIcon /> Godkjenn
                    </Button>
                    <Button
                      type="button"
                      variant="tertiary"
                      onClick={() => handleCancel(selectedBooking.id)}
                      disabled={cancelBooking.isPending}
                      style={{ color: 'var(--ds-color-danger-text-default)' }}
                    >
                      <CloseIcon /> Avvis
                    </Button>
                  </>
                )}
                {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'pending' && (
                  <Button
                    type="button"
                    variant="tertiary"
                    onClick={() => handleCancel(selectedBooking.id)}
                    disabled={cancelBooking.isPending}
                    style={{ color: 'var(--ds-color-danger-text-default)' }}
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
          const listing = listingsData?.data?.find(l => l.id === selectedBooking.listingId);

          // Check if user/org values are UUIDs (not resolved names)
          const isUserUuid = userName && /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(String(userName));
          const isOrgUuid = orgName && /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(String(orgName));

          // Format date with weekday
          const startDate = new Date(selectedBooking.startTime);
          const endDate = new Date(selectedBooking.endTime);
          const weekdays = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
          const weekday = weekdays[startDate.getDay()];
          const formattedDate = startDate.toLocaleDateString(formatLocale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });

          // Calculate time progress for current bookings
          const now = new Date();
          const isPast = endDate < now;
          const isOngoing = startDate <= now && endDate >= now;

          // Time until booking
          const getTimeUntil = () => {
            if (isPast) return null;
            if (isOngoing) return 'Pågår nå';
            const diffMs = startDate.getTime() - now.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            if (diffDays > 0) return `Om ${diffDays} dag${diffDays > 1 ? 'er' : ''}`;
            if (diffHours > 0) return `Om ${diffHours} time${diffHours > 1 ? 'r' : ''}`;
            return 'Starter snart';
          };
          const timeUntil = getTimeUntil();

          // Status styling
          const getStatusStyle = () => {
            switch (selectedBooking.status) {
              case 'pending':
                return { bg: 'var(--ds-color-warning-surface-default)', border: 'var(--ds-color-warning-border-default)', icon: '⏳' };
              case 'confirmed':
                return { bg: 'var(--ds-color-success-surface-default)', border: 'var(--ds-color-success-border-default)', icon: '✓' };
              case 'cancelled':
                return { bg: 'var(--ds-color-danger-surface-default)', border: 'var(--ds-color-danger-border-default)', icon: '✕' };
              case 'completed':
                return { bg: 'var(--ds-color-info-surface-default)', border: 'var(--ds-color-info-border-default)', icon: '✓' };
              default:
                return { bg: 'var(--ds-color-neutral-surface-default)', border: 'var(--ds-color-neutral-border-default)', icon: '•' };
            }
          };
          const statusStyle = getStatusStyle();

          return (
            <div style={{ padding: '0 var(--ds-spacing-4)' }}>
            <Stack spacing="var(--ds-spacing-5)">
              {/* Hero Section - Visual status banner */}
              <div style={{
                position: 'relative',
                padding: 'var(--ds-spacing-5)',
                background: `linear-gradient(135deg, ${statusStyle.bg}, var(--ds-color-neutral-surface-default))`,
                borderRadius: 'var(--ds-border-radius-lg)',
                border: `1px solid ${statusStyle.border}`,
                overflow: 'hidden'
              }}>
                {/* Background pattern */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '150px',
                  height: '150px',
                  background: statusStyle.border,
                  opacity: 0.05,
                  borderRadius: '50%',
                  transform: 'translate(30%, -30%)'
                }} />

                <div style={{ position: 'relative' }}>
                  {/* Booking ref and status badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-3)' }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: 'var(--ds-font-size-sm)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                      backgroundColor: 'var(--ds-color-neutral-background-default)',
                      padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                      borderRadius: 'var(--ds-border-radius-sm)'
                    }}>
                      #{bookingRef}
                    </span>
                    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                      <BookingStatusBadge status={selectedBooking.status} />
                      <PaymentStatusBadge status={selectedBooking.paymentStatus || 'unpaid'} />
                    </div>
                  </div>

                  {/* Main listing name */}
                  <Heading level={2} data-size="xl" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
                    {listingName}
                  </Heading>

                  {/* Listing metadata tags */}
                  {listing && (
                    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
                      {listing.type && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 'var(--ds-spacing-1)',
                          fontSize: 'var(--ds-font-size-sm)',
                          color: 'var(--ds-color-neutral-text-default)',
                          backgroundColor: 'var(--ds-color-neutral-background-default)',
                          padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                          borderRadius: 'var(--ds-border-radius-full)'
                        }}>
                          <span>📍</span> {listing.type}
                        </span>
                      )}
                      {listing.capacity && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 'var(--ds-spacing-1)',
                          fontSize: 'var(--ds-font-size-sm)',
                          color: 'var(--ds-color-neutral-text-default)',
                          backgroundColor: 'var(--ds-color-neutral-background-default)',
                          padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                          borderRadius: 'var(--ds-border-radius-full)'
                        }}>
                          <span>👥</span> {listing.capacity} personer
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Time indicator banner */}
              {timeUntil && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--ds-spacing-2)',
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                  backgroundColor: isOngoing
                    ? 'var(--ds-color-success-surface-default)'
                    : 'var(--ds-color-info-surface-default)',
                  borderRadius: 'var(--ds-border-radius-full)',
                  animation: isOngoing ? 'pulse 2s infinite' : 'none'
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isOngoing
                      ? 'var(--ds-color-success-base-default)'
                      : 'var(--ds-color-info-base-default)'
                  }} />
                  <Text size="sm" color={isOngoing ? 'var(--ds-color-success-text-default)' : 'var(--ds-color-info-text-default)'} style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {timeUntil}
                  </Text>
                </div>
              )}

              {/* When - Time Card */}
              <div style={{
                padding: 'var(--ds-spacing-4)',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-4)' }}>
                  {/* Calendar icon box */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--ds-border-radius-md)',
                    backgroundColor: 'var(--ds-color-accent-surface-default)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid var(--ds-color-accent-border-subtle)'
                  }}>
                    <span style={{
                      fontSize: 'var(--ds-font-size-xs)',
                      color: 'var(--ds-color-accent-text-default)',
                      textTransform: 'uppercase',
                      fontWeight: 'var(--ds-font-weight-medium)'
                    }}>
                      {startDate.toLocaleDateString(formatLocale, { month: 'short' })}
                    </span>
                    <span style={{
                      fontSize: 'var(--ds-font-size-xl)',
                      fontWeight: 'var(--ds-font-weight-bold)',
                      color: 'var(--ds-color-accent-text-default)',
                      lineHeight: 1
                    }}>
                      {startDate.getDate()}
                    </span>
                  </div>

                  <div style={{ flex: 1 }}>
                    <Text size="xs" color="var(--ds-color-neutral-text-subtle)" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Når
                    </Text>
                    <Heading level={4} data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
                      {weekday} {formattedDate}
                    </Heading>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--ds-spacing-2)',
                      marginTop: 'var(--ds-spacing-2)'
                    }}>
                      <span style={{
                        fontSize: 'var(--ds-font-size-lg)',
                        fontWeight: 'var(--ds-font-weight-semibold)',
                        color: 'var(--ds-color-accent-text-default)'
                      }}>
                        {formatTime(selectedBooking.startTime)}
                      </span>
                      <span style={{
                        width: '24px',
                        height: '2px',
                        backgroundColor: 'var(--ds-color-neutral-border-default)'
                      }} />
                      <span style={{
                        fontSize: 'var(--ds-font-size-lg)',
                        fontWeight: 'var(--ds-font-weight-semibold)',
                        color: 'var(--ds-color-accent-text-default)'
                      }}>
                        {formatTime(selectedBooking.endTime)}
                      </span>
                      <span style={{
                        padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                        backgroundColor: 'var(--ds-color-info-surface-default)',
                        borderRadius: 'var(--ds-border-radius-full)',
                        fontSize: 'var(--ds-font-size-xs)',
                        color: 'var(--ds-color-info-text-default)',
                        fontWeight: 'var(--ds-font-weight-medium)'
                      }}>
                        {duration}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Who - Booker Card */}
              <div style={{
                padding: 'var(--ds-spacing-4)',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-subtle)'
              }}>
                <Text size="xs" color="var(--ds-color-neutral-text-subtle)" style={{ textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--ds-spacing-3)', display: 'block' }}>
                  Hvem har booket
                </Text>

                {isUserUuid ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-3)',
                    padding: 'var(--ds-spacing-3)',
                    backgroundColor: 'var(--ds-color-warning-surface-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    border: '1px dashed var(--ds-color-warning-border-default)'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--ds-border-radius-full)',
                      backgroundColor: 'var(--ds-color-warning-surface-hover)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--ds-font-size-xl)'
                    }}>
                      ?
                    </div>
                    <div>
                      <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', color: 'var(--ds-color-warning-text-default)' }}>
                        Brukerdata ikke tilgjengelig
                      </Paragraph>
                      <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                        Bruker-ID: {String(userName).slice(0, 8)}...
                      </Paragraph>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                    {/* Avatar */}
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: 'var(--ds-border-radius-full)',
                      background: 'linear-gradient(135deg, var(--ds-color-accent-base-default), var(--ds-color-accent-base-hover))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--ds-font-size-xl)',
                      fontWeight: 'var(--ds-font-weight-bold)',
                      color: 'var(--ds-color-accent-contrast-default)',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      {String(userName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                        {userName || 'Ukjent bruker'}
                      </Paragraph>
                      {selectedBooking.userEmail && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)', marginTop: 'var(--ds-spacing-1)' }}>
                          <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>✉️</span>
                          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                            {selectedBooking.userEmail}
                          </Paragraph>
                        </div>
                      )}
                      {selectedBooking.userPhone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)', marginTop: 'var(--ds-spacing-1)' }}>
                          <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>📱</span>
                          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                            {selectedBooking.userPhone}
                          </Paragraph>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Organization */}
                {orgName && (
                  <div style={{
                    marginTop: 'var(--ds-spacing-3)',
                    paddingTop: 'var(--ds-spacing-3)',
                    borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-2)'
                  }}>
                    <span style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--ds-border-radius-sm)',
                      backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--ds-font-size-md)'
                    }}>
                      🏢
                    </span>
                    <div>
                      <Text size="xs" color="var(--ds-color-neutral-text-subtle)">Organisasjon</Text>
                      {isOrgUuid ? (
                        <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', fontStyle: 'italic' }}>
                          Ikke tilgjengelig
                        </Paragraph>
                      ) : (
                        <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                          {orgName}
                        </Paragraph>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Card */}
              <div style={{
                padding: 'var(--ds-spacing-4)',
                background: 'linear-gradient(135deg, var(--ds-color-success-surface-default), var(--ds-color-success-surface-hover))',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-success-border-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text size="xs" color="var(--ds-color-neutral-text-subtle)" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Total pris
                    </Text>
                    <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      inkl. mva
                    </Paragraph>
                  </div>
                  <Heading level={3} data-size="xl" style={{ margin: 0, color: 'var(--ds-color-success-text-default)' }}>
                    {(Number(selectedBooking.totalPrice) || 0).toLocaleString(formatLocale)} {selectedBooking.currency || 'NOK'}
                  </Heading>
                </div>
              </div>

              {/* Notes/Purpose */}
              {selectedBooking.notes && (
                <div style={{
                  padding: 'var(--ds-spacing-4)',
                  backgroundColor: 'var(--ds-color-neutral-surface-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px solid var(--ds-color-neutral-border-subtle)'
                }}>
                  <Text size="xs" color="var(--ds-color-neutral-text-subtle)" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📝 Formål / Notater
                  </Text>
                  <div style={{
                    padding: 'var(--ds-spacing-3)',
                    backgroundColor: 'var(--ds-color-neutral-background-default)',
                    borderRadius: 'var(--ds-border-radius-sm)',
                    marginTop: 'var(--ds-spacing-2)',
                    borderLeft: '3px solid var(--ds-color-accent-border-default)'
                  }}>
                    <Paragraph data-size="sm" style={{ margin: 0, lineHeight: 1.6 }}>
                      {selectedBooking.notes}
                    </Paragraph>
                  </div>
                </div>
              )}

              {/* Listing Description */}
              {listing?.description && (
                <div style={{
                  padding: 'var(--ds-spacing-4)',
                  backgroundColor: 'var(--ds-color-neutral-surface-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px solid var(--ds-color-neutral-border-subtle)'
                }}>
                  <Text size="xs" color="var(--ds-color-neutral-text-subtle)" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ℹ️ Om lokalet
                  </Text>
                  <Paragraph data-size="sm" style={{
                    margin: 0,
                    marginTop: 'var(--ds-spacing-2)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                    lineHeight: 1.6
                  }}>
                    {listing.description}
                  </Paragraph>
                </div>
              )}

              {/* Metadata Footer */}
              <div style={{
                padding: 'var(--ds-spacing-3)',
                backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                borderRadius: 'var(--ds-border-radius-md)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--ds-spacing-3)'
              }}>
                <div>
                  <Text size="xs" color="var(--ds-color-neutral-text-subtle)">Opprettet</Text>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {selectedBooking.createdAt
                      ? new Date(selectedBooking.createdAt).toLocaleDateString(formatLocale, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '–'}
                  </Paragraph>
                </div>
                {selectedBooking.updatedAt && selectedBooking.updatedAt !== selectedBooking.createdAt && (
                  <div>
                    <Text size="xs" color="var(--ds-color-neutral-text-subtle)">Sist oppdatert</Text>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {new Date(selectedBooking.updatedAt).toLocaleDateString(formatLocale, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Paragraph>
                  </div>
                )}
              </div>

              {/* Full ID (collapsible) */}
              <details style={{
                padding: 'var(--ds-spacing-2)',
                borderRadius: 'var(--ds-border-radius-sm)',
                backgroundColor: 'var(--ds-color-neutral-surface-default)'
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontSize: 'var(--ds-font-size-xs)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                  userSelect: 'none',
                  padding: 'var(--ds-spacing-1)'
                }}>
                  🔗 Vis full booking-ID
                </summary>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                  marginTop: 'var(--ds-spacing-2)',
                  padding: 'var(--ds-spacing-2)',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  borderRadius: 'var(--ds-border-radius-sm)'
                }}>
                  <code style={{
                    flex: 1,
                    fontFamily: 'monospace',
                    fontSize: 'var(--ds-font-size-xs)',
                    wordBreak: 'break-all',
                    color: 'var(--ds-color-neutral-text-subtle)'
                  }}>
                    {selectedBooking.id}
                  </code>
                  <Button
                    type="button"
                    variant="tertiary"
                    data-size="sm"
                    onClick={() => handleCopyId(selectedBooking.id)}
                    aria-label="Kopier ID"
                    style={{ flexShrink: 0 }}
                  >
                    <CopyIcon style={{ width: '14px', height: '14px' }} />
                  </Button>
                </div>
              </details>
            </Stack>
            </div>
          );
        })()}
      </Drawer>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)', height: '100%' }}>
        {/* Header */}
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            Bookinger
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Administrer alle bookinger og forespørsler
          </Paragraph>
        </div>

        {/* Status Tabs */}
        <div style={{
          display: 'flex',
          gap: 'var(--ds-spacing-2)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          paddingBottom: 'var(--ds-spacing-1)',
          overflowX: 'auto'
        }}>
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = tabCounts[tab.id] || 0;
            const colorMap: Record<string, string> = {
              warning: 'var(--ds-color-warning-text-default)',
              success: 'var(--ds-color-success-text-default)',
              info: 'var(--ds-color-info-text-default)',
              danger: 'var(--ds-color-danger-text-default)',
              neutral: 'var(--ds-color-neutral-text-default)',
            };

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-2)',
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                  border: 'none',
                  borderRadius: 'var(--ds-border-radius-md) var(--ds-border-radius-md) 0 0',
                  backgroundColor: isActive ? 'var(--ds-color-neutral-surface-default)' : 'transparent',
                  color: isActive ? colorMap[tab.color] : 'var(--ds-color-neutral-text-subtle)',
                  fontWeight: isActive ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-regular)',
                  fontSize: 'var(--ds-font-size-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  borderBottom: isActive ? `2px solid ${colorMap[tab.color]}` : '2px solid transparent',
                  marginBottom: '-1px',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span style={{
                    minWidth: '20px',
                    height: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--ds-font-size-xs)',
                    fontWeight: 'var(--ds-font-weight-semibold)',
                    backgroundColor: isActive
                      ? (tab.color === 'warning' ? 'var(--ds-color-warning-surface-default)'
                        : tab.color === 'success' ? 'var(--ds-color-success-surface-default)'
                        : tab.color === 'danger' ? 'var(--ds-color-danger-surface-default)'
                        : 'var(--ds-color-neutral-surface-hover)')
                      : 'var(--ds-color-neutral-surface-hover)',
                    color: isActive ? colorMap[tab.color] : 'var(--ds-color-neutral-text-subtle)',
                    borderRadius: 'var(--ds-border-radius-full)',
                    padding: '0 var(--ds-spacing-1)',
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
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

          {/* Batch actions for pending tab */}
          {activeTab === 'pending' && selectedIds.length > 0 && (
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
              <Button
                type="button"
                variant="tertiary"
                data-size="sm"
                onClick={async () => {
                  for (const id of selectedIds) {
                    await confirmBooking.mutateAsync(id);
                  }
                  setSelectedIds([]);
                }}
                disabled={confirmBooking.isPending}
                style={{ color: 'var(--ds-color-success-text-default)' }}
              >
                <CheckIcon /> Godkjenn alle ({selectedIds.length})
              </Button>
            </div>
          )}

          {/* Filter button */}
          <Button
            type="button"
            variant="tertiary"
            onClick={() => setIsFilterOpen(true)}
            style={{ position: 'relative' }}
          >
            <FilterIcon />
            {activeFilterCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                minWidth: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'var(--ds-font-weight-semibold)',
                backgroundColor: 'var(--ds-color-accent-base-default)',
                color: 'var(--ds-color-accent-contrast-default)',
                borderRadius: 'var(--ds-border-radius-full)',
              }}>
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

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
              backgroundColor: activeTab === 'pending'
                ? 'var(--ds-color-success-surface-default)'
                : 'var(--ds-color-neutral-surface-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              border: `1px solid ${activeTab === 'pending'
                ? 'var(--ds-color-success-border-subtle)'
                : 'var(--ds-color-neutral-border-subtle)'}`,
            }}>
              {activeTab === 'pending' ? (
                <>
                  <div style={{ fontSize: '48px', marginBottom: 'var(--ds-spacing-3)' }}>✓</div>
                  <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-success-text-default)' }}>
                    Ingen ventende forespørsler
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Alle bookingforespørsler er behandlet
                  </Paragraph>
                </>
              ) : activeTab === 'cancelled' ? (
                <>
                  <Paragraph data-size="md" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Ingen kansellerte bookinger
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Det finnes ingen kansellerte bookinger
                  </Paragraph>
                </>
              ) : (
                <>
                  <Paragraph data-size="md" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Ingen bookinger funnet
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {searchQuery ? 'Prøv å endre søkekriteriene' : 'Det finnes ingen bookinger i denne kategorien'}
                  </Paragraph>
                </>
              )}
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
                                  variant="secondary"
                                  data-color="brand1"
                                  data-size="md"
                                  onClick={() => handleConfirm(booking.id)}
                                  disabled={confirmBooking.isPending}
                                  aria-label="Godkjenn"
                                  title="Godkjenn booking"
                                >
                                  <CheckIcon />
                                </Button>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  data-color="danger"
                                  data-size="md"
                                  onClick={() => handleCancel(booking.id)}
                                  disabled={cancelBooking.isPending}
                                  aria-label="Avvis"
                                  title="Avvis booking"
                                >
                                  <CloseIcon />
                                </Button>
                              </>
                            )}
                            <Button
                              type="button"
                              variant="primary"
                              data-size="md"
                              icon
                              aria-label="Flere valg"
                              popovertarget={`dropdown-${booking.id}`}
                            >
                              <MoreVerticalIcon />
                            </Button>
                            <Dropdown id={`dropdown-${booking.id}`} placement="bottom-end">
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
