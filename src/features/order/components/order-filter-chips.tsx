import { Pressable } from 'react-native';
import { Paragraph, ScrollView, XStack } from 'tamagui';
import { OrderCategory } from '@/types/order.types';

const FILTERS: { label: string; value: OrderCategory }[] = [
  { label: 'Tümü', value: 'all' },
  { label: 'Devam Eden Siparişler', value: 'active' },
  { label: 'İadeler', value: 'returned' },
  { label: 'İptaller', value: 'cancelled' },
];

type OrderFilterChipsProps = {
  active: OrderCategory;
  onChange: (category: OrderCategory) => void;
};

/** Horizontal category filter chips (Tümü / Devam Eden / İadeler / İptaller). */
export function OrderFilterChips({ active, onChange }: OrderFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
    >
      {FILTERS.map((filter) => {
        const selected = active === filter.value;
        return (
          <Pressable
            accessibilityLabel={filter.label}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={filter.value}
            onPress={() => onChange(filter.value)}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <XStack
              backgroundColor={selected ? '$brand' : '$background'}
              borderColor={selected ? '$brand' : '$borderColor'}
              borderRadius="$3"
              borderWidth={1}
              paddingHorizontal="$3"
              paddingVertical="$2"
            >
              <Paragraph
                color={selected ? 'white' : '$color'}
                fontSize={12}
                fontWeight="600"
                numberOfLines={1}
              >
                {filter.label}
              </Paragraph>
            </XStack>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
