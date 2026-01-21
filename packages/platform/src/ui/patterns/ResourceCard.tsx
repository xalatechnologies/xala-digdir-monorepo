/**
 * ResourceCard
 *
 * A domain-neutral card component for displaying any type of resource.
 * Designed to be mapped from domain-specific DTOs without domain terminology.
 *
 * Supports multiple variants:
 * - 'grid': Compact card for grid layouts (default)
 * - 'list': Horizontal layout for list views
 * - 'compact': Minimal display for dense layouts
 *
 * All text content is pre-localized - this component does not handle i18n internally.
 *
 * @example
 * ```tsx
 * // Map from domain DTO to ResourceCard props
 * const resourceCardProps = {
 *   id: rentalObject.id,
 *   title: rentalObject.name,
 *   subtitle: rentalObject.category,
 *   // ... other mappings
 * };
 *
 * <ResourceCard {...resourceCardProps} />
 * ```
 */
import * as React from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';
import type {
  ResourceBadge,
  PriceDisplay,
  MetadataItem,
  StatusIndicator,
} from './types';

// ============================================================================
// Types
// ============================================================================

/** Card variant for different display contexts */
export type ResourceCardVariant = 'grid' | 'list' | 'compact';

/** Image configuration */
export interface ResourceCardImage {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Optional placeholder while loading */
  placeholder?: string;
  /** Aspect ratio (default: '16/9' for grid, '1/1' for compact) */
  aspectRatio?: string;
}

/** Resource card props interface */
export interface ResourceCardProps {
  /** Unique identifier */
  id: string;

  /** Primary title (pre-localized) */
  title: string;

  /** Secondary title/category (pre-localized, optional) */
  subtitle?: string;

  /** Description text (pre-localized, optional, will be truncated) */
  description?: string;

  /** Image configuration */
  image?: ResourceCardImage;

  /** Array of badges to display */
  badges?: ResourceBadge[];

  /** Price display configuration */
  price?: PriceDisplay;

  /** Array of metadata items (icon + label + value) */
  metadata?: MetadataItem[];

  /** Status indicator */
  status?: StatusIndicator;

  /** Card variant */
  variant?: ResourceCardVariant;

  /** Whether this item is favorited */
  isFavorited?: boolean;

  /** Custom class name */
  className?: string;

  // ========== Event Handlers ==========

  /** Click handler for the card */
  onClick?: (id: string) => void;

  /** Click handler for favorite toggle */
  onFavorite?: (id: string) => void;

  /** Click handler for share button */
  onShare?: (id: string) => void;

  /** Click handler for close button (detailed view) */
  onClose?: () => void;

  // ========== Display Options ==========

  /** Show/hide badges (default: true) */
  showBadges?: boolean;

  /** Show/hide price (default: true when price is provided) */
  showPrice?: boolean;

  /** Show/hide metadata (default: true when metadata is provided) */
  showMetadata?: boolean;

  /** Show/hide status (default: true when status is provided) */
  showStatus?: boolean;

  /** Show/hide description (default: true for grid, false for compact) */
  showDescription?: boolean;

  /** Show/hide favorite button (default: true when onFavorite is provided) */
  showFavoriteButton?: boolean;

  /** Show/hide share button (default: true when onShare is provided) */
  showShareButton?: boolean;

  /** Show/hide image gradient overlay (default: true) */
  showGradientOverlay?: boolean;

  /** Maximum number of badges to display (default: 3) */
  maxBadges?: number;

  /** Maximum number of metadata items to display (default: 3) */
  maxMetadata?: number;

  /** Description line clamp (default: 2 for grid, 1 for list) */
  descriptionLines?: number;

  /** Image height in pixels (grid variant only, default: 180) */
  imageHeight?: number;

  // ========== Localized Labels (for accessibility) ==========

  /** Aria label for favorite button (pre-localized) */
  favoriteAriaLabel?: string;

  /** Aria label for share button (pre-localized) */
  shareAriaLabel?: string;

  /** Aria label for close button (pre-localized) */
  closeAriaLabel?: string;

  /** "More" badge text when badges exceed maxBadges (pre-localized, e.g., "+2 more") */
  moreBadgesText?: string;
}

// ============================================================================
// Icons (inline SVG for portability)
// ============================================================================

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ShareIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ============================================================================
// Utility Functions
// ============================================================================

/** Concatenate class names, filtering out falsy values */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Get status color based on type */
function getStatusColor(type: StatusIndicator['type']): string {
  const colors: Record<StatusIndicator['type'], string> = {
    available: 'var(--ds-color-success-base-default)',
    limited: 'var(--ds-color-warning-base-default)',
    unavailable: 'var(--ds-color-danger-base-default)',
    pending: 'var(--ds-color-info-base-default)',
    confirmed: 'var(--ds-color-success-base-default)',
  };
  return colors[type] || 'var(--ds-color-neutral-base-default)';
}

