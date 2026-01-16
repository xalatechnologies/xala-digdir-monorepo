/**
 * Microsoft Outlook Real Client
 * Production implementation for Microsoft Graph API
 *
 * Rate Limits:
 * - 10,000 requests per 10 minutes per app per tenant
 * - OAuth 2.0 token expires after 3600 seconds
 *
 * Requires:
 * - OUTLOOK_TENANT_ID
 * - OUTLOOK_CLIENT_ID
 * - OUTLOOK_CLIENT_SECRET
 */

import type {
  IOutlookClient,
  OutlookConfig,
  OutlookConnectionStatus,
  OutlookSyncResult,
  OutlookCalendar,
  OutlookEvent,
  OutlookEventQueryParams,
  CreateOutlookEventDTO,
  UpdateOutlookEventDTO,
  OutlookSyncMapping,
} from './outlook.types';

/**
 * OAuth token cache
 */
interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

/**
 * Real Microsoft Outlook Client
 * Connects to Microsoft Graph API for calendar operations
 */
export class OutlookClient implements IOutlookClient {
  private config: OutlookConfig;
  private tokenCache: TokenCache | null = null;
  private readonly graphBaseUrl = 'https://graph.microsoft.com/v1.0';
  private readonly authBaseUrl = 'https://login.microsoftonline.com';

  // In-memory sync mapping (in production, this would be database-backed)
  private syncMappings: Map<string, OutlookSyncMapping> = new Map();

  constructor(config: OutlookConfig) {
    this.config = config;
  }

  /**
   * Get OAuth access token (with caching)
   * Implements 60s buffer before expiry for safety
   */
  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    const bufferMs = 60 * 1000; // 60 second buffer

    if (this.tokenCache && this.tokenCache.expiresAt - bufferMs > now) {
      return this.tokenCache.accessToken;
    }

