import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { ImageOff } from '@tamagui/lucide-icons-2';
import { Spinner, YStack } from 'tamagui';

const PRODUCT_IMAGE_LOAD_TIMEOUT_MS = 12_000;

type ProductCardImageProps = {
  imageIdentity: string;
  testID: string;
  title: string;
  uri: string;
};

type ImageLoadStatus = 'error' | 'loaded' | 'loading';

type ImageLoadState = {
  imageIdentity: string;
  status: ImageLoadStatus;
};

export function ProductCardImage({
  imageIdentity,
  testID,
  title,
  uri,
}: ProductCardImageProps) {
  const [loadState, setLoadState] = useState<ImageLoadState>({
    imageIdentity,
    status: 'loading',
  });

  const status: ImageLoadStatus = uri
    ? loadState.imageIdentity === imageIdentity
      ? loadState.status
      : 'loading'
    : 'error';

  const setStatus = (nextStatus: ImageLoadStatus) => {
    setLoadState({
      imageIdentity,
      status: nextStatus,
    });
  };

  useEffect(() => {
    if (!uri || status !== 'loading') return;

    const timeoutId = setTimeout(() => {
      setLoadState((currentState) => {
        const currentStatus =
          currentState.imageIdentity === imageIdentity ? currentState.status : 'loading';

        if (currentStatus !== 'loading') {
          return currentState;
        }

        return {
          imageIdentity,
          status: 'error',
        };
      });
    }, PRODUCT_IMAGE_LOAD_TIMEOUT_MS);

    return () => clearTimeout(timeoutId);
  }, [imageIdentity, status, uri]);

  return (
    <YStack backgroundColor="$color3" height="100%" position="relative" width="100%">
      <Image
        accessible={false}
        cachePolicy="memory-disk"
        contentFit="contain"
        onError={() => setStatus('error')}
        onLoad={() => setStatus('loaded')}
        recyclingKey={imageIdentity}
        source={uri ? { uri } : null}
        style={{ height: '100%', width: '100%' }}
        testID={testID}
      />

      {status === 'loading' ? (
        <YStack
          accessibilityLabel={`${title} ürün görseli yükleniyor`}
          accessibilityLiveRegion="polite"
          accessibilityRole="progressbar"
          alignItems="center"
          backgroundColor="$color3"
          bottom={0}
          justifyContent="center"
          left={0}
          pointerEvents="none"
          position="absolute"
          right={0}
          testID={`${testID}-loading`}
          top={0}
        >
          <Spinner color="$brand" size="small" />
        </YStack>
      ) : null}

      {status === 'error' ? (
        <YStack
          accessibilityLabel={`${title} ürün görseli yüklenemedi`}
          accessibilityRole="image"
          alignItems="center"
          backgroundColor="$color3"
          bottom={0}
          justifyContent="center"
          left={0}
          pointerEvents="none"
          position="absolute"
          right={0}
          testID={`${testID}-error`}
          top={0}
        >
          <ImageOff color="$color9" size={28} />
        </YStack>
      ) : null}
    </YStack>
  );
}
