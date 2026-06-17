import { useState } from 'react';
import { Pressable } from 'react-native';
import { Calendar, ChevronDown, Search } from '@tamagui/lucide-icons-2';
import { Input, Paragraph, XStack } from 'tamagui';
import { OrderDateFilter } from '@/types/order.types';
import { OrderDateSheet, orderDateLabel } from './order-date-sheet';

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
      <XStack alignItems="center" gap="$2">
        <XStack
          alignItems="center"
          backgroundColor="$background"
          borderColor="$borderColor"
          borderRadius="$3"
          borderWidth={1}
          flex={1}
          gap="$2"
          height={44}
          paddingHorizontal="$3"
        >
          <Search color="$color10" size={18} />
          <Input
            accessibilityLabel="Ürün veya sipariş ara"
            backgroundColor="transparent"
            borderWidth={0}
            flex={1}
            fontSize={14}
            height={42}
            onChangeText={onSearchChange}
            padding={0}
            placeholder="Ürün/Sipariş ara"
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
            gap="$1.5"
            height={44}
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
