import { useEffect, useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import { VideoView, useVideoPlayer, type VideoSource } from 'expo-video';
import { Play } from '@tamagui/lucide-icons-2';
import { Paragraph, YStack } from 'tamagui';
import { getVideoSource } from '../utils/video';

type ProductCarouselVideoSlideProps = {
  autoplayRequest: number;
  height: number;
  isActive: boolean;
  onOpenPress?: () => void;
  uri: string;
  width: number;
};

export function ProductCarouselVideoSlide({
  onOpenPress,
  ...props
}: ProductCarouselVideoSlideProps) {
  if (onOpenPress) {
    return <ProductCarouselVideoPreview {...props} onOpenPress={onOpenPress} />;
  }

  return <PlayableProductCarouselVideoSlide {...props} />;
}

function ProductCarouselVideoPreview({
  height,
  onOpenPress,
  width,
}: Omit<ProductCarouselVideoSlideProps, 'autoplayRequest' | 'uri'> & {
  onOpenPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel="Ürün videosunu modalda aç"
      accessibilityRole="button"
      onPress={onOpenPress}
      style={({ pressed }) => ({
        alignItems: 'center',
        backgroundColor: '#111827',
        height,
        justifyContent: 'center',
        opacity: pressed ? 0.85 : 1,
        width,
      })}
    >
      <YStack
        alignItems="center"
        backgroundColor="rgba(242,122,26,0.95)"
        borderRadius={999}
        height={76}
        justifyContent="center"
        width={76}
      >
        <Play size={34} color="white" fill="white" />
      </YStack>
      <Paragraph color="white" fontSize={14} fontWeight="800" marginTop="$3">
        VİDEO
      </Paragraph>
    </Pressable>
  );
}

function PlayableProductCarouselVideoSlide({
  autoplayRequest,
  height,
  isActive,
  uri,
  width,
}: ProductCarouselVideoSlideProps) {
  const [playerErrorMessage, setPlayerErrorMessage] = useState<string | null>(null);
  const videoSource = useMemo<VideoSource>(() => getVideoSource(uri), [uri]);
  const player = useVideoPlayer(videoSource, (currentPlayer) => {
    currentPlayer.loop = true;
  });

  useEffect(() => {
    setPlayerErrorMessage(null);
  }, [uri]);

  useEffect(() => {
    const subscription = player.addListener('statusChange', ({ status, error }) => {
      setPlayerErrorMessage(status === 'error' ? error?.message ?? 'Video oynatılamıyor.' : null);
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  useEffect(() => {
    if (!isActive) {
      player.pause();
      return;
    }

    if (autoplayRequest > 0) {
      player.play();
    }
  }, [autoplayRequest, isActive, player]);

  if (!isActive) {
    return (
      <YStack
        alignItems="center"
        backgroundColor="#111827"
        height={height}
        justifyContent="center"
        width={width}
      >
        <Play size={48} color="white" fill="white" />
        <Paragraph color="white" fontSize={14} fontWeight="800" marginTop="$2">
          VİDEO
        </Paragraph>
      </YStack>
    );
  }

  return (
    <YStack backgroundColor="#000" height={height} width={width}>
      <VideoView
        testID="product-carousel-video"
        player={player}
        nativeControls
        contentFit="contain"
        fullscreenOptions={{ enable: true }}
        playsInline
        surfaceType="textureView"
        style={{ width, height }}
      />
      {playerErrorMessage ? (
        <YStack
          alignItems="center"
          bottom={0}
          justifyContent="center"
          left={0}
          padding="$3"
          position="absolute"
          right={0}
          top={0}
        >
          <Paragraph color="white" fontSize={14} fontWeight="700" textAlign="center">
            {playerErrorMessage}
          </Paragraph>
        </YStack>
      ) : null}
    </YStack>
  );
}
