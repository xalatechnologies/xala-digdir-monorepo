/**
 * Storage Hooks
 * React Query hooks for file upload/management
 */

import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { StorageService } from '../services/storage.service';
import { storageKeys } from '../query-keys/storage.keys';
import type {
  UploadFileResponse,
  UploadMultipleFilesResponse,
  ListFilesQuery,
  ListFilesResponse,
  UpdateFileMetadataRequest,
  FileUploadInput,
} from '../types/storage.types';

// Create storage service instance
const storageService = new StorageService();

/**
 * Upload a single file
 * 
 * @example
 * ```tsx
 * const { mutate: uploadFile, isPending } = useUploadFile();
 * 
 * const handleUpload = (file: File) => {
 *   uploadFile({
 *     file,
 *     category: 'rental-object-image',
 *     entityId: rentalObjectId,
 *     altText: 'Main image',
 *   });
 * };
 * ```
 */
export function useUploadFile(): UseMutationResult<UploadFileResponse, Error, FileUploadInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: FileUploadInput) => storageService.uploadFile(input),
    onSuccess: () => {
      // Invalidate file lists
      queryClient.invalidateQueries({ queryKey: storageKeys.lists() });
    },
  });
}

/**
 * Upload multiple files
 * 
 * @example
 * ```tsx
 * const { mutate: uploadFiles } = useUploadMultipleFiles();
 * 
 * const handleUpload = (files: FileList) => {
 *   uploadFiles(Array.from(files));
 * };
 * ```
 */
export function useUploadMultipleFiles(): UseMutationResult<UploadMultipleFilesResponse, Error, File[]> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: File[]) => storageService.uploadMultipleFiles(files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storageKeys.lists() });
    },
  });
}

/**
 * List files with optional filters
 * 
 * @example
 * ```tsx
 * const { data: files } = useListFiles({
 *   entityType: 'rental_object',
 *   entityId: rentalObjectId,
 *   category: 'rental-object-image',
 * });
 * ```
 */
export function useListFiles(
  query: ListFilesQuery = {},
  options?: { enabled?: boolean }
): UseQueryResult<ListFilesResponse, Error> {
  return useQuery({
    queryKey: storageKeys.list(query),
    queryFn: () => storageService.listFiles(query),
    ...options,
  });
}

/**
 * Delete a file
 * 
 * @example
 * ```tsx
 * const { mutate: deleteFile } = useDeleteFile();
 * 
 * const handleDelete = (fileId: string) => {
 *   deleteFile(fileId);
 * };
 * ```
 */
export function useDeleteFile(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => storageService.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storageKeys.lists() });
    },
  });
}

/**
 * Update file metadata (alt text, caption)
 * 
 * @example
 * ```tsx
 * const { mutate: updateFile } = useUpdateFileMetadata();
 * 
 * const handleUpdate = () => {
 *   updateFile({
 *     fileId: 'file-id',
 *     updates: {
 *       altText: 'Updated alt text',
 *       caption: 'New caption',
 *     },
 *   });
 * };
 * ```
 */
export function useUpdateFileMetadata(): UseMutationResult<
  UploadFileResponse,
  Error,
  { fileId: string; updates: UpdateFileMetadataRequest }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, updates }) => storageService.updateFileMetadata(fileId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: storageKeys.detail(variables.fileId) });
      queryClient.invalidateQueries({ queryKey: storageKeys.lists() });
    },
  });
}

/**
 * Helper hook to get absolute file URL from relative path
 * 
 * @example
 * ```tsx
 * const getFileUrl = useFileUrl();
 * 
 * <img src={getFileUrl(rentalObject.primaryImageUrl)} />
 * ```
 */
export function useFileUrl(): (path: string) => string {
  return (path: string) => storageService.getFileUrl(path);
}
