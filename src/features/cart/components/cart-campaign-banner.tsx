import { useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView as RNScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScrollView, XStack, YStack } from 'tamagui';
import { AppButton } from '@/components/ui/app-button';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Info } from '@/components/ui/icons';
import { useCartCampaignBannerQuery } from '@/features/cart/api/cart.queries';
import { CartCampaignBannerSlide, CartCampaignBannerStatus } from '@/types/cart.types';
import { formatAmount } from '@/utils/format-currency';

/** Kullanıcı elini sürmediği sürece sayfalar bu aralıkla kendiliğinden ilerler. */
const AUTO_ADVANCE_MS = 4000;

type CartCampaignBannerViewProps = {
  status: CartCampaignBannerStatus;
  onGoToCart: () => void;
};

type SlideProps = {
  currentAmount: number;
  onGoToCart: () => void;
  slide: CartCampaignBannerSlide;
};

/** "0/2.000 TL"; eşiksiz kampanyalarda yalnızca mevcut tutar gösterilir. */
function buildAmountLabel(currentAmount: number, threshold: number | null): string {
  const current = formatAmount(currentAmount);
  return threshold ? `${current}/${formatAmount(threshold)} TL` : `${current} TL`;
}

/**
 * Tek kampanya sayfası: kampanya adı, tutar, yönlendirme metni ve sepet düğmesi.
 *
 * Bant ürün listesinin üstünde durduğu için yüksekliği sıkı tutulur: satır
 * sayıları sınırlıdır (uzun bir kampanya adı ya da mesajı bandı büyütemez) ve
 * dolgular listenin kendi ritmine yakın kalır. Düğme boyu bilinçli olarak
 * küçültülmez; 44pt dokunma hedefi korunur, kartın yüksekliğini zaten metin
 * bloğu belirler.
 */
function CartCampaignBannerSlideView({ currentAmount, onGoToCart, slide }: SlideProps) {
  return (
    <YStack gap="$1.5" paddingHorizontal="$3">
      <XStack alignItems="center" gap="$1.5" justifyContent="center">
        <Info color="white" size={14} />
        <Paragraph
          color="white"
          flexShrink={1}
          fontSize={13}
          fontWeight="700"
          lineHeight={18}
          numberOfLines={1}
          textAlign="center"
        >
          {slide.campaignName}
        </Paragraph>
      </XStack>

      <XStack
        alignItems="center"
        backgroundColor="$background"
        borderRadius="$4"
        gap="$2"
        paddingHorizontal="$2.5"
        paddingVertical="$2"
      >
        <YStack flex={1} gap="$1" minWidth={0}>
          <Paragraph color="$color" fontSize={14} fontWeight="700" lineHeight={19}>
            {'Toplam: '}
            <Paragraph color="$brand" fontSize={14} fontWeight="700" lineHeight={19}>
              {buildAmountLabel(currentAmount, slide.threshold)}
            </Paragraph>
          </Paragraph>
          <Paragraph color="$color10" fontSize={12} lineHeight={15} numberOfLines={2}>
            {slide.message}
          </Paragraph>
        </YStack>

        <AppButton
          accessibilityLabel="Sepete git"
          accessibilityRole="button"
          backgroundColor="$brand"
          borderColor="$brand"
          color="white"
          minWidth={92}
          onPress={onGoToCart}
          pressStyle={{ backgroundColor: '$brand', borderColor: '$brand', opacity: 0.85 }}
          testID="cart-campaign-banner-cta"
        >
          Sepete git
        </AppButton>
      </XStack>
    </YStack>
  );
}

/**
 * Kampanya bandının sunum katmanı. Veri çekme ve yönlendirme içermez; hazır
 * modeli alıp çizer, böylece sağlayıcıya gerek kalmadan test edilebilir.
 *
 * Birden fazla kampanya varsa sayfalar yatay karusel olur: kullanıcı kaydırabilir,
 * kaydırmaya başlayana kadar sayfalar kendiliğinden ilerler. Tek kampanyada
 * karusel hiç kurulmaz; sayfa doğrudan çizilir.
 *
 * Kendi yatay boşluğunu koymaz; içine yerleştirildiği kabın genişliğini doldurur.
 * Bant için `accessible` verilmez, aksi halde çocuklar tek bir düğümde birleşip
 * "Sepete git" düğmesi ekran okuyucuyla ayrıca odaklanamaz hale gelir.
 */
