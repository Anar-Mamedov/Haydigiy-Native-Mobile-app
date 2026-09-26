import { useState } from 'react';
import { Image } from 'expo-image';
import { YStack } from 'tamagui';
import { HOME_SECTION_GAP } from '@/features/product/utils/home-layout';
import { BannerContent } from '@/types/page-design.types';
import { handleLinkPress } from '@/utils/link-handler';

type HomeBannerSectionProps = {
  content: BannerContent;
  width: number;
};

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
  // Use a default aspect ratio of 2:1 before the image loads
  const [aspectRatio, setAspectRatio] = useState<number>(2);

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
        onLoad={(event) => {
          const { width: imgWidth, height: imgHeight } = event.source;
          if (imgWidth && imgHeight) {
            setAspectRatio(imgWidth / imgHeight);
          }
        }}
        source={{ uri: imageUri }}
        style={{
          height: '100%',
          width: '100%',
        }}
      />
    </YStack>
  );
}
