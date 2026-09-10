import { AnalyticsConsentGate } from './analytics-consent';
import {
  AnalyticsDispatcherDependencies,
  createAnalyticsDispatcher,
} from './analytics-dispatcher';
import { AnalyticsContext, AnalyticsSink } from './analytics-sink';
import { AnalyticsEvent } from '../types/analytics.types';
import { ConsentPreferences } from '@/features/consent/types/consent.types';

type TrackCall = { event: AnalyticsEvent; context: AnalyticsContext };

function createSinkSpy(
  overrides: Partial<AnalyticsSink> & Pick<AnalyticsSink, 'id'>,
): AnalyticsSink & { calls: TrackCall[] } {
  const calls: TrackCall[] = [];

  return {
    calls,
    consentCategory: 'analytics',
    isEnabled: () => true,
    track: (event, context) => {
      calls.push({ context, event });
    },
    ...overrides,
  };
}

function createConsentGate(preferences: ConsentPreferences): AnalyticsConsentGate & {
  restoreCount: number;
} {
  let current = preferences;
  const gate = {
    apply: (next: ConsentPreferences) => {
      current = next;
    },
    isAllowed: (category: keyof ConsentPreferences) => current[category] === true,
    restore: async () => {
      gate.restoreCount += 1;
    },
    restoreCount: 0,
  };

  return gate;
}

const FULL_CONSENT: ConsentPreferences = { analytics: true, functional: true, marketing: true };
const NO_CONSENT: ConsentPreferences = { analytics: false, functional: false, marketing: false };

function createDispatcher(
  sinks: AnalyticsSink[],
  overrides: Partial<AnalyticsDispatcherDependencies> = {},
) {
  const consent = overrides.consent ?? createConsentGate(FULL_CONSENT);
  const onError = jest.fn();

  const dispatcher = createAnalyticsDispatcher({
    consent,
    loadDeviceId: async () => 'device-1',
    loadDeviceInfo: () => ({
      appVersion: '2.3.24',
      deviceType: 'mobile',
      os: 'iOS',
      osVersion: '18.2',
      screenHeight: 844,
      screenWidth: 390,
    }),
    onError,
    session: {
      getAnonymousId: async () => 'anon-1',
      getSessionId: async () => 'sess-1',
    },
    sinks,
    ...overrides,
  });

  return { dispatcher, onError, consent };
}

/** Dispatcher kuyruğu asenkron; sıradaki işler bitene kadar bekle. */
const settle = () => new Promise<void>((resolve) => setImmediate(resolve));

const screenEvent: AnalyticsEvent = { name: 'screen_viewed', screen: '/' };

