import { Permission, PermissionsAndroid, Platform } from 'react-native';
import {
  NotificationPermissionGateway,
  NotificationPermissionStatus,
} from '../types/notification-permission.types';

const POST_NOTIFICATIONS: Permission = 'android.permission.POST_NOTIFICATIONS';

/** Android 13 (Tiramisu) turned POST_NOTIFICATIONS into a runtime permission. */
const RUNTIME_PERMISSION_API_LEVEL = 33;

interface AndroidPermissionsApi {
  check: (permission: Permission) => Promise<boolean>;
  request: (permission: Permission) => Promise<string>;
}

export function mapAndroidPermissionResult(result: string): NotificationPermissionStatus {
  if (result === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
  if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) return 'blocked';
  return 'denied';
}

/**
 * On Android 13+ notifications are off until the app asks for them at runtime;
 * declaring POST_NOTIFICATIONS in the manifest only makes it requestable. Below
 * API 33 the permission is granted at install time, so there is nothing to ask.
 */
export function createAndroidNotificationPermissionGateway(
  permissions: AndroidPermissionsApi = PermissionsAndroid,
  apiLevel: number = Number(Platform.Version),
): NotificationPermissionGateway {
  const requiresRuntimeGrant = apiLevel >= RUNTIME_PERMISSION_API_LEVEL;

  return {
    async getStatus() {
      if (!requiresRuntimeGrant) return 'granted';

      return (await permissions.check(POST_NOTIFICATIONS)) ? 'granted' : 'denied';
    },

    async request() {
      if (!requiresRuntimeGrant) return 'granted';

      return mapAndroidPermissionResult(await permissions.request(POST_NOTIFICATIONS));
    },
  };
}

/**
 * Used where another owner already drives the OS prompt. On iOS the Insider SDK
 * requests authorization itself during `init` (it is started with quiet
 * permission disabled), so a second requester here would race with it.
 */
export function createDelegatedNotificationPermissionGateway(): NotificationPermissionGateway {
  return {
    getStatus: async () => 'unsupported',
    request: async () => 'unsupported',
  };
}

export function createNotificationPermissionGateway(
  platform: string = Platform.OS,
): NotificationPermissionGateway {
  return platform === 'android'
    ? createAndroidNotificationPermissionGateway()
    : createDelegatedNotificationPermissionGateway();
}
