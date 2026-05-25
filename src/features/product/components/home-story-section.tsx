import { Image } from 'expo-image';
import { Button, Paragraph, ScrollView, XStack, YStack } from 'tamagui';
import { StoryContent } from '@/types/page-design.types';
import { tokenValues } from '@/lib/theme/token-values';
import { handleLinkPress } from '@/utils/link-handler';

type HomeStorySectionProps = {
  content: StoryContent;
};

export function HomeStorySection({ content }: HomeStorySectionProps) {

  if (!content.items || content.items.length === 0) {
    return null;
  }

  const isCircle = content.story_shape === 'circle';
  const borderRadius = isCircle ? 9999 : tokenValues.productImageRadius;

  return (
    <YStack gap="$2" width="100%">
      {content.story_title ? (
        <Paragraph fontSize="$5" fontWeight="700" paddingHorizontal="$2">
          {content.story_title}
        </Paragraph>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap="$3" paddingHorizontal="$2">
          {content.items.map((item, index) => {
            const title = item.title || item.text || '';
            const imageUri = item.image;
            const targetLink = item.extra_link || item.link;

            const handlePress = () => {
              handleLinkPress(targetLink);
            };

            return (
              <Button
                accessibilityLabel={title}
                backgroundColor="transparent"
                chromeless
                key={index}
                onPress={handlePress}
                padding={0}
              >
                <YStack alignItems="center" gap="$2" width={76}>
                  <YStack
                    borderColor="$borderColor"
                    borderRadius={borderRadius}
                    borderWidth={1.5}
                    height={68}
                    overflow="hidden"
                    width={68}
                  >
                    {imageUri ? (
                      <Image
                        contentFit="cover"
                        source={{ uri: imageUri }}
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
          })}
        </XStack>
      </ScrollView>
    </YStack>
  );
}
