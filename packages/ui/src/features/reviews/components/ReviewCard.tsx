/**
 * ReviewCard
 *
 * A reusable card component for displaying individual reviews.
 * Displays star rating, review text, author name, date, and helpful count.
 *
 * @example
 * ```tsx
 * import { ReviewCard } from '@digilist/ui/features/reviews';
 *
 * <ReviewCard
 *   review={reviewData}
 *   showHelpfulCount
 *   onMarkHelpful={(id) => handleMarkHelpful(id)}
 * />
 * ```
 */
import * as React from 'react';
import { Card, Heading, Paragraph, Badge, StarIcon } from '@xalatechnologies/platform/ui';
import { cn } from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';

// =============================================================================
// Types
// =============================================================================

/**
 * Review status
 */
export type ReviewStatus = 'approved' | 'pending' | 'rejected';

/**
 * Review data structure
 * Compatible with @digilist/client-sdk Review type
 */
export interface ReviewData {
  id: string;
  userName?: string;
  rating: number;
  comment?: string;
  createdAt: string;
  status: ReviewStatus;
  metadata?: {
    helpfulCount?: number;
    moderatorNotes?: string;
  };
}

export interface ReviewCardProps {
  /** Review data */
  review: ReviewData;
  /** Show helpful count badge */
  showHelpfulCount?: boolean;
  /** Show moderation status badge */
  showStatus?: boolean;
  /** Click handler for helpful button */
  onMarkHelpful?: (reviewId: string) => void;
  /** Custom class name */
  className?: string;
  /** Variant for different display contexts */
  variant?: 'default' | 'compact';
}

// =============================================================================
// Helper Components
// =============================================================================

/**
 * Formats a date string to a human-readable format
 */
function useFormatDate() {
  const t = useT();

  return React.useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return t('common.today') || 'I dag';
    } else if (diffInDays === 1) {
      return t('common.yesterday') || 'I går';
    } else if (diffInDays < 7) {
      return t('common.daysAgo', { count: diffInDays }) || `${diffInDays} dager siden`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return t('common.weeksAgo', { count: weeks }) || `${weeks} ${weeks === 1 ? 'uke' : 'uker'} siden`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return t('common.monthsAgo', { count: months }) || `${months} ${months === 1 ? 'måned' : 'måneder'} siden`;
    } else {
      return date.toLocaleDateString('nb-NO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  }, [t]);
}

/**
 * Renders star rating display (1-5 stars)
 */
function StarRating({ rating }: { rating: number }): React.ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <div
          key={star}
          style={{
            color:
              star <= rating
                ? 'var(--ds-color-warning-base-default)'
                : 'var(--ds-color-neutral-border-default)',
          }}
        >
          <StarIcon />
        </div>
      ))}
      <span
        style={{
          marginLeft: 'var(--ds-spacing-2)',
          fontSize: 'var(--ds-font-size-4)',
          fontWeight: 600,
          color: 'var(--ds-color-neutral-text-default)',
        }}
      >
        {rating}/5
      </span>
    </div>
  );
}

/**
 * Returns badge color based on review status
 */
function getStatusColor(status: ReviewStatus): 'success' | 'warning' | 'danger' {
  switch (status) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'danger';
    default:
      return 'warning';
  }
}

// =============================================================================
// Main Component
// =============================================================================

