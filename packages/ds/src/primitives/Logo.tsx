/**
 * Logo component
 * 
 * Centralized logo for use across all apps.
 * Note: The logo.svg should be copied to each app's public folder,
 * or served from a shared CDN/asset server.
 */

import * as React from 'react';

export interface LogoProps {
  /** Logo source URL (default: /logo.svg) */
  src?: string;
  /** Height in pixels (default: 40) */
  height?: number;
  /** Alt text */
  alt?: string;
  /** Additional class name */
  className?: string;
}

export function Logo({ 
  src = '/logo.svg', 
  height = 40, 
  alt = 'Digilist', 
  className 
}: LogoProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ height: `${height}px`, width: 'auto' }}
    />
  );
}

export default Logo;
