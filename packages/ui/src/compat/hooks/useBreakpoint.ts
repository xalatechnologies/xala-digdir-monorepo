/**
 * useBreakpoint Hook
 *
 * Hook for responsive design with predefined breakpoints.
 */

import { useMediaQuery } from './useMediaQuery';

export interface Breakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
}

const BREAKPOINTS = {
  mobile: '(max-width: 639px)',
  tablet: '(min-width: 640px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  largeDesktop: '(min-width: 1280px)',
};

export function useBreakpoint(): Breakpoints {
  const isMobile = useMediaQuery(BREAKPOINTS.mobile);
  const isTablet = useMediaQuery(BREAKPOINTS.tablet);
  const isDesktop = useMediaQuery(BREAKPOINTS.desktop);
  const isLargeDesktop = useMediaQuery(BREAKPOINTS.largeDesktop);

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
  };
}
