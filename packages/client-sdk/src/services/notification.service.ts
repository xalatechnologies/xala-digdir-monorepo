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

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DeliveryAttempt {
  id: string;
  notificationId: string;
  attemptNumber: number;
  status: 'pending' | 'sent' | 'failed';
  error?: string | null;
  retriedAt?: string | null;
  nextRetryAt?: string | null;
  createdAt: string;
}

export interface NotificationDeliveryStatus {
  notification: Notification;
  attempts: DeliveryAttempt[];
  totalAttempts: number;
  lastAttemptAt?: string | null;
}

export interface DeliveryReport {
  id: string;
  type: 'email' | 'push' | 'in_app' | 'sms';
  recipient: string;
  subject?: string | null;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  attemptCount: number;
  lastAttemptAt?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  failedAt?: string | null;
  createdAt: string;
}

export interface DeliveryReportQueryParams {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

class NotificationService {
  private basePath = '/api/notifications';

  /**
   * Get all notifications
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
   * Get user's notifications
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
   * Send a notification
   */
  async send(data: SendNotificationDTO): Promise<{ data: Notification }> {
    return getClient().post<{ data: Notification }>(this.basePath, data);
  }

  /**
   * Send email notification
   */
  async sendEmail(data: SendEmailDTO): Promise<{ success: boolean; messageId?: string }> {
    return getClient().post<{ success: boolean; messageId?: string }>(`${this.basePath}/email`, data);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<{ data: Notification }> {
    return getClient().put<{ data: Notification }>(`${this.basePath}/${id}/read`);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ success: boolean; count: number }> {
    return getClient().put<{ success: boolean; count: number }>(`${this.basePath}/read-all`);
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<{ data: { count: number } }> {
    return getClient().get<{ data: { count: number } }>(`${this.basePath}/unread-count`);
  }

  /**
   * Get notification templates
   */
  async getTemplates(): Promise<{ data: NotificationTemplate[] }> {
    return getClient().get<{ data: NotificationTemplate[] }>(`${this.basePath}/templates`);
  }

  /**
   * Delete a notification
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return getClient().delete<{ success: boolean }>(`${this.basePath}/${id}`);
  }

  /**
   * Get delivery status for a specific notification
   */
  async getDeliveryStatus(id: string): Promise<{ data: NotificationDeliveryStatus }> {
    return getClient().get<{ data: NotificationDeliveryStatus }>(`${this.basePath}/delivery-status/${id}`);
  }

  /**
   * Get delivery reports with filtering
   */
  async getDeliveryReports(params: DeliveryReportQueryParams = {}): Promise<PaginatedResponse<DeliveryReport>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.set(key, String(value));
    });

    const url = queryParams.toString()
      ? `${this.basePath}/delivery-reports?${queryParams.toString()}`
      : `${this.basePath}/delivery-reports`;

    return getClient().get<PaginatedResponse<DeliveryReport>>(url);
  }

  /**
   * Retry failed notifications
   */
  async retryFailed(): Promise<{ success: boolean; retried: number }> {
    return getClient().post<{ success: boolean; retried: number }>(`${this.basePath}/retry-failed`);
  }
}

export const notificationService = new NotificationService();
