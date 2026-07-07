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

// Manual mock: the real entry (and the official `react-native-reanimated/mock`,
// which re-imports it) instantiates the `react-native-worklets` native module at
// import time and crashes under Jest. Kept to the API surface this app uses;
// test files may override with their own richer mocks.
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { ScrollView, View } = require('react-native');

  return {
    __esModule: true,
    createAnimatedComponent: (component: unknown) => component,
    default: {
      createAnimatedComponent: (component: unknown) => component,
      ScrollView,
      View,
    },
    Easing: {
      cubic: (value: number) => value,
      out: (easing: unknown) => easing,
    },
    runOnJS: (callback: (...args: unknown[]) => void) => callback,
    scrollTo: jest.fn(),
    useAnimatedRef: () => React.useRef(null),
    // Adapts the worklet to a regular onScroll prop: animated handlers receive
    // the event payload (`event.contentOffset`), not the synthetic event.
    useAnimatedScrollHandler: (
      handlerOrConfig:
        | ((event: unknown, context: Record<string, unknown>) => void)
        | { onScroll?: (event: unknown, context: Record<string, unknown>) => void },
    ) => {
      const onScroll =
        typeof handlerOrConfig === 'function' ? handlerOrConfig : handlerOrConfig?.onScroll;
      return (event: { nativeEvent: unknown }) => onScroll?.(event.nativeEvent, {});
    },
    useAnimatedStyle: (factory: () => Record<string, unknown>) => factory(),
    useSharedValue: (initial: unknown) => React.useRef({ value: initial }).current,
    withSpring: (value: unknown) => value,
    withTiming: (value: unknown) => value,
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 40, bottom: 20, left: 0, right: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 375, height: 812 }),
  SafeAreaProvider: ({ children }: any) => children,
  SafeAreaView: ({ children }: any) => children,
}));