export function CartCampaignBannerView({ status, onGoToCart }: CartCampaignBannerViewProps) {
  const { currentAmount, slides } = status;
  const scrollRef = useRef<RNScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [width, setWidth] = useState(0);
  // Kullanıcı bir kez kaydırdıysa otomatik ilerleme durur; aksi halde okumaya
  // çalıştığı sayfayı altından çekmiş oluruz.
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(true);

  const hasCarousel = slides.length > 1;

  useEffect(() => {
    if (!hasCarousel || !isAutoAdvancing || width <= 0) return undefined;

    const interval = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % slides.length;
        scrollRef.current?.scrollTo({ animated: true, x: next * width });
        return next;
      });
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(interval);
  }, [hasCarousel, isAutoAdvancing, slides.length, width]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth > 0 && nextWidth !== width) setWidth(nextWidth);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const viewportWidth = layoutMeasurement?.width || width;
    if (viewportWidth <= 0) return;

    const index = Math.round(contentOffset.x / viewportWidth);
    if (index >= 0 && index < slides.length) setActiveIndex(index);
  };

  return (
    // Genişlik her zaman bu sabit kaptan ölçülür: sayfa genişliği karusel
    // kurulmadan önce bilinmeli ve dala göre değişen bir ölçüm noktası
    // ilk render'da yanlış genişlik verir.
    <YStack
      backgroundColor="$brand"
      borderRadius="$5"
      gap="$1"
      marginBottom="$2"
      onLayout={handleLayout}
      paddingVertical="$2"
      testID="cart-campaign-banner"
    >
      {hasCarousel && width > 0 ? (
        <ScrollView
          horizontal
          onMomentumScrollEnd={handleScroll}
          onScroll={handleScroll}
          onScrollBeginDrag={() => setIsAutoAdvancing(false)}
          pagingEnabled
          ref={scrollRef}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          testID="cart-campaign-banner-scroll"
        >
          {slides.map((slide, index) => (
            // Görünmeyen sayfalar ekran okuyucudan gizlenir; yoksa aynı anda üç
            // "Sepete git" düğmesi duyurulur.
            <YStack
              accessibilityElementsHidden={index !== activeIndex}
              importantForAccessibility={index === activeIndex ? 'auto' : 'no-hide-descendants'}
              key={slide.id}
              width={width}
            >
              <CartCampaignBannerSlideView
                currentAmount={currentAmount}
                onGoToCart={onGoToCart}
                slide={slide}
              />
            </YStack>
          ))}
        </ScrollView>
      ) : (
        // Tek kampanyada karusel hiç kurulmaz; çoklu kampanyada da genişlik
        // ölçülene kadar ilk sayfa çizilir, böylece bant boş bir kutu olarak
        // görünmez.
        <CartCampaignBannerSlideView
          currentAmount={currentAmount}
          onGoToCart={onGoToCart}
          slide={slides[0]}
        />
      )}

      {hasCarousel ? (
        <XStack
          accessibilityLabel={`Kampanya ${activeIndex + 1} / ${slides.length}`}
          gap={5}
          justifyContent="center"
          testID="cart-campaign-banner-dots"
        >
          {slides.map((slide, index) => (
            <YStack
              backgroundColor={index === activeIndex ? 'white' : 'rgba(255,255,255,0.5)'}
              borderRadius={3}
              height={6}
              key={slide.id}
              width={6}
            />
          ))}
        </XStack>
      ) : null}
    </YStack>
  );
}

/**
 * Ürün listesi ekranında gösterilen sepet kampanya bandı — web'deki
 * `CartCampaignBanner`'ın karşılığı. Ekran kampanya verisini hiç görmez;
 * yalnızca bu bileşeni yerleştirir.
 *
 * Gösterilecek kampanya yoksa (boş sepet, kampanyasız hesap ya da başarısız
 * istek) hiçbir şey render edilmez ve liste düzeni olduğu gibi kalır.
 */
export function CartCampaignBanner() {
  const router = useRouter();
  const { data: status } = useCartCampaignBannerQuery();

  if (!status || status.slides.length === 0) return null;

  return <CartCampaignBannerView onGoToCart={() => router.push('/cart')} status={status} />;
}
