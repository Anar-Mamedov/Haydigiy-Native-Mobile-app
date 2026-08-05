import { createInsiderClient, isInsiderNativeSdkAvailable } from './insider-client';
import { InsiderPayload, InsiderSdk } from '../types/insider.types';

function createSdkMock() {
  let nativeCallback: ((type: number, payload: InsiderPayload) => void) | undefined;

  // The push client only touches the init/push/link surface of the SDK, so the
  // mock covers just that slice of the full interface.
  const sdk = {
    init: jest.fn(
      (
        _partnerName: string,
        _appGroup: string,
        callback: (type: number, payload: InsiderPayload) => void,
      ) => {
        nativeCallback = callback;
      },
    ),
    registerWithQuietPermission: jest.fn(),
    setActiveForegroundPushView: jest.fn(),
    handleUniversalLink: jest.fn(),
    handleURL: jest.fn(),
  } as unknown as jest.Mocked<InsiderSdk>;

  return { sdk, emit: (type: number, payload: InsiderPayload) => nativeCallback?.(type, payload) };
}

describe('Insider client', () => {
  it('requires only the native Insider module on Android', () => {
    expect(
      isInsiderNativeSdkAvailable('android', {
        RNInsider: {},
      }),
    ).toBe(true);
  });

  it('requires the notification handler alongside Insider on iOS', () => {
    expect(
      isInsiderNativeSdkAvailable('ios', {
        RNInsider: {},
      }),
    ).toBe(false);
    expect(
      isInsiderNativeSdkAvailable('ios', {
        RNInsider: {},
        RNNotificationHandler: {},
      }),
    ).toBe(true);
  });

  it('stays disabled when the native SDK is unavailable', () => {
    const loadSdk = jest.fn();
    const client = createInsiderClient({
      isNativeSdkAvailable: () => false,
      loadSdk,
      onError: jest.fn(),
    });

    expect(client.initialize(jest.fn())).toBe(false);
    expect(loadSdk).not.toHaveBeenCalled();
  });

  it('initializes once and forwards callbacks to the latest subscriber', () => {
    const { sdk, emit } = createSdkMock();
    const firstCallback = jest.fn();
    const secondCallback = jest.fn();
    const client = createInsiderClient({
      isNativeSdkAvailable: () => true,
      loadSdk: () => sdk,
      onError: jest.fn(),
    });

    expect(client.initialize(firstCallback)).toBe(true);
    expect(client.initialize(secondCallback)).toBe(true);
    emit(0, { source: 'Insider' });

    expect(sdk.init).toHaveBeenCalledTimes(1);
    expect(sdk.init).toHaveBeenCalledWith(
      'haydigiyprod',
      'group.com.faprika.haydigiy.app',
      expect.any(Function),
    );
    expect(sdk.registerWithQuietPermission).toHaveBeenCalledWith(false);
    expect(sdk.setActiveForegroundPushView).toHaveBeenCalledTimes(1);
    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledWith(0, { source: 'Insider' });
  });

  it('routes test-device and storefront URLs to their matching SDK handlers', () => {
    const { sdk } = createSdkMock();
    const client = createInsiderClient({
      isNativeSdkAvailable: () => true,
      loadSdk: () => sdk,
      onError: jest.fn(),
    });

    client.initialize(jest.fn());
    client.handleIncomingUrl('insiderhaydigiyprod://test_device/123');
    client.handleIncomingUrl('https://www.haydigiy.com/siyah-elbise');
    client.handleIncomingUrl('https://untrusted.example/path');

    expect(sdk.handleURL).toHaveBeenCalledWith('insiderhaydigiyprod://test_device/123');
    expect(sdk.handleUniversalLink).toHaveBeenCalledWith(
      'https://www.haydigiy.com/siyah-elbise',
    );
    expect(sdk.handleUniversalLink).toHaveBeenCalledTimes(1);
  });
});
