/**
 * Email Service
 * SendGrid integration for sending email notifications
 */
import sgMail, { type MailDataRequired } from '@sendgrid/mail';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
  from?: {
    email: string;
    name: string;
  };
  replyTo?: string;
}

export interface BookingDetails {
  bookingId: string;
  listingTitle: string;
  listingId: string;
  startTime: string;
  endTime: string;
  location?: string;
  organizationName?: string;
  userName: string;
  userEmail: string;
  notes?: string;
  rejectionReason?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  private isConfigured: boolean = false;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly appUrl: string;

  constructor() {
    // Configure SendGrid
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey) {
      sgMail.setApiKey(apiKey);
      this.isConfigured = true;
    } else {
      console.warn('SENDGRID_API_KEY not configured. Email sending will be disabled.');
    }

    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@digilist.no';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'Digilist Notifications';
    this.appUrl = process.env.APP_URL || 'https://digilist.no';
  }

  /**
   * Send a generic email
   */
  async sendEmail(payload: EmailPayload): Promise<EmailResult> {
    if (!this.isConfigured) {
      console.warn('Email service not configured. Email not sent:', payload.to);
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    try {
      const msg: MailDataRequired = {
        to: payload.to,
        from: payload.from || {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
        ...(payload.replyTo && { replyTo: payload.replyTo }),
      };

      const [response] = await sgMail.send(msg);

      return {
        success: true,
        messageId: response.headers['x-message-id'] as string,
      };
    } catch (error) {
      console.error('SendGrid error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending email',
      };
    }
  }

  /**
   * Send booking created notification email
   */
  async sendBookingCreated(
    to: string,
    booking: BookingDetails,
    locale: 'nb' | 'en' = 'nb'
  ): Promise<EmailResult> {
    const template = this.getTemplate('booking-created', locale);
    const html = this.renderTemplate(template, {
      bookingId: booking.bookingId,
      listingTitle: booking.listingTitle,
      userName: booking.userName,
      startTime: this.formatDate(booking.startTime, locale),
      endTime: this.formatDate(booking.endTime, locale),
      location: booking.location || '',
      organizationName: booking.organizationName || '',
      viewUrl: `${this.appUrl}/bookings/${booking.bookingId}`,
      dashboardUrl: `${this.appUrl}/dashboard`,
      preferencesUrl: `${this.appUrl}/settings/notifications`,
    });

    const subject =
      locale === 'nb'
        ? `Ny booking opprettet: ${booking.listingTitle}`
        : `New booking created: ${booking.listingTitle}`;

    return this.sendEmail({
      to,
      subject,
      text: this.htmlToText(html),
      html,
    });
  }

  /**
   * Send booking approved notification email
   */
  async sendBookingApproved(
    to: string,
    booking: BookingDetails,
    locale: 'nb' | 'en' = 'nb'
  ): Promise<EmailResult> {
    const template = this.getTemplate('booking-approved', locale);
    const html = this.renderTemplate(template, {
      bookingId: booking.bookingId,
      listingTitle: booking.listingTitle,
      userName: booking.userName,
      startTime: this.formatDate(booking.startTime, locale),
      endTime: this.formatDate(booking.endTime, locale),
      location: booking.location || '',
      viewUrl: `${this.appUrl}/bookings/${booking.bookingId}`,
      dashboardUrl: `${this.appUrl}/dashboard`,
      preferencesUrl: `${this.appUrl}/settings/notifications`,
    });

    const subject =
      locale === 'nb'
        ? `✓ Booking godkjent: ${booking.listingTitle}`
        : `✓ Booking approved: ${booking.listingTitle}`;

    return this.sendEmail({
      to,
      subject,
      text: this.htmlToText(html),
      html,
    });
  }

  /**
   * Send booking rejected notification email
   */
  async sendBookingRejected(
    to: string,
    booking: BookingDetails,
    rejectionReason: string,
    locale: 'nb' | 'en' = 'nb'
  ): Promise<EmailResult> {
    const template = this.getTemplate('booking-rejected', locale);
    const html = this.renderTemplate(template, {
      bookingId: booking.bookingId,
      listingTitle: booking.listingTitle,
      userName: booking.userName,
      startTime: this.formatDate(booking.startTime, locale),
      endTime: this.formatDate(booking.endTime, locale),
      rejectionReason,
      contactUrl: `${this.appUrl}/support`,
      dashboardUrl: `${this.appUrl}/dashboard`,
      preferencesUrl: `${this.appUrl}/settings/notifications`,
    });

    const subject =
      locale === 'nb'
        ? `Booking avslått: ${booking.listingTitle}`
        : `Booking rejected: ${booking.listingTitle}`;

    return this.sendEmail({
      to,
      subject,
      text: this.htmlToText(html),
      html,
    });
  }

  /**
   * Send booking cancelled notification email
   */
  async sendBookingCancelled(
    to: string,
    booking: BookingDetails,
    locale: 'nb' | 'en' = 'nb'
  ): Promise<EmailResult> {
    const template = this.getTemplate('booking-cancelled', locale);
    const html = this.renderTemplate(template, {
      bookingId: booking.bookingId,
      listingTitle: booking.listingTitle,
      userName: booking.userName,
      startTime: this.formatDate(booking.startTime, locale),
      endTime: this.formatDate(booking.endTime, locale),
      dashboardUrl: `${this.appUrl}/dashboard`,
      preferencesUrl: `${this.appUrl}/settings/notifications`,
    });

    const subject =
      locale === 'nb'
        ? `Booking kansellert: ${booking.listingTitle}`
        : `Booking cancelled: ${booking.listingTitle}`;

    return this.sendEmail({
      to,
      subject,
      text: this.htmlToText(html),
      html,
    });
  }

  // ============================================================================
  // Template Helpers
  // ============================================================================

  /**
   * Get email template from file
   */
  private getTemplate(templateName: string, locale: 'nb' | 'en'): string {
    const templatePath = join(__dirname, 'templates', `${templateName}.${locale}.html`);
    try {
      return readFileSync(templatePath, 'utf-8');
    } catch (error) {
      console.error(`Failed to load email template: ${templatePath}`, error);
      // Fallback to Norwegian if English template not found
      if (locale === 'en') {
        return this.getTemplate(templateName, 'nb');
      }
      // Return basic fallback
      return '<html><body>{{content}}</body></html>';
    }
  }

  /**
   * Render template with variables
   */
  private renderTemplate(template: string, variables: Record<string, string>): string {
    let rendered = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, value);
    }
    return rendered;
  }

  /**
   * Convert HTML to plain text (basic implementation)
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  /**
   * Format date for display
   */
  private formatDate(dateString: string, locale: 'nb' | 'en'): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    if (locale === 'nb') {
      return date.toLocaleDateString('nb-NO', options);
    }
    return date.toLocaleDateString('en-US', options);
  }
}