describe('consent gating', () => {
  it('delivers events once consent is granted', async () => {
    const sink = createSinkSpy({ id: 'a' });
    const { dispatcher } = createDispatcher([sink]);

    dispatcher.track(screenEvent);
    await settle();

    expect(sink.calls).toHaveLength(1);
  });

  it('drops events entirely when consent is withheld', async () => {
    const sink = createSinkSpy({ id: 'a' });
    const { dispatcher } = createDispatcher([sink], {
      consent: createConsentGate(NO_CONSENT),
    });

    dispatcher.track(screenEvent);
    await settle();

    expect(sink.calls).toHaveLength(0);
  });

  it('gates each sink on its own consent category', async () => {
    const measurement = createSinkSpy({ consentCategory: 'analytics', id: 'measurement' });
    const advertising = createSinkSpy({ consentCategory: 'marketing', id: 'advertising' });
    const { dispatcher } = createDispatcher([measurement, advertising], {
      consent: createConsentGate({ analytics: true, functional: true, marketing: false }),
    });

    dispatcher.track(screenEvent);
    await settle();

    expect(measurement.calls).toHaveLength(1);
    expect(advertising.calls).toHaveLength(0);
  });

  it('reads the stored choice once, not on every event', async () => {
    const consent = createConsentGate(FULL_CONSENT);
    const { dispatcher } = createDispatcher([createSinkSpy({ id: 'a' })], { consent });

    dispatcher.track(screenEvent);
    dispatcher.track(screenEvent);
    await settle();

    expect(consent.restoreCount).toBe(1);
  });

  it('waits for the stored choice before the very first event', async () => {
    const sink = createSinkSpy({ id: 'a' });
    let restored = false;
    const consent: AnalyticsConsentGate = {
      apply: () => undefined,
      // Depo okunana kadar izin yok; asıl test bu sırayı doğrular.
      isAllowed: () => restored,
      restore: async () => {
        await settle();
        restored = true;
      },
    };
    const { dispatcher } = createDispatcher([sink], { consent });

    dispatcher.track(screenEvent);
    await settle();
    await settle();

    expect(sink.calls).toHaveLength(1);
  });

  it('applies a fresh choice without re-reading the store', async () => {
    const consent = createConsentGate(NO_CONSENT);
    const sink = createSinkSpy({ id: 'a' });
    const { dispatcher } = createDispatcher([sink], { consent });

    dispatcher.applyConsent(FULL_CONSENT);
    dispatcher.track(screenEvent);
    await settle();

    expect(sink.calls).toHaveLength(1);
    expect(consent.restoreCount).toBe(0);
  });

  it('stops delivering once the user withdraws consent', async () => {
    const sink = createSinkSpy({ id: 'a' });
    const { dispatcher } = createDispatcher([sink]);

    dispatcher.applyConsent(NO_CONSENT);
    dispatcher.track(screenEvent);
    await settle();

    expect(sink.calls).toHaveLength(0);
  });
});

