import { StateStorage } from 'zustand/middleware';
import { appStorage } from '@/lib/storage/mmkv';

export const zustandStorage: StateStorage = {
  getItem: (name) => appStorage.getItem(name),
  removeItem: (name) => appStorage.removeItem(name),
  setItem: (name, value) => appStorage.setItem(name, value),
};
