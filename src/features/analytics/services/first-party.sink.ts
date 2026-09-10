import { AnalyticsContext, AnalyticsSink } from './analytics-sink';
import { toFirstPartyEventDto } from './first-party.mapper';
import { AnalyticsEvent } from '../types/analytics.types';
import {
  ANALYTICS_BATCH_LIMIT,
  AnalyticsEventDto,
  postAnalyticsEventsBatchDto,
} from '@/services/analytics.service';

/**
 * HaydiGiy'in kendi collector'ına yazan sink (web `src/lib/analytics.ts`
 * paritesi). Event'ler kuyruklanır ve toplu gönderilir; her dokunuşta bir
 * istek atmak mobil ağda hem pil hem gecikme maliyeti demektir.
 *
 * RN'de `navigator.sendBeacon` yoktur; bu yüzden uygulama arka plana alınırken
 * `flush()` çağrılarak kuyruk boşaltılır (`AnalyticsIntegration`).
 */

/** Web ile aynı: 10 event dolunca hemen gönder. Backend üst sınırı 50. */
export const FIRST_PARTY_BATCH_SIZE = 10;

/** Web ile aynı: kuyruk dolmasa da 5 saniyede bir gönder. */
export const FIRST_PARTY_FLUSH_INTERVAL_MS = 5000;

/**
 * Ağ uzun süre kapalıysa kuyruk sınırsız büyümesin. Sınıra gelince en eski
 * event düşer: analytics uğruna bellek tüketmek doğru bir denge değil.
 */
export const FIRST_PARTY_QUEUE_LIMIT = 200;

export type FirstPartySinkDependencies = {
  send: (events: AnalyticsEventDto[]) => Promise<void>;
  onError: (message: string, error: unknown) => void;
  setTimer: (callback: () => void, delayMs: number) => ReturnType<typeof setTimeout>;
  clearTimer: (timer: ReturnType<typeof setTimeout>) => void;
};

const defaultDependencies: FirstPartySinkDependencies = {
  send: postAnalyticsEventsBatchDto,
  onError: (message, error) => console.warn(message, error),
  setTimer: (callback, delayMs) => setTimeout(callback, delayMs),
  clearTimer: (timer) => clearTimeout(timer),
};

export function createFirstPartySink(
  dependencies: FirstPartySinkDependencies = defaultDependencies,
): AnalyticsSink {
  let queue: AnalyticsEventDto[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;

  function stopTimer(): void {
    if (!timer) return;
    dependencies.clearTimer(timer);
    timer = null;
  }

  function scheduleFlush(): void {
    if (timer) return;
    timer = dependencies.setTimer(() => {
      timer = null;
      void flush();
    }, FIRST_PARTY_FLUSH_INTERVAL_MS);
  }

  async function flush(): Promise<void> {
    stopTimer();
    if (queue.length === 0) return;

    const batch = queue.splice(0, Math.min(ANALYTICS_BATCH_LIMIT, queue.length));

    try {
      await dependencies.send(batch);
    } catch (error) {
      // Kullanıcıya yansıtılmaz ama sessizce de yutulmaz: teşhis log'a düşer.
      dependencies.onError(
        `[Analytics] ${batch.length} event collector'a gönderilemedi.`,
        error,
      );
    }

    // Aynı turda kuyruk yine doluysa (batch limitini aşan birikme) devam et.
    if (queue.length > 0) scheduleFlush();
  }

  return {
    id: 'first-party',
    // Kendi altyapımız ölçüm amaçlıdır; reklam/dönüşüm izni gerektirmez.
    consentCategory: 'analytics',

    isEnabled() {
      // Uç, uygulamanın kendi API tabanında; ayrı bir yapılandırma gerekmez.
      return true;
    },

    track(event: AnalyticsEvent, context: AnalyticsContext) {
      queue.push(toFirstPartyEventDto(event, context));

      if (queue.length > FIRST_PARTY_QUEUE_LIMIT) {
        queue = queue.slice(-FIRST_PARTY_QUEUE_LIMIT);
      }

      if (queue.length >= FIRST_PARTY_BATCH_SIZE) {
        void flush();
        return;
      }

      scheduleFlush();
    },

    flush,

    reset() {
      // Oturum kapanışında bekleyenler eski kimlikle gitmeli; kuyruk atılmaz.
      void flush();
    },
  };
}

export const firstPartySink = createFirstPartySink();
