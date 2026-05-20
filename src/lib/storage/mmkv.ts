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

const isExpoGo = Boolean(Constants.expoGoConfig);
const canUseMmkv = Platform.OS !== 'web' && !isExpoGo;

let mmkvStorage: null | {
  clearAll: () => void;
  getString: (key: string) => string | undefined;
  remove: (key: string) => boolean;
  set: (key: string, value: string) => void;
} = null;

if (canUseMmkv) {
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
