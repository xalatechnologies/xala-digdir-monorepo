/**
 * Admin Blocks
 * Components for administrative and user management features
 */

// Scope Selector
export { ScopeSelector } from './ScopeSelector';
export type {
  ScopeSelectorProps,
  ScopeType,
  ScopeAssignment,
  RentalObject,
  Organization,
} from './ScopeSelector';

// Permission Matrix
export { PermissionMatrix } from './PermissionMatrix';
export type {
  PermissionMatrixProps,
  Permission,
  Role,
} from './PermissionMatrix';

// Effective Permissions View
export { EffectivePermissionsView } from './EffectivePermissionsView';
export type {
  EffectivePermissionsViewProps,
  EffectivePermission,
  PermissionSource,
} from './EffectivePermissionsView';

// User Invite Form
export { UserInviteForm } from './UserInviteForm';
export type {
  UserInviteFormProps,
  InviteUserFormData,
} from './UserInviteForm';
