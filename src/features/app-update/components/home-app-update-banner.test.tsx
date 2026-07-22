/* eslint-disable @typescript-eslint/no-require-imports */
import { fireEvent, screen } from '@testing-library/react-native';
import { HomeAppUpdateBanner } from './home-app-update-banner';
import { renderWithTamagui } from '@/test/render-with-tamagui';

type MockGestureHandler = (event: Record<string, number>) => void;
type MockGesture = {
  handlers: Record<string, MockGestureHandler>;
};

const mockDismissHomeBanner = jest.fn();
const mockOpenStore = jest.fn(async () => undefined);
let mockPathname = '/';
let mockIsHomeBannerVisible = true;

jest.mock('expo-router', () => ({
  usePathname: () => mockPathname,
}));

jest.mock('../context/app-update-context', () => ({
  useAppUpdate: () => ({
    dismissHomeBanner: mockDismissHomeBanner,
    errorMessage: null,
    installedVersionLabel: '2.3.10 (27)',
    isHomeBannerVisible: mockIsHomeBannerVisible,
    isOpeningStore: false,
    isUpdateAvailable: true,
    openStore: mockOpenStore,
  }),
}));

jest.mock('react-native-gesture-handler', () => {
  const createdGestures: MockGesture[] = [];

  const createGesture = () => {
    const gesture = { handlers: {} } as MockGesture & Record<string, unknown>;

    for (const method of ['activeOffsetX', 'failOffsetY']) {
      gesture[method] = () => gesture;
    }

    for (const handler of ['onUpdate', 'onEnd', 'onFinalize']) {
      gesture[handler] = (callback: MockGestureHandler) => {
        gesture.handlers[handler] = callback;
        return gesture;
      };
    }

    createdGestures.push(gesture);
    return gesture;
  };

  return {
    __createdGestures: createdGestures,
    Gesture: { Pan: createGesture },
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: { View },
    Easing: {
      cubic: (value: number) => value,
      out: (easing: unknown) => easing,
    },
    interpolate: () => 1,
    runOnJS: (callback: (...args: unknown[]) => void) => callback,
    useAnimatedStyle: (factory: () => Record<string, unknown>) => factory(),
    useSharedValue: (initial: unknown) => React.useRef({ value: initial }).current,
    withSpring: (value: unknown) => value,
    withTiming: (
      value: unknown,
      _config: unknown,
      callback?: (finished: boolean) => void,
    ) => {
      callback?.(true);
      return value;
    },
  };
});

function getLastPanGesture(): MockGesture {
  const gestures = require('react-native-gesture-handler').__createdGestures as MockGesture[];
  const gesture = gestures.at(-1);
  if (!gesture) throw new Error('No pan gesture was created.');
  return gesture;
}

describe('HomeAppUpdateBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = '/';
    mockIsHomeBannerVisible = true;
  });

  it('renders directly above the tab bar on the home route', () => {
    renderWithTamagui(<HomeAppUpdateBanner />);

    expect(screen.getByLabelText('Yeni uygulama sürümü bildirimi')).toBeTruthy();
    expect(screen.getByText('Mevcut Sürüm: 2.3.10 (27)')).toBeTruthy();
  });

  it('opens the store from the update action', () => {
    renderWithTamagui(<HomeAppUpdateBanner />);

    fireEvent.press(screen.getByRole('button', { name: 'Uygulamayı Güncelle' }));

    expect(mockOpenStore).toHaveBeenCalledTimes(1);
  });

  it('dismisses after a horizontal swipe passes the threshold', () => {
    renderWithTamagui(<HomeAppUpdateBanner />);
    const pan = getLastPanGesture();

    pan.handlers.onUpdate({ translationX: 120 });
    pan.handlers.onEnd({ translationX: 120, velocityX: 0 });
    pan.handlers.onFinalize({});

    expect(mockDismissHomeBanner).toHaveBeenCalledTimes(1);
  });

  it('does not render outside the exact home route', () => {
    mockPathname = '/kategori/sicak-yaz-indirimleri';

    renderWithTamagui(<HomeAppUpdateBanner />);

    expect(screen.queryByLabelText('Yeni uygulama sürümü bildirimi')).toBeNull();
  });

  it('does not render after the home banner has been dismissed', () => {
    mockIsHomeBannerVisible = false;

    renderWithTamagui(<HomeAppUpdateBanner />);

    expect(screen.queryByLabelText('Yeni uygulama sürümü bildirimi')).toBeNull();
  });
});
