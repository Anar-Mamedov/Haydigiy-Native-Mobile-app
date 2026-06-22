import { Pressable } from 'react-native';
import { Paragraph, ScrollView, XStack } from 'tamagui';
import { ReviewTab } from '@/types/review.types';

type ReviewTabsProps = {
  tabs: ReviewTab[];
  activeKey: string;
  onChange: (key: string) => void;
};

/** Horizontal, theme-aware tab selector for the reviews screen. */
export function ReviewTabs({ tabs, activeKey, onChange }: ReviewTabsProps) {
  return (
    <ScrollView
      horizontal
      // Pin the strip's height so the Tamagui ScrollView (which defaults to flex:1)
      // can't expand vertically and push the list down in a flex column.
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16, alignItems: 'center' }}
      flexGrow={0}
      flexShrink={0}
      height={60}
      showsHorizontalScrollIndicator={false}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <Pressable
            accessibilityLabel={tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <XStack
              backgroundColor={isActive ? '$background' : '$color3'}
              borderColor={isActive ? '$brand' : '$borderColor'}
              borderRadius="$3"
              borderWidth={1}
              paddingHorizontal="$3"
              paddingVertical="$2"
            >
              <Paragraph
                color={isActive ? '$brand' : '$color10'}
                fontSize={12}
                fontWeight={isActive ? '700' : '500'}
              >
                {tab.label}
              </Paragraph>
            </XStack>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
