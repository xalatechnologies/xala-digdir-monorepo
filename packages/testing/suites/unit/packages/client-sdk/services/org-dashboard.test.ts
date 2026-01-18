/**
 * Org Dashboard Service Tests
 * Tests for OrgDashboardService methods
 * Target: 95%+ coverage
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the client factory
vi.mock('../../core/client-factory', () => ({
  getClient: vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  })),
}));

import { getClient } from '../../core/client-factory';
import { orgDashboardService } from '../../services/org-dashboard.service';
import type {
  OrgDashboardStatsDTO,
  OrgPendingItemDTO,
  CalendarPreviewDTO,
  OrgAlertDTO,
  AssignedRentalObjectDTO,
  PaginatedResponse,
} from '../../types/org-dashboard';

describe('OrgDashboardService', () => {
  const mockClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getClient as any).mockReturnValue(mockClient);
  });

  // ===========================================================================
  // getStats
  // ===========================================================================
  describe('getStats', () => {
    it('should call correct endpoint', async () => {
      const mockResponse: { data: OrgDashboardStatsDTO } = {
        data: {
          assignedRentalObjects: 5,
          pendingBookings: 3,
          confirmedBookings: 10,
          todayBookings: 2,
          weekBookings: 15,
          activeBlocks: 1,
          monthRevenue: 25000,
        },
      };
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await orgDashboardService.getStats();

      expect(mockClient.get).toHaveBeenCalledWith('/api/org-dashboard/stats');
      expect(result).toEqual(mockResponse);
    });

    it('should return stats data with all fields', async () => {
      const mockResponse: { data: OrgDashboardStatsDTO } = {
        data: {
          assignedRentalObjects: 10,
          pendingBookings: 5,
          confirmedBookings: 20,
          todayBookings: 4,
          weekBookings: 30,
          activeBlocks: 2,
          monthRevenue: 50000,
        },
      };
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await orgDashboardService.getStats();

      expect(result.data.assignedRentalObjects).toBe(10);
      expect(result.data.pendingBookings).toBe(5);
      expect(result.data.confirmedBookings).toBe(20);
      expect(result.data.todayBookings).toBe(4);
      expect(result.data.weekBookings).toBe(30);
      expect(result.data.activeBlocks).toBe(2);
      expect(result.data.monthRevenue).toBe(50000);
    });
  });

  // ===========================================================================
  // getPendingItems
  // ===========================================================================
  describe('getPendingItems', () => {
    it('should call correct endpoint without params', async () => {
      const mockResponse: PaginatedResponse<OrgPendingItemDTO> = {
        data: [],
        meta: { total: 0, limit: 20, offset: 0 },
      };
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await orgDashboardService.getPendingItems();

      expect(mockClient.get).toHaveBeenCalledWith('/api/org-dashboard/pending-items');
      expect(result).toEqual(mockResponse);
    });

    it('should include limit in query params', async () => {
      const mockResponse: PaginatedResponse<OrgPendingItemDTO> = {
        data: [],
        meta: { total: 0, limit: 10, offset: 0 },
      };
      mockClient.get.mockResolvedValue(mockResponse);

      await orgDashboardService.getPendingItems({ limit: 10 });

      expect(mockClient.get).toHaveBeenCalledWith('/api/org-dashboard/pending-items?limit=10');
    });

    it('should include offset in query params', async () => {
      const mockResponse: PaginatedResponse<OrgPendingItemDTO> = {
        data: [],
        meta: { total: 0, limit: 20, offset: 20 },
      };
      mockClient.get.mockResolvedValue(mockResponse);

      await orgDashboardService.getPendingItems({ offset: 20 });

      expect(mockClient.get).toHaveBeenCalledWith('/api/org-dashboard/pending-items?offset=20');
    });

    it('should include both limit and offset in query params', async () => {
      const mockResponse: PaginatedResponse<OrgPendingItemDTO> = {
        data: [],
        meta: { total: 50, limit: 10, offset: 20 },
      };
      mockClient.get.mockResolvedValue(mockResponse);

      await orgDashboardService.getPendingItems({ limit: 10, offset: 20 });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/api/org-dashboard/pending-items?limit=10&offset=20'
      );
    });

    it('should return paginated pending items', async () => {
      const mockPendingItem: OrgPendingItemDTO = {
        id: 'booking-1',
        rentalObjectId: 'rental-1',
        rentalObjectName: 'Conference Room A',
        userId: 'user-1',
        userName: 'John Doe',
        startTime: '2026-01-20T09:00:00Z',
        endTime: '2026-01-20T12:00:00Z',
        status: 'pending',
        totalPrice: 1500,
        notes: 'Team meeting',
        createdAt: '2026-01-17T10:00:00Z',
      };
      const mockResponse: PaginatedResponse<OrgPendingItemDTO> = {
        data: [mockPendingItem],
        meta: { total: 1, limit: 20, offset: 0 },
      };
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await orgDashboardService.getPendingItems();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('booking-1');
      expect(result.data[0].rentalObjectName).toBe('Conference Room A');
      expect(result.meta.total).toBe(1);
    });
  });

  // ===========================================================================
  // getCalendarPreview
  // ===========================================================================
  describe('getCalendarPreview', () => {
    it('should call correct endpoint without params', async () => {
      const mockResponse: { data: CalendarPreviewDTO } = {
        data: {
          bookings: [],
          blocks: [],
          rentalObjects: [],
          dateRange: { start: '2026-01-17', end: '2026-01-23' },
        },
      };
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await orgDashboardService.getCalendarPreview();

      expect(mockClient.get).toHaveBeenCalledWith('/api/org-dashboard/calendar-preview');
      expect(result).toEqual(mockResponse);
    });

    it('should include range in query params', async () => {
      const mockResponse: { data: CalendarPreviewDTO } = {
        data: {
          bookings: [],
          blocks: [],
          rentalObjects: [],
          dateRange: { start: '2026-01-17', end: '2026-01-23' },
        },
      };
      mockClient.get.mockResolvedValue(mockResponse);

      await orgDashboardService.getCalendarPreview({ range: 'week' });

      expect(mockClient.get).toHaveBeenCalledWith('/api/org-dashboard/calendar-preview?range=week');
    });

    it('should include startDate in query params', async () => {
      const mockResponse: { data: CalendarPreviewDTO } = {
        data: {
          bookings: [],
          blocks: [],
          rentalObjects: [],
          dateRange: { start: '2026-01-20', end: '2026-01-26' },
        },
      };
      mockClient.get.mockResolvedValue(mockResponse);

      await orgDashboardService.getCalendarPreview({ startDate: '2026-01-20' });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/api/org-dashboard/calendar-preview?startDate=2026-01-20'
      );
    });

    it('should include endDate in query params', async () => {
      const mockResponse: { data: CalendarPreviewDTO } = {
        data: {
          bookings: [],
          blocks: [],
          rentalObjects: [],
          dateRange: { start: '2026-01-17', end: '2026-01-31' },
        },
      };
      mockClient.get.mockResolvedValue(mockResponse);

      await orgDashboardService.getCalendarPreview({ endDate: '2026-01-31' });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/api/org-dashboard/calendar-preview?endDate=2026-01-31'
      );
    });

    it('should include all params in query params', async () => {
      const mockResponse: { data: CalendarPreviewDTO } = {
        data: {
          bookings: [],
          blocks: [],
          rentalObjects: [],
          dateRange: { start: '2026-01-01', end: '2026-01-31' },
        },
      };
      mockClient.get.mockResolvedValue(mockResponse);

      await orgDashboardService.getCalendarPreview({
        range: 'month',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        '/api/org-dashboard/calendar-preview?range=month&startDate=2026-01-01&endDate=2026-01-31'
      );
    });

    it('should return calendar preview with bookings and blocks', async () => {
      const mockResponse: { data: CalendarPreviewDTO } = {
        data: {
          bookings: [
            {
              id: 'booking-1',
              rentalObjectId: 'rental-1',
              rentalObjectName: 'Conference Room A',
              userId: 'user-1',
              userName: 'John Doe',
              startTime: '2026-01-20T09:00:00Z',
              endTime: '2026-01-20T12:00:00Z',
              status: 'confirmed',
            },
          ],
          blocks: [
            {
              id: 'block-1',
              rentalObjectId: 'rental-1',
              rentalObjectName: 'Conference Room A',
              title: 'Maintenance',
              reason: 'Scheduled maintenance',
              startDate: '2026-01-21T00:00:00Z',
              endDate: '2026-01-21T23:59:59Z',
              allDay: true,
              status: 'active',
            },
          ],
          rentalObjects: [
            {
              id: 'rental-1',
              name: 'Conference Room A',
              slug: 'conference-room-a',
              categoryKey: 'meeting-room',
              timeMode: 'hourly',
              status: 'active',
              capacity: 20,
            },
          ],
          dateRange: { start: '2026-01-17', end: '2026-01-23' },
        },
      };
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await orgDashboardService.getCalendarPreview({ range: 'week' });

      expect(result.data.bookings).toHaveLength(1);
      expect(result.data.blocks).toHaveLength(1);
      expect(result.data.rentalObjects).toHaveLength(1);
      expect(result.data.bookings[0].id).toBe('booking-1');
      expect(result.data.blocks[0].title).toBe('Maintenance');
    });
  });

  // ===========================================================================
  // getAlerts
  // ===========================================================================
  describe('getAlerts', () => {
    it('should call correct endpoint', async () => {
      const mockResponse: { data: OrgAlertDTO[] } = { data: [] };
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await orgDashboardService.getAlerts();

      expect(mockClient.get).toHaveBeenCalledWith('/api/org-dashboard/alerts');
      expect(result).toEqual(mockResponse);
    });

    it('should return alerts with all fields', async () => {
      const mockAlerts: OrgAlertDTO[] = [
        {
          id: 'alert-1',
          type: 'warning',
          title: 'Booking conflict detected',
          description: 'Two overlapping bookings found',
          resourceType: 'booking',
          resourceId: 'booking-123',
          createdAt: '2026-01-17T10:00:00Z',
        },
        {
          id: 'alert-2',
          type: 'info',
          title: 'New booking request',
          description: 'Pending approval',
          resourceType: 'booking',
          createdAt: '2026-01-17T11:00:00Z',
        },
        {
          id: 'alert-3',
          type: 'danger',
          title: 'Block expired',
          description: 'Active block has ended',
          resourceType: 'block',
          resourceId: 'block-456',
          createdAt: '2026-01-17T12:00:00Z',
        },
      ];
      const mockResponse: { data: OrgAlertDTO[] } = { data: mockAlerts };
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await orgDashboardService.getAlerts();

      expect(result.data).toHaveLength(3);
      expect(result.data[0].type).toBe('warning');
      expect(result.data[1].type).toBe('info');
      expect(result.data[2].type).toBe('danger');
    });
  });

  // ===========================================================================
  // getAssignedRentalObjects
  // ===========================================================================
  describe('getAssignedRentalObjects', () => {
    it('should call correct endpoint', async () => {
      const mockResponse: { data: AssignedRentalObjectDTO[] } = { data: [] };
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await orgDashboardService.getAssignedRentalObjects();

      expect(mockClient.get).toHaveBeenCalledWith('/api/org-dashboard/assigned-rental-objects');
      expect(result).toEqual(mockResponse);
    });

    it('should return assigned rental objects with all fields', async () => {
      const mockRentalObjects: AssignedRentalObjectDTO[] = [
        {
          id: 'rental-1',
          name: 'Conference Room A',
          slug: 'conference-room-a',
          categoryKey: 'meeting-room',
          timeMode: 'hourly',
          status: 'active',
          capacity: 20,
        },
        {
          id: 'rental-2',
          name: 'Gym Hall',
          slug: 'gym-hall',
          categoryKey: 'sports-facility',
          timeMode: 'daily',
          status: 'active',
          capacity: 100,
        },
      ];
      const mockResponse: { data: AssignedRentalObjectDTO[] } = { data: mockRentalObjects };
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await orgDashboardService.getAssignedRentalObjects();

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Conference Room A');
      expect(result.data[0].timeMode).toBe('hourly');
      expect(result.data[1].name).toBe('Gym Hall');
      expect(result.data[1].timeMode).toBe('daily');
    });

    it('should handle rental objects without optional capacity', async () => {
      const mockRentalObjects: AssignedRentalObjectDTO[] = [
        {
          id: 'rental-1',
          name: 'Outdoor Field',
          slug: 'outdoor-field',
          categoryKey: 'sports-facility',
          timeMode: 'hourly',
          status: 'active',
        },
      ];
      const mockResponse: { data: AssignedRentalObjectDTO[] } = { data: mockRentalObjects };
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await orgDashboardService.getAssignedRentalObjects();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].capacity).toBeUndefined();
    });
  });
});
