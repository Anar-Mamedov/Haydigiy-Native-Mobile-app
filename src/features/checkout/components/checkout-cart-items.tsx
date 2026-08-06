import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { ChevronDown } from '@/components/ui/icons';
import { ScrollView, Separator, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SectionCard } from '@/components/ui';
import { formatCurrency } from '@/utils/format-currency';
import { CartLineItem } from '@/types/cart.types';

interface CheckoutCartItemsProps {
  items: CartLineItem[];
  expanded: boolean;
  onToggle: () => void;
  onPressItem: (item: CartLineItem) => void;
}

/** Collapsible strip of cart thumbnails, mirroring the web "Sepetimdeki Ürünler" panel. */
export function CheckoutCartItems({
  items,
  expanded,
  onToggle,
  onPressItem,
}: CheckoutCartItemsProps) {
  return (
    <SectionCard padding={0} overflow="hidden">
      <Pressable
        accessibilityLabel={`Sepetimdeki ürünler, ${items.length} ürün`}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onToggle}
      >
        <XStack alignItems="center" justifyContent="space-between" padding="$3.5">
          <Paragraph color="$color" fontSize={16} fontWeight="700">
            Sepetimdeki Ürünler ({items.length})
          </Paragraph>
          <YStack rotate={expanded ? '180deg' : '0deg'}>
            <ChevronDown color="$color10" size={22} />
          </YStack>
        </XStack>
      </Pressable>

      {expanded ? (
        <>
          <Separator borderColor="$borderColor" />
          <ScrollView
            horizontal
            contentContainerStyle={{ padding: 12, gap: 12 }}
            showsHorizontalScrollIndicator={false}
          >
            {items.map((item) => (
              <Pressable
                accessibilityLabel={item.title}
                accessibilityRole="button"
                key={`${item.variantId ?? item.productId}-${item.size ?? ''}`}
                onPress={() => onPressItem(item)}
              >
                <YStack gap="$1.5" width={84}>
                  <YStack
                    backgroundColor="$backgroundHover"
                    borderRadius="$4"
                    height={120}
                    overflow="hidden"
                    position="relative"
                    width={84}
                  >
                    {item.imageUrl ? (
                      <Image
                        accessibilityIgnoresInvertColors
                        contentFit="contain"
                        source={{ uri: item.imageUrl }}
                        style={{ width: '100%', height: '100%' }}
                      />
                    ) : null}
                    <XStack
                      backgroundColor="$background"
                      borderRadius="$2"
                      left={4}
                      paddingHorizontal={6}
                      paddingVertical={1}
                      position="absolute"
                      top={4}
                    >
                      <Paragraph color="$color" fontSize={11} fontWeight="700">
                        x{item.quantity}
                      </Paragraph>
                    </XStack>
                  </YStack>
                  <Paragraph color="$brand" fontSize={12} fontWeight="700" textAlign="center">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </Paragraph>
                </YStack>
              </Pressable>
            ))}
          </ScrollView>
        </>
      ) : null}
    </SectionCard>
  );
}
