import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Generic Multi-Account Provider
 *
 * Platform-agnostic provider for managing user account switching.
 * Domain-specific implementations should extend this with their own account types.
 *
 * Features:
 * - Persist account selection in localStorage
 * - Generic account type system (personal vs entity-based)
 * - Provide methods to switch between accounts
 * - Validate account selection
 * - Configurable storage key prefix for app isolation
 */

// =============================================================================
// Generic Types
// =============================================================================

/**
 * Base account interface that all domain accounts should extend
 */
export interface BaseAccount {
  id: string;
  name: string;
  type: string;
}

/**
 * Account type for personal vs entity-based accounts
 */
export type AccountMode = 'personal' | 'entity';

/**
 * Generic account context state
 */
export interface MultiAccountContextState<T extends BaseAccount = BaseAccount> {
  /** Current account mode (personal or entity) */
  accountMode: AccountMode;
  /** Selected entity account (null if personal mode) */
  selectedAccount: T | null;
  /** Available entity accounts */
  accounts: T[];
  /** Whether accounts are being loaded */
  isLoadingAccounts: boolean;
  /** Whether user has made initial account selection */
  hasSelectedAccount: boolean;
  /** Whether to remember choice preference */
  rememberChoice: boolean;
  /** Message shown when account membership was lost */
  lostAccountMessage: string | null;
}

/**
 * Active account representation
 */
export interface ActiveAccountInfo {
  mode: AccountMode;
  id: string;
  name: string;
  displayName: string;
}

/**
 * Generic account context value
 */
export interface MultiAccountContextValue<T extends BaseAccount = BaseAccount>
  extends MultiAccountContextState<T> {
  /** Switch to personal account mode */
  switchToPersonal: () => void;
  /** Switch to entity account */
  switchToEntity: (accountId: string) => void;
  /** Get active account info */
  getActiveAccount: () => ActiveAccountInfo;
  /** Mark that user has made initial account selection */
  markAccountAsSelected: () => void;
  /** Set remember choice preference */
  setRememberChoice: (value: boolean) => void;
  /** Clear the lost account message */
  clearLostAccountMessage: () => void;
}

// =============================================================================
// Context
// =============================================================================

const MultiAccountContext = createContext<MultiAccountContextValue<BaseAccount> | undefined>(undefined);

// =============================================================================
// Storage Key Factory
// =============================================================================

const createStorageKeys = (prefix: string) => ({
  ACCOUNT_MODE: `${prefix}_account_mode`,
  SELECTED_ACCOUNT_ID: `${prefix}_selected_account`,
  HAS_SELECTED: `${prefix}_has_selected_account`,
  REMEMBER_CHOICE: `${prefix}_remember_choice`,
} as const);

// =============================================================================
// Provider Props
// =============================================================================

export interface MultiAccountProviderProps<T extends BaseAccount = BaseAccount> {
  children: React.ReactNode;
  /** Storage key prefix for localStorage (default: 'app') */
  storageKeyPrefix?: string;
  /** User ID for personal account */
  userId?: string;
  /** User name for personal account */
  userName?: string;
  /** Available accounts (injected from domain layer) */
  accounts?: T[];
  /** Whether accounts are loading (injected from domain layer) */
  isLoadingAccounts?: boolean;
  /** Callback to fetch accounts (alternative to passing accounts directly) */
  fetchAccounts?: () => Promise<T[]>;
  /** Message shown when account access is lost (i18n-ready) */
  lostAccessMessage?: string;
}

// =============================================================================
// Provider Component
// =============================================================================

