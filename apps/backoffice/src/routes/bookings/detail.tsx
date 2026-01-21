/**
 * Booking Detail Page
 * Shows details of a single booking with approve/reject actions
 */

import { useParams, useNavigate } from 'react-router-dom';
import { Button, Paragraph, Spinner, Card, BookingStatusBadge, PaymentStatusBadge, ArrowLeftIcon, CheckIcon, CloseIcon } from '@xalatechnologies/platform/ui';
import { useBooking, useApproveBooking, useRejectBooking, useCancelBooking, useRentalObject, useUser, formatDate, formatTime } from '@digilist/client-sdk';
import { useT } from '@xala/i18n';
import { useState } from 'react';

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useT();

  const { data: bookingData, isLoading, error } = useBooking(id || '');
  const booking = bookingData?.data;

  const { data: rentalObjectData } = useRentalObject(booking?.rentalObjectId || '');
  const rentalObject = rentalObjectData?.data;

  const { data: user } = useUser(booking?.userId || '');

  const approveBooking = useApproveBooking();
  const rejectBooking = useRejectBooking();
  const cancelBooking = useCancelBooking();

  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleApprove = async () => {
    if (!id) return;
    setIsApproving(true);
    setStatusMessage(null);
    try {
      await approveBooking.mutateAsync({ id });
      setStatusMessage({ type: 'success', text: t('bookings.approveSuccess') });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('bookings.approveFailed');
      setStatusMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    setIsRejecting(true);
    setStatusMessage(null);
    try {
      await rejectBooking.mutateAsync({ id, reason: 'Rejected by admin' });
      setStatusMessage({ type: 'success', text: t('bookings.rejectSuccess') });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('bookings.rejectFailed');
      setStatusMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsRejecting(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      await cancelBooking.mutateAsync({ id });
      setStatusMessage({ type: 'success', text: t('bookings.cancelSuccess') });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('bookings.cancelFailed');
      setStatusMessage({ type: 'error', text: errorMessage });
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spinner aria-hidden="true" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ padding: 'var(--ds-spacing-6)' }}>
        <Button variant="tertiary" onClick={() => navigate('/bookings')}>
          <ArrowLeftIcon />
          {t('common.back')}
        </Button>
        <div style={{ marginTop: 'var(--ds-spacing-4)', textAlign: 'center' }}>
          <Paragraph>{t('bookings.notFound')}</Paragraph>
        </div>
      </div>
    );
  }

  const userName = (user as any)?.name || booking.userName || booking.userId;
  const userEmail = (user as any)?.email || booking.userEmail;
  const listingName = rentalObject?.name || booking.listingName || booking.rentalObjectId;

  return (
    <div style={{ padding: 'var(--ds-spacing-6)', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <Button variant="tertiary" onClick={() => navigate('/bookings')}>
          <ArrowLeftIcon />
          {t('common.back')}
        </Button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--ds-font-size-xl)', fontWeight: 600, margin: 0 }}>
            {t('bookings.bookingDetails')}
          </h1>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}>
            {t('bookings.bookingId')}: {booking.id.slice(0, 8).toUpperCase()}
          </Paragraph>
        </div>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
          <BookingStatusBadge status={booking.status} />
          <PaymentStatusBadge status={booking.paymentStatus || 'unpaid'} />
        </div>
      </div>

      {statusMessage && (
        <div
          style={{
            padding: 'var(--ds-spacing-3)',
            borderRadius: 'var(--ds-border-radius-md)',
            marginBottom: 'var(--ds-spacing-4)',
            backgroundColor: statusMessage.type === 'success'
              ? 'var(--ds-color-success-surface-default)'
              : 'var(--ds-color-danger-surface-default)',
            color: statusMessage.type === 'success'
              ? 'var(--ds-color-success-text-default)'
              : 'var(--ds-color-danger-text-default)',
          }}
        >
          {statusMessage.text}
        </div>
      )}

      <Card style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <div style={{ padding: 'var(--ds-spacing-4)' }}>
          <h2 style={{ fontSize: 'var(--ds-font-size-md)', fontWeight: 600, marginBottom: 'var(--ds-spacing-3)' }}>
            {t('bookings.user')}
          </h2>
          <div style={{ display: 'grid', gap: 'var(--ds-spacing-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{t('common.name')}</span>
              <span style={{ fontWeight: 500 }}>{userName}</span>
            </div>
            {userEmail && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{t('common.email')}</span>
                <span>{userEmail}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <div style={{ padding: 'var(--ds-spacing-4)' }}>
          <h2 style={{ fontSize: 'var(--ds-font-size-md)', fontWeight: 600, marginBottom: 'var(--ds-spacing-3)' }}>
            {t('bookings.resource')}
          </h2>
          <div style={{ display: 'grid', gap: 'var(--ds-spacing-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{t('common.name')}</span>
              <span style={{ fontWeight: 500 }}>{listingName}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <div style={{ padding: 'var(--ds-spacing-4)' }}>
          <h2 style={{ fontSize: 'var(--ds-font-size-md)', fontWeight: 600, marginBottom: 'var(--ds-spacing-3)' }}>
            {t('bookings.bookingInfo')}
          </h2>
          <div style={{ display: 'grid', gap: 'var(--ds-spacing-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{t('bookings.date')}</span>
              <span style={{ fontWeight: 500 }}>{formatDate(booking.startTime)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{t('bookings.time')}</span>
              <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{t('bookings.price')}</span>
              <span style={{ fontWeight: 600, color: 'var(--ds-color-brand1-text-default)' }}>
                {booking.totalPrice ? `${Number(booking.totalPrice).toLocaleString('nb-NO')} ${booking.currency}` : t('common.free')}
              </span>
            </div>
            {booking.notes && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>{t('bookings.notes')}</span>
                <span>{booking.notes}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {booking.status === 'pending' && (
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
          <Button
            variant="secondary"
            data-color="danger"
            onClick={handleReject}
            disabled={isRejecting || isApproving}
          >
            {isRejecting ? <Spinner data-size="sm" aria-hidden="true" /> : <CloseIcon />}
            <span style={{ marginLeft: 'var(--ds-spacing-1)' }}>{t('bookings.action.reject')}</span>
          </Button>
          <Button
            variant="primary"
            data-color="success"
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
          >
            {isApproving ? <Spinner data-size="sm" aria-hidden="true" /> : <CheckIcon />}
            <span style={{ marginLeft: 'var(--ds-spacing-1)' }}>{t('bookings.action.approve')}</span>
          </Button>
        </div>
      )}

      {booking.status !== 'pending' && booking.status !== 'cancelled' && (
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
          <Button
            variant="secondary"
            data-color="danger"
            onClick={handleCancel}
          >
            <CloseIcon />
            <span style={{ marginLeft: 'var(--ds-spacing-1)' }}>{t('bookings.cancel')}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
