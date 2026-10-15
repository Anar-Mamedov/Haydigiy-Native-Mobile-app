import { RefObject, useCallback, useMemo } from 'react';
import { RefreshControl, useWindowDimensions } from 'react-native';
import { FlashList, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { XStack, YStack } from 'tamagui';
import { InsiderRecommendationSections } from '@/features/insider/components/insider-recommendation-sections';
import { useLastViewedInsiderProduct } from '@/features/insider/hooks/use-last-viewed-insider-product';
import { BRAND_COLOR } from '@/lib/theme/colors';
import { tokenValues } from '@/lib/theme/token-values';
import {
  HOME_FIRST_ROW_OFFSET,
  HOME_PAGE_PADDING_HORIZONTAL,
  HOME_SECTION_GAP,
} from '../utils/home-layout';
import { buildHomeListItems, getHomeListItemType, HomeListItem } from '../utils/home-list-items';
import {
  getHomeSectionSpan,
  getHomeSectionWidth,
  HomeRow,
  isFullWidthHomeRow,
} from '../utils/home-rows';
import { HomeFooter } from './home-footer';
import { HomeSection } from './home-section';
import { MobileHomeSearch } from './mobile-home-search';

/** Arama çubuğunun sayfa kenarına ek iç boşluğu (web mobil ile aynı). */
const SEARCH_PADDING_HORIZONTAL = 8;
const LIST_PADDING_TOP = 8;

type HomeSectionListProps = {
  rows: HomeRow[];
  listRef: RefObject<FlashListRef<HomeListItem> | null>;
  refreshing: boolean;
  onRefresh: () => void;
};

function HomeListHeader() {
  return (
    <YStack paddingHorizontal={SEARCH_PADDING_HORIZONTAL} width="100%">
      <MobileHomeSearch />
    </YStack>
  );
}

/** "Son Görüntülediklerin" kampanyası için son gezilen ürünü yalnızca bu hücre görünürken okur. */
function HomeRecommendations() {
  const lastViewedProduct = useLastViewedInsiderProduct();
  return <InsiderRecommendationSections product={lastViewedProduct} slot="home" />;
}

type HomeRowCellProps = {
  row: HomeRow;
  containerWidth: number;
  isFirstRow: boolean;
};

function HomeRowCell({ row, containerWidth, isFirstRow }: HomeRowCellProps) {
  const paddingTop = isFirstRow ? HOME_FIRST_ROW_OFFSET : HOME_SECTION_GAP;

  if (isFullWidthHomeRow(row)) {
    return (
      <YStack paddingTop={paddingTop} width="100%">
        <HomeSection section={row.sections[0]} width={containerWidth} />
      </YStack>
    );
  }

  return (
    <XStack gap={HOME_SECTION_GAP} paddingTop={paddingTop} width="100%">
      {row.sections.map((section) => (
        <HomeSection
          key={section.id}
          section={section}
          width={getHomeSectionWidth(getHomeSectionSpan(section), containerWidth)}
        />
      ))}
    </XStack>
  );
}

/**
 * Ana sayfa akışı: arama, sayfa tasarımı satırları, öneriler ve alt bilgi tek bir sanallaştırılmış
 * listede. Eskiden tüm bölümler tek `ScrollView` içinde aynı anda mount ediliyordu; 60'a yakın
 * banner ve vitrin görseli ilk açılışta (ve MainActivity her yeniden oluşturulduğunda) birlikte
 * indirilip decode ediliyordu. Artık yalnızca ekrandaki ve ekrana yakın satırlar mount edilir.
 */
export function HomeSectionList({ rows, listRef, refreshing, onRefresh }: HomeSectionListProps) {
  const { width: windowWidth } = useWindowDimensions();
  const containerWidth = windowWidth - HOME_PAGE_PADDING_HORIZONTAL * 2;
  const items = useMemo(() => buildHomeListItems(rows), [rows]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<HomeListItem>) => {
      switch (item.kind) {
        case 'row':
          return <HomeRowCell containerWidth={containerWidth} isFirstRow={index === 0} row={item.row} />;
        case 'recommendations':
          return <HomeRecommendations />;
        case 'footer':
          return <HomeFooter />;
        default:
          return null;
      }
    },
    [containerWidth],
  );

  return (
    <FlashList
      ListHeaderComponent={HomeListHeader}
      // Üste sabit akış: ürün ızgarasındaki gibi FlashList v2'nin içerik konumu koruması ve iOS
      // otomatik içerik boşlukları kapalı; aksi halde iOS'ta listenin üstünde ara ara boşluk oluşur.
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{
        paddingBottom: tokenValues.sectionListPaddingBottom,
        paddingHorizontal: HOME_PAGE_PADDING_HORIZONTAL,
        paddingTop: LIST_PADDING_TOP,
      }}
      data={items}
      getItemType={getHomeListItemType}
      keyExtractor={(item) => item.key}
      maintainVisibleContentPosition={{ disabled: true }}
      ref={listRef}
      refreshControl={
        <RefreshControl colors={[BRAND_COLOR]} onRefresh={onRefresh} refreshing={refreshing} tintColor={BRAND_COLOR} />
      }
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      testID="home-section-list"
    />
  );
}
