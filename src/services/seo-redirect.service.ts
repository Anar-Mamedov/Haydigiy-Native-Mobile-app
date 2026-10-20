import type { SeoRedirectResolveDto } from '@/features/seo-redirect/api/seo-redirect.dtos';
import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';
import type { WebLocation } from '@/types/seo-redirect.types';

export const seoRedirectEndpoints = {
  resolve: '/seo/redirect-rules/resolve',
};

/**
 * Servis zaman zaman yavaş cevap veriyor; kullanıcı 404 yerine boş bir yükleme
 * ekranında 15 sn (genel istemci zaman aşımı) beklememeli.
 */
const RESOLVE_TIMEOUT_MS = 5000;

/**
 * Web yolu için panelde tanımlı yönlendirme kuralını sorar. Web middleware'i ile
 * aynı parametreler: `path` ve `query_string` (`c=216`); axios değerleri kodlar.
 */
export async function resolveSeoRedirectDto(location: WebLocation): Promise<SeoRedirectResolveDto> {
  // Mock katalogla çalışırken yönlendirme kuralı yoktur.
  if (!appEnv.apiBaseUrl) {
    return { matched: false };
  }

  const response = await apiClient.get<SeoRedirectResolveDto>(seoRedirectEndpoints.resolve, {
    params: { path: location.path, query_string: location.queryString },
    timeout: RESOLVE_TIMEOUT_MS,
  });
  return response.data ?? { matched: false };
}
