import { AnalyticsContext } from './analytics-sink';
import { createFirebaseAnalyticsSink } from './firebase-analytics.sink';
import { FirebaseAnalyticsClient } from '@/lib/firebase-analytics';

function createClient(): jest.Mocked<FirebaseAnalyticsClient> {
  return {
    logEvent: jest.fn().mockResolvedValue(undefined),
    logScreenView: jest.fn().mockResolvedValue(undefined),
    setCollectionEnabled: jest.fn().mockResolvedValue(undefined),
    setConsent: jest.fn().mockResolvedValue(undefined),
    setUserId: jest.fn().mockResolvedValue(undefined),
  };
}

const context = {} as AnalyticsContext;

/** Sink native çağrıları bir mikro görev sonra yapar; onları bekle. */
const settle = () => new Promise<void>((resolve) => setImmediate(resolve));

function createSink(client: FirebaseAnalyticsClient | null = createClient()) {
  const onError = jest.fn();
  const sink = createFirebaseAnalyticsSink({ loadClient: () => client, onError });
  return { onError, sink };
}

describe('createFirebaseAnalyticsSink', () => {
  it('is a measurement sink gated on analytics consent', () => {
    const { sink } = createSink();

    expect(sink.id).toBe('firebase-analytics');
    expect(sink.consentCategory).toBe('analytics');
  });

  it('is disabled where the native module is missing (Expo Go, web)', () => {
    expect(createSink(null).sink.isEnabled()).toBe(false);
    expect(createSink().sink.isEnabled()).toBe(true);
  });

  it('logs screens as screen views', async () => {
    const client = createClient();
    const { sink } = createSink(client);

    sink.track({ name: 'screen_viewed', route: '/product/[id]', screen: '/product/1' }, context);
    await settle();

    expect(client.logScreenView).toHaveBeenCalledWith('/product/[id]', '/product/[id]');
    expect(client.logEvent).not.toHaveBeenCalled();
  });

  it('logs commerce events with GA4 names and parameters', async () => {
    const client = createClient();
    const { sink } = createSink(client);

    sink.track({ name: 'search_performed', query: 'elbise' }, context);
    await settle();

    expect(client.logEvent).toHaveBeenCalledWith('search', { search_term: 'elbise' });
  });

  it('sends nothing for events GA4 does not receive', async () => {
    const client = createClient();
    const { sink } = createSink(client);

    sink.track({ itemCount: 2, name: 'cart_cleared' }, context);
    await settle();

    expect(client.logEvent).not.toHaveBeenCalled();
    expect(client.logScreenView).not.toHaveBeenCalled();
  });

  it('binds and clears the signed-in user', async () => {
    const client = createClient();
    const { sink } = createSink(client);

    sink.identify?.({ userId: 42 }, context);
    sink.reset?.();
    await settle();

    expect(client.setUserId).toHaveBeenNthCalledWith(1, '42');
    expect(client.setUserId).toHaveBeenNthCalledWith(2, null);
  });

  it('turns collection on with analytics consent and maps marketing to the ad signals', async () => {
    const client = createClient();
    const { sink } = createSink(client);

    sink.applyConsent?.({ analytics: true, functional: false, marketing: false });
    await settle();

    expect(client.setConsent).toHaveBeenCalledWith({
      adPersonalization: false,
      adStorage: false,
      adUserData: false,
      analyticsStorage: true,
    });
    expect(client.setCollectionEnabled).toHaveBeenCalledWith(true);
  });

  it('stops collection when analytics consent is withdrawn', async () => {
    const client = createClient();
    const { sink } = createSink(client);

    sink.applyConsent?.({ analytics: false, functional: false, marketing: false });
    await settle();

    expect(client.setCollectionEnabled).toHaveBeenCalledWith(false);
  });

  it('reports a rejected native call instead of throwing', async () => {
    const client = createClient();
    client.logEvent.mockRejectedValue(new Error('native failure'));
    const { onError, sink } = createSink(client);

    expect(() => sink.track({ name: 'user_signed_up' }, context)).not.toThrow();
    await settle();

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('reports a native call that throws synchronously', async () => {
    const client = createClient();
    client.setUserId.mockImplementation(() => {
      throw new Error('bridge missing');
    });
    const { onError, sink } = createSink(client);

    expect(() => sink.reset?.()).not.toThrow();
    await settle();

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('does nothing at all without a native client', async () => {
    const { onError, sink } = createSink(null);

    sink.track({ name: 'user_signed_up' }, context);
    sink.applyConsent?.({ analytics: true, functional: true, marketing: true });
    await settle();

    expect(onError).not.toHaveBeenCalled();
  });
});
