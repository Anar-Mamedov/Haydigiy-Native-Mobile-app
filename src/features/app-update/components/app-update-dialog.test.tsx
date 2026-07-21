import { fireEvent, screen } from '@testing-library/react-native';
import { AppUpdateDialog } from './app-update-dialog';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('AppUpdateDialog', () => {
  const baseProps = {
    open: true,
    isOpeningStore: false,
    errorMessage: null,
    onDismiss: jest.fn(),
    onConfirm: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the requested message and choices', () => {
    renderWithTamagui(<AppUpdateDialog {...baseProps} />);

    expect(
      screen.getByText('Uygulamanın Yeni Sürümü Yayınlandı. Güncellemek İstiyor musunuz?'),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Evet' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Hayır' })).toBeTruthy();
  });

  it('calls the corresponding callback for each choice', () => {
    renderWithTamagui(<AppUpdateDialog {...baseProps} />);

    fireEvent.press(screen.getByRole('button', { name: 'Evet' }));
    fireEvent.press(screen.getByRole('button', { name: 'Hayır' }));

    expect(baseProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(baseProps.onDismiss).toHaveBeenCalledTimes(1);
  });

  it('shows store errors without dismissing the dialog', () => {
    renderWithTamagui(
      <AppUpdateDialog {...baseProps} errorMessage="Uygulama mağazası açılamadı." />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Uygulama mağazası açılamadı.');
  });
});
