/**
 * Push Notifications Module
 * Exports for notification preferences and push subscriptions
 */

export { PushNotificationsController } from './push-notifications.controller';
export { PushNotificationsService } from './push-notifications.service';
export { PushNotificationsRepository, DEFAULT_NOTIFICATION_MATRIX } from './push-notifications.repository';

export type {
  NotificationMatrix,
  UserPreferencesDTO,
  OrganizationPreferencesDTO,
  UpdateUserPreferencesDTO,
  UpdateOrganizationPreferencesDTO,
  RegisterPushSubscriptionDTO,
  PushSubscriptionDTO,
} from './push-notifications.service';
