import { Pressable, ScrollView } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import { COMPACT_MAX_FONT_SCALE } from '@/lib/theme/font-scale';
import { BEST_LISTING_OPTIONS, type BestListingValue } from '../utils/best-listing';

type BestListingTabsProps = {
  value: BestListingValue;
  onSelect: (value: BestListingValue) => void;
};

const TAB_HEIGHT = 32;
const ROW_VERTICAL_PADDING = 2;

/** Satırın toplam yüksekliği; altındaki açılır listeleri hizalamak için dışarıya verilir. */
export const BEST_LISTING_TABS_HEIGHT = MIN_TOUCH_TARGET + ROW_VERTICAL_PADDING * 2 + 1;

/**
 * Popülerlik listeleri arasında geçiş (web `Filters` "Kategori popülerlik
 * sıralamaları"): En Çok Satılanlar, En Çok Ziyaret Edilenler, En Çok
 * Favorilenenler. Seçili liste dolu turuncu, diğerleri açık turuncu çiptir.
 */
export function BestListingTabs({ value, onSelect }: BestListingTabsProps) {
  return (
    <YStack
      backgroundColor="$background"
      borderBottomColor="$borderColor"
      borderBottomWidth={1}
      height={BEST_LISTING_TABS_HEIGHT}
      width="100%"
    >
      <ScrollView
        accessibilityLabel="Kategori popülerlik sıralamaları"
        alwaysBounceHorizontal={false}
        contentContainerStyle={{ alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: ROW_VERTICAL_PADDING }}
        horizontal
        showsHorizontalScrollIndicator={false}
        testID="best-listing-tabs"
      >
        {BEST_LISTING_OPTIONS.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              accessibilityLabel={option.label}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={option.value}
              onPress={() => {
                if (!selected) onSelect(option.value);
              }}
              style={{ justifyContent: 'center', minHeight: MIN_TOUCH_TARGET }}
            >
              {({ pressed }) => (
                <XStack
                  alignItems="center"
                  backgroundColor={selected ? '$brand' : '$orange2'}
                  borderColor={selected ? '$brand' : '$orange6'}
                  borderRadius={TAB_HEIGHT / 2}
                  borderWidth={1}
                  height={TAB_HEIGHT}
                  opacity={pressed ? 0.8 : 1}
                  paddingHorizontal={14}
                >
                  <Paragraph
                    color={selected ? 'white' : '$brand'}
                    fontSize={12}
                    fontWeight="700"
                    maxFontSizeMultiplier={COMPACT_MAX_FONT_SCALE}
                    numberOfLines={1}
                  >
                    {option.label}
                  </Paragraph>
                </XStack>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </YStack>
  );
}
