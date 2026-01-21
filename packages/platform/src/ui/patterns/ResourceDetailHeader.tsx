/**
 * ResourceDetailHeader
 *
 * A generic header component for resource detail pages.
 * This is a platform-level pattern component with NO domain-specific terms.
 *
 * Features:
 * - Title and subtitle
 * - Breadcrumb navigation
 * - Badges/tags
 * - Primary image
 * - Action buttons
 * - Favorite and share actions
 * - Props-driven configuration
 *
 * @example
 * ```tsx
 * <ResourceDetailHeader
 *   title="Conference Room A"
 *   subtitle="Building 1, Floor 2"
 *   badges={[
 *     { id: '1', text: 'Available', variant: 'success' },
 *     { id: '2', text: 'Premium', variant: 'accent' }
 *   ]}
 *   breadcrumbs={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Resources', href: '/resources' },
 *     { label: 'Conference Room A' }
 *   ]}
 *   primaryImage={{ url: '/room.jpg', alt: 'Conference Room' }}
 *   actions={[
 *     { id: 'book', label: 'Book Now', variant: 'primary', onClick: handleBook }
 *   ]}
 *   isFavorited={false}
 *   onFavoriteToggle={handleFavorite}
 *   onShare={handleShare}
 * />
 * ```
 */
import * as React from 'react';
import { Heading, Paragraph, Tag, Button } from '@digdir/designsystemet-react';
import { cn } from './utils';
import type { ResourceBadge, ActionButton, BreadcrumbItem } from './types';

