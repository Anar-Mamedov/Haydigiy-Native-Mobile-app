import { Linking } from 'react-native';

/** HaydiGiy WhatsApp destek hattı (E.164, `+` olmadan — wa.me bu biçimi bekler). */
export const WHATSAPP_SUPPORT_PHONE = '905327805100';

/** Aynı numaranın kullanıcıya gösterilen biçimi. */
export const WHATSAPP_SUPPORT_PHONE_DISPLAY = '+90 532 780 51 00';

/** wa.me evrensel bağlantısını kurar; mesaj boşsa `text` parametresi hiç eklenmez. */
export function buildWhatsappUrl(message = '', phone: string = WHATSAPP_SUPPORT_PHONE): string {
  const trimmedMessage = message.trim();
  const query = trimmedMessage ? `?text=${encodeURIComponent(trimmedMessage)}` : '';
  return `https://wa.me/${phone}${query}`;
}

/**
 * WhatsApp'ı açar.
 *
 * **`whatsapp://` özel şeması bilinçli olarak kullanılmıyor.** iOS'ta `canOpenURL` yalnızca
 * Info.plist'teki `LSApplicationQueriesSchemes` listesinde tanımlı şemalar için `true`
 * dönebiliyor; bu listeye hiç tanımlanmadığı için özel şema yolu iPhone'da hiçbir zaman
 * çalışmıyordu ve kontrol zincirinde `catch` olmadığı için buton sessizce ölüyordu.
 *
 * `https://wa.me/...` evrensel bağlantısı uygulama kuruluysa doğrudan WhatsApp'ı, kurulu
 * değilse tarayıcıyı açar; ek bir izin ya da Info.plist kaydı gerektirmez.
 */
export function openWhatsapp(message = '', phone: string = WHATSAPP_SUPPORT_PHONE): Promise<void> {
  return Linking.openURL(buildWhatsappUrl(message, phone)).catch((error) => {
    console.warn('[WhatsApp] Bağlantı açılamadı.', error);
  });
}
