/**
 * Settings Feature Types
 *
 * Type definitions for the Settings module in MinSide
 */

// =============================================================================
// Settings Section Types
// =============================================================================

export type SettingsSection =
  | 'profile'
  | 'notifications'
  | 'privacy'
  | 'preferences'
  | 'security';

export interface SettingsSectionConfig {
  id: SettingsSection;
  label: string;
  labelNorwegian: string;
  icon?: string;
  order: number;
}

// =============================================================================
// Profile Settings Types
// =============================================================================

export interface ProfileSettings {
  displayName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  language?: string;
  timezone?: string;
}

export type UpdateProfileSettingsDTO = Partial<ProfileSettings>;

// =============================================================================
// Notification Settings Types
// =============================================================================

export interface NotificationSettings {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  bookingReminders?: boolean;
  bookingConfirmations?: boolean;
  systemUpdates?: boolean;
  marketingEmails?: boolean;
}

export type UpdateNotificationSettingsDTO = Partial<NotificationSettings>;

// =============================================================================
// Privacy Settings Types
// =============================================================================

export interface PrivacySettings {
  profileVisibility?: 'public' | 'private' | 'friends';
  showEmail?: boolean;
  showPhone?: boolean;
  allowDataSharing?: boolean;
  allowAnalytics?: boolean;
}

export type UpdatePrivacySettingsDTO = Partial<PrivacySettings>;

// =============================================================================
// Preference Settings Types
// =============================================================================

export interface PreferenceSettings {
  theme?: 'light' | 'dark' | 'auto';
  colorScheme?: string;
  fontSize?: 'sm' | 'md' | 'lg';
  defaultView?: 'list' | 'grid';
  compactMode?: boolean;
}

export type UpdatePreferenceSettingsDTO = Partial<PreferenceSettings>;

// =============================================================================
// Security Settings Types
// =============================================================================

export interface SecuritySettings {
  twoFactorEnabled?: boolean;
  passwordLastChanged?: string;
  activeSessions?: SessionInfo[];
  trustedDevices?: DeviceInfo[];
}

export interface SessionInfo {
  id: string;
  deviceName: string;
  ipAddress: string;
  location?: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface DeviceInfo {
  id: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  addedAt: string;
  lastUsed: string;
}

// =============================================================================
// Validation Types
// =============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface SettingsValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// =============================================================================
// Permission Types
// =============================================================================

export interface SettingsPermissions {
  canViewProfile: boolean;
  canEditProfile: boolean;
  canViewNotifications: boolean;
  canEditNotifications: boolean;
  canViewPrivacy: boolean;
  canEditPrivacy: boolean;
  canViewPreferences: boolean;
  canEditPreferences: boolean;
  canViewSecurity: boolean;
  canEditSecurity: boolean;
}

// =============================================================================
// Settings State Types
// =============================================================================

export interface SettingsState {
  currentSection: SettingsSection;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt?: Date;
  errors: Record<string, string[]>;
}

// =============================================================================
// Constants
// =============================================================================

export const SETTINGS_SECTIONS: SettingsSectionConfig[] = [
  { id: 'profile', label: 'Profile', labelNorwegian: 'Profil', order: 1 },
  { id: 'notifications', label: 'Notifications', labelNorwegian: 'Varsler', order: 2 },
  { id: 'privacy', label: 'Privacy', labelNorwegian: 'Personvern', order: 3 },
  { id: 'preferences', label: 'Preferences', labelNorwegian: 'Preferanser', order: 4 },
  { id: 'security', label: 'Security', labelNorwegian: 'Sikkerhet', order: 5 },
];
