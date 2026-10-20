import { useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import { Sheet, XStack, YStack, Button } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppInput } from '@/components/ui/app-input';
import { ChevronDown, ChevronRight, Search, X } from '@/components/ui/icons';
import { FilterProperty, ProductAvailableFilters } from '@/types/product.types';
import { CategoryFilterTree } from './category-filter-tree';
import { FilterCheckbox } from '@/components/ui/filter-checkbox';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { KeyboardAwareSheetScrollView } from '@/components/ui/keyboard-aware-sheet-scroll-view';
import { SheetBottomCover } from '@/components/ui/sheet-bottom-cover';
import { SheetSwipeCloseArea } from '@/components/ui/sheet-swipe-close-area';
import { useFitSheetMaxHeight } from '@/components/ui/use-fit-sheet-max-height';
import { getSpecialProductFilters, type SpecialFilterValues } from '../utils/special-product-filters';

export type FilterShortcutSection =
  | 'categories'
  | 'variants'
  | 'colors'
  | 'price'
  | `property:${string}`
  | `quick:${string}`;

type ActiveFilters = SpecialFilterValues & {
  colors?: string;
  variants?: string;
  price_range?: string;
  min_price?: string;
  max_price?: string;
  property_ids?: string;
  product_categories?: string;
};

/** Sheet'teki satırlar: çubuktaki kısayollar + yalnız sheet'te duran "Ürün Tipi". */
type FilterSheetSection = FilterShortcutSection | 'product-type';

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableFilters: ProductAvailableFilters | undefined;
  activeFilters: ActiveFilters;
  onApply: (filters: ActiveFilters) => void;
}

type FilterRow = {
  key: FilterSheetSection;
  label: string;
};

function parseIdList(value?: string): number[] {
  return value ? value.split(',').map((id) => Number.parseInt(id, 10)).filter(Boolean) : [];
}

function stringifyIdList(ids: number[]): string | undefined {
  return ids.length > 0 ? ids.join(',') : undefined;
}

