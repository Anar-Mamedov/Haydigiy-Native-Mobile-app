import { appStorage } from '@/lib/storage/mmkv';
import {
  NotificationPermissionGateway,
  NotificationPermissionPrompter,
  NotificationPermissionStatus,
} from '../types/notification-permission.types';
import { createNotificationPermissionGateway } from './notification-permission-gateway';

const PROMPTED_KEY = 'notifications.permission-prompted';

interface NotificationPermissionPrompterDependencies {
  gateway: NotificationPermissionGateway;
  hasPrompted: () => Promise<boolean>;
  markPrompted: () => Promise<void>;
  onError: (message: string, error: unknown) => void;
}

/**
 * Owns the "when do we ask" policy: prompt on the first launch that can still
 * show a dialog, and never nag afterwards. A denial is the user's answer, so a
 * second prompt only ever comes from an explicit in-app action.
 */
export function createNotificationPermissionPrompter(
  dependencies: NotificationPermissionPrompterDependencies,
): NotificationPermissionPrompter {
  let inFlight: Promise<NotificationPermissionStatus> | null = null;

  async function prompt(): Promise<NotificationPermissionStatus> {
    const status = await dependencies.gateway.getStatus();

    // 'granted', 'blocked' and 'unsupported' all mean there is no prompt left
    // for us to show.
    if (status !== 'denied') return status;
    if (await dependencies.hasPrompted()) return status;

    const result = await dependencies.gateway.request();
    await dependencies.markPrompted();

    return result;
  }

  return {
    requestOnce() {
      // The prompt is a single OS-level dialog; concurrent callers must share
      // one run instead of stacking dialogs.
      inFlight ??= prompt()
        .catch((error): NotificationPermissionStatus => {
          dependencies.onError('[Notifications] Bildirim izni istenemedi.', error);
          return 'denied';
        })
        .finally(() => {
          inFlight = null;
        });

      return inFlight;
    },
  };
}

export const notificationPermissionPrompter = createNotificationPermissionPrompter({
  gateway: createNotificationPermissionGateway(),
  hasPrompted: async () => Boolean(await appStorage.getItem(PROMPTED_KEY)),
  markPrompted: async () => {
    await appStorage.setItem(PROMPTED_KEY, 'true');
  },
  onError: (message, error) => console.warn(message, error),
});
