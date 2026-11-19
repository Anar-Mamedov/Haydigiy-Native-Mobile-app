import { useState } from 'react';
import { useAnnouncementPreferencesQuery } from '../api/announcement-preferences.queries';
import { useUpdateAnnouncementPreferencesMutation } from '../api/announcement-preferences.mutations';
import { ANNOUNCEMENT_PREFERENCES_TEXTS, DEFAULT_ANNOUNCEMENT_PREFERENCES } from '../constants/announcement-options';
import { AnnouncementChannel, AnnouncementPreferences } from '../types/announcement-preferences.types';

export type AnnouncementSaveResult = { ok: boolean; message: string };

const CHANNELS: AnnouncementChannel[] = ['email', 'sms', 'phone', 'whatsapp'];

const sameChoices = (a: AnnouncementPreferences, b: AnnouncementPreferences) =>
  CHANNELS.every((channel) => a[channel] === b[channel]);

/**
 * Duyuru tercihleri formu. Web gibi seçimler önce yerelde değişir, "Güncelle"
 * ile birlikte kaydedilir (iyimser güncelleme yok). Kaydedilene kadar yerel
 * taslak tutulur; başarılı kayıttan sonra sunucu değeri esas alınır. `isDirty`,
 * web'deki gibi değişiklik yokken "Güncelle"yi pasif tutmak içindir.
 */
export function useAnnouncementPreferencesForm(enabled: boolean) {
  const query = useAnnouncementPreferencesQuery(enabled);
  const mutation = useUpdateAnnouncementPreferencesMutation();
  const [draft, setDraft] = useState<AnnouncementPreferences | null>(null);

  const saved = query.data ?? DEFAULT_ANNOUNCEMENT_PREFERENCES;
  const values = draft ?? saved;

  const toggle = (channel: AnnouncementChannel) => {
    setDraft({ ...values, [channel]: !values[channel] });
  };

  const save = async (): Promise<AnnouncementSaveResult> => {
    try {
      await mutation.mutateAsync(values);
      setDraft(null);
      return { ok: true, message: ANNOUNCEMENT_PREFERENCES_TEXTS.saveSuccess };
    } catch {
      return { ok: false, message: ANNOUNCEMENT_PREFERENCES_TEXTS.saveError };
    }
  };

  return {
    isDirty: draft !== null && !sameChoices(draft, saved),
    isError: query.isError,
    isLoading: query.isPending,
    isSaving: mutation.isPending,
    refetch: query.refetch,
    save,
    toggle,
    values,
  };
}
