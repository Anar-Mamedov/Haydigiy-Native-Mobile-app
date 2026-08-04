import { NotificationPermissionGateway } from '../types/notification-permission.types';
import {
  createAndroidNotificationPermissionGateway,
  createDelegatedNotificationPermissionGateway,
  createNotificationPermissionGateway,
  mapAndroidPermissionResult,
} from './notification-permission-gateway';
import { createNotificationPermissionPrompter } from './notification-permission';

function createPermissionsMock(overrides?: Partial<{ checkResult: boolean; requestResult: string }>) {
  return {
    check: jest.fn(async () => overrides?.checkResult ?? false),
    request: jest.fn(async () => overrides?.requestResult ?? 'granted'),
  };
}

describe('Android notification permission gateway', () => {
  it('maps every native result to a domain status', () => {
    expect(mapAndroidPermissionResult('granted')).toBe('granted');
    expect(mapAndroidPermissionResult('denied')).toBe('denied');
    expect(mapAndroidPermissionResult('never_ask_again')).toBe('blocked');
  });

  it('asks the OS for POST_NOTIFICATIONS on Android 13 and above', async () => {
    const permissions = createPermissionsMock();
    const gateway = createAndroidNotificationPermissionGateway(permissions, 33);

    await expect(gateway.getStatus()).resolves.toBe('denied');
    await expect(gateway.request()).resolves.toBe('granted');
    expect(permissions.request).toHaveBeenCalledWith('android.permission.POST_NOTIFICATIONS');
  });

  it('reports the permission as granted below Android 13 without touching the OS', async () => {
    const permissions = createPermissionsMock();
    const gateway = createAndroidNotificationPermissionGateway(permissions, 32);

    await expect(gateway.getStatus()).resolves.toBe('granted');
    await expect(gateway.request()).resolves.toBe('granted');
    expect(permissions.check).not.toHaveBeenCalled();
    expect(permissions.request).not.toHaveBeenCalled();
  });

  it('reports a blocked permission when the OS stops showing the dialog', async () => {
    const permissions = createPermissionsMock({ requestResult: 'never_ask_again' });
    const gateway = createAndroidNotificationPermissionGateway(permissions, 34);

    await expect(gateway.request()).resolves.toBe('blocked');
  });

  it('delegates to the push SDK on iOS instead of prompting twice', async () => {
    const gateway = createNotificationPermissionGateway('ios');

    await expect(gateway.getStatus()).resolves.toBe('unsupported');
    await expect(gateway.request()).resolves.toBe('unsupported');
  });
});

describe('Notification permission prompter', () => {
  function createPrompter(
    gateway: NotificationPermissionGateway,
    options?: { alreadyPrompted?: boolean },
  ) {
    let prompted = options?.alreadyPrompted ?? false;
    const onError = jest.fn();

    const prompter = createNotificationPermissionPrompter({
      gateway,
      hasPrompted: async () => prompted,
      markPrompted: async () => {
        prompted = true;
      },
      onError,
    });

    return { prompter, onError, wasMarked: () => prompted };
  }

  it('shows the OS prompt on a fresh install and remembers that it asked', async () => {
    const gateway: NotificationPermissionGateway = {
      getStatus: jest.fn(async () => 'denied' as const),
      request: jest.fn(async () => 'granted' as const),
    };
    const { prompter, wasMarked } = createPrompter(gateway);

    await expect(prompter.requestOnce()).resolves.toBe('granted');
    expect(gateway.request).toHaveBeenCalledTimes(1);
    expect(wasMarked()).toBe(true);
  });

  it('does not ask again once the user has answered', async () => {
    const gateway: NotificationPermissionGateway = {
      getStatus: jest.fn(async () => 'denied' as const),
      request: jest.fn(async () => 'granted' as const),
    };
    const { prompter } = createPrompter(gateway, { alreadyPrompted: true });

    await expect(prompter.requestOnce()).resolves.toBe('denied');
    expect(gateway.request).not.toHaveBeenCalled();
  });

  it('skips the prompt when the permission is already granted', async () => {
    const gateway: NotificationPermissionGateway = {
      getStatus: jest.fn(async () => 'granted' as const),
      request: jest.fn(async () => 'granted' as const),
    };
    const { prompter, wasMarked } = createPrompter(gateway);

    await expect(prompter.requestOnce()).resolves.toBe('granted');
    expect(gateway.request).not.toHaveBeenCalled();
    expect(wasMarked()).toBe(false);
  });

  it('shows a single dialog when callers overlap', async () => {
    const gateway: NotificationPermissionGateway = {
      getStatus: jest.fn(async () => 'denied' as const),
      request: jest.fn(async () => 'granted' as const),
    };
    const { prompter } = createPrompter(gateway);

    await Promise.all([prompter.requestOnce(), prompter.requestOnce()]);

    expect(gateway.request).toHaveBeenCalledTimes(1);
  });

  it('reports failures instead of crashing the app shell', async () => {
    const failure = new Error('native module unavailable');
    const gateway: NotificationPermissionGateway = {
      getStatus: jest.fn(async () => {
        throw failure;
      }),
      request: jest.fn(async () => 'granted' as const),
    };
    const { prompter, onError } = createPrompter(gateway);

    await expect(prompter.requestOnce()).resolves.toBe('denied');
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('[Notifications]'), failure);
  });

  it('leaves the delegated gateway alone so the push SDK keeps ownership', async () => {
    const { prompter, wasMarked } = createPrompter(createDelegatedNotificationPermissionGateway());

    await expect(prompter.requestOnce()).resolves.toBe('unsupported');
    expect(wasMarked()).toBe(false);
  });
});
