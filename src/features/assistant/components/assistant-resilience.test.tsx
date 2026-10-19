import { fireEvent, screen } from '@testing-library/react-native';
import { useVideoPlayer } from 'expo-video';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { DEFAULT_ASSISTANT_TEXTS } from '../utils/assistant-texts';
import { AssistantScreenErrorBoundary } from './assistant-error-boundary';
import { AssistantVideo } from './blocks/assistant-media-blocks';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: () => true, push: jest.fn(), replace: jest.fn() }),
}));
jest.mock('../services/assistant-events', () => ({ trackAssistantEvent: jest.fn(), trackAssistantClientError: jest.fn() }));

const video = { type: 'video' as const, id: 'b7', url: 'https://cdn.haydigiy.com/haydi-asistan/videos/a.mp4' };

describe('AssistantVideo', () => {
  beforeEach(() => jest.clearAllMocks());

  it('dokunulana kadar oynatıcı kurulmaz (tembel); dokununca oynatıcı açılır', () => {
    renderWithTamagui(<AssistantVideo block={video} texts={DEFAULT_ASSISTANT_TEXTS} />);
    expect(useVideoPlayer).not.toHaveBeenCalled();
    expect(screen.queryByTestId('assistant-video-b7')).toBeNull();
    fireEvent.press(screen.getByLabelText(DEFAULT_ASSISTANT_TEXTS.video_label));
    expect(useVideoPlayer).toHaveBeenCalledWith(video.url, expect.any(Function));
    expect(screen.getByTestId('assistant-video-b7')).toBeTruthy();
  });
});

describe('AssistantScreenErrorBoundary', () => {
  it('yedek metin, Tekrar dene ve Canlı Destek gösterir; Tekrar dene yeniden dener', () => {
    const retry = jest.fn().mockResolvedValue(undefined);
    renderWithTamagui(<AssistantScreenErrorBoundary error={new Error('x')} retry={retry} />, 'dark');
    expect(screen.getByTestId('assistant-error-boundary')).toBeTruthy();
    expect(screen.getByLabelText('💬 Canlı Destek')).toBeTruthy();
    fireEvent.press(screen.getByText(DEFAULT_ASSISTANT_TEXTS.retry));
    expect(retry).toHaveBeenCalled();
  });
});
