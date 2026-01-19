/**
 * PDFPreview Component
 *
 * A PDF document preview component for invoices, reports, etc.
 * Supports pagination, zoom, download, and print functionality.
 *
 * SSR-safe: Uses 'use client' directive.
 *
 * @module @xala/ds/composed/PDFPreview
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface PDFPreviewProps {
  src: string;
  title?: string;
  width?: string;
  height?: string;
  showToolbar?: boolean;
  showDownload?: boolean;
  showPrint?: boolean;
  showZoom?: boolean;
  showPageNav?: boolean;
  initialZoom?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onDownload?: () => void;
  onPrint?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function PrinterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function ZoomInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function ZoomOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function MaximizeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

// =============================================================================
// PDFPreview Component
// =============================================================================

export function PDFPreview({
  src,
  title = 'Document Preview',
  width = '100%',
  height = 'var(--ds-sizing-120)',
  showToolbar = true,
  showDownload = true,
  showPrint = true,
  showZoom = true,
  showPageNav = true,
  initialZoom = 100,
  onLoad,
  onError,
  onDownload,
  onPrint,
  className,
  style,
}: PDFPreviewProps): React.ReactElement {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [zoom, setZoom] = useState(initialZoom);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.(new Error('Failed to load PDF'));
  }, [onError]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 25, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 25, 50));
  }, []);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload();
    } else {
      const link = document.createElement('a');
      link.href = src;
      link.download = title || 'document.pdf';
      link.click();
    }
  }, [src, title, onDownload]);

  const handlePrint = useCallback(() => {
    if (onPrint) {
      onPrint();
    } else if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  }, [onPrint]);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const pdfUrl = `${src}#toolbar=0&navpanes=0&scrollbar=1&zoom=${zoom}`;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width,
        height: isFullscreen ? '100vh' : height,
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : undefined,
        left: isFullscreen ? 0 : undefined,
        right: isFullscreen ? 0 : undefined,
        bottom: isFullscreen ? 0 : undefined,
        zIndex: isFullscreen ? 9999 : undefined,
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderWidth: isFullscreen ? 0 : 'var(--ds-border-width-default)',
        borderStyle: 'solid',
        borderColor: 'var(--ds-color-neutral-border-subtle)',
        borderRadius: isFullscreen ? 0 : 'var(--ds-border-radius-lg)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {showToolbar && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            borderBottomWidth: 'var(--ds-border-width-default)',
            borderBottomStyle: 'solid',
            borderBottomColor: 'var(--ds-color-neutral-border-subtle)',
          }}
        >
          <span
            style={{
              fontSize: 'var(--ds-font-size-sm)',
              fontWeight: 'var(--ds-font-weight-medium)',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            {title}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
            {showPageNav && totalPages > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--ds-spacing-1)',
                    backgroundColor: 'transparent',
                    borderWidth: '0',
                    borderRadius: 'var(--ds-border-radius-sm)',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    color: 'var(--ds-color-neutral-text-default)',
                  }}
                >
                  <ChevronLeftIcon />
                </button>
                <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--ds-spacing-1)',
                    backgroundColor: 'transparent',
                    borderWidth: '0',
                    borderRadius: 'var(--ds-border-radius-sm)',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    color: 'var(--ds-color-neutral-text-default)',
                  }}
                >
                  <ChevronRightIcon />
                </button>
                <div
                  style={{
                    width: 'var(--ds-border-width-default)',
                    height: 'var(--ds-sizing-5)',
                    backgroundColor: 'var(--ds-color-neutral-border-subtle)',
                    margin: '0 var(--ds-spacing-1)',
                  }}
                />
              </>
            )}

            {showZoom && (
              <>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  aria-label="Zoom out"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--ds-spacing-1)',
                    backgroundColor: 'transparent',
                    borderWidth: '0',
                    borderRadius: 'var(--ds-border-radius-sm)',
                    cursor: zoom <= 50 ? 'not-allowed' : 'pointer',
                    opacity: zoom <= 50 ? 0.5 : 1,
                    color: 'var(--ds-color-neutral-text-default)',
                  }}
                >
                  <ZoomOutIcon />
                </button>
                <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', minWidth: 'var(--ds-sizing-10)', textAlign: 'center' }}>
                  {zoom}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  aria-label="Zoom in"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--ds-spacing-1)',
                    backgroundColor: 'transparent',
                    borderWidth: '0',
                    borderRadius: 'var(--ds-border-radius-sm)',
                    cursor: zoom >= 200 ? 'not-allowed' : 'pointer',
                    opacity: zoom >= 200 ? 0.5 : 1,
                    color: 'var(--ds-color-neutral-text-default)',
                  }}
                >
                  <ZoomInIcon />
                </button>
                <div
                  style={{
                    width: 'var(--ds-border-width-default)',
                    height: 'var(--ds-sizing-5)',
                    backgroundColor: 'var(--ds-color-neutral-border-subtle)',
                    margin: '0 var(--ds-spacing-1)',
                  }}
                />
              </>
            )}

            <button
              type="button"
              onClick={handleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--ds-spacing-1)',
                backgroundColor: 'transparent',
                borderWidth: '0',
                borderRadius: 'var(--ds-border-radius-sm)',
                cursor: 'pointer',
                color: 'var(--ds-color-neutral-text-default)',
              }}
            >
              <MaximizeIcon />
            </button>

            {showPrint && (
              <button
                type="button"
                onClick={handlePrint}
                aria-label="Print"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'var(--ds-spacing-1)',
                  backgroundColor: 'transparent',
                  borderWidth: '0',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  cursor: 'pointer',
                  color: 'var(--ds-color-neutral-text-default)',
                }}
              >
                <PrinterIcon />
              </button>
            )}

            {showDownload && (
              <button
                type="button"
                onClick={handleDownload}
                aria-label="Download"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'var(--ds-spacing-1)',
                  backgroundColor: 'transparent',
                  borderWidth: '0',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  cursor: 'pointer',
                  color: 'var(--ds-color-neutral-text-default)',
                }}
              >
                <DownloadIcon />
              </button>
            )}
          </div>
        </div>
      )}

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
              gap: 'var(--ds-spacing-3)',
            }}
          >
            <div
              style={{
                width: 'var(--ds-sizing-8)',
                height: 'var(--ds-sizing-8)',
                borderWidth: 'var(--ds-border-width-lg)',
                borderStyle: 'solid',
                borderColor: 'var(--ds-color-neutral-border-subtle)',
                borderTopColor: 'var(--ds-color-accent-base-default)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Loading document...
            </span>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {hasError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
              gap: 'var(--ds-spacing-3)',
            }}
          >
            <div style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              <FileTextIcon />
            </div>
            <p style={{ margin: 0, fontSize: 'var(--ds-font-size-md)', fontWeight: 'var(--ds-font-weight-medium)', color: 'var(--ds-color-neutral-text-default)' }}>
              Failed to load document
            </p>
            <p style={{ margin: 0, fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              The document could not be displayed
            </p>
            <button
              type="button"
              onClick={handleDownload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-1)',
                marginTop: 'var(--ds-spacing-2)',
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                color: 'white',
                backgroundColor: 'var(--ds-color-accent-base-default)',
                borderWidth: '0',
                borderRadius: 'var(--ds-border-radius-md)',
                cursor: 'pointer',
              }}
            >
              <DownloadIcon />
              Download instead
            </button>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={pdfUrl}
          title={title}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: hasError ? 'none' : 'block',
          }}
        />
      </div>
    </div>
  );
}

export default PDFPreview;
