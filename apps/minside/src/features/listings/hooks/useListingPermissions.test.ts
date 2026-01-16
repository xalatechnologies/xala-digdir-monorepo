import { renderHook } from '@testing-library/react';
import { useListingPermissions } from './useListingPermissions';
import type { BackofficeUser } from '../../../hooks/useAuth';
import type { ListingStatus } from '@digilist/client-sdk';

// Mock useAuth hook
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../../hooks/useAuth';

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

describe('useListingPermissions', () => {
  const adminUser: BackofficeUser = {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  };

  const saksbehandlerUser: BackofficeUser = {
    id: 'user-1',
    name: 'Regular User',
    email: 'user@example.com',
    role: 'saksbehandler',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('permissions for admin users', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: adminUser,
        isAdmin: true,
        isSaksbehandler: false,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkRole: vi.fn(),
      });
    });

    it('should grant all permissions to admin users', () => {
      const { result } = renderHook(() => useListingPermissions());

      expect(result.current.permissions).toEqual({
        canView: true,
        canCreate: true,
        canEdit: true,
        canPublish: true,
        canArchive: true,
        canDelete: true,
        canDuplicate: true,
        canViewAudit: true,
      });
    });
  });

  describe('permissions for saksbehandler users', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: saksbehandlerUser,
        isAdmin: false,
        isSaksbehandler: true,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkRole: vi.fn(),
      });
    });

    it('should grant limited permissions to saksbehandler users', () => {
      const { result } = renderHook(() => useListingPermissions());

      expect(result.current.permissions).toEqual({
        canView: true,
        canCreate: true,
        canEdit: true,
        canPublish: false,
        canArchive: false,
        canDelete: false,
        canDuplicate: true,
        canViewAudit: false,
      });
    });
  });

  describe('permissions for unauthenticated users', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAdmin: false,
        isSaksbehandler: false,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkRole: vi.fn(),
      });
    });

    it('should deny all permissions to unauthenticated users', () => {
      const { result } = renderHook(() => useListingPermissions());

      expect(result.current.permissions).toEqual({
        canView: false,
        canCreate: false,
        canEdit: false,
        canPublish: false,
        canArchive: false,
        canDelete: false,
        canDuplicate: false,
        canViewAudit: false,
      });
    });
  });

  describe('canPerformAction', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: adminUser,
        isAdmin: true,
        isSaksbehandler: false,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkRole: vi.fn(),
      });
    });

    it('should return true for actions admin can perform', () => {
      const { result } = renderHook(() => useListingPermissions());

      expect(result.current.canPerformAction('canView')).toBe(true);
      expect(result.current.canPerformAction('canPublish')).toBe(true);
      expect(result.current.canPerformAction('canDelete')).toBe(true);
    });

    it('should return false for actions saksbehandler cannot perform', () => {
      mockUseAuth.mockReturnValue({
        user: saksbehandlerUser,
        isAdmin: false,
        isSaksbehandler: true,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkRole: vi.fn(),
      });

      const { result } = renderHook(() => useListingPermissions());

      expect(result.current.canPerformAction('canPublish')).toBe(false);
      expect(result.current.canPerformAction('canArchive')).toBe(false);
      expect(result.current.canPerformAction('canDelete')).toBe(false);
    });
  });

  describe('canEditListing', () => {
    it('should allow admin to edit any listing status', () => {
      mockUseAuth.mockReturnValue({
        user: adminUser,
        isAdmin: true,
        isSaksbehandler: false,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkRole: vi.fn(),
      });

      const { result } = renderHook(() => useListingPermissions());

      expect(result.current.canEditListing('draft' as ListingStatus)).toBe(true);
      expect(result.current.canEditListing('published' as ListingStatus)).toBe(true);
      expect(result.current.canEditListing('archived' as ListingStatus)).toBe(true);
    });

    it('should allow saksbehandler to edit only draft listings', () => {
      mockUseAuth.mockReturnValue({
        user: saksbehandlerUser,
        isAdmin: false,
        isSaksbehandler: true,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkRole: vi.fn(),
      });

      const { result } = renderHook(() => useListingPermissions());

      expect(result.current.canEditListing('draft' as ListingStatus)).toBe(true);
      expect(result.current.canEditListing('published' as ListingStatus)).toBe(false);
      expect(result.current.canEditListing('archived' as ListingStatus)).toBe(false);
    });

    it('should deny editing to unauthenticated users', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAdmin: false,
        isSaksbehandler: false,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkRole: vi.fn(),
      });

      const { result } = renderHook(() => useListingPermissions());

      expect(result.current.canEditListing('draft' as ListingStatus)).toBe(false);
      expect(result.current.canEditListing('published' as ListingStatus)).toBe(false);
    });
  });

  describe('canPublishListing', () => {
    it('should allow admin to publish draft listings', () => {
      mockUseAuth.mockReturnValue({
        user: adminUser,
        isAdmin: true,
        isSaksbehandler: false,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkRole: vi.fn(),
      });

      const { result } = renderHook(() => useListingPermissions());

      expect(result.current.canPublishListing('draft' as ListingStatus)).toBe(true);
    });

    it('should not allow admin to publish already published listings', () => {
      mockUseAuth.mockReturnValue({
        user: adminUser,
        isAdmin: true,
        isSaksbehandler: false,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkRole: vi.fn(),
      });

      const { result } = renderHook(() => useListingPermissions());

      expect(result.current.canPublishListing('published' as ListingStatus)).toBe(false);
      expect(result.current.canPublishListing('archived' as ListingStatus)).toBe(false);
    });

    it('should deny publishing to saksbehandler users', () => {
      mockUseAuth.mockReturnValue({
        user: saksbehandlerUser,
        isAdmin: false,
        isSaksbehandler: true,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkRole: vi.fn(),
      });

      const { result } = renderHook(() => useListingPermissions());

      expect(result.current.canPublishListing('draft' as ListingStatus)).toBe(false);
    });

    it('should deny publishing to unauthenticated users', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAdmin: false,
        isSaksbehandler: false,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkRole: vi.fn(),
      });

      const { result } = renderHook(() => useListingPermissions());

      expect(result.current.canPublishListing('draft' as ListingStatus)).toBe(false);
    });
  });

  describe('canArchiveListing', () => {
    it('should allow admin to archive published listings', () => {
      mockUseAuth.mockReturnValue({
        user: adminUser,
        isAdmin: true,
        isSaksbehandler: false,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkRole: vi.fn(),
      });

      const { result } = renderHook(() => useListingPermissions());

      expect(result.current.canArchiveListing('published' as ListingStatus)).toBe(true);
    });

    it('should not allow admin to archive non-published listings', () => {
      mockUseAuth.mockReturnValue({
        user: adminUser,
        isAdmin: true,
        isSaksbehandler: false,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkRole: vi.fn(),
      });

      const { result } = renderHook(() => useListingPermissions());

      expect(result.current.canArchiveListing('draft' as ListingStatus)).toBe(false);
      expect(result.current.canArchiveListing('archived' as ListingStatus)).toBe(false);
    });

    it('should deny archiving to saksbehandler users', () => {
      mockUseAuth.mockReturnValue({
        user: saksbehandlerUser,
        isAdmin: false,
        isSaksbehandler: true,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkRole: vi.fn(),
      });

      const { result } = renderHook(() => useListingPermissions());

      expect(result.current.canArchiveListing('published' as ListingStatus)).toBe(false);
    });

    it('should deny archiving to unauthenticated users', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAdmin: false,
        isSaksbehandler: false,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkRole: vi.fn(),
      });

      const { result } = renderHook(() => useListingPermissions());

      expect(result.current.canArchiveListing('published' as ListingStatus)).toBe(false);
    });
  });

  describe('canDeleteListing', () => {
    it('should allow admin to delete listings with any status', () => {
      mockUseAuth.mockReturnValue({
        user: adminUser,
        isAdmin: true,
        isSaksbehandler: false,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkRole: vi.fn(),
      });

      const { result } = renderHook(() => useListingPermissions());

      expect(result.current.canDeleteListing('draft' as ListingStatus)).toBe(true);
      expect(result.current.canDeleteListing('published' as ListingStatus)).toBe(true);
      expect(result.current.canDeleteListing('archived' as ListingStatus)).toBe(true);
    });

    it('should deny deletion to saksbehandler users', () => {
      mockUseAuth.mockReturnValue({
        user: saksbehandlerUser,
        isAdmin: false,
        isSaksbehandler: true,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkRole: vi.fn(),
      });

      const { result } = renderHook(() => useListingPermissions());

      expect(result.current.canDeleteListing('draft' as ListingStatus)).toBe(false);
      expect(result.current.canDeleteListing('published' as ListingStatus)).toBe(false);
    });

    it('should deny deletion to unauthenticated users', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAdmin: false,
        isSaksbehandler: false,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        checkRole: vi.fn(),
      });

      const { result } = renderHook(() => useListingPermissions());

      expect(result.current.canDeleteListing('draft' as ListingStatus)).toBe(false);
    });
  });
});
