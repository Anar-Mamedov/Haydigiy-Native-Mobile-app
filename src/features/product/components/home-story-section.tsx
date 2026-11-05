import { useCallback } from 'react';
import { PixelRatio } from 'react-native';
import { Image } from 'expo-image';
import { Button, YStack } from 'tamagui';
import { HorizontalRail } from '@/components/ui/horizontal-rail';
import { Paragraph } from '@/components/ui/app-paragraph';
import { StoryContent, StoryItem } from '@/types/page-design.types';
import { tokenValues } from '@/lib/theme/token-values';
import { buildResizedCdnImageUrl } from '@/utils/cdn';
import { handleLinkPress } from '@/utils/link-handler';

type HomeStorySectionProps = {
  content: StoryContent;
};

const STORY_IMAGE_SIZE = 68;
const STORY_ITEM_WIDTH = 76;

type StoryBubbleProps = {
  borderRadius: number;
  item: StoryItem;
};

function StoryBubble({ borderRadius, item }: StoryBubbleProps) {
  const title = item.title || item.text || '';
  const imageUri = item.image;
  const targetLink = item.extra_link || item.link;

  return (
    <Button
      accessibilityLabel={title}
      backgroundColor="transparent"
      chromeless
      onPress={() => handleLinkPress(targetLink)}
      padding={0}
    >
      <YStack alignItems="center" gap="$2" width={STORY_ITEM_WIDTH}>
        <YStack
          borderColor="$borderColor"
          borderRadius={borderRadius}
          borderWidth={1.5}
          height={STORY_IMAGE_SIZE}
          overflow="hidden"
          width={STORY_IMAGE_SIZE}
        >
          {imageUri ? (
            <Image
              contentFit="cover"
              recyclingKey={imageUri}
              source={{
                uri:
                  buildResizedCdnImageUrl(imageUri, PixelRatio.getPixelSizeForLayoutSize(STORY_IMAGE_SIZE)) ??
                  imageUri,
              }}
              style={{ height: '100%', width: '100%' }}
            />
          ) : null}
        </YStack>
        {title ? (
          <Paragraph
            color="$color"
            fontSize="$2"
            fontWeight="600"
            numberOfLines={1}
            textAlign="center"
          >
            {title}
          </Paragraph>
        ) : null}
      </YStack>
    </Button>
  );
}

export function HomeStorySection({ content }: HomeStorySectionProps) {
  const isCircle = content.story_shape === 'circle';
  const borderRadius = isCircle ? 9999 : tokenValues.productImageRadius;

  const renderStory = useCallback(
    (item: StoryItem) => <StoryBubble borderRadius={borderRadius} item={item} />,
    [borderRadius],
  );

  if (!content.items || content.items.length === 0) {
    return null;
  }

  return (
    <YStack gap="$2" width="100%">
      {content.story_title ? (
        <Paragraph fontSize="$5" fontWeight="700" paddingHorizontal="$2">
          {content.story_title}
        </Paragraph>
      ) : null}
      <HorizontalRail
        data={content.items}
        gap={tokenValues.storyRailGap}
        keyExtractor={(item, index) => `${index}-${item.image ?? ''}`}
        paddingHorizontal={tokenValues.storyRailPaddingHorizontal}
        renderItem={renderStory}
        testID="home-story-rail"
      />
    </YStack>
  );
}
