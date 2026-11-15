import { postAssistantEvents } from '@/services/assistant.service';
import type { AssistantEvent, AssistantEventType } from '@/types/assistant.types';
import { getActiveAssistantSession } from '../store/use-assistant-store';

/**
 * Ölçüm olayları (README §4.6). Yalnız izinli alanlar gider: type, at, block_id, kind, code.
 * Metin/ad/telefon ASLA gönderilmez. Kısa pencerede biriken olaylar tek istekte (≤20) gider;
 * oturum henüz yoksa kısa bir süre bekler, ~30 sn içinde açılmazsa bırakılır (akışı asla bekletmez).
 */
const MAX_BATCH = 20;
const FLUSH_DELAY_MS = 400;
const WAIT_DELAY_MS = 2000;
const MAX_WAIT_ATTEMPTS = 15;

const queue: AssistantEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let waitAttempts = 0;

const schedule = (delay: number) => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(flushAssistantEvents, delay);
};

/** Kuyruğu gönderir; dönen söz tüm parti istekleri bitince (başarı ya da hata) çözülür, asla reddedilmez. */
export function flushAssistantEvents(): Promise<void> {
  if (timer) clearTimeout(timer);
  timer = null;
  if (queue.length === 0) return Promise.resolve();
  const token = getActiveAssistantSession()?.token;
  if (!token) {
    waitAttempts += 1;
    if (waitAttempts <= MAX_WAIT_ATTEMPTS) schedule(WAIT_DELAY_MS);
    else queue.length = 0;
    return Promise.resolve();
  }
  waitAttempts = 0;
  const batch = queue.splice(0, queue.length);
  const sends: Promise<void>[] = [];
  for (let start = 0; start < batch.length; start += MAX_BATCH) {
    sends.push(postAssistantEvents(token, batch.slice(start, start + MAX_BATCH)));
  }
  return Promise.all(sends).then(() => undefined);
}

export function trackAssistantEvent(
  type: AssistantEventType,
  details: { blockId?: string; kind?: string; code?: string } = {},
  options: { flushNow?: boolean } = {},
): void {
  const event: AssistantEvent = { type, at: new Date().toISOString() };
  if (details.blockId) event.block_id = details.blockId.slice(0, 64);
  if (details.kind) event.kind = details.kind.slice(0, 32);
  if (details.code) event.code = details.code.slice(0, 32);
  queue.push(event);
  if (options.flushNow) void flushAssistantEvents();
  else if (!timer) schedule(FLUSH_DELAY_MS);
}

/**
 * Olayı kuyruğa ekleyip bekleyenlerle birlikte HEMEN gönderir; istek bitince (başarı ya da hata) çözülür.
 * Token o anki oturumdan okunur, bu yüzden oturum silinmeden ÖNCE çağrılmalıdır.
 */
export function flushAssistantEventNow(type: AssistantEventType): Promise<void> {
  queue.push({ type, at: new Date().toISOString() });
  return flushAssistantEvents();
}

export const trackAssistantClientError = (code: string, blockId?: string): void =>
  trackAssistantEvent('client_error', { code, blockId });
