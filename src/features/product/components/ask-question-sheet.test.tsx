import { screen } from '@testing-library/react-native';
import { AskQuestionSheet } from './ask-question-sheet';
import { renderWithTamagui } from '@/test/render-with-tamagui';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: () => false, push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const SheetRoot = function SheetRoot({ children, open, ...props }: any) {
    if (!open) return null;
    return React.createElement(View, { testID: 'ask-question-sheet', ...props }, children);
  };
  SheetRoot.Overlay = function SheetOverlay(props: any) {
    return React.createElement(View, { testID: 'ask-question-sheet-overlay', ...props });
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(View, { testID: 'ask-question-sheet-frame', ...props }, children);
  };

  return { ...jest.requireActual('tamagui'), Sheet: SheetRoot };
});

jest.mock('@/features/auth/hooks/use-auth-status', () => ({
  useAuthStatus: () => ({ isAuthenticated: true, isLoading: false }),
}));

jest.mock('../api/product-questions.queries', () => ({
  useAskProductQuestionMutation: () => ({ isPending: false, mutateAsync: jest.fn() }),
}));

describe('AskQuestionSheet', () => {
  it('keeps the question form keyboard-aware inside the sheet', () => {
    renderWithTamagui(<AskQuestionSheet onClose={jest.fn()} open productId={1} slug="test-urun" />);

    expect(screen.getByTestId('ask-question-sheet').props.moveOnKeyboardChange).toBe(true);

    const scroller = screen.getByTestId('ask-question-keyboard-aware-scroll');
    expect(scroller.props.keyboardShouldPersistTaps).toBe('handled');
    expect(scroller.props.bounces).toBe(false);
    expect(scroller.props.alwaysBounceVertical).toBe(false);
    expect(scroller.props.overScrollMode).toBe('never');
    expect(screen.getByPlaceholderText('Sorunuzu yazın...')).toBeTruthy();
  });
});
