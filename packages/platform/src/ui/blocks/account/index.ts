/**
 * Account Management Blocks
 *
 * Reusable components for account switching and selection.
 * These components follow Thin App architecture - they accept props instead of using context directly.
 * All components are domain-agnostic and use generic interfaces for organization data.
 */

export { AccountSwitcher } from './AccountSwitcher';
export type {
  AccountSwitcherProps,
  AccountType,
  ActiveAccount,
  AccountSwitcherLabels,
  BaseOrganization,
} from './AccountSwitcher';

export { AccountSelector } from './AccountSelector';
export type {
  AccountSelectorProps,
  AccountSelectionType,
  AccountSelectorLabels,
} from './AccountSelector';

export { AccountSelectionModal } from './AccountSelectionModal';
export type {
  AccountSelectionModalProps,
  AccountSelectionModalLabels,
} from './AccountSelectionModal';
