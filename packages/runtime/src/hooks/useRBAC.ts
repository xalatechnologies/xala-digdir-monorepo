/**
 * @xala/runtime - useRBAC
 *
 * Capability-based access control hook.
 */

import { useAuth } from '@xala/auth';
import type { RBACContext } from '../types';

/**
 * Access RBAC capabilities.
 *
 * Usage:
 * ```tsx
 * const { hasCapability, isAdmin } = useRBAC();
 * if (!hasCapability('CAP_BOOKING_APPROVE')) return null;
 * ```
 */
export function useRBAC(): RBACContext {
  const { user } = useAuth();

  // Extract role from user
  const effectiveRole = user?.role ?? null;

  // Admin check
  const isAdmin = effectiveRole === 'admin' || effectiveRole === 'super_admin';
  const isCaseHandler = effectiveRole === 'case_handler' || isAdmin;

  // Capability checking (simplified - would connect to CapabilityProvider in full impl)
  const capabilities: string[] = user?.grantedCapabilities ?? [];

  const hasCapability = (cap: string): boolean => {
    if (isAdmin) return true; // Admins have all capabilities
    return capabilities.includes(cap);
  };

  const hasAnyCapability = (caps: string[]): boolean => {
    if (isAdmin) return true;
    return caps.some(cap => capabilities.includes(cap));
  };

  const hasAllCapabilities = (caps: string[]): boolean => {
    if (isAdmin) return true;
    return caps.every(cap => capabilities.includes(cap));
  };

  return {
    hasCapability,
    hasAnyCapability,
    hasAllCapabilities,
    effectiveRole,
    isAdmin,
    isCaseHandler,
  };
}
