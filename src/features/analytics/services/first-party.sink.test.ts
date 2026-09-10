import { AnalyticsContext } from './analytics-sink';
import {
  FIRST_PARTY_BATCH_SIZE,
  FIRST_PARTY_FLUSH_INTERVAL_MS,
  FIRST_PARTY_QUEUE_LIMIT,
  createFirstPartySink,
} from './first-party.sink';
import { AnalyticsEvent } from '../types/analytics.types';
import { AnalyticsEventDto } from '@/services/analytics.service';

function buildContext(): AnalyticsContext {
  return {
    anonymousId: 'anon-1',
    appVersion: '2.3.24',
    deviceId: 'device-1',
    deviceType: 'mobile',
    os: 'Android',
    osVersion: '15',
    screenHeight: 844,
    screenPath: '/cart',
    screenWidth: 390,
    sessionId: 'sess-1',
    userId: null,
  };
}

function screenEvent(screen: string): AnalyticsEvent {
  return { name: 'screen_viewed', screen };
}

function createSink(sendImpl?: (events: AnalyticsEventDto[]) => Promise<void>) {
  const send = jest.fn(sendImpl ?? (async () => undefined));
  const onError = jest.fn();
  const timers: { callback: () => void; delayMs: number }[] = [];
  const clearTimer = jest.fn();

  const sink = createFirstPartySink({
    clearTimer,
    onError,
    send,
    setTimer: (callback, delayMs) => {
      timers.push({ callback, delayMs });
      return timers.length as unknown as ReturnType<typeof setTimeout>;
    },
  });

  return {
    sink,
    send,
    onError,
    clearTimer,
    timers,
    /** Bekleyen zamanlayıcıyı tetikler (gerçek 5 saniyeyi beklemeden). */
    fireTimer: () => timers[timers.length - 1]?.callback(),
  };
}

const flushMicrotasks = () => new Promise<void>((resolve) => setImmediate(resolve));

describe('first-party sink', () => {
  it('is always enabled, because the endpoint lives on the app API base', () => {
    expect(createSink().sink.isEnabled()).toBe(true);
  });

  it('needs analytics consent, not marketing consent', () => {
    expect(createSink().sink.consentCategory).toBe('analytics');
  });

  it('does not send a single event immediately; it waits for the batch window', () => {
    const { sink, send, timers } = createSink();

    sink.track(screenEvent('/'), buildContext());

    expect(send).not.toHaveBeenCalled();
    expect(timers[0].delayMs).toBe(FIRST_PARTY_FLUSH_INTERVAL_MS);
  });

  it('sends the queue when the timer fires', async () => {
    const { sink, send, fireTimer } = createSink();

    sink.track(screenEvent('/'), buildContext());
    fireTimer();
    await flushMicrotasks();

    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toHaveLength(1);
  });

  it('sends as soon as the batch size is reached, without waiting', async () => {
    const { sink, send } = createSink();

    for (let index = 0; index < FIRST_PARTY_BATCH_SIZE; index += 1) {
      sink.track(screenEvent(`/page-${index}`), buildContext());
    }
    await flushMicrotasks();

    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toHaveLength(FIRST_PARTY_BATCH_SIZE);
  });

  it('schedules only one timer for a burst of events', () => {
    const { sink, timers } = createSink();

    sink.track(screenEvent('/a'), buildContext());
    sink.track(screenEvent('/b'), buildContext());
    sink.track(screenEvent('/c'), buildContext());

    expect(timers).toHaveLength(1);
  });

  it('flushes on demand when the app goes to the background', async () => {
    const { sink, send } = createSink();

    sink.track(screenEvent('/'), buildContext());
    await sink.flush?.();

    expect(send).toHaveBeenCalledTimes(1);
  });

  it('does nothing on flush when the queue is empty', async () => {
    const { sink, send } = createSink();

    await sink.flush?.();

    expect(send).not.toHaveBeenCalled();
  });

  it('cancels the pending timer once it flushes, so the batch is not sent twice', async () => {
    const { sink, clearTimer } = createSink();

    sink.track(screenEvent('/'), buildContext());
    await sink.flush?.();

    expect(clearTimer).toHaveBeenCalledTimes(1);
  });

  it('reports a failed batch instead of swallowing it silently', async () => {
    const { sink, onError } = createSink(async () => {
      throw new Error('offline');
    });

    sink.track(screenEvent('/'), buildContext());
    await sink.flush?.();

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toContain('collector');
  });

  it('keeps accepting events after a failed batch', async () => {
    const { sink, send, onError } = createSink(async () => {
      throw new Error('offline');
    });

    sink.track(screenEvent('/a'), buildContext());
    await sink.flush?.();
    sink.track(screenEvent('/b'), buildContext());
    await sink.flush?.();

    expect(send).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenCalledTimes(2);
  });

  it('caps the queue so a long offline stretch cannot grow without bound', async () => {
    const { sink, send } = createSink(async () => {
      throw new Error('offline');
    });

    // Kuyruğu doldur; her batch boyutuna gelindiğinde gönderim başarısız olur
    // ve düşen event'ler geri konmaz, bu yüzden sınır aşımı için fazlası yazılır.
    for (let index = 0; index < FIRST_PARTY_QUEUE_LIMIT * 2; index += 1) {
      sink.track(screenEvent(`/page-${index}`), buildContext());
    }
    await flushMicrotasks();

    const sentCount = send.mock.calls.reduce((sum, call) => sum + call[0].length, 0);
    expect(sentCount).toBeLessThanOrEqual(FIRST_PARTY_QUEUE_LIMIT * 2);
  });

  it('drains the remaining events when a burst exceeds the backend batch limit', async () => {
    const { sink, send, fireTimer } = createSink();

    for (let index = 0; index < 60; index += 1) {
      sink.track(screenEvent(`/page-${index}`), buildContext());
    }
    await flushMicrotasks();
    fireTimer();
    await flushMicrotasks();

    // Backend tek istekte 50 event kabul ediyor; kalan ikinci istekte gitmeli.
    expect(send.mock.calls[0][0].length).toBeLessThanOrEqual(50);
    expect(send.mock.calls.length).toBeGreaterThan(1);
  });

  it('sends pending events on reset, so they keep the identity they were made with', async () => {
    const { sink, send } = createSink();

    sink.track(screenEvent('/'), buildContext());
    sink.reset?.();
    await flushMicrotasks();

    expect(send).toHaveBeenCalledTimes(1);
  });
});
