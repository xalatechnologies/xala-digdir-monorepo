/**
 * Notification Service
 * Push notifications, email triggers, and in-app notifications
 */
import { getClient } from '../core/client-factory';

export interface Notification {
  id: string;
  userId: string;
  type: 'email' | 'push' | 'in_app' | 'sms';
  title: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, unknown>;
  readAt?: string | null;
  sentAt?: string | null;
  createdAt: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'push' | 'in_app' | 'sms';
  subject?: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

export interface SendNotificationDTO {
  userId: string;
  type: 'email' | 'push' | 'in_app' | 'sms';
  templateId?: string;
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, unknown>;
}

export interface SendEmailDTO {
  to: string | string[];
  subject: string;
  body: string;
  templateId?: string;
  variables?: Record<string, unknown>;
  attachments?: string[];
}

export interface NotificationQueryParams {
  type?: string;
  status?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface DeliveryReportQueryParams {
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface DeliveryStatus {
  notificationId: string;
  channel: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  attempts: number;
  lastAttemptAt?: string;
  deliveredAt?: string;
  error?: string;
}

export interface DeliveryReport {
  id: string;
  notificationId: string;
  channel: string;
  status: string;
  recipient: string;
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class NotificationService {
  private basePath = '/api/notifications';

  /**
   * Get all notifications with optional filtering
   * Returns paginated list of notifications with filtering by type, status, and user
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to paginated notification list
   *
   * @example
   * ```typescript
   * // Get all unread notifications
   * const { data, meta } = await notificationService.getAll({
   *   status: 'delivered',
   *   page: 1,
   *   limit: 20
   * });
   *
   * // Get all email notifications for a specific user
   * const { data } = await notificationService.getAll({
   *   type: 'email',
   *   userId: 'user-123'
   * });
   * ```
   */
  async getAll(params: NotificationQueryParams = {}): Promise<PaginatedResponse<Notification>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });
    
    const url = queryParams.toString() 
      ? `${this.basePath}?${queryParams.toString()}`
      : this.basePath;
    
    return getClient().get<PaginatedResponse<Notification>>(url);
  }

