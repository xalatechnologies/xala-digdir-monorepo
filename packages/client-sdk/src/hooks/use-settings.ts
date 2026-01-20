/**
 * Settings Hooks
 * React Query hooks for application settings management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { settingsService } from '@/services/settings.service';
import type { UpdateSettingsDTO, SettingCategory } from '@/types';

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings.all,
    queryFn: () => settingsService.getAll(),
  });
}

export function useSettingsByCategory(category: SettingCategory) {
  return useQuery({
    queryKey: queryKeys.settings.category(category),
    queryFn: () => settingsService.getByCategory(category),
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: queryKeys.settings.notifications(),
    queryFn: () => settingsService.getNotificationSettings(),
  });
}

export function usePrivacySettings() {
  return useQuery({
    queryKey: queryKeys.settings.privacy(),
    queryFn: () => settingsService.getPrivacySettings(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSettingsDTO) => settingsService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) => 
      settingsService.updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: Parameters<typeof settingsService.updateNotificationSettings>[0]) => 
      settingsService.updateNotificationSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.notifications() });
    },
  });
}

export function useResetSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category?: SettingCategory) => settingsService.reset(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
    },
  });
}
