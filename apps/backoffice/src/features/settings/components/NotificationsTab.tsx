/**
 * NotificationsTab Wrapper
 * Thin wrapper that wires notification settings hook to DS NotificationsTab props.
 *
 * Uses the same pattern as dashboard/monitoring apps - imports presentational
 * component from platform and wires SDK hooks.
 */
import { NotificationsTab as DSNotificationsTab } from '@xalatechnologies/platform/ui';
import { useNotificationSettings } from '../hooks/useNotificationSettings';

export function NotificationsTab() {
  const {
    notificationData,
    updateField,
    saveNotificationSettings,
    isSaving,
    shouldShowReminderHours,
  } = useNotificationSettings();

  return (
    <DSNotificationsTab
      notificationData={notificationData}
      isSaving={isSaving}
      shouldShowReminderHours={shouldShowReminderHours}
      onFieldChange={updateField}
      onSave={saveNotificationSettings}
    />
  );
}
