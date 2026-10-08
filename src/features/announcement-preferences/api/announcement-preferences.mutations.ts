import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAnnouncementPreferencesDto } from '@/services/announcement-preferences.service';
import { AnnouncementPreferences } from '../types/announcement-preferences.types';
import { useAnnouncementPreferencesSessionKey } from './announcement-preferences.queries';
import { mapAnnouncementPreferences, toAnnouncementPreferencesPayload } from './announcement-preferences.mapper';

/**
 * Tercihleri kaydeder (`PUT /auth/preferences`). Backend kaydedilen değerleri
 * `data` içinde döndürür; dönmezse gönderilen değerler önbelleğe yazılır.
 */
export function useUpdateAnnouncementPreferencesMutation() {
  const queryClient = useQueryClient();
  const { queryKey } = useAnnouncementPreferencesSessionKey();

  return useMutation({
    mutationFn: (preferences: AnnouncementPreferences) =>
      updateAnnouncementPreferencesDto(toAnnouncementPreferencesPayload(preferences)),
    // Aynı gövdeyi tekrar göndermek bir şey düzeltmez; hata kullanıcıya gösterilir.
    retry: false,
    onSuccess: (response, preferences) => {
      queryClient.setQueryData<AnnouncementPreferences>(
        queryKey,
        response.data ? mapAnnouncementPreferences(response.data) : preferences,
      );
    },
  });
}
