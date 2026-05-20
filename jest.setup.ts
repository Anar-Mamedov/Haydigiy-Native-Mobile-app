const mockMmkvStore = new Map<string, string>();
const mockSecureStore = new Map<string, string>();
const mockAsyncStorageStore = new Map<string, string>();

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    executionEnvironment: 'standalone',
    expoGoConfig: null,
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  clear: jest.fn(async () => {
    mockAsyncStorageStore.clear();
  }),
  getItem: jest.fn(async (key: string) => mockAsyncStorageStore.get(key) ?? null),
  removeItem: jest.fn(async (key: string) => {
    mockAsyncStorageStore.delete(key);
  }),
  setItem: jest.fn(async (key: string, value: string) => {
    mockAsyncStorageStore.set(key, value);
  }),
}));

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    clearAll: () => {
      mockMmkvStore.clear();
    },
    getString: (key: string) => mockMmkvStore.get(key),
    remove: (key: string) => {
      mockMmkvStore.delete(key);
      return true;
    },
    set: (key: string, value: string) => {
      mockMmkvStore.set(key, value);
    },
  }),
}));

jest.mock('expo-secure-store', () => ({
  deleteItemAsync: jest.fn(async (key: string) => {
    mockSecureStore.delete(key);
  }),
  getItemAsync: jest.fn(async (key: string) => mockSecureStore.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockSecureStore.set(key, value);
  }),
}));
