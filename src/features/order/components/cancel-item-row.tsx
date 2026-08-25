import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { ChevronDown, Image as ImagePlaceholderIcon } from '@/components/ui/icons';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppCheckbox } from '@/components/ui/app-checkbox';
import { OrderDetailItem } from '@/types/order.types';
import { formatOrderPrice } from '../utils/order-status';

const THUMB_SIZE = 64;

type CancelItemRowProps = {
  item: OrderDetailItem;
  selected: boolean;
  disabled: boolean;
  reasonLabel?: string;
  onToggle: () => void;
  onPressReason: () => void;
};

/**
 * İptal edilebilir tek bir birim: seçim kutusu + ürün + (seçiliyse) iptal nedeni.
 *
 * Paket bileşenleri de bu satırla basılır; paketin başlığı ve "tamamını seç"
 * kutusu `OrderItemGroupCard`'ın işidir.
 */
export function CancelItemRow({
  item,
  selected,
  disabled,
  reasonLabel,
  onToggle,
  onPressReason,
}: CancelItemRowProps) {
  return (
    <YStack
      backgroundColor={selected ? '$backgroundHover' : 'transparent'}
      borderColor={selected ? '$brand' : '$borderColor'}
      borderRadius="$4"
      borderWidth={1}
      gap="$3"
      padding="$3"
    >
      <XStack alignItems="center" gap="$3">
        <AppCheckbox
          accessibilityLabel={`${item.name} seç`}
          checked={selected}
          disabled={disabled}
          onChange={onToggle}
          size={22}
        />

        <YStack
          alignItems="center"
          backgroundColor="$backgroundHover"
          borderColor="$borderColor"
          borderRadius="$3"
          borderWidth={1}
          height={THUMB_SIZE}
          justifyContent="center"
          overflow="hidden"
          width={THUMB_SIZE}
        >
          {item.image ? (
            <Image contentFit="contain" source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <ImagePlaceholderIcon color="$color9" size={26} />
          )}
        </YStack>

        <YStack flex={1} gap="$1">
          <Paragraph color="$color" fontSize={14} fontWeight="600" numberOfLines={2}>
            {item.name}
          </Paragraph>
          {item.variantName ? (
            <Paragraph color="$color10" fontSize={12}>
              Beden: {item.variantName}
            </Paragraph>
          ) : null}
          <Paragraph color="$brand" fontSize={14} fontWeight="800">
            {formatOrderPrice(item.price)}
          </Paragraph>
        </YStack>
      </XStack>

      {selected ? (
        <YStack gap="$1.5">
          <Paragraph color="$color10" fontSize={12} fontWeight="600">
            İptal Nedeni
          </Paragraph>
          <Pressable
            accessibilityLabel={`${item.name} için iptal nedeni seç`}
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
