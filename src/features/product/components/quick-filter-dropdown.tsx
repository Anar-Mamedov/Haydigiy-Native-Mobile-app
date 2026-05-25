import { useEffect, useMemo, useState } from 'react';
import { Pressable, TextInput } from 'react-native';
import { Paragraph, ScrollView, XStack, YStack, useTheme } from 'tamagui';
import { Search } from '@tamagui/lucide-icons-2';
import { FilterProperty, ProductAvailableFilters } from '@/types/product.types';
import { FilterShortcutSection } from './filter-sheet';
import { CategoryFilterTree } from './category-filter-tree';
import { FilterCheckbox } from '@/components/ui/filter-checkbox';

type ActiveFilters = {
  colors?: string;
  variants?: string;
  price_range?: string;
  min_price?: string;
  max_price?: string;
  property_ids?: string;
  product_categories?: string;
};

interface QuickFilterDropdownProps {
  activeFilters: ActiveFilters;
  availableFilters: ProductAvailableFilters | undefined;
  onChange: (filters: ActiveFilters) => void;
  onClose: () => void;
  section: FilterShortcutSection | null;
}

function parseIdList(value?: string): number[] {
  return value
    ? value
        .split(',')
        .map((id) => Number.parseInt(id, 10))
        .filter(Boolean)
    : [];
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

function getPropertySectionKey(section: FilterShortcutSection | null) {
  return section?.startsWith('property:') ? section.replace('property:', '') : null;
}

function SearchField({ onChangeText, placeholder, value }: {
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  const theme = useTheme();

  return (
    <XStack alignItems="center" backgroundColor="$backgroundHover" borderColor="$borderColor" borderRadius={5} borderWidth={1} height={48} paddingHorizontal={12}>
      <Search size={18} color="#9ca3af" />
      <TextInput
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        style={{ color: theme.color.val, flex: 1, fontSize: 15, paddingLeft: 10 }}
        value={value}
      />
    </XStack>
  );
}

function Radio({ checked }: { checked: boolean }) {
  return (
    <YStack alignItems="center" borderColor={checked ? '$brand' : '$color8'} borderRadius={100} borderWidth={1.4} height={26} justifyContent="center" width={26}>
      {checked ? <YStack backgroundColor="$brand" borderRadius={100} height={14} width={14} /> : null}
    </YStack>
  );
}

function Footer({ onClear, onClose }: { onClear: () => void; onClose: () => void }) {
  return (
    <XStack backgroundColor="$background" borderTopColor="$borderColor" borderTopWidth={1} gap={14} padding={16}>
      <Pressable accessibilityRole="button" onPress={onClear} style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.7 : 1 })}>
        <XStack alignItems="center" borderColor="$borderColor" borderRadius={6} borderWidth={1} height={56} justifyContent="center">
          <Paragraph color="$color" fontSize={16} fontWeight="500">
            Temizle
          </Paragraph>
        </XStack>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onClose} style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.75 : 1 })}>
        <XStack alignItems="center" backgroundColor="$brand" borderRadius={6} height={56} justifyContent="center">
          <Paragraph color="white" fontSize={16} fontWeight="600">
            Kapat
          </Paragraph>
        </XStack>
      </Pressable>
    </XStack>
  );
}

