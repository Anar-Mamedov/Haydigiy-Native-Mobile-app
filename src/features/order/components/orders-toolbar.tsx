import { useState } from 'react';
import { Pressable } from 'react-native';
import { Calendar, ChevronDown, Search } from '@/components/ui/icons';
import { Input, XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { MIN_TOUCH_TARGET, getTextFieldLabelProps } from '@/components/ui';
import { OrderDateFilter } from '@/types/order.types';
import { OrderDateSheet, orderDateLabel } from './order-date-sheet';
import { MAX_FONT_SCALE } from '@/lib/theme/font-scale';

const ORDER_SEARCH_PLACEHOLDER = 'Ürün/Sipariş ara';

type OrdersToolbarProps = {
  search: string;
  dateFilter: OrderDateFilter;
  onSearchChange: (value: string) => void;
  onDateFilterChange: (value: OrderDateFilter) => void;
};

/** Search field + date-filter trigger row above the orders list. */
export function OrdersToolbar({
  search,
  dateFilter,
  onSearchChange,
  onDateFilterChange,
}: OrdersToolbarProps) {
  const [isDateSheetOpen, setIsDateSheetOpen] = useState(false);

  return (
    <>
      {/* Arama kutusu 48dp alanı ve çerçevesiyle büyüyebildiği için tarih butonu satır yüksekliğine uzar. */}
      <XStack alignItems="stretch" gap="$2">
        <XStack
          alignItems="center"
          backgroundColor="$background"
          borderColor="$borderColor"
          borderRadius="$3"
          borderWidth={1}
          flex={1}
          gap="$2"
          paddingHorizontal="$3"
        >
          <Search color="$color10" size={18} />
          <Input
            {...getTextFieldLabelProps({ label: 'Ürün veya sipariş ara', placeholder: ORDER_SEARCH_PLACEHOLDER })}
            backgroundColor="transparent"
            borderWidth={0}
            flex={1}
            fontSize={14}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
            minHeight={MIN_TOUCH_TARGET}
            onChangeText={onSearchChange}
            padding={0}
            placeholder={ORDER_SEARCH_PLACEHOLDER}
            value={search}
          />
        </XStack>

        <Pressable
          accessibilityLabel="Sipariş tarihi filtresi"
          accessibilityRole="button"
          onPress={() => setIsDateSheetOpen(true)}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <XStack
            alignItems="center"
            backgroundColor="$background"
            borderColor="$borderColor"
            borderRadius="$3"
            borderWidth={1}
            flex={1}
            gap="$1.5"
            minHeight={MIN_TOUCH_TARGET}
            paddingHorizontal="$3"
          >
            <Calendar color="$color10" size={16} />
            <Paragraph color="$color" fontSize={12} fontWeight="600" numberOfLines={1}>
              {orderDateLabel(dateFilter)}
            </Paragraph>
            <ChevronDown color="$color10" size={16} />
          </XStack>
        </Pressable>
      </XStack>

      <OrderDateSheet
        onOpenChange={setIsDateSheetOpen}
        onSelect={onDateFilterChange}
        open={isDateSheetOpen}
        value={dateFilter}
      />
    </>
  );
}
