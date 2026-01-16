/**
 * Microsoft Outlook Mock Client
 * Deterministic mock implementation for demo/testing
 *
 * Features:
 * - In-memory storage for calendars, events, mappings
 * - Deterministic responses based on IDs
 * - Simulates all Microsoft Graph API behaviors
 * - No external API calls
 */

import type {
  IOutlookClient,
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
 * Mock Microsoft Outlook Client
 * Provides deterministic responses for demo and testing
 */
export class OutlookMockClient implements IOutlookClient {
  // In-memory storage
  private calendars: Map<string, OutlookCalendar> = new Map();
  private events: Map<string, OutlookEvent> = new Map();
  private syncMappings: Map<string, OutlookSyncMapping> = new Map();
  private eventCounter = 1;

  constructor() {
    this.seedDemoData();
  }

  /**
   * Seed initial demo data for consistent demo experience
   */
  private seedDemoData(): void {
    // Seed demo calendars
    const demoCalendars: OutlookCalendar[] = [
      {
        id: 'cal-001',
        name: 'Booking kalender',
        color: '#0078D4',
        isDefault: true,
        canEdit: true,
        owner: {
          name: 'Kommune Admin',
          address: 'admin@kommune.no',
        },
      },
      {
        id: 'cal-002',
        name: 'Idrettshall A',
        color: '#107C10',
        isDefault: false,
        canEdit: true,
        owner: {
          name: 'Idrettsavdeling',
          address: 'idrett@kommune.no',
        },
      },
      {
        id: 'cal-003',
        name: 'Kulturhuset',
        color: '#5C2D91',
        isDefault: false,
        canEdit: true,
        owner: {
          name: 'Kulturavdeling',
          address: 'kultur@kommune.no',
        },
      },
    ];

    demoCalendars.forEach((cal) => this.calendars.set(cal.id, cal));

    // Seed demo events
    const now = Date.now();
    const hour = 60 * 60 * 1000;
    const day = 24 * hour;

    const demoEvents: OutlookEvent[] = [
      {
        id: 'evt-001',
        subject: 'Fotballtrening - Junior',
        bodyPreview: 'Ukentlig fotballtrening for juniorlag',
        start: {
          dateTime: new Date(now + day + 16 * hour).toISOString(),
          timeZone: 'Europe/Oslo',
        },
        end: {
          dateTime: new Date(now + day + 18 * hour).toISOString(),
          timeZone: 'Europe/Oslo',
        },
        location: {
          displayName: 'Idrettshall A',
          address: {
            street: 'Idrettsveien 1',
            city: 'Oslo',
            postalCode: '0150',
            country: 'Norway',
          },
        },
        organizer: {
          name: 'Oslo Idrettslag',
          address: 'post@osloil.no',
        },
        attendees: [
          {
            email: { name: 'Trener Hansen', address: 'trener@osloil.no' },
            status: 'accepted',
            type: 'required',
          },
        ],
        isAllDay: false,
        isCancelled: false,
        status: 'busy',
        createdAt: new Date(now - 7 * day).toISOString(),
        updatedAt: new Date(now - 7 * day).toISOString(),
        externalId: 'booking-001',
      },
      {
        id: 'evt-002',
        subject: 'Styremøte - Kulturforening',
        bodyPreview: 'Månedlig styremøte',
        start: {
          dateTime: new Date(now + 3 * day + 18 * hour).toISOString(),
          timeZone: 'Europe/Oslo',
        },
        end: {
          dateTime: new Date(now + 3 * day + 20 * hour).toISOString(),
          timeZone: 'Europe/Oslo',
        },
        location: {
          displayName: 'Kulturhuset - Møterom B',
        },
        organizer: {
          name: 'Kulturforeningen',
          address: 'post@kulturforeningen.no',
        },
        attendees: [
          {
            email: { name: 'Leder', address: 'leder@kulturforeningen.no' },
            status: 'accepted',
            type: 'required',
          },
          {
            email: { name: 'Nestleder', address: 'nestleder@kulturforeningen.no' },
            status: 'tentative',
            type: 'required',
          },
        ],
        isAllDay: false,
        isCancelled: false,
        status: 'busy',
        createdAt: new Date(now - 14 * day).toISOString(),
        updatedAt: new Date(now - 2 * day).toISOString(),
        externalId: 'booking-002',
      },
      {
        id: 'evt-003',
        subject: 'Konsert - Lokalt band',
        bodyPreview: 'Lokal konsert med kulturstøtte',
        start: {
          dateTime: new Date(now + 7 * day + 19 * hour).toISOString(),
          timeZone: 'Europe/Oslo',
        },
        end: {
          dateTime: new Date(now + 7 * day + 23 * hour).toISOString(),
          timeZone: 'Europe/Oslo',
        },
        location: {
          displayName: 'Kulturhuset - Storsal',
        },
        organizer: {
          name: 'Musikkforeningen',
          address: 'post@musikk.no',
        },
        attendees: [],
        isAllDay: false,
        isCancelled: false,
        status: 'busy',
        createdAt: new Date(now - 30 * day).toISOString(),
        updatedAt: new Date(now - 30 * day).toISOString(),
        externalId: 'booking-003',
      },
    ];

    demoEvents.forEach((evt) => this.events.set(evt.id, evt));
    this.eventCounter = 4;

    // Seed sync mappings
    demoEvents.forEach((evt) => {
      if (evt.externalId) {
        this.syncMappings.set(evt.externalId, {
          bookingId: evt.externalId,
          outlookEventId: evt.id,
          calendarId: 'cal-001',
          lastSynced: evt.updatedAt,
          syncDirection: 'bidirectional',
        });
      }
    });
  }

  // =============================================================================
  // Connection & Sync
  // =============================================================================

  async getStatus(): Promise<OutlookConnectionStatus> {
    return {
      connected: true,
      provider: 'Microsoft Outlook',
      version: '1.0.0-mock',
      lastSync: new Date().toISOString(),
      calendarCount: this.calendars.size,
      eventCount: this.events.size,
    };
  }

  async sync(_calendarId?: string): Promise<OutlookSyncResult> {
    // Simulate sync delay
    await this.delay(100);

    return {
      success: true,
      syncedAt: new Date().toISOString(),
      eventsSynced: this.events.size,
      eventsCreated: 0,
      eventsUpdated: 0,
      eventsDeleted: 0,
    };
  }

  // =============================================================================
  // Calendars
  // =============================================================================

  async getCalendars(): Promise<OutlookCalendar[]> {
    return Array.from(this.calendars.values());
  }

  async getCalendar(calendarId: string): Promise<OutlookCalendar> {
    const calendar = this.calendars.get(calendarId);
    if (!calendar) {
      throw new Error(`Calendar ${calendarId} not found`);
    }
    return { ...calendar };
  }

  // =============================================================================
  // Events
  // =============================================================================

  async createEvent(data: CreateOutlookEventDTO): Promise<OutlookEvent> {
    const eventId = `evt-${this.eventCounter.toString().padStart(3, '0')}`;
    this.eventCounter++;

    const event: OutlookEvent = {
      id: eventId,
      subject: data.subject,
      bodyPreview: data.body,
      start: data.start,
      end: data.end,
      location: data.location
        ? {
            displayName: data.location,
          }
        : undefined,
      organizer: {
        name: 'System',
        address: 'system@kommune.no',
      },
      attendees:
        data.attendees?.map((att) => ({
          email: {
            name: att.name || att.email,
            address: att.email,
          },
          status: 'none' as const,
          type: att.type || 'required',
        })) || [],
      isAllDay: data.isAllDay || false,
      isCancelled: false,
      status: 'busy',
      recurrence: data.recurrence,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      externalId: data.bookingId,
    };

    this.events.set(eventId, event);

    // Create sync mapping
    if (data.bookingId) {
      this.syncMappings.set(data.bookingId, {
        bookingId: data.bookingId,
        outlookEventId: eventId,
        calendarId: data.calendarId || 'cal-001',
        lastSynced: new Date().toISOString(),
        syncDirection: 'digilist_to_outlook',
      });
    }

    return { ...event };
  }

  async getEvents(
    params?: OutlookEventQueryParams
  ): Promise<{ data: OutlookEvent[]; total: number }> {
    let events = Array.from(this.events.values());

    // Apply filters
    if (params?.startDateTime) {
      const startTime = new Date(params.startDateTime).getTime();
      events = events.filter((evt) => new Date(evt.start.dateTime).getTime() >= startTime);
    }
    if (params?.endDateTime) {
      const endTime = new Date(params.endDateTime).getTime();
      events = events.filter((evt) => new Date(evt.end.dateTime).getTime() <= endTime);
    }
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      events = events.filter(
        (evt) =>
          evt.subject.toLowerCase().includes(searchLower) ||
          evt.bodyPreview?.toLowerCase().includes(searchLower) ||
          evt.location?.displayName.toLowerCase().includes(searchLower)
      );
    }

    // Sort by start date
    events.sort(
      (a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
    );

    // Pagination
    const total = events.length;
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    events = events.slice(start, start + limit);

    return {
      data: events.map((evt) => ({ ...evt })),
      total,
    };
  }

  async getEvent(eventId: string, _calendarId?: string): Promise<OutlookEvent> {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }
    return { ...event };
  }

  async updateEvent(
    eventId: string,
    data: UpdateOutlookEventDTO,
    _calendarId?: string
  ): Promise<OutlookEvent> {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    // Apply updates
    if (data.subject !== undefined) {
      event.subject = data.subject;
    }
    if (data.body !== undefined) {
      event.bodyPreview = data.body;
    }
    if (data.start !== undefined) {
      event.start = data.start;
    }
    if (data.end !== undefined) {
      event.end = data.end;
    }
    if (data.location !== undefined) {
      event.location = {
        displayName: data.location,
      };
    }
    if (data.isAllDay !== undefined) {
      event.isAllDay = data.isAllDay;
    }
    if (data.attendees !== undefined) {
      event.attendees = data.attendees.map((att) => ({
        email: {
          name: att.name || att.email,
          address: att.email,
        },
        status: 'none' as const,
        type: att.type || 'required',
      }));
    }

    event.updatedAt = new Date().toISOString();

    // Update sync mapping
    if (event.externalId) {
      const mapping = this.syncMappings.get(event.externalId);
      if (mapping) {
        mapping.lastSynced = event.updatedAt;
      }
    }

    return { ...event };
  }

  async deleteEvent(eventId: string, _calendarId?: string): Promise<void> {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    // Remove sync mapping if exists
    if (event.externalId) {
      this.syncMappings.delete(event.externalId);
    }

    this.events.delete(eventId);
  }

  async cancelEvent(
    eventId: string,
    _comment?: string,
    _calendarId?: string
  ): Promise<OutlookEvent> {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    event.isCancelled = true;
    event.updatedAt = new Date().toISOString();

    return { ...event };
  }

  // =============================================================================
  // Sync Mappings
  // =============================================================================

  async getEventByBookingId(bookingId: string): Promise<OutlookEvent | null> {
    const mapping = this.syncMappings.get(bookingId);
    if (!mapping) {
      return null;
    }

    const event = this.events.get(mapping.outlookEventId);
    return event ? { ...event } : null;
  }

  async linkBookingToEvent(
    bookingId: string,
    eventId: string,
    calendarId: string
  ): Promise<OutlookSyncMapping> {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    const mapping: OutlookSyncMapping = {
      bookingId,
      outlookEventId: eventId,
      calendarId,
      lastSynced: new Date().toISOString(),
      syncDirection: 'bidirectional',
    };

    this.syncMappings.set(bookingId, mapping);
    event.externalId = bookingId;

    return { ...mapping };
  }

  async unlinkBooking(bookingId: string): Promise<void> {
    const mapping = this.syncMappings.get(bookingId);
    if (mapping) {
      const event = this.events.get(mapping.outlookEventId);
      if (event) {
        event.externalId = undefined;
      }
      this.syncMappings.delete(bookingId);
    }
  }

  // =============================================================================
  // Helpers
  // =============================================================================

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
