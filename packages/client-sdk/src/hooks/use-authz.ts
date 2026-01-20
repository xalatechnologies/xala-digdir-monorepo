/**
 * Authorization Hooks
 * React Query hooks for RBAC (Role-Based Access Control) operations
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authzService, type AuthzResource, type AuthzAction } from '@/services/authz.service';

export const authzKeys = {
  all: ['authz'] as const,
  permissions: () => [...authzKeys.all, 'permissions'] as const,
  check: (resource: string, action: string) => [...authzKeys.all, 'check', resource, action] as const,
};

/**
 * Get current user's permissions
 * Returns role, flat permission strings, and resource-action mapping
 * 
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const { data, isLoading } = usePermissions();
 *   
 *   if (isLoading) return <Spinner />;
 *   if (data?.data.role !== 'admin') return <AccessDenied />;
 *   
 *   return <AdminDashboard />;
 * }
 * ```
 */
export function usePermissions(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: authzKeys.permissions(),
    queryFn: () => authzService.getPermissions(),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // Cache permissions for 5 minutes
  });
}

/**
 * Check if user has specific permission
 * 
 * @param resource - Resource to check (e.g., 'bookings', 'rental-objects')
 * @param action - Action to check (e.g., 'create', 'read', 'update')
 * 
 * @example
 * ```tsx
 * function CreateBookingButton() {
 *   const { data } = useCheckPermission('bookings', 'create');
 *   
 *   if (!data?.data.allowed) return null;
 *   
 *   return <Button>Create Booking</Button>;
 * }
 * ```
 */
export function useCheckPermission(
  resource: AuthzResource,
  action: AuthzAction,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: authzKeys.check(resource, action),
    queryFn: () => authzService.checkPermissionSimple(resource, action),
    enabled: (options?.enabled ?? true) && !!resource && !!action,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to check if user can perform action on resource
 * Returns a simple boolean for conditional rendering
 * 
 * @example
 * ```tsx
 * function EditButton({ rentalObjectId }: { rentalObjectId: string }) {
 *   const canEdit = useCan('rental-objects', 'update');
 *   
 *   if (!canEdit) return null;
 *   return <Button onClick={() => edit(rentalObjectId)}>Edit</Button>;
 * }
 * ```
 */
export function useCan(resource: AuthzResource, action: AuthzAction): boolean {
  const { data } = useCheckPermission(resource, action);
  return data?.data.allowed ?? false;
}

/**
 * Hook to get user's role
 * 
 * @example
 * ```tsx
 * function RoleBadge() {
 *   const role = useRole();
 *   return <Badge>{role}</Badge>;
 * }
 * ```
 */
export function useRole(): string | undefined {
  const { data } = useQuery({
    queryKey: [...authzKeys.all, 'role'],
    queryFn: () => authzService.getEffectiveRole(),
    staleTime: 5 * 60 * 1000,
  });
  return data?.data.role;
}

/**
 * Hook to check if user has any of the specified permissions
 * 
 * @example
 * ```tsx
 * function AdminOrManagerContent() {
 *   const hasAccess = useHasAnyPermission(['dashboard:write', 'reports:export']);
 *   if (!hasAccess) return null;
 *   return <SensitiveContent />;
 * }
 * ```
 */
export function useHasAnyPermission(permissions: string[]): boolean {
  const { data } = usePermissions();
  if (!data?.data || !Array.isArray(data.data)) return false;
  const permissionSet = new Set(data.data);
  return permissions.some(p => permissionSet.has(p));
}

/**
 * Hook to check if user has all of the specified permissions
 * 
 * @example
 * ```tsx
 * function SuperAdminPanel() {
 *   const hasAll = useHasAllPermissions(['users:delete', 'settings:write', 'audit:read']);
 *   if (!hasAll) return <AccessDenied />;
 *   return <SuperAdminContent />;
 * }
 * ```
 */
export function useHasAllPermissions(permissions: string[]): boolean {
  const { data } = usePermissions();
  if (!data?.data || !Array.isArray(data.data)) return false;
  const permissionSet = new Set(data.data);
  return permissions.every(p => permissionSet.has(p));
}

/**
 * Hook to invalidate permission cache (e.g., after role change)
 */
export function useInvalidatePermissions(): () => void {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: authzKeys.all });
  };
}
