import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, AlertCircle, Star, Camera } from '@/components/ui/icons';
import { XStack, YStack, H3 } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { TextActionButton } from '@/components/ui/text-action-button';
import { BRAND_COLOR, DANGER_COLOR, WARNING_COLOR } from '@/lib/theme/colors';

/** Değerlendirme ve soru bağlantılarını ayıran dikey çizginin yüksekliği. */
const RATING_ROW_DIVIDER_HEIGHT = 14;

interface ProductInfoProps {
  brand: string;
  title: string;
  rating: number;
  reviewCount: number;
  questionsCount: number;
  favoritesCount?: number;
  cartCount?: number;
  totalQuantity?: number;
  onReviewsPress?: () => void;
  onQuestionsPress?: () => void;
}

export function ProductInfo({
  brand,
  title,
  rating,
  reviewCount,
  questionsCount,
  favoritesCount = 0,
  cartCount = 0,
  totalQuantity = 0,
  onReviewsPress,
  onQuestionsPress,
}: ProductInfoProps) {
  const [tickerIndex, setTickerIndex] = useState(0);

  // Generate social ticker messages
  const tickerMessages = (() => {
    const list: { text: string; highlight: string; type: 'cart' | 'heart' | 'alert' }[] = [];
    
    if (cartCount > 0) {
      const formatted = cartCount >= 1000 ? `${(cartCount / 1000).toFixed(1).replace('.', ',')}B` : String(cartCount);
      list.push({ text: ` kişinin sepetinde, tükenmeden al!`, highlight: `${formatted} kişi`, type: 'cart' });
    }
    if (favoritesCount > 0) {
      const formatted = favoritesCount >= 1000 ? `${(favoritesCount / 1000).toFixed(1).replace('.', ',')}B` : String(favoritesCount);
      list.push({ text: ` kişi favoriledi! Sevilen ürün!`, highlight: `${formatted} kişi`, type: 'heart' });
    }
    if (totalQuantity > 0 && totalQuantity <= 5) {
      list.push({ text: ` adet kaldı, tükenmeden al!`, highlight: `Son ${totalQuantity}`, type: 'alert' });
    }
    return list;
  })();

  useEffect(() => {
    if (tickerMessages.length <= 1) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerMessages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [tickerMessages.length]);

  // Star mapping
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <YStack gap="$2.5" padding="$4" backgroundColor="$background">
      {/* Brand & Title */}
      <YStack gap="$1">
        <H3 fontSize={20} fontWeight="700" color="$color" lineHeight={26}>
          {title}
        </H3>
      </YStack>

      {/* Ratings & Question shortcut row. Bağlantıların dokunma alanı 48dp; satır yine yıldızlar kadar
          yer kaplasın diye 48dp kutunun yazı dışındaki şeffaf payı üstteki/alttaki boşluğa taşar
          (negatif dikey marj). */}
      <XStack alignItems="center" flexWrap="wrap" gap="$2.5" marginVertical="$-3">
        <XStack gap="$0.5">
          {Array.from({ length: 5 }).map((_, index) => {
            const starIndex = index + 1;
            const isFull = starIndex <= fullStars;
            const isHalf = !isFull && starIndex === fullStars + 1 && hasHalfStar;
            return (
              <Star
                key={index}
                size={16}
                fill={isFull || isHalf ? BRAND_COLOR : 'transparent'}
                color={isFull || isHalf ? '$brand' : '$color6'}
              />
            );
          })}
        </XStack>

        <TextActionButton
          accessibilityLabel={`${reviewCount} değerlendirme`}
          color="$color10"
          fontSize={13}
          fontWeight="400"
          iconAfter={<Camera size={14} color="$color10" />}
          label={`${reviewCount} Değerlendirme`}
          onPress={() => onReviewsPress?.()}
          underline
        />

        {/* Ayırıcı yazı değil çizgi: "|" karakteri metin kontrastı taramasına takılıyordu (1.3:1). */}
        <YStack backgroundColor="$color5" height={RATING_ROW_DIVIDER_HEIGHT} testID="product-info-rating-divider" width={1} />

        <TextActionButton
          accessibilityLabel={`${questionsCount} soru ve cevap`}
          color="$color10"
          fontSize={13}
          fontWeight="400"
          label={`${questionsCount} Soru & Cevap`}
          onPress={() => onQuestionsPress?.()}
          underline
        />
      </XStack>

      {/* Social Proof Ticker */}
      {tickerMessages.length > 0 && (
        <XStack
          alignItems="center"
          backgroundColor="$orange3"
          paddingVertical="$2"
          paddingHorizontal="$3"
          borderRadius={8}
          gap="$2"
          height={38}
          overflow="hidden"
        >
          {tickerMessages[tickerIndex].type === 'cart' && (
            <ShoppingCart size={16} color="$brand" />
          )}
          {tickerMessages[tickerIndex].type === 'heart' && (
            <Heart size={16} color={DANGER_COLOR} fill={DANGER_COLOR} />
          )}
          {tickerMessages[tickerIndex].type === 'alert' && (
            <AlertCircle size={16} color={WARNING_COLOR} />
          )}

          <Paragraph fontSize={12} color="$color" fontWeight="500">
            <Paragraph color={tickerMessages[tickerIndex].type === 'heart' ? '$red10' : '$brand'} fontWeight="700">
              {tickerMessages[tickerIndex].highlight}
            </Paragraph>
            {tickerMessages[tickerIndex].text}
          </Paragraph>
        </XStack>
      )}
    </YStack>
  );
}
