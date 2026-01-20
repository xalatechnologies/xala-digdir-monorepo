/**
 * BookingConfirmationStep Component
 * Step 2: Login prompt and booking confirmation
 * Supports session-safe return-to-flow authentication by capturing booking state before auth redirect
 */

import * as React from 'react';
import { Heading, Paragraph, Button, UserIcon, BuildingIcon } from '@xala/ds';
import type { FlowSelectedSlot, FlowBookingMode } from '@digilist/client-sdk';
import { useT } from '@xala/i18n';
import { BookingVisibilitySelector, type BookingVisibility } from './BookingVisibilitySelector';

function CheckCircleIcon({ size = 18 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ShieldIcon({ size = 24 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function UserCheckIcon({ size = 24 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  );
}

/**
 * Booking state to be captured before authentication redirect
 * This data is serialized into FlowContext for session-safe return-to-flow
 */
export interface BookingFlowState {
  /** Selected time slots with date and time information */
  selectedSlots: FlowSelectedSlot[];
  /** Details for each slot (duration, purpose, attendees, etc.) */
  slotDetails: Record<string, {
    duration: number;
    purpose?: string;
    attendees?: string;
    activityType?: string;
  }>;
  /** Start of the week being viewed */
  weekStart: string;
  /** Selected booking account type */
  bookingAccountType?: 'private' | 'organization';
  /** Selected organization ID if booking as organization */
  selectedOrganizationId?: string;
  /** Calendar visibility preference (GDPR compliance) */
  visibility?: BookingVisibility;
}

/**
 * Options for login with flow context
 * Contains everything needed to preserve booking state across auth redirect
 */
export interface LoginWithFlowContextOptions {
  /** OAuth provider to use */
  provider: 'vipps' | 'idporten';
  /** Booking state to preserve */
  bookingState: BookingFlowState;
  /** Listing ID for flow context (passed through from props if available) */
  rentalObjectId?: string;
  /** Tenant ID for flow context (passed through from props if available) */
  tenantId?: string;
  /** Current booking mode for flow context (passed through from props if available) */
  bookingMode?: FlowBookingMode;
}

export interface BookingConfirmationStepProps {
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  isSubmitting: boolean;
  bookingError: string | null;
  isMobile?: boolean;
  selectedSlots: Set<string>;
  slotDetails: Record<string, {
    duration: number;
    purpose?: string;
    attendees?: string;
    activityType?: string;
  }>;
  weekStart: Date;
  /** @deprecated Use onLoginWithFlowContext instead for session-safe authentication */
  onLoginWithVipps?: () => void;
  /** @deprecated Use onLoginWithFlowContext instead for session-safe authentication */
  onLoginAsEmployee?: () => void;
  /**
   * Handler for login with flow context preservation
   * Called when user clicks login button, receives provider and current booking state
   * If not provided, falls back to onLoginWithVipps/onLoginAsEmployee
   */
  onLoginWithFlowContext?: (options: LoginWithFlowContextOptions) => void;
  onConfirmBooking?: () => void;
  onClearError?: () => void;
  /** Selected booking account type */
  bookingAccountType?: 'private' | 'organization';
  /** Selected organization ID */
  selectedOrganizationId?: string;
  /** Handler for account type selection */
  onAccountTypeSelect?: (type: 'private' | 'organization' | undefined, organizationId?: string) => void;
  /** Handler to confirm account type selection and proceed to booking confirmation */
  onConfirmAccountType?: () => void;
  /** User's organizations (for organization selection) */
  organizations?: Array<{ id: string; name: string }>;
  /** Whether account type selection is confirmed */
  isAccountTypeConfirmed?: boolean;
  /** Listing ID for flow context (required for session-safe return-to-flow) */
  rentalObjectId?: string;
  /** Tenant ID for flow context (required for session-safe return-to-flow) */
  tenantId?: string;
  /** Current booking mode for flow context */
  bookingMode?: FlowBookingMode;
  /** Selected calendar visibility (GDPR compliance) */
  visibility?: BookingVisibility;
  /** Handler for visibility change */
  onVisibilityChange?: (visibility: BookingVisibility) => void;
  /** Handler for demo login */
  onDemoLogin?: () => void;
  /** Handler for logout (for testing) */
  onLogout?: () => void;
  /** Display mode: 'auto' (default), 'login-and-selection', 'confirmation-only' */
  displayMode?: 'auto' | 'login-and-selection' | 'confirmation-only';
}

export function BookingConfirmationStep({
  isAuthenticated,
  isLoggingIn,
  isSubmitting: _isSubmitting,
  bookingError,
  isMobile: _isMobile = false,
  selectedSlots,
  slotDetails,
  weekStart,
  onLoginWithVipps,
  onLoginAsEmployee,
  onLoginWithFlowContext,
  onConfirmBooking: _onConfirmBooking,
  onClearError,
  bookingAccountType,
  selectedOrganizationId,
  onAccountTypeSelect,
  onConfirmAccountType,
  organizations = [],
  isAccountTypeConfirmed = false,
  displayMode = 'auto',
  rentalObjectId,
  tenantId,
  bookingMode,
  visibility,
  onVisibilityChange,
  onDemoLogin,
  onLogout,
}: BookingConfirmationStepProps): React.ReactElement {
  const t = useT();
  const monthNames = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
  const dayNames = [
    t('weekday.sunday'),
    t('weekday.monday'),
    t('weekday.tuesday'),
    t('weekday.wednesday'),
    t('weekday.thursday'),
    t('weekday.friday'),
    t('weekday.saturday'),
  ];

  /**
   * Convert internal slot format (Set<string> with "dayIndex-HH:MM" keys) to FlowSelectedSlot[]
   * This transformation is needed for flow context serialization
   */
  const convertSlotsToFlowFormat = React.useCallback((): FlowSelectedSlot[] => {
    const flowSlots: FlowSelectedSlot[] = [];

    selectedSlots.forEach((slotKey) => {
      const parts = slotKey.split('-');
      const dayIdx = parseInt(parts[0] ?? '0', 10);
      const timeStr = parts[1] ?? '00:00';
      const details = slotDetails[slotKey] ?? { duration: 60 };

      // Calculate the actual date from weekStart + dayIdx
      const slotDate = new Date(weekStart);
      slotDate.setDate(weekStart.getDate() + dayIdx);

      // Calculate end time from start time + duration
      const [startH, startM] = timeStr.split(':').map(Number);
      const endMins = ((startH ?? 0) * 60 + (startM ?? 0)) + details.duration;
      const endH = Math.floor(endMins / 60);
      const endM = endMins % 60;
      const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

      flowSlots.push({
        date: slotDate.toISOString().split('T')[0] ?? '',
        startTime: timeStr,
        endTime,
      });
    });

    return flowSlots;
  }, [selectedSlots, slotDetails, weekStart]);

  /**
   * Capture current booking state for flow context preservation
   */
  const captureBookingState = React.useCallback((): BookingFlowState => {
    return {
      selectedSlots: convertSlotsToFlowFormat(),
      slotDetails: { ...slotDetails },
      weekStart: weekStart.toISOString(),
      bookingAccountType,
      selectedOrganizationId,
      visibility,
    };
  }, [convertSlotsToFlowFormat, slotDetails, weekStart, bookingAccountType, selectedOrganizationId, visibility]);

  /**
   * Handle Vipps login with flow context preservation
   * Captures current booking state before initiating OAuth redirect
   */
  const handleLoginWithVipps = React.useCallback(() => {
    // If flow context handler is available, use it to preserve booking state
    if (onLoginWithFlowContext) {
      const bookingState = captureBookingState();
      onLoginWithFlowContext({
        provider: 'vipps',
        bookingState,
        rentalObjectId,
        tenantId,
        bookingMode,
      });
    } else {
      // Fall back to deprecated handler for backwards compatibility
      onLoginWithVipps?.();
    }
  }, [onLoginWithFlowContext, captureBookingState, onLoginWithVipps, rentalObjectId, tenantId, bookingMode]);

  /**
   * Handle BankID/Employee login with flow context preservation
   * Captures current booking state before initiating OAuth redirect
   */
  const handleLoginAsEmployee = React.useCallback(() => {
    // If flow context handler is available, use it to preserve booking state
    if (onLoginWithFlowContext) {
      const bookingState = captureBookingState();
      onLoginWithFlowContext({
        provider: 'idporten',
        bookingState,
        rentalObjectId,
        tenantId,
        bookingMode,
      });
    } else {
      // Fall back to deprecated handler for backwards compatibility
      onLoginAsEmployee?.();
    }
  }, [onLoginWithFlowContext, captureBookingState, onLoginAsEmployee, rentalObjectId, tenantId, bookingMode]);

  // Determine what to show based on displayMode
  // 'login-and-selection': Only show login UI (Step 2 - login only)
  // 'confirmation-only': Show full confirmation with account selection at top (Step 3)
  // 'auto': Original behavior based on state
  
  const showAccountSelection = displayMode === 'login-and-selection'
    ? false // Login step doesn't show account selection
    : displayMode === 'confirmation-only'
      ? false // Account selection is now PART of confirmation, not separate
      : isAuthenticated && !bookingAccountType;

  const showBookingConfirmation = displayMode === 'confirmation-only'
    ? true // Always show confirmation in this mode (includes account type at top)
    : displayMode === 'login-and-selection'
      ? false // Login step doesn't show confirmation
      : isAuthenticated && bookingAccountType && (bookingAccountType === 'private' || selectedOrganizationId);

  // Explicit check: If not authenticated, ALWAYS show login
  if (!isAuthenticated) {
    return (
      <div style={{ padding: 'var(--ds-spacing-6)' }}>
        {/* Visual header with icon */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center',
          marginBottom: 'var(--ds-spacing-6)',
        }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--ds-border-radius-full)',
              background: 'linear-gradient(135deg, var(--ds-color-accent-surface-default) 0%, var(--ds-color-accent-surface-hover) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--ds-spacing-4)',
              color: 'var(--ds-color-accent-base-default)',
            }}
          >
            <UserCheckIcon size={28} />
          </div>
        <Heading level={3} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-default)' }}>
          {t('logg.inn.for.aa.fullfoere')}
        </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
          {t('for.aa.sende.bookingforespoersel')}
        </Paragraph>
        </div>

        {/* Login Buttons with enhanced styling */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-3)',
            maxWidth: '400px',
            margin: '0 auto',
          }}
        >
          {/* Vipps Button */}
          <Button
            type="button"
            variant="primary"
            data-size="lg"
            data-color="accent"
            onClick={handleLoginWithVipps}
            disabled={isLoggingIn}
            style={{
              width: '100%',
              backgroundColor: '#ff5b24',
              color: 'white',
              fontWeight: 'var(--ds-font-weight-semibold)',
              boxShadow: '0 2px 8px rgba(255, 91, 36, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            {isLoggingIn ? t('auth.loggingIn') : t('auth.loginWithVipps')}
          </Button>

          {/* Divider */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--ds-spacing-3)', 
            margin: 'var(--ds-spacing-2) 0' 
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--ds-color-neutral-border-subtle)' }} />
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('common.or')}
            </Paragraph>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--ds-color-neutral-border-subtle)' }} />
          </div>

          {/* BankID Button */}
          <Button
            type="button"
            variant="secondary"
            data-size="lg"
            onClick={handleLoginAsEmployee}
            disabled={isLoggingIn}
            style={{
              width: '100%',
            }}
          >
            {isLoggingIn ? t('auth.loggingIn') : t('auth.loginWithBankID')}
          </Button>

          {/* Demo Login Divider */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--ds-spacing-3)', 
            margin: 'var(--ds-spacing-3) 0 var(--ds-spacing-1) 0' 
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--ds-color-neutral-border-subtle)' }} />
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {t('auth.demoMode')}
            </Paragraph>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--ds-color-neutral-border-subtle)' }} />
          </div>

          {/* Demo Login Button */}
          <Button
            type="button"
            variant="tertiary"
            data-size="md"
            onClick={onDemoLogin}
            disabled={isLoggingIn}
            style={{
              width: '100%',
              backgroundColor: 'var(--ds-color-warning-surface-default)',
              color: 'var(--ds-color-warning-text-default)',
              border: '1px dashed var(--ds-color-warning-border-default)',
            }}
          >
            [TEST] {t('auth.demoLoginButton')}
          </Button>
        </div>

        {/* Security badges */}
        <div
          style={{
            marginTop: 'var(--ds-spacing-6)',
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderRadius: 'var(--ds-border-radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-3)' }}>
          <div
            style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-success-surface-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
                color: 'var(--ds-color-success-base-default)',
            }}
          >
              <ShieldIcon size={18} />
          </div>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                {t('bookingWidget.security.title')}
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('informasjon.behandles.sikkert')}
          </Paragraph>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated, show account selection or confirmation
  return (
    <div style={{ padding: 'var(--ds-spacing-6)' }}>
      {showAccountSelection ? (
        /* Account Selection - Choose Private or Organization */
        <>
          <Heading level={3} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            {t('hvordan.vil.du.booke')}
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-6)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            {t('velg.privatperson.eller.organisasjon')}
          </Paragraph>

          {/* Account Type Selection */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ds-spacing-3)',
              marginBottom: 'var(--ds-spacing-6)',
            }}
          >
            {/* Private Booking Option */}
            <button
              type="button"
              onClick={() => onAccountTypeSelect?.('private')}
              style={{
                padding: 'var(--ds-spacing-4)',
                borderRadius: 'var(--ds-border-radius-lg)',
                border: '2px solid var(--ds-color-accent-border-default)',
                backgroundColor: 'var(--ds-color-accent-surface-tinted)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--ds-color-accent-base-default)';
                e.currentTarget.style.backgroundColor = 'var(--ds-color-accent-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--ds-color-accent-border-default)';
                e.currentTarget.style.backgroundColor = 'var(--ds-color-accent-surface-tinted)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--ds-border-radius-md)',
                    backgroundColor: 'var(--ds-color-accent-base-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ds-color-accent-base-contrast-default)',
                    fontWeight: 'bold',
                    fontSize: 'var(--ds-font-size-md)',
                    flexShrink: 0,
                  }}
                >
                  <UserIcon size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-neutral-text-default)' }}>
                    {t('som.privatperson')}
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('booke.for.deg.selv')}
                  </Paragraph>
                </div>
              </div>
            </button>

            {/* Organization Booking Option */}
            <button
              type="button"
              onClick={() => onAccountTypeSelect?.('organization')}
              style={{
                padding: 'var(--ds-spacing-4)',
                borderRadius: 'var(--ds-border-radius-lg)',
                border: '2px solid var(--ds-color-neutral-border-default)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--ds-color-accent-border-default)';
                e.currentTarget.style.backgroundColor = 'var(--ds-color-accent-surface-tinted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--ds-color-neutral-border-default)';
                e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-background-default)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--ds-border-radius-md)',
                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ds-color-neutral-text-default)',
                    fontWeight: 'bold',
                    fontSize: 'var(--ds-font-size-md)',
                    flexShrink: 0,
                  }}
                >
                  <BuildingIcon size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', color: 'var(--ds-color-neutral-text-default)' }}>
                    {t('paa.vegne.av.organisasjon')}
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('booke.for.organisasjon.du.representerer')}
                  </Paragraph>
                </div>
              </div>
            </button>
          </div>

          {/* Organization Selection (shown when organization is selected) */}
          {bookingAccountType === 'organization' && (
            <div style={{ marginTop: 'var(--ds-spacing-6)' }}>
              <Heading level={4} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
                Velg organisasjon
              </Heading>
              {organizations.length === 0 ? (
                <div
                  style={{
                    padding: 'var(--ds-spacing-4)',
                    backgroundColor: 'var(--ds-color-info-surface-subtle)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    border: '1px solid var(--ds-color-info-border-subtle)',
                  }}
                >
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-info-text-default)' }}>
                    {t('du.ikke.tilknyttet.organisasjoner')}
                  </Paragraph>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--ds-spacing-2)',
                    maxHeight: '300px',
                    overflowY: 'auto',
                  }}
                >
                  {organizations.map((org) => (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => onAccountTypeSelect?.('organization', org.id)}
                      style={{
                        padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        border: selectedOrganizationId === org.id
                          ? '2px solid var(--ds-color-accent-base-default)'
                          : '1px solid var(--ds-color-neutral-border-default)',
                        backgroundColor: selectedOrganizationId === org.id
                          ? 'var(--ds-color-accent-surface-tinted)'
                          : 'var(--ds-color-neutral-background-default)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 150ms ease',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedOrganizationId !== org.id) {
                          e.currentTarget.style.borderColor = 'var(--ds-color-accent-border-default)';
                          e.currentTarget.style.backgroundColor = 'var(--ds-color-accent-surface-tinted)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedOrganizationId !== org.id) {
                          e.currentTarget.style.borderColor = 'var(--ds-color-neutral-border-default)';
                          e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-background-default)';
                        }
                      }}
                    >
                      <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', color: 'var(--ds-color-neutral-text-default)' }}>
                        {org.name}
                      </Paragraph>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : showBookingConfirmation ? (
        /* Confirmation Step - Account Type + Visibility only */
        <>
          {/* Account Type Toggle (Private / Organization) - Private is default */}
          <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>
              {t('hvordan.vil.du.booke')}
            </Paragraph>
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
              <button
                type="button"
                onClick={() => onAccountTypeSelect?.('private')}
                style={{
                  flex: 1,
                  padding: 'var(--ds-spacing-3)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: `2px solid ${bookingAccountType === 'private' ? 'var(--ds-color-accent-border-default)' : 'var(--ds-color-neutral-border-default)'}`,
                  backgroundColor: bookingAccountType === 'private' ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-background-default)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--ds-spacing-2)',
                  transition: 'all 150ms ease',
                }}
              >
                <UserIcon size={16} />
                <span style={{ fontSize: 'var(--ds-font-size-sm)', fontWeight: bookingAccountType === 'private' ? 'var(--ds-font-weight-semibold)' : 'normal' }}>
                  {t('som.privatperson')}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onAccountTypeSelect?.('organization')}
                style={{
                  flex: 1,
                  padding: 'var(--ds-spacing-3)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: `2px solid ${bookingAccountType === 'organization' ? 'var(--ds-color-accent-border-default)' : 'var(--ds-color-neutral-border-default)'}`,
                  backgroundColor: bookingAccountType === 'organization' ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-background-default)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--ds-spacing-2)',
                  transition: 'all 150ms ease',
                }}
              >
                <BuildingIcon size={16} />
                <span style={{ fontSize: 'var(--ds-font-size-sm)', fontWeight: bookingAccountType === 'organization' ? 'var(--ds-font-weight-semibold)' : 'normal' }}>
                  {t('paa.vegne.av.organisasjon')}
                </span>
              </button>
            </div>
            {/* Organization selector if organization is selected */}
            {bookingAccountType === 'organization' && organizations.length > 0 && (
              <div style={{ marginTop: 'var(--ds-spacing-3)' }}>
                <select
                  value={selectedOrganizationId || ''}
                  onChange={(e) => onAccountTypeSelect?.('organization', e.target.value || undefined)}
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-3)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    backgroundColor: 'var(--ds-color-neutral-background-default)',
                    fontSize: 'var(--ds-font-size-sm)',
                  }}
                >
                  <option value="">{t('velg.organisasjon')}</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Calendar Visibility Selection (GDPR Compliance) */}
          <BookingVisibilitySelector
            value={visibility ?? 'PUBLIC_TITLE'}
            onChange={onVisibilityChange ?? (() => {})}
          />

          {/* Error Display - only show if there's an error */}
          {bookingError && (
            <div
              style={{
                padding: 'var(--ds-spacing-3)',
                backgroundColor: 'var(--ds-color-danger-surface-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                marginTop: 'var(--ds-spacing-4)',
              }}
            >
              <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-danger-text-default)' }}>
                {bookingError}
              </Paragraph>
            </div>
          )}
        </>
      ) : isAuthenticated ? (
        /* Fallback: If authenticated but somehow no account type, show account selection */
        <div style={{ padding: 'var(--ds-spacing-6)' }}>
          <Heading level={3} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            Hvordan vil du booke?
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-6)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            Velg om du vil booke som privatperson eller på vegne av en organisasjon.
          </Paragraph>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            <button
              type="button"
              onClick={() => onAccountTypeSelect?.('private')}
              style={{
                padding: 'var(--ds-spacing-4)',
                borderRadius: 'var(--ds-border-radius-lg)',
                border: '2px solid var(--ds-color-accent-border-default)',
                backgroundColor: 'var(--ds-color-accent-surface-tinted)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                Som privatperson
              </Paragraph>
            </button>
            <button
              type="button"
              onClick={() => onAccountTypeSelect?.('organization')}
              style={{
                padding: 'var(--ds-spacing-4)',
                borderRadius: 'var(--ds-border-radius-lg)',
                border: '2px solid var(--ds-color-neutral-border-default)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                På vegne av organisasjon
              </Paragraph>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
