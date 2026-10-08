import { Redirect, useLocalSearchParams } from 'expo-router';
import { NOT_FOUND_ROUTE } from '@/features/not-found/routes';
import { ProductListScreen } from '@/features/product/screens/product-list-screen';
import {
  buildProductListingKey,
  parseProductListingTarget,
  parseSupplierCode,
} from '@/features/product/utils/listing-deep-link-params';

/**
 * Tedarikçi ürün listesi: web `haydigiy.com/s/{tedarikçiKodu}` ile aynı yol.
 * Kod API'ye `s` olarak gider; sıralama/filtre sorgu parametreleri kategori
 * listesindeki gibi taşınır. Kod rakam değilse web gibi 404 açılır.
 */
export default function SupplierListingRoute() {
  const params = useLocalSearchParams();
  const supplierCode = parseSupplierCode(params.supplierCode);

  if (!supplierCode) {
    return <Redirect href={NOT_FOUND_ROUTE} />;
  }

  const target = { ...parseProductListingTarget(params), supplierCode };
  const slug = `s/${supplierCode}`;

  return (
    <ProductListScreen
      key={buildProductListingKey(slug, target)}
      initialFilters={target.filters}
      slug={slug}
      supplierCode={supplierCode}
    />
  );
}
