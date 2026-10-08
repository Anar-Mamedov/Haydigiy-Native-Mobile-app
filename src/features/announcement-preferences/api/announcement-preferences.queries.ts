import { useQuery } from '@tanstack/react-query';
import { getAnnouncementPreferencesDto } from '@/services/announcement-preferences.service';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { AnnouncementPreferences } from '../types/announcement-preferences.types';
import { announcementPreferenceKeys } from './announcement-preferences.keys';
import { mapAnnouncementPreferences } from './announcement-preferences.mapper';

/** Oturumdaki kullanıcının anahtarı; mutasyon da aynı önbelleği günceller. */
export function useAnnouncementPreferencesSessionKey() {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  return {
    userId,
    queryKey: announcementPreferenceKeys.session(userId === null ? 'signed-out' : String(userId)),
  };
}

/** Kayıtlı duyuru tercihleri (`GET /auth/preferences`). */
export function useAnnouncementPreferencesQuery(enabled = true) {
  const { userId, queryKey } = useAnnouncementPreferencesSessionKey();

  return useQuery<AnnouncementPreferences>({
    queryKey,
    enabled: enabled && userId !== null,
    queryFn: async () => mapAnnouncementPreferences(await getAnnouncementPreferencesDto()),
  });
}