    // Request new token using client credentials flow
    const tokenUrl = `${this.authBaseUrl}/${this.config.tenantId}/oauth2/v2.0/token`;
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        scope: 'https://graph.microsoft.com/.default',
      }),
    });

    if (!response.ok) {
      // Clear cache on error
      this.tokenCache = null;
      throw new Error(`Outlook OAuth error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    this.tokenCache = {
      accessToken: data.access_token,
      expiresAt: now + data.expires_in * 1000,
    };

    return this.tokenCache.accessToken;
  }

  /**
   * Make authenticated API request to Microsoft Graph
   */
  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = await this.getAccessToken();
    const url = `${this.graphBaseUrl}${path}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
      // Clear token cache on 401 and retry once
      this.tokenCache = null;
      const newToken = await this.getAccessToken();
      headers['Authorization'] = `Bearer ${newToken}`;

      const retryResponse = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!retryResponse.ok) {
        throw new Error(`Outlook API error: ${retryResponse.status} ${retryResponse.statusText}`);
      }

      return retryResponse.json();
    }

    if (response.status === 204) {
      return undefined as T;
    }

    if (!response.ok) {
      throw new Error(`Outlook API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // =============================================================================
  // Connection & Sync
  // =============================================================================

  async getStatus(): Promise<OutlookConnectionStatus> {
    try {
      // Test connection by fetching calendars
      const calendars = await this.getCalendars();
      let totalEvents = 0;

      // Get event count from default calendar
      const defaultCalendar = calendars.find((c) => c.isDefault);
      if (defaultCalendar) {
        const events = await this.getEvents({ calendarId: defaultCalendar.id, limit: 1 });
        totalEvents = events.total;
      }

      return {
        connected: true,
        provider: 'Microsoft Outlook',
        lastSync: new Date().toISOString(),
        calendarCount: calendars.length,
        eventCount: totalEvents,
      };
    } catch {
      return {
        connected: false,
        provider: 'Microsoft Outlook',
        calendarCount: 0,
        eventCount: 0,
      };
    }
  }

  async sync(calendarId?: string): Promise<OutlookSyncResult> {
    // Sync implementation would:
    // 1. Fetch recent events from Outlook
    // 2. Update local records
    // 3. Push any pending local changes
    // For now, return skeleton result
    return {
      success: true,
      syncedAt: new Date().toISOString(),
      eventsSynced: 0,
      eventsCreated: 0,
      eventsUpdated: 0,
      eventsDeleted: 0,
    };
  }

  // =============================================================================
  // Calendars
  // =============================================================================

  async getCalendars(): Promise<OutlookCalendar[]> {
    const result = await this.request<any>('GET', '/me/calendars');

    return (result.value || []).map((cal: any) => ({
      id: cal.id,
      name: cal.name,
      color: cal.hexColor,
      isDefault: cal.isDefaultCalendar,
      canEdit: cal.canEdit,
      owner: cal.owner
        ? {
            name: cal.owner.name,
            address: cal.owner.emailAddress?.address,
          }
        : undefined,
    }));
  }

  async getCalendar(calendarId: string): Promise<OutlookCalendar> {
    const cal = await this.request<any>('GET', `/me/calendars/${calendarId}`);

    return {
      id: cal.id,
      name: cal.name,
      color: cal.hexColor,
      isDefault: cal.isDefaultCalendar,
      canEdit: cal.canEdit,
      owner: cal.owner
        ? {
            name: cal.owner.name,
            address: cal.owner.emailAddress?.address,
          }
        : undefined,
    };
  }

  // =============================================================================
  // Events
  // =============================================================================

  async createEvent(data: CreateOutlookEventDTO): Promise<OutlookEvent> {
    const calendarPath = data.calendarId
      ? `/me/calendars/${data.calendarId}/events`
      : '/me/calendar/events';

    const payload: any = {
      subject: data.subject,
      body: data.body
        ? {
            contentType: 'text',
            content: data.body,
          }
        : undefined,
      start: data.start,
      end: data.end,
      isAllDay: data.isAllDay || false,
    };

    if (data.location) {
      payload.location = {
        displayName: data.location,
      };
    }

    if (data.attendees && data.attendees.length > 0) {
      payload.attendees = data.attendees.map((att) => ({
        emailAddress: {
          address: att.email,
          name: att.name || att.email,
        },
        type: att.type || 'required',
      }));
    }

    if (data.recurrence) {
      payload.recurrence = data.recurrence;
    }

    const result = await this.request<any>('POST', calendarPath, payload);

    const event = this.mapGraphEvent(result);

    // Store sync mapping if bookingId provided
    if (data.bookingId) {
      this.syncMappings.set(data.bookingId, {
        bookingId: data.bookingId,
        outlookEventId: event.id,
        calendarId: data.calendarId || 'default',
        lastSynced: new Date().toISOString(),
        syncDirection: 'digilist_to_outlook',
      });
    }

    return event;
  }

  async getEvents(
    params?: OutlookEventQueryParams
  ): Promise<{ data: OutlookEvent[]; total: number }> {
    const calendarPath = params?.calendarId
      ? `/me/calendars/${params.calendarId}/events`
      : '/me/calendar/events';

    const queryParams = new URLSearchParams();

    // OData query parameters
    if (params?.startDateTime && params?.endDateTime) {
      queryParams.set(
        '$filter',
        `start/dateTime ge '${params.startDateTime}' and end/dateTime le '${params.endDateTime}'`
      );
    }
    if (params?.search) {
      queryParams.set('$search', `"${params.search}"`);
    }
    if (params?.limit) {
      queryParams.set('$top', params.limit.toString());
    }
    if (params?.page && params?.limit) {
      queryParams.set('$skip', ((params.page - 1) * params.limit).toString());
    }

    queryParams.set('$count', 'true');
    queryParams.set('$orderby', 'start/dateTime');

    const queryString = queryParams.toString();
    const path = queryString ? `${calendarPath}?${queryString}` : calendarPath;

    const result = await this.request<any>('GET', path);

    return {
      data: (result.value || []).map(this.mapGraphEvent),
      total: result['@odata.count'] || (result.value || []).length,
    };
  }

  async getEvent(eventId: string, calendarId?: string): Promise<OutlookEvent> {
    const path = calendarId
      ? `/me/calendars/${calendarId}/events/${eventId}`
      : `/me/calendar/events/${eventId}`;

    const result = await this.request<any>('GET', path);
    return this.mapGraphEvent(result);
  }

  async updateEvent(
    eventId: string,
    data: UpdateOutlookEventDTO,
    calendarId?: string
  ): Promise<OutlookEvent> {
    const path = calendarId
      ? `/me/calendars/${calendarId}/events/${eventId}`
      : `/me/calendar/events/${eventId}`;

    const payload: any = {};

    if (data.subject !== undefined) {
      payload.subject = data.subject;
    }
    if (data.body !== undefined) {
      payload.body = {
        contentType: 'text',
        content: data.body,
      };
    }
    if (data.start !== undefined) {
      payload.start = data.start;
    }
    if (data.end !== undefined) {
      payload.end = data.end;
    }
    if (data.location !== undefined) {
      payload.location = {
        displayName: data.location,
      };
    }
    if (data.isAllDay !== undefined) {
      payload.isAllDay = data.isAllDay;
    }
    if (data.attendees !== undefined) {
      payload.attendees = data.attendees.map((att) => ({
        emailAddress: {
          address: att.email,
          name: att.name || att.email,
        },
        type: att.type || 'required',
      }));
    }

    const result = await this.request<any>('PATCH', path, payload);
    return this.mapGraphEvent(result);
  }

  async deleteEvent(eventId: string, calendarId?: string): Promise<void> {
    const path = calendarId
      ? `/me/calendars/${calendarId}/events/${eventId}`
      : `/me/calendar/events/${eventId}`;

    await this.request('DELETE', path);

    // Remove sync mapping if exists
    for (const [bookingId, mapping] of this.syncMappings) {
      if (mapping.outlookEventId === eventId) {
        this.syncMappings.delete(bookingId);
        break;
      }
    }
  }

  async cancelEvent(eventId: string, comment?: string, calendarId?: string): Promise<OutlookEvent> {
    const path = calendarId
      ? `/me/calendars/${calendarId}/events/${eventId}/cancel`
      : `/me/calendar/events/${eventId}/cancel`;

    await this.request('POST', path, comment ? { comment } : undefined);

    // Fetch updated event
    return this.getEvent(eventId, calendarId);
  }

  // =============================================================================
  // Sync Mappings
  // =============================================================================

  async getEventByBookingId(bookingId: string): Promise<OutlookEvent | null> {
    const mapping = this.syncMappings.get(bookingId);
    if (!mapping) {
      return null;
    }

    try {
      return await this.getEvent(mapping.outlookEventId, mapping.calendarId);
    } catch {
      return null;
    }
  }

  async linkBookingToEvent(
    bookingId: string,
    eventId: string,
    calendarId: string
  ): Promise<OutlookSyncMapping> {
    const mapping: OutlookSyncMapping = {
      bookingId,
      outlookEventId: eventId,
      calendarId,
      lastSynced: new Date().toISOString(),
      syncDirection: 'bidirectional',
    };

    this.syncMappings.set(bookingId, mapping);
    return mapping;
  }

  async unlinkBooking(bookingId: string): Promise<void> {
    this.syncMappings.delete(bookingId);
  }

  // =============================================================================
  // Helpers
  // =============================================================================

  private mapGraphEvent(event: any): OutlookEvent {
    return {
      id: event.id,
      subject: event.subject,
      bodyPreview: event.bodyPreview,
      start: event.start,
      end: event.end,
      location: event.location
        ? {
            displayName: event.location.displayName,
            address: event.location.address
              ? {
                  street: event.location.address.street,
                  city: event.location.address.city,
                  postalCode: event.location.address.postalCode,
                  country: event.location.address.countryOrRegion,
                }
              : undefined,
          }
        : undefined,
      organizer: event.organizer?.emailAddress
        ? {
            name: event.organizer.emailAddress.name,
            address: event.organizer.emailAddress.address,
          }
        : undefined,
      attendees: (event.attendees || []).map((att: any) => ({
        email: {
          name: att.emailAddress?.name || '',
          address: att.emailAddress?.address || '',
        },
        status: this.mapResponseStatus(att.status?.response),
        type: att.type || 'required',
      })),
      isAllDay: event.isAllDay || false,
      isCancelled: event.isCancelled || false,
      status: this.mapShowAs(event.showAs),
      recurrence: event.recurrence,
      createdAt: event.createdDateTime,
      updatedAt: event.lastModifiedDateTime,
    };
  }

  private mapResponseStatus(status?: string): 'none' | 'organizer' | 'tentative' | 'accepted' | 'declined' {
    const statusMap: Record<string, 'none' | 'organizer' | 'tentative' | 'accepted' | 'declined'> = {
      none: 'none',
      organizer: 'organizer',
      tentativelyAccepted: 'tentative',
      accepted: 'accepted',
      declined: 'declined',
    };
    return statusMap[status || ''] || 'none';
  }

  private mapShowAs(showAs?: string): OutlookEvent['status'] {
    const showAsMap: Record<string, OutlookEvent['status']> = {
      free: 'free',
      tentative: 'tentative',
      busy: 'busy',
      oof: 'oof',
      workingElsewhere: 'workingElsewhere',
    };
    return showAsMap[showAs || ''] || 'unknown';
  }
}
