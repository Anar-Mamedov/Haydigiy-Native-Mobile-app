/* eslint-disable @typescript-eslint/no-require-imports */
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PullToDismissScrollView } from './pull-to-dismiss-scroll-view';

type MockGestureHandler = (event: Record<string, number>) => void;
type MockGesture = {
  __type: 'pan' | 'native';
  config: Record<string, unknown[]>;
  handlers: Record<string, MockGestureHandler>;
};

jest.mock('react-native-gesture-handler', () => {
  const createdGestures: MockGesture[] = [];

  const createGesture = (type: MockGesture['__type']) => {
    const gesture = { __type: type, config: {}, handlers: {} } as MockGesture & Record<string, unknown>;

    for (const method of ['activeOffsetY', 'enabled', 'failOffsetX', 'simultaneousWithExternalGesture']) {
      gesture[method] = (...args: unknown[]) => {
        gesture.config[method] = args;
        return gesture;
      };
    }

    for (const handler of ['onStart', 'onUpdate', 'onEnd', 'onFinalize']) {
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
    Gesture: {
      Native: () => createGesture('native'),
      Pan: () => createGesture('pan'),
    },
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { ScrollView, View } = require('react-native');

  const scrollToMock = jest.fn();

  return {
    __esModule: true,
    __scrollToMock: scrollToMock,
    default: { ScrollView, View },
    Easing: {
      cubic: (value: number) => value,
      out: (easing: unknown) => easing,
    },
    runOnJS: (callback: (...args: unknown[]) => void) => callback,
    scrollTo: scrollToMock,
    useAnimatedRef: () => React.useRef(null),
    // Animated scroll handlers receive the event payload, not the synthetic event.
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
    withTiming: (value: unknown) => value,
  };
});

function getCreatedGestures(): MockGesture[] {
  return require('react-native-gesture-handler').__createdGestures;
}

function getLastGesture(type: MockGesture['__type']): MockGesture {
  const gesture = [...getCreatedGestures()].reverse().find((candidate) => candidate.__type === type);
  if (!gesture) throw new Error(`no ${type} gesture was created`);
  return gesture;
}

function getScrollToMock(): jest.Mock {
  return require('react-native-reanimated').__scrollToMock;
}

function renderPullToDismiss(props: Partial<React.ComponentProps<typeof PullToDismissScrollView>> = {}) {
  const onDismiss = jest.fn();
  render(
    <PullToDismissScrollView onDismiss={onDismiss} testID="pull-scroll" {...props}>
      <Text>içerik</Text>
    </PullToDismissScrollView>,
  );
  return { onDismiss, pan: getLastGesture('pan') };
}

function fireScroll(offsetY: number) {
  fireEvent.scroll(screen.getByTestId('pull-scroll'), {
    nativeEvent: { contentOffset: { y: offsetY } },
  });
}

beforeEach(() => {
  getScrollToMock().mockClear();
});

describe('PullToDismissScrollView', () => {
  it('renders its children inside the scroll view', () => {
    renderPullToDismiss();

    expect(screen.getByText('içerik')).toBeTruthy();
  });

  it('dismisses when pulled past the threshold while at the top', () => {
    const { onDismiss, pan } = renderPullToDismiss();

    pan.handlers.onStart({ translationY: 0 });
    pan.handlers.onUpdate({ translationY: 200 });
    pan.handlers.onEnd({ translationY: 200, velocityY: 0 });
    pan.handlers.onFinalize({});

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('snaps back without dismissing when released below the threshold', () => {
    const { onDismiss, pan } = renderPullToDismiss();

    pan.handlers.onStart({ translationY: 0 });
    pan.handlers.onUpdate({ translationY: 60 });
    pan.handlers.onEnd({ translationY: 60, velocityY: 0 });
    pan.handlers.onFinalize({});

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('dismisses on a fast downward fling before the full distance', () => {
    const { onDismiss, pan } = renderPullToDismiss();

    pan.handlers.onStart({ translationY: 0 });
    pan.handlers.onUpdate({ translationY: 70 });
    pan.handlers.onEnd({ translationY: 70, velocityY: 1600 });
    pan.handlers.onFinalize({});

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('never dismisses while the content is scrolled away from the top', () => {
    const { onDismiss, pan } = renderPullToDismiss();

    fireScroll(400);

    pan.handlers.onStart({ translationY: 0 });
    pan.handlers.onUpdate({ translationY: 300 });
    pan.handlers.onEnd({ translationY: 300, velocityY: 0 });
    pan.handlers.onFinalize({});

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('re-anchors mid-drag so the pull only counts from the moment the top is reached', () => {
    const { onDismiss, pan } = renderPullToDismiss();

    // Drag starts mid-list: the translation so far must not count as a pull.
    fireScroll(400);
    pan.handlers.onStart({ translationY: 0 });
    pan.handlers.onUpdate({ translationY: 100 });

    // The same drag brings the content to the top; from here the pull engages.
    fireScroll(0);
    pan.handlers.onUpdate({ translationY: 220 });
    pan.handlers.onEnd({ translationY: 220, velocityY: 0 });
    pan.handlers.onFinalize({});

    // Raw translation (220) exceeds the threshold but the engaged pull is only
    // 120, so the screen must stay.
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('locks the scroll to the top while a pull is engaged (anti-jitter)', () => {
    renderPullToDismiss();
    const pan = getLastGesture('pan');

    // Engage the pull at the top.
    pan.handlers.onStart({ translationY: 0 });
    pan.handlers.onUpdate({ translationY: 80 });

    // A finger wobble makes the scroll view consume a few pixels: the handler
    // must revert it in the same frame instead of letting it fight the pull.
    fireScroll(6);

    expect(getScrollToMock()).toHaveBeenCalledWith(expect.anything(), 0, 0, false);
  });

  it('keeps an engaged pull alive through scroll wobbles instead of snapping it away', () => {
    const { onDismiss, pan } = renderPullToDismiss();

    pan.handlers.onStart({ translationY: 0 });
    pan.handlers.onUpdate({ translationY: 80 });

    // Wobble: the scroll view briefly reports a non-top offset mid-pull.
    fireScroll(6);

    // The pull must continue following the finger from its original anchor and
    // still dismiss on release — a snapped/reset pull would not reach the
    // threshold from this gesture.
    pan.handlers.onUpdate({ translationY: 200 });
    pan.handlers.onEnd({ translationY: 200, velocityY: 0 });
    pan.handlers.onFinalize({});

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('reports pinned offsets as 0 to the caller while pulled', () => {
    const onScrollOffsetChange = jest.fn();
    renderPullToDismiss({ onScrollOffsetChange });
    const pan = getLastGesture('pan');

    pan.handlers.onStart({ translationY: 0 });
    pan.handlers.onUpdate({ translationY: 80 });

    fireScroll(6);

    expect(onScrollOffsetChange).toHaveBeenLastCalledWith(0);
  });

  it('streams scroll offsets to the caller during normal scrolling', () => {
    const onScrollOffsetChange = jest.fn();
    renderPullToDismiss({ onScrollOffsetChange });

    fireScroll(120);

    expect(onScrollOffsetChange).toHaveBeenLastCalledWith(120);
    expect(getScrollToMock()).not.toHaveBeenCalled();
  });

  it('disables top-edge overscroll so the pull gesture owns the top edge', () => {
    renderPullToDismiss();

    const scrollView = screen.getByTestId('pull-scroll');
    expect(scrollView.props.bounces).toBe(false);
    expect(scrollView.props.overScrollMode).toBe('never');
  });

  it('runs the pan simultaneously with the scroll gesture and honours dismissEnabled', () => {
    const { pan } = renderPullToDismiss({ dismissEnabled: false });

    const native = getLastGesture('native');
    expect(pan.config.simultaneousWithExternalGesture).toEqual([native]);
    expect(pan.config.enabled).toEqual([false]);
  });
});
