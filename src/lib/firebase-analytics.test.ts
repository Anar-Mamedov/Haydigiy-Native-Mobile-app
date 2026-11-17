import { createFirebaseAnalyticsClient, createFirebaseAnalyticsLoader } from './firebase-analytics';

type RnFirebaseAnalyticsModule = typeof import('@react-native-firebase/analytics');

const analyticsInstance = { app: 'default' };

function createModuleFake() {
  return {
    getAnalytics: jest.fn(() => analyticsInstance),
    logEvent: jest.fn(() => Promise.resolve()),
    logScreenView: jest.fn(() => Promise.resolve()),
    setAnalyticsCollectionEnabled: jest.fn(() => Promise.resolve()),
    setConsent: jest.fn(() => Promise.resolve()),
    setUserId: jest.fn(() => Promise.resolve()),
  };
}

const asModule = (fake: ReturnType<typeof createModuleFake>) =>
  fake as unknown as RnFirebaseAnalyticsModule;

describe('createFirebaseAnalyticsClient', () => {
  it('forwards events with their name and parameters', async () => {
    const fake = createModuleFake();
    const client = createFirebaseAnalyticsClient(asModule(fake));

    await client.logEvent('purchase', { value: 10 });

    expect(fake.logEvent).toHaveBeenCalledWith(analyticsInstance, 'purchase', { value: 10 });
  });

  it('logs screen views with GA4 screen parameters', async () => {
    const fake = createModuleFake();
    const client = createFirebaseAnalyticsClient(asModule(fake));

    await client.logScreenView('/cart', '/cart');

    expect(fake.logScreenView).toHaveBeenCalledWith(analyticsInstance, {
      screen_class: '/cart',
      screen_name: '/cart',
    });
  });

  it('translates consent into Google Consent Mode keys', async () => {
    const fake = createModuleFake();
    const client = createFirebaseAnalyticsClient(asModule(fake));

    await client.setConsent({
      adPersonalization: false,
      adStorage: true,
      adUserData: false,
      analyticsStorage: true,
    });

    expect(fake.setConsent).toHaveBeenCalledWith(analyticsInstance, {
      ad_personalization: false,
      ad_storage: true,
      ad_user_data: false,
      analytics_storage: true,
    });
  });

  it('toggles collection and the user id', async () => {
    const fake = createModuleFake();
    const client = createFirebaseAnalyticsClient(asModule(fake));

    await client.setCollectionEnabled(true);
    await client.setUserId(null);

    expect(fake.setAnalyticsCollectionEnabled).toHaveBeenCalledWith(analyticsInstance, true);
    expect(fake.setUserId).toHaveBeenCalledWith(analyticsInstance, null);
  });
});

describe('createFirebaseAnalyticsLoader', () => {
  it('returns no client outside a native runtime and never loads the module', () => {
    const loadModule = jest.fn();
    const load = createFirebaseAnalyticsLoader({
      isNativeRuntime: () => false,
      loadModule,
      onError: jest.fn(),
    });

    expect(load()).toBeNull();
    expect(loadModule).not.toHaveBeenCalled();
  });

  it('builds the client once and reuses it', () => {
    const loadModule = jest.fn(() => asModule(createModuleFake()));
    const load = createFirebaseAnalyticsLoader({
      isNativeRuntime: () => true,
      loadModule,
      onError: jest.fn(),
    });

    const first = load();

    expect(first).not.toBeNull();
    expect(load()).toBe(first);
    expect(loadModule).toHaveBeenCalledTimes(1);
  });

  it('reports a module that fails to load and does not retry on every call', () => {
    const onError = jest.fn();
    const loadModule = jest.fn(() => {
      throw new Error('Native module RNFBAppModule not found');
    });
    const load = createFirebaseAnalyticsLoader({ isNativeRuntime: () => true, loadModule, onError });

    expect(load()).toBeNull();
    expect(load()).toBeNull();
    expect(loadModule).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
