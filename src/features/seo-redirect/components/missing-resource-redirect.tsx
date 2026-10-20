import { type Href, Redirect, useLocalSearchParams } from 'expo-router';
import { Spinner, YStack } from 'tamagui';
import { AppScreen } from '@/components/ui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { NOT_FOUND_ROUTE } from '@/features/not-found/routes';
import { useSeoRedirectQuery } from '../api/seo-redirect.queries';
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
 * API'nin 404/410 döndüğü ürün, kategori ya da sayfa için yönetim panelinde
 * tanımlı SEO yönlendirmesini sorar; web middleware'indeki 301'in uygulama
 * karşılığıdır. Kural eşleşirse yeni sayfa `replace` ile açılır, geri tuşu ölü
 * sayfaya dönmez. Eşleşme yoksa, servis hata verirse ya da zaman aşımına
 * uğrarsa 404 ekranı açılır.
 */
export function MissingResourceRedirect({ webPath, queryString = '' }: MissingResourceRedirectProps) {
  const params = useLocalSearchParams();
  const hop = readSeoRedirectHop(params[SEO_REDIRECT_HOP_PARAM]);
  const location = { path: webPath, queryString };
  const canFollow = webPath.length > 0 && hop < MAX_SEO_REDIRECT_HOPS;
  const { data, isPending } = useSeoRedirectQuery(location, { enabled: canFollow });

  if (canFollow && isPending) {
    return (
      <AppScreen scrollable={false} padding={0} gap={0}>
        <YStack alignItems="center" flex={1} gap="$3" justifyContent="center">
          <Spinner color="$brand" size="large" />
          <Paragraph color="$color10">Sayfa yükleniyor...</Paragraph>
        </YStack>
      </AppScreen>
    );
  }

  const route = canFollow && data?.matched ? resolveSeoRedirectRoute(data.targetUrl, location) : null;
  const href = route ? withSeoRedirectHop(route, hop + 1) : NOT_FOUND_ROUTE;

  return <Redirect href={href as Href} />;
}