export function QuickFilterDropdown({
  activeFilters,
  availableFilters,
  onChange,
  onClose,
  section,
}: QuickFilterDropdownProps) {
  const [search, setSearch] = useState('');
  const colorIds = useMemo(() => parseIdList(activeFilters.colors), [activeFilters.colors]);
  const variantIds = useMemo(() => parseIdList(activeFilters.variants), [activeFilters.variants]);
  const categoryIds = useMemo(() => parseIdList(activeFilters.product_categories), [activeFilters.product_categories]);
  const propertyIds = useMemo(() => parseIdList(activeFilters.property_ids), [activeFilters.property_ids]);

  useEffect(() => {
    setSearch('');
  }, [section]);

  if (!section) return null;

  const handleClear = () => {
    if (section === 'colors') onChange({ colors: undefined });
    if (section === 'variants') onChange({ variants: undefined });
    if (section === 'categories') onChange({ product_categories: undefined });
    if (section.startsWith('property:')) {
      const groupKey = getPropertySectionKey(section);
      const groupIds = (availableFilters?.properties ?? [])
        .filter((property) => getPropertyGroupKey(property) === groupKey)
        .map((property) => property.id);
      onChange({ property_ids: stringifyIdList(propertyIds.filter((id) => !groupIds.includes(id))) });
    }
    if (section === 'price') onChange({ price_range: undefined, min_price: undefined, max_price: undefined });
    setSearch('');
    onClose();
  };

  return (
    <YStack
      backgroundColor="$background"
      borderColor="$borderColor"
      borderWidth={1}
      boxShadow="0 4px 14px rgba(0,0,0,0.16)"
      left={16}
      position="absolute"
      right={12}
      top={94}
      zIndex={50}
    >
      {section === 'price' ? (
        <PriceContent activeValue={activeFilters.price_range} availableFilters={availableFilters} onChange={onChange} search={search} setSearch={setSearch} />
      ) : null}
      {section === 'variants' ? (
        <VariantContent activeIds={variantIds} availableFilters={availableFilters} onChange={onChange} search={search} setSearch={setSearch} />
      ) : null}
      {section === 'colors' ? (
        <ColorContent activeIds={colorIds} availableFilters={availableFilters} onChange={onChange} search={search} setSearch={setSearch} />
      ) : null}
      {section === 'categories' ? (
        <CategoryContent
          activeIds={categoryIds}
          availableFilters={availableFilters}
          onChange={onChange}
          search={search}
          setSearch={setSearch}
        />
      ) : null}
      {section.startsWith('property:') ? (
        <PropertyContent
          activeIds={propertyIds}
          availableFilters={availableFilters}
          groupKey={getPropertySectionKey(section)}
          onChange={onChange}
          search={search}
          setSearch={setSearch}
        />
      ) : null}
      <Footer onClear={handleClear} onClose={onClose} />
    </YStack>
  );
}

function PriceContent({
  activeValue,
  availableFilters,
  onChange,
  search,
  setSearch,
}: {
  activeValue?: string;
  availableFilters: ProductAvailableFilters | undefined;
  onChange: (filters: ActiveFilters) => void;
  search: string;
  setSearch: (value: string) => void;
}) {
  const options = (availableFilters?.priceRanges ?? [])
    .map((range, index) => ({
      ...range,
      value: String(index + 1),
    }))
    .filter((option) => option.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <YStack borderBottomColor="$borderColor" borderBottomWidth={1} padding={16}>
        <SearchField onChangeText={setSearch} placeholder="Fiyat Ara" value={search} />
      </YStack>
      <YStack paddingHorizontal={16}>
        {options.map((option) => {
          const checked = activeValue === option.value;
          return (
            <Pressable
              accessibilityLabel={`${option.label} fiyat filtresi`}
              accessibilityRole="radio"
              key={option.value}
              onPress={() =>
                onChange({
                  max_price: checked || option.max === null ? undefined : String(option.max),
                  min_price: checked ? undefined : String(option.min),
                  price_range: checked ? undefined : option.value,
                })
              }
            >
              <XStack alignItems="center" borderBottomColor="$borderColor" borderBottomWidth={1} gap={12} height={56}>
                <Radio checked={checked} />
                <Paragraph color="$color" fontSize={15}>
                  {option.label}
                </Paragraph>
              </XStack>
            </Pressable>
          );
        })}
      </YStack>
    </>
  );
}

function VariantContent({
  activeIds,
  availableFilters,
  onChange,
  search,
  setSearch,
}: {
  activeIds: number[];
  availableFilters: ProductAvailableFilters | undefined;
  onChange: (filters: ActiveFilters) => void;
  search: string;
  setSearch: (value: string) => void;
}) {
  const variants = (availableFilters?.variants ?? []).filter((variant) =>
    variant.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <YStack borderBottomColor="$borderColor" borderBottomWidth={1} padding={16}>
        <SearchField onChangeText={setSearch} placeholder="Beden Ara" value={search} />
      </YStack>
      <ScrollView maxHeight={376} showsVerticalScrollIndicator>
        <XStack flexWrap="wrap" paddingHorizontal={28} paddingVertical={18} rowGap={26}>
          {variants.map((variant) => {
            const checked = activeIds.includes(variant.id);
            return (
              <Pressable
                accessibilityLabel={`${variant.name} beden filtresi`}
                accessibilityRole="checkbox"
                key={variant.id}
                onPress={() => onChange({ variants: stringifyIdList(toggleId(activeIds, variant.id)) })}
                style={{ width: '50%' }}
              >
                <XStack alignItems="center" gap={14} height={44}>
                  <FilterCheckbox checked={checked} />
                  <Paragraph color="$color10" fontSize={15} fontWeight="500">
                    {variant.name}
                  </Paragraph>
                </XStack>
              </Pressable>
            );
          })}
        </XStack>
      </ScrollView>
    </>
  );
}

