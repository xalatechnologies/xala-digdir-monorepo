/**
 * HeaderLogo Component
 *
 * Logo component for the app header.
 */

import React from 'react';
import { Link } from '@digdir/designsystemet-react';

export interface HeaderLogoProps {
  src?: string;
  alt?: string;
  href?: string;
  children?: React.ReactNode;
}

export function HeaderLogo({
  src,
  alt = 'Logo',
  href = '/',
  children,
}: HeaderLogoProps): React.ReactElement {
  const logoContent = src ? (
    <img
      src={src}
      alt={alt}
      style={{
        height: '32px',
        width: 'auto',
      }}
    />
  ) : children ? (
    <>{children}</>
  ) : (
    <span style={{ fontWeight: 600, fontSize: '1.25rem' }}>Digilist</span>
  );

  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      {logoContent}
    </Link>
  );
}
