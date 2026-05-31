import { useEffect, useState } from 'react';
import { Modal, Pressable, useWindowDimensions } from 'react-native';
import { X } from '@tamagui/lucide-icons-2';
import { Button, YStack } from 'tamagui';
import { ProductCarouselVideoSlide } from './product-carousel-video-slide';

type ProductVideoModalProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  videoUri?: string | null;
};

export function ProductVideoModal({
  onOpenChange,
  open,
  videoUri,
}: ProductVideoModalProps) {
  const [autoplayRequest, setAutoplayRequest] = useState(0);
  const { height, width } = useWindowDimensions();
  const videoWidth = Math.max(width - 16, 1);
  const videoHeight = Math.min(videoWidth * 1.5, Math.max(height - 96, 280));

  useEffect(() => {
    if (open && videoUri) {
      setAutoplayRequest((request) => request + 1);
    }
  }, [open, videoUri]);

  if (!open && !videoUri) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
      transparent
      visible={open}
    >
      <YStack
        alignItems="center"
        flex={1}
        justifyContent="center"
        padding="$2"
        testID="product-video-modal"
      >
        <Pressable
          accessibilityLabel="Video modal arka planı"
          onPress={() => onOpenChange(false)}
          style={{
            backgroundColor: 'rgba(0,0,0,0.65)',
            bottom: 0,
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        />

        <YStack
          backgroundColor="#000"
          borderRadius={10}
          overflow="hidden"
          padding={2}
          position="relative"
        >
          <Button
            accessibilityLabel="Video modalını kapat"
            backgroundColor="rgba(0,0,0,0.55)"
            borderRadius={18}
            circular
            icon={<X size={22} color="#FFFFFF" />}
            onPress={() => onOpenChange(false)}
            position="absolute"
            right={6}
            size="$3"
            top={6}
            zIndex={20}
          />

          {videoUri ? (
            <ProductCarouselVideoSlide
              autoplayRequest={autoplayRequest}
              height={videoHeight}
              isActive={open}
              uri={videoUri}
              width={videoWidth}
            />
          ) : null}
        </YStack>
      </YStack>
    </Modal>
  );
}
