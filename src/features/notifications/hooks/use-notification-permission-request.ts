import { useEffect } from 'react';
import { notificationPermissionPrompter } from '../services/notification-permission';

/**
 * Asks for the notification permission once the app shell is mounted, so a
 * fresh install behaves like every other store app: the OS prompt shows up on
 * first launch instead of leaving notifications silently off until the user
 * finds them in system settings.
 */
export function useNotificationPermissionRequest() {
  useEffect(() => {
    void notificationPermissionPrompter.requestOnce();
  }, []);
}
