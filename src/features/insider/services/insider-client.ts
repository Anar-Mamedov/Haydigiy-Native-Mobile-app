/* eslint-disable @typescript-eslint/no-require-imports */
import { NativeModules, Platform } from 'react-native';
import insiderConfig from '../../../../insider.config.json';
import { isHaydigiyUniversalLink, isInsiderSdkUrl } from '../utils/insider-url';
import { InsiderCallback, InsiderClient, InsiderSdk } from '../types/insider.types';

interface InsiderClientDependencies {
  isNativeSdkAvailable: () => boolean;
  loadSdk: () => InsiderSdk;
  onError: (message: string, error: unknown) => void;
}

export function isInsiderNativeSdkAvailable(
  platform: string,
  nativeModules: Record<string, unknown>,
): boolean {
  if (!nativeModules.RNInsider) return false;

  return platform !== 'ios' || Boolean(nativeModules.RNNotificationHandler);
}

const defaultDependencies: InsiderClientDependencies = {
  isNativeSdkAvailable: () => isInsiderNativeSdkAvailable(Platform.OS, NativeModules),
  loadSdk: () => require('react-native-insider').default as InsiderSdk,
  onError: (message, error) => console.warn(message, error),
};

export function createInsiderClient(
  dependencies: InsiderClientDependencies = defaultDependencies,
): InsiderClient {
  let sdk: InsiderSdk | null = null;
  let callback: InsiderCallback | null = null;
  let initialized = false;

  return {
    initialize(nextCallback) {
      callback = nextCallback;

      if (initialized) return true;
      if (!dependencies.isNativeSdkAvailable()) return false;

      try {
        sdk = dependencies.loadSdk();
        sdk.init(insiderConfig.partnerName, insiderConfig.appGroup, (type, payload) => {
          callback?.(type, payload);
        });
        sdk.registerWithQuietPermission(false);
        sdk.setActiveForegroundPushView();
        initialized = true;
        return true;
      } catch (error) {
        sdk = null;
        dependencies.onError('[Insider] SDK başlatılamadı.', error);
        return false;
      }
    },

    clearCallback(currentCallback) {
      if (callback === currentCallback) callback = null;
    },

    handleIncomingUrl(url) {
      if (!initialized || !sdk) return;

      try {
        if (isInsiderSdkUrl(url)) {
          sdk.handleURL(url);
          return;
        }

        if (isHaydigiyUniversalLink(url)) {
          sdk.handleUniversalLink(url);
        }
      } catch (error) {
        dependencies.onError('[Insider] Gelen bağlantı işlenemedi.', error);
      }
    },
  };
}

export const insiderClient = createInsiderClient();
