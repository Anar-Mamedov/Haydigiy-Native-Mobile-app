import { screen } from '@testing-library/react-native';
import { ProfileAppUpdateBanner } from './profile-app-update-banner';
import { renderWithTamagui } from '@/test/render-with-tamagui';

let mockIsUpdateAvailable = true;

jest.mock('../context/app-update-context', () => ({
  useAppUpdate: () => ({
    dismissHomeBanner: jest.fn(),
    errorMessage: null,
    installedVersionLabel: '2.3.10 (27)',
    isHomeBannerVisible: true,
    isOpeningStore: false,
    isUpdateAvailable: mockIsUpdateAvailable,
    openStore: jest.fn(),
  }),
}));

describe('ProfileAppUpdateBanner', () => {
  beforeEach(() => {
    mockIsUpdateAvailable = true;
  });

  it('stays visible on the profile while an update is available', () => {
    renderWithTamagui(<ProfileAppUpdateBanner />);

    expect(screen.getByText('Uygulamanın yeni bir sürümü var!')).toBeTruthy();
    expect(screen.queryByText('Hayır')).toBeNull();
  });

  it('disappears after the installed app becomes current', () => {
    mockIsUpdateAvailable = false;

    renderWithTamagui(<ProfileAppUpdateBanner />);

    expect(screen.queryByText('Uygulamanın yeni bir sürümü var!')).toBeNull();
  });
});
