/**
 * Seasonal Lease Hooks
 * React Query hooks for seasonal/long-term lease management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { seasonalLeaseService } from '@/services/seasonal-lease.service';
import type { SeasonalLeaseQueryParams, CreateSeasonalLeaseDTO, UpdateSeasonalLeaseDTO } from '@/types';

export function useSeasonalLeases(params?: SeasonalLeaseQueryParams) {
  return useQuery({
    queryKey: queryKeys.seasonalLeases.list(params),
    queryFn: () => seasonalLeaseService.getAll(params),
  });
}

export function useSeasonalLease(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.seasonalLeases.detail(id),
    queryFn: () => seasonalLeaseService.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useSeasonalLeasesForSeason(seasonId: string) {
  return useQuery({
    queryKey: queryKeys.seasonalLeases.forSeason(seasonId),
    queryFn: () => seasonalLeaseService.getForSeason(seasonId),
    enabled: !!seasonId,
  });
}

export function useSeasonalLeasesForRentalObject(rentalObjectId: string) {
  return useQuery({
    queryKey: queryKeys.seasonalLeases.forRentalObject(rentalObjectId),
    queryFn: () => seasonalLeaseService.getForRentalObject(rentalObjectId),
    enabled: !!rentalObjectId,
  });
}

export function useMySeasonalLeases() {
  return useQuery({
    queryKey: queryKeys.seasonalLeases.my(),
    queryFn: () => seasonalLeaseService.getMyLeases(),
  });
}

export function useLeasePaymentSchedule(id: string) {
  return useQuery({
    queryKey: queryKeys.seasonalLeases.paymentSchedule(id),
    queryFn: () => seasonalLeaseService.getPaymentSchedule(id),
    enabled: !!id,
  });
}

export function useCreateSeasonalLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSeasonalLeaseDTO) => seasonalLeaseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seasonalLeases.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.seasonalLeases.my() });
    },
  });
}

export function useUpdateSeasonalLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSeasonalLeaseDTO }) => 
      seasonalLeaseService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seasonalLeases.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.seasonalLeases.lists() });
    },
  });
}

export function useCancelSeasonalLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      seasonalLeaseService.cancel(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seasonalLeases.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.seasonalLeases.lists() });
    },
  });
}

export function useRenewSeasonalLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nextSeasonId }: { id: string; nextSeasonId: string }) => 
      seasonalLeaseService.renew(id, { nextSeasonId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seasonalLeases.all });
    },
  });
}

export function useRecordLeasePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof seasonalLeaseService.recordPayment>[1] }) => 
      seasonalLeaseService.recordPayment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seasonalLeases.paymentSchedule(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.seasonalLeases.detail(variables.id) });
    },
  });
}

export function useTerminateSeasonalLease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: { terminationDate: string; reason: string } 
    }) => seasonalLeaseService.terminate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seasonalLeases.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.seasonalLeases.lists() });
    },
  });
}

export function useUploadSignedContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => 
      seasonalLeaseService.uploadSignedContract(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seasonalLeases.detail(variables.id) });
    },
  });
}