  /**
   * Get current user's notifications
   * Convenience method to fetch notifications for the authenticated user
   *
   * @param params - Query parameters for filtering and pagination (excludes userId)
   * @returns Promise resolving to paginated notification list for current user
   *
   * @example
   * ```typescript
   * // Get my unread in-app notifications
   * const { data } = await notificationService.getMyNotifications({
   *   type: 'in_app',
   *   status: 'delivered'
   * });
   *
   * // Get my notifications with pagination
   * const { data, meta } = await notificationService.getMyNotifications({
   *   page: 1,
   *   limit: 10
   * });
   * ```
   */
  async getMyNotifications(params: Omit<NotificationQueryParams, 'userId'> = {}): Promise<PaginatedResponse<Notification>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });
    
    const url = queryParams.toString() 
      ? `${this.basePath}/my?${queryParams.toString()}`
      : `${this.basePath}/my`;
    
    return getClient().get<PaginatedResponse<Notification>>(url);
  }

  /**
   * Send a notification to a user
   * Creates and sends a notification via the specified channel (email, push, in-app, or SMS)
   *
   * @param data - Notification data including recipient, type, and message
   * @returns Promise resolving to the created notification
   *
   * @example
   * ```typescript
   * // Send a high-priority push notification
   * const { data } = await notificationService.send({
   *   userId: 'user-123',
   *   type: 'push',
   *   title: 'Booking Confirmed',
   *   message: 'Your booking for Conference Room A has been confirmed',
   *   priority: 'high',
   *   metadata: { bookingId: 'booking-456' }
   * });
   *
   * // Send an in-app notification using a template
   * await notificationService.send({
   *   userId: 'user-123',
   *   type: 'in_app',
   *   templateId: 'booking-reminder',
   *   title: 'Upcoming Booking',
   *   message: 'Your booking starts in 1 hour'
   * });
   * ```
   */
  async send(data: SendNotificationDTO): Promise<{ data: Notification }> {
    return getClient().post<{ data: Notification }>(this.basePath, data);
  }

  /**
   * Send an email notification
   * Sends email via configured email provider with optional template and attachments
   *
   * @param data - Email data including recipient, subject, body, and optional template
   * @returns Promise resolving to success status and message ID
   *
   * @example
   * ```typescript
   * // Send a simple email
   * const result = await notificationService.sendEmail({
   *   to: 'user@example.com',
   *   subject: 'Booking Confirmation',
   *   body: 'Your booking has been confirmed for tomorrow at 10:00 AM'
   * });
   *
   * // Send email with template and variables
   * await notificationService.sendEmail({
   *   to: ['user1@example.com', 'user2@example.com'],
   *   subject: 'Monthly Report',
   *   body: '',
   *   templateId: 'monthly-report',
   *   variables: { month: 'January', year: '2024' },
   *   attachments: ['report.pdf']
   * });
   * ```
   */
  async sendEmail(data: SendEmailDTO): Promise<{ success: boolean; messageId?: string }> {
    return getClient().post<{ success: boolean; messageId?: string }>(`${this.basePath}/email`, data);
  }

  /**
   * Mark a notification as read
   * Updates the notification status and sets readAt timestamp
   *
   * @param id - The notification ID to mark as read
   * @returns Promise resolving to the updated notification
   *
   * @example
   * ```typescript
   * // Mark a notification as read when user clicks on it
   * const { data } = await notificationService.markAsRead('notification-123');
   * console.log('Marked as read at:', data.readAt);
   * ```
   */
  async markAsRead(id: string): Promise<{ data: Notification }> {
    return getClient().put<{ data: Notification }>(`${this.basePath}/${id}/read`);
  }

  /**
   * Mark all user's notifications as read
   * Bulk operation to mark all unread notifications as read for the current user
   *
   * @returns Promise resolving to success status and count of marked notifications
   *
   * @example
   * ```typescript
   * // Mark all notifications as read (e.g., "Clear All" button)
   * const result = await notificationService.markAllAsRead();
   * console.log(`Marked ${result.count} notifications as read`);
   * ```
   */
  async markAllAsRead(): Promise<{ success: boolean; count: number }> {
    return getClient().put<{ success: boolean; count: number }>(`${this.basePath}/read-all`);
  }

  /**
   * Get unread notification count for current user
   * Returns the total number of unread notifications, useful for badge display
   *
   * @returns Promise resolving to object containing unread count
   *
   * @example
   * ```typescript
   * // Display unread count in notification badge
   * const { data } = await notificationService.getUnreadCount();
   * setBadgeCount(data.count);
   * ```
   */
  async getUnreadCount(): Promise<{ data: { count: number } }> {
    return getClient().get<{ data: { count: number } }>(`${this.basePath}/unread-count`);
  }

  /**
   * Get all available notification templates
   * Returns templates for emails, push notifications, in-app messages, and SMS
   *
   * @returns Promise resolving to array of notification templates
   *
   * @example
   * ```typescript
   * // Get available templates for notification composer
   * const { data } = await notificationService.getTemplates();
   * const activeTemplates = data.filter(t => t.isActive);
   * const emailTemplates = activeTemplates.filter(t => t.type === 'email');
   * ```
   */
  async getTemplates(): Promise<{ data: NotificationTemplate[] }> {
    return getClient().get<{ data: NotificationTemplate[] }>(`${this.basePath}/templates`);
  }

  /**
   * Delete a notification
   * Permanently removes a notification from the user's notification list
   *
   * @param id - The notification ID to delete
   * @returns Promise resolving to success status
   *
   * @example
   * ```typescript
   * // Delete a notification when user dismisses it
   * await notificationService.delete('notification-123');
   * ```
   */
  async deleteById(id: string): Promise<{ success: boolean }> {
    return getClient().delete<{ success: boolean }>(`${this.basePath}/${id}`);
  }

  /**
   * Get delivery status for a notification
   */
  async getDeliveryStatus(id: string): Promise<{ data: DeliveryStatus }> {
    return getClient().get<{ data: DeliveryStatus }>(`${this.basePath}/${id}/delivery-status`);
  }

  /**
   * Get delivery reports with filtering
   */
  async getDeliveryReports(params?: DeliveryReportQueryParams): Promise<PaginatedResponse<DeliveryReport>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.set(key, String(value));
      });
    }

    const url = queryParams.toString()
      ? `${this.basePath}/delivery-reports?${queryParams.toString()}`
      : `${this.basePath}/delivery-reports`;

    return getClient().get<PaginatedResponse<DeliveryReport>>(url);
  }

  /**
   * Retry failed notification delivery
   */
  async retryFailed(id: string): Promise<{ success: boolean }> {
    return getClient().post<{ success: boolean }>(`${this.basePath}/${id}/retry`);
  }
}

export const notificationService = new NotificationService();
