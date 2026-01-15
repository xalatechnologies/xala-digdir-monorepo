/**
 * Notification System Module
 * Complete notification system with templates, channels, and delivery management
 */

// Types
export * from './notification.types';

// Repository
export { NotificationRepository } from './notification.repository';

// Services
export { NotificationService } from './notification.service';
export { NotificationTemplateService } from './notification-template.service';
export { NotificationDispatcher } from './notification.dispatcher';
export type { DispatchPayload, DispatchResult } from './notification.dispatcher';

// Controller
export { NotificationSystemController } from './notification.controller';

// Channel Handlers
export {
  BaseChannelHandler,
  EmailHandler,
  SMSHandler,
  InAppHandler,
  PushHandler,
} from './channels';
