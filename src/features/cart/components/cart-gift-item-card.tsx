import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Gift, Trash2 } from '@/components/ui/icons';
import { CartLineItem } from '@/types/cart.types';

const IMAGE_WIDTH = 96;
const IMAGE_HEIGHT = 120;
const REMOVE_COLUMN_WIDTH = 64;

type CartGiftItemCardProps = {
  item: CartLineItem;
  onPressProduct: () => void;
  onRemovePress: () => void;
};

/**
 * Tamamı ücretsiz kampanya hediyesi olan sepet satırı — web `GiftCartItem`
 * karşılığı. Hediyenin adedini backend belirler; kartta adet kontrolü yoktur,
 * satır yalnızca silinebilir.
 */
export function CartGiftItemCard({ item, onPressProduct, onRemovePress }: CartGiftItemCardProps) {
  return (
    <XStack
      backgroundColor="$brandTint"
      borderColor="$brandTintBorder"
      borderRadius="$5"
      borderWidth={1}
      overflow="hidden"
      testID="cart-gift-item-card"
    >
      <Pressable
        accessibilityLabel={`${item.title} ürün detayı`}
        accessibilityRole="button"
        onPress={onPressProduct}
        style={{ margin: 12 }}
      >
        <YStack
          backgroundColor="$background"
          borderRadius="$3"
          height={IMAGE_HEIGHT}
          overflow="hidden"
          width={IMAGE_WIDTH}
        >
          {item.imageUrl ? (
            <Image
              accessibilityIgnoresInvertColors
              contentFit="contain"
              source={{ uri: item.imageUrl }}
              style={{ width: '100%', height: '100%' }}
            />
          ) : null}
        </YStack>
      </Pressable>

      <YStack flex={1} gap="$1.5" minWidth={0} paddingRight="$2" paddingVertical="$3">
        <XStack
          alignItems="center"
          alignSelf="flex-start"
          backgroundColor="$background"
          borderColor="$brandTintBorder"
          borderRadius="$10"
          borderWidth={1}
          gap="$1"
          paddingHorizontal="$2"
          paddingVertical={2}
        >
          <Gift color="$brandTintText" size={14} />
          <Paragraph color="$brandTintText" fontSize={12} fontWeight="800">
            HEDİYE
          </Paragraph>
        </XStack>

        <Paragraph
          color="$color"
          fontSize={15}
          fontWeight="600"
          numberOfLines={2}
          onPress={onPressProduct}
        >
          {item.title}
        </Paragraph>

        {item.size ? (
          <Paragraph color="$color10" fontSize={13}>
            Beden: <Paragraph color="$color" fontWeight="600">{item.size}</Paragraph>
          </Paragraph>
        ) : null}

        <Paragraph color="$color10" fontSize={13}>
          {`${item.quantity} adet · `}
          <Paragraph color="$discount" fontWeight="700">
            Ücretsiz
          </Paragraph>
        </Paragraph>

        <Paragraph color="$brandTintText" fontSize={12} lineHeight={16}>
          Kampanya hediyesi · Adet değiştirilemez
        </Paragraph>
      </YStack>

      <Pressable
        accessibilityLabel={`${item.title} hediyesini sil`}
        accessibilityRole="button"
        onPress={onRemovePress}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, width: REMOVE_COLUMN_WIDTH })}
        testID="cart-gift-item-remove"
      >
        <YStack
          alignItems="center"
          borderLeftColor="$brandTintBorder"
          borderLeftWidth={1}
          flex={1}
          gap="$1.5"
          justifyContent="center"
        >
          <Trash2 color="$brandTintText" size={22} />
          <Paragraph color="$brandTintText" fontSize={13} fontWeight="700">
            Sil
          </Paragraph>
        </YStack>
      </Pressable>
    </XStack>
  );
}
