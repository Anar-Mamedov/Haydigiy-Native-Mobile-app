import { useState } from 'react';
import { Image } from 'expo-image';
import { ChevronDown, ChevronRight, ChevronUp, Package } from '@/components/ui/icons';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { BundleComponent } from '@/types/bundle.types';
import { formatCurrency } from '@/utils/format-currency';

const THUMB_WIDTH = 36;
const THUMB_HEIGHT = 44;

export type BundleContentsProps = {
  components: BundleComponent[];
  /**
   * Bileşene dokunulduğunda çağrılır (ürün detayına gitmek için). Verilmezse satırlar
   * salt okunur kalır — seçim yapılan iptal/iade ekranlarında dokunma belirsiz olmasın diye.
   * Rota kararı çağırana aittir; bu bileşen yönlendirme bilmez.
   */
  onPressComponent?: (component: BundleComponent) => void;
  /** Açılır/kapanır mı, yoksa her zaman açık mı gösterilsin. */
  collapsible?: boolean;
  defaultOpen?: boolean;
  /** Bileşen fiyatları gösterilsin mi (sepet/ödemede gizli, siparişte açık). */
  showPrices?: boolean;
};

/**
 * Bundle satırının "Paket içeriği" listesi — sepet, ödeme ve sipariş ekranlarında
 * paketin ALTINDA gösterilir.
 *
 * Buradaki ürünler ayrı bir sepet/sipariş satırı DEĞİLDİR: adet değiştirme, silme,
 * iptal ve iade yalnızca paketin kendisi üzerinden yapılır. Bileşen listesi bu yüzden
 * salt okunurdur ve hiçbir aksiyon sunmaz.
 */
export function BundleContents({
  components,
  onPressComponent,
  collapsible = true,
  defaultOpen = false,
  showPrices = false,
}: BundleContentsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen || !collapsible);

  if (components.length === 0) return null;

  const showList = !collapsible || isOpen;
  const title = 'Paket içeriği';

  return (
    <YStack
      backgroundColor="$backgroundHover"
      borderColor="$borderColor"
      borderRadius="$4"
      borderWidth={1}
      overflow="hidden"
    >
      <XStack
        accessibilityLabel={`${title}, ${components.length} ürün`}
        accessibilityRole={collapsible ? 'button' : undefined}
        accessibilityState={collapsible ? { expanded: isOpen } : undefined}
        alignItems="center"
        gap="$2"
        justifyContent="space-between"
        onPress={collapsible ? () => setIsOpen((prev) => !prev) : undefined}
        paddingHorizontal="$3"
        paddingVertical="$2.5"
        pressStyle={collapsible ? { backgroundColor: '$background' } : undefined}
      >
        <XStack alignItems="center" flex={1} gap="$1.5">
          <Package color="$brand" size={14} />
          <Paragraph color="$color" fontSize={12} fontWeight="700">
            {title}
          </Paragraph>
          <YStack backgroundColor="$background" borderRadius="$10" paddingHorizontal="$2" paddingVertical={1}>
            <Paragraph color="$color10" fontSize={10} fontWeight="700">
              {components.length} ürün
            </Paragraph>
          </YStack>
        </XStack>
        {collapsible ? (
          isOpen ? (
            <ChevronUp color="$color9" size={16} />
          ) : (
            <ChevronDown color="$color9" size={16} />
          )
        ) : null}
      </XStack>

      {showList ? (
        <YStack gap="$2" paddingBottom="$2.5" paddingHorizontal="$3">
          {components.map((component) => {
            // Slug yoksa gidilecek ürün yok; satır salt okunur kalır.
            const canOpen = Boolean(onPressComponent && component.slug);

            return (
            <XStack
              accessibilityHint={canOpen ? 'Ürün detayına gider' : undefined}
              accessibilityLabel={canOpen ? `${component.title} ürün detayı` : undefined}
              accessibilityRole={canOpen ? 'button' : undefined}
              alignItems="center"
              borderLeftColor="$brand"
              borderLeftWidth={2}
              gap="$2.5"
              key={component.key}
              onPress={canOpen ? () => onPressComponent?.(component) : undefined}
              paddingLeft="$2.5"
              paddingVertical={2}
              pressStyle={canOpen ? { opacity: 0.6 } : undefined}
            >
              <YStack
                backgroundColor="$background"
                borderColor="$borderColor"
                borderRadius="$2"
                borderWidth={1}
                height={THUMB_HEIGHT}
                overflow="hidden"
                width={THUMB_WIDTH}
              >
                <Image
                  contentFit="contain"
                  source={{ uri: component.imageUrl }}
                  style={{ width: '100%', height: '100%' }}
                />
              </YStack>

              <YStack flex={1} gap={2}>
                <Paragraph color="$color" fontSize={12} fontWeight="600" numberOfLines={1}>
                  {component.title}
                </Paragraph>
                <Paragraph color="$color10" fontSize={11}>
                  {component.variantName ? `Beden: ${component.variantName} · ` : ''}
                  Adet: {component.quantity}
                </Paragraph>
              </YStack>

              {showPrices && component.price !== null ? (
                <Paragraph color="$color10" fontSize={12} fontWeight="600">
                  {formatCurrency(component.price)}
                </Paragraph>
              ) : null}

              {canOpen ? <ChevronRight color="$color9" size={14} /> : null}
            </XStack>
            );
          })}
        </YStack>
      ) : null}
    </YStack>
  );
}
