import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { ChevronDown, Image as ImagePlaceholderIcon, Square, SquareCheck } from '@tamagui/lucide-icons-2';
import { Paragraph, XStack, YStack } from 'tamagui';
import { OrderDetailItem } from '@/types/order.types';
import { formatOrderPrice } from '../utils/order-status';

type CancelItemRowProps = {
  item: OrderDetailItem;
  selected: boolean;
  disabled: boolean;
  reasonLabel?: string;
  onToggle: () => void;
  onPressReason: () => void;
};

/** A single cancellable unit: checkbox + product + (when selected) reason picker. */
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
          width={72}
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
