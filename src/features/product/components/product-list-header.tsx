import { ScrollView, Button, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ArrowUpDown, SlidersHorizontal } from '@/components/ui/icons';
import { QuickFilterGroup } from '@/types/product.types';
import { FilterPill } from './filter-pill';
import { FilterShortcutSection } from './filter-sheet';

interface ProductListHeaderProps {
  activeSortLabel: string;
  activeFiltersCount: number;
  categoryFilterOptions: number;
  productCategories: string | undefined;
  colors: string | undefined;
  variants: string | undefined;
  priceRange: string | undefined;
  propertyIds: string | undefined;
  quickFilterGroups: QuickFilterGroup[];
  quickFilterSection: FilterShortcutSection | null;
  onSortPress: () => void;
  onFilterPress: () => void;
  onToggleQuickFilter: (section: FilterShortcutSection) => void;
}

function parsePropertyIds(value: string | undefined): number[] {
  return value
    ? value
        .split(',')
        .map((id) => Number.parseInt(id, 10))
        .filter(Boolean)
    : [];
}

export function ProductListHeader({
  activeSortLabel,
  activeFiltersCount,
  categoryFilterOptions,
  productCategories,
  colors,
  variants,
  priceRange,
  propertyIds,
  quickFilterGroups,
  quickFilterSection,
  onSortPress,
  onFilterPress,
  onToggleQuickFilter,
}: ProductListHeaderProps) {
  const selectedPropertyIds = parsePropertyIds(propertyIds);

  return (
    <YStack backgroundColor="$background" marginHorizontal={-8}>
      {/* Filters and Sorting Toolbar */}
      <XStack
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        backgroundColor="$background"
        height={46}
      >
        <Button
          flex={1}
          height="100%"
          variant="outlined"
          borderWidth={0}
          borderRadius={0}
          borderRightWidth={1}
          borderRightColor="$borderColor"
          onPress={onSortPress}
          icon={<ArrowUpDown size={16} color="$brand" />}
        >
          <Paragraph
            fontSize={13}
            fontWeight="500"
            color="$color"
            numberOfLines={1}
          >
            {activeSortLabel}
          </Paragraph>
        </Button>
        <Button
          flex={1}
          height="100%"
          variant="outlined"
          borderWidth={0}
          borderRadius={0}
          onPress={onFilterPress}
          icon={<SlidersHorizontal size={16} color="$brand" />}
        >
          <Paragraph
            fontSize={13}
            fontWeight="500"
            color="$color"
          >
            Filtrele{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
          </Paragraph>
        </Button>
      </XStack>

      {/* Horizontal Quick-Filter Pills Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        backgroundColor="$background"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        paddingVertical={8}
        height={48}
        maxHeight={48}
        flex={0}
      >
        <XStack paddingHorizontal="$3" gap="$2" alignItems="center" height="100%">
          {categoryFilterOptions > 0 ? (
            <FilterPill
              label="Kategori"
              isActive={Boolean(productCategories)}
              isOpen={quickFilterSection === 'categories'}
              onPress={() => onToggleQuickFilter('categories')}
            />
          ) : null}

          <FilterPill
            label="Renk"
            isActive={Boolean(colors)}
            isOpen={quickFilterSection === 'colors'}
            onPress={() => onToggleQuickFilter('colors')}
          />

          <FilterPill
            label="Beden"
            isActive={Boolean(variants)}
            isOpen={quickFilterSection === 'variants'}
            onPress={() => onToggleQuickFilter('variants')}
          />

          <FilterPill
            label="Fiyat"
            isActive={Boolean(priceRange)}
            isOpen={quickFilterSection === 'price'}
            onPress={() => onToggleQuickFilter('price')}
          />

          {/* Curated per-category shortcut groups (web parity), e.g. Model,
              Yaka Tipi. Values share the property_ids filter. */}
          {quickFilterGroups.map((group) => (
            <FilterPill
              key={group.id}
              label={group.name}
              isActive={group.values.some((value) => selectedPropertyIds.includes(value.id))}
              isOpen={quickFilterSection === `quick:${group.id}`}
              onPress={() => onToggleQuickFilter(`quick:${group.id}`)}
            />
          ))}
        </XStack>
      </ScrollView>
    </YStack>
  );
}
