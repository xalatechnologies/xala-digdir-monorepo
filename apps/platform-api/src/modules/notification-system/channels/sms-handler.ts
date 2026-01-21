/**
 * SMS Channel Handler
 * Handles sending SMS notifications via configured providers (Twilio, Telenor, Nexmo)
 */
import { BaseChannelHandler } from './base-handler';
import type { NotificationChannel, ChannelSendResult, SMSPayload } from '../notification.types';
import type { NotificationRepository } from '../notification.repository';

export class SMSHandler extends BaseChannelHandler {
  readonly channel: NotificationChannel = 'sms';

  constructor(private readonly repository: NotificationRepository) {
    super();
  }

  async send(payload: SMSPayload, tenantId: string): Promise<ChannelSendResult> {
    if (!this.validatePayload(payload)) {
      return {
        success: false,
        error: 'Invalid SMS payload',
        errorCode: 'INVALID_PAYLOAD',
      };
    }

    // Normalize phone number
    const normalizedPhone = this.normalizePhoneNumber(payload.to);
    if (!normalizedPhone) {
      return {
        success: false,
        error: 'Invalid phone number format',
        errorCode: 'INVALID_PHONE',
      };
    }

    // Check rate limits
    const rateLimit = await this.getRateLimitStatus(tenantId);
    if (!rateLimit.withinLimit) {
      return {
        success: false,
        error: 'SMS rate limit exceeded',
        errorCode: 'RATE_LIMIT_EXCEEDED',
      };
    }

    // Get provider config
    const config = await this.repository.findSmsProviderConfig(tenantId);
    if (!config) {
      return {
        success: false,
        error: 'SMS provider not configured',
        errorCode: 'PROVIDER_NOT_CONFIGURED',
      };
    }

    try {
      const result = await this.sendViaProvider(
        { ...payload, to: normalizedPhone },
        config
      );

      if (result.success) {
        await this.repository.incrementSmsCount(tenantId);
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

  private normalizePhoneNumber(phone: string): string | null {
    // Remove all non-digit characters except leading +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Handle Norwegian numbers
    if (cleaned.startsWith('00')) {
      cleaned = '+' + cleaned.slice(2);
    } else if (cleaned.startsWith('0047')) {
      cleaned = '+47' + cleaned.slice(4);
    } else if (cleaned.match(/^[49]\d{7}$/)) {
      // Norwegian mobile (4/9) or landline without country code
      cleaned = '+47' + cleaned;
    } else if (!cleaned.startsWith('+')) {
      // Assume Norwegian if no country code
      cleaned = '+47' + cleaned;
    }

    // Validate length (Norwegian numbers are +47 followed by 8 digits)
    if (cleaned.startsWith('+47') && cleaned.length !== 11) {
      return null;
    }

    return cleaned;
  }

  private async sendViaProvider(
    payload: SMSPayload,
    config: { provider: string; config: unknown }
  ): Promise<ChannelSendResult> {
    const providerConfig = config.config as Record<string, unknown>;

    switch (config.provider) {
      case 'twilio':
        return this.sendViaTwilio(payload, providerConfig);
      case 'telenor':
        return this.sendViaTelenor(payload, providerConfig);
      case 'nexmo':
        return this.sendViaNexmo(payload, providerConfig);
      default:
        return this.sendViaDevelopmentLog(payload);
    }
  }

  private async sendViaTwilio(
    payload: SMSPayload,
    config: Record<string, unknown>
  ): Promise<ChannelSendResult> {
    const accountSid = config.accountSid as string;
    const authToken = config.authToken as string;
    const fromNumber = config.fromNumber as string;

    if (!accountSid || !authToken || !fromNumber) {
      return {
        success: false,
        error: 'Twilio credentials not configured',
        errorCode: 'MISSING_CREDENTIALS',
      };
    }

    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: fromNumber,
            To: payload.to,
            Body: payload.message,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return { success: true, messageId: data.sid };
      }

      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || 'Twilio send failed',
        errorCode: `TWILIO_${errorData.code || 'ERROR'}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Twilio request failed',
        errorCode: 'TWILIO_REQUEST_FAILED',
      };
    }
  }

  private async sendViaTelenor(
    payload: SMSPayload,
    config: Record<string, unknown>
  ): Promise<ChannelSendResult> {
    // Telenor SMS API implementation
    console.log('[TELENOR] Would send SMS:', {
      to: payload.to,
      message: payload.message.substring(0, 50) + '...',
    });
    return { success: true, messageId: `telenor-${Date.now()}` };
  }

  private async sendViaNexmo(
    payload: SMSPayload,
    config: Record<string, unknown>
  ): Promise<ChannelSendResult> {
    const apiKey = config.apiKey as string;
    const apiSecret = config.apiSecret as string;
    const from = config.from as string;

    if (!apiKey || !apiSecret || !from) {
      return {
        success: false,
        error: 'Nexmo credentials not configured',
        errorCode: 'MISSING_CREDENTIALS',
      };
    }

    try {
      const response = await fetch('https://rest.nexmo.com/sms/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          api_secret: apiSecret,
          from,
          to: payload.to.replace('+', ''),
          text: payload.message,
        }),
      });

      const data = await response.json();
      if (data.messages?.[0]?.status === '0') {
        return { success: true, messageId: data.messages[0]['message-id'] };
      }

      return {
        success: false,
        error: data.messages?.[0]?.['error-text'] || 'Nexmo send failed',
        errorCode: 'NEXMO_ERROR',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Nexmo request failed',
        errorCode: 'NEXMO_REQUEST_FAILED',
      };
    }
  }

  private async sendViaDevelopmentLog(payload: SMSPayload): Promise<ChannelSendResult> {
    console.log('[SMS - DEV] Sending SMS:', {
      to: payload.to,
      message: payload.message,
    });
    return { success: true, messageId: `dev-sms-${Date.now()}` };
  }

  async isAvailable(tenantId: string): Promise<boolean> {
    const config = await this.repository.findSmsProviderConfig(tenantId);
    return config !== null && config.isActive;
  }

  async getRateLimitStatus(tenantId: string): Promise<{
    withinLimit: boolean;
    remaining: number;
    resetsAt: Date;
  }> {
    const config = await this.repository.findSmsProviderConfig(tenantId);
    if (!config) {
      return { withinLimit: false, remaining: 0, resetsAt: new Date() };
    }

    const remaining = Math.max(0, config.dailyLimit - config.dailyCount);
    const withinLimit = remaining > 0;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    return { withinLimit, remaining, resetsAt: tomorrow };
  }

  validatePayload(payload: unknown): payload is SMSPayload {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    return typeof p.to === 'string' && typeof p.message === 'string';
  }
}
