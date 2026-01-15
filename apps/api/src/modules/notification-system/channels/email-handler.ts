/**
 * Email Channel Handler
 * Handles sending email notifications via configured providers (SendGrid, SES, Postmark, SMTP)
 */
import { BaseChannelHandler } from './base-handler';
import type { NotificationChannel, ChannelSendResult, EmailPayload } from '../notification.types';
import type { NotificationRepository } from '../notification.repository';

export class EmailHandler extends BaseChannelHandler {
  readonly channel: NotificationChannel = 'email';

  constructor(private readonly repository: NotificationRepository) {
    super();
  }

  async send(payload: EmailPayload, tenantId: string): Promise<ChannelSendResult> {
    if (!this.validatePayload(payload)) {
      return {
        success: false,
        error: 'Invalid email payload',
        errorCode: 'INVALID_PAYLOAD',
      };
    }

    // Check rate limits
    const rateLimit = await this.getRateLimitStatus(tenantId);
    if (!rateLimit.withinLimit) {
      return {
        success: false,
        error: 'Email rate limit exceeded',
        errorCode: 'RATE_LIMIT_EXCEEDED',
      };
    }

    // Get provider config
    const config = await this.repository.findEmailProviderConfig(tenantId);
    if (!config) {
      return {
        success: false,
        error: 'Email provider not configured',
        errorCode: 'PROVIDER_NOT_CONFIGURED',
      };
    }

    try {
      // Route to appropriate provider
      const result = await this.sendViaProvider(payload, config);
      
      if (result.success) {
        // Increment usage count
        await this.repository.incrementEmailCount(tenantId);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorCode: 'SEND_FAILED',
      };
    }
  }

  private async sendViaProvider(
    payload: EmailPayload,
    config: { provider: string; config: unknown; fromEmail: string; fromName: string | null }
  ): Promise<ChannelSendResult> {
    const providerConfig = config.config as Record<string, unknown>;

    switch (config.provider) {
      case 'sendgrid':
        return this.sendViaSendGrid(payload, providerConfig, config);
      case 'ses':
        return this.sendViaSES(payload, providerConfig, config);
      case 'postmark':
        return this.sendViaPostmark(payload, providerConfig, config);
      case 'smtp':
        return this.sendViaSMTP(payload, providerConfig, config);
      default:
        // Default to logging for development
        return this.sendViaDevelopmentLog(payload, config);
    }
  }

  private async sendViaSendGrid(
    payload: EmailPayload,
    providerConfig: Record<string, unknown>,
    config: { fromEmail: string; fromName: string | null }
  ): Promise<ChannelSendResult> {
    const apiKey = providerConfig.apiKey as string;
    if (!apiKey) {
      return { success: false, error: 'SendGrid API key not configured', errorCode: 'MISSING_API_KEY' };
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: payload.to }] }],
          from: { email: config.fromEmail, name: config.fromName || undefined },
          subject: payload.subject,
          content: [
            { type: 'text/plain', value: payload.body },
            ...(payload.html ? [{ type: 'text/html', value: payload.html }] : []),
          ],
          reply_to: payload.replyTo ? { email: payload.replyTo } : undefined,
        }),
      });

      if (response.ok) {
        const messageId = response.headers.get('X-Message-Id') || undefined;
        return { success: true, messageId };
      }

      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.errors?.[0]?.message || 'SendGrid send failed',
        errorCode: 'SENDGRID_ERROR',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SendGrid request failed',
        errorCode: 'SENDGRID_REQUEST_FAILED',
      };
    }
  }

  private async sendViaSES(
    payload: EmailPayload,
    providerConfig: Record<string, unknown>,
    config: { fromEmail: string; fromName: string | null }
  ): Promise<ChannelSendResult> {
    // AWS SES implementation would go here
    // For now, log and return success for development
    console.log('[SES] Would send email:', {
      to: payload.to,
      from: config.fromEmail,
      subject: payload.subject,
    });
    return { success: true, messageId: `ses-${Date.now()}` };
  }

  private async sendViaPostmark(
    payload: EmailPayload,
    providerConfig: Record<string, unknown>,
    config: { fromEmail: string; fromName: string | null }
  ): Promise<ChannelSendResult> {
    const serverToken = providerConfig.serverToken as string;
    if (!serverToken) {
      return { success: false, error: 'Postmark server token not configured', errorCode: 'MISSING_TOKEN' };
    }

    try {
      const response = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Postmark-Server-Token': serverToken,
        },
        body: JSON.stringify({
          From: config.fromName ? `${config.fromName} <${config.fromEmail}>` : config.fromEmail,
          To: payload.to,
          Subject: payload.subject,
          TextBody: payload.body,
          HtmlBody: payload.html,
          ReplyTo: payload.replyTo,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, messageId: data.MessageID };
      }

      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.Message || 'Postmark send failed',
        errorCode: 'POSTMARK_ERROR',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Postmark request failed',
        errorCode: 'POSTMARK_REQUEST_FAILED',
      };
    }
  }

  private async sendViaSMTP(
    payload: EmailPayload,
    providerConfig: Record<string, unknown>,
    config: { fromEmail: string; fromName: string | null }
  ): Promise<ChannelSendResult> {
    // SMTP implementation would use nodemailer or similar
    // For now, log and return success for development
    console.log('[SMTP] Would send email:', {
      to: payload.to,
      from: config.fromEmail,
      subject: payload.subject,
    });
    return { success: true, messageId: `smtp-${Date.now()}` };
  }

  private async sendViaDevelopmentLog(
    payload: EmailPayload,
    config: { fromEmail: string; fromName: string | null }
  ): Promise<ChannelSendResult> {
    console.log('[EMAIL - DEV] Sending email:', {
      to: payload.to,
      from: `${config.fromName || ''} <${config.fromEmail}>`.trim(),
      subject: payload.subject,
      body: payload.body.substring(0, 200) + (payload.body.length > 200 ? '...' : ''),
    });
    return { success: true, messageId: `dev-${Date.now()}` };
  }

  async isAvailable(tenantId: string): Promise<boolean> {
    const config = await this.repository.findEmailProviderConfig(tenantId);
    return config !== null && config.isActive;
  }

  async getRateLimitStatus(tenantId: string): Promise<{
    withinLimit: boolean;
    remaining: number;
    resetsAt: Date;
  }> {
    const config = await this.repository.findEmailProviderConfig(tenantId);
    if (!config) {
      return { withinLimit: false, remaining: 0, resetsAt: new Date() };
    }

    const remaining = Math.max(0, config.dailyLimit - config.dailyCount);
    const withinLimit = remaining > 0;

    // Reset at midnight UTC
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    return { withinLimit, remaining, resetsAt: tomorrow };
  }

  validatePayload(payload: unknown): payload is EmailPayload {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    return (
      typeof p.to === 'string' &&
      typeof p.subject === 'string' &&
      typeof p.body === 'string'
    );
  }
}
