import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { DEFAULT_ASSISTANT_TEXTS } from '../utils/assistant-texts';
import { AssistantLauncher } from './assistant-launcher';

const mockPush = jest.fn();
let mockPathname = '/';
let mockAvailable = true;

jest.mock('expo-router', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush }),
}));
jest.mock('../hooks/use-assistant-availability', () => ({
  useAssistantAvailability: () => ({
    available: mockAvailable,
    config: { texts: jest.requireActual('../utils/assistant-texts').DEFAULT_ASSISTANT_TEXTS },
  }),
}));

describe('AssistantLauncher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = '/';
    mockAvailable = true;
  });

  it('mobil webdeki gibi yazısız yuvarlak düğme; ekran okuyucu open_label okur, dokununca sohbet açılır', () => {
    renderWithTamagui(<AssistantLauncher />);
    expect(screen.queryByText(DEFAULT_ASSISTANT_TEXTS.launcher_label)).toBeNull();
    fireEvent.press(screen.getByLabelText(DEFAULT_ASSISTANT_TEXTS.open_label));
    expect(mockPush).toHaveBeenCalledWith('/assistant');
  });

  it('seçili ekranlar dışında ve asistan kapalıyken çizilmez', () => {
    mockPathname = '/cart';
    const { rerender } = renderWithTamagui(<AssistantLauncher />);
    expect(screen.queryByTestId('assistant-launcher')).toBeNull();
    mockPathname = '/';
    mockAvailable = false;
    rerender(<AssistantLauncher />);
    expect(screen.queryByTestId('assistant-launcher')).toBeNull();
  });

  it('koyu temada da çizilir', () => {
    renderWithTamagui(<AssistantLauncher />, 'dark');
    expect(screen.getByTestId('assistant-launcher')).toBeTruthy();
  });
});
