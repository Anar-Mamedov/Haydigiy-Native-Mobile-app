import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

type AppStorageAdapter = {
  clearAll: () => Promise<void> | void;
  getItem: (key: string) => Promise<string | null> | string | null;
  kind: 'async-storage' | 'mmkv' | 'web-storage';
  removeItem: (key: string) => Promise<void> | void;
  setItem: (key: string, value: string) => Promise<void> | void;
};

type ExpoRuntimeConstants = {
  appOwnership?: string | null;
  executionEnvironment?: string | null;
  expoGoConfig?: unknown;
  expoVersion?: string | null;
};

export function isExpoGoRuntime(constants: ExpoRuntimeConstants): boolean {
  return (
    Boolean(constants.expoGoConfig) ||
    constants.appOwnership === 'expo' ||
    (constants.executionEnvironment === 'storeClient' && Boolean(constants.expoVersion))
  );
}

const isExpoGo = isExpoGoRuntime(Constants);
const canUseMmkv = Platform.OS !== 'web' && !isExpoGo;

let mmkvStorage: null | {
  clearAll: () => void;
  getString: (key: string) => string | undefined;
  remove: (key: string) => boolean;
  set: (key: string, value: string) => void;
} = null;

if (canUseMmkv) {
  // MMKV is unavailable in Expo Go; keep this import guarded so the fallback can load.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');

  mmkvStorage = createMMKV({
    id: 'haydigiy.storage',
  });
}

function clearWebStorage() {
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
}

function getWebStorageItem(key: string) {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  return localStorage.getItem(key);
}

function removeWebStorageItem(key: string) {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(key);
  }
}

function setWebStorageItem(key: string, value: string) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  }
}

export const appStorage: AppStorageAdapter =
  Platform.OS === 'web'
    ? {
        clearAll: clearWebStorage,
        getItem: getWebStorageItem,
        kind: 'web-storage',
        removeItem: removeWebStorageItem,
        setItem: setWebStorageItem,
      }
    : mmkvStorage
      ? {
          clearAll: () => {
            mmkvStorage?.clearAll();
          },
          getItem: (key) => mmkvStorage?.getString(key) ?? null,
          kind: 'mmkv',
          removeItem: (key) => {
            mmkvStorage?.remove(key);
          },
          setItem: (key, value) => {
            mmkvStorage?.set(key, value);
          },
        }
      : {
          clearAll: () => AsyncStorage.clear(),
          getItem: (key) => AsyncStorage.getItem(key),
          kind: 'async-storage',
          removeItem: (key) => AsyncStorage.removeItem(key),
          setItem: (key, value) => AsyncStorage.setItem(key, value),
        };
