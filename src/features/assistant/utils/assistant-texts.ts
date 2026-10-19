import type { AssistantTexts } from '@/types/assistant.types';

/**
 * Pencere yazıları sunucudan gelir (`/config` → `texts`, Dash "Sabit Metinler").
 * Buradaki değerler yalnız sunucu bir anahtarı GÖNDERMEDİĞİNDE kullanılan, teslim belgesindeki
 * (README §4.1) örnek değerlerdir. Sunucu gönderiyorsa her zaman sunucununki geçerlidir.
 */
export const DEFAULT_ASSISTANT_TEXTS: AssistantTexts = {
  launcher_label: 'Haydi Asistan',
  title: 'Haydi Asistan',
  subtitle: 'Sanal asistan',
  input_placeholder: 'Mesajınızı yazın…',
  send_label: 'Gönder',
  close_label: 'Kapat',
  open_label: "Haydi Asistan'ı aç",
  typing: 'Yazıyor…',
  send_failed: 'Gönderilemedi',
  retry: 'Tekrar dene',
  copy_number: 'Kopyala',
  copied: 'Kopyalandı ✓',
  live_copy_hint: 'WhatsApp açılmadıysa:',
  live_copy_button: 'Mesajı kopyala',
  live_number_label: 'Numara:',
  video_label: 'Mesajla gelen video',
  breadcrumb_label: 'Konum',
  image_failed: 'Görsel yüklenemedi',
  video_failed: 'Video yüklenemedi',
  offline: 'İnternet bağlantınızı kontrol edin',
  new_messages: 'Yeni mesaj ↓',
  more_items: '+{n} ürün daha',
  minimize_label: 'Küçült',
  tracking_label: 'Takip no',
};

const TEXT_KEYS = Object.keys(DEFAULT_ASSISTANT_TEXTS) as (keyof AssistantTexts)[];

/** Sunucunun gönderdiği dolu dizgileri alır, eksik/bozuk anahtar için yedeği kullanır. */
export const resolveAssistantTexts = (raw: unknown): AssistantTexts => {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const resolved = { ...DEFAULT_ASSISTANT_TEXTS };
  for (const key of TEXT_KEYS) {
    const value = source[key];
    if (typeof value === 'string' && value.trim().length > 0) resolved[key] = value;
  }
  return resolved;
};

/** "+{n} ürün daha" gibi tek yer tutuculu yazılar; yer tutucu yoksa metin olduğu gibi kalır. */
export const fillCount = (template: string, count: number): string => template.replace('{n}', String(count));
