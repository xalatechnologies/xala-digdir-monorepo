import React from 'react';
import {
  MultiAccountProvider,
  useMultiAccount,
  type BaseAccount,
  type ActiveAccountInfo,
} from './MultiAccountProvider';
import {
  useRuntimeServicesOptional,
  useInjectedOrganizations,
} from './RuntimeServiceProvider';
import type { OrganizationDTO, OrganizationsFilter } from '../contracts';

/**
 * Account Context Provider (Backward Compatible)
 *
 * This provider maintains backward compatibility with the Digilist-specific
 * AccountContextProvider while using the generic MultiAccountProvider underneath.
 *
 * For new platform-agnostic code, use MultiAccountProvider directly.
 * For domain-specific code, inject services via RuntimeServiceProvider.
 *
 * Features:
 * - Persist account selection in localStorage
 * - Fetch user's organizations via injected service or legacy SDK
 * - Provide methods to switch between personal/organization mode
 * - Validate organization selection
 * - Configurable storage key prefix for app isolation
 *
 * Migration Path:
 * 1. OLD: AccountContextProvider lazy-loads @digilist/client-sdk
 * 2. NEW: Wrap with RuntimeServiceProvider and inject useOrganizations hook
 * 3. FUTURE: Use MultiAccountProvider directly for platform-agnostic code
 */

// =============================================================================
// Re-export Types (Backward Compatibility)
// =============================================================================

export type AccountType = 'personal' | 'organization';
export type DashboardContext = 'personal' | 'organization';

export interface Organization extends BaseAccount {
  type: 'organization';
}

export interface AccountContextState {
  accountType: AccountType;
  selectedOrganization: Organization | null;
  organizations: Organization[];
  isLoadingOrganizations: boolean;
  hasSelectedAccount: boolean;
  rememberChoice: boolean;
  lostOrganizationMessage: string | null;
}

export interface AccountContextValue extends AccountContextState {
  switchToPersonal: () => void;
  switchToOrganization: (organizationId: string) => void;
  getActiveAccount: () => ActiveAccount;
  markAccountAsSelected: () => void;
  setRememberChoice: (value: boolean) => void;
  clearLostOrganizationMessage: () => void;
}

export interface ActiveAccount {
  type: AccountType;
  id: string;
  name: string;
  displayName: string;
}

// =============================================================================
// Internal Bridge Component (Uses Injected Services)
// =============================================================================

interface AccountBridgeProps {
  children: React.ReactNode;
  storageKeyPrefix: string;
  userId: string;
  userName: string;
}

function AccountBridge({ children, storageKeyPrefix, userId, userName }: AccountBridgeProps) {
  const servicesContext = useRuntimeServicesOptional();

  // If RuntimeServiceProvider is available and has organizations service, use it
  if (servicesContext?.hasOrganizationsService) {
    return (
      <InjectedOrganizationsBridge
        storageKeyPrefix={storageKeyPrefix}
        userId={userId}
        userName={userName}
      >
        {children}
      </InjectedOrganizationsBridge>
    );
  }

  // No services available - render with empty organizations
  // This supports scenarios where multi-account is not needed
  return (
    <MultiAccountProvider
      storageKeyPrefix={storageKeyPrefix}
      userId={userId}
      userName={userName}
      accounts={[]}
      isLoadingAccounts={false}
      lostAccessMessage="Du har ikke lenger tilgang til den valgte organisasjonen. Du er nå i personlig modus."
    >
      {children}
    </MultiAccountProvider>
  );
}

// =============================================================================
// Bridge Component Using Injected Organizations Hook
// =============================================================================

interface InjectedOrganizationsBridgeProps {
  children: React.ReactNode;
  storageKeyPrefix: string;
  userId: string;
  userName: string;
}

function InjectedOrganizationsBridge({
  children,
  storageKeyPrefix,
  userId,
  userName,
}: InjectedOrganizationsBridgeProps) {
  const filter: OrganizationsFilter = { status: 'active' };
  const { data, isLoading } = useInjectedOrganizations(filter);

  // Convert OrganizationDTO to Organization type
  const organizations: Organization[] = (data?.data ?? []).map(
    (org: OrganizationDTO): Organization => ({
      id: org.id,
      name: org.name,
      type: 'organization',
    })
  );

  return (
    <MultiAccountProvider
      storageKeyPrefix={storageKeyPrefix}
      userId={userId}
      userName={userName}
      accounts={organizations}
      isLoadingAccounts={isLoading}
      lostAccessMessage="Du har ikke lenger tilgang til den valgte organisasjonen. Du er nå i personlig modus."
    >
      {children}
    </MultiAccountProvider>
  );
}

// =============================================================================
// Provider Component (Backward Compatible)
// =============================================================================

export interface AccountContextProviderProps {
  children: React.ReactNode;
  storageKeyPrefix?: string;
  userId?: string;
  userName?: string;
}

/**
 * AccountContextProvider - Multi-account context for organization switching
 *
 * Usage (with injected services):
 * ```tsx
 * import { RuntimeServiceProvider, AccountContextProvider } from '@xala/runtime';
 * import { useOrganizations } from '@digilist/client-sdk/hooks';
 *
 * function App() {
 *   return (
 *     <RuntimeServiceProvider
 *       config={{
 *         services: {
 *           useOrganizations: (filter) => {
 *             const result = useOrganizations({ status: filter?.status });
 *             return { data: result.data, isLoading: result.isLoading, error: result.error };
 *           },
 *         },
 *       }}
 *     >
 *       <AccountContextProvider storageKeyPrefix="myapp" userId={user.id} userName={user.name}>
 *         <YourApp />
 *       </AccountContextProvider>
 *     </RuntimeServiceProvider>
 *   );
 * }
 * ```
 *
 * Usage (without services - personal mode only):
 * ```tsx
 * <AccountContextProvider>
 *   <YourApp />
 * </AccountContextProvider>
 * ```
 */
export const AccountContextProvider: React.FC<AccountContextProviderProps> = ({
  children,
  storageKeyPrefix = 'app',
  userId = 'current-user',
  userName = 'Bruker',
}) => {
  return (
    <AccountBridge
      storageKeyPrefix={storageKeyPrefix}
      userId={userId}
      userName={userName}
    >
      {children}
    </AccountBridge>
  );
};

// =============================================================================
// Custom Hook (Backward Compatible)
// =============================================================================

/**
 * Adapter hook that converts MultiAccountContextValue to AccountContextValue
 */
export const useAccountContext = (): AccountContextValue => {
  const multi = useMultiAccount<Organization>();

  // Convert mode to type
  const accountType: AccountType =
    multi.accountMode === 'entity' ? 'organization' : 'personal';

  // Convert to legacy format
  return {
    accountType,
    selectedOrganization: multi.selectedAccount,
    organizations: multi.accounts,
    isLoadingOrganizations: multi.isLoadingAccounts,
    hasSelectedAccount: multi.hasSelectedAccount,
    rememberChoice: multi.rememberChoice,
    lostOrganizationMessage: multi.lostAccountMessage,
    switchToPersonal: multi.switchToPersonal,
    switchToOrganization: multi.switchToEntity,
    getActiveAccount: () => {
      const active = multi.getActiveAccount();
      return {
        type: active.mode === 'entity' ? 'organization' : 'personal',
        id: active.id,
        name: active.name,
        displayName: active.displayName,
      };
    },
    markAccountAsSelected: multi.markAccountAsSelected,
    setRememberChoice: multi.setRememberChoice,
    clearLostOrganizationMessage: multi.clearLostAccountMessage,
  };
};
