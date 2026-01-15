import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Organization } from '@digilist/client-sdk/types';
import { useOrganizations } from '@digilist/client-sdk/hooks';
import { profileService } from '@digilist/client-sdk/services';

/**
 * Account Context Provider
 * Manages user account type (personal vs organization) and selected organization
 *
 * Features:
 * - Persist account selection via API (profile preferences)
 * - Fetch user's organizations from SDK
 * - Provide methods to switch between personal/organization mode
 * - Validate organization selection
 */

// =============================================================================
// Types
// =============================================================================

export type AccountType = 'personal' | 'organization';

/**
 * Dashboard context type for RBAC-based UI filtering
 * Used by Sidebar, ProtectedRoute, and other context-aware components
 */
export type DashboardContext = 'personal' | 'organization';

export interface AccountContextState {
  accountType: AccountType;
  selectedOrganization: Organization | null;
  organizations: Organization[];
  isLoadingOrganizations: boolean;
  hasSelectedAccount: boolean;
  rememberChoice: boolean;
  /** Message shown when user's organization membership was lost (e.g., removed from org) */
  lostOrganizationMessage: string | null;
}

export interface AccountContextValue extends AccountContextState {
  switchToPersonal: () => void;
  switchToOrganization: (organizationId: string) => void;
  getActiveAccount: () => ActiveAccount;
  markAccountAsSelected: () => void;
  setRememberChoice: (value: boolean) => void;
  /** Clear the lost organization message after it has been displayed */
  clearLostOrganizationMessage: () => void;
}

export interface ActiveAccount {
  type: AccountType;
  id: string;
  name: string;
  displayName: string;
}

// =============================================================================
// Context
// =============================================================================

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

// =============================================================================
// Query Keys
// =============================================================================

const QUERY_KEYS = {
  PREFERENCES: ['profile', 'preferences'] as const,
} as const;

// =============================================================================
// Provider Component
// =============================================================================

interface AccountContextProviderProps {
  children: React.ReactNode;
  userId?: string; // Optional user ID for personal account
  userName?: string; // Optional user name for personal account
}

export const AccountContextProvider: React.FC<AccountContextProviderProps> = ({
  children,
  userId = 'current-user',
  userName = 'Bruker',
}) => {
  const queryClient = useQueryClient();

  // Fetch user's preferences from API
  const {
    data: preferencesResponse,
    isLoading: isLoadingPreferences,
  } = useQuery({
    queryKey: QUERY_KEYS.PREFERENCES,
    queryFn: () => profileService.getPreferences(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const preferences = preferencesResponse?.data;

  // Fetch user's organizations from SDK
  const { data: organizationsResponse, isLoading: isLoadingOrganizations } = useOrganizations({
    status: 'active', // Only fetch active organizations
  });

  const organizations = organizationsResponse?.data ?? [];

  // Mutation: Update preferences via API
  const updatePreferencesMutation = useMutation({
    mutationFn: profileService.updatePreferences.bind(profileService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PREFERENCES });
    },
  });

  // Derive state from API preferences (with defaults)
  const accountType: AccountType = preferences?.activeContext ?? 'personal';
  const rememberChoice: boolean = preferences?.rememberAccountChoice ?? false;
  const activeOrgId: string | undefined = preferences?.activeOrganizationId;

  // State: Selected organization (derived from preferences + organizations list)
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

  // State: Has user made initial account selection
  // True if rememberChoice is true from API preferences
  const hasSelectedAccount = rememberChoice;

  // State: Lost organization message (shown when user's org membership was lost)
  const [lostOrganizationMessage, setLostOrganizationMessage] = useState<string | null>(null);

  // =============================================================================
  // Context Validation & Sync
  // =============================================================================

  // Effect: Validate and restore organization context once organizations and preferences are loaded
  useEffect(() => {
    // Wait for both to finish loading
    if (isLoadingOrganizations || isLoadingPreferences) return;

    // If account type is organization, validate the org still exists
    if (accountType === 'organization' && activeOrgId) {
      const org = organizations.find(o => o.id === activeOrgId);
      if (org) {
        setSelectedOrganization(org);
      } else {
        // Organization no longer accessible - force personal mode via API
        setSelectedOrganization(null);
        updatePreferencesMutation.mutate({
          activeContext: 'personal',
          activeOrganizationId: undefined,
        });
        setLostOrganizationMessage(
          'Du har ikke lenger tilgang til den valgte organisasjonen. Du er nå i personlig modus.'
        );
      }
    } else if (accountType === 'personal') {
      setSelectedOrganization(null);
    }
  }, [isLoadingOrganizations, isLoadingPreferences, accountType, activeOrgId, organizations]);

  // Method: Switch to personal account
  const switchToPersonal = useCallback(() => {
    setSelectedOrganization(null);
    updatePreferencesMutation.mutate({
      activeContext: 'personal',
      activeOrganizationId: undefined,
    });
  }, [updatePreferencesMutation]);

  // Method: Switch to organization account
  const switchToOrganization = useCallback((organizationId: string) => {
    const org = organizations.find(o => o.id === organizationId);

    if (!org) {
      console.error(`Organization ${organizationId} not found`);
      return;
    }

    setSelectedOrganization(org);
    updatePreferencesMutation.mutate({
      activeContext: 'organization',
      activeOrganizationId: organizationId,
    });
  }, [organizations, updatePreferencesMutation]);

  // Method: Get active account details
  const getActiveAccount = useCallback((): ActiveAccount => {
    if (accountType === 'organization' && selectedOrganization) {
      return {
        type: 'organization',
        id: selectedOrganization.id,
        name: selectedOrganization.name,
        displayName: selectedOrganization.name,
      };
    }

    return {
      type: 'personal',
      id: userId,
      name: userName,
      displayName: userName,
    };
  }, [accountType, selectedOrganization, userId, userName]);

  // Method: Mark that user has made initial account selection (sets rememberChoice to true)
  const markAccountAsSelected = useCallback(() => {
    updatePreferencesMutation.mutate({
      rememberAccountChoice: true,
    });
  }, [updatePreferencesMutation]);

  // Method: Set remember choice preference
  const handleSetRememberChoice = useCallback((value: boolean) => {
    updatePreferencesMutation.mutate({
      rememberAccountChoice: value,
    });
  }, [updatePreferencesMutation]);

  // Method: Clear the lost organization message after it has been displayed
  const clearLostOrganizationMessage = useCallback(() => {
    setLostOrganizationMessage(null);
  }, []);

  // Combined loading state
  const isLoading = isLoadingOrganizations || isLoadingPreferences;

  // Memoized context value
  const value = useMemo<AccountContextValue>(
    () => ({
      accountType,
      selectedOrganization,
      organizations,
      isLoadingOrganizations: isLoading,
      hasSelectedAccount,
      rememberChoice,
      lostOrganizationMessage,
      switchToPersonal,
      switchToOrganization,
      getActiveAccount,
      markAccountAsSelected,
      setRememberChoice: handleSetRememberChoice,
      clearLostOrganizationMessage,
    }),
    [
      accountType,
      selectedOrganization,
      organizations,
      isLoading,
      hasSelectedAccount,
      rememberChoice,
      lostOrganizationMessage,
      switchToPersonal,
      switchToOrganization,
      getActiveAccount,
      markAccountAsSelected,
      handleSetRememberChoice,
      clearLostOrganizationMessage,
    ]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};

// =============================================================================
// Custom Hook
// =============================================================================

export const useAccountContext = (): AccountContextValue => {
  const context = useContext(AccountContext);

  if (!context) {
    throw new Error('useAccountContext must be used within AccountContextProvider');
  }

  return context;
};
