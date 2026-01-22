/**
 * LoadingFallback - Loading state component
 */

import React from 'react';
import { Spinner, Paragraph } from '@digdir/designsystemet-react';

export interface LoadingFallbackProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  className?: string;
}

export function LoadingFallback({
  message = 'Laster...',
  size = 'md',
  fullScreen = false,
  className,
}: LoadingFallbackProps) {
  const content = (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--ds-spacing-4)',
        padding: 'var(--ds-spacing-8)',
        ...(fullScreen
          ? {
              position: 'fixed',
              inset: 0,
              backgroundColor: 'var(--ds-color-neutral-background-default)',
              zIndex: 9999,
            }
          : {}),
      }}
    >
      <Spinner title={message} size={size} />
      {message && (
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {message}
        </Paragraph>
      )}
    </div>
  );

  return content;
}
