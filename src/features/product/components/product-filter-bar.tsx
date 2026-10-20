import { ScrollView } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { ArrowUpDown, BadgePercent, SlidersHorizontal, Sparkles } from '@/components/ui/icons';
import { QuickFilterGroup } from '@/types/product.types';
import type { SizeShortcutFilter } from '../hooks/use-size-shortcut-filter';
import type { SpecialProductFilter, SpecialProductFilterKey } from '../utils/special-product-filters';
import { FILTER_PILL_TOUCH_HEIGHT, FilterPill } from './filter-pill';
import { FilterShortcutSection } from './filter-sheet';

interface ProductFilterBarProps {
  activeFiltersCount: number;
  categoryFilterOptions: number;
  colors: string | undefined;
  /** "En Çok Satılanlar" gibi popülerlik listelerinde (web `best`) kısayol çipleri gizlenir. */
  hideShortcuts?: boolean;
  /** Varsayılan sıralama dışında bir seçim yapıldıysa Sırala çipi vurgulanır. */
  isSortActive: boolean;
  openSection: FilterShortcutSection | null;
  priceRange: string | undefined;
  productCategories: string | undefined;
  propertyIds: string | undefined;
  quickFilterGroups: QuickFilterGroup[];
  /** Kategoriye tanımlı beden kısayolları (ör. Beden İndirimli Ürünler: S, M, L, XL); yoksa çizilmez. */
  sizeShortcuts?: SizeShortcutFilter;
  /** Liste sunuyorsa Kombin / Fırsat Ürünleri çipleri; dokununca filtre açılır ya da kapanır. */
  specialFilters?: SpecialProductFilter[];
  variants: string | undefined;
  onFilterPress: () => void;
  onSortPress: () => void;
  onToggleQuickFilter: (section: FilterShortcutSection) => void;
  onToggleSpecialFilter?: (key: SpecialProductFilterKey) => void;
}

const SPECIAL_FILTER_ICONS: Record<SpecialProductFilterKey, typeof Sparkles> = {
  has_combination_product: Sparkles,
  has_opportunity_package: BadgePercent,
};

/** Çipin 48dp dokunma alanı dikey boşluğun çoğunu kendisi taşır; çubuk yüksekliği (53) değişmez. */
const BAR_VERTICAL_PADDING = 2;

/** Çubuğun toplam yüksekliği; açılan dropdown'ı hizalamak için dışarıya verilir. */
export const PRODUCT_FILTER_BAR_HEIGHT = FILTER_PILL_TOUCH_HEIGHT + BAR_VERTICAL_PADDING * 2 + 1;

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
  hideShortcuts = false,
  isSortActive,
  openSection,
  priceRange,
  productCategories,
  propertyIds,
  quickFilterGroups,
  sizeShortcuts,
  specialFilters = [],
  variants,
  onFilterPress,
  onSortPress,
  onToggleQuickFilter,
  onToggleSpecialFilter,
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

        {hideShortcuts ? null : (
          <>
            {/* Ayırıcı: sheet açan iki çipi, satır içi açılan filtre çiplerinden ayırır. */}
            <XStack backgroundColor="$borderColor" height={20} width={1} />

            {/* Web paritesi: özel ürün filtreleri kısayolların başında; liste açmaz, dokununca uygulanır. */}
            {specialFilters.map((filter) => {
              const Icon = SPECIAL_FILTER_ICONS[filter.key];
              return (
                <FilterPill
                  icon={<Icon size={14} color={filter.isActive ? '$brand' : '$color10'} />}
                  isActive={filter.isActive}
                  isOpen={false}
                  key={filter.key}
                  label={filter.label}
                  onPress={() => onToggleSpecialFilter?.(filter.key)}
                  showChevron={false}
                />
              );
            })}

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

            {/* Hızlı filtrelerin yanındaki beden kısayolları: liste açmaz, dokununca bedeni uygular ya da kaldırır. */}
            {sizeShortcuts?.items.map((shortcut) => (
              <FilterPill
                isActive={shortcut.isActive}
                isOpen={false}
                key={shortcut.label}
                label={`${shortcut.label} Beden`}
                onPress={() => sizeShortcuts.toggle(shortcut)}
                showChevron={false}
              />
            ))}
          </>
        )}
      </ScrollView>
    </YStack>
  );
}
