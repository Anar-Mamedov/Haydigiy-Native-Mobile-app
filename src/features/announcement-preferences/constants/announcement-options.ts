import { AnnouncementChannel, AnnouncementPreferences } from '../types/announcement-preferences.types';

export type AnnouncementOption = {
  channel: AnnouncementChannel;
  label: string;
  description: string;
};

/** Web "Duyuru Tercihlerim" sayfasındaki seçenekler ve metinler, aynı sırayla. */
export const ANNOUNCEMENT_OPTIONS: AnnouncementOption[] = [
  {
    channel: 'email',
    label: 'E-mail',
    description: 'İlgimi çekebilecek kampanyalarla ve butik bültenleriyle ilgili e-posta almak istiyorum.',
  },
  {
    channel: 'sms',
    label: 'SMS',
    description: 'İlgimi çekebilecek kampanyalarla ilgili SMS almak istiyorum.',
  },
  {
    channel: 'phone',
    label: 'Telefon Görüşmesi',
    description: 'İlgimi çekebilecek kampanyalarla ilgili çağrı almak istiyorum.',
  },
];

export const DEFAULT_ANNOUNCEMENT_PREFERENCES: AnnouncementPreferences = {
  email: false,
  phone: false,
  sms: false,
};

export const ANNOUNCEMENT_PREFERENCES_TEXTS = {
  saveError: 'Bir hata oluştu. Lütfen tekrar deneyin.',
  saveSuccess: 'Tercihleriniz başarıyla kaydedildi.',
  title: 'Duyuru Tercihlerim',
  updateButton: 'Güncelle',
} as const;