/** Get badge color CSS variable */
function getBadgeColor(
  variant: ResourceBadge['variant'] = 'neutral'
): { bg: string; text: string } {
  const colors: Record<
    NonNullable<ResourceBadge['variant']>,
    { bg: string; text: string }
  > = {
    neutral: {
      bg: 'var(--ds-color-neutral-surface-hover)',
      text: 'var(--ds-color-neutral-text-default)',
    },
    accent: {
      bg: 'var(--ds-color-accent-surface-default)',
      text: 'var(--ds-color-accent-text-default)',
    },
    success: {
      bg: 'var(--ds-color-success-surface-default)',
      text: 'var(--ds-color-success-text-default)',
    },
    warning: {
      bg: 'var(--ds-color-warning-surface-default)',
      text: 'var(--ds-color-warning-text-default)',
    },
    danger: {
      bg: 'var(--ds-color-danger-surface-default)',
      text: 'var(--ds-color-danger-text-default)',
    },
    info: {
      bg: 'var(--ds-color-info-surface-default)',
      text: 'var(--ds-color-info-text-default)',
    },
  };
  return colors[variant];
}

// ============================================================================
// Sub-components
// ============================================================================

/** Action button component */
interface ActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  ariaLabel: string;
  isActive?: boolean;
  activeColor?: string;
  children: React.ReactNode;
}

function ActionButton({
  onClick,
  ariaLabel,
  isActive,
  activeColor,
  children,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'var(--ds-spacing-9)',
        height: 'var(--ds-spacing-9)',
        border: 'none',
        borderRadius: 'var(--ds-border-radius-full)',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        color: isActive
          ? activeColor || 'var(--ds-color-danger-base-default)'
          : 'var(--ds-color-neutral-text-subtle)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow:
          'var(--ds-shadow-sm, 0 2px 8px var(--ds-color-neutral-border-subtle))',
      }}
    >
      {children}
    </button>
  );
}

/** Badge component */
function Badge({ badge }: { badge: ResourceBadge }) {
  const colors = getBadgeColor(badge.variant);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-1)',
        padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
        fontSize: 'var(--ds-font-size-xs)',
        fontWeight: 500,
        backgroundColor: colors.bg,
        color: colors.text,
        borderRadius: 'var(--ds-border-radius-sm)',
        whiteSpace: 'nowrap',
      }}
    >
      {badge.icon}
      {badge.text}
    </span>
  );
}

/** Metadata item component */
function MetadataItemDisplay({ item }: { item: MetadataItem }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-1)',
        fontSize: 'var(--ds-font-size-sm)',
        color: 'var(--ds-color-neutral-text-subtle)',
      }}
    >
      {item.icon && (
        <span style={{ display: 'flex', flexShrink: 0 }}>{item.icon}</span>
      )}
      <span>{item.value}</span>
    </div>
  );
}

/** Status indicator component */
function StatusDisplay({ status }: { status: StatusIndicator }) {
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-2)',
        fontSize: 'var(--ds-font-size-sm)',
        fontWeight: 500,
      }}
    >
      <span
        style={{
          width: 'var(--ds-spacing-2)',
          height: 'var(--ds-spacing-2)',
          borderRadius: 'var(--ds-border-radius-full)',
          backgroundColor: getStatusColor(status.type),
        }}
      />
      <span style={{ color: 'var(--ds-color-neutral-text-default)' }}>
        {status.label}
      </span>
    </span>
  );
}

