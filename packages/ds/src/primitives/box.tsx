/**
 * Box - A simple polymorphic wrapper component
 *
 * A minimal building block for layouts. Supports the `as` prop
 * for rendering as any HTML element.
 */
import React, { forwardRef } from 'react';

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  children?: React.ReactNode;
}

export const Box = forwardRef<HTMLDivElement, BoxProps>(function Box(
  { as: Component = 'div', children, ...rest },
  ref
) {
  return (
    <Component ref={ref} {...rest}>
      {children}
    </Component>
  );
});
