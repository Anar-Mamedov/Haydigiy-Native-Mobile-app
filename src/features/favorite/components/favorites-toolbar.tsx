import { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { ScrollView, XStack, YStack, Paragraph, Input } from 'tamagui';
import { Search, X, TrendingDown } from '@tamagui/lucide-icons-2';
import { FavoritesFilter } from '@/types/favorite.types';

interface FavoritesToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategoryCount: number;
  onOpenCategorySheet: () => void;
  activeFilters: FavoritesFilter[];
  onToggleFilter: (filter: FavoritesFilter) => void;
}

export function FavoritesToolbar({
  searchQuery,
  onSearchChange,
  selectedCategoryCount,
  onOpenCategorySheet,
  activeFilters,
  onToggleFilter,
}: FavoritesToolbarProps) {
  const hasCategories = selectedCategoryCount > 0;
  const inStockActive = activeFilters.includes('inStock');
  const discountedActive = activeFilters.includes('discounted');

  return (
    <YStack
      padding="$3"
      gap="$3"
      backgroundColor="$background"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
    >
      <XStack
        alignItems="center"
        backgroundColor="$backgroundHover"
        borderRadius={8}
        borderWidth={1}
        borderColor="$borderColor"
        paddingHorizontal="$3"
        height={44}
      >
        <Search color="$color10" size={18} />
        <Input
          flex={1}
          height="100%"
          backgroundColor="transparent"
          borderWidth={0}
          paddingLeft="$2"
          fontSize={14}
          color="$color"
          placeholderTextColor="$color9"
          placeholder="Favorilerimde ara..."
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery ? (
          <Pressable
            onPress={() => onSearchChange('')}
            accessibilityLabel="Aramayı temizle"
            accessibilityRole="button"
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}
          >
            <X color="$color10" size={16} />
          </Pressable>
        ) : null}
      </XStack>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, alignItems: 'center' }}
      >
        <ToolbarChip
          active={hasCategories}
          accessibilityLabel="Kategori filtresi"
          onPress={onOpenCategorySheet}
        >
          <Paragraph fontSize={12} fontWeight="600" color={hasCategories ? 'white' : '$color'}>
            Kategori {hasCategories ? `(${selectedCategoryCount})` : ''}
          </Paragraph>
          <Paragraph fontSize={10} color={hasCategories ? 'white' : '$color10'}>
            ▼
          </Paragraph>
        </ToolbarChip>

        <ToolbarChip
          active={inStockActive}
          accessibilityLabel="Stokta olanlar filtresi"
          onPress={() => onToggleFilter('inStock')}
        >
          <Paragraph fontSize={12} fontWeight="600" color={inStockActive ? 'white' : '$color'}>
            Stokta Olanlar
          </Paragraph>
        </ToolbarChip>

        <ToolbarChip
          active={discountedActive}
          accessibilityLabel="Fiyatı düşenler filtresi"
          onPress={() => onToggleFilter('discounted')}
        >
          <TrendingDown size={14} color={discountedActive ? 'white' : '$brand'} />
          <Paragraph fontSize={12} fontWeight="600" color={discountedActive ? 'white' : '$color'}>
            Fiyatı Düşenler
          </Paragraph>
        </ToolbarChip>
      </ScrollView>
    </YStack>
  );
}

interface ToolbarChipProps {
  active: boolean;
  accessibilityLabel: string;
  onPress: () => void;
  children: ReactNode;
}

/**
 * Filter chip built on Pressable + XStack (not Tamagui Button) so `$background`
 * and `$color` resolve against the screen theme. A Tamagui Button establishes
 * its own sub-theme, which made the inactive chip text unreadable (dark-on-dark)
 * in dark mode.
 */
function ToolbarChip({ active, accessibilityLabel, onPress, children }: ToolbarChipProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress}>
      {({ pressed }) => (
        <XStack
          alignItems="center"
          gap="$1.5"
          height={32}
          borderRadius={16}
          borderWidth={1}
          paddingHorizontal="$3"
          backgroundColor={active ? '$brand' : '$background'}
          borderColor={active ? '$brand' : '$borderColor'}
          opacity={pressed ? 0.85 : 1}
        >
          {children}
        </XStack>
      )}
    </Pressable>
  );
}
