import { Button, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { handleLinkPress } from '@/utils/link-handler';
import { TextContent } from '@/types/page-design.types';

type HomeTextSectionProps = {
  content: TextContent;
};

export function HomeTextSection({ content }: HomeTextSectionProps) {
  const items = content.items || [];

  if (items.length === 0) {
    return null;
  }

  return (
    <YStack alignItems="center" justifyContent="center" paddingVertical="$2" width="100%">
      <XStack alignItems="center" flexWrap="wrap" justifyContent="center">
        {items.map((item, index) => {
          const text = item.text || '';
          const targetLink = item.link;
          const isLast = index === items.length - 1;

          if (!text) {
            return null;
          }

          const handlePress = () => {
            handleLinkPress(targetLink);
          };

          return (
            <XStack alignItems="center" key={index}>
              <Button
                accessibilityLabel={text}
                backgroundColor="transparent"
                chromeless
                onPress={handlePress}
                paddingHorizontal="$2"
                paddingVertical="$1"
              >
                <Paragraph color="$color11" fontSize="$3" fontWeight="600" hoverStyle={{ color: '$brand' }}>
                  {text}
                </Paragraph>
              </Button>
              {!isLast ? (
                <YStack backgroundColor="$borderColor" height={12} width={1} />
              ) : null}
            </XStack>
          );
        })}
      </XStack>
    </YStack>
  );
}
