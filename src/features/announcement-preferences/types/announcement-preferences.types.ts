/** Kayıtta "elektronik ileti" onayıyla birlikte açılan üç kanal: e-posta, SMS ve telefon görüşmesi. */
export type MarketingChannel = 'email' | 'sms' | 'phone';

/** WhatsApp ayrı bir bölümde gösterilir ve kayıtta açılmaz (web HF-63). */
export type AnnouncementChannel = MarketingChannel | 'whatsapp';

/**
 * `whatsapp` backend `notify_whatsapp` döndürmüyorsa `null`dır: seçenek gösterilmez ve
 * gönderilmez; alanı henüz tanımayan backend'de kaydedilemeyen bir anahtar çıkmaz.
 */
export type AnnouncementPreferences = Record<MarketingChannel, boolean> & { whatsapp: boolean | null };
