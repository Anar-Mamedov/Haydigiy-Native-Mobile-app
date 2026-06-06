import { useEffect, useMemo, useState, useCallback, type ReactElement } from 'react';
import { Modal, Share } from 'react-native';
import { VideoView, useVideoPlayer, type VideoSource } from 'expo-video';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { XStack, YStack, Paragraph, Button } from 'tamagui';
import { AppButton } from '@/components/ui/app-button';
import { Image } from 'expo-image';
import { Heart, Share2, ThumbsUp, ThumbsDown, ChevronLeft, Image as ImageIcon } from '@tamagui/lucide-icons-2';
import { Product } from '@/types/product.types';
import { BRAND_COLOR } from '@/lib/theme/colors';
import { getVideoSource } from '../utils/video';

/**
 * Fixed scrim/foreground colors for the full-screen video overlay. These sit on top of
 * arbitrary video content (Reels-style), so they are intentionally theme-independent:
 * white foreground over translucent black scrims stays readable in both light and dark
 * mode. Centralized here so screens never re-derive overlay literals.
 */
const OVERLAY = {
  foreground: '#FFFFFF',
  background: '#000000',
  scrim: 'rgba(0,0,0,0.45)',
  scrimSoft: 'rgba(0,0,0,0.4)',
  cardBackground: 'rgba(0,0,0,0.65)',
  cardBorder: 'rgba(255,255,255,0.12)',
  thumbPlaceholder: 'rgba(255,255,255,0.08)',
  iconMuted: 'rgba(255,255,255,0.5)',
  textShadow: 'rgba(0,0,0,0.5)',
} as const;

type ProductVideoModalProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  videoUri?: string | null;
  product?: Product | null;
  onPrimaryCta?: () => void;
  onToggleFavorite?: () => void;
};

/**
 * Owns the expo-video player lifecycle for the modal: builds the source, autoplays
 * while the modal is open, and surfaces playback errors instead of failing silently.
 */
