import { fireEvent, screen } from '@testing-library/react-native';
import { AppUpdateBanner } from './app-update-banner';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('AppUpdateBanner', () => {
  const baseProps = {
    errorMessage: null,
    installedVersionLabel: '2.3.10 (27)',
    isOpeningStore: false,
    onUpdatePress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the installed version and update action', () => {
    renderWithTamagui(<AppUpdateBanner {...baseProps} />);

    expect(screen.getByText('Mevcut Sürüm: 2.3.10 (27)')).toHaveStyle({
      color: 'hsla(0, 0%, 30%, 1)',
    });
    expect(screen.getByText('Uygulamanın yeni bir sürümü var!')).toHaveStyle({
      fontWeight: '700',
    });
    expect(screen.getByTestId('app-update-phone-icon')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Uygulamayı Güncelle' })).toBeTruthy();
  });

  it('opens the store when the update action is pressed', () => {
    renderWithTamagui(<AppUpdateBanner {...baseProps} />);

    fireEvent.press(screen.getByRole('button', { name: 'Uygulamayı Güncelle' }));

    expect(baseProps.onUpdatePress).toHaveBeenCalledTimes(1);
  });

  it('shows store errors and the opening state accessibly', () => {
    renderWithTamagui(
      <AppUpdateBanner
        {...baseProps}
        errorMessage="Uygulama mağazası açılamadı."
        isOpeningStore
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Uygulama mağazası açılamadı.');
    expect(screen.getByText('Açılıyor...')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Uygulamayı Güncelle' })).toBeDisabled();
  });
});