// Icon components (inline SVG for platform independence)
const HeartIcon = ({ filled = false, size = 20 }: { filled?: boolean; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ShareIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const ChevronRightIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export interface ResourceDetailHeaderProps {
  /** Main title */
  title: string;
  /** Subtitle or secondary description */
  subtitle?: string;
  /** Array of badges to display */
  badges?: ResourceBadge[];
  /** Breadcrumb navigation items */
  breadcrumbs?: BreadcrumbItem[];
  /** Primary image */
  primaryImage?: {
    url: string;
    alt: string;
  };
  /** Action buttons */
  actions?: ActionButton[];
  /** Whether the resource is favorited */
  isFavorited?: boolean;
  /** Custom labels for accessibility and UI */
  labels?: {
    share?: string;
    favorite?: string;
    unfavorite?: string;
  };
  /** Callback when favorite is toggled */
  onFavoriteToggle?: () => void;
  /** Callback when share is clicked */
  onShare?: () => void;
  /** Callback when a breadcrumb is clicked */
  onBreadcrumbClick?: (item: BreadcrumbItem) => void;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Badge variant mapping to design system Tag colors
 */
function getBadgeColor(variant?: ResourceBadge['variant']): 'neutral' | 'first' | 'second' | 'third' {
  switch (variant) {
    case 'accent':
    case 'info':
      return 'first';
    case 'success':
      return 'second';
    case 'warning':
    case 'danger':
      return 'third';
    default:
      return 'neutral';
  }
}

/**
 * Breadcrumb navigation component
 */
function Breadcrumbs({
  items,
  onItemClick,
}: {
  items: BreadcrumbItem[];
  onItemClick?: (item: BreadcrumbItem) => void;
}): React.ReactElement | null {
  if (!items.length) return null;

  return (
    <nav
      className="resource-detail-header__breadcrumbs"
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--ds-spacing-1, 4px)',
        fontSize: 'var(--ds-font-size-sm, 14px)',
        color: 'var(--ds-color-neutral-text-subtle)',
      }}
    >
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--ds-spacing-1, 4px)',
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isClickable = !!item.href || (!!onItemClick && !isLast);

          return (
            <li
              key={`${item.label}-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-1, 4px)',
              }}
            >
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => onItemClick?.(item)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--ds-color-accent-text-default)',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    fontSize: 'inherit',
                  }}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </button>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  style={{
                    color: isLast
                      ? 'var(--ds-color-neutral-text-default)'
                      : 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>
                  <ChevronRightIcon size={14} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Icon button for favorite/share actions
 */
function IconButton({
  onClick,
  label,
  children,
  active = false,
}: {
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
  active?: boolean;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        border: '1px solid var(--ds-color-neutral-border-default)',
        borderRadius: 'var(--ds-border-radius-full, 9999px)',
        backgroundColor: active
          ? 'var(--ds-color-accent-surface-default)'
          : 'var(--ds-color-neutral-background-default)',
        color: active
          ? 'var(--ds-color-accent-base-default)'
          : 'var(--ds-color-neutral-text-subtle)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </button>
  );
}

/**
 * ResourceDetailHeader component
 */
export function ResourceDetailHeader({
  title,
  subtitle,
  badges = [],
  breadcrumbs = [],
  primaryImage,
  actions = [],
  isFavorited = false,
  labels = {},
  onFavoriteToggle,
  onShare,
  onBreadcrumbClick,
  className,
}: ResourceDetailHeaderProps): React.ReactElement {
  const {
    share = 'Share',
    favorite = 'Add to favorites',
    unfavorite = 'Remove from favorites',
  } = labels;

  return (
    <header
      className={cn('resource-detail-header', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-4, 16px)',
      }}
    >
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} onItemClick={onBreadcrumbClick} />
      )}

      {/* Main content wrapper */}
      <div
        className="resource-detail-header__content"
        style={{
          display: 'flex',
          gap: 'var(--ds-spacing-6, 24px)',
          flexWrap: 'wrap',
        }}
      >
        {/* Primary image */}
        {primaryImage && (
          <div
            className="resource-detail-header__image"
            style={{
              flexShrink: 0,
              width: '200px',
              height: '150px',
              borderRadius: 'var(--ds-border-radius-md, 8px)',
              overflow: 'hidden',
              backgroundColor: 'var(--ds-color-neutral-background-subtle)',
            }}
          >
            <img
              src={primaryImage.url}
              alt={primaryImage.alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        {/* Text content */}
        <div
          className="resource-detail-header__text"
          style={{
            flex: 1,
            minWidth: '200px',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-3, 12px)',
          }}
        >
          {/* Top row: Badges + Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 'var(--ds-spacing-2, 8px)',
            }}
          >
            {/* Badges */}
            {badges.length > 0 && (
              <div
                className="resource-detail-header__badges"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--ds-spacing-2, 8px)',
                }}
              >
                {badges.map((badge) => (
                  <Tag key={badge.id} data-size="sm" data-color={getBadgeColor(badge.variant)}>
                    {badge.icon && (
                      <span
                        style={{
                          display: 'inline-flex',
                          marginRight: 'var(--ds-spacing-1, 4px)',
                        }}
                      >
                        {badge.icon}
                      </span>
                    )}
                    {badge.text}
                  </Tag>
                ))}
              </div>
            )}

            {/* Favorite/Share buttons */}
            {(onFavoriteToggle || onShare) && (
              <div
                className="resource-detail-header__quick-actions"
                style={{
                  display: 'flex',
                  gap: 'var(--ds-spacing-2, 8px)',
                }}
              >
                {onFavoriteToggle && (
                  <IconButton
                    onClick={onFavoriteToggle}
                    label={isFavorited ? unfavorite : favorite}
                    active={isFavorited}
                  >
                    <HeartIcon filled={isFavorited} size={18} />
                  </IconButton>
                )}
                {onShare && (
                  <IconButton onClick={onShare} label={share}>
                    <ShareIcon size={18} />
                  </IconButton>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <Heading level={1} data-size="xl" style={{ margin: 0 }}>
            {title}
          </Heading>

          {/* Subtitle */}
          {subtitle && (
            <Paragraph
              data-size="md"
              style={{
                margin: 0,
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {subtitle}
            </Paragraph>
          )}

          {/* Action buttons */}
          {actions.length > 0 && (
            <div
              className="resource-detail-header__actions"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--ds-spacing-3, 12px)',
                marginTop: 'var(--ds-spacing-2, 8px)',
              }}
            >
              {actions.map((action) => (
                <Button
                  key={action.id}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  data-variant={action.variant === 'primary' ? 'primary' : 'secondary'}
                  data-size="md"
                >
                  {action.icon && (
                    <span
                      style={{
                        display: 'inline-flex',
                        marginRight: 'var(--ds-spacing-2, 8px)',
                      }}
                    >
                      {action.icon}
                    </span>
                  )}
                  {action.loading ? 'Loading...' : action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CSS for responsive behavior */}
      <style>{`
        @media (max-width: 640px) {
          .resource-detail-header__content {
            flex-direction: column;
          }

          .resource-detail-header__image {
            width: 100% !important;
            height: 200px !important;
          }
        }
      `}</style>
    </header>
  );
}

export default ResourceDetailHeader;
