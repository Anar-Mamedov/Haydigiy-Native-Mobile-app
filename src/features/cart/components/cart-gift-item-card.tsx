import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import { Gift, Trash2 } from '@/components/ui/icons';
import { CartLineItem } from '@/types/cart.types';

const IMAGE_WIDTH = 36;
const IMAGE_HEIGHT = 48;
const IMAGE_MARGIN = 8;
const REMOVE_COLUMN_WIDTH = 56;
/** Görsel küçük kalır; dokunma alanı yanlardan 48dp'ye tamamlanır. */
const IMAGE_HIT_SLOP = { left: IMAGE_MARGIN, right: IMAGE_MARGIN };

type CartGiftItemCardProps = {
  item: CartLineItem;
  /**
   * Hediye ait olduğu ürünün kartının altında, kartın parçası olarak çizilir: kendi çerçevesi
   * ve köşeleri olmaz, üstte bir ayırıcı çizgi kalır. Ebeveyni sepette olmayan hediye kendi
   * kartında (`false`) durur.
   */
  attached?: boolean;
  onPressProduct: () => void;
  onRemovePress: () => void;
};

/**
 * Tamamı ücretsiz kampanya hediyesi olan sepet satırı — web `GiftCartItem` karşılığı. Kompakt
 * tek satır: küçük görsel, "HEDİYE" ve "Beden · adet · Ücretsiz". Ürün adı görünmez, ekran okuyucu
 * etiketlerinde kalır. Hediyenin adedini backend belirler; adet kontrolü yoktur, satır yalnızca
 * silinebilir.
 */
export function CartGiftItemCard({ attached = false, item, onPressProduct, onRemovePress }: CartGiftItemCardProps) {
  const details = [item.size ? `Beden: ${item.size}` : null, `${item.quantity} adet`, 'Ücretsiz']
    .filter(Boolean)
    .join(' · ');

  return (
    <XStack
      alignItems="stretch"
      backgroundColor="$brandTint"
      borderColor="$brandTintBorder"
      borderRadius={attached ? 0 : '$5'}
      borderWidth={attached ? 0 : 1}
      borderTopWidth={1}
      minHeight={MIN_TOUCH_TARGET}
      overflow="hidden"
      testID={attached ? 'cart-gift-item-attached' : 'cart-gift-item-card'}
    >
      <Pressable
        accessibilityLabel={`${item.title} ürün detayı`}
        accessibilityRole="button"
        hitSlop={IMAGE_HIT_SLOP}
        onPress={onPressProduct}
        style={{ alignSelf: 'center', margin: IMAGE_MARGIN }}
      >
        <YStack
          backgroundColor="$background"
          borderRadius="$2"
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

      <YStack flex={1} justifyContent="center" minWidth={0} paddingRight="$2" paddingVertical="$2">
        <XStack alignItems="center" gap="$1">
          <Gift color="$brandTintText" size={14} />
          <Paragraph color="$brandTintText" fontSize={12} fontWeight="800">
            HEDİYE
          </Paragraph>
        </XStack>
        <Paragraph color="$color10" fontSize={12} lineHeight={16} numberOfLines={2}>
          {details}
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
          gap="$1"
          justifyContent="center"
        >
          <Trash2 color="$brandTintText" size={16} />
          <Paragraph color="$brandTintText" fontSize={12} fontWeight="700">
            Sil
          </Paragraph>
        </YStack>
      </Pressable>
    </XStack>
  );
}
