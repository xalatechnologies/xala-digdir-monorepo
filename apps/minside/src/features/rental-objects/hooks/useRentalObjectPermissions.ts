/**
 * Rental Object Permissions Hook (formerly Listing Permissions Hook)
 * RBAC-aware permission checks for rental object operations
 */

import { useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import type { ListingPermissions } from '../types';
import type { ListingStatus, RentalObjectStatus } from '@digilist/client-sdk';

export interface UseRentalObjectPermissionsReturn {
  permissions: ListingPermissions;
  canPerformAction: (action: keyof ListingPermissions) => boolean;
  canEditRentalObject: (status: RentalObjectStatus | ListingStatus) => boolean;
  canPublishRentalObject: (status: RentalObjectStatus | ListingStatus) => boolean;
  canArchiveRentalObject: (status: RentalObjectStatus | ListingStatus) => boolean;
  canDeleteRentalObject: (status: RentalObjectStatus | ListingStatus) => boolean;
}

// Backward compatibility aliases
export interface UseRentalObjectPermissionsReturn extends UseRentalObjectPermissionsReturn {
  canEditListing: (status: ListingStatus) => boolean;
  canPublishListing: (status: ListingStatus) => boolean;
  canArchiveListing: (status: ListingStatus) => boolean;
  canDeleteListing: (status: ListingStatus) => boolean;
}

export function useRentalObjectPermissions(): UseRentalObjectPermissionsReturn {
  const { isAdmin, user } = useAuth();

  const permissions = useMemo<ListingPermissions>(() => ({
    // All authenticated users can view
    canView: !!user,
    // All authenticated users can create drafts
    canCreate: !!user,
    // All authenticated users can edit (their own drafts, or any if admin)
    canEdit: !!user,
    // Only admins can publish
    canPublish: isAdmin,
    // Only admins can archive
    canArchive: isAdmin,
    // Only admins can delete
    canDelete: isAdmin,
    // All authenticated users can duplicate
    canDuplicate: !!user,
    // Only admins can view audit trail
    canViewAudit: isAdmin,
  }), [isAdmin, user]);

  const canPerformAction = useMemo(() => {
    return (action: keyof ListingPermissions): boolean => permissions[action];
  }, [permissions]);

  /**
   * Check if user can edit a rental object based on its status
   * - Admins can edit any rental object
   * - Saksbehandler can only edit drafts
   */
  const canEditRentalObject = useMemo(() => {
    return (status: RentalObjectStatus | ListingStatus): boolean => {
      if (!user) return false;
      if (isAdmin) return true;
      // Non-admins can only edit drafts
      return status === 'draft';
    };
  }, [isAdmin, user]);

  /**
   * Check if user can publish a rental object
   * - Only admins can publish
   * - Can only publish drafts
   */
  const canPublishRentalObject = useMemo(() => {
    return (status: RentalObjectStatus | ListingStatus): boolean => {
      if (!isAdmin) return false;
      return status === 'draft';
    };
  }, [isAdmin]);

  /**
   * Check if user can archive a rental object
   * - Only admins can archive
   * - Can only archive published rental objects
   */
  const canArchiveRentalObject = useMemo(() => {
    return (status: RentalObjectStatus | ListingStatus): boolean => {
      if (!isAdmin) return false;
      return status === 'published';
    };
  }, [isAdmin]);

  /**
   * Check if user can delete a rental object
   * - Only admins can delete
   * - Can delete any status
   */
  const canDeleteRentalObject = useMemo(() => {
    return (_status: RentalObjectStatus | ListingStatus): boolean => {
      return isAdmin;
    };
  }, [isAdmin]);

  return {
    permissions,
    canPerformAction,
    canEditRentalObject,
    canPublishRentalObject,
    canArchiveRentalObject,
    canDeleteRentalObject,
  };
}

// Backward compatibility export
export function useRentalObjectPermissions(): UseRentalObjectPermissionsReturn {
  const rentalObjectPermissions = useRentalObjectPermissions();
  return {
    ...rentalObjectPermissions,
    canEditListing: rentalObjectPermissions.canEditRentalObject,
    canPublishListing: rentalObjectPermissions.canPublishRentalObject,
    canArchiveListing: rentalObjectPermissions.canArchiveRentalObject,
    canDeleteListing: rentalObjectPermissions.canDeleteRentalObject,
  };
}
