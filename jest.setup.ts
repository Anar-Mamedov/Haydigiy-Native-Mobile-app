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

jest.mock('expo-video', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    VideoView: ({ player, fullscreenOptions, nativeControls, contentFit, playsInline, ...props }: any) =>
      React.createElement(View, {
        ...props,
        testID: props.testID ?? 'expo-video-view',
      }),
    useVideoPlayer: jest.fn((_source: unknown, setup?: (player: any) => void) => {
      const player = {
        addListener: jest.fn(() => ({ remove: jest.fn() })),
        currentTime: 0,
        loop: false,
        pause: jest.fn(),
        play: jest.fn(),
        playing: false,
        status: 'idle',
      };

      setup?.(player);

      return player;
    }),
  };
});

jest.mock('react-native-keyboard-controller', () => {
  const React = require('react');
  const { ScrollView, View } = require('react-native');

  return {
    __esModule: true,
    KeyboardAwareScrollView: ({ children, ...props }: any) =>
      React.createElement(ScrollView, props, children),
    KeyboardController: {
      dismiss: jest.fn(),
      isVisible: jest.fn(() => false),
      preload: jest.fn(),
      setDefaultMode: jest.fn(),
      setFocusTo: jest.fn(),
      setInputMode: jest.fn(),
    },
    KeyboardProvider: ({ children }: any) => children,
    KeyboardToolbar: ({ children, ...props }: any) =>
      React.createElement(View, props, children),
    useKeyboardAnimation: () => ({
      height: { value: 0 },
      progress: { value: 0 },
    }),
    useKeyboardHandler: jest.fn(),
    useKeyboardState: (selector?: (state: unknown) => unknown) => {
      const state = {
        appearance: 'light',
        height: 0,
        isVisible: false,
      };

      return selector ? selector(state) : state;
    },
    useReanimatedKeyboardAnimation: () => ({
      height: { value: 0 },
      progress: { value: 0 },
    }),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 40, bottom: 20, left: 0, right: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 375, height: 812 }),
  SafeAreaProvider: ({ children }: any) => children,
  SafeAreaView: ({ children }: any) => children,
}));
