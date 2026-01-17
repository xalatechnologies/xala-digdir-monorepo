/**
 * Calendar Contracts Hooks
 * React Query hooks for calendar and blocks management
 * 
 * Reference: packages/client-sdk/src/types/booking-contracts.ts
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BaseService } from '../services/base.service';

// =============================================================================
// Services
// =============================================================================

class CalendarContractsService extends BaseService {
  constructor() {
    super('/api/calendar');
  }

  async getCalendar(rentalObjectId: string, view: string, startDate: string, endDate: string) {
    return this.get(`/rental-objects/${rentalObjectId}`, {
      params: { view, startDate, endDate },
    });
  }
}

class BlocksService extends BaseService {
  constructor() {
    super('/api/blocks');
  }

  async createBlock(request: any) {
    return this.post('', request);
  }

  async listBlocks(rentalObjectId: string, startDate: string, endDate: string) {
    return this.get('', {
      params: { rentalObjectId, startDate, endDate },
    });
  }

  async deleteBlock(blockId: string) {
    return this.delete(`/${blockId}`);
  }
}

const calendarService = new CalendarContractsService();
const blocksService = new BlocksService();

// =============================================================================
// Query Keys
// =============================================================================

export const calendarContractsKeys = {
  all: ['calendar-contracts'] as const,
  calendar: (rentalObjectId: string, view: string, startDate: string, endDate: string) =>
    [...calendarContractsKeys.all, 'calendar', rentalObjectId, view, startDate, endDate] as const,
  blocks: (rentalObjectId: string, startDate: string, endDate: string) =>
    [...calendarContractsKeys.all, 'blocks', rentalObjectId, startDate, endDate] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Get calendar data with availability status
 */
export function useCalendar(
  rentalObjectId: string,
  view: string,
  startDate: string,
  endDate: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: calendarContractsKeys.calendar(rentalObjectId, view, startDate, endDate),
    queryFn: () => calendarService.getCalendar(rentalObjectId, view, startDate, endDate),
    enabled: options?.enabled !== false && !!rentalObjectId,
  });
}

/**
 * List blocks for rental object
 */
export function useBlocks(
  rentalObjectId: string,
  startDate: string,
  endDate: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: calendarContractsKeys.blocks(rentalObjectId, startDate, endDate),
    queryFn: () => blocksService.listBlocks(rentalObjectId, startDate, endDate),
    enabled: options?.enabled !== false && !!rentalObjectId,
  });
}

/**
 * Create a block
 */
export function useCreateBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: any) => blocksService.createBlock(request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: calendarContractsKeys.blocks(
          variables.rentalObjectId,
          variables.startDate,
          variables.endDate
        ),
      });
      queryClient.invalidateQueries({
        queryKey: calendarContractsKeys.calendar(
          variables.rentalObjectId,
          'WEEK',
          variables.startDate,
          variables.endDate
        ),
      });
    },
  });
}

/**
 * Delete a block
 */
export function useDeleteBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blockId: string) => blocksService.deleteBlock(blockId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarContractsKeys.all });
    },
  });
}
