import { PixelRatio } from 'react-native';
import { Image } from 'expo-image';
import { YStack } from 'tamagui';
import { useImageAspectRatio } from '@/components/ui/use-image-aspect-ratio';
import { HOME_SECTION_GAP } from '@/features/product/utils/home-layout';
import { BannerContent } from '@/types/page-design.types';
import { buildResizedCdnImageUrl } from '@/utils/cdn';
import { handleLinkPress } from '@/utils/link-handler';

type HomeBannerSectionProps = {
  content: BannerContent;
  width: number;
};

/** Görsel yüklenip gerçek oranı ölçülene kadar kullanılan oran. */
const FALLBACK_BANNER_ASPECT_RATIO = 2;

export function HomeBannerSection({ content, width }: HomeBannerSectionProps) {
  const items =
    content.items && content.items.length > 0
      ? content.items
      : [
          {
            id: 0,
            image: content.image,
            link: content.link,
            text: content.text,
          },
        ];

  return (
    <YStack gap={HOME_SECTION_GAP} width={width}>
      {items.map((item, index) => {
        const imageUri = item.image;
        if (!imageUri) {
          return null;
        }

        const handlePress = () => {
          handleLinkPress(item.link);
        };

        return (
          <BannerImageItem
            imageUri={imageUri}
            itemText={item.text}
            key={index}
            onPress={handlePress}
            width={width}
          />
        );
      })}
    </YStack>
  );
}

type BannerImageItemProps = {
  imageUri: string;
  itemText?: string | null;
  onPress: () => void;
  width: number;
};

function BannerImageItem({ imageUri, itemText, onPress, width }: BannerImageItemProps) {
  const { aspectRatio, onLoad } = useImageAspectRatio(imageUri, FALLBACK_BANNER_ASPECT_RATIO);
  // 1080 px kaynak yerine bannerın ekranda kapladığı fiziksel genişlik istenir.
  const sizedUri = buildResizedCdnImageUrl(imageUri, PixelRatio.getPixelSizeForLayoutSize(width)) ?? imageUri;

  return (
    <YStack
      accessibilityLabel={itemText || 'Promo banner'}
      accessibilityRole="button"
      onPress={onPress}
      pressStyle={{ opacity: 0.85 }}
      style={{
        aspectRatio,
        width: '100%',
      }}
    >
      <Image
        contentFit="cover"
        onLoad={onLoad}
        recyclingKey={imageUri}
        source={{ uri: sizedUri }}
        style={{
          height: '100%',
          width: '100%',
        }}
        testID="home-banner-image"
      />
    </YStack>
  );
}
