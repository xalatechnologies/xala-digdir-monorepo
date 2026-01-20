/**
 * Account Management Blocks
 * 
 * Reusable components for account switching and selection.
 * These components follow Thin App architecture - they accept props instead of using context directly.
 */

export { AccountSwitcher } from './AccountSwitcher';
export type { AccountSwitcherProps, AccountType, ActiveAccount } from './AccountSwitcher';

export { AccountSelector } from './AccountSelector';
export type { AccountSelectorProps, AccountSelectionType } from './AccountSelector';