/** Price display component */
function PriceDisplayComponent({ price }: { price: PriceDisplay }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 'var(--ds-spacing-1)',
      }}
    >
      {price.prefix && (
        <span
          style={{
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {price.prefix}
        </span>
      )}
      {price.strikethrough && (
        <span
          style={{
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-subtle)',
            textDecoration: 'line-through',
          }}
        >
          {price.strikethrough}
        </span>
      )}
      <span
        style={{
          fontSize: 'var(--ds-font-size-md)',
          fontWeight: 600,
          color: 'var(--ds-color-neutral-text-default)',
        }}
      >
        {price.amount}
      </span>
      {price.unit && (
        <span
          style={{
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          /{price.unit}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ResourceCard({
  id,
  title,
  subtitle,
  description,
  image,
  badges = [],
  price,
  metadata = [],
  status,
  variant = 'grid',
  isFavorited = false,
  className,
  onClick,
  onFavorite,
  onShare,
  onClose,
  showBadges = true,
  showPrice = true,
  showMetadata = true,
  showStatus = true,
  showDescription = variant !== 'compact',
  showFavoriteButton = true,
  showShareButton = true,
  showGradientOverlay = true,
  maxBadges = 3,
  maxMetadata = 3,
  descriptionLines = variant === 'grid' ? 2 : 1,
  imageHeight = 180,
  favoriteAriaLabel = 'Toggle favorite',
  shareAriaLabel = 'Share',
  closeAriaLabel = 'Close',
  moreBadgesText,
}: ResourceCardProps): React.ReactElement {
  const [isHovered, setIsHovered] = React.useState(false);

  // Event handlers
  const handleClick = () => onClick?.(id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(id);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  // Calculate visible badges and remaining count
  const visibleBadges = badges.slice(0, maxBadges);
  const remainingBadges = badges.length - maxBadges;

  // Calculate visible metadata
  const visibleMetadata = metadata.slice(0, maxMetadata);

  // ========== COMPACT VARIANT ==========
  if (variant === 'compact') {
    return (
      <div
        className={cn('resource-card resource-card--compact', className)}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-3)',
          padding: 'var(--ds-spacing-3)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: `1px solid ${
            isHovered
              ? 'var(--ds-color-accent-border-subtle)'
              : 'var(--ds-color-neutral-border-subtle)'
          }`,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Thumbnail */}
        {image && (
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--ds-border-radius-sm)',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Heading
            level={4}
            data-size="2xs"
            style={{
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </Heading>
          {subtitle && (
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                color: 'var(--ds-color-neutral-text-subtle)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {subtitle}
            </Paragraph>
          )}
        </div>

        {/* Status */}
        {showStatus && status && <StatusDisplay status={status} />}

        {/* Price */}
        {showPrice && price && <PriceDisplayComponent price={price} />}
      </div>
    );
  }

  // ========== LIST VARIANT ==========
  if (variant === 'list') {
    return (
      <div
        className={cn('resource-card resource-card--list', className)}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex',
          gap: 'var(--ds-spacing-4)',
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
          border: `1px solid ${
            isHovered
              ? 'var(--ds-color-accent-border-subtle)'
              : 'var(--ds-color-neutral-border-subtle)'
          }`,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          boxShadow: isHovered
            ? 'var(--ds-shadow-sm, 0 4px 12px var(--ds-color-neutral-border-default))'
            : 'none',
        }}
      >
        {/* Image */}
        {image && (
          <div
            style={{
              width: '160px',
              height: '120px',
              borderRadius: 'var(--ds-border-radius-md)',
              overflow: 'hidden',
              flexShrink: 0,
              backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            }}
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        {/* Content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-2)',
            minWidth: 0,
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 'var(--ds-spacing-3)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <Heading level={3} data-size="xs" style={{ margin: 0 }}>
                {title}
              </Heading>
              {subtitle && (
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {subtitle}
                </Paragraph>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
              {showFavoriteButton && onFavorite && (
                <ActionButton
                  onClick={handleFavorite}
                  ariaLabel={favoriteAriaLabel}
                  isActive={isFavorited}
                >
                  <HeartIcon filled={isFavorited} />
                </ActionButton>
              )}
              {showShareButton && onShare && (
                <ActionButton onClick={handleShare} ariaLabel={shareAriaLabel}>
                  <ShareIcon />
                </ActionButton>
              )}
            </div>
          </div>

          {/* Description */}
          {showDescription && description && (
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                color: 'var(--ds-color-neutral-text-subtle)',
                display: '-webkit-box',
                WebkitLineClamp: descriptionLines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {description}
            </Paragraph>
          )}

          {/* Badges */}
          {showBadges && visibleBadges.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--ds-spacing-2)',
              }}
            >
              {visibleBadges.map((badge) => (
                <Badge key={badge.id} badge={badge} />
              ))}
              {remainingBadges > 0 && moreBadgesText && (
                <span
                  style={{
                    fontSize: 'var(--ds-font-size-xs)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                    alignSelf: 'center',
                  }}
                >
                  {moreBadgesText}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'auto',
            }}
          >
            {/* Metadata */}
            {showMetadata && visibleMetadata.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--ds-spacing-4)',
                }}
              >
                {visibleMetadata.map((item) => (
                  <MetadataItemDisplay key={item.id} item={item} />
                ))}
              </div>
            )}

            {/* Status + Price */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-4)',
              }}
            >
              {showStatus && status && <StatusDisplay status={status} />}
              {showPrice && price && <PriceDisplayComponent price={price} />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== GRID VARIANT (DEFAULT) ==========
  return (
    <div
      className={cn('resource-card resource-card--grid', className)}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderRadius: 'var(--ds-border-radius-lg)',
        border: `0.5px solid ${
          isHovered
            ? 'var(--ds-color-accent-border-subtle)'
            : 'var(--ds-color-neutral-border-subtle)'
        }`,
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: isHovered
          ? 'var(--ds-shadow-md, 0 12px 32px var(--ds-color-neutral-border-default))'
          : 'var(--ds-shadow-sm, 0 2px 8px var(--ds-color-neutral-border-subtle))',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {/* Image section */}
      <div
        style={{
          position: 'relative',
          height: `${imageHeight}px`,
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
        }}
      >
        {image && (
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}

        {/* Gradient overlay */}
        {showGradientOverlay && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, var(--ds-color-neutral-background-default) 0%, transparent 50%)',
              opacity: 0.4,
            }}
          />
        )}

        {/* Category badge (first badge) */}
        {showBadges && visibleBadges[0] && (
          <div
            style={{
              position: 'absolute',
              top: 'var(--ds-spacing-3)',
              left: 'var(--ds-spacing-3)',
            }}
          >
            <Badge badge={visibleBadges[0]} />
          </div>
        )}

        {/* Action buttons */}
        {(showFavoriteButton || showShareButton) && (
          <div
            style={{
              position: 'absolute',
              top: 'var(--ds-spacing-3)',
              right: 'var(--ds-spacing-3)',
              display: 'flex',
              gap: 'var(--ds-spacing-2)',
            }}
          >
            {showFavoriteButton && onFavorite && (
              <ActionButton
                onClick={handleFavorite}
                ariaLabel={favoriteAriaLabel}
                isActive={isFavorited}
              >
                <HeartIcon filled={isFavorited} />
              </ActionButton>
            )}
            {showShareButton && onShare && (
              <ActionButton onClick={handleShare} ariaLabel={shareAriaLabel}>
                <ShareIcon />
              </ActionButton>
            )}
          </div>
        )}

        {/* Close button (for detailed/modal view) */}
        {onClose && (
          <button
            type="button"
            onClick={handleClose}
            aria-label={closeAriaLabel}
            style={{
              position: 'absolute',
              top: 'var(--ds-spacing-3)',
              right: 'var(--ds-spacing-3)',
              zIndex: 10,
              width: 'var(--ds-spacing-10)',
              height: 'var(--ds-spacing-10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--ds-color-neutral-border-subtle)',
              borderRadius: 'var(--ds-border-radius-full)',
              backgroundColor: 'var(--ds-color-neutral-background-default)',
              color: 'var(--ds-color-neutral-text-default)',
              cursor: 'pointer',
              boxShadow:
                'var(--ds-shadow-md, 0 4px 12px var(--ds-color-neutral-border-default))',
              transition: 'all 0.2s ease',
            }}
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Content section */}
      <div
        style={{
          padding: 'var(--ds-spacing-4)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Title */}
        <Heading
          level={3}
          data-size="xs"
          style={{ marginBottom: 'var(--ds-spacing-1)' }}
        >
          {title}
        </Heading>

        {/* Subtitle */}
        {subtitle && (
          <Paragraph
            data-size="sm"
            style={{
              marginBottom: 'var(--ds-spacing-2)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {subtitle}
          </Paragraph>
        )}

        {/* Description */}
        {showDescription && description && (
          <Paragraph
            data-size="sm"
            style={{
              marginBottom: 'var(--ds-spacing-3)',
              color: 'var(--ds-color-neutral-text-subtle)',
              display: '-webkit-box',
              WebkitLineClamp: descriptionLines,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </Paragraph>
        )}

        {/* Additional badges (excluding first one shown on image) */}
        {showBadges && visibleBadges.length > 1 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
              gap: 'var(--ds-spacing-2)',
              marginBottom: 'var(--ds-spacing-3)',
              overflow: 'hidden',
            }}
          >
            {visibleBadges.slice(1).map((badge) => (
              <Badge key={badge.id} badge={badge} />
            ))}
            {remainingBadges > 0 && moreBadgesText && (
              <span
                style={{
                  fontSize: 'var(--ds-font-size-xs)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                  alignSelf: 'center',
                  flexShrink: 0,
                }}
              >
                {moreBadgesText}
              </span>
            )}
          </div>
        )}

        {/* Footer with metadata, status, and price */}
        {(showMetadata || showStatus || showPrice) && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'auto',
              paddingTop: 'var(--ds-spacing-3)',
              borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
            }}
          >
            {/* Metadata */}
            {showMetadata && visibleMetadata.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--ds-spacing-3)',
                }}
              >
                {visibleMetadata.map((item) => (
                  <MetadataItemDisplay key={item.id} item={item} />
                ))}
              </div>
            )}

            {/* Status or Price (right side) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-3)',
                marginLeft: 'auto',
              }}
            >
              {showStatus && status && <StatusDisplay status={status} />}
              {showPrice && price && <PriceDisplayComponent price={price} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResourceCard;
