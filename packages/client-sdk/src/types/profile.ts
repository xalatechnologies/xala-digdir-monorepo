/**
 * Profile Types
 * Single Responsibility: User profile and preferences types
 */

export type AccountContextType = 'personal' | 'organization';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface UserNotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export interface UserPreferences {
  language: string;
  notifications: UserNotificationPreferences;
  theme: ThemePreference;
  activeContext: AccountContextType;
  activeOrganizationId?: string;
  rememberAccountChoice: boolean;
}

export interface UserAddress {
  street?: string;
  postalCode?: string;
  city?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  organization?: string;
  role?: string;
  address?: UserAddress;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDTO {
  name?: string;
  phone?: string;
  avatar?: string;
  address?: UserAddress;
}

export interface UpdatePreferencesDTO {
  language?: string;
  notifications?: Partial<UserNotificationPreferences>;
  theme?: ThemePreference;
  activeContext?: AccountContextType;
  activeOrganizationId?: string;
  rememberAccountChoice?: boolean;
}
