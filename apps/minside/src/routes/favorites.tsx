/**
 * FavoritesPage
 *
 * Mobile-first responsive favorites page for Minside app
 * - Displays user's liked listings in a grid
 * - Stacks cards on mobile (< 768px)
 * - Touch-friendly buttons (44px+ touch targets)
 * - Uses useMyLikes hook from SDK
 * - Follows DIGILIST design patterns
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  HeartIcon,
  MapPinIcon,
  Link,
} from '@xala/ds';
import { useMyLikes, useUnlikeListing, type LikedListing } from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

// Web app URL for exploring listings
const WEB_APP_URL = import.meta.env.VITE_WEB_APP_URL || 'https://digilist.no';

// Mobile breakpoint
const MOBILE_BREAKPOINT = 768;

export function FavoritesPage() {
  const t = useT();
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Track viewport size for mobile/desktop detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch user's liked listings
  const { data: likesData, isLoading } = useMyLikes();
  const likedListings = likesData?.data ?? [];
  const totalLikes = likesData?.meta?.total ?? likedListings.length;

  // Unlike mutation
  const unlikeListing = useUnlikeListing();

  const handleUnlike = async (listingId: string) => {
    await unlikeListing.mutateAsync(listingId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'flex-start',
        gap: isMobile ? 'var(--ds-spacing-4)' : '0',
      }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            {t('minside.favorites')}
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            {t('minside.favoritesDesc')}
          </Paragraph>
        </div>
        <Link href={WEB_APP_URL} target="_blank" rel="noopener noreferrer" style={{ width: isMobile ? '100%' : 'auto' }}>
          <Button
            type="button"
            variant="primary"
            data-size="md"
            style={{
              width: isMobile ? '100%' : 'auto',
              minHeight: '44px', // WCAG AA touch target
            }}
          >
            {t('minside.exploreListings')} ↗
          </Button>
        </Link>
      </div>

      {/* Stats Card */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-3)',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--ds-border-radius-md)',
            backgroundColor: 'var(--ds-color-danger-surface-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ds-color-danger-base-default)',
          }}>
            <HeartIcon style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
              {t('minside.savedListings')}
            </Paragraph>
            <Heading level={2} data-size="xl" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-danger-text-default)' }}>
              {totalLikes}
            </Heading>
          </div>
        </div>
      </Card>

      {/* Favorites Grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
          <Spinner aria-label={t('common.loading')} data-size="lg" />
        </div>
      ) : likedListings.length === 0 ? (
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--ds-border-radius-full)',
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--ds-spacing-4)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}>
            <HeartIcon style={{ width: '32px', height: '32px' }} />
          </div>
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            {t('minside.noFavorites')}
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            {t('minside.noFavoritesDesc')}
          </Paragraph>
          <Link href={WEB_APP_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
            <Button type="button" variant="primary" data-size="md">
              {t('minside.exploreListings')} ↗
            </Button>
          </Link>
        </Card>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 'var(--ds-spacing-4)',
        }}>
          {likedListings.map((listing: LikedListing) => (
            <Card key={listing.id} style={{ padding: 0, overflow: 'hidden' }}>
              {/* Listing Image */}
              {listing.listingImageUrl && (
                <div style={{
                  width: '100%',
                  height: '160px',
                  backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                  backgroundImage: `url(${listing.listingImageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }} />
              )}
              {!listing.listingImageUrl && (
                <div style={{
                  width: '100%',
                  height: '160px',
                  backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}>
                  <HeartIcon style={{ width: '48px', height: '48px' }} />
                </div>
              )}

              {/* Listing Content */}
              <div style={{ padding: 'var(--ds-spacing-4)' }}>
                <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
                  {listing.listingName}
                </Heading>

                {listing.listingAddress && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-2)',
                    marginBottom: 'var(--ds-spacing-2)',
                  }}>
                    <MapPinIcon style={{ width: '14px', height: '14px', color: 'var(--ds-color-neutral-text-subtle)', flexShrink: 0 }} />
                    <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
                      {listing.listingAddress}
                    </Paragraph>
                  </div>
                )}

                {listing.listingDescription && (
                  <Paragraph data-size="sm" style={{
                    margin: 0,
                    marginBottom: 'var(--ds-spacing-3)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {listing.listingDescription}
                  </Paragraph>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                  <Link
                    href={`${WEB_APP_URL}/listings/${listing.listingSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ flex: 1 }}
                  >
                    <Button
                      type="button"
                      variant="primary"
                      data-size="sm"
                      style={{
                        width: '100%',
                        minHeight: '44px', // WCAG AA touch target
                      }}
                    >
                      {t('common.view')}
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    variant="secondary"
                    data-size="sm"
                    onClick={() => handleUnlike(listing.listingId)}
                    disabled={unlikeListing.isPending}
                    style={{
                      minHeight: '44px', // WCAG AA touch target
                      color: 'var(--ds-color-danger-text-default)',
                    }}
                    aria-label={t('minside.removeFavorite')}
                  >
                    <HeartIcon style={{ width: '16px', height: '16px' }} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
