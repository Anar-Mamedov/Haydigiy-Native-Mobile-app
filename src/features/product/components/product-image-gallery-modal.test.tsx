/* eslint-disable @typescript-eslint/no-require-imports */
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ProductImageGalleryModal } from './product-image-gallery-modal';

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');

  type MockGestureMethod =
    | 'activeOffsetY'
    | 'enabled'
    | 'failOffsetX'
    | 'numberOfTaps'
    | 'onEnd'
    | 'onUpdate';
  type MockGesture = Record<MockGestureMethod, jest.Mock>;

  const createGesture = () => {
    const gesture = {} as MockGesture;

    gesture.activeOffsetY = jest.fn(() => gesture);
    gesture.enabled = jest.fn(() => gesture);
    gesture.failOffsetX = jest.fn(() => gesture);
    gesture.numberOfTaps = jest.fn(() => gesture);
    gesture.onEnd = jest.fn(() => gesture);
    gesture.onUpdate = jest.fn(() => gesture);

    return gesture;
  };

  return {
    Gesture: {
      Pan: createGesture,
      Pinch: createGesture,
      Simultaneous: jest.fn((...gestures: unknown[]) => gestures),
      Tap: createGesture,
    },
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
    GestureHandlerRootView: ({ children, ...props }: { children: React.ReactNode }) =>
      React.createElement(View, props, children),
  };
});

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: {
      View,
    },
    runOnJS: (callback: () => void) => callback,
    useAnimatedStyle: (factory: () => Record<string, unknown>) => factory(),
    useSharedValue: (value: unknown) => ({ value }),
    withTiming: (value: unknown) => value,
  };
});

const images = [
  'https://example.com/product-a.jpg',
  'https://example.com/product-b.jpg',
];

describe('ProductImageGalleryModal', () => {
  it('renders the selected image gallery and closes from the top action', () => {
    const onClose = jest.fn();

    renderWithTamagui(
      <ProductImageGalleryModal
        images={images}
        initialIndex={1}
        onClose={onClose}
        open
      />,
    );

    expect(screen.getByTestId('product-image-gallery-modal')).toBeTruthy();
    expect(screen.getByText('2 / 2')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Kapat'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when closed', () => {
    renderWithTamagui(
      <ProductImageGalleryModal
        images={images}
        initialIndex={0}
        onClose={jest.fn()}
        open={false}
      />,
    );

    expect(screen.queryByTestId('product-image-gallery-modal')).toBeNull();
  });
});
