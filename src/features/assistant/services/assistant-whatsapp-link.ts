import { Linking } from 'react-native';
import { trackAssistantEvent } from './assistant-events';

/**
 * Doğrulanmış wa.me adresini açar; `live_support_click` olayı açmadan önce hemen gönderilir
 * (uygulama arka plana geçince kuyruk bekleyebilir). Canlı Destek bloğu ve WhatsApp kategorisi
 * düğmesi (web `c25e8d8e0`, `kind: 'whatsapp'`) aynı yolu kullanır. Adres DEĞİŞTİRİLMEZ.
 */
export function openAssistantWhatsapp(href: string, details: { blockId?: string; kind?: string } = {}): void {
  trackAssistantEvent('live_support_click', details, { flushNow: true });
  Linking.openURL(href).catch(() => undefined);
}
