import { ReactElement, useCallback, useMemo } from 'react';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { YStack } from 'tamagui';

type HorizontalRailProps<TItem> = {
  data: readonly TItem[];
  keyExtractor: (item: TItem, index: number) => string;
  renderItem: (item: TItem, index: number) => ReactElement | null;
  /** Kartlar arasındaki boşluk (px). */
  gap: number;
  /** Rafın iki yanındaki iç boşluk (px). */
  paddingHorizontal: number;
  paddingTop?: number;
  paddingBottom?: number;
  testID?: string;
};

/**
 * Yatay kaydırılan kart rafı (ürün vitrini, öneriler, hikâyeler).
 *
 * FlashList ile pencerelidir: yalnızca ekrandaki ve ekrana yakın kartlar mount edilir, kaydırıldıkça
 * hücreler yeniden kullanılır. Düz `ScrollView` ise bütün kartları (ve görsellerini) ilk açılışta
 * birden çizip decode ederdi. Kartlar hücre yeniden kullanıldığında yeni öğenin verisini almalı;
 * öğeye bağlı yerel durum tutan kart bunu öğe kimliğine göre sıfırlamalıdır.
 */
export function HorizontalRail<TItem>({
  data,
  keyExtractor,
  renderItem,
  gap,
  paddingHorizontal,
  paddingTop = 0,
  paddingBottom = 0,
  testID,
}: HorizontalRailProps<TItem>) {
  const RailGap = useMemo(() => {
    function HorizontalRailGap() {
      return <YStack width={gap} />;
    }
    return HorizontalRailGap;
  }, [gap]);

  const renderRailItem = useCallback(
    ({ item, index }: ListRenderItemInfo<TItem>) => renderItem(item, index),
    [renderItem],
  );

  return (
    <FlashList
      ItemSeparatorComponent={RailGap}
      contentContainerStyle={{ paddingBottom, paddingHorizontal, paddingTop }}
      data={data}
      horizontal
      keyExtractor={keyExtractor}
      renderItem={renderRailItem}
      showsHorizontalScrollIndicator={false}
      testID={testID}
    />
  );
}
