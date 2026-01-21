import { renderHook } from '@testing-library/react';
import { useConflictDetection } from './useConflictDetection';
import type { CalendarEvent } from '@digilist/client-sdk';
import { useT } from '@xalatechnologies/platform/i18n';

// SKIPPED
describe.skip('useConflictDetection', () => {
  const mockEvents: CalendarEvent[] = [
    {
      id: 'event-1',
      listingId: 'listing-1',
      startTime: new Date('2026-01-14T10:00:00'),
      endTime: new Date('2026-01-14T12:00:00'),
      title: 'Event 1',
      status: 'confirmed',
    } as CalendarEvent,
    {
      id: 'event-2',
      listingId: 'listing-1',
      startTime: new Date('2026-01-14T11:00:00'),
      endTime: new Date('2026-01-14T13:00:00'),
      title: 'Event 2',
      status: 'confirmed',
    } as CalendarEvent,
    {
      id: 'event-3',
      listingId: 'listing-2',
      startTime: new Date('2026-01-14T11:00:00'),
      endTime: new Date('2026-01-14T13:00:00'),
      title: 'Event 3',
      status: 'confirmed',
    } as CalendarEvent,
  ];

  it('should detect overlapping events for same listing', () => {
    const { result } = renderHook(() =>
      useConflictDetection({ events: mockEvents, enabled: true })
    );

    // Event 1 and Event 2 overlap (same listing)
    expect(result.current.hasConflict('event-1')).toBe(true);
    expect(result.current.hasConflict('event-2')).toBe(true);
  });

  it('should not detect conflicts for different listings', () => {
    const { result } = renderHook(() =>
      useConflictDetection({ events: mockEvents, enabled: true })
    );

    // Event 2 and Event 3 overlap times but different listings
    const event2Conflicts = result.current.getConflicts('event-2');
    expect(event2Conflicts?.conflictingEvents).not.toContainEqual(
      expect.objectContaining({ id: 'event-3' })
    );
  });

  it('should not detect conflicts for non-overlapping events', () => {
    const nonOverlappingEvents: CalendarEvent[] = [
      {
        id: 'event-1',
        listingId: 'listing-1',
        startTime: new Date('2026-01-14T10:00:00'),
        endTime: new Date('2026-01-14T11:00:00'),
        title: 'Event 1',
        status: 'confirmed',
      } as CalendarEvent,
      {
        id: 'event-2',
        listingId: 'listing-1',
        startTime: new Date('2026-01-14T11:00:00'),
        endTime: new Date('2026-01-14T12:00:00'),
        title: 'Event 2',
        status: 'confirmed',
      } as CalendarEvent,
    ];

    const { result } = renderHook(() =>
      useConflictDetection({ events: nonOverlappingEvents, enabled: true })
    );

    expect(result.current.hasConflict('event-1')).toBe(false);
    expect(result.current.hasConflict('event-2')).toBe(false);
  });

  it('should return conflict details with event information', () => {
    const { result } = renderHook(() =>
      useConflictDetection({ events: mockEvents, enabled: true })
    );

    const conflicts = result.current.getConflicts('event-1');

    expect(conflicts).toMatchObject({
      eventId: 'event-1',
      conflictingEvents: expect.arrayContaining([
        expect.objectContaining({
          id: 'event-2',
          title: 'Event 2',
        }),
      ]),
    });
  });

  it('should return empty results when disabled', () => {
    const { result } = renderHook(() =>
      useConflictDetection({ events: mockEvents, enabled: false })
    );

    expect(result.current.hasAnyConflicts).toBe(false);
    expect(result.current.conflictCount).toBe(0);
  });

  it('should handle empty event list', () => {
    const { result } = renderHook(() =>
      useConflictDetection({ events: [], enabled: true })
    );

    expect(result.current.hasAnyConflicts).toBe(false);
    expect(result.current.conflictCount).toBe(0);
  });

  it('should handle events with invalid dates gracefully', () => {
    const invalidEvents: CalendarEvent[] = [
      {
        id: 'event-1',
        listingId: 'listing-1',
        startTime: new Date('invalid'),
        endTime: new Date('invalid'),
        title: 'Invalid Event',
        status: 'confirmed',
      } as CalendarEvent,
    ];

    const { result } = renderHook(() =>
      useConflictDetection({ events: invalidEvents, enabled: true })
    );

    // Should not crash and return no conflicts
    expect(result.current.hasAnyConflicts).toBe(false);
  });

  it('should count total conflicts correctly', () => {
    const { result } = renderHook(() =>
      useConflictDetection({ events: mockEvents, enabled: true })
    );

    // Event 1 and Event 2 conflict with each other, so conflictCount should be 2
    expect(result.current.conflictCount).toBe(2);
  });

  it('should return array of conflicting event IDs', () => {
    const { result } = renderHook(() =>
      useConflictDetection({ events: mockEvents, enabled: true })
    );

    expect(result.current.conflictingEventIds).toContain('event-1');
    expect(result.current.conflictingEventIds).toContain('event-2');
    expect(result.current.conflictingEventIds).not.toContain('event-3');
  });

  it('should detect edge-case overlap (one event starts exactly when another ends)', () => {
    const edgeCaseEvents: CalendarEvent[] = [
      {
        id: 'event-1',
        listingId: 'listing-1',
        startTime: new Date('2026-01-14T10:00:00'),
        endTime: new Date('2026-01-14T11:00:00'),
        title: 'Event 1',
        status: 'confirmed',
      } as CalendarEvent,
      {
        id: 'event-2',
        listingId: 'listing-1',
        startTime: new Date('2026-01-14T11:00:00'),
        endTime: new Date('2026-01-14T12:00:00'),
        title: 'Event 2',
        status: 'confirmed',
      } as CalendarEvent,
    ];

    const { result } = renderHook(() =>
      useConflictDetection({ events: edgeCaseEvents, enabled: true })
    );

    // Events that touch at the exact same time should not be considered overlapping
    // because the overlap check is: eventStart < otherEnd && eventEnd > otherStart
    // For event-1: 10:00 < 12:00 (true) && 11:00 > 11:00 (false) => no overlap
    expect(result.current.hasConflict('event-1')).toBe(false);
    expect(result.current.hasConflict('event-2')).toBe(false);
  });

  describe('Buffer Time Detection', () => {
    it('should detect buffer conflicts for events that are close but not overlapping', () => {
      const backToBackEvents: CalendarEvent[] = [
        {
          id: 'event-1',
          listingId: 'listing-1',
          startTime: new Date('2026-01-14T10:00:00'),
          endTime: new Date('2026-01-14T11:00:00'),
          title: 'Event 1',
          status: 'confirmed',
        } as CalendarEvent,
        {
          id: 'event-2',
          listingId: 'listing-1',
          startTime: new Date('2026-01-14T11:00:00'),
          endTime: new Date('2026-01-14T12:00:00'),
          title: 'Event 2',
          status: 'confirmed',
        } as CalendarEvent,
      ];

      // With 15 minutes buffer time, these should conflict
      const { result } = renderHook(() =>
        useConflictDetection({
          events: backToBackEvents,
          enabled: true,
          bufferMinutes: 15,
        })
      );

      expect(result.current.hasConflict('event-1')).toBe(true);
      expect(result.current.hasConflict('event-2')).toBe(true);
    });

    it('should mark conflicts as buffer-only when there is no hard overlap', () => {
      const backToBackEvents: CalendarEvent[] = [
        {
          id: 'event-1',
          listingId: 'listing-1',
          startTime: new Date('2026-01-14T10:00:00'),
          endTime: new Date('2026-01-14T11:00:00'),
          title: 'Event 1',
          status: 'confirmed',
        } as CalendarEvent,
        {
          id: 'event-2',
          listingId: 'listing-1',
          startTime: new Date('2026-01-14T11:00:00'),
          endTime: new Date('2026-01-14T12:00:00'),
          title: 'Event 2',
          status: 'confirmed',
        } as CalendarEvent,
      ];

      const { result } = renderHook(() =>
        useConflictDetection({
          events: backToBackEvents,
          enabled: true,
          bufferMinutes: 15,
        })
      );

      const event1Conflicts = result.current.getConflicts('event-1');
      expect(event1Conflicts?.isBufferOnly).toBe(true);
      expect(event1Conflicts?.conflictingEvents[0]?.isBufferConflict).toBe(true);
    });

    it('should mark conflicts as hard overlap when events directly overlap', () => {
      const overlappingEvents: CalendarEvent[] = [
        {
          id: 'event-1',
          listingId: 'listing-1',
          startTime: new Date('2026-01-14T10:00:00'),
          endTime: new Date('2026-01-14T11:30:00'),
          title: 'Event 1',
          status: 'confirmed',
        } as CalendarEvent,
        {
          id: 'event-2',
          listingId: 'listing-1',
          startTime: new Date('2026-01-14T11:00:00'),
          endTime: new Date('2026-01-14T12:00:00'),
          title: 'Event 2',
          status: 'confirmed',
        } as CalendarEvent,
      ];

      const { result } = renderHook(() =>
        useConflictDetection({
          events: overlappingEvents,
          enabled: true,
          bufferMinutes: 15,
        })
      );

      const event1Conflicts = result.current.getConflicts('event-1');
      expect(event1Conflicts?.isBufferOnly).toBe(false);
      expect(event1Conflicts?.conflictingEvents[0]?.isBufferConflict).toBe(false);
    });

    it('should not detect conflicts when events are outside buffer range', () => {
      const separatedEvents: CalendarEvent[] = [
        {
          id: 'event-1',
          listingId: 'listing-1',
          startTime: new Date('2026-01-14T10:00:00'),
          endTime: new Date('2026-01-14T11:00:00'),
          title: 'Event 1',
          status: 'confirmed',
        } as CalendarEvent,
        {
          id: 'event-2',
          listingId: 'listing-1',
          startTime: new Date('2026-01-14T11:30:00'),
          endTime: new Date('2026-01-14T12:30:00'),
          title: 'Event 2',
          status: 'confirmed',
        } as CalendarEvent,
      ];

      // 15 minute buffer - events are 30 minutes apart, so no conflict
      const { result } = renderHook(() =>
        useConflictDetection({
          events: separatedEvents,
          enabled: true,
          bufferMinutes: 15,
        })
      );

      expect(result.current.hasConflict('event-1')).toBe(false);
      expect(result.current.hasConflict('event-2')).toBe(false);
    });

    it('should work correctly with zero buffer time (default behavior)', () => {
      const backToBackEvents: CalendarEvent[] = [
        {
          id: 'event-1',
          listingId: 'listing-1',
          startTime: new Date('2026-01-14T10:00:00'),
          endTime: new Date('2026-01-14T11:00:00'),
          title: 'Event 1',
          status: 'confirmed',
        } as CalendarEvent,
        {
          id: 'event-2',
          listingId: 'listing-1',
          startTime: new Date('2026-01-14T11:00:00'),
          endTime: new Date('2026-01-14T12:00:00'),
          title: 'Event 2',
          status: 'confirmed',
        } as CalendarEvent,
      ];

      // No buffer time - back-to-back events should not conflict
      const { result } = renderHook(() =>
        useConflictDetection({
          events: backToBackEvents,
          enabled: true,
          bufferMinutes: 0,
        })
      );

      expect(result.current.hasConflict('event-1')).toBe(false);
      expect(result.current.hasConflict('event-2')).toBe(false);
    });

    it('should apply buffer time before and after events', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          listingId: 'listing-1',
          startTime: new Date('2026-01-14T10:00:00'),
          endTime: new Date('2026-01-14T11:00:00'),
          title: 'Event 1',
          status: 'confirmed',
        } as CalendarEvent,
        {
          id: 'event-2',
          listingId: 'listing-1',
          startTime: new Date('2026-01-14T09:50:00'),
          endTime: new Date('2026-01-14T09:55:00'),
          title: 'Event 2 - Before',
          status: 'confirmed',
        } as CalendarEvent,
        {
          id: 'event-3',
          listingId: 'listing-1',
          startTime: new Date('2026-01-14T11:05:00'),
          endTime: new Date('2026-01-14T11:10:00'),
          title: 'Event 3 - After',
          status: 'confirmed',
        } as CalendarEvent,
      ];

      // 10 minute buffer - should conflict with both before and after events
      const { result } = renderHook(() =>
        useConflictDetection({
          events,
          enabled: true,
          bufferMinutes: 10,
        })
      );

      const event1Conflicts = result.current.getConflicts('event-1');
      expect(event1Conflicts?.conflictingEvents).toHaveLength(2);
      expect(event1Conflicts?.conflictingEvents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'event-2', isBufferConflict: true }),
          expect.objectContaining({ id: 'event-3', isBufferConflict: true }),
        ])
      );
    });

    it('should distinguish between buffer and hard overlaps in mixed scenarios', () => {
      const events: CalendarEvent[] = [
        {
          id: 'event-1',
          listingId: 'listing-1',
          startTime: new Date('2026-01-14T10:00:00'),
          endTime: new Date('2026-01-14T11:00:00'),
          title: 'Event 1',
          status: 'confirmed',
        } as CalendarEvent,
        {
          id: 'event-2',
          listingId: 'listing-1',
          startTime: new Date('2026-01-14T10:30:00'),
          endTime: new Date('2026-01-14T11:30:00'),
          title: 'Event 2 - Hard overlap',
          status: 'confirmed',
        } as CalendarEvent,
        {
          id: 'event-3',
          listingId: 'listing-1',
          startTime: new Date('2026-01-14T11:05:00'),
          endTime: new Date('2026-01-14T12:00:00'),
          title: 'Event 3 - Buffer overlap',
          status: 'confirmed',
        } as CalendarEvent,
      ];

      const { result } = renderHook(() =>
        useConflictDetection({
          events,
          enabled: true,
          bufferMinutes: 10,
        })
      );

      const event1Conflicts = result.current.getConflicts('event-1');

      // Event 1 should have conflicts but isBufferOnly should be false
      // because event-2 has a hard overlap
      expect(event1Conflicts?.isBufferOnly).toBe(false);

      // Event 2 should be marked as hard overlap (not buffer conflict)
      const event2Conflict = event1Conflicts?.conflictingEvents.find(c => c.id === 'event-2');
      expect(event2Conflict?.isBufferConflict).toBe(false);

      // Event 3 should be marked as buffer conflict
      const event3Conflict = event1Conflicts?.conflictingEvents.find(c => c.id === 'event-3');
      expect(event3Conflict?.isBufferConflict).toBe(true);
    });
  });
});
