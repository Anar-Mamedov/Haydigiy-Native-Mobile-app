import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { CookieConsentSheet } from './cookie-consent-sheet';

jest.mock('tamagui', () => {
  const actual = jest.requireActual('tamagui');
  const React = jest.requireActual('react');

  const SheetRoot = function SheetRoot({ children, open }: any) {
    return open ? React.createElement(React.Fragment, null, children) : null;
  };
  SheetRoot.Overlay = function SheetOverlay() {
    return null;
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(actual.YStack, props, children);
  };

  return { ...actual, Sheet: SheetRoot };
});

describe('CookieConsentSheet', () => {
  const handlers = {
    onAcceptAll: jest.fn(),
    onOpenPreferences: jest.fn(),
    onRejectAll: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('offers all three choices', () => {
    renderWithTamagui(<CookieConsentSheet {...handlers} open />);

    expect(screen.getByText('SANA ÖZEL BİR DENEYİM İÇİN ÇALIŞIYORUZ')).toBeTruthy();
    expect(screen.getByTestId('consent-accept-all')).toBeTruthy();
    expect(screen.getByTestId('consent-open-preferences')).toBeTruthy();
    expect(screen.getByTestId('consent-reject-all')).toBeTruthy();
  });

  it('reports the chosen action', () => {
    renderWithTamagui(<CookieConsentSheet {...handlers} open />);

    fireEvent.press(screen.getByTestId('consent-reject-all'));
    expect(handlers.onRejectAll).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByTestId('consent-open-preferences'));
    expect(handlers.onOpenPreferences).toHaveBeenCalledTimes(1);
  });

  it('stays readable in dark theme', () => {
    renderWithTamagui(<CookieConsentSheet {...handlers} open />, 'dark');

    expect(screen.getByText('SANA ÖZEL BİR DENEYİM İÇİN ÇALIŞIYORUZ')).toBeTruthy();
    expect(screen.getByTestId('consent-accept-all')).toBeTruthy();
  });

  it('renders nothing while closed', () => {
    renderWithTamagui(<CookieConsentSheet {...handlers} open={false} />);

    expect(screen.queryByTestId('cookie-consent-sheet')).toBeNull();
  });
});