function ColorContent({
  activeIds,
  availableFilters,
  onChange,
  search,
  setSearch,
}: {
  activeIds: number[];
  availableFilters: ProductAvailableFilters | undefined;
  onChange: (filters: ActiveFilters) => void;
  search: string;
  setSearch: (value: string) => void;
}) {
  const colors = (availableFilters?.colors ?? []).filter((color) =>
    color.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <YStack borderBottomColor="$borderColor" borderBottomWidth={1} padding={16}>
        <SearchField onChangeText={setSearch} placeholder="Renk Ara" value={search} />
      </YStack>
      <ScrollView maxHeight={376} showsVerticalScrollIndicator>
        <XStack flexWrap="wrap" paddingHorizontal={28} paddingVertical={18} rowGap={22}>
          {colors.map((color) => {
            const checked = activeIds.includes(color.id);
            return (
              <Pressable
                accessibilityLabel={`${color.name} renk filtresi`}
                accessibilityRole="checkbox"
                key={color.id}
                onPress={() => onChange({ colors: stringifyIdList(toggleId(activeIds, color.id)) })}
                style={{ width: '50%' }}
              >
                <XStack alignItems="center" gap={12} height={50}>
                  <FilterCheckbox checked={checked} />
                  <YStack
                    backgroundColor={(color.hex || '#f3f4f6') as any}
                    borderColor="$borderColor"
                    borderRadius={100}
                    borderWidth={1}
                    height={30}
                    width={30}
                  />
                  <Paragraph color="$color10" flex={1} fontSize={15} fontWeight="500" numberOfLines={1}>
                    {color.name}
                  </Paragraph>
                </XStack>
              </Pressable>
            );
          })}
        </XStack>
      </ScrollView>
    </>
  );
}

function CategoryContent({
  activeIds,
  availableFilters,
  onChange,
  search,
}: {
  activeIds: number[];
  availableFilters: ProductAvailableFilters | undefined;
  onChange: (filters: ActiveFilters) => void;
  search: string;
  setSearch: (value: string) => void;
}) {
  const filterCategories = availableFilters?.productCategories ?? [];
  const childCategories = availableFilters?.categoryChildren ?? [];
  const source = filterCategories.length > 0 ? filterCategories : childCategories;
  const categories = source.filter((category) => category.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <YStack padding={16} paddingBottom={8}>
        <Paragraph color="$brand" fontSize={15}>
          Tüm kategoriler
        </Paragraph>
      </YStack>
      <ScrollView maxHeight={376} showsVerticalScrollIndicator>
        <YStack paddingBottom={12} paddingHorizontal={28}>
          <CategoryFilterTree
            activeIds={activeIds}
            categories={categories}
            onToggle={(id) => onChange({ product_categories: stringifyIdList(toggleId(activeIds, id)) })}
          />
        </YStack>
      </ScrollView>
    </>
  );
}

function PropertyContent({
  activeIds,
  availableFilters,
  groupKey,
  onChange,
  search,
  setSearch,
}: {
  activeIds: number[];
  availableFilters: ProductAvailableFilters | undefined;
  groupKey: string | null;
  onChange: (filters: ActiveFilters) => void;
  search: string;
  setSearch: (value: string) => void;
}) {
  const properties = (availableFilters?.properties ?? []).filter((property) => {
    const matchesGroup = groupKey ? getPropertyGroupKey(property) === groupKey : true;
    return matchesGroup && property.name.toLowerCase().includes(search.toLowerCase());
  });
  const groupName = properties[0]?.parentName || 'Özellik';

  return (
    <>
      <YStack borderBottomColor="$borderColor" borderBottomWidth={1} padding={16}>
        <SearchField onChangeText={setSearch} placeholder={`${groupName} Ara`} value={search} />
      </YStack>
      <ScrollView maxHeight={376} showsVerticalScrollIndicator>
        <XStack flexWrap="wrap" paddingHorizontal={28} paddingVertical={18} rowGap={20}>
          {properties.map((property) => {
            const checked = activeIds.includes(property.id);
            return (
              <Pressable
                accessibilityLabel={`${property.name} özellik filtresi`}
                accessibilityRole="checkbox"
                key={property.id}
                onPress={() => onChange({ property_ids: stringifyIdList(toggleId(activeIds, property.id)) })}
                style={{ width: '50%' }}
              >
                <XStack alignItems="center" gap={12} minHeight={44}>
                  <FilterCheckbox checked={checked} />
                  <Paragraph color="$color10" flex={1} fontSize={14} fontWeight="500" numberOfLines={2}>
                    {property.name}
                  </Paragraph>
                </XStack>
              </Pressable>
            );
          })}
        </XStack>
      </ScrollView>
    </>
  );
}
