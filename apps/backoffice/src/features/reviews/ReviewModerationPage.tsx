/**
 * Review Moderation Page
 * Admin interface for moderating user reviews
 * Allows administrators to view, approve, reject, and delete reviews
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Button,
  Heading,
  Paragraph,
  HeaderSearch,
  Spinner,
} from '@xala/ds';
import { useReviews, type ReviewStatus, type Review } from '@digilist/client-sdk';
import { ReviewModerationTable } from './components/ReviewModerationTable';
import { useT } from '@xala/i18n';

// Status filter options
const STATUS_OPTIONS = [
  { id: 'all', label: 'Alle' },
  { id: 'pending', label: t("status.pending") },
  { id: 'approved', label: 'Godkjent' },
  { id: 'rejected', label: t('common.avslaatt') },
] as const;

export function ReviewModerationPage() {
  // Translation function available for future localization
  const _t = useT(); // eslint-disable-line @typescript-eslint/no-unused-vars
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('pending');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Build query params based on status filter
  const reviewParams = useMemo(() => {
  const t = useT();
    const params: { status?: ReviewStatus } = {};
    if (statusFilter !== 'all') {
      params.status = statusFilter as ReviewStatus;
    }
    return Object.keys(params).length > 0 ? params : undefined;
  }, [statusFilter]);

  // Fetch reviews
  const { data: reviewsData, isLoading, refetch } = useReviews(reviewParams);

  // Filter reviews client-side by search query
  const reviews = useMemo(() => {
    const data = reviewsData?.data ?? [];
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((review: Review) => {
      const comment = review.comment?.toLowerCase() || '';
      const listingName = review.listingName?.toLowerCase() || '';
      const userName = review.userName?.toLowerCase() || '';
      const reviewId = review.id.toLowerCase();

      return (
        comment.includes(query) ||
        listingName.includes(query) ||
        userName.includes(query) ||
        reviewId.includes(query)
      );
    });
  }, [reviewsData, searchQuery]);

  // Handlers
  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedIds(reviews.map((r: Review) => r.id));
      } else {
        setSelectedIds([]);
      }
    },
    [reviews]
  );

  const handleSelectOne = useCallback((id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const totalCount = reviewsData?.meta?.total || reviews.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={2} data-size="md">
            Moderering av anmeldelser
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
          >
            Godkjenn, avslå eller slett anmeldelser fra brukere
          </Paragraph>
        </div>
      </div>

      {/* Status filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--ds-spacing-2)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          paddingBottom: 'var(--ds-spacing-1)',
        }}
      >
        {STATUS_OPTIONS.map((status) => {
          const isActive = statusFilter === status.id;

          return (
            <Button
              key={status.id}
              type="button"
              variant="tertiary"
              onClick={() => setStatusFilter(status.id as ReviewStatus | 'all')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md) var(--ds-border-radius-md) 0 0',
                backgroundColor: isActive
                  ? 'var(--ds-color-neutral-surface-default)'
                  : 'transparent',
                color: isActive
                  ? 'var(--ds-color-neutral-text-default)'
                  : 'var(--ds-color-neutral-text-subtle)',
                fontWeight: isActive
                  ? 'var(--ds-font-weight-semibold)'
                  : 'var(--ds-font-weight-regular)',
                fontSize: 'var(--ds-font-size-sm)',
                borderBottom: isActive
                  ? '2px solid var(--ds-color-accent-base-default)'
                  : '2px solid transparent',
                marginBottom: '-1px',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{status.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Search and filters */}
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
          <HeaderSearch
            placeholder={t('common.sok_etter_anmeldelse_objekt')}
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </div>

        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', marginLeft: 'auto' }}
        >
          Viser {reviews.length} av {totalCount} anmeldelser
        </Paragraph>
      </div>

      {/* Results */}
      <div>
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 'var(--ds-spacing-10)',
            }}
          >
            <Spinner aria-label={t('common.laster_anmeldelser')} />
          </div>
        ) : (
          <ReviewModerationTable
            reviews={reviews}
            isLoading={false}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onRefresh={handleRefresh}
          />
        )}
      </div>
    </div>
  );
}
