import { useQuery } from '@tanstack/react-query';
import { resolveSeoRedirectDto } from '@/services/seo-redirect.service';
import type { WebLocation } from '@/types/seo-redirect.types';
import { seoRedirectKeys } from './seo-redirect.keys';
import { mapSeoRedirectDto } from './seo-redirect.mapper';

/**
 * Bulunamayan bir web yolu için SEO yönlendirme kuralı. Web middleware'i kuralları
 * 5 dk önbellekler; burada da aynı süre geçerlidir. Hata tekrar denenmez: servis
 * cevap vermezse kullanıcı beklemeden 404 ekranını görmeli.
 */
export function useSeoRedirectQuery(location: WebLocation, { enabled }: { enabled: boolean }) {
  return useQuery({
    enabled,
    queryFn: async () => mapSeoRedirectDto(await resolveSeoRedirectDto(location)),
    queryKey: seoRedirectKeys.resolve(location.path, location.queryString),
    retry: false,
    staleTime: 5 * 60_000,
  });
}
