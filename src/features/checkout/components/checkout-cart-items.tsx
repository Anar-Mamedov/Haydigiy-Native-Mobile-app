import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { ChevronDown } from '@/components/ui/icons';
import { ScrollView, Separator, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SectionCard } from '@/components/ui';
import { formatCurrency } from '@/utils/format-currency';
import { CartLineItem } from '@/types/cart.types';
import { BundleComponent } from '@/types/bundle.types';
import { BundleContents } from '@/components/bundle/bundle-contents';
import { getCartLineKey, isBundleCartLine } from '@/features/cart/utils/cart-line';

interface CheckoutCartItemsProps {
  items: CartLineItem[];
  expanded: boolean;
  onToggle: () => void;
  onPressItem: (item: CartLineItem) => void;
  /** Paket içeriğindeki bir ürüne dokunulduğunda o ürünün detayına gider. */
  onPressBundleComponent?: (component: BundleComponent) => void;
}

/** Collapsible strip of cart thumbnails, mirroring the web "Sepetimdeki Ürünler" panel. */
export function CheckoutCartItems({
  items,
  expanded,
  onToggle,
  onPressItem,
  onPressBundleComponent,
}: CheckoutCartItemsProps) {
  const bundleItems = items.filter(
    (item) => isBundleCartLine(item) && (item.bundleComponents?.length ?? 0) > 0,
  );

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
                key={getCartLineKey(item)}
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
                    {/* Bundle ödemede de TEK ürün olarak görünür; içeriği aşağıda listelenir */}
                    {isBundleCartLine(item) ? (
                      <XStack
                        alignItems="center"
                        backgroundColor="$brand"
                        bottom={0}
                        justifyContent="center"
                        left={0}
                        paddingVertical={2}
                        position="absolute"
                        right={0}
                      >
                        <Paragraph color="white" fontSize={9} fontWeight="800">
                          PAKET
                        </Paragraph>
                      </XStack>
                    ) : null}
                  </YStack>
                  <Paragraph color="$brand" fontSize={12} fontWeight="700" textAlign="center">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </Paragraph>
                </YStack>
              </Pressable>
            ))}
          </ScrollView>

          {/* Paket içerikleri — hangi paketin hangi ürünlerden oluştuğu */}
          {bundleItems.length > 0 ? (
            <YStack gap="$2" paddingBottom={12} paddingHorizontal={12}>
              {bundleItems.map((item) => (
                <YStack gap="$1" key={`${getCartLineKey(item)}-components`}>
                  {bundleItems.length > 1 ? (
                    <Paragraph color="$color" fontSize={12} fontWeight="700" numberOfLines={1}>
                      {item.title}
                    </Paragraph>
                  ) : null}
                  <BundleContents
                    components={item.bundleComponents ?? []}
                    onPressComponent={onPressBundleComponent}
                  />
                </YStack>
              ))}
            </YStack>
          ) : null}
        </>
      ) : null}
    </SectionCard>
  );
}
