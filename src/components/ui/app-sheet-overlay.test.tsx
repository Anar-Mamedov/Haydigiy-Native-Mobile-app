import { screen } from '@testing-library/react-native';
import { AppSheetOverlay } from './app-sheet-overlay';
import { renderWithTamagui } from '@/test/render-with-tamagui';

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const Sheet: any = () => null;
  Sheet.Overlay = function SheetOverlay(props: any) {
    return React.createElement(View, { testID: 'app-sheet-overlay', ...props });
  };

  return { ...jest.requireActual('tamagui'), Sheet };
});

describe('AppSheetOverlay', () => {
  it('renders the shared theme-token scrim with fade styles', () => {
    renderWithTamagui(<AppSheetOverlay />);

    const overlay = screen.getByTestId('app-sheet-overlay');
    expect(overlay.props.backgroundColor).toBe('$overlay');
    expect(overlay.props.enterStyle).toEqual({ opacity: 0 });
    expect(overlay.props.exitStyle).toEqual({ opacity: 0 });
  });

  it('allows per-sheet overrides through props', () => {
    renderWithTamagui(<AppSheetOverlay backgroundColor="$shadowColor" opacity={0.8} />);

    const overlay = screen.getByTestId('app-sheet-overlay');
    expect(overlay.props.backgroundColor).toBe('$shadowColor');
    expect(overlay.props.opacity).toBe(0.8);
  });
});
