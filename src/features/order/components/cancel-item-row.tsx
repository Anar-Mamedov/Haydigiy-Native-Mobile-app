import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { ChevronDown, Image as ImagePlaceholderIcon, Square, SquareCheck } from '@/components/ui/icons';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { OrderDetailItem } from '@/types/order.types';
import { BundleComponent } from '@/types/bundle.types';
import { BundleContents } from '@/components/bundle/bundle-contents';
import { formatOrderPrice } from '../utils/order-status';

type CancelItemRowProps = {
  item: OrderDetailItem;
  /** Satır bir paket mi? Paket bütün olarak iptal edilir, ürünleri tek tek seçilemez. */
  isBundle?: boolean;
  /** Paket içeriği — yalnızca gösterim. */
  bundleComponents?: BundleComponent[];
  selected: boolean;
  disabled: boolean;
  reasonLabel?: string;
  onToggle: () => void;
  onPressReason: () => void;
};

/** A single cancellable unit: checkbox + product + (when selected) reason picker. */
export function CancelItemRow({
  item,
  isBundle = false,
  bundleComponents = [],
  selected,
  disabled,
  reasonLabel,
  onToggle,
  onPressReason,
}: CancelItemRowProps) {
  return (
    <YStack
      backgroundColor={selected ? '$backgroundHover' : 'transparent'}
      borderColor="$borderColor"
      borderRadius="$4"
      borderWidth={1}
      gap="$3"
      padding="$3"
    >
      <XStack alignItems="center" gap="$3">
        <Pressable
          accessibilityLabel={`${item.name} seç`}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: selected, disabled }}
          disabled={disabled}
          hitSlop={8}
          onPress={onToggle}
          style={({ pressed }) => ({ opacity: disabled ? 0.4 : pressed ? 0.6 : 1 })}
        >
          {selected ? <SquareCheck color="$brand" size={22} /> : <Square color="$color9" size={22} />}
        </Pressable>

        <YStack
          alignItems="center"
          backgroundColor="$backgroundHover"
          borderColor="$borderColor"
          borderRadius="$3"
          borderWidth={1}
          height={72}
          justifyContent="center"
          overflow="hidden"
          position="relative"
          width={72}
        >
          {item.image ? (
            <Image contentFit="contain" source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <ImagePlaceholderIcon color="$color9" size={26} />
          )}
          {isBundle ? (
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

        <YStack flex={1} gap="$1">
          <Paragraph color="$color" fontSize={14} fontWeight="600" numberOfLines={2}>
            {item.name}
          </Paragraph>
          {isBundle ? (
            <Paragraph color="$color10" fontSize={12}>
              {item.variantName || `${bundleComponents.length} ürün`}
            </Paragraph>
          ) : item.variantName ? (
            <Paragraph color="$color10" fontSize={12}>
              Beden: {item.variantName}
            </Paragraph>
          ) : null}
          <Paragraph color="$brand" fontSize={14} fontWeight="800">
            {formatOrderPrice(item.price)}
          </Paragraph>
        </YStack>
      </XStack>

      {/* Paket içeriği — paket bütün olarak iptal edilir, ürünleri tek tek seçilemez */}
      {isBundle && bundleComponents.length > 0 ? (
        <YStack gap="$1.5">
          <Paragraph color="$color10" fontSize={11} fontWeight="700">
            Paket içeriği ({bundleComponents.length} ürün) — paket bütün olarak iptal edilir
          </Paragraph>
          <BundleContents collapsible={false} components={bundleComponents} />
        </YStack>
      ) : null}

      {selected ? (
        <YStack gap="$1.5">
          <Paragraph color="$color10" fontSize={12} fontWeight="600">
            İptal Nedeni
          </Paragraph>
          <Pressable
            accessibilityLabel="İptal nedeni seç"
            accessibilityRole="button"
            disabled={disabled}
            onPress={onPressReason}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <XStack
              alignItems="center"
              backgroundColor="$background"
              borderColor="$borderColor"
              borderRadius="$3"
              borderWidth={1}
              height={44}
              justifyContent="space-between"
              paddingHorizontal="$3"
            >
              <Paragraph color={reasonLabel ? '$color' : '$color10'} flex={1} fontSize={13} numberOfLines={1}>
                {reasonLabel ?? 'İptal nedeni seçin'}
              </Paragraph>
              <ChevronDown color="$color10" size={18} />
            </XStack>
          </Pressable>
        </YStack>
      ) : null}
    </YStack>
  );
}
