/**
 * Settings Feature Types
 * Types specific to the settings module UI
 */

export type SettingsSection =
  | 'general'
  | 'account'
  | 'notifications'
  | 'billing'
  | 'organization'
  | 'security';

export interface SettingsState {
  currentSection: SettingsSection;
  hasUnsavedChanges: boolean;
}
