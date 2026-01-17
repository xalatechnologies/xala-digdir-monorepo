/**
 * Storage Hooks
 * React Query hooks for file upload/management
 */

import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { useSDK } from '../providers/SDKProvider';
import { storageKeys } from '../query-keys/storage.keys';
import type {
  UploadFileResponse,
  UploadMultipleFilesResponse,
  ListFilesQuery,
  ListFilesResponse,
  UpdateFileMetadataRequest,
  FileUploadInput,
} from '@xala/contracts/storage';

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
  const { storage } = useSDK();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: FileUploadInput) => storage.uploadFile(input),
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
  const { storage } = useSDK();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: File[]) => storage.uploadMultipleFiles(files),
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
  const { storage } = useSDK();

  return useQuery({
    queryKey: storageKeys.list(query),
    queryFn: () => storage.listFiles(query),
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
  const { storage } = useSDK();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => storage.deleteFile(fileId),
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
  const { storage } = useSDK();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, updates }) => storage.updateFileMetadata(fileId, updates),
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
  const { storage } = useSDK();
  return (path: string) => storage.getFileUrl(path);
}
