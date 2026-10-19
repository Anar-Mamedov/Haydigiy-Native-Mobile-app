import { Image } from 'expo-image';
import { VideoView, useVideoPlayer, type VideoPlayer } from 'expo-video';
import { useCallback, useEffect, useState } from 'react';
import { YStack } from 'tamagui';
import { Play } from '@/components/ui/icons';
import { useImageAspectRatio } from '@/components/ui/use-image-aspect-ratio';
import type { AssistantImageBlock, AssistantTexts, AssistantVideoBlock } from '@/types/assistant.types';
import { trackAssistantClientError } from '../../services/assistant-events';
import { AssistantMutedText } from '../assistant-surfaces';

const DEFAULT_IMAGE_RATIO = 4 / 3;
const VIDEO_RATIO = 16 / 9;
const MEDIA_RADIUS = 12;
const PLAY_BUTTON_SIZE = 56;

/**
 * Dash'ten eklenen görsel (README §6.7a). Adres doğrulaması çizimden önce yapılmıştır.
 * Oran bilinene kadar varsayılan kutuda yer ayrılır; yüklenemezse soluk bir satır gösterilir.
 */
export function AssistantImage({ block, texts }: { block: AssistantImageBlock; texts: AssistantTexts }) {
  const [failed, setFailed] = useState(false);
  const { aspectRatio, onLoad } = useImageAspectRatio(block.url, DEFAULT_IMAGE_RATIO);

  if (failed) return <AssistantMutedText>{texts.image_failed}</AssistantMutedText>;

  return (
    <YStack backgroundColor="$color3" borderRadius={MEDIA_RADIUS} overflow="hidden">
      <Image
        accessibilityIgnoresInvertColors
        accessibilityLabel={block.alt || undefined}
        accessible={!!block.alt}
        contentFit="contain"
        onError={() => {
          setFailed(true);
          trackAssistantClientError('image_error', block.id);
        }}
        onLoad={onLoad}
        source={{ uri: block.url }}
        style={{ aspectRatio, maxHeight: 420, width: '100%' }}
        testID={`assistant-image-${block.id}`}
      />
    </YStack>
  );
}

/** Aynı anda yalnız bir video oynar: yenisi başlayınca öncekini durdur (README §6.7b). */
let playingPlayer: VideoPlayer | null = null;

type VideoProps = { block: AssistantVideoBlock; texts: AssistantTexts };

/** Oynatıcı yalnız müşteri dokununca kurulur; dokunuş müşterinin "oynat" isteğidir, oynatma başlar. */
function AssistantVideoPlayer({ block, texts, onFailed }: VideoProps & { onFailed: () => void }) {
  const player = useVideoPlayer(block.url, (current) => {
    current.loop = false;
    current.play();
  });

  useEffect(() => {
    const statusSubscription = player.addListener('statusChange', ({ status }) => {
      if (status !== 'error') return;
      onFailed();
      trackAssistantClientError('video_error', block.id);
    });
    const playingSubscription = player.addListener('playingChange', ({ isPlaying }) => {
      if (!isPlaying) return;
      if (playingPlayer && playingPlayer !== player) playingPlayer.pause();
      playingPlayer = player;
    });
    return () => {
      statusSubscription.remove();
      playingSubscription.remove();
      if (playingPlayer === player) playingPlayer = null;
    };
  }, [block.id, onFailed, player]);

  return (
    <VideoView
      accessibilityLabel={texts.video_label}
      contentFit="contain"
      nativeControls
      player={player}
      style={{ aspectRatio: VIDEO_RATIO, width: '100%' }}
      testID={`assistant-video-${block.id}`}
    />
  );
}

/**
 * Dash'ten eklenen video (README §6.7b): kendiliğinden BAŞLAMAZ, döngü yok, indirme yok. Tembel yüklenir:
 * müşteri oynat'a dokunana kadar dosya indirilmez (geçmişte birkaç video olsa da veri harcanmaz).
 * Oynatılamazsa videonun yerine soluk bir satır; mesajın kalanı etkilenmez.
 */
export function AssistantVideo({ block, texts }: VideoProps) {
  const [active, setActive] = useState(false);
  const [failed, setFailed] = useState(false);
  const handleFailed = useCallback(() => setFailed(true), []);

  if (failed) return <AssistantMutedText>{texts.video_failed}</AssistantMutedText>;

  return (
    <YStack backgroundColor="black" borderRadius={MEDIA_RADIUS} overflow="hidden">
      {active ? (
        <AssistantVideoPlayer block={block} onFailed={handleFailed} texts={texts} />
      ) : (
        <YStack
          accessibilityLabel={texts.video_label}
          accessibilityRole="button"
          alignItems="center"
          aspectRatio={VIDEO_RATIO}
          justifyContent="center"
          onPress={() => setActive(true)}
          pressStyle={{ opacity: 0.85 }}
          testID={`assistant-video-poster-${block.id}`}
          width="100%"
        >
          <YStack
            alignItems="center"
            backgroundColor="$brand"
            borderRadius={PLAY_BUTTON_SIZE / 2}
            height={PLAY_BUTTON_SIZE}
            justifyContent="center"
            width={PLAY_BUTTON_SIZE}
          >
            <Play color="white" fill="white" size={26} />
          </YStack>
        </YStack>
      )}
    </YStack>
  );
}
