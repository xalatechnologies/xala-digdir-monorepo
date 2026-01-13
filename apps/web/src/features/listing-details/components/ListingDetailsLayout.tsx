/**
 * ListingDetailsLayout Component
 *
 * Thin composition layer that assembles all listing detail components
 * into the full page layout. Follows the structure:
 * - Header block (under slideshow)
 * - Full-width tabs
 * - Tab content with sidebar widgets in Overview
 * - Full-width booking section
 */

import * as React from 'react';
import { Tabs } from '@digdir/designsystemet-react';
import { RequireAuthModal, ShareSheet } from '@xala/ds';
import type { Listing } from '../types';
import { createPresenter } from '../presenters/listingTypePresenter';
import {
  isNativeShareAvailable,
  shareNative,
  shareWithAudit,
  type ShareMedium,
  type ShareData,
} from '../adapters/shareTracker';
import { logAuditEvent } from '../adapters/auditProvider';
import { useRealtimeUpdates } from '../adapters/realtimeClient';

import { ListingHeader } from './ListingHeader';
import { OverviewTab } from './OverviewTab';
import { ActivityTab } from './ActivityTab';
import { RulesTab } from './RulesTab';
import { FaqTab } from './FaqTab';
import { ContactWidget } from './Sidebar/ContactWidget';
import { MapWidget } from './Sidebar/MapWidget';
import { OpeningHoursWidget } from './Sidebar/OpeningHoursWidget';
import { BookingWidgetPlacement } from './Sidebar/BookingWidgetPlacement';

// =============================================================================
// Props
// =============================================================================

export interface ListingDetailsLayoutProps {
  listing: Listing;
  isAuthenticated: boolean;
  userId?: string;
  isFavorited: boolean;
  isFavoriteLoading?: boolean;
  onFavoriteToggle: () => void;
  onBookingClick?: () => void;
  mapboxToken?: string;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function ListingDetailsLayout({
  listing,
  isAuthenticated,
  userId,
  isFavorited,
  isFavoriteLoading = false,
  onFavoriteToggle,
  onBookingClick,
  mapboxToken,
  className,
}: ListingDetailsLayoutProps): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [showShareSheet, setShowShareSheet] = React.useState(false);

  const presenter = React.useMemo(() => createPresenter(listing.type), [listing.type]);

  // Subscribe to real-time updates
  useRealtimeUpdates(listing.id, (event) => {
    if (event.type === 'LISTING_UPDATED') {
      // Could trigger a refetch or show a toast
      console.log('[REALTIME] Listing updated:', event);
    }
  });

  // Share data
  const shareData = React.useMemo((): ShareData => ({
    url: typeof window !== 'undefined' ? window.location.href : '',
    title: listing.name,
    description: listing.metadata.shortDescription || listing.metadata.description?.slice(0, 150) || '',
  }), [listing]);

  // Handle share action
  const handleShare = React.useCallback(async () => {
    // Log view intent
    await logAuditEvent('LISTING_SHARED', listing.tenantId, listing.id, userId);

    if (isNativeShareAvailable()) {
      const result = await shareNative(shareData);
      if (result.success) {
        await shareWithAudit(shareData, 'native', listing.tenantId, listing.id, userId);
      }
    } else {
      setShowShareSheet(true);
    }
  }, [listing, shareData, userId]);

  // Handle share from sheet
  const handleShareFromSheet = React.useCallback(async (medium: ShareMedium) => {
    await shareWithAudit(shareData, medium, listing.tenantId, listing.id, userId);
  }, [shareData, listing.tenantId, listing.id, userId]);

  // Handle auth requirement
  const handleAuthRequired = React.useCallback(() => {
    setShowAuthModal(true);
  }, []);

  // Handle favorite toggle with auth check
  const handleFavoriteToggle = React.useCallback(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    onFavoriteToggle();
  }, [isAuthenticated, onFavoriteToggle]);

  return (
    <div className={className}>
      {/* Header Block */}
      <ListingHeader
        listing={listing}
        isFavorited={isFavorited}
        isFavoriteLoading={isFavoriteLoading}
        isAuthenticated={isAuthenticated}
        onFavoriteToggle={handleFavoriteToggle}
        onShare={handleShare}
        onAuthRequired={handleAuthRequired}
      />

      {/* Full-width Tabs */}
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        style={{ marginTop: 'var(--ds-spacing-4)' }}
      >
        <Tabs.List>
          <Tabs.Tab value="overview">Oversikt</Tabs.Tab>
          <Tabs.Tab value="activity">{presenter.activityTabConfig.labelKey}</Tabs.Tab>
          <Tabs.Tab value="rules">Regler</Tabs.Tab>
          <Tabs.Tab value="faq">FAQ</Tabs.Tab>
        </Tabs.List>

        {/* Tab Panels */}
        <Tabs.Panel value="overview">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 320px',
              gap: 'var(--ds-spacing-6)',
              marginTop: 'var(--ds-spacing-6)',
            }}
            className="listing-content-grid"
          >
            {/* Main content */}
            <div>
              <OverviewTab
                metadata={listing.metadata}
                listingType={listing.type}
              />
            </div>

            {/* Sidebar */}
            <aside
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--ds-spacing-4)',
              }}
            >
              {/* Contact */}
              {listing.contact && (
                <ContactWidget contact={listing.contact} />
              )}

              {/* Map */}
              {listing.address && (
                <MapWidget
                  address={listing.address}
                  {...(mapboxToken ? { mapboxToken } : {})}
                />
              )}

              {/* Opening Hours (facilities only) */}
              {presenter.showOpeningHours && listing.openingHours && (
                <OpeningHoursWidget openingHours={listing.openingHours} />
              )}
            </aside>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="activity">
          <div style={{ marginTop: 'var(--ds-spacing-6)' }}>
            <ActivityTab
              {...(listing.activityData ? { activityData: listing.activityData } : {})}
              listingType={listing.type}
            />
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="rules">
          <div style={{ marginTop: 'var(--ds-spacing-6)' }}>
            <RulesTab
              rules={listing.metadata.rules}
              listingType={listing.type}
            />
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="faq">
          <div style={{ marginTop: 'var(--ds-spacing-6)' }}>
            <FaqTab
              faq={listing.metadata.faq}
              listingType={listing.type}
            />
          </div>
        </Tabs.Panel>
      </Tabs>

      {/* Full-width Booking Section */}
      <div style={{ marginTop: 'var(--ds-spacing-8)' }}>
        <BookingWidgetPlacement
          {...(listing.bookingConfig ? { bookingConfig: listing.bookingConfig } : {})}
          {...(listing.pricing ? { pricing: listing.pricing } : {})}
          {...(onBookingClick ? { onBookClick: onBookingClick } : {})}
        />
      </div>

      {/* Auth Modal */}
      <RequireAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={() => {
          setShowAuthModal(false);
          // Navigate to login with redirect
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }}
        onRegister={() => {
          setShowAuthModal(false);
          window.location.href = `/register?redirect=${encodeURIComponent(window.location.pathname)}`;
        }}
        actionContext="favorite"
      />

      {/* Share Sheet */}
      <ShareSheet
        isOpen={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        shareData={{
          url: shareData.url,
          title: shareData.title,
          ...(shareData.description ? { description: shareData.description } : {}),
        }}
        onShare={(platform) => {
          // Map platform to our ShareMedium and track
          handleShareFromSheet(platform as ShareMedium);
        }}
      />

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .listing-content-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default ListingDetailsLayout;
