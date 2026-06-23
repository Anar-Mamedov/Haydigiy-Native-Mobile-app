import { Paragraph, ScrollView, XStack } from 'tamagui';
import { HelpCategory } from '@/types/help.types';

type HelpCategoryTabsProps = {
  categories: HelpCategory[];
  activeId: number | null;
  onSelect: (id: number) => void;
};

/** Horizontally scrollable category tabs for the help screen. */
export function HelpCategoryTabs({ categories, activeId, onSelect }: HelpCategoryTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
    >
      {categories.map((category) => {
        const active = category.id === activeId;
        return (
          <XStack
            accessibilityLabel={category.title}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            alignItems="center"
            backgroundColor={active ? '$orange3' : '$background'}
            borderColor={active ? '$brand' : '$borderColor'}
            borderRadius="$10"
            borderWidth={1}
            key={category.id}
            onPress={() => onSelect(category.id)}
            paddingHorizontal="$3.5"
            paddingVertical="$2"
            pressStyle={{ opacity: 0.85 }}
          >
            <Paragraph
              color={active ? '$brand' : '$color11'}
              fontSize={13}
              fontWeight={active ? '700' : '500'}
            >
              {category.title}
            </Paragraph>
          </XStack>
        );
      })}
    </ScrollView>
  );
}