export function MultiAccountProvider<T extends BaseAccount = BaseAccount>({
  children,
  storageKeyPrefix = 'app',
  userId = 'current-user',
  userName = 'User',
  accounts: injectedAccounts,
  isLoadingAccounts: injectedIsLoading = false,
  fetchAccounts,
  lostAccessMessage = 'You no longer have access to the selected account. Switched to personal mode.',
}: MultiAccountProviderProps<T>) {
  // Create storage keys with the configured prefix
  const STORAGE_KEYS = useMemo(() => createStorageKeys(storageKeyPrefix), [storageKeyPrefix]);

  // State: Accounts from props or fetched
  const [fetchedAccounts, setFetchedAccounts] = useState<T[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  // Use injected accounts or fetched accounts
  const accounts = injectedAccounts ?? fetchedAccounts;
  const isLoadingAccounts = injectedIsLoading || isFetching;

  // Fetch accounts if callback provided
  useEffect(() => {
    if (fetchAccounts && !injectedAccounts) {
      setIsFetching(true);
      fetchAccounts()
        .then(setFetchedAccounts)
        .catch(console.error)
        .finally(() => setIsFetching(false));
    }
  }, [fetchAccounts, injectedAccounts]);

  // State: Account mode (personal or entity)
  const [accountMode, setAccountMode] = useState<AccountMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.ACCOUNT_MODE);
    return (stored === 'entity' || stored === 'personal') ? stored : 'personal';
  });

  // State: Selected account
  const [selectedAccount, setSelectedAccount] = useState<T | null>(null);

  // State: Remember choice preference
  const [rememberChoice, setRememberChoice] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.REMEMBER_CHOICE);
    return stored === 'true';
  });

  // State: Has user made initial account selection
  const [hasSelectedAccount, setHasSelectedAccount] = useState<boolean>(() => {
    const storedRememberChoice = localStorage.getItem(STORAGE_KEYS.REMEMBER_CHOICE) === 'true';
    const stored = localStorage.getItem(STORAGE_KEYS.HAS_SELECTED);

    if (storedRememberChoice) {
      localStorage.setItem(STORAGE_KEYS.HAS_SELECTED, 'true');
      return true;
    }

    if (stored === null) {
      localStorage.setItem(STORAGE_KEYS.HAS_SELECTED, 'true');
      return true;
    }
    return stored === 'true';
  });

  // State: Lost account message
  const [lostAccountMessage, setLostAccountMessage] = useState<string | null>(null);

  // =============================================================================
  // Context Validation
  // =============================================================================

  const validateContext = useCallback((
    storedMode: AccountMode,
    storedAccountId: string | null,
    availableAccounts: T[]
  ): { mode: AccountMode; account: T | null; forcePersonal: boolean } => {
    // Force personal if no accounts available
    if (availableAccounts.length === 0) {
      return {
        mode: 'personal',
        account: null,
        forcePersonal: storedMode === 'entity',
      };
    }

    // Personal mode - no validation needed
    if (storedMode === 'personal') {
      return {
        mode: 'personal',
        account: null,
        forcePersonal: false,
      };
    }

    // Validate entity mode - check if stored account still exists
    if (storedAccountId) {
      const account = availableAccounts.find(a => a.id === storedAccountId);
      if (account) {
        return {
          mode: 'entity',
          account,
          forcePersonal: false,
        };
      }
    }

    // Entity mode but account not found - force personal
    return {
      mode: 'personal',
      account: null,
      forcePersonal: true,
    };
  }, []);

  // Effect: Validate and restore context once accounts are loaded
  useEffect(() => {
    if (isLoadingAccounts) return;

    const storedMode = localStorage.getItem(STORAGE_KEYS.ACCOUNT_MODE) as AccountMode | null;
    const storedAccountId = localStorage.getItem(STORAGE_KEYS.SELECTED_ACCOUNT_ID);
    const currentMode = storedMode === 'entity' ? 'entity' : 'personal';

    const validated = validateContext(currentMode, storedAccountId, accounts);

    if (validated.forcePersonal) {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_ACCOUNT_ID);
      localStorage.setItem(STORAGE_KEYS.ACCOUNT_MODE, 'personal');
      setAccountMode('personal');
      setSelectedAccount(null);
      setLostAccountMessage(lostAccessMessage);
    } else if (validated.mode === 'entity' && validated.account) {
      setAccountMode('entity');
      setSelectedAccount(validated.account);
    } else {
      setAccountMode('personal');
      setSelectedAccount(null);
    }
  }, [isLoadingAccounts, accounts, STORAGE_KEYS, validateContext, lostAccessMessage]);

  // Methods
  const switchToPersonal = useCallback(() => {
    setAccountMode('personal');
    setSelectedAccount(null);
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_MODE, 'personal');
    localStorage.removeItem(STORAGE_KEYS.SELECTED_ACCOUNT_ID);
  }, [STORAGE_KEYS]);

  const switchToEntity = useCallback((accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;

    setAccountMode('entity');
    setSelectedAccount(account);
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_MODE, 'entity');
    localStorage.setItem(STORAGE_KEYS.SELECTED_ACCOUNT_ID, accountId);
  }, [accounts, STORAGE_KEYS]);

  const getActiveAccount = useCallback((): ActiveAccountInfo => {
    if (accountMode === 'entity' && selectedAccount) {
      return {
        mode: 'entity',
        id: selectedAccount.id,
        name: selectedAccount.name,
        displayName: selectedAccount.name,
      };
    }

    return {
      mode: 'personal',
      id: userId,
      name: userName,
      displayName: userName,
    };
  }, [accountMode, selectedAccount, userId, userName]);

  const markAccountAsSelected = useCallback(() => {
    setHasSelectedAccount(true);
    localStorage.setItem(STORAGE_KEYS.HAS_SELECTED, 'true');
  }, [STORAGE_KEYS]);

  const handleSetRememberChoice = useCallback((value: boolean) => {
    setRememberChoice(value);
    localStorage.setItem(STORAGE_KEYS.REMEMBER_CHOICE, String(value));
  }, [STORAGE_KEYS]);

  const clearLostAccountMessage = useCallback(() => {
    setLostAccountMessage(null);
  }, []);

  // Memoized context value
  const value = useMemo<MultiAccountContextValue<T>>(
    () => ({
      accountMode,
      selectedAccount,
      accounts,
      isLoadingAccounts,
      hasSelectedAccount,
      rememberChoice,
      lostAccountMessage,
      switchToPersonal,
      switchToEntity,
      getActiveAccount,
      markAccountAsSelected,
      setRememberChoice: handleSetRememberChoice,
      clearLostAccountMessage,
    }),
    [
      accountMode,
      selectedAccount,
      accounts,
      isLoadingAccounts,
      hasSelectedAccount,
      rememberChoice,
      lostAccountMessage,
      switchToPersonal,
      switchToEntity,
      getActiveAccount,
      markAccountAsSelected,
      handleSetRememberChoice,
      clearLostAccountMessage,
    ]
  );

  return (
    <MultiAccountContext.Provider value={value as MultiAccountContextValue<BaseAccount>}>
      {children}
    </MultiAccountContext.Provider>
  );
}

// =============================================================================
// Custom Hook
// =============================================================================

export function useMultiAccount<T extends BaseAccount = BaseAccount>(): MultiAccountContextValue<T> {
  const context = useContext(MultiAccountContext);

  if (!context) {
    throw new Error('useMultiAccount must be used within MultiAccountProvider');
  }

  return context as MultiAccountContextValue<T>;
}