describe('sink isolation', () => {
  it('skips a sink that reports itself unavailable', async () => {
    const unavailable = createSinkSpy({ id: 'unavailable', isEnabled: () => false });
    const available = createSinkSpy({ id: 'available' });
    const { dispatcher } = createDispatcher([unavailable, available]);

    dispatcher.track(screenEvent);
    await settle();

    expect(unavailable.calls).toHaveLength(0);
    expect(available.calls).toHaveLength(1);
  });

  it('keeps delivering to the other sinks when one throws', async () => {
    const failing: AnalyticsSink = {
      consentCategory: 'analytics',
      id: 'failing',
      isEnabled: () => true,
      track: () => {
        throw new Error('sdk exploded');
      },
    };
    const healthy = createSinkSpy({ id: 'healthy' });
    const { dispatcher, onError } = createDispatcher([failing, healthy]);

    dispatcher.track(screenEvent);
    await settle();

    expect(healthy.calls).toHaveLength(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toContain('failing');
  });

  it('reports a context failure instead of throwing into the caller', async () => {
    const sink = createSinkSpy({ id: 'a' });
    const { dispatcher, onError } = createDispatcher([sink], {
      loadDeviceId: async () => {
        throw new Error('storage unavailable');
      },
    });

    expect(() => dispatcher.track(screenEvent)).not.toThrow();
    await settle();

    expect(sink.calls).toHaveLength(0);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('recovers on the next event after a context failure', async () => {
    const sink = createSinkSpy({ id: 'a' });
    let shouldFail = true;
    const { dispatcher } = createDispatcher([sink], {
      loadDeviceId: async () => {
        if (shouldFail) {
          shouldFail = false;
          throw new Error('storage unavailable');
        }
        return 'device-1';
      },
    });

    dispatcher.track(screenEvent);
    await settle();
    dispatcher.track(screenEvent);
    await settle();

    expect(sink.calls).toHaveLength(1);
  });
});

describe('event context', () => {
  it('stamps the resolved session and device context', async () => {
    const sink = createSinkSpy({ id: 'a' });
    const { dispatcher } = createDispatcher([sink]);

    dispatcher.track(screenEvent);
    await settle();

    expect(sink.calls[0].context).toMatchObject({
      anonymousId: 'anon-1',
      appVersion: '2.3.24',
      deviceId: 'device-1',
      deviceType: 'mobile',
      os: 'iOS',
      sessionId: 'sess-1',
      userId: null,
    });
  });

  it('carries the active screen path into later events', async () => {
    const sink = createSinkSpy({ id: 'a' });
    const { dispatcher } = createDispatcher([sink]);

    dispatcher.setScreenPath('/product/101');
    dispatcher.track({ name: 'user_signed_up' });
    await settle();

    expect(sink.calls[0].context.screenPath).toBe('/product/101');
  });

  it('preserves the order events were produced in', async () => {
    const sink = createSinkSpy({ id: 'a' });
    const { dispatcher } = createDispatcher([sink]);

    dispatcher.track({ name: 'screen_viewed', screen: '/first' });
    dispatcher.track({ name: 'screen_viewed', screen: '/second' });
    dispatcher.track({ name: 'screen_viewed', screen: '/third' });
    await settle();

    expect(sink.calls.map((call) => (call.event as { screen: string }).screen)).toEqual([
      '/first',
      '/second',
      '/third',
    ]);
  });
});

describe('identity', () => {
  it('binds the user id to every following event', async () => {
    const sink = createSinkSpy({ id: 'a' });
    const { dispatcher } = createDispatcher([sink]);

    dispatcher.identify({ userId: 42 });
    dispatcher.track(screenEvent);
    await settle();

    expect(sink.calls[0].context.userId).toBe(42);
  });

  it('forwards the identity to sinks that accept one', async () => {
    const identify = jest.fn();
    const sink = createSinkSpy({ id: 'a', identify });
    const { dispatcher } = createDispatcher([sink]);

    dispatcher.identify({ email: 'ayse@example.com', userId: 42 });
    await settle();

    expect(identify).toHaveBeenCalledTimes(1);
    expect(identify.mock.calls[0][0]).toEqual({ email: 'ayse@example.com', userId: 42 });
  });

  it('does not break on a sink that cannot be identified', async () => {
    const sink = createSinkSpy({ id: 'a' });
    const { dispatcher, onError } = createDispatcher([sink]);

    dispatcher.identify({ userId: 42 });
    await settle();

    expect(onError).not.toHaveBeenCalled();
  });

  it('clears the user id on reset so later events are anonymous again', async () => {
    const sink = createSinkSpy({ id: 'a' });
    const { dispatcher } = createDispatcher([sink]);

    dispatcher.identify({ userId: 42 });
    dispatcher.reset();
    dispatcher.track(screenEvent);
    await settle();

    expect(sink.calls[0].context.userId).toBeNull();
  });

  it('still reports events queued before reset under the old identity', async () => {
    const sink = createSinkSpy({ id: 'a' });
    const { dispatcher } = createDispatcher([sink]);

    dispatcher.identify({ userId: 42 });
    dispatcher.track({ name: 'user_logged_out', reason: 'user' });
    dispatcher.reset();
    await settle();

    expect(sink.calls[0].context.userId).toBe(42);
  });

  it('reports a sink that fails to reset', async () => {
    const sink = createSinkSpy({
      id: 'a',
      reset: () => {
        throw new Error('cannot reset');
      },
    });
    const { dispatcher, onError } = createDispatcher([sink]);

    dispatcher.reset();
    await settle();

    expect(onError).toHaveBeenCalledTimes(1);
  });
});

describe('flush', () => {
  it('flushes every sink regardless of consent, so nothing already queued is lost', async () => {
    const flush = jest.fn();
    const sink = createSinkSpy({ flush, id: 'a' });
    const { dispatcher } = createDispatcher([sink], {
      consent: createConsentGate(NO_CONSENT),
    });

    dispatcher.flush();
    await settle();

    expect(flush).toHaveBeenCalledTimes(1);
  });

  it('reports a sink that fails to flush', async () => {
    const sink = createSinkSpy({
      flush: () => {
        throw new Error('cannot flush');
      },
      id: 'a',
    });
    const { dispatcher, onError } = createDispatcher([sink]);

    dispatcher.flush();
    await settle();

    expect(onError).toHaveBeenCalledTimes(1);
  });
});
