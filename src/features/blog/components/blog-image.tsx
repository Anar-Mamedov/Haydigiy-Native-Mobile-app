import { useState } from 'react';
import { Image, type ImageContentFit } from 'expo-image';
import { YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { BLOG_IMAGE_PLACEHOLDER } from '../constants/blog-ui';

type BlogImageProps = {
  uri: string | null;
  alt: string;
  aspectRatio: number;
  contentFit?: ImageContentFit;
  /** Görsel yoksa ya da yüklenemezse gösterilen "HG" monogramının boyutu. */
  placeholderSize?: number;
  testID?: string;
};

/**
 * Blog kartları ve kapak için ortak görsel kutusu. Oran sabit tutulur ki görsel
 * gelmeden yerleşim zıplamasın; görsel yoksa veya yüklenemezse web'deki gibi
 * "HG" monogramı gösterilir.
 */
export function BlogImage({
  uri,
  alt,
  aspectRatio,
  contentFit = 'cover',
  placeholderSize = 40,
  testID,
}: BlogImageProps) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const showImage = Boolean(uri) && failedUri !== uri;

  return (
    <YStack
      alignItems="center"
      aspectRatio={aspectRatio}
      backgroundColor="$color3"
      justifyContent="center"
      overflow="hidden"
      testID={testID}
      width="100%"
    >
      {showImage && uri ? (
        <Image
          accessibilityLabel={alt}
          accessibilityRole="image"
          cachePolicy="memory-disk"
          contentFit={contentFit}
          onError={() => setFailedUri(uri)}
          recyclingKey={uri}
          source={{ uri }}
          style={{ height: '100%', width: '100%' }}
          transition={200}
        />
      ) : (
        <Paragraph
          accessibilityLabel={alt}
          color="$color8"
          fontSize={placeholderSize}
          fontWeight="700"
          lineHeight={placeholderSize * 1.2}
        >
          {BLOG_IMAGE_PLACEHOLDER}
        </Paragraph>
      )}
    </YStack>
  );
}
