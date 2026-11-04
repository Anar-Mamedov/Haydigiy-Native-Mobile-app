import { Image } from 'expo-image';
import { useState } from 'react';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import type { AssistantOrderProduct } from '@/types/assistant.types';
import { AssistantBodyText, AssistantMutedText } from '../assistant-surfaces';

const THUMBNAIL_WIDTH = 56;
const THUMBNAIL_HEIGHT = 72;

/** Ürün görseli; yüklenemezse satır görselsiz kalır (web `ProductThumbnail`). */
function OrderProductThumbnail({ uri }: { uri: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <YStack
      backgroundColor="$color3"
      borderColor="$borderColor"
      borderRadius="$4"
      borderWidth={1}
      flexShrink={0}
      height={THUMBNAIL_HEIGHT}
      overflow="hidden"
      width={THUMBNAIL_WIDTH}
    >
      <Image
        accessibilityIgnoresInvertColors
        accessible={false}
        contentFit="cover"
        onError={() => setFailed(true)}
        recyclingKey={uri}
        source={{ uri }}
        style={{ height: '100%', width: '100%' }}
        testID="assistant-order-product-image"
      />
    </YStack>
  );
}

type AssistantOrderProductsProps = {
  products: AssistantOrderProduct[];
  /** Sipariş listesindeki kartın altında daha sıkı çizilir. */
  compact?: boolean;
};

/**
 * Sipariş kalemleri (kart ve liste ortak): görsel, ad, "varyant · N adet", iade notu ve
 * birim fiyat / satır toplamı. Metinler sunucudan hazır gelir; istemci hesaplama yapmaz.
 */
export function AssistantOrderProducts({ products, compact = false }: AssistantOrderProductsProps) {
  if (products.length === 0) return null;

  return (
    <YStack
      borderTopColor="$borderColor"
      borderTopWidth={1}
      gap="$2"
      marginTop={compact ? '$1' : 0}
      paddingTop={compact ? '$2' : '$2.5'}
    >
      {products.map((item, index) => (
        <XStack
          alignItems="center"
          backgroundColor="$color2"
          borderColor="$borderColor"
          borderRadius="$5"
          borderWidth={1}
          gap="$2.5"
          key={`${item.name}-${index}`}
          padding={compact ? '$2' : '$2.5'}
          testID="assistant-order-product"
        >
          {item.image ? <OrderProductThumbnail uri={item.image} /> : null}
          <YStack flex={1} gap="$0.5" minWidth={0}>
            <AssistantBodyText fontSize={14} fontWeight="700" lineHeight={19} numberOfLines={2}>
              {item.name}
            </AssistantBodyText>
            <AssistantMutedText fontSize={12} lineHeight={16}>
              {[item.variant, `${item.qty} adet`].filter(Boolean).join(' · ')}
            </AssistantMutedText>
            {item.note ? (
              <AssistantMutedText fontSize={11} lineHeight={15}>
                {item.note}
              </AssistantMutedText>
            ) : null}
          </YStack>
          {item.unit_price_label || item.line_total_label ? (
            <YStack alignItems="flex-end" flexShrink={0} gap="$0.5" paddingLeft="$1">
              {item.unit_price_label ? (
                <Paragraph color="$color" fontSize={13} fontWeight="800">
                  {item.unit_price_label}
                </Paragraph>
              ) : null}
              {item.line_total_label ? (
                <AssistantMutedText fontSize={11} lineHeight={15}>
                  {item.line_total_label}
                </AssistantMutedText>
              ) : null}
            </YStack>
          ) : null}
        </XStack>
      ))}
    </YStack>
  );
}
