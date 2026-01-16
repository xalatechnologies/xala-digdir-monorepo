/**
 * Notification Delivery Reports Page
 * Admin dashboard for monitoring notification delivery status
 */

import { NotificationDeliveryDashboard } from '../features/notification-reports/NotificationDeliveryDashboard';
import { useT } from '@xala/i18n';

export function NotificationDeliveryPage() {
  const t = useT();
  return <NotificationDeliveryDashboard />;
}
