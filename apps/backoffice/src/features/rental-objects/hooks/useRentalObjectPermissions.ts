/**
 * useRentalObjectPermissions
 * Hook for checking rental object permissions
 * TODO: Implement full permission logic
 */

export function useRentalObjectPermissions() {
  return {
    permissions: {
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canPublish: true,
    },
  };
}