function useFullscreenVideoPlayer(videoUri: string | null | undefined, open: boolean) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const videoSource = useMemo<VideoSource | null>(
    () => (videoUri ? getVideoSource(videoUri) : null),
    [videoUri]
  );

  const player = useVideoPlayer(videoSource, (currentPlayer) => {
    currentPlayer.loop = true;
  });

  useEffect(() => {
    setErrorMessage(null);
  }, [videoUri]);

  useEffect(() => {
    const subscription = player.addListener('statusChange', ({ status, error }) => {
      setErrorMessage(status === 'error' ? error?.message ?? 'Video oynatılamıyor.' : null);
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  useEffect(() => {
    if (open && videoSource) {
      player.play();
      return;
    }
    player.pause();
  }, [open, player, videoSource]);

  return { player, errorMessage };
}

export function ProductVideoModal({
  onOpenChange,
  open,
  videoUri,
  product,
  onPrimaryCta,
  onToggleFavorite,
}: ProductVideoModalProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [likeStatus, setLikeStatus] = useState<'liked' | 'disliked' | null>(null);
  const { player, errorMessage } = useFullscreenVideoPlayer(videoUri, open);

  // Synchronize favorite status with the product when modal opens
  useEffect(() => {
    if (open && product) {
      setIsFavorite(product.isFavorite || product.is_favorite || false);
    }
  }, [open, product]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleShare = useCallback(async () => {
    if (!product) return;
    const base = 'https://haydigiy.com';
    const link = product.slug ? `${base}/product/${product.slug}` : base;
    try {
      await Share.share({
        title: product.title,
        message: `${product.title}\n${link}`,
        url: link,
      });
    } catch {
      // ignore cancel
    }
  }, [product]);

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite((prev) => !prev);
    onToggleFavorite?.();
  }, [onToggleFavorite]);

  if (!open || !videoUri) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
      statusBarTranslucent
      visible={open}
    >
      {/* Own SafeAreaProvider: a RN Modal is a separate window, so the app-level
          insets don't apply here. Measuring inside the modal gives the correct
          bottom inset (Android nav bar / home indicator) for the CTA. */}
      <SafeAreaProvider style={{ flex: 1 }}>
      <YStack backgroundColor={OVERLAY.background} flex={1} position="relative" testID="product-video-modal">
        <VideoView
          testID="product-carousel-video"
          player={player}
          nativeControls
          contentFit="cover"
          playsInline
          surfaceType="textureView"
          style={{ flex: 1 }}
        />

        {errorMessage ? (
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            alignItems="center"
            justifyContent="center"
            padding="$4"
            pointerEvents="none"
          >
            <Paragraph color={OVERLAY.foreground} fontSize="$4" fontWeight="700" textAlign="center">
              {errorMessage}
            </Paragraph>
          </YStack>
        ) : null}

        {/* Overlay Area */}
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          pointerEvents="box-none"
          justifyContent="space-between"
        >
          {/* Top Bar with safe area padding */}
          <SafeAreaView edges={['top']} pointerEvents="box-none">
            <XStack
              paddingTop="$2"
              paddingHorizontal="$4"
              pointerEvents="box-none"
              justifyContent="flex-start"
            >
              <Button
                accessibilityLabel="Geri"
                backgroundColor={OVERLAY.scrimSoft}
                borderRadius={22}
                width={44}
                height={44}
                circular
                icon={<ChevronLeft size={28} color={OVERLAY.foreground} />}
                onPress={handleClose}
                pointerEvents="auto"
              />
            </XStack>
          </SafeAreaView>

          {/* Bottom Area (Actions + Product details card) */}
          <SafeAreaView edges={['bottom']} pointerEvents="box-none">
          <YStack pointerEvents="box-none" width="100%" gap="$3" paddingBottom="$4">
            {/* Middle part: side actions (right) */}
            <XStack
              justifyContent="flex-end"
              alignItems="flex-end"
              paddingHorizontal="$4"
              pointerEvents="box-none"
            >
              {/* Side Actions Right Side */}
              <YStack alignItems="center" gap="$4" pointerEvents="box-none">
                <VideoActionButton
                  accessibilityLabel="Beğen"
                  label="Beğen"
                  icon={
                    <ThumbsUp
                      size={20}
                      color={likeStatus === 'liked' ? BRAND_COLOR : OVERLAY.foreground}
                      fill={likeStatus === 'liked' ? BRAND_COLOR : 'transparent'}
                    />
                  }
                  onPress={() => setLikeStatus(likeStatus === 'liked' ? null : 'liked')}
                />

                <VideoActionButton
                  accessibilityLabel="Beğenme"
                  label="Geri Bildirim"
                  icon={
                    <ThumbsDown
                      size={20}
                      color={likeStatus === 'disliked' ? BRAND_COLOR : OVERLAY.foreground}
                      fill={likeStatus === 'disliked' ? BRAND_COLOR : 'transparent'}
                    />
                  }
                  onPress={() => setLikeStatus(likeStatus === 'disliked' ? null : 'disliked')}
                />

                <VideoActionButton
                  accessibilityLabel="Paylaş"
                  label="Paylaş"
                  icon={<Share2 size={20} color={OVERLAY.foreground} />}
                  onPress={handleShare}
                />
              </YStack>
            </XStack>

            {/* Bottom Card details */}
            {product && (
              <YStack paddingHorizontal="$4" pointerEvents="box-none">
                <YStack
                  backgroundColor={OVERLAY.cardBackground}
                  borderRadius="$4"
                  padding="$3"
                  borderWidth={1}
                  borderColor={OVERLAY.cardBorder}
                  gap="$3"
                  pointerEvents="auto"
                >
                  <XStack alignItems="center" gap="$3">
                    {/* Thumbnail */}
                    {product.imageUrl ? (
                      <Image
                        source={{ uri: product.imageUrl }}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 6,
                          backgroundColor: OVERLAY.thumbPlaceholder,
                        }}
                      />
                    ) : (
                      <YStack
                        width={56}
                        height={56}
                        borderRadius="$2"
                        backgroundColor={OVERLAY.thumbPlaceholder}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <ImageIcon size={22} color={OVERLAY.iconMuted} />
                      </YStack>
                    )}

                    {/* Title */}
                    <Paragraph color={OVERLAY.foreground} fontSize="$4" fontWeight="600" numberOfLines={2} flex={1}>
                      {product.title}
                    </Paragraph>

                    {/* Favorite heart icon */}
                    <Button
                      accessibilityLabel={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                      backgroundColor="transparent"
                      padding="$1"
                      chromeless
                      icon={
                        <Heart
                          size={24}
                          color={isFavorite ? BRAND_COLOR : OVERLAY.foreground}
                          fill={isFavorite ? BRAND_COLOR : 'transparent'}
                        />
                      }
                      onPress={handleToggleFavorite}
                    />
                  </XStack>

                  {/* Add To Cart button / Primary CTA */}
                  {onPrimaryCta && (
                    <AppButton
                      accessibilityLabel="Sepete Ekle"
                      backgroundColor={BRAND_COLOR}
                      color={OVERLAY.foreground}
                      borderColor="transparent"
                      borderWidth={0}
                      borderRadius="$3"
                      size="$5"
                      onPress={onPrimaryCta}
                      pressStyle={{ opacity: 0.85 }}
                    >
                      Sepete Ekle
                    </AppButton>
                  )}
                </YStack>
              </YStack>
            )}
          </YStack>
          </SafeAreaView>
        </YStack>
      </YStack>
      </SafeAreaProvider>
    </Modal>
  );
}

type VideoActionButtonProps = {
  accessibilityLabel: string;
  label: string;
  icon: ReactElement;
  onPress: () => void;
};

/** Reusable circular icon action with caption for the video overlay side rail. */
function VideoActionButton({ accessibilityLabel, label, icon, onPress }: VideoActionButtonProps) {
  return (
    <YStack alignItems="center" gap="$1.5" pointerEvents="box-none">
      <Button
        accessibilityLabel={accessibilityLabel}
        backgroundColor={OVERLAY.scrim}
        borderRadius={22}
        width={44}
        height={44}
        circular
        icon={icon}
        onPress={onPress}
        pointerEvents="auto"
      />
      <Paragraph
        color={OVERLAY.foreground}
        fontSize="$1"
        fontWeight="600"
        textShadowColor={OVERLAY.textShadow}
        textShadowRadius={2}
      >
        {label}
      </Paragraph>
    </YStack>
  );
}
