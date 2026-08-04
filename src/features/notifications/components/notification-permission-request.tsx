import { useNotificationPermissionRequest } from '../hooks/use-notification-permission-request';

/** Headless mount point for the first-launch notification permission prompt. */
export function NotificationPermissionRequest() {
  useNotificationPermissionRequest();

  return null;
}
