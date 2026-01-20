/**
 * AI Seed Generator Hooks
 * React Query hooks for AI-powered demo data generation
 * Used by saas-admin AI Seed Generator page
 */

import { useMutation } from '@tanstack/react-query';
import {
  aiSeedService,
  type GenerateSeedRequest,
  type EntityType,
} from '@/services/ai-seed.service';

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Generate seed data
 */
export function useGenerateSeed() {
  return useMutation({
    mutationFn: (data: GenerateSeedRequest) => aiSeedService.generate(data),
  });
}

/**
 * Generate rental objects
 */
export function useGenerateRentalObjects() {
  return useMutation({
    mutationFn: ({ tenantId, count }: { tenantId: string; count: number }) =>
      aiSeedService.generateRentalObjects(tenantId, count),
  });
}

/**
 * Generate users
 */
export function useGenerateUsers() {
  return useMutation({
    mutationFn: ({ tenantId, count }: { tenantId: string; count: number }) =>
      aiSeedService.generateUsers(tenantId, count),
  });
}

/**
 * Generate organizations
 */
export function useGenerateOrganizations() {
  return useMutation({
    mutationFn: ({ tenantId, count }: { tenantId: string; count: number }) =>
      aiSeedService.generateOrganizations(tenantId, count),
  });
}

/**
 * Generate bookings
 */
export function useGenerateBookings() {
  return useMutation({
    mutationFn: ({ tenantId, count }: { tenantId: string; count: number }) =>
      aiSeedService.generateBookings(tenantId, count),
  });
}

/**
 * Generate reviews
 */
export function useGenerateReviews() {
  return useMutation({
    mutationFn: ({ tenantId, count }: { tenantId: string; count: number }) =>
      aiSeedService.generateReviews(tenantId, count),
  });
}

// Re-export types for convenience
export type { EntityType, GenerateSeedRequest };
