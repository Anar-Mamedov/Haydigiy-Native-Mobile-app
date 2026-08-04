export type NotificationPermissionStatus =
  /** The user allowed notifications. */
  | 'granted'
  /** The user has not allowed notifications yet, but can still be asked. */
  | 'denied'
  /** The OS will no longer show a prompt; only Settings can change this. */
  | 'blocked'
  /** This platform does not expose a permission we are allowed to drive. */
  | 'unsupported';

/**
 * Platform-specific access to the notification permission.
 *
 * Implementations only read and request; they never decide *when* to prompt.
 * That policy belongs to the prompter so it stays identical across platforms.
 */
export interface NotificationPermissionGateway {
  /** Current status, without showing any OS prompt. */
  getStatus(): Promise<NotificationPermissionStatus>;
  /** Shows the OS prompt when the platform still allows one. */
  request(): Promise<NotificationPermissionStatus>;
}

export interface NotificationPermissionPrompter {
  /**
   * Asks for the permission at most once per install, then resolves with the
   * resulting status. Never rejects.
   */
  requestOnce(): Promise<NotificationPermissionStatus>;
}
