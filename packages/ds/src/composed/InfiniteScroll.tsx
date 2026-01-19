/**
 * InfiniteScroll & VirtualList Components
 *
 * Efficient rendering for large lists with scroll loading.
 * SSR-safe with 'use client' directive.
 *
 * @module @xala/ds/composed/InfiniteScroll
 */

'use client';

import React, { useState, useCallback, useRef, useEffect, type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface InfiniteScrollProps {
  children: ReactNode;
  loadMore: () => Promise<void> | void;
  hasMore: boolean;
  isLoading?: boolean;
  threshold?: number;
  loader?: ReactNode;
  endMessage?: ReactNode;
  errorMessage?: ReactNode;
  error?: boolean;
  onRetry?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function SpinnerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// =============================================================================
// InfiniteScroll Component
// =============================================================================

export function InfiniteScroll({
  children,
  loadMore,
  hasMore,
  isLoading = false,
  threshold = 100,
  loader,
  endMessage,
  errorMessage,
  error = false,
  onRetry,
  className,
  style,
}: InfiniteScrollProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore || error) return;
    setIsLoadingMore(true);
    try {
      await loadMore();
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoading, isLoadingMore, hasMore, error, loadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && hasMore && !isLoading && !isLoadingMore && !error) {
          handleLoadMore();
        }
      },
      { rootMargin: `${threshold}px` }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, error, threshold, handleLoadMore]);

  const defaultLoader = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--ds-spacing-6)',
        color: 'var(--ds-color-accent-text-default)',
      }}
    >
      <SpinnerIcon />
    </div>
  );

  const defaultEndMessage = (
    <div
      style={{
        padding: 'var(--ds-spacing-6)',
        textAlign: 'center',
        fontSize: 'var(--ds-font-size-sm)',
        color: 'var(--ds-color-neutral-text-subtle)',
      }}
    >
      No more items to load
    </div>
  );

  const defaultErrorMessage = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--ds-spacing-3)',
        padding: 'var(--ds-spacing-6)',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-danger-text-default)' }}>
        Failed to load more items
      </span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
            fontSize: 'var(--ds-font-size-sm)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-accent-text-default)',
            backgroundColor: 'var(--ds-color-accent-surface-subtle)',
            borderWidth: 'var(--ds-border-width-default)',
            borderStyle: 'solid',
            borderColor: 'var(--ds-color-accent-border-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      )}
    </div>
  );

  return (
    <div ref={containerRef} className={className} style={style}>
      {children}
      <div ref={sentinelRef} style={{ height: '1px' }} />
      {(isLoading || isLoadingMore) && (loader || defaultLoader)}
      {error && (errorMessage || defaultErrorMessage)}
      {!hasMore && !isLoading && !error && (endMessage || defaultEndMessage)}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// =============================================================================
// VirtualList Component
// =============================================================================

export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 3,
  className,
  style,
}: VirtualListProps<T>): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => setScrollTop(container.scrollTop);
    const handleResize = () => setContainerHeight(container.clientHeight);

    handleResize();
    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);

  const visibleItems: Array<{ item: T; index: number }> = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const item = items[i];
    if (item !== undefined) {
      visibleItems.push({ item, index: i });
    }
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height: '100%',
        overflow: 'auto',
        ...style,
      }}
    >
      <div style={{ position: 'relative', height: totalHeight }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// useInfiniteScroll Hook
// =============================================================================

export function useInfiniteScroll(loadMore: () => Promise<void>, hasMore: boolean): { sentinelRef: React.RefObject<HTMLDivElement>; isLoading: boolean } {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && hasMore && !isLoading) {
          setIsLoading(true);
          try {
            await loadMore();
          } finally {
            setIsLoading(false);
          }
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  return { sentinelRef, isLoading };
}

export default { InfiniteScroll, VirtualList, useInfiniteScroll };
