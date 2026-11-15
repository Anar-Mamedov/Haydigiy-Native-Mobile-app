import { useState } from 'react';
import { Image } from 'expo-image';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { CompactButton } from '@/components/ui/compact-button';
import { IconButton } from '@/components/ui/icon-button';
import { CircleAlert } from '@/components/ui/icons';
import { CartCampaignGiftTermsSheet } from '@/features/cart/components/cart-campaign-gift-terms-sheet';
import { CartCampaignGiftDetails } from '@/types/cart.types';

const GIFT_IMAGE_WIDTH = 36;
const GIFT_IMAGE_HEIGHT = 48;

type CartCampaignGiftSlideProps = {
  campaignName: string;
  gift: CartCampaignGiftDetails;
  onGoToCart: () => void;
  /** Şartlar yüzeyi açılınca/kapanınca; bant açıkken karuseli bekletir. */
  onTermsVisibilityChange?: (open: boolean) => void;
};

/**
 * Hediye kampanyası (`gift_product`) sayfası — web `CartCampaignBanner` hediye sayfasının
 * karşılığı. Tek satır: ilk hediyenin görseli, "<başlık> <N adet ürün, …> HEDİYE!!!", şartları
 * açan ⓘ ve "Sepete git". Şartlar bantta listelenmez, ⓘ ile alttan açılan yüzeyde gösterilir.
 *
 * Başlık kampanya adıdır (HMA-54). Web başlığı backend'in Türkçe şart cümlelerinden regex'le
 * üretiyor; bu kopyalanmaz, şartlar olduğu gibi gösterilir ki metin değişince bant bozulmasın ve
 * iş kuralı istemciye gömülmesin (yapılandırılmış başlık için connect #30).
 */
export function CartCampaignGiftSlide({
  campaignName,
  gift,
  onGoToCart,
  onTermsVisibilityChange,
}: CartCampaignGiftSlideProps) {
  const [termsOpen, setTermsOpen] = useState(false);
  const firstImageUrl = gift.products[0]?.imageUrl;
  const productsLabel = gift.products.map((product) => `${product.quantity} adet ${product.name}`).join(', ');

  const setTermsVisibility = (open: boolean) => {
    setTermsOpen(open);
    onTermsVisibilityChange?.(open);
  };

  return (
    <>
      <XStack
        alignItems="center"
        backgroundColor="$background"
        borderRadius="$4"
        gap="$2"
        marginHorizontal="$3"
        paddingLeft="$2.5"
        paddingRight="$1.5"
        paddingVertical="$1.5"
        testID="cart-campaign-gift-slide"
      >
        <YStack
          backgroundColor="$backgroundHover"
          borderRadius="$2"
          height={GIFT_IMAGE_HEIGHT}
          overflow="hidden"
          width={GIFT_IMAGE_WIDTH}
        >
          {firstImageUrl ? (
            <Image
              accessibilityIgnoresInvertColors
              contentFit="contain"
              source={{ uri: firstImageUrl }}
              style={{ width: '100%', height: '100%' }}
            />
          ) : null}
        </YStack>

        <Paragraph color="$color" flex={1} fontSize={12} lineHeight={17} minWidth={0} numberOfLines={3}>
          {`${campaignName} `}
          <Paragraph color="$color" fontSize={12} fontWeight="700" lineHeight={17}>
            {productsLabel}
          </Paragraph>
          {' '}
          <Paragraph color="$brand" fontSize={12} fontWeight="800" lineHeight={17}>
            HEDİYE!!!
          </Paragraph>
        </Paragraph>

        <IconButton
          accessibilityLabel="Kampanya şartlarını göster"
          accessibilityState={{ expanded: termsOpen }}
          onPress={() => setTermsVisibility(true)}
          testID="cart-campaign-gift-terms-button"
        >
          <CircleAlert color="$brandTintText" size={20} />
        </IconButton>

        <CompactButton
          backgroundColor="$brand"
          color="white"
          label="Sepete git"
          onPress={onGoToCart}
          testID="cart-campaign-banner-cta"
        />
      </XStack>

      <CartCampaignGiftTermsSheet
        conditions={gift.conditions}
        heading={campaignName}
        onOpenChange={setTermsVisibility}
        open={termsOpen}
      />
    </>
  );
}
