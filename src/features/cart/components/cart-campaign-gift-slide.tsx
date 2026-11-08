import { Image } from 'expo-image';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Gift } from '@/components/ui/icons';
import { CartCampaignCtaButton } from '@/features/cart/components/cart-campaign-cta-button';
import { CartCampaignGiftDetails, CartCampaignGiftProduct } from '@/types/cart.types';

const GIFT_IMAGE_WIDTH = 45;
const GIFT_IMAGE_HEIGHT = 60;

type CartCampaignGiftSlideProps = {
  campaignName: string;
  gift: CartCampaignGiftDetails;
  onGoToCart: () => void;
};

function GiftProductRow({ product }: { product: CartCampaignGiftProduct }) {
  return (
    <XStack alignItems="center" gap="$2" minWidth={0}>
      <YStack
        backgroundColor="$backgroundHover"
        borderRadius="$2"
        height={GIFT_IMAGE_HEIGHT}
        overflow="hidden"
        width={GIFT_IMAGE_WIDTH}
      >
        {product.imageUrl ? (
          <Image
            accessibilityIgnoresInvertColors
            contentFit="cover"
            source={{ uri: product.imageUrl }}
            style={{ width: '100%', height: '100%' }}
          />
        ) : null}
      </YStack>
      <Paragraph color="$color" flex={1} fontSize={13} fontWeight="600" lineHeight={17} numberOfLines={2}>
        {product.quantity > 1 ? `${product.quantity} adet ${product.name}` : product.name}
      </Paragraph>
    </XStack>
  );
}

/**
 * Hediye kampanyası (`gift_product`) sayfası: kampanya adı, hediye ürünleri,
 * şartlar ve "Sepete git". Tutar/eşik gösterilmez; hediyenin koşulu tutar değil
 * şartlardır.
 *
 * Başlık kampanya adıdır. Web başlığı backend'in Türkçe şart cümlelerinden
 * regex'le üretiyor; burada şartlar olduğu gibi listelenir ki metin değişince
 * bant bozulmasın ve iş kuralı istemciye gömülmesin.
 */
export function CartCampaignGiftSlide({ campaignName, gift, onGoToCart }: CartCampaignGiftSlideProps) {
  return (
    <YStack gap="$1.5" paddingHorizontal="$3" testID="cart-campaign-gift-slide">
      <XStack alignItems="center" gap="$1.5" justifyContent="center">
        <Gift color="white" size={14} />
        <Paragraph
          color="white"
          flexShrink={1}
          fontSize={13}
          fontWeight="700"
          lineHeight={18}
          numberOfLines={1}
          textAlign="center"
        >
          {campaignName}
        </Paragraph>
      </XStack>

      <YStack
        backgroundColor="$background"
        borderRadius="$4"
        gap="$2"
        paddingHorizontal="$2.5"
        paddingVertical="$2"
      >
        <XStack alignItems="center" gap="$2">
          <YStack flex={1} gap="$1.5" minWidth={0}>
            {gift.products.map((product) => (
              <GiftProductRow key={product.productId} product={product} />
            ))}
            <Paragraph color="$brand" fontSize={13} fontWeight="800">
              HEDİYE!!!
            </Paragraph>
          </YStack>

          <CartCampaignCtaButton onPress={onGoToCart} />
        </XStack>

        {gift.conditions.length > 0 ? (
          <YStack gap={2}>
            <Paragraph color="$color" fontSize={12} fontWeight="700">
              Şartlar:
            </Paragraph>
            {gift.conditions.map((condition, index) => (
              <Paragraph
                color="$color10"
                fontSize={12}
                key={`${index}-${condition}`}
                lineHeight={16}
                numberOfLines={2}
              >
                {`• ${condition}`}
              </Paragraph>
            ))}
          </YStack>
        ) : null}
      </YStack>
    </YStack>
  );
}
