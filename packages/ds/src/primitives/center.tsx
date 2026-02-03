/**
 * Center Primitive
 *
 * Centers content horizontally and/or vertically within its container.
 * Uses design tokens only.
 */

import React, { forwardRef } from 'react';
import { cn } from '../utils';

export interface CenterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Axis to center on
   * @default 'both'
   */
  axis?: 'horizontal' | 'vertical' | 'both';

  /**
   * Whether to fill the parent container
   * @default true
   */
  fill?: boolean;

  /**
   * Text alignment for content
   * @default 'center'
   */
  textAlign?: 'left' | 'center' | 'right';

  children: React.ReactNode;
}

export const Center = forwardRef<HTMLDivElement, CenterProps>(
  (
    { axis = 'both', fill = true, textAlign = 'center', children, className, style, ...props },
    ref
  ) => {
    const getJustify = () => {
      if (axis === 'horizontal' || axis === 'both') return 'center';
      return 'flex-start';
    };

    const getAlign = () => {
      if (axis === 'vertical' || axis === 'both') return 'center';
      return 'flex-start';
    };

    return (
      <div
        ref={ref}
        className={cn('ds-center', className)}
        style={{
          display: 'flex',
          justifyContent: getJustify(),
          alignItems: getAlign(),
          height: fill ? '100%' : undefined,
          width: fill ? '100%' : undefined,
          textAlign,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Center.displayName = 'Center';

export default Center;
