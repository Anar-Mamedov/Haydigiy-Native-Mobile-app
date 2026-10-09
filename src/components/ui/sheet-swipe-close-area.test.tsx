import { fireEvent, screen } from '@testing-library/react-native';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SHEET_SWIPE_CLOSE_DISTANCE, SheetSwipeCloseArea } from '@/components/ui/sheet-swipe-close-area';
import { renderWithTamagui } from '@/test/render-with-tamagui';

function swipe(distance: number, durationMs: number) {
  const area = screen.getByTestId('swipe-area');
  fireEvent(area, 'touchStart', { nativeEvent: { pageY: 100, timestamp: 1000 } });
  fireEvent(area, 'touchEnd', { nativeEvent: { pageY: 100 + distance, timestamp: 1000 + durationMs } });
}

function renderArea(props: { onClose: () => void; disabled?: boolean }, theme?: 'dark') {
  return renderWithTamagui(
    <SheetSwipeCloseArea testID="swipe-area" {...props}>
      <Paragraph>Kuponlarım</Paragraph>
    </SheetSwipeCloseArea>,
    theme,
  );
}

describe('SheetSwipeCloseArea', () => {
  it('closes when swiped down past the threshold', () => {
    const onClose = jest.fn();
    renderArea({ onClose });

    swipe(SHEET_SWIPE_CLOSE_DISTANCE + 10, 600);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on a short but fast downward fling', () => {
    const onClose = jest.fn();
    renderArea({ onClose });

    swipe(70, 40);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('stays open for taps, short slow drags and upward swipes', () => {
    const onClose = jest.fn();
    renderArea({ onClose });

    swipe(0, 80);
    swipe(40, 600);
    swipe(-200, 100);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('ignores a cancelled touch and swipes while disabled', () => {
    const onClose = jest.fn();
    const { rerender } = renderArea({ onClose });

    const area = screen.getByTestId('swipe-area');
    fireEvent(area, 'touchStart', { nativeEvent: { pageY: 100, timestamp: 1000 } });
    fireEvent(area, 'touchCancel');
    fireEvent(area, 'touchEnd', { nativeEvent: { pageY: 400, timestamp: 1500 } });

    rerender(
      <SheetSwipeCloseArea disabled onClose={onClose} testID="swipe-area">
        <Paragraph>Kuponlarım</Paragraph>
      </SheetSwipeCloseArea>,
    );
    swipe(300, 300);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('keeps its content visible in the dark theme', () => {
    renderArea({ onClose: jest.fn() }, 'dark');

    expect(screen.getByText('Kuponlarım')).toBeTruthy();
  });
});
