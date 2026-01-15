import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Organization } from '@digilist/client-sdk/types';
import { useOrganizations } from '@digilist/client-sdk/hooks';

/**
 * Account Context Provider
 * Manages user account type (personal vs organization) and selected organization
 *
 * Features:
 * - Persist account selection in localStorage
 * - Fetch user's organizations from SDK
 * - Provide methods to switch between personal/organization mode
 * - Validate organization selection
 */

// =============================================================================
// Types
// =============================================================================

export type AccountType = 'personal' | 'organization';

export interface AccountContextState {
  accountType: AccountType;
  selectedOrganization: Organization | null;
  organizations: Organization[];
  isLoadingOrganizations: boolean;
  hasSelectedAccount: boolean;
  rememberChoice: boolean;
}

export interface AccountContextValue extends AccountContextState {
  switchToPersonal: () => void;
  switchToOrganization: (organizationId: string) => void;
  getActiveAccount: () => ActiveAccount;
  markAccountAsSelected: () => void;
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
// Local Storage Keys
// =============================================================================

const STORAGE_KEYS = {
  ACCOUNT_TYPE: 'minside_account_type',
  SELECTED_ORG_ID: 'minside_selected_organization',
  HAS_SELECTED: 'minside_has_selected_account',
  REMEMBER_CHOICE: 'minside_remember_choice',
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
  // Fetch user's organizations from SDK
  const { data: organizationsResponse, isLoading: isLoadingOrganizations } = useOrganizations({
    status: 'active', // Only fetch active organizations
  });

  const organizations = organizationsResponse?.data ?? [];

  // State: Account type (personal or organization)
  const [accountType, setAccountType] = useState<AccountType>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.ACCOUNT_TYPE);
    return (stored === 'organization' || stored === 'personal') ? stored : 'personal';
  });

  // State: Selected organization
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(() => {
    const storedOrgId = localStorage.getItem(STORAGE_KEYS.SELECTED_ORG_ID);
    if (!storedOrgId) return null;

    // Will be validated once organizations are loaded
    return null;
  });

  // State: Has user made initial account selection
  // Auto-mark as selected to skip the modal - users can switch via the dropdown
  const [hasSelectedAccount, setHasSelectedAccount] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.HAS_SELECTED);
    if (stored === null) {
      // First time - auto-mark as selected
      localStorage.setItem(STORAGE_KEYS.HAS_SELECTED, 'true');
      return true;
    }
    return stored === 'true';
  });

  // State: Remember choice preference for account selection
  const [rememberChoice, setRememberChoice] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.REMEMBER_CHOICE);
    return stored === 'true';
  });

  // Effect: Restore selected organization from localStorage once organizations are loaded
  useEffect(() => {
    if (isLoadingOrganizations || organizations.length === 0) return;

    const storedOrgId = localStorage.getItem(STORAGE_KEYS.SELECTED_ORG_ID);
    if (!storedOrgId) return;

    // Find the organization in loaded organizations
    const org = organizations.find(o => o.id === storedOrgId);

    if (org) {
      setSelectedOrganization(org);
    } else {
      // Organization not found (user no longer has access)
      // Reset to personal mode
      console.warn(`Organization ${storedOrgId} not found. Resetting to personal mode.`);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_ORG_ID);
      setAccountType('personal');
      setSelectedOrganization(null);
    }
  }, [isLoadingOrganizations, organizations]);

  // Method: Switch to personal account
  const switchToPersonal = () => {
    setAccountType('personal');
    setSelectedOrganization(null);
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_TYPE, 'personal');
    localStorage.removeItem(STORAGE_KEYS.SELECTED_ORG_ID);
  };

  // Method: Switch to organization account
  const switchToOrganization = (organizationId: string) => {
    const org = organizations.find(o => o.id === organizationId);

    if (!org) {
      console.error(`Organization ${organizationId} not found`);
      return;
    }

    setAccountType('organization');
    setSelectedOrganization(org);
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_TYPE, 'organization');
    localStorage.setItem(STORAGE_KEYS.SELECTED_ORG_ID, organizationId);
  };

  // Method: Get active account details
  const getActiveAccount = (): ActiveAccount => {
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
  };

  // Method: Mark that user has made initial account selection
  const markAccountAsSelected = () => {
    setHasSelectedAccount(true);
    localStorage.setItem(STORAGE_KEYS.HAS_SELECTED, 'true');
  };

  // Memoized context value
  const value = useMemo<AccountContextValue>(
    () => ({
      accountType,
      selectedOrganization,
      organizations,
      isLoadingOrganizations,
      hasSelectedAccount,
      rememberChoice,
      switchToPersonal,
      switchToOrganization,
      getActiveAccount,
      markAccountAsSelected,
    }),
    [
      accountType,
      selectedOrganization,
      organizations,
      isLoadingOrganizations,
      hasSelectedAccount,
      rememberChoice,
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