function toggleId(ids: number[], id: number): number[] {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

function getPropertyGroupKey(property: Pick<FilterProperty, 'parentId' | 'parentName'>) {
  return String(property.parentId ?? property.parentName ?? 'other');
}

function getPropertyGroups(availableFilters: ProductAvailableFilters | undefined) {
  const groups = new Map<string, string>();
  availableFilters?.properties.forEach((property) => {
    const label = property.parentName?.trim();
    if (label) groups.set(getPropertyGroupKey(property), label);
  });
  return Array.from(groups, ([key, label]) => ({ key, label }));
}

function buildFilterRows(availableFilters: ProductAvailableFilters | undefined, activeFilters: ActiveFilters): FilterRow[] {
  const rows: FilterRow[] = [];
  if (availableFilters?.productCategories.length || availableFilters?.categoryChildren.length) {
    rows.push({ key: 'categories', label: 'Kategoriler' });
  }
  // Web paritesi: Kombin/Fırsat ürünleri "Ürün Tipi" başlığında, bedenden önce.
  if (getSpecialProductFilters(availableFilters, activeFilters).length > 0) {
    rows.push({ key: 'product-type', label: 'Ürün Tipi' });
  }
  if (availableFilters?.variants.length) rows.push({ key: 'variants', label: 'Beden' });
  if (availableFilters?.colors.length) rows.push({ key: 'colors', label: 'Renk' });
  if (availableFilters?.priceRanges.length) rows.push({ key: 'price', label: 'Fiyat Aralığı' });
  getPropertyGroups(availableFilters).forEach((group) => rows.push({ key: `property:${group.key}`, label: group.label }));
  return rows;
}

function hasActiveFilters(activeFilters: ActiveFilters) {
  return Boolean(
    activeFilters.colors ||
      activeFilters.variants ||
      activeFilters.price_range ||
      activeFilters.min_price ||
      activeFilters.max_price ||
      activeFilters.property_ids ||
      activeFilters.product_categories ||
      activeFilters.has_combination_product ||
      activeFilters.has_opportunity_package,
  );
}

/** Bölüm araması: görünür etiket yok (placeholder + ikon yeterli), `AppInput` erişilebilir etiketi taşır. */
function SearchField({ label, onChangeText, value }: { label: string; onChangeText: (value: string) => void; value: string }) {
  return (
    <YStack>
      <AppInput
        backgroundColor="$backgroundHover"
        borderRadius={5}
        color="$color"
        fontSize={14}
        height={40}
        hideVisibleLabel
        label={label}
        onChangeText={onChangeText}
        paddingLeft={36}
        placeholder={label}
        placeholderTextColor="$color9"
        value={value}
      />
      <XStack alignItems="center" bottom={0} left={11} pointerEvents="none" position="absolute" top={0}>
        <Search color="$color9" size={16} />
      </XStack>
    </YStack>
  );
}

function Radio({ checked }: { checked: boolean }) {
  return (
    <YStack alignItems="center" borderColor={checked ? '$brand' : '$color8'} borderRadius={100} borderWidth={1.4} height={24} justifyContent="center" width={24}>
      {checked ? <YStack backgroundColor="$brand" borderRadius={100} height={12} width={12} /> : null}
    </YStack>
  );
}

function SectionFooter({ onClear, onClose }: { onClear: () => void; onClose: () => void }) {
  return (
    <XStack gap={12} paddingHorizontal={16} paddingVertical={14}>
      <Button backgroundColor="$background" borderColor="$borderColor" borderRadius={6} borderWidth={1} flex={1} height={44} onPress={onClear}>
        <Paragraph color="$color" fontSize={15}>Temizle</Paragraph>
      </Button>
      <Button backgroundColor="$brand" borderRadius={6} flex={1} height={44} onPress={onClose}>
        <Paragraph color="white" fontSize={15} fontWeight="600">Kapat</Paragraph>
      </Button>
    </XStack>
  );
}

export function FilterSheet({ open, onOpenChange, availableFilters, activeFilters, onApply }: FilterSheetProps) {
  const maxHeight = useFitSheetMaxHeight();
  const rows = buildFilterRows(availableFilters, activeFilters);
  const canReset = hasActiveFilters(activeFilters);
  const [expandedSections, setExpandedSections] = useState<FilterSheetSection[]>([]);
  const [searchBySection, setSearchBySection] = useState<Record<string, string>>({});

  const colorIds = useMemo(() => parseIdList(activeFilters.colors), [activeFilters.colors]);
  const variantIds = useMemo(() => parseIdList(activeFilters.variants), [activeFilters.variants]);
  const categoryIds = useMemo(() => parseIdList(activeFilters.product_categories), [activeFilters.product_categories]);
  const propertyIds = useMemo(() => parseIdList(activeFilters.property_ids), [activeFilters.property_ids]);

  // Her açılış kapalı bölümler ve boş aramalarla başlar; prop değişince state render sırasında
  // sıfırlanır (React "You Might Not Need an Effect"), effect'teki setState ek render yaratıyordu.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setExpandedSections([]);
      setSearchBySection({});
    }
  }

  const applyPartial = (partialFilters: ActiveFilters) => onApply({ ...activeFilters, ...partialFilters });
  const toggleSection = (section: FilterSheetSection) => {
    setExpandedSections((current) => (current.includes(section) ? current.filter((item) => item !== section) : [...current, section]));
  };
  const setSearch = (section: string, value: string) => setSearchBySection((current) => ({ ...current, [section]: value }));

  const handleReset = () => {
    onApply({
      colors: undefined,
      variants: undefined,
      price_range: undefined,
      min_price: undefined,
      max_price: undefined,
      property_ids: undefined,
      product_categories: undefined,
      has_combination_product: undefined,
      has_opportunity_package: undefined,
    });
    onOpenChange(false);
  };

  const renderSection = (row: FilterRow) => {
    const search = searchBySection[row.key] ?? '';
    if (row.key === 'categories') {
      const filterCategories = availableFilters?.productCategories ?? [];
      const childCategories = availableFilters?.categoryChildren ?? [];
      const categories = filterCategories.length > 0 ? filterCategories : childCategories;
      return (
        <YStack>
          <YStack paddingHorizontal={22} paddingTop={14}>
            <Paragraph color="$brand" fontSize={14}>Tüm kategoriler</Paragraph>
          </YStack>
          <YStack paddingHorizontal={28} paddingVertical={12}>
            <CategoryFilterTree
              activeIds={categoryIds}
              categories={categories}
              onToggle={(id) => applyPartial({ product_categories: stringifyIdList(toggleId(categoryIds, id)) })}
            />
          </YStack>
          <SectionFooter onClear={() => applyPartial({ product_categories: undefined })} onClose={() => onOpenChange(false)} />
        </YStack>
      );
    }

    if (row.key === 'product-type') {
      const specialFilters = getSpecialProductFilters(availableFilters, activeFilters);
      return (
        <YStack>
          <YStack gap={6} paddingHorizontal={28} paddingVertical={12}>
            {specialFilters.map((filter) => (
              <Pressable
                accessibilityLabel={filter.label}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: filter.isActive }}
                key={filter.key}
                onPress={() => applyPartial({ [filter.key]: filter.isActive ? undefined : '1' })}
              >
                <XStack alignItems="center" gap={12} height={38}><FilterCheckbox checked={filter.isActive} size={22} /><Paragraph color="$color10" fontSize={14}>{filter.label}</Paragraph></XStack>
              </Pressable>
            ))}
          </YStack>
          <SectionFooter onClear={() => applyPartial({ has_combination_product: undefined, has_opportunity_package: undefined })} onClose={() => onOpenChange(false)} />
        </YStack>
      );
    }

    if (row.key === 'variants') {
      const variants = (availableFilters?.variants ?? []).filter((variant) => variant.name.toLowerCase().includes(search.toLowerCase()));
      return (
        <YStack>
          <YStack padding={16}><SearchField label="Beden Ara" onChangeText={(value) => setSearch(row.key, value)} value={search} /></YStack>
          <XStack flexWrap="wrap" paddingHorizontal={28} rowGap={18}>
            {variants.map((variant) => (
              <Pressable key={variant.id} onPress={() => applyPartial({ variants: stringifyIdList(toggleId(variantIds, variant.id)) })} style={{ width: '50%' }}>
                <XStack alignItems="center" gap={12} height={38}><FilterCheckbox checked={variantIds.includes(variant.id)} size={22} /><Paragraph color="$color10" fontSize={14}>{variant.name}</Paragraph></XStack>
              </Pressable>
            ))}
          </XStack>
          <SectionFooter onClear={() => applyPartial({ variants: undefined })} onClose={() => onOpenChange(false)} />
        </YStack>
      );
    }

    if (row.key === 'colors') {
      const colors = (availableFilters?.colors ?? []).filter((color) => color.name.toLowerCase().includes(search.toLowerCase()));
      return (
        <YStack>
          <YStack padding={16}><SearchField label="Renk Ara" onChangeText={(value) => setSearch(row.key, value)} value={search} /></YStack>
          <XStack flexWrap="wrap" paddingHorizontal={28} rowGap={16}>
            {colors.map((color) => (
              <Pressable key={color.id} onPress={() => applyPartial({ colors: stringifyIdList(toggleId(colorIds, color.id)) })} style={{ width: '50%' }}>
                <XStack alignItems="center" gap={10} height={42}>
                  <FilterCheckbox checked={colorIds.includes(color.id)} size={22} />
                  <YStack backgroundColor={(color.hex || '#f3f4f6') as any} borderColor="$borderColor" borderRadius={100} borderWidth={1} height={28} width={28} />
                  <Paragraph color="$color10" flex={1} fontSize={14} numberOfLines={1}>{color.name}</Paragraph>
                </XStack>
              </Pressable>
            ))}
          </XStack>
          <SectionFooter onClear={() => applyPartial({ colors: undefined })} onClose={() => onOpenChange(false)} />
        </YStack>
      );
    }

    if (row.key === 'price') {
      const prices = (availableFilters?.priceRanges ?? []).map((price, index) => ({ ...price, value: String(index + 1) })).filter((price) => price.label.toLowerCase().includes(search.toLowerCase()));
      return (
        <YStack>
          <YStack padding={16}><SearchField label="Fiyat Ara" onChangeText={(value) => setSearch(row.key, value)} value={search} /></YStack>
          <YStack paddingHorizontal={18}>
            {prices.map((price) => {
              const checked = activeFilters.price_range === price.value;
              return (
                <Pressable key={price.value} onPress={() => applyPartial({ max_price: checked || price.max === null ? undefined : String(price.max), min_price: checked ? undefined : String(price.min), price_range: checked ? undefined : price.value })}>
                  <XStack alignItems="center" borderBottomColor="$borderColor" borderBottomWidth={1} gap={12} height={48}><Radio checked={checked} /><Paragraph color="$color" fontSize={14}>{price.label}</Paragraph></XStack>
                </Pressable>
              );
            })}
          </YStack>
          <SectionFooter onClear={() => applyPartial({ price_range: undefined, min_price: undefined, max_price: undefined })} onClose={() => onOpenChange(false)} />
        </YStack>
      );
    }

    const groupKey = row.key.replace('property:', '');
    const properties = (availableFilters?.properties ?? []).filter((property) => getPropertyGroupKey(property) === groupKey && property.name.toLowerCase().includes(search.toLowerCase()));
    return (
      <YStack>
        <YStack padding={16}><SearchField label={`${row.label} Ara`} onChangeText={(value) => setSearch(row.key, value)} value={search} /></YStack>
        <XStack flexWrap="wrap" paddingHorizontal={28} rowGap={16}>
          {properties.map((property) => (
            <Pressable key={property.id} onPress={() => applyPartial({ property_ids: stringifyIdList(toggleId(propertyIds, property.id)) })} style={{ width: '50%' }}>
              <XStack alignItems="center" gap={10} minHeight={38}><FilterCheckbox checked={propertyIds.includes(property.id)} size={22} /><Paragraph color="$color10" flex={1} fontSize={14} numberOfLines={2}>{property.name}</Paragraph></XStack>
            </Pressable>
          ))}
        </XStack>
        <SectionFooter onClear={() => applyPartial({ property_ids: stringifyIdList(propertyIds.filter((id) => !properties.some((property) => property.id === id))) })} onClose={() => onOpenChange(false)} />
      </YStack>
    );
  };

  return (
    // Arama alanları klavye açtığı için form sheet: içeriğe göre boy (fit) + klavyeyle yukarı kayma.
    // Alt snap noktası (dismissOnSnapToBottom) klavye açılıp kapanırken sheet'i kapatabildiği için
    // aşağı kaydırarak kapatma başlıktaki SheetSwipeCloseArea'dan gelir.
    <Sheet dismissOnOverlayPress modal moveOnKeyboardChange onOpenChange={onOpenChange} open={open} snapPointsMode="fit">
      <AppSheetOverlay />
      <Sheet.Frame
        adjustPaddingForOffscreenContent
        backgroundColor="$background"
        borderBottomLeftRadius={0}
        borderBottomRightRadius={0}
        borderTopLeftRadius={12}
        borderTopRightRadius={12}
        maxHeight={maxHeight}
        overflow="visible"
        testID="filter-sheet-frame"
      >
        <SheetBottomCover testID="filter-sheet-bottom-cover" />

        <SheetSwipeCloseArea onClose={() => onOpenChange(false)} testID="filter-sheet-swipe-close">
          <XStack alignItems="center" borderBottomColor="$borderColor" borderBottomWidth={1} justifyContent="space-between" paddingBottom={18} paddingHorizontal={20} paddingTop={10}>
            <Paragraph fontSize={20} fontWeight="700" color="$color">Filtrele</Paragraph>
            <Pressable accessibilityLabel="Filtreyi kapat" accessibilityRole="button" onPress={() => onOpenChange(false)} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}>
              <X size={28} color="$color" />
            </Pressable>
          </XStack>
        </SheetSwipeCloseArea>

        {/* Listenin altında sabit Temizle/Kapat şeridi var; sarmalayıcının alt güvenli alan boşluğu liste ile şerit arasında boş bant bırakmasın. */}
        <KeyboardAwareSheetScrollView contentContainerStyle={{ paddingBottom: 0 }} showsVerticalScrollIndicator testID="filter-sheet-keyboard-aware-scroll">
          <YStack>
            {rows.map((row) => {
              const isExpanded = expandedSections.includes(row.key);
              return (
                <YStack borderBottomColor="$borderColor" borderBottomWidth={1} key={row.key}>
                  <Pressable accessibilityLabel={`${row.label} filtresini aç`} accessibilityRole="button" onPress={() => toggleSection(row.key)} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                    <XStack alignItems="center" height={56} justifyContent="space-between" paddingHorizontal={20}>
                      <Paragraph color="$color10" fontSize={15} fontWeight="500">{row.label}</Paragraph>
                      {isExpanded ? <ChevronDown color="$color10" size={20} /> : <ChevronRight color="$color10" size={20} />}
                    </XStack>
                  </Pressable>
                  {isExpanded ? renderSection(row) : null}
                </YStack>
              );
            })}
          </YStack>
        </KeyboardAwareSheetScrollView>

        <XStack backgroundColor="$background" borderTopColor="$borderColor" borderTopWidth={1} gap={14} padding={20}>
          <Button accessibilityLabel="Filtreleri temizle" backgroundColor={canReset ? '$background' : '$backgroundHover'} borderColor="$borderColor" borderRadius={6} borderWidth={1} flex={1} height={56} onPress={handleReset}>
            <Paragraph color="$color" fontSize={16} fontWeight="500">Temizle</Paragraph>
          </Button>
          <Button accessibilityLabel="Filtreyi kapat" backgroundColor="$brand" borderRadius={6} flex={1} height={56} onPress={() => onOpenChange(false)}>
            <Paragraph color="white" fontSize={16} fontWeight="600">Kapat</Paragraph>
          </Button>
        </XStack>
      </Sheet.Frame>
    </Sheet>
  );
}
