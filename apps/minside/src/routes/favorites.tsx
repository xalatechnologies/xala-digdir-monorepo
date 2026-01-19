/**
 * FavoritesPage
 *
 * User favorites/wishlist page for Minside app
 * - Grid of favorite rental objects
 * - Quick actions (remove, view details)
 * - Empty state with CTA
 * - Mobile-responsive design
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
  Link,
  TrashIcon,
  ExternalLinkIcon,
  DashboardPageHeader,
  Badge,
} from '@xala/ds';
import {
  useFavorites,
  useRemoveFavorite,
  useFavoriteCount,
} from '@digilist/client-sdk';
import { useT } from '@xala/i18n';
import { useDialog } from '@xala/ds';

// Web app URL for viewing rental objects
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

  // Fetch favorites
  const { data: favoritesData, isLoading, error } = useFavorites();
  const favorites = favoritesData?.data ?? [];
  const { data: countData } = useFavoriteCount();
  const totalCount = countData?.count ?? 0;

  // Remove favorite mutation
  const removeFavorite = useRemoveFavorite();
  const { confirm } = useDialog();

  const handleRemove = async (id: string, name?: string) => {
    const confirmed = await confirm({
      title: t('favorites.removeTitle'),
      description: t('favorites.removeConfirm', { name: name || t('common.item') }),
      confirmText: t('action.remove'),
      cancelText: t('action.cancel'),
      variant: 'danger',
    });
    if (confirmed) {
      await removeFavorite.mutateAsync(id);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            {t('favorites.page.title')}
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            {t('favorites.description')}
          </Paragraph>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
          <Spinner aria-label={t('state.loading')} data-size="lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            {t('favorites.page.title')}
          </Heading>
        </div>
        <Card style={{
          padding: 'var(--ds-spacing-6)',
          textAlign: 'center',
          backgroundColor: 'var(--ds-color-danger-surface-default)',
          borderLeft: '4px solid var(--ds-color-danger-border-default)',
        }}>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-danger-text-default)' }}>
            {t('error.generic')}: {error.message}
          </Paragraph>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header - Using DashboardPageHeader */}
      <DashboardPageHeader
        title={t('favorites.page.title')}
        subtitle={t('favorites.description')}
        badge={<Badge data-color="brand1">{totalCount} {t('favorites.saved')}</Badge>}
        primaryAction={
          <Link href={WEB_APP_URL} target="_blank" rel="noopener noreferrer">
            <Button type="button" variant="primary">
              {t('favorites.browseRentalObjects')}
            </Button>
          </Link>
        }
      />

      {/* Empty state */}
      {favorites.length === 0 ? (
        <Card style={{
          padding: isMobile ? 'var(--ds-spacing-6)' : 'var(--ds-spacing-8)',
          textAlign: 'center',
        }}>
          <div style={{
            width: isMobile ? '56px' : '72px',
            height: isMobile ? '56px' : '72px',
            borderRadius: 'var(--ds-border-radius-full)',
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: `0 auto ${isMobile ? 'var(--ds-spacing-4)' : 'var(--ds-spacing-5)'}`,
            color: 'var(--ds-color-neutral-text-subtle)',
          }}>
            <HeartIcon style={{ width: '32px', height: '32px' }} />
          </div>
          <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
            {t('favorites.emptyTitle')}
          </Heading>
          <Paragraph style={{ 
            color: 'var(--ds-color-neutral-text-subtle)', 
            margin: 0, 
            marginBottom: isMobile ? 'var(--ds-spacing-4)' : 'var(--ds-spacing-5)',
            maxWidth: '400px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            {t('favorites.emptyDescription')}
          </Paragraph>
          <Link href={WEB_APP_URL} target="_blank" rel="noopener noreferrer">
            <Button type="button" variant="primary" data-size={isMobile ? 'sm' : 'md'}>
              {t('favorites.browseRentalObjects')}
              <ExternalLinkIcon style={{ marginLeft: 'var(--ds-spacing-1)', width: '16px', height: '16px' }} />
            </Button>
          </Link>
        </Card>
      ) : (
        /* Favorites grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 'var(--ds-spacing-4)',
        }}>
          {favorites.map((favorite) => (
            <Card key={favorite.id} style={{ 
              padding: 0, 
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Image placeholder - shows first letter or rental object image if available */}
              <div style={{
                height: '160px',
                backgroundColor: 'var(--ds-color-brand-1-surface-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
                {favorite.rentalObject?.imageUrl ? (
                  <img 
                    src={favorite.rentalObject.imageUrl} 
                    alt={favorite.rentalObject?.name || ''} 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <span style={{
                    fontSize: 'var(--ds-font-size-3xl)',
                    fontWeight: 'var(--ds-font-weight-bold)',
                    color: 'var(--ds-color-brand-1-base-default)',
                    textTransform: 'uppercase',
                  }}>
                    {(favorite.rentalObject?.name || 'R').charAt(0)}
                  </span>
                )}
                {/* Favorite badge */}
                <div style={{
                  position: 'absolute',
                  top: 'var(--ds-spacing-3)',
                  right: 'var(--ds-spacing-3)',
                  backgroundColor: 'var(--ds-color-danger-base-default)',
                  borderRadius: 'var(--ds-border-radius-full)',
                  padding: 'var(--ds-spacing-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <HeartIcon style={{ 
                    width: '16px', 
                    height: '16px', 
                    color: 'white',
                    fill: 'white',
                  }} />
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: 'var(--ds-spacing-4)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Heading level={3} data-size="sm" style={{ 
                  margin: 0, 
                  marginBottom: 'var(--ds-spacing-2)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {favorite.rentalObject?.name || t('common.unknown')}
                </Heading>
                
                {favorite.rentalObject?.address && (
                  <Paragraph data-size="sm" style={{ 
                    margin: 0, 
                    marginBottom: 'var(--ds-spacing-2)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}>
                    {typeof favorite.rentalObject.address === 'string' 
                      ? favorite.rentalObject.address 
                      : (favorite.rentalObject.address as { city?: string; street?: string })?.city || 
                        (favorite.rentalObject.address as { city?: string; street?: string })?.street}
                  </Paragraph>
                )}

                {favorite.notes && (
                  <Paragraph data-size="sm" style={{ 
                    margin: 0, 
                    marginBottom: 'var(--ds-spacing-3)',
                    color: 'var(--ds-color-neutral-text-default)',
                    fontStyle: 'italic',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    "{favorite.notes}"
                  </Paragraph>
                )}

                <Paragraph data-size="xs" style={{ 
                  margin: 0, 
                  color: 'var(--ds-color-neutral-text-subtle)',
                  marginTop: 'auto',
                }}>
                  {t('favorites.savedOn')} {new Date(favorite.createdAt).toLocaleDateString('nb-NO')}
                </Paragraph>
              </div>

              {/* Actions */}
              <div style={{ 
                padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                borderTop: '1px solid var(--ds-color-neutral-border-default)',
                display: 'flex',
                gap: 'var(--ds-spacing-2)',
              }}>
                <Link 
                  href={`${WEB_APP_URL}/rental-objects/${favorite.rentalObjectId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ flex: 1 }}
                >
                  <Button 
                    type="button" 
                    variant="secondary" 
                    data-size="sm"
                    style={{ width: '100%', minHeight: '44px' }}
                  >
                    {t('common.viewDetails')}
                    <ExternalLinkIcon style={{ marginLeft: 'var(--ds-spacing-1)', width: '14px', height: '14px' }} />
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="tertiary"
                  data-size="sm"
                  onClick={() => handleRemove(favorite.id, favorite.rentalObject?.name)}
                  disabled={removeFavorite.isPending}
                  style={{ minHeight: '44px', minWidth: '44px' }}
                  aria-label={t('favorites.remove')}
                >
                  <TrashIcon style={{ width: '18px', height: '18px', color: 'var(--ds-color-danger-base-default)' }} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Browse more CTA */}
      {favorites.length > 0 && (
        <Card style={{ 
          padding: 'var(--ds-spacing-4)', 
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--ds-spacing-3)',
          backgroundColor: 'var(--ds-color-brand-1-surface-default)',
        }}>
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            {t('favorites.discoverMore')}
          </Paragraph>
          <Link href={WEB_APP_URL} target="_blank" rel="noopener noreferrer">
            <Button type="button" variant="primary" data-size="sm">
              {t('favorites.browseRentalObjects')}
              <ExternalLinkIcon style={{ marginLeft: 'var(--ds-spacing-1)', width: '14px', height: '14px' }} />
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
