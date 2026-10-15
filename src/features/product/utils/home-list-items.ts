import { HomeRow } from './home-rows';

/**
 * Ana sayfa listesinin bir hücresi. Sayfa tasarımı satırlarından sonra gelen öneriler ve alt bilgi
 * de listenin öğesidir: böylece onlar da sanallaştırılır, kullanıcı aşağı inmeden mount olup
 * Insider sorgusu atmaz, ödeme logolarını yüklemez.
 */
export type HomeListItem =
  | { kind: 'row'; key: string; row: HomeRow }
  | { kind: 'recommendations'; key: 'recommendations' }
  | { kind: 'footer'; key: 'footer' };

export function buildHomeListItems(rows: HomeRow[]): HomeListItem[] {
  return [
    ...rows.map((row): HomeListItem => ({ key: `row-${row.key}`, kind: 'row', row })),
    { key: 'recommendations', kind: 'recommendations' },
    { key: 'footer', kind: 'footer' },
  ];
}

/**
 * FlashList hücreleri yalnızca aynı türdeki hücreler arasında yeniden kullanır. Tam genişlikteki
 * satırlar bölüm türüne göre, yan yana bannerlar ayrı bir türde gruplanır; banner hücresi vitrin
 * hücresine dönüştürülmez.
 */
export function getHomeListItemType(item: HomeListItem): string {
  if (item.kind !== 'row') return item.kind;
  return item.row.sections.length === 1 ? `section:${item.row.sections[0].type}` : 'section-row';
}
