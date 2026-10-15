import { useState } from 'react';
import { Image } from 'expo-image';
import { YStack } from 'tamagui';
import { useImageAspectRatio } from '@/components/ui/use-image-aspect-ratio';

const DEFAULT_ASPECT_RATIO = 4 / 3;

type BlogContentImageProps = {
  src: string;
  alt: string;
};

/**
 * Yazı içi görsel. Oranı içerikte belirtilmediği için önce 4:3 yer ayrılır,
 * görsel yüklenince kendi oranına geçer; görsel kırpılmadan sığdırılır. Oran görsel başına bir kez
 * ölçülür (bkz. `useImageAspectRatio`).
 * Yüklenemeyen görsel boş kutu bırakmamak için tamamen gizlenir.
 */
export function BlogContentImage({ src, alt }: BlogContentImageProps) {
  const { aspectRatio, onLoad } = useImageAspectRatio(src, DEFAULT_ASPECT_RATIO);
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <YStack
      aspectRatio={aspectRatio}
      backgroundColor="$color3"
      marginVertical="$3"
      testID="blog-content-image"
      width="100%"
    >
      <Image
        accessibilityLabel={alt || undefined}
        accessibilityRole="image"
        cachePolicy="memory-disk"
        contentFit="contain"
        onError={() => setFailed(true)}
        onLoad={onLoad}
        source={{ uri: src }}
        style={{ height: '100%', width: '100%' }}
        transition={200}
      />
    </YStack>
  );
}
