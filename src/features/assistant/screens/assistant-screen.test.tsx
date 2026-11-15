import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { getAssistantConfigDto } from '@/services/assistant.service';
import { ASSISTANT_FIXTURE_FLOWS } from '../__fixtures__';
import { trackAssistantEvent } from '../services/assistant-events';
import { closeAssistant } from '../services/assistant-session-flow';
import { useAssistantStore } from '../store/use-assistant-store';
import { AssistantScreen } from './assistant-screen';

jest.mock('expo-router', () => {
  const React = jest.requireActual('react');
  return {
    useFocusEffect: (effect: () => void | (() => void)) => React.useEffect(effect, [effect]),
    useRouter: () => ({ back: jest.fn(), canGoBack: () => true, push: jest.fn(), replace: jest.fn() }),
  };
});
jest.mock('@/services/assistant.service', () => ({
  ...jest.requireActual('@/services/assistant.service'),
  getAssistantConfigDto: jest.fn(),
}));
jest.mock('../services/assistant-session-flow', () => ({
  closeAssistant: jest.fn(),
  ensureConversation: jest.fn().mockResolvedValue(undefined),
  retrySessionStart: jest.fn(),
}));
jest.mock('../services/assistant-events', () => ({
  trackAssistantEvent: jest.fn(),
  trackAssistantClientError: jest.fn(),
}));

const configSteps = ASSISTANT_FIXTURE_FLOWS.config.steps;
const enabledConfig = configSteps[0].response.body;
const disabledConfig = configSteps[1].response.body;

beforeEach(() => {
  jest.clearAllMocks();
  act(() => {
    useAssistantStore.getState().resetConversation();
    useAssistantStore.setState({ disabled: false, config: null });
  });
});

describe('AssistantScreen', () => {
  it('input.mode "none" iken yazı kutusu yok; "text" gelince var (kabul 51)', async () => {
    (getAssistantConfigDto as jest.Mock).mockResolvedValue(enabledConfig);
    renderWithTamagui(<AssistantScreen />);
    expect(await screen.findByTestId('assistant-message-list')).toBeTruthy();
    expect(screen.queryByTestId('assistant-composer')).toBeNull();
    act(() =>
      useAssistantStore
        .getState()
        .setTurnState({ mode: 'text', placeholder: 'Mesajınızı yazın…', maxlength: 500 }, []),
    );
    expect(screen.getByTestId('assistant-composer')).toBeTruthy();
    expect(screen.getByLabelText('Mesajınızı yazın…')).toBeTruthy();
  });

  it('/config kapalıysa sohbet çizilmez, yedek Canlı Destek gösterilir (kural 13)', async () => {
    (getAssistantConfigDto as jest.Mock).mockResolvedValue(disabledConfig);
    renderWithTamagui(<AssistantScreen />, 'dark');
    expect(await screen.findByTestId('assistant-unavailable')).toBeTruthy();
    expect(screen.queryByTestId('assistant-message-list')).toBeNull();
  });

  const widgetCloseCalls = () =>
    (trackAssistantEvent as jest.Mock).mock.calls.filter(([type]) => type === 'widget_close');

  it('geri ile ayrılınca (sohbet korunur) odak kaybında widget_close gider', async () => {
    (getAssistantConfigDto as jest.Mock).mockResolvedValue(enabledConfig);
    const { unmount } = renderWithTamagui(<AssistantScreen />);
    expect(await screen.findByTestId('assistant-message-list')).toBeTruthy();

    unmount();

    expect(closeAssistant).not.toHaveBeenCalled();
    expect(widgetCloseCalls()).toHaveLength(1);
  });

  it('X ile kapatınca widget_close yalnız closeAssistant\'tan gider; odak kaybı ikinci olay atmaz', async () => {
    (getAssistantConfigDto as jest.Mock).mockResolvedValue(enabledConfig);
    const { unmount } = renderWithTamagui(<AssistantScreen />);
    expect(await screen.findByTestId('assistant-message-list')).toBeTruthy();

    fireEvent.press(screen.getByTestId('assistant-close'));
    unmount();

    expect(closeAssistant).toHaveBeenCalledTimes(1);
    expect(widgetCloseCalls()).toHaveLength(0);
  });

  it('/config alınamazsa yeniden deneme durumu gösterilir', async () => {
    (getAssistantConfigDto as jest.Mock).mockRejectedValue(new Error('network'));
    renderWithTamagui(<AssistantScreen />);
    await waitFor(() => expect(screen.getByText('Tekrar dene')).toBeTruthy());
  });
});
