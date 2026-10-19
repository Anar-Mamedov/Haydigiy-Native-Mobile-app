import { Pressable, ScrollView } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import { ChevronRight } from '@/components/ui/icons';
import { COMPACT_MAX_FONT_SCALE } from '@/lib/theme/font-scale';
import { ProductSubcategory } from '@/types/product.types';

interface SubcategoryStripProps {
  subcategories: ProductSubcategory[];
  onSelect: (subcategory: ProductSubcategory) => void;
}

const SUBCATEGORY_CHIP_HEIGHT = 32;

/** Şeridin toplam yüksekliği (48dp dokunma alanı + alt çizgi); açılan dropdown'ı hizalamak için dışarıya verilir. */
export const SUBCATEGORY_STRIP_HEIGHT = MIN_TOUCH_TARGET + 1;

/**
 * Kategori başlığının altındaki yatay alt kategori şeridi; web mobildeki
 * şeritle aynı görünüm. Filtre çiplerinden ayrışsın diye köşeleri
 * yuvarlatılmış kart çip, yarı kalın yazı ve "git" oku kullanılır. Gezinmeyi
 * ekran yapar; alt kategori yoksa şerit hiç çizilmez.
 */
export function SubcategoryStrip({ subcategories, onSelect }: SubcategoryStripProps) {
  if (subcategories.length === 0) {
    return null;
  }

  return (
    <YStack
      backgroundColor="$background"
      borderBottomColor="$borderColor"
      borderBottomWidth={1}
      height={SUBCATEGORY_STRIP_HEIGHT}
      width="100%"
    >
      <ScrollView
        accessibilityLabel="Alt kategoriler"
        alwaysBounceHorizontal={false}
        contentContainerStyle={{ alignItems: 'center', gap: 8, paddingHorizontal: 12 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        testID="subcategory-strip"
      >
        {subcategories.map((subcategory) => (
          <Pressable
            accessibilityLabel={`${subcategory.name} kategorisine git`}
            accessibilityRole="link"
            key={subcategory.id}
            onPress={() => onSelect(subcategory)}
            style={{ justifyContent: 'center', minHeight: MIN_TOUCH_TARGET }}
            testID={`subcategory-chip-${subcategory.id}`}
          >
            {({ pressed }) => (
              <XStack
                alignItems="center"
                backgroundColor={pressed ? '$color3' : '$color1'}
                borderColor="$borderColor"
                borderRadius={8}
                borderWidth={1}
                gap={2}
                height={SUBCATEGORY_CHIP_HEIGHT}
                paddingLeft={12}
                paddingRight={8}
              >
                <Paragraph
                  color="$color"
                  fontSize={13}
                  fontWeight="600"
                  maxFontSizeMultiplier={COMPACT_MAX_FONT_SCALE}
                  numberOfLines={1}
                >
                  {subcategory.name}
                </Paragraph>
                <ChevronRight size={14} color="$color10" />
              </XStack>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </YStack>
  );
}
