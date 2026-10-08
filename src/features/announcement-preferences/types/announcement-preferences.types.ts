/** Web'deki üç duyuru kanalı: e-posta, SMS ve telefon görüşmesi. */
export type AnnouncementChannel = 'email' | 'sms' | 'phone';

export type AnnouncementPreferences = Record<AnnouncementChannel, boolean>;
