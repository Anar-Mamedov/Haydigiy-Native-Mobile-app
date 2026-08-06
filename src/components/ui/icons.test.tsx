import { screen } from '@testing-library/react-native';
import { useWindowDimensions } from 'react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { COMPACT_MAX_FONT_SCALE, MAX_FONT_SCALE } from '@/lib/theme/font-scale';
import { ArrowLeft } from './icons';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions');

const useWindowDimensionsMock = useWindowDimensions as unknown as jest.Mock;

function mockFontScale(fontScale: number) {
  useWindowDimensionsMock.mockReturnValue({ fontScale, height: 812, scale: 3, width: 375 });
}

describe('scaled icons', () => {
  it('keeps the designed size at the default text setting', () => {
    mockFontScale(1);

    renderWithTamagui(<ArrowLeft size={22} testID="icon" />);

    expect(screen.getByTestId('icon').props.width).toBe(22);
  });

  it('grows with the OS text size so it stays in proportion', () => {
    mockFontScale(1.3);

    renderWithTamagui(<ArrowLeft size={22} testID="icon" />);

    expect(screen.getByTestId('icon').props.width).toBe(Math.round(22 * 1.3));
  });

  it('stops at the same cap as the text', () => {
    mockFontScale(3.1);

    renderWithTamagui(<ArrowLeft size={22} testID="icon" />);

    expect(screen.getByTestId('icon').props.width).toBe(Math.round(22 * MAX_FONT_SCALE));
  });

  it('honours a tighter cap on constrained surfaces', () => {
    mockFontScale(2);

    renderWithTamagui(<ArrowLeft maxFontScale={COMPACT_MAX_FONT_SCALE} size={18} testID="icon" />);

    expect(screen.getByTestId('icon').props.width).toBe(Math.round(18 * COMPACT_MAX_FONT_SCALE));
  });

  it('never shrinks below the designed size', () => {
    mockFontScale(0.8);

    renderWithTamagui(<ArrowLeft size={22} testID="icon" />);

    expect(screen.getByTestId('icon').props.width).toBe(22);
  });
});
