import { AnnouncementChannel, AnnouncementPreferences, MarketingChannel } from '../types/announcement-preferences.types';

export type AnnouncementOption<C extends AnnouncementChannel = AnnouncementChannel> = {
  channel: C;
  label: string;
  description: string;
};

/** Web "Duyuru Tercihlerim" sayfasındaki kampanya kanalları ve metinleri, aynı sırayla. */
export const ANNOUNCEMENT_OPTIONS: AnnouncementOption<MarketingChannel>[] = [
  {
    channel: 'email',
    label: 'E-mail',
    description: 'İlgimi çekebilecek kampanyalarla ve bültenlerle ilgili e-posta almak istiyorum.',
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

/** Web'deki ayrı WhatsApp bölümü; kayıtta açılmaz, kullanıcı yalnız bu ekrandan açar. */
export const WHATSAPP_OPTION: AnnouncementOption<'whatsapp'> = {
  channel: 'whatsapp',
  label: 'WhatsApp',
  description: 'Harika fırsatlardan yararlan; yeni ürünler ve sana özel tekliflerden haberdar ol.',
};

export const DEFAULT_ANNOUNCEMENT_PREFERENCES: AnnouncementPreferences = {
  email: false,
  phone: false,
  sms: false,
  whatsapp: null,
};

export const ANNOUNCEMENT_PREFERENCES_TEXTS = {
  saveError: 'Bir hata oluştu. Lütfen tekrar deneyin.',
  saveSuccess: 'Tercihleriniz başarıyla kaydedildi.',
  title: 'Duyuru Tercihlerim',
  updateButton: 'Güncelle',
  whatsappSection: 'WhatsApp',
} as const;
