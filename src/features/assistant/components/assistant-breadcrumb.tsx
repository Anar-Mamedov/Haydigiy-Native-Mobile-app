import { Fragment, useRef } from 'react';
import { ScrollView } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import type { AssistantBreadcrumbItem, AssistantTexts } from '@/types/assistant.types';
import { selectAssistantOption } from '../services/assistant-turn-flow';
import { useAssistantStore } from '../store/use-assistant-store';

/**
 * Sohbetin ALTINDA konum yolu: Ana menü › Kategori › Konu (README §6.10). Önceki öğeler normal
 * seçimdir (`POST /turn select`); bulunulan yer tıklanmaz. Boş dizi → satır gizli. Taşarsa yatay
 * kayar ve sona kaydırılır: son iki öğe her zaman okunur kalır.
 */
export function AssistantBreadcrumb({ texts }: { texts: AssistantTexts }) {
  const breadcrumb = useAssistantStore((state) => state.breadcrumb);
  const busy = useAssistantStore((state) => state.busy);
  const scrollRef = useRef<ScrollView>(null);

  if (breadcrumb.length === 0) return null;

  const handlePress = (item: AssistantBreadcrumbItem) => {
    if (busy || !item.id || !item.payload) return;
    void selectAssistantOption(item.id, item.payload, item.label);
  };

  return (
    <YStack
      accessibilityLabel={texts.breadcrumb_label}
      backgroundColor="$background"
      borderTopColor="$borderColor"
      borderTopWidth={1}
      testID="assistant-breadcrumb"
    >
      <ScrollView
        contentContainerStyle={{ alignItems: 'center' }}
        horizontal
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
      >
        <XStack alignItems="center" paddingHorizontal="$2">
          {breadcrumb.map((item, index) => {
            const clickable = !item.current && !!item.id;
            return (
              <Fragment key={`${item.label}-${index}`}>
                {index > 0 ? (
                  <Paragraph
                    accessibilityElementsHidden
                    color="$color9"
                    importantForAccessibility="no"
                    paddingHorizontal="$1"
                  >
                    ›
                  </Paragraph>
                ) : null}
                <YStack
                  accessibilityRole={clickable ? 'button' : 'text'}
                  accessibilityState={clickable ? { disabled: busy } : { selected: true }}
                  justifyContent="center"
                  minHeight={MIN_TOUCH_TARGET}
                  onPress={clickable ? () => handlePress(item) : undefined}
                  paddingHorizontal="$1.5"
                >
                  <Paragraph
                    color={clickable ? '$brandTintText' : '$color'}
                    fontSize={13}
                    fontWeight={clickable ? '600' : '700'}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Paragraph>
                </YStack>
              </Fragment>
            );
          })}
        </XStack>
      </ScrollView>
    </YStack>
  );
}
