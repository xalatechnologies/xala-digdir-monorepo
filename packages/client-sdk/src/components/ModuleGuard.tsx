/**
 * ModuleGuard Component
 * Conditionally renders children based on module/capability availability
 *
 * @example
 * ```tsx
 * // Guard by module
 * <ModuleGuard module="RATINGS" fallback={<UpgradePrompt />}>
 *   <RatingsManager />
 * </ModuleGuard>
 *
 * // Guard by capability
 * <ModuleGuard capability="messaging" fallback={null}>
 *   <MessagingButton />
 * </ModuleGuard>
 * ```
 */

import React from 'react';
import { useIsModuleEnabled, useHasCapability } from '@digilist/client-sdk';

export interface ModuleGuardProps {
  /** Module key to check (e.g., 'RATINGS') */
  module?: string;
  /** Capability to check (e.g., 'ratings', 'messaging') */
  capability?: string;
  /** Content to show if module/capability is disabled */
  fallback?: React.ReactNode;
  /** Children to render if module/capability is enabled */
  children: React.ReactNode;
}

/**
 * ModuleGuard - Conditional rendering based on module state
 */
export function ModuleGuard({ module, capability, fallback = null, children }: ModuleGuardProps) {
  const isModuleEnabled = useIsModuleEnabled(module || '');
  const hasCapability = useHasCapability(capability || '');

  // If module is specified, check it
  if (module) {
    if (!isModuleEnabled) {
      return <>{fallback}</>;
    }
  }

  // If capability is specified, check it
  if (capability) {
    if (!hasCapability) {
      return <>{fallback}</>;
    }
  }

  // All checks passed
  return <>{children}</>;
}

/**
 * withModuleGuard HOC
 * Wraps a component with module gating
 *
 * @example
 * ```tsx
 * const ProtectedRatings = withModuleGuard('RATINGS', <UpgradePrompt />)(RatingsManager);
 * ```
 */
export function withModuleGuard<P extends object>(
  module: string,
  fallback: React.ReactNode = null
) {
  return (Component: React.ComponentType<P>) => {
    const WrappedComponent = (props: P) => (
      <ModuleGuard module={module} fallback={fallback}>
        <Component {...props} />
      </ModuleGuard>
    );
    WrappedComponent.displayName = `withModuleGuard(${Component.displayName || Component.name})`;
    return WrappedComponent;
  };
}

export default ModuleGuard;
