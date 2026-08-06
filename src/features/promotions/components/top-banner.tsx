import { useEffect, useState } from 'react';
import { Animated, Linking, Pressable } from 'react-native';
import { Button, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { X } from '@/components/ui/icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useActiveTopBannersQuery } from '../api/top-banner.queries';
import { useTopBanner } from '../hooks/use-top-banner';
import { getTopBannerImageUrl } from '../utils/top-banner-image';
import { TimeLeft } from '../types/top-banner.types';

const IMAGE_BANNER_ASPECT_RATIO = 12;
const IMAGE_BANNER_DISMISS_SIZE = 20;
const IMAGE_BANNER_DISMISS_ICON_SIZE = 10;
const IMAGE_BANNER_DISMISS_HIT_SLOP = 10;

function CountdownUnit({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <YStack alignItems="center" gap={2}>
      <XStack
        alignItems="center"
        justifyContent="center"
        borderRadius={4}
        backgroundColor="rgba(0,0,0,0.3)"
        width={28}
        height={24}
        shadowColor="rgba(0,0,0,0.3)"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.8}
        shadowRadius={4}
      >
        <Paragraph
          color={color as any}
          fontFamily={"$mono" as any}
          fontSize={13}
          fontWeight="900"
          textAlign="center"
        >
          {String(value).padStart(2, '0')}
        </Paragraph>
      </XStack>
      <Paragraph color={color as any} fontSize={7} fontWeight="700" opacity={0.7} letterSpacing={0.2}>
        {label}
      </Paragraph>
    </YStack>
  );
}

function CountdownSep({ color }: { color: string }) {
  return (
    <Paragraph color={color as any} fontSize={12} fontWeight="900" opacity={0.5} paddingBottom={8}>
      :
    </Paragraph>
  );
}

function Countdown({ timeLeft, color }: { timeLeft: TimeLeft; color: string }) {
  return (
    <XStack alignItems="flex-end" gap={2} shrink={0}>
      {timeLeft.days > 0 && (
        <>
          <CountdownUnit value={timeLeft.days} label="GÜN" color={color} />
          <CountdownSep color={color} />
        </>
      )}
      <CountdownUnit value={timeLeft.hours} label="SAAT" color={color} />
      <CountdownSep color={color} />
      <CountdownUnit value={timeLeft.minutes} label="DAK" color={color} />
      <CountdownSep color={color} />
      <CountdownUnit value={timeLeft.seconds} label="SAN" color={color} />
    </XStack>
  );
}

export function TopBanner() {
  const router = useRouter();
  const { data: banners, isPending, isError } = useActiveTopBannersQuery();
  const { currentBanner, visibleBanners, timeLeft, progress, handleDismiss, mounted } =
    useTopBanner(banners || []);

  const [fadeAnim] = useState(() => new Animated.Value(1));

  // Loop blink animation for subtext
  useEffect(() => {
    if (!currentBanner?.subtext) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [currentBanner?.subtext, fadeAnim]);

  if (!mounted || isPending || isError || !currentBanner) return null;

  const handlePress = () => {
    if (!currentBanner.link) return;
    if (currentBanner.link.startsWith('http')) {
      Linking.openURL(currentBanner.link).catch((err) =>
        console.warn('Failed to open campaign link:', err)
      );
    } else {
      router.push(currentBanner.link as any);
    }
  };

  const hasMultiple = visibleBanners.length > 1;

  if (currentBanner.type === 'image') {
    const imageUrl = currentBanner.image_mobile ? getTopBannerImageUrl(currentBanner.image_mobile) : null;
    if (!imageUrl) return null;

    return (
      <YStack position="relative" width="100%">
        {hasMultiple && (
          <XStack height={2} width="100%" backgroundColor="rgba(255,255,255,0.2)" position="absolute" top={0} left={0} zIndex={10}>
            <XStack height="100%" backgroundColor="rgba(255,255,255,0.7)" width={`${progress}%`} />
          </XStack>
        )}
        <Pressable onPress={handlePress} disabled={!currentBanner.link} style={{ width: '100%' }}>
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', aspectRatio: IMAGE_BANNER_ASPECT_RATIO }}
            contentFit="cover"
          />
        </Pressable>
        {currentBanner.dismissible && (
          <Pressable
            accessibilityLabel="Kampanyayı kapat"
            accessibilityRole="button"
            onPress={handleDismiss}
            hitSlop={IMAGE_BANNER_DISMISS_HIT_SLOP}
            style={{
              position: 'absolute',
              right: 6,
              top: '50%',
              width: IMAGE_BANNER_DISMISS_SIZE,
              height: IMAGE_BANNER_DISMISS_SIZE,
              borderRadius: IMAGE_BANNER_DISMISS_SIZE / 2,
              backgroundColor: 'rgba(0,0,0,0.38)',
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ translateY: -IMAGE_BANNER_DISMISS_SIZE / 2 }],
              zIndex: 20,
            }}
          >
            <X color="white" size={IMAGE_BANNER_DISMISS_ICON_SIZE} />
          </Pressable>
        )}
      </YStack>
    );
  }

  // Text-based banner layout
  return (
    <YStack position="relative" width="100%">
      {hasMultiple && (
        <XStack height={2} width="100%" backgroundColor="rgba(255,255,255,0.2)" position="absolute" top={0} left={0} zIndex={10}>
          <XStack height="100%" backgroundColor="rgba(255,255,255,0.7)" width={`${progress}%`} />
        </XStack>
      )}

      <Pressable onPress={handlePress} disabled={!currentBanner.link} style={{ width: '100%' }}>
        <LinearGradient
          colors={[currentBanner.bg_color_from, currentBanner.bg_color_to]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingVertical: 8,
            paddingLeft: 16,
            paddingRight: 44,
            width: '100%',
            minHeight: 50,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <YStack alignItems="center" gap={4} width="100%">
            <Paragraph
              color={currentBanner.text_color as any}
              fontSize={13}
              fontWeight="900"
              textAlign="center"
              lineHeight={16}
            >
              {currentBanner.text}
            </Paragraph>

            <XStack alignItems="center" justifyContent="center" gap={6} flexWrap="wrap">
              {currentBanner.countdown_enabled && timeLeft && (
                <Countdown timeLeft={timeLeft} color={currentBanner.text_color} />
              )}
              {currentBanner.subtext && (
                <Animated.View style={{ opacity: fadeAnim }}>
                  <XStack
                    alignItems="center"
                    borderRadius={100}
                    paddingHorizontal={10}
                    paddingVertical={2}
                    borderWidth={1}
                    borderColor={`${currentBanner.text_color}60` as any}
                    backgroundColor="rgba(0,0,0,0.2)"
                  >
                    <Paragraph color={currentBanner.text_color as any} fontSize={11} fontWeight="900">
                      {currentBanner.subtext}
                    </Paragraph>
                  </XStack>
                </Animated.View>
              )}
            </XStack>
          </YStack>
        </LinearGradient>
      </Pressable>

      {currentBanner.dismissible && (
        <Button
          accessibilityLabel="Kampanyayı kapat"
          accessibilityRole="button"
          position="absolute"
          right={8}
          top="50%"
          y="-50%"
          backgroundColor="transparent"
          chromeless
          circular
          padding={0}
          width={36}
          height={36}
          alignItems="center"
          justifyContent="center"
          onPress={handleDismiss}
          icon={<X color={currentBanner.text_color as any} size={16} />}
        />
      )}
    </YStack>
  );
}
