/**
 * Box - Simple styled div component
 */

import React from 'react';

export function Box({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) {
  return <div {...props}>{children}</div>;
}