export function ReviewCard({
  review,
  showHelpfulCount = true,
  showStatus = false,
  onMarkHelpful,
  className,
  variant = 'default',
}: ReviewCardProps): React.ReactElement {
  const t = useT();
  const formatDate = useFormatDate();

  const handleHelpful = () => {
    onMarkHelpful?.(review.id);
  };

  const isCompact = variant === 'compact';

  // Status label with i18n
  const getStatusLabel = (status: ReviewStatus): string => {
    switch (status) {
      case 'approved':
        return t('status.approved') || 'Godkjent';
      case 'pending':
        return t('status.pending') || 'Venter';
      case 'rejected':
        return t('status.rejected') || 'Avvist';
      default:
        return status;
    }
  };

  return (
    <Card
      className={cn(className)}
      style={{
        padding: isCompact ? '16px' : '24px',
        borderRadius: 'var(--ds-border-radius-md)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Header: Author, Date, and Status */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 'var(--ds-spacing-2)',
          }}
        >
          <div style={{ flex: 1 }}>
            <Heading
              level={isCompact ? 4 : 3}
              data-size={isCompact ? 'xs' : 'sm'}
              style={{
                marginBottom: 'var(--ds-spacing-1)',
                color: 'var(--ds-color-neutral-text-default)',
              }}
            >
              {review.userName || t('common.anonymousUser') || 'Anonym bruker'}
            </Heading>
            <Paragraph
              data-size="sm"
              style={{
                color: 'var(--ds-color-neutral-text-subtle)',
                margin: 0,
              }}
            >
              {formatDate(review.createdAt)}
            </Paragraph>
          </div>

          {/* Status Badge (for moderation) */}
          {showStatus && (
            <Badge data-color={getStatusColor(review.status)} data-size="sm">
              {getStatusLabel(review.status)}
            </Badge>
          )}
        </div>

        {/* Star Rating */}
        <StarRating rating={review.rating} />

        {/* Review Comment/Text */}
        {review.comment && (
          <Paragraph
            data-size={isCompact ? 'sm' : 'md'}
            style={{
              color: 'var(--ds-color-neutral-text-default)',
              lineHeight: 'var(--ds-line-height-lg)',
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}
          >
            {review.comment}
          </Paragraph>
        )}

        {/* Footer: Helpful Count and Action */}
        {showHelpfulCount && review.metadata?.helpfulCount !== undefined && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              paddingTop: '8px',
              borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
            }}
          >
            {/* Helpful Count Display */}
            {review.metadata.helpfulCount > 0 && (
              <Paragraph
                data-size="sm"
                style={{
                  color: 'var(--ds-color-neutral-text-subtle)',
                  margin: 0,
                }}
              >
                {t('reviews.helpfulCount', { count: review.metadata.helpfulCount }) ||
                  `${review.metadata.helpfulCount} ${review.metadata.helpfulCount === 1 ? 'person' : 'personer'} fant dette nyttig`}
              </Paragraph>
            )}

            {/* Mark as Helpful Button */}
            {onMarkHelpful && (
              <button
                onClick={handleHelpful}
                style={{
                  marginLeft: 'auto',
                  padding: '6px 12px',
                  fontSize: 'var(--ds-font-size-4)',
                  fontWeight: 500,
                  color: 'var(--ds-color-accent-text-default)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--ds-color-accent-border-default)',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--ds-color-accent-surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                type="button"
              >
                {t('reviews.helpful') || 'Nyttig'}
              </button>
            )}
          </div>
        )}

        {/* Moderator Notes (if present) */}
        {review.metadata?.moderatorNotes && showStatus && (
          <div
            style={{
              padding: 'var(--ds-spacing-3)',
              backgroundColor: 'var(--ds-color-info-surface-subtle)',
              borderRadius: 'var(--ds-border-radius-sm)',
              borderLeft: '3px solid var(--ds-color-info-border-default)',
            }}
          >
            <Paragraph
              data-size="sm"
              style={{
                fontWeight: 600,
                marginBottom: 'var(--ds-spacing-1)',
                color: 'var(--ds-color-info-text-default)',
              }}
            >
              {t('reviews.moderatorNote') || 'Moderatornotat:'}
            </Paragraph>
            <Paragraph
              data-size="sm"
              style={{
                color: 'var(--ds-color-neutral-text-default)',
                margin: 0,
              }}
            >
              {review.metadata.moderatorNotes}
            </Paragraph>
          </div>
        )}
      </div>
    </Card>
  );
}
