import { ScrollView } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { ArrowUpDown, SlidersHorizontal } from '@/components/ui/icons';
import { QuickFilterGroup } from '@/types/product.types';
import { FILTER_PILL_HEIGHT, FilterPill } from './filter-pill';
import { FilterShortcutSection } from './filter-sheet';

interface ProductFilterBarProps {
  activeFiltersCount: number;
  categoryFilterOptions: number;
  colors: string | undefined;
  /** Varsayılan sıralama dışında bir seçim yapıldıysa Sırala çipi vurgulanır. */
  isSortActive: boolean;
  openSection: FilterShortcutSection | null;
  priceRange: string | undefined;
  productCategories: string | undefined;
  propertyIds: string | undefined;
  quickFilterGroups: QuickFilterGroup[];
  variants: string | undefined;
  onFilterPress: () => void;
  onSortPress: () => void;
  onToggleQuickFilter: (section: FilterShortcutSection) => void;
}

const BAR_VERTICAL_PADDING = 9;

/** Çubuğun toplam yüksekliği; açılan dropdown'ı hizalamak için dışarıya verilir. */
export const PRODUCT_FILTER_BAR_HEIGHT = FILTER_PILL_HEIGHT + BAR_VERTICAL_PADDING * 2 + 1;

function parsePropertyIds(value: string | undefined): number[] {
  return value
    ? value
        .split(',')
        .map((id) => Number.parseInt(id, 10))
        .filter(Boolean)
    : [];
}

/**
 * Sıralama, filtre ve hızlı filtre kısayollarını tek bir yatay çubukta toplar.
 * Liste ile birlikte kaymaması gerektiği için `FlashList`'in başlığı değil,
 * listenin üstünde duran sabit bir eleman olarak render edilir.
 */
export function ProductFilterBar({
  activeFiltersCount,
  categoryFilterOptions,
  colors,
  isSortActive,
  openSection,
  priceRange,
  productCategories,
  propertyIds,
  quickFilterGroups,
  variants,
  onFilterPress,
  onSortPress,
  onToggleQuickFilter,
}: ProductFilterBarProps) {
  const selectedPropertyIds = parsePropertyIds(propertyIds);

  return (
    <YStack
      backgroundColor="$background"
      borderBottomColor="$borderColor"
      borderBottomWidth={1}
      height={PRODUCT_FILTER_BAR_HEIGHT}
      width="100%"
    >
      <ScrollView
        alwaysBounceHorizontal={false}
        contentContainerStyle={{
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 12,
          paddingVertical: BAR_VERTICAL_PADDING,
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
        testID="product-filter-bar"
      >
        <FilterPill
          accessibilityLabel="Sıralama seçenekleri"
          icon={<ArrowUpDown size={14} color={isSortActive ? '$brand' : '$color10'} />}
          isActive={isSortActive}
          isOpen={false}
          label="Sırala"
          onPress={onSortPress}
          showChevron={false}
        />

        <FilterPill
          accessibilityLabel="Tüm filtreler"
          badgeCount={activeFiltersCount}
          icon={<SlidersHorizontal size={14} color={activeFiltersCount > 0 ? '$brand' : '$color10'} />}
          isActive={activeFiltersCount > 0}
          isOpen={false}
          label="Filtrele"
          onPress={onFilterPress}
          showChevron={false}
        />

        {/* Ayırıcı: sheet açan iki çipi, satır içi açılan filtre çiplerinden ayırır. */}
        <XStack backgroundColor="$borderColor" height={20} width={1} />

        {categoryFilterOptions > 0 ? (
          <FilterPill
            isActive={Boolean(productCategories)}
            isOpen={openSection === 'categories'}
            label="Kategori"
            onPress={() => onToggleQuickFilter('categories')}
          />
        ) : null}

        <FilterPill
          isActive={Boolean(variants)}
          isOpen={openSection === 'variants'}
          label="Beden"
          onPress={() => onToggleQuickFilter('variants')}
        />

        <FilterPill
          isActive={Boolean(colors)}
          isOpen={openSection === 'colors'}
          label="Renk"
          onPress={() => onToggleQuickFilter('colors')}
        />

        <FilterPill
          isActive={Boolean(priceRange)}
          isOpen={openSection === 'price'}
          label="Fiyat"
          onPress={() => onToggleQuickFilter('price')}
        />

        {/* Curated per-category shortcut groups (web parity), e.g. Model,
            Yaka Tipi. Values share the property_ids filter. */}
        {quickFilterGroups.map((group) => (
          <FilterPill
            isActive={group.values.some((value) => selectedPropertyIds.includes(value.id))}
            isOpen={openSection === `quick:${group.id}`}
            key={group.id}
            label={group.name}
            onPress={() => onToggleQuickFilter(`quick:${group.id}`)}
          />
        ))}
      </ScrollView>
    </YStack>
  );
}
