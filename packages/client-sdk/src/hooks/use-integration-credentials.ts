/**
 * Integration Credentials Hooks
 * 
 * React Query hooks for managing encrypted integration credentials.
 * Super admin only - requires elevated privileges.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IntegrationCredentialsService,
  type CredentialInfo,
  type CreateCredentialInput,
  type UpdateCredentialInput,
} from '@/services/integration-credentials.service';

const credentialsService = new IntegrationCredentialsService();

/**
 * Query key factory for integration credentials
 */
export const CREDENTIAL_KEYS = {
  all: ['integration-credentials'] as const,
  lists: () => [...CREDENTIAL_KEYS.all, 'list'] as const,
  list: (integrationId: string) => [...CREDENTIAL_KEYS.lists(), integrationId] as const,
  details: () => [...CREDENTIAL_KEYS.all, 'detail'] as const,
  detail: (integrationId: string, credentialId: string) => 
    [...CREDENTIAL_KEYS.details(), integrationId, credentialId] as const,
  types: () => [...CREDENTIAL_KEYS.all, 'types'] as const,
  providers: () => [...CREDENTIAL_KEYS.all, 'providers'] as const,
};

/**
 * Hook to list all credentials for an integration
 */
export function useIntegrationCredentials(integrationId: string) {
  return useQuery({
    queryKey: CREDENTIAL_KEYS.list(integrationId),
    queryFn: () => credentialsService.listCredentials(integrationId),
    enabled: !!integrationId,
  });
}

/**
 * Hook to get a specific credential
 */
export function useIntegrationCredential(integrationId: string, credentialId: string) {
  return useQuery({
    queryKey: CREDENTIAL_KEYS.detail(integrationId, credentialId),
    queryFn: () => credentialsService.getCredential(integrationId, credentialId),
    enabled: !!integrationId && !!credentialId,
  });
}

/**
 * Hook to get decrypted credential value
 * Use sparingly - this is logged for audit purposes
 */
export function useCredentialValue(
  integrationId: string,
  credentialId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...CREDENTIAL_KEYS.detail(integrationId, credentialId), 'value'] as const,
    queryFn: () => credentialsService.getCredentialValue(integrationId, credentialId),
    enabled: options?.enabled ?? false, // Disabled by default - must be explicitly enabled
    staleTime: 0, // Always fetch fresh
    gcTime: 0, // Don't cache
  });
}

/**
 * Hook to create a new credential
 */
export function useCreateCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      integrationId,
      input,
    }: {
      integrationId: string;
      input: CreateCredentialInput;
    }) => credentialsService.createCredential(integrationId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: CREDENTIAL_KEYS.list(variables.integrationId),
      });
    },
  });
}

/**
 * Hook to update a credential
 */
export function useUpdateCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      integrationId,
      credentialId,
      input,
    }: {
      integrationId: string;
      credentialId: string;
      input: UpdateCredentialInput;
    }) => credentialsService.updateCredential(integrationId, credentialId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: CREDENTIAL_KEYS.list(variables.integrationId),
      });
      queryClient.invalidateQueries({
        queryKey: CREDENTIAL_KEYS.detail(variables.integrationId, variables.credentialId),
      });
    },
  });
}

/**
 * Hook to delete a credential
 */
export function useDeleteCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      integrationId,
      credentialId,
    }: {
      integrationId: string;
      credentialId: string;
    }) => credentialsService.deleteCredential(integrationId, credentialId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: CREDENTIAL_KEYS.list(variables.integrationId),
      });
    },
  });
}

/**
 * Hook to rotate a credential with a new value
 */
export function useRotateCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      integrationId,
      credentialId,
      newValue,
    }: {
      integrationId: string;
      credentialId: string;
      newValue: string;
    }) => credentialsService.rotateCredential(integrationId, credentialId, newValue),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: CREDENTIAL_KEYS.list(variables.integrationId),
      });
      queryClient.invalidateQueries({
        queryKey: CREDENTIAL_KEYS.detail(variables.integrationId, variables.credentialId),
      });
    },
  });
}

/**
 * Hook to get available credential types
 */
export function useCredentialTypes() {
  return useQuery({
    queryKey: CREDENTIAL_KEYS.types(),
    queryFn: () => credentialsService.getCredentialTypes(),
    staleTime: Infinity, // Credential types don't change
  });
}

/**
 * Hook to get available integration providers
 */
export function useIntegrationProviders() {
  return useQuery({
    queryKey: CREDENTIAL_KEYS.providers(),
    queryFn: () => credentialsService.getProviders(),
    staleTime: Infinity, // Providers don't change
  });
}

// Re-export types
export type { CredentialInfo, CreateCredentialInput, UpdateCredentialInput };
