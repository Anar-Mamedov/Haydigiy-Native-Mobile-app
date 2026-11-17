import { type Href, Redirect, useLocalSearchParams } from 'expo-router';
import { Spinner, YStack } from 'tamagui';
import { AppScreen } from '@/components/ui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { useCategorySlugIndexQuery } from '@/features/category/api/category.queries';
import { NOT_FOUND_ROUTE } from '@/features/not-found/routes';
import { useSeoRedirectQuery } from '../api/seo-redirect.queries';
import { findCategoryCanonicalRoute, isCategoryCandidatePath } from '../utils/category-canonical-route';
import {
  MAX_SEO_REDIRECT_HOPS,
  SEO_REDIRECT_HOP_PARAM,
  readSeoRedirectHop,
  resolveSeoRedirectRoute,
  withSeoRedirectHop,
} from '../utils/seo-redirect-route';

type MissingResourceRedirectProps = {
  /** Bulunamayan kaynağın web yolu: `/kolye-kupe-bileklik`, `/s/123`, `/urun-slug`. */
  webPath: string;
  /** Web sorgu dizesi, `?` olmadan (`c=216`). */
  queryString?: string;
};

/**
 * API'nin 404/410 döndüğü ürün, kategori ya da sayfa için web middleware'indeki 301'lerin uygulama
 * karşılığı, web ile aynı sırayla:
 * 1. Yönetim panelinde tanımlı SEO yönlendirmesi.
 * 2. Adres bir kategoriye karşılık geliyorsa (`/kadin-elbise`, yanlış slug + doğru `c`) o kategorinin
 *    listesi. Derin bağlantı çözücüsü `?c=` içermeyen tek parçalı adresi ürün sanar.
 * Yeni sayfa `replace` ile açılır, geri tuşu ölü sayfaya dönmez. Eşleşme yoksa, servis hata verirse ya
 * da zaman aşımına uğrarsa 404 ekranı açılır.
 */
export function MissingResourceRedirect({ webPath, queryString = '' }: MissingResourceRedirectProps) {
  const params = useLocalSearchParams();
  const hop = readSeoRedirectHop(params[SEO_REDIRECT_HOP_PARAM]);
  const location = { path: webPath, queryString };
  const canFollow = webPath.length > 0 && hop < MAX_SEO_REDIRECT_HOPS;

  const seoRedirect = useSeoRedirectQuery(location, { enabled: canFollow });
  const seoRoute = canFollow && seoRedirect.data?.matched ? resolveSeoRedirectRoute(seoRedirect.data.targetUrl, location) : null;

  const needsCategoryLookup = canFollow && !seoRedirect.isPending && !seoRoute && isCategoryCandidatePath(webPath);
  const categoryIndex = useCategorySlugIndexQuery({ enabled: needsCategoryLookup });

  if (canFollow && (seoRedirect.isPending || (needsCategoryLookup && categoryIndex.isPending))) {
    return (
      <AppScreen scrollable={false} padding={0} gap={0}>
        <YStack alignItems="center" flex={1} gap="$3" justifyContent="center">
          <Spinner color="$brand" size="large" />
          <Paragraph color="$color10">Sayfa yükleniyor...</Paragraph>
        </YStack>
      </AppScreen>
    );
  }

  const categoryRoute = needsCategoryLookup && categoryIndex.data ? findCategoryCanonicalRoute(location, categoryIndex.data) : null;
  const route = seoRoute ?? categoryRoute;
  const href = route ? withSeoRedirectHop(route, hop + 1) : NOT_FOUND_ROUTE;

  return <Redirect href={href as Href} />;
}
